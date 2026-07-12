import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, RefreshCw, Inbox, Sparkles, CalendarDays, CheckCircle2, ChevronDown,
  Building2, User as UserIcon, Mail, Phone, Package, Coins, Send, Bot, MailCheck, Tag, Wand2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Status = 'new' | 'in_progress' | 'quoted' | 'closed';

interface InquiryWatch { id?: string; brand: string; model: string; custom?: boolean }

interface Inquiry {
  id: string;
  created_at: string;
  status: Status;
  purchase_type: 'personal' | 'company';
  company: string | null;
  ico: string | null;
  name: string;
  email: string;
  phone_code: string | null;
  phone: string | null;
  quantity: string | null;
  budget: string | null;
  note: string | null;
  watches: InquiryWatch[];
  admin_note: string | null;
  ai_draft: string | null;
  offer_price: string | null;
  offer_currency: string | null;
  offer_draft: string | null;
}

interface EmailRow {
  id: string;
  kind: string;
  recipient: string;
  status: string;
  scheduled_at: string;
  sent_at: string | null;
  last_error: string | null;
}

const KIND_LABELS: Record<string, string> = {
  confirmation: 'Potvrzení přijetí',
  admin_notification: 'Notifikace adminovi',
  advisory_draft_ready: 'AI draft připraven (admin)',
  advisory_reply: 'Poradenská odpověď',
  offer: 'Cenová nabídka',
  course_1: 'Akademie 1/5 — Pravost',
  course_2: 'Akademie 2/5 — Investice',
  course_3: 'Akademie 3/5 — Velikost',
  course_4: 'Akademie 4/5 — Údržba',
  course_5: 'Akademie 5/5 — Ikony',
};

const EMAIL_STATUS_CLS: Record<string, string> = {
  sent: 'bg-emerald-500/15 text-emerald-600',
  pending: 'bg-amber-500/15 text-amber-600',
  error: 'bg-destructive/15 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
};

const STATUS: { key: Status; label: string; cls: string }[] = [
  { key: 'new', label: 'Nová', cls: 'bg-blue-500/15 text-blue-600' },
  { key: 'in_progress', label: 'V řešení', cls: 'bg-amber-500/15 text-amber-600' },
  { key: 'quoted', label: 'Naceněno', cls: 'bg-violet-500/15 text-violet-600' },
  { key: 'closed', label: 'Uzavřeno', cls: 'bg-emerald-500/15 text-emerald-600' },
];
const statusMeta = (s: string) => STATUS.find((x) => x.key === s) ?? STATUS[0];

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export default function AdminInquiries() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuthContext();
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerCurrency, setOfferCurrency] = useState('CZK');
  const [offerDraft, setOfferDraft] = useState('');
  const [generatingOffer, setGeneratingOffer] = useState(false);
  const [sendingOffer, setSendingOffer] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('prestige_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    setRows((data ?? []) as unknown as Inquiry[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) { navigate('/'); return; }
    if (isAdmin) void load();
  }, [isAdmin, authLoading, navigate, load]);

  const kpi = useMemo(() => {
    const weekAgo = Date.now() - 7 * 864e5;
    return {
      total: rows.length,
      neu: rows.filter((r) => r.status === 'new').length,
      week: rows.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length,
      closed: rows.filter((r) => r.status === 'closed').length,
    };
  }, [rows]);

  const shown = useMemo(
    () => (filter === 'all' ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  async function setStatus(id: string, status: Status) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    const { error } = await supabase.from('prestige_inquiries').update({ status }).eq('id', id);
    if (error) { toast.error('Změna stavu selhala'); void load(); }
  }

  async function loadEmails(inquiryId: string) {
    const { data } = await supabase
      .from('inquiry_emails')
      .select('id, kind, recipient, status, scheduled_at, sent_at, last_error')
      .eq('inquiry_id', inquiryId)
      .order('scheduled_at', { ascending: true });
    setEmails((data ?? []) as EmailRow[]);
  }

  async function toggleOpen(inq: Inquiry) {
    if (openId === inq.id) { setOpenId(null); return; }
    setOpenId(inq.id);
    setDraft(inq.ai_draft ?? '');
    setOfferPrice(inq.offer_price ?? '');
    setOfferCurrency(inq.offer_currency ?? 'CZK');
    setOfferDraft(inq.offer_draft ?? '');
    setEmails([]);
    setEmailsLoading(true);
    await loadEmails(inq.id);
    setEmailsLoading(false);
  }

  async function generateOffer(id: string) {
    if (!offerPrice.trim()) { toast.error('Zadejte cenu'); return; }
    setGeneratingOffer(true);
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) { setGeneratingOffer(false); toast.error('Nejste přihlášeni'); return; }
    try {
      const res = await fetch('/api/generate-offer', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId: id, price: offerPrice.trim(), currency: offerCurrency }),
      });
      const json = await res.json();
      if (!res.ok || !json.draft) { toast.error(json.error || 'Generování nabídky selhalo'); return; }
      setOfferDraft(json.draft);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, offer_draft: json.draft, offer_price: offerPrice.trim(), offer_currency: offerCurrency } : r)));
      toast.success('Nabídka vygenerována — zkontrolujte a odešlete');
    } catch {
      toast.error('Generování nabídky selhalo');
    } finally {
      setGeneratingOffer(false);
    }
  }

  async function sendOffer(inq: Inquiry) {
    if (!offerPrice.trim() || !offerDraft.trim()) { toast.error('Vyplňte cenu i text nabídky'); return; }
    setSendingOffer(true);
    await supabase.from('prestige_inquiries')
      .update({ offer_price: offerPrice.trim(), offer_currency: offerCurrency, offer_draft: offerDraft, status: 'quoted' })
      .eq('id', inq.id);
    const { error } = await supabase.from('inquiry_emails').upsert({
      inquiry_id: inq.id,
      kind: 'offer',
      recipient: inq.email,
      status: 'pending',
      scheduled_at: new Date().toISOString(),
      sent_at: null,
      attempts: 0,
      last_error: null,
      payload: {},
    }, { onConflict: 'inquiry_id,kind' });
    if (error) { setSendingOffer(false); toast.error('Zařazení nabídky selhalo'); return; }
    try { await fetch('/api/process-inquiries', { method: 'POST' }); } catch { /* cron will send */ }
    setRows((prev) => prev.map((r) => (r.id === inq.id ? { ...r, status: 'quoted' as Status, offer_price: offerPrice.trim(), offer_currency: offerCurrency, offer_draft: offerDraft } : r)));
    await loadEmails(inq.id);
    setSendingOffer(false);
    toast.success('Nabídka zařazena k odeslání zákazníkovi');
  }

  async function saveDraft(id: string) {
    setSavingDraft(true);
    const { error } = await supabase.from('prestige_inquiries').update({ ai_draft: draft }).eq('id', id);
    setSavingDraft(false);
    if (error) { toast.error('Uložení návrhu selhalo'); return; }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ai_draft: draft } : r)));
    toast.success('Návrh uložen');
  }

  async function regenerate(id: string) {
    setRegenerating(true);
    // Clear the draft + its "ready" marker so the processor drafts it again.
    await supabase.from('prestige_inquiries').update({ ai_draft: null }).eq('id', id);
    await supabase.from('inquiry_emails').delete().eq('inquiry_id', id).eq('kind', 'advisory_draft_ready');
    try { await fetch('/api/process-inquiries', { method: 'POST' }); } catch { /* cron picks it up */ }
    setDraft('');
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ai_draft: null } : r)));
    setRegenerating(false);
    toast.message('Přegenerování spuštěno — obnovte za okamžik tlačítkem ↻.');
  }

  async function sendReply(inq: Inquiry) {
    if (!draft.trim()) { toast.error('Návrh odpovědi je prázdný'); return; }
    setSending(true);
    await supabase.from('prestige_inquiries').update({ ai_draft: draft }).eq('id', inq.id);
    // Upsert lets an edited reply be re-queued (unique on inquiry_id + kind).
    const { error } = await supabase.from('inquiry_emails').upsert({
      inquiry_id: inq.id,
      kind: 'advisory_reply',
      recipient: inq.email,
      status: 'pending',
      scheduled_at: new Date().toISOString(),
      sent_at: null,
      attempts: 0,
      last_error: null,
      payload: { text: draft },
    }, { onConflict: 'inquiry_id,kind' });
    if (error) { setSending(false); toast.error('Zařazení odpovědi selhalo'); return; }
    try { await fetch('/api/process-inquiries', { method: 'POST' }); } catch { /* cron will send */ }
    if (inq.status === 'new') {
      await supabase.from('prestige_inquiries').update({ status: 'in_progress' }).eq('id', inq.id);
      setRows((prev) => prev.map((r) => (r.id === inq.id ? { ...r, status: 'in_progress', ai_draft: draft } : r)));
    } else {
      setRows((prev) => prev.map((r) => (r.id === inq.id ? { ...r, ai_draft: draft } : r)));
    }
    await loadEmails(inq.id);
    setSending(false);
    toast.success('Odpověď zařazena k odeslání zákazníkovi');
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:pt-32">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Poptávky — prémiový segment</h1>
            <p className="text-xs text-muted-foreground">Nezávazné poptávky z /prestige (Luxury na poptávku).</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void load()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Kpi icon={<Inbox className="h-3.5 w-3.5" />} label="Celkem" value={String(kpi.total)} />
              <Kpi icon={<Sparkles className="h-3.5 w-3.5" />} label="Nové" value={String(kpi.neu)} />
              <Kpi icon={<CalendarDays className="h-3.5 w-3.5" />} label="Tento týden" value={String(kpi.week)} />
              <Kpi icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Uzavřené" value={String(kpi.closed)} />
            </div>

            {/* Status filter */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFilter('all')}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filter === 'all' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-border bg-card text-muted-foreground hover:border-zinc-400'}`}>
                Vše ({rows.length})
              </button>
              {STATUS.map((s) => (
                <button key={s.key} onClick={() => setFilter(s.key)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filter === s.key ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-border bg-card text-muted-foreground hover:border-zinc-400'}`}>
                  {s.label} ({rows.filter((r) => r.status === s.key).length})
                </button>
              ))}
            </div>

            {/* List */}
            <div className="overflow-hidden rounded-lg border bg-card">
              {shown.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">Žádné poptávky.</p>
              ) : (
                <div className="divide-y">
                  {shown.map((r) => {
                    const meta = statusMeta(r.status);
                    const open = openId === r.id;
                    return (
                      <div key={r.id}>
                        {/* Row header */}
                        <button
                          type="button"
                          onClick={() => void toggleOpen(r)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                        >
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${meta.cls}`}>{meta.label}</span>
                          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                            {r.purchase_type === 'company' ? <Building2 className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {r.purchase_type === 'company' && r.company ? `${r.company} — ` : ''}{r.name}
                          </span>
                          <span className="hidden shrink-0 truncate text-xs text-muted-foreground sm:block">
                            {r.watches?.length ? `${r.watches.length} ${r.watches.length === 1 ? 'model' : 'modely'}` : '—'}
                          </span>
                          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: '2-digit' })}
                          </span>
                          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Detail */}
                        {open && (
                          <div className="space-y-4 border-t bg-muted/20 px-4 py-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2 text-sm">
                              <p className="flex items-center gap-2"><UserIcon className="h-3.5 w-3.5 text-muted-foreground" /> {r.name}</p>
                              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> <a href={`mailto:${r.email}`} className="text-primary hover:underline">{r.email}</a></p>
                              {r.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {r.phone_code} {r.phone}</p>}
                              <p className="flex items-center gap-2">
                                {r.purchase_type === 'company' ? <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> : <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />}
                                {r.purchase_type === 'company'
                                  ? <>Na firmu{r.company ? ` · ${r.company}` : ''}{r.ico ? ` · IČO ${r.ico}` : ''}</>
                                  : 'Osobní nákup'}
                              </p>
                              <p className="flex items-center gap-2"><Package className="h-3.5 w-3.5 text-muted-foreground" /> {r.quantity ?? '1 kus'}</p>
                              {r.budget && <p className="flex items-center gap-2"><Coins className="h-3.5 w-3.5 text-muted-foreground" /> {r.budget}</p>}
                              {r.note && <p className="rounded-md bg-card p-2 text-xs text-muted-foreground">{r.note}</p>}
                            </div>

                            <div className="space-y-3">
                              <div>
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Poptávané modely</p>
                                {r.watches?.length ? (
                                  <ul className="space-y-0.5 text-sm">
                                    {r.watches.map((w, i) => (
                                      <li key={i}><span className="font-medium">{w.brand}</span> {w.model}</li>
                                    ))}
                                  </ul>
                                ) : <p className="text-sm text-muted-foreground">Neuvedeno</p>}
                              </div>
                              <div>
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stav</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {STATUS.map((s) => (
                                    <button
                                      key={s.key} type="button"
                                      onClick={() => setStatus(r.id, s.key)}
                                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${r.status === s.key ? s.cls + ' ring-1 ring-inset ring-current' : 'bg-card text-muted-foreground hover:bg-muted'}`}
                                    >
                                      {s.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                            {/* AI reply / advisory draft */}
                            <div>
                              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <Bot className="h-3.5 w-3.5" /> AI návrh odpovědi zákazníkovi
                              </p>
                              <textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                rows={8}
                                placeholder="U poptávek s poradenstvím se návrh vygeneruje automaticky. Můžete jej upravit nebo napsat vlastní odpověď zákazníkovi…"
                                className="w-full resize-y rounded-md border bg-card p-3 text-sm outline-none focus:ring-1 focus:ring-zinc-400"
                              />
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Button size="sm" variant="secondary" disabled={savingDraft} onClick={() => void saveDraft(r.id)} className="gap-1.5">
                                  {savingDraft && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Uložit
                                </Button>
                                <Button size="sm" variant="outline" disabled={regenerating} onClick={() => void regenerate(r.id)} className="gap-1.5">
                                  {regenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Přegenerovat AI návrh
                                </Button>
                                <Button size="sm" disabled={sending || !draft.trim()} onClick={() => void sendReply(r)} className="gap-1.5 bg-zinc-900 text-white hover:bg-zinc-800">
                                  {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Odeslat zákazníkovi
                                </Button>
                              </div>
                            </div>

                            {/* Priced offer generator */}
                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-500">
                                <Tag className="h-3.5 w-3.5" /> Cenová nabídka — nacenění + AI copy
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  value={offerPrice}
                                  onChange={(e) => setOfferPrice(e.target.value)}
                                  inputMode="numeric"
                                  placeholder="Cena na klíč"
                                  className="w-36 rounded-md border bg-card px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-amber-400"
                                />
                                <select
                                  value={offerCurrency}
                                  onChange={(e) => setOfferCurrency(e.target.value)}
                                  aria-label="Měna"
                                  className="rounded-md border bg-card px-2 py-1.5 text-sm outline-none"
                                >
                                  <option value="CZK">CZK</option>
                                  <option value="EUR">EUR</option>
                                </select>
                                <Button size="sm" variant="outline" disabled={generatingOffer || !offerPrice.trim()} onClick={() => void generateOffer(r.id)} className="gap-1.5">
                                  {generatingOffer ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />} Vygenerovat nabídku
                                </Button>
                              </div>
                              <textarea
                                value={offerDraft}
                                onChange={(e) => setOfferDraft(e.target.value)}
                                rows={8}
                                placeholder="Zadejte cenu a nechte AI vygenerovat nabídku — napíše luxusní copy (historie modelů, investiční hodnota, údržba, proč u nás). Text můžete upravit. E-mail se sestaví včetně fotek hodinek, ceny, průvodce dalšími kroky a napojení na akademii."
                                className="mt-2 w-full resize-y rounded-md border bg-card p-3 text-sm outline-none focus:ring-1 focus:ring-amber-400"
                              />
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Button size="sm" disabled={sendingOffer || !offerDraft.trim() || !offerPrice.trim()} onClick={() => void sendOffer(r)} className="gap-1.5 bg-amber-600 text-white hover:bg-amber-700">
                                  {sendingOffer ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Odeslat nabídku zákazníkovi
                                </Button>
                                <span className="text-[11px] text-muted-foreground">Odesláním se poptávka označí jako „Naceněno". E-mail obsahuje fotky, ujištění a průvodce objednávkou.</span>
                              </div>
                            </div>

                            {/* E-mail timeline */}
                            <div>
                              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <MailCheck className="h-3.5 w-3.5" /> Odeslané a naplánované e-maily
                              </p>
                              {emailsLoading ? (
                                <div className="py-3"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                              ) : emails.length === 0 ? (
                                <p className="text-xs text-muted-foreground">Zatím nic — potvrzení a notifikace se posílají ihned po odeslání, díly minikurzu pak denní automatikou.</p>
                              ) : (
                                <ul className="divide-y rounded-md border bg-card">
                                  {emails.map((e) => (
                                    <li key={e.id} className="flex items-center gap-2 px-3 py-2 text-xs">
                                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${EMAIL_STATUS_CLS[e.status] ?? 'bg-muted text-muted-foreground'}`}>
                                        {e.status === 'sent' ? 'Odesláno' : e.status === 'pending' ? 'Čeká' : e.status === 'error' ? 'Chyba' : 'Zrušeno'}
                                      </span>
                                      <span className="min-w-0 flex-1 truncate">{KIND_LABELS[e.kind] ?? e.kind}</span>
                                      {e.last_error && <span className="hidden shrink-0 truncate text-destructive sm:block" title={e.last_error}>{e.last_error.slice(0, 40)}</span>}
                                      <span className="shrink-0 tabular-nums text-muted-foreground">
                                        {new Date(e.sent_at ?? e.scheduled_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
