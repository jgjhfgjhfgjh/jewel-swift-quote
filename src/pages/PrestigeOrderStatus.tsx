import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Loader2, Check, Package, Receipt, Banknote, Truck, Home, Star, ShieldCheck, Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderItem { brand: string; model: string; price: number }

interface OrderView {
  order_number: string | null;
  invoice_number: string | null;
  status: string;
  currency: string;
  amount: number;
  vat_rate: number;
  items: OrderItem[] | null;
  created_at: string;
  invoice_issued_at: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  satisfaction_rating: number | null;
  bill_name: string | null;
  bill_company: string | null;
  bill_ico: string | null;
  bill_dic: string | null;
  bill_street: string | null;
  bill_city: string | null;
  bill_zip: string | null;
  bill_country: string | null;
  customer_name: string | null;
}

function czDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
}

export default function PrestigeOrderStatus() {
  const { token } = useParams<{ token: string }>();
  const [params] = useSearchParams();
  const [order, setOrder] = useState<OrderView | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [bill, setBill] = useState({ name: '', company: '', ico: '', dic: '', street: '', city: '', zip: '', country: 'CZ' });
  const [editingBill, setEditingBill] = useState(false);
  const [savingBill, setSavingBill] = useState(false);

  const [rating, setRating] = useState(0);
  const [ratingNote, setRatingNote] = useState('');
  const [sendingRating, setSendingRating] = useState(false);
  const [ratingDone, setRatingDone] = useState(false);

  const load = useCallback(async () => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    const { data, error } = await supabase.rpc('get_prestige_order_by_token', { p_token: token });
    if (error || !data) { setNotFound(true); setLoading(false); return; }
    const o = data as unknown as OrderView;
    setOrder(o);
    setBill({
      name: o.bill_name ?? '', company: o.bill_company ?? '', ico: o.bill_ico ?? '', dic: o.bill_dic ?? '',
      street: o.bill_street ?? '', city: o.bill_city ?? '', zip: o.bill_zip ?? '', country: o.bill_country ?? 'CZ',
    });
    if (o.satisfaction_rating) { setRating(o.satisfaction_rating); setRatingDone(true); }
    setLoading(false);
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  // Pre-select (and auto-submit) a rating arriving from the survey e-mail link.
  useEffect(() => {
    const fromUrl = Number(params.get('hodnoceni'));
    if (!order || ratingDone || !order.delivered_at) return;
    if (fromUrl >= 1 && fromUrl <= 5) {
      setRating(fromUrl);
      void submitRating(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  async function submitRating(value: number) {
    if (!token) return;
    setSendingRating(true);
    const { data, error } = await supabase.rpc('submit_prestige_rating', {
      p_token: token, p_rating: value, p_note: ratingNote || undefined,
    });
    setSendingRating(false);
    if (error || data !== true) { toast.error('Hodnocení se nepodařilo uložit'); return; }
    setRatingDone(true);
    toast.success('Děkujeme za Vaše hodnocení!');
  }

  async function saveBilling() {
    if (!token) return;
    setSavingBill(true);
    const { data, error } = await supabase.rpc('update_prestige_billing', {
      p_token: token,
      p_name: bill.name || undefined, p_company: bill.company || undefined,
      p_ico: bill.ico || undefined, p_dic: bill.dic || undefined,
      p_street: bill.street || undefined, p_city: bill.city || undefined,
      p_zip: bill.zip || undefined, p_country: bill.country || undefined,
    });
    setSavingBill(false);
    if (error || data !== true) { toast.error('Uložení se nepodařilo'); return; }
    setEditingBill(false);
    toast.success('Fakturační údaje uloženy');
    void load();
  }

  const steps = useMemo(() => {
    if (!order) return [];
    return [
      { icon: Package, label: 'Závazná objednávka přijata', date: order.created_at, done: true },
      { icon: Receipt, label: 'Zálohová faktura vystavena', date: order.invoice_issued_at, done: !!order.invoice_issued_at },
      { icon: Banknote, label: 'Platba přijata — zajišťujeme Váš kus', date: order.paid_at, done: !!order.paid_at },
      { icon: Truck, label: 'Odesláno pojištěnou přepravou', date: order.shipped_at, done: !!order.shipped_at },
      { icon: Home, label: 'Doručeno', date: order.delivered_at, done: !!order.delivered_at },
    ];
  }, [order]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f7f5f1]"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }
  if (notFound || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f7f5f1] px-6 text-center">
        <p className="font-display text-xl font-bold text-zinc-900">Objednávka nenalezena</p>
        <p className="text-sm text-zinc-500">Odkaz je neplatný nebo vypršel. Ozvěte se nám prosím e-mailem.</p>
        <Link to="/prestige" className="text-sm font-medium text-zinc-900 underline">Zpět na prémiový segment</Link>
      </div>
    );
  }

  const canEditBilling = !order.shipped_at;
  const billComplete = !!(order.bill_street && order.bill_city && order.bill_zip);

  return (
    <div className="min-h-screen bg-[#f7f5f1] pb-16">
      {/* Minimal luxury header */}
      <header className="bg-zinc-900 px-6 py-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link to="/prestige" className="font-display text-lg font-extrabold tracking-tight text-white">
            swelt<span className="text-[#c9a86a]">.</span>partner
          </Link>
          <span className="text-[11px] uppercase tracking-widest text-zinc-400">Prémiový segment</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4">
        {/* Order card */}
        <div className="-mt-0 mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9a7b4f]">Vaše objednávka</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-display text-2xl font-bold text-zinc-900">{order.order_number}</h1>
            {order.invoice_number && <span className="text-sm text-zinc-500">faktura {order.invoice_number}</span>}
          </div>
          {order.customer_name && <p className="mt-1 text-sm text-zinc-500">pro {order.bill_company || order.customer_name}</p>}

          {/* Items */}
          <div className="mt-5 divide-y divide-zinc-100 rounded-xl border border-zinc-200">
            {(order.items ?? []).map((it, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1 truncate text-sm"><span className="font-semibold">{it.brand}</span> {it.model}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">{it.price.toLocaleString('cs-CZ')} {order.currency}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 bg-zinc-900 px-4 py-3 text-white">
              <span className="flex-1 text-sm font-semibold">Celkem</span>
              <span className="text-base font-extrabold tabular-nums">{order.amount.toLocaleString('cs-CZ')} {order.currency}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-7">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Průběh objednávky</p>
            <ol className="space-y-0">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isLast = i === steps.length - 1;
                return (
                  <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {!isLast && <span className={`absolute left-[15px] top-8 h-[calc(100%-24px)] w-px ${s.done ? 'bg-zinc-900' : 'bg-zinc-200'}`} />}
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${s.done ? 'bg-zinc-900 text-white' : 'border border-zinc-300 bg-white text-zinc-300'}`}>
                      {s.done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 pt-1">
                      <p className={`text-sm font-semibold ${s.done ? 'text-zinc-900' : 'text-zinc-400'}`}>{s.label}</p>
                      {s.done && s.date && <p className="text-xs text-zinc-500">{czDate(s.date)}</p>}
                      {s.label.startsWith('Odesláno') && s.done && (order.tracking_number || order.tracking_url) && (
                        <p className="mt-1 text-xs text-zinc-600">
                          {order.carrier ? `${order.carrier} · ` : ''}
                          {order.tracking_url
                            ? <a href={order.tracking_url} target="_blank" rel="noreferrer" className="font-medium text-zinc-900 underline">{order.tracking_number ?? 'Sledovat zásilku'}</a>
                            : order.tracking_number}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Guarantee strip */}
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#faf8f4] p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#9a7b4f]" />
            <p className="text-xs leading-relaxed text-zinc-600">Každý kus dodáváme s krabičkou, kartou a plnou dokumentací — <strong>pravost garantujeme</strong>. Zásilka je po celou dobu přepravy pojištěna.</p>
          </div>
        </div>

        {/* Billing details */}
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Fakturační údaje</p>
              {!billComplete && canEditBilling && !editingBill && (
                <p className="mt-1 text-sm text-amber-700">Prosíme o doplnění — potřebujeme je pro zálohovou fakturu.</p>
              )}
            </div>
            {canEditBilling && !editingBill && (
              <Button size="sm" variant="outline" onClick={() => setEditingBill(true)} className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> {billComplete ? 'Upravit' : 'Doplnit'}
              </Button>
            )}
          </div>

          {!editingBill ? (
            <div className="mt-3 text-sm leading-relaxed text-zinc-700">
              {[order.bill_company, order.bill_name, order.bill_street, [order.bill_zip, order.bill_city].filter(Boolean).join(' '),
                order.bill_ico ? `IČO: ${order.bill_ico}` : '', order.bill_dic ? `DIČ: ${order.bill_dic}` : '']
                .filter(Boolean)
                .map((l, i) => <p key={i}>{l}</p>)}
              {!billComplete && <p className="text-zinc-400">(adresa zatím nevyplněna)</p>}
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input value={bill.name} onChange={(e) => setBill((b) => ({ ...b, name: e.target.value }))} placeholder="Jméno a příjmení" className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-zinc-400" />
              <input value={bill.company} onChange={(e) => setBill((b) => ({ ...b, company: e.target.value }))} placeholder="Firma (volitelné)" className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-zinc-400" />
              <input value={bill.ico} onChange={(e) => setBill((b) => ({ ...b, ico: e.target.value }))} placeholder="IČO (u firmy)" className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-zinc-400" />
              <input value={bill.dic} onChange={(e) => setBill((b) => ({ ...b, dic: e.target.value }))} placeholder="DIČ (volitelné)" className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-zinc-400" />
              <input value={bill.street} onChange={(e) => setBill((b) => ({ ...b, street: e.target.value }))} placeholder="Ulice a č. p." className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-zinc-400 sm:col-span-2" />
              <input value={bill.city} onChange={(e) => setBill((b) => ({ ...b, city: e.target.value }))} placeholder="Město" className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-zinc-400" />
              <div className="flex gap-3">
                <input value={bill.zip} onChange={(e) => setBill((b) => ({ ...b, zip: e.target.value }))} placeholder="PSČ" className="w-28 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-zinc-400" />
                <select value={bill.country} onChange={(e) => setBill((b) => ({ ...b, country: e.target.value }))} aria-label="Země" className="flex-1 rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm outline-none">
                  <option value="CZ">Česko</option>
                  <option value="SK">Slovensko</option>
                  <option value="AT">Rakousko</option>
                  <option value="DE">Německo</option>
                  <option value="PL">Polsko</option>
                </select>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button size="sm" disabled={savingBill} onClick={() => void saveBilling()} className="gap-1.5 bg-zinc-900 text-white hover:bg-zinc-800">
                  {savingBill && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Uložit údaje
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingBill(false)}>Zrušit</Button>
              </div>
            </div>
          )}
          {!canEditBilling && <p className="mt-2 text-xs text-zinc-400">Objednávka už je na cestě — pro změnu údajů nás kontaktujte e-mailem.</p>}
        </div>

        {/* Satisfaction rating */}
        {order.delivered_at && (
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Vaše spokojenost</p>
            {ratingDone ? (
              <div className="mt-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`h-6 w-6 ${n <= rating ? 'fill-[#c9a86a] text-[#c9a86a]' : 'text-zinc-200'}`} />
                  ))}
                </div>
                <p className="mt-2 text-sm text-zinc-600">Děkujeme za Vaše hodnocení — moc si ho vážíme.</p>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-zinc-600">Jak jste spokojeni se svými novými hodinkami?</p>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} z 5`} className="transition-transform hover:scale-110">
                      <Star className={`h-8 w-8 ${n <= rating ? 'fill-[#c9a86a] text-[#c9a86a]' : 'text-zinc-300'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={ratingNote}
                  onChange={(e) => setRatingNote(e.target.value)}
                  rows={2}
                  placeholder="Chcete nám něco vzkázat? (volitelné)"
                  className="w-full resize-y rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-zinc-400"
                />
                <Button size="sm" disabled={sendingRating || rating === 0} onClick={() => void submitRating(rating)} className="gap-1.5 bg-zinc-900 text-white hover:bg-zinc-800">
                  {sendingRating && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Odeslat hodnocení
                </Button>
              </div>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-zinc-400">
          Jakýkoliv dotaz? Napište na <a href="mailto:info@swelt.cz" className="underline">info@swelt.cz</a> — odpovídáme rychle.
        </p>
      </main>
    </div>
  );
}
