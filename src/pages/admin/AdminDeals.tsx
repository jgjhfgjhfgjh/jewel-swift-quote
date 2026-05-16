import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle, Trash2,
  Eye, EyeOff, ExternalLink, Plus, X,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  dealsTable, dealProductsTable, slugify, DEFAULT_TIERS,
  type DealTier, type DealCategory, type DealStatus,
} from '@/lib/deals';
import { useDeals } from '@/hooks/useDeals';
import { parseXlsx } from '@/lib/xlsxReader';
import { parseDealWorkbook, type DealParseResult } from '@/lib/dealParser';

const BUCKET = 'deal-images';

const DEFAULT_PAYMENT_TERMS =
  'Platba předem je akceptována pouze bankovním převodem. Po přijetí objednávky vystavíme zálohovou fakturu ve výši 30 %. Platba musí být připsána do 3 pracovních dnů od potvrzení objednávky, jinak je objednávka zrušena. Po naskladnění zboží vystavíme finální fakturu se započtenou 30% zálohou. Po doplacení bude zboží expedováno.';

interface FormState {
  title: string;
  subtitle: string;
  supplier: string;
  category: DealCategory;
  deadline: string; // datetime-local
  deposit: number;
  weeksMin: number;
  weeksMax: number;
  paymentTerms: string;
  status: DealStatus;
  tiers: DealTier[];
}

const emptyForm = (): FormState => ({
  title: '',
  subtitle: '',
  supplier: 'Fossil Group',
  category: 'general',
  deadline: '2026-05-20T17:00',
  deposit: 30,
  weeksMin: 4,
  weeksMax: 6,
  paymentTerms: DEFAULT_PAYMENT_TERMS,
  status: 'active',
  tiers: DEFAULT_TIERS.map((t) => ({ ...t })),
});

/** Run async workers over a list with a fixed concurrency limit. */
async function runPool<T>(
  items: T[],
  worker: (item: T, index: number) => Promise<void>,
  concurrency: number,
  onTick: () => void,
) {
  let idx = 0;
  const next = async (): Promise<void> => {
    while (idx < items.length) {
      const i = idx++;
      try { await worker(items[i], i); } catch { /* ignore — handled by worker */ }
      onTick();
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length || 1) }, next));
}

export default function AdminDeals() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading, user } = useAuthContext();
  const { deals, productCounts, loading: dealsLoading, reload } = useDeals();
  const fileInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [parsed, setParsed] = useState<DealParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'parsing' | 'ready' | 'publishing'>('idle');
  const [progress, setProgress] = useState<{ stage: string; current: number; total: number }>({
    stage: '', current: 0, total: 0,
  });

  if (authLoading) return null;
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-md px-6 py-40 text-center text-slate-500">
          Tato stránka je dostupná pouze administrátorům.
          <div className="mt-6"><Button onClick={() => navigate('/')}>Zpět</Button></div>
        </div>
      </div>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ── parse uploaded workbook ─────────────────────────────
  const handleFile = async (file: File) => {
    setPhase('parsing');
    setParseError(null);
    setParsed(null);
    try {
      const xlsx = await parseXlsx(file);
      const result = parseDealWorkbook(xlsx);
      setParsed(result);
      setForm((f) => ({
        ...f,
        category: result.category,
        title: f.title || file.name.replace(/\.xlsx$/i, '').trim(),
      }));
      setPhase('ready');
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Soubor se nepodařilo zpracovat.');
      setPhase('idle');
    }
  };

  // ── publish ─────────────────────────────────────────────
  const handlePublish = async () => {
    if (!parsed || !form.title.trim()) {
      toast.error('Vyplňte název nabídky a nahrajte tabulku.');
      return;
    }
    setPhase('publishing');
    try {
      // 1) create the deal row (retry slug on collision)
      let slug = slugify(form.title);
      const dealPayload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        supplier: form.supplier.trim(),
        category: form.category,
        description: '',
        brands: parsed.brands,
        currency: 'USD',
        tiers: form.tiers,
        deposit_percent: form.deposit,
        delivery_weeks_min: form.weeksMin,
        delivery_weeks_max: form.weeksMax,
        payment_terms: form.paymentTerms.trim(),
        deadline: new Date(form.deadline).toISOString(),
        status: form.status,
        created_by: user.id,
      };

      let dealId = '';
      for (let attempt = 0; attempt < 4 && !dealId; attempt++) {
        const trySlug = attempt === 0 ? slug : `${slug}-${Date.now().toString(36).slice(-4)}`;
        const { data, error } = await dealsTable()
          .insert({ ...dealPayload, slug: trySlug })
          .select('id, slug')
          .single();
        if (!error && data) { dealId = data.id; slug = data.slug; break; }
        if (error && error.code !== '23505') throw new Error(error.message);
      }
      if (!dealId) throw new Error('Nepodařilo se vytvořit nabídku (slug).');

      // 2) upload product images
      setProgress({ stage: 'Nahrávám obrázky', current: 0, total: parsed.products.length });
      const imageUrls: (string | null)[] = new Array(parsed.products.length).fill(null);
      let done = 0;
      await runPool(parsed.products, async (p, i) => {
        if (p.image) {
          const safeSku = (p.sku || String(i)).replace(/[^A-Za-z0-9_-]/g, '');
          const path = `${dealId}/${i}-${safeSku}.${p.image.ext}`;
          const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, p.image.blob, { contentType: p.image.blob.type, upsert: true });
          if (!error) {
            imageUrls[i] = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
            return;
          }
        }
        imageUrls[i] = p.cdnUrl || null;
      }, 8, () => {
        done++;
        if (done % 5 === 0 || done === parsed.products.length) {
          setProgress({ stage: 'Nahrávám obrázky', current: done, total: parsed.products.length });
        }
      });

      // 3) insert deal_products in chunks
      const rows = parsed.products.map((p, i) => ({
        deal_id: dealId,
        brand: p.brand,
        sku: p.sku,
        ean: p.ean,
        gender: p.gender,
        collection: p.collection,
        item_status: p.item_status,
        attr_movement: p.attr_movement,
        attr_material: p.attr_material,
        attr_size: p.attr_size,
        retail_price: p.retail_price,
        wholesale_tier1: p.wholesale_tier1,
        wholesale_tier2: p.wholesale_tier2,
        wholesale_tier3: p.wholesale_tier3,
        available: p.available,
        image_url: imageUrls[i],
        sort_order: p.sort_order,
      }));
      const CHUNK = 200;
      for (let i = 0; i < rows.length; i += CHUNK) {
        setProgress({ stage: 'Ukládám produkty', current: i, total: rows.length });
        const { error } = await dealProductsTable().insert(rows.slice(i, i + CHUNK));
        if (error) throw new Error('Uložení produktů selhalo: ' + error.message);
      }

      toast.success('Nabídka publikována', {
        description: `${form.title} — ${rows.length} produktů`,
      });
      setForm(emptyForm());
      setParsed(null);
      setPhase('idle');
      setProgress({ stage: '', current: 0, total: 0 });
      if (fileInput.current) fileInput.current.value = '';
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Publikování selhalo.');
      setPhase('ready');
    }
  };

  // ── manage existing deals ───────────────────────────────
  const changeStatus = async (id: string, status: DealStatus) => {
    const { error } = await dealsTable().update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Stav aktualizován'); reload(); }
  };

  const deleteDeal = async (id: string, title: string) => {
    if (!window.confirm(`Smazat nabídku „${title}" včetně všech produktů?`)) return;
    const { data: files } = await supabase.storage.from(BUCKET).list(id);
    if (files?.length) {
      await supabase.storage.from(BUCKET).remove(files.map((f) => `${id}/${f.name}`));
    }
    const { error } = await dealsTable().delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Nabídka smazána'); reload(); }
  };

  const busy = phase === 'publishing' || phase === 'parsing';

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <Navbar />
      <BackButton />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-3xl font-black text-slate-900">Správa DEAL nabídek</h1>
        <p className="mt-1 text-sm text-slate-500">
          Nahrajte Excel tabulku closeout nabídky — vytvoří se katalog včetně obrázků a FOMO prvků.
        </p>

        {/* ── Upload + form ── */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-black text-slate-900">Nová nabídka</h2>

          {/* dropzone */}
          <label
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
              px-6 py-8 text-center transition-colors
              ${parsed ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400'}`}
          >
            <input
              ref={fileInput}
              type="file"
              accept=".xlsx"
              className="hidden"
              disabled={busy}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {phase === 'parsing' ? (
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            ) : parsed ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            ) : (
              <FileSpreadsheet className="h-8 w-8 text-slate-400" />
            )}
            <div className="text-sm font-semibold text-slate-700">
              {phase === 'parsing'
                ? 'Zpracovávám tabulku…'
                : parsed
                  ? `Načteno: ${parsed.products.length} produktů, ${parsed.brands.length} značek`
                  : 'Klikněte a vyberte .xlsx soubor nabídky'}
            </div>
            {!parsed && <div className="text-xs text-slate-400">Excel tabulka closeout nabídky (DEAL Offer …)</div>}
          </label>

          {parseError && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {parseError}
            </div>
          )}

          {/* parse preview */}
          {parsed && (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <PreviewStat label="Produktů" value={parsed.products.length} />
                <PreviewStat label="Značek" value={parsed.brands.length} />
                <PreviewStat label="Obrázků nalezeno" value={parsed.imagesFound} />
                <PreviewStat label="Obrázků spárováno" value={parsed.imagesMatched} />
              </div>
              {parsed.warnings.length > 0 && (
                <div className="mt-3 space-y-1">
                  {parsed.warnings.map((w) => (
                    <div key={w} className="flex items-center gap-2 text-xs text-amber-600">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {w}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {parsed.brands.map((b) => (
                  <span key={b} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{b}</span>
                ))}
              </div>

              {/* sample table */}
              <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      {['', 'Značka', 'SKU', 'RRP', '50 ks', '100 ks', '200 ks', 'Sklad'].map((h) => (
                        <th key={h} className="px-2 py-1.5 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.products.slice(0, 6).map((p, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-2 py-1">
                          {p.image
                            ? <img src={URL.createObjectURL(p.image.blob)} alt="" className="h-8 w-8 object-contain" />
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-2 py-1">{p.brand}</td>
                        <td className="px-2 py-1 font-mono">{p.sku}</td>
                        <td className="px-2 py-1 tabular-nums">{p.retail_price}</td>
                        <td className="px-2 py-1 tabular-nums">{p.wholesale_tier1.toFixed(2)}</td>
                        <td className="px-2 py-1 tabular-nums">{p.wholesale_tier2.toFixed(2)}</td>
                        <td className="px-2 py-1 tabular-nums">{p.wholesale_tier3.toFixed(2)}</td>
                        <td className="px-2 py-1 tabular-nums">{p.available}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* metadata form */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Název nabídky *">
                  <input className={inputCls} value={form.title}
                    onChange={(e) => set('title', e.target.value)} />
                </Field>
                <Field label="Dodavatel">
                  <input className={inputCls} value={form.supplier}
                    onChange={(e) => set('supplier', e.target.value)} />
                </Field>
                <Field label="Podtitulek" full>
                  <input className={inputCls} value={form.subtitle}
                    onChange={(e) => set('subtitle', e.target.value)} />
                </Field>
                <Field label="Kategorie">
                  <select className={inputCls} value={form.category}
                    onChange={(e) => set('category', e.target.value as DealCategory)}>
                    <option value="watches">Hodinky</option>
                    <option value="jewelry">Šperky</option>
                    <option value="general">Obecná</option>
                  </select>
                </Field>
                <Field label="Uzávěrka objednávek">
                  <input type="datetime-local" className={inputCls} value={form.deadline}
                    onChange={(e) => set('deadline', e.target.value)} />
                </Field>
                <Field label="Záloha (%)">
                  <input type="number" className={inputCls} value={form.deposit}
                    onChange={(e) => set('deposit', Number(e.target.value))} />
                </Field>
                <Field label="Dodání (týdny)">
                  <div className="flex items-center gap-2">
                    <input type="number" className={inputCls} value={form.weeksMin}
                      onChange={(e) => set('weeksMin', Number(e.target.value))} />
                    <span className="text-slate-400">–</span>
                    <input type="number" className={inputCls} value={form.weeksMax}
                      onChange={(e) => set('weeksMax', Number(e.target.value))} />
                  </div>
                </Field>
                <Field label="Platební podmínky" full>
                  <textarea className={`${inputCls} h-24 resize-y`} value={form.paymentTerms}
                    onChange={(e) => set('paymentTerms', e.target.value)} />
                </Field>

                {/* tiers */}
                <Field label="Slevové hladiny (množství → sleva %)" full>
                  <div className="space-y-2">
                    {form.tiers.map((tier, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="number" className={`${inputCls} w-24`} value={tier.min_qty}
                          onChange={(e) => set('tiers', form.tiers.map((x, j) =>
                            j === i ? { ...x, min_qty: Number(e.target.value) } : x))} />
                        <span className="text-slate-400">ks →</span>
                        <input type="number" className={`${inputCls} w-24`} value={tier.discount_percent}
                          onChange={(e) => set('tiers', form.tiers.map((x, j) =>
                            j === i ? { ...x, discount_percent: Number(e.target.value) } : x))} />
                        <span className="text-slate-400">%</span>
                        {form.tiers.length > 1 && (
                          <button onClick={() => set('tiers', form.tiers.filter((_, j) => j !== i))}
                            className="text-slate-400 hover:text-red-500">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => set('tiers', [...form.tiers, { min_qty: 0, discount_percent: 0 }])}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
                    >
                      <Plus className="h-3.5 w-3.5" /> Přidat hladinu
                    </button>
                  </div>
                </Field>
                <Field label="Stav po publikaci">
                  <select className={inputCls} value={form.status}
                    onChange={(e) => set('status', e.target.value as DealStatus)}>
                    <option value="active">Aktivní (viditelná)</option>
                    <option value="draft">Koncept (skrytá)</option>
                  </select>
                </Field>
              </div>

              {/* publish */}
              {phase === 'publishing' && (
                <div className="mt-5">
                  <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
                    <span>{progress.stage}…</span>
                    <span className="tabular-nums">{progress.current} / {progress.total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
                      style={{ width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%` }} />
                  </div>
                </div>
              )}

              <div className="mt-5 flex gap-3">
                <Button onClick={handlePublish} disabled={busy} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  {phase === 'publishing'
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Publikuji…</>
                    : <><Upload className="h-4 w-4" /> Publikovat nabídku</>}
                </Button>
                <Button variant="outline" disabled={busy}
                  onClick={() => { setParsed(null); setForm(emptyForm()); setPhase('idle'); if (fileInput.current) fileInput.current.value = ''; }}>
                  Zrušit
                </Button>
              </div>
            </>
          )}
        </section>

        {/* ── Existing deals ── */}
        <section className="mt-8">
          <h2 className="mb-4 font-display text-lg font-black text-slate-900">Existující nabídky</h2>
          {dealsLoading ? (
            <div className="py-10 text-center text-slate-400">
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            </div>
          ) : deals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">
              Zatím žádné nabídky.
            </div>
          ) : (
            <div className="space-y-2">
              {deals.map((deal) => (
                <div key={deal.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-slate-900">{deal.title}</span>
                      <StatusBadge status={deal.status} />
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {productCounts[deal.id] ?? 0} produktů · {deal.brands.length} značek ·
                      uzávěrka {new Date(deal.deadline).toLocaleDateString('cs-CZ')}
                    </div>
                  </div>
                  <select
                    value={deal.status}
                    onChange={(e) => changeStatus(deal.id, e.target.value as DealStatus)}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                  >
                    <option value="draft">Koncept</option>
                    <option value="active">Aktivní</option>
                    <option value="ended">Ukončená</option>
                  </select>
                  <button onClick={() => navigate(`/deals/${deal.slug}`)}
                    title="Zobrazit" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteDeal(deal.id, deal.title)}
                    title="Smazat" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400';

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <div className="font-display text-lg font-black tabular-nums text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-400">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: DealStatus }) {
  const map = {
    active: { label: 'Aktivní', cls: 'bg-emerald-100 text-emerald-700', icon: Eye },
    draft: { label: 'Koncept', cls: 'bg-slate-100 text-slate-500', icon: EyeOff },
    ended: { label: 'Ukončená', cls: 'bg-amber-100 text-amber-700', icon: EyeOff },
  }[status];
  const Icon = map.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${map.cls}`}>
      <Icon className="h-3 w-3" /> {map.label}
    </span>
  );
}
