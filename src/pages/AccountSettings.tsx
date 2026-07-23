import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, User, MapPin, Bell, Globe, Lock, ShieldCheck, BadgePercent,
  Rocket, Check, Clock, Loader2, LogOut, Store, Mail, Plus, Trash2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { PasswordInput } from '@/components/ui/password-input';
import { supabase } from '@/integrations/supabase/client';
import type { TablesUpdate } from '@/integrations/supabase/types';
import { useAuthContext } from '@/contexts/AuthContext';
import { useDealAlerts } from '@/hooks/useDealAlerts';
import { useStore } from '@/lib/store';
import { ALL_LANGS, langNames, type Lang } from '@/lib/i18n';
import { siteUrl } from '@/lib/siteUrl';
import { toast } from 'sonner';

const COUNTRIES = [
  { code: 'CZ', label: 'Česko' }, { code: 'SK', label: 'Slovensko' },
  { code: 'PL', label: 'Polsko' }, { code: 'DE', label: 'Německo' },
  { code: 'AT', label: 'Rakousko' }, { code: 'HU', label: 'Maďarsko' },
  { code: 'SI', label: 'Slovinsko' }, { code: 'RO', label: 'Rumunsko' },
  { code: 'FR', label: 'Francie' }, { code: 'ES', label: 'Španělsko' },
  { code: 'IT', label: 'Itálie' }, { code: 'NL', label: 'Nizozemsko' },
];

/* ── B2B benefits — motivational copy shared by the request + pending views ── */
const B2B_BENEFITS = [
  { t: 'Velkoobchodní ceny', d: 'Přístup k 5 000+ produktům za nákupní ceny — stejné, jaké máme my.' },
  { t: 'Slevy podle obratu', d: 'Individuální slevová hladina, kterou váš account manager nastaví na míru.' },
  { t: 'Automatický XML/CSV feed', d: 'Napojte celý katalog do svého e-shopu a držte sklad i ceny v reálném čase.' },
  { t: 'Dropshipping bez skladu', d: 'Prodávejte bez nákupu zásob — expedici i balení řešíme za vás.' },
  { t: 'Platba na fakturu', d: 'Po schválení nabízíme prodej na kredit s odloženou splatností.' },
  { t: 'Dedikovaná podpora', d: 'Osobní account manager pro objednávky, reklamace i růst vašeho byznysu.' },
];

/* ── Live 24h approval countdown ── */
function Countdown({ from }: { from: string }) {
  const deadline = new Date(from).getTime() + 24 * 60 * 60 * 1000;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = Math.max(0, deadline - now);
  if (left === 0) return <span>Vaši žádost právě zpracováváme — ozveme se každou chvíli.</span>;
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(left / 3_600_000);
  const m = Math.floor(left / 60_000) % 60;
  const s = Math.floor(left / 1_000) % 60;
  return (
    <span className="tabular-nums font-display text-3xl font-black tracking-tight text-foreground">
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

/* ── Section card ── */
function Card({ icon: Icon, eyebrow, title, desc, children }: {
  icon: React.ElementType; eyebrow: string; title: string; desc?: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-6 sm:p-7">
      <div className="flex items-start gap-3 mb-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
          <h2 className="font-display text-lg sm:text-xl font-black tracking-tight text-foreground">{title}</h2>
          {desc && <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const PAYMENT_LABEL: Record<string, string> = { prepaid: 'Platba předem', credit: 'Na fakturu (kredit)' };

/* ── Deal watchdogy (alerty z homepage sekce Top Deals) ── */
const ALERT_LEVEL_LABEL: Record<string, string> = {
  deals: 'Všechny dealy',
  concern: 'Koncern',
  brand: 'Značka',
  product: 'Model',
};

function AlertsCard() {
  const { alerts, loading, remove } = useDealAlerts();
  return (
    <Card
      icon={Bell}
      eyebrow="Alerty"
      title="Deal watchdogy"
      desc="Hlídače deal dropů — koncerny, značky i jednotlivé modely. E-mailová upozornění napojíme v další fázi."
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Načítám…</p>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Zatím žádné watchdogy. Nastavíte je na úvodní stránce v sekci GoBigDeal.
        </p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-slate-50/60 px-4 py-2.5"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {a.label || a.target || 'Všechny dealy'}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {ALERT_LEVEL_LABEL[a.level] ?? a.level}
                </span>
              </span>
              <button
                type="button"
                onClick={() => remove(a.level, a.target)}
                className="shrink-0 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
              >
                Zrušit
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function AccountSettings() {
  const navigate = useNavigate();
  const { user, profile, isB2bApproved, loading, refreshProfile, signOut } = useAuthContext();
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);

  const [form, setForm] = useState({
    company_name: '', ico: '', vat_id: '', country: 'CZ',
    contact_name: '', phone: '', address_street: '', address_city: '', address_zip: '',
    brand_name: '', brand_logo_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [emailForm, setEmailForm] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [newContact, setNewContact] = useState('');
  const [contactSaving, setContactSaving] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  // Předvyplníme přihlašovací e-mail (jde ho tu změnit).
  useEffect(() => { if (user?.email) setEmailForm(user.email); }, [user?.email]);
  useEffect(() => {
    if (!loading && !user) navigate('/');
  }, [loading, user, navigate]);

  // Seed the form from the profile once it loads
  useEffect(() => {
    if (!profile) return;
    setForm({
      company_name: profile.company_name ?? '', ico: profile.ico ?? '', vat_id: profile.vat_id ?? '',
      country: profile.country ?? 'CZ', contact_name: profile.contact_name ?? '', phone: profile.phone ?? '',
      address_street: profile.address_street ?? '', address_city: profile.address_city ?? '',
      address_zip: profile.address_zip ?? '', brand_name: profile.brand_name ?? '',
      brand_logo_url: profile.brand_logo_url ?? '',
    });
  }, [profile]);

  const hasIco = !!profile?.ico?.trim();
  const status: 'approved' | 'pending' | 'plain' = isB2bApproved ? 'approved' : hasIco ? 'pending' : 'plain';
  const requestedAt = profile?.b2b_requested_at ?? profile?.created_at ?? null;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const writeProfile = async (patch: TablesUpdate<'profiles'>) => {
    if (!user) return false;
    const { error } = await supabase.from('profiles').update(patch).eq('user_id', user.id);
    if (error) { toast.error('Uložení selhalo: ' + error.message); return false; }
    await refreshProfile();
    return true;
  };

  // Save the editable profile fields (approved / pending edit)
  const handleSave = async () => {
    setSaving(true);
    const ok = await writeProfile({
      company_name: form.company_name.trim(), vat_id: form.vat_id.trim() || null,
      country: form.country, contact_name: form.contact_name.trim() || null,
      phone: form.phone.trim() || null, address_street: form.address_street.trim() || null,
      address_city: form.address_city.trim() || null, address_zip: form.address_zip.trim() || null,
      brand_name: form.brand_name.trim() || null, brand_logo_url: form.brand_logo_url.trim() || null,
    });
    setSaving(false);
    if (ok) toast.success('Změny uloženy');
  };

  // Plain account → submit B2B request (fills company + IČO, stamps the request time)
  const handleSubmitRequest = async () => {
    if (!form.company_name.trim()) { toast.error('Vyplňte název firmy'); return; }
    if (!/^\d{6,8}$/.test(form.ico.trim())) { toast.error('IČO musí mít 6–8 číslic'); return; }
    setSaving(true);
    const ok = await writeProfile({
      company_name: form.company_name.trim(), ico: form.ico.trim(), vat_id: form.vat_id.trim() || null,
      country: form.country, contact_name: form.contact_name.trim() || null, phone: form.phone.trim() || null,
      address_street: form.address_street.trim() || null, address_city: form.address_city.trim() || null,
      address_zip: form.address_zip.trim() || null, b2b_requested_at: new Date().toISOString(),
    });
    setSaving(false);
    if (ok) toast.success('Žádost o B2B partnerství odeslána. Ozveme se do 24 hodin.');
  };

  const toggleNotify = async (key: 'notify_offers' | 'notify_orders', value: boolean) => {
    await writeProfile({ [key]: value });
  };

  const handleChangeEmail = async () => {
    const next = emailForm.trim().toLowerCase();
    if (!next || next === (user?.email ?? '').toLowerCase()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) { toast.error('Zadejte platný e-mail'); return; }
    setEmailSaving(true);
    // Supabase pošle potvrzovací odkaz na novou adresu; změna se projeví až po potvrzení.
    const { error } = await supabase.auth.updateUser(
      { email: next },
      { emailRedirectTo: `${siteUrl()}/auth/callback` },
    );
    setEmailSaving(false);
    if (error) { toast.error('Změna e-mailu selhala: ' + error.message); return; }
    toast.success(`Potvrzovací odkaz jsme poslali na ${next}. Změna se projeví po potvrzení.`);
  };

  // ── Kontaktní e-maily + hlavní e-mail ──
  const contactEmails = profile?.contact_emails ?? [];
  const primaryEmail = profile?.primary_contact_email ?? null;
  // null = hlavní je přihlašovací e-mail
  const isPrimaryEmail = (em: string | null) => (em === null ? !primaryEmail : primaryEmail === em);

  const setPrimaryEmail = async (em: string | null) => {
    const ok = await writeProfile({ primary_contact_email: em });
    if (ok) toast.success('Hlavní e-mail nastaven');
  };

  const addContactEmail = async () => {
    const em = newContact.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { toast.error('Zadejte platný e-mail'); return; }
    if (em === (user?.email ?? '').toLowerCase() || contactEmails.includes(em)) {
      toast.error('Tento e-mail už je přidaný'); return;
    }
    setContactSaving(true);
    const ok = await writeProfile({ contact_emails: [...contactEmails, em] });
    setContactSaving(false);
    if (ok) { setNewContact(''); toast.success('E-mail přidán'); }
  };

  const removeContactEmail = async (em: string) => {
    const patch: TablesUpdate<'profiles'> = { contact_emails: contactEmails.filter((x) => x !== em) };
    if (primaryEmail === em) patch.primary_contact_email = null; // hlavní se vrací na přihlašovací
    const ok = await writeProfile(patch);
    if (ok) toast.success('E-mail odebrán');
  };

  const handlePassword = async () => {
    if (pw.next.length < 6) { toast.error('Heslo musí mít alespoň 6 znaků'); return; }
    if (pw.next !== pw.confirm) { toast.error('Hesla se neshodují'); return; }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setPwSaving(false);
    if (error) { toast.error('Změna hesla selhala: ' + error.message); return; }
    setPw({ next: '', confirm: '' });
    toast.success('Heslo změněno');
  };

  const dirty = useMemo(() => {
    if (!profile) return false;
    return (
      form.company_name !== (profile.company_name ?? '') || form.vat_id !== (profile.vat_id ?? '') ||
      form.country !== (profile.country ?? 'CZ') || form.contact_name !== (profile.contact_name ?? '') ||
      form.phone !== (profile.phone ?? '') || form.address_street !== (profile.address_street ?? '') ||
      form.address_city !== (profile.address_city ?? '') || form.address_zip !== (profile.address_zip ?? '') ||
      form.brand_name !== (profile.brand_name ?? '') || form.brand_logo_url !== (profile.brand_logo_url ?? '')
    );
  }, [form, profile]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center py-40 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  const roleBadge = status === 'approved'
    ? { label: 'B2B partner', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' }
    : status === 'pending'
      ? { label: 'Žádost se schvaluje', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' }
      : { label: 'Základní účet', cls: 'bg-zinc-100 text-zinc-600 border-border' };

  return (
    <div className="min-h-screen bg-white pb-24">
      <Navbar />
      <BackButton />

      {/* ── Header ── */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-5xl px-6 pt-24 pb-8 sm:pt-32">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary">Můj účet</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Nastavení účtu
            </h1>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${roleBadge.cls}`}>
              {roleBadge.label}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> {user.email}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-5">

        {/* ════ PLAIN ACCOUNT — B2B request CTA + motivational copy ════ */}
        {status === 'plain' && (
          <section className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/[0.04] to-white p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="h-5 w-5 text-primary" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Staňte se B2B partnerem</p>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground max-w-xl">
              Odemkněte velkoobchodní ceny. Schválení do 24 hodin.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Máte teď základní účet — vidíte katalog, ale ne ceny. Doplňte firemní údaje a odešlete žádost.
              Bez závazků, bez poplatků. Po schválení získáte nákupní ceny, feed do e-shopu i dropshipping.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {B2B_BENEFITS.map((b) => (
                <div key={b.t} className="flex gap-2.5">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" strokeWidth={3} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{b.t}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{b.d}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Request form */}
            <div className="mt-7 rounded-xl border border-border bg-white p-5 sm:p-6">
              <h3 className="font-display text-lg font-black tracking-tight text-foreground mb-4">Doplnit údaje a odeslat žádost</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Název firmy *">
                  <Input value={form.company_name} onChange={set('company_name')} placeholder="Vaše firma s.r.o." className="h-10" />
                </Field>
                <Field label="IČO *">
                  <Input value={form.ico} onChange={(e) => setForm((f) => ({ ...f, ico: e.target.value.replace(/\D/g, '') }))} inputMode="numeric" maxLength={8} placeholder="12345678" className="h-10" />
                </Field>
                <Field label="DIČ (volitelné)">
                  <Input value={form.vat_id} onChange={set('vat_id')} placeholder="CZ12345678" className="h-10" />
                </Field>
                <Field label="Země">
                  <select value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Kontaktní osoba">
                  <Input value={form.contact_name} onChange={set('contact_name')} placeholder="Jan Novák" className="h-10" />
                </Field>
                <Field label="Telefon">
                  <Input value={form.phone} onChange={set('phone')} placeholder="+420 777 123 456" className="h-10" />
                </Field>
              </div>
              <Button onClick={handleSubmitRequest} disabled={saving} className="mt-5 h-11 w-full sm:w-auto gap-2 px-8">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                Odeslat žádost o B2B partnerství
              </Button>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Žádost vyřizujeme do 24 hodin v pracovní dny. Do té doby máte přístup ke katalogu jako základní účet.
              </p>
            </div>
          </section>
        )}

        {/* ════ PENDING — request submitted, 24h countdown ════ */}
        {status === 'pending' && (
          <section className="rounded-2xl border border-amber-500/30 bg-amber-50/50 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600">Žádost se schvaluje</p>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Vaše B2B žádost je na cestě.
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Firemní údaje jsme přijali a ověřujeme je. Schválení obvykle stihneme do 24 hodin v pracovní dny —
              jakmile bude hotovo, uvidíte zde velkoobchodní ceny a odemknou se feed i dropshipping.
            </p>
            {requestedAt && (
              <div className="mt-5 inline-flex flex-col rounded-xl border border-amber-500/30 bg-white px-5 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Odhadované schválení za</span>
                <Countdown from={requestedAt} />
              </div>
            )}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {B2B_BENEFITS.slice(0, 3).map((b) => (
                <div key={b.t} className="flex gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={3} />
                  <span className="font-medium text-foreground">{b.t}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ════ APPROVED — commercial terms summary ════ */}
        {status === 'approved' && (
          <Card icon={BadgePercent} eyebrow="Obchodní podmínky" title="Vaše velkoobchodní podmínky"
            desc="Spravuje váš account manager — pro úpravu nás kontaktujte.">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-zinc-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sleva</p>
                <p className="font-display text-2xl font-black tracking-tight text-foreground">{profile?.base_discount ?? 0} %</p>
              </div>
              <div className="rounded-xl border border-border bg-zinc-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Platba</p>
                <p className="font-display text-base font-black tracking-tight text-foreground mt-1">{PAYMENT_LABEL[profile?.payment_terms ?? 'prepaid']}</p>
              </div>
              <div className="rounded-xl border border-border bg-zinc-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Kreditní limit</p>
                <p className="font-display text-2xl font-black tracking-tight text-foreground">
                  {(profile?.credit_limit ?? 0).toLocaleString('cs')} €
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ════ COMPANY DETAILS — editable for approved & pending ════ */}
        {status !== 'plain' && (
          <>
            <Card icon={Building2} eyebrow="Firma" title="Firemní údaje">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Název firmy">
                  <Input value={form.company_name} onChange={set('company_name')} className="h-10" />
                </Field>
                <Field label="IČO">
                  <Input value={form.ico} disabled className="h-10 bg-zinc-50 text-muted-foreground" />
                </Field>
                <Field label="DIČ">
                  <Input value={form.vat_id} onChange={set('vat_id')} placeholder="CZ12345678" className="h-10" />
                </Field>
                <Field label="Země">
                  <select value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                </Field>
              </div>
            </Card>

            <Card icon={User} eyebrow="Kontakt" title="Kontaktní osoba">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Jméno a příjmení">
                  <Input value={form.contact_name} onChange={set('contact_name')} placeholder="Jan Novák" className="h-10" />
                </Field>
                <Field label="Telefon">
                  <Input value={form.phone} onChange={set('phone')} placeholder="+420 777 123 456" className="h-10" />
                </Field>
              </div>
            </Card>

            <Card icon={MapPin} eyebrow="Adresa" title="Doručovací / fakturační adresa">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Ulice a č.p.">
                    <Input value={form.address_street} onChange={set('address_street')} placeholder="Příkladná 123" className="h-10" />
                  </Field>
                </div>
                <Field label="Město">
                  <Input value={form.address_city} onChange={set('address_city')} placeholder="Praha" className="h-10" />
                </Field>
                <Field label="PSČ">
                  <Input value={form.address_zip} onChange={set('address_zip')} placeholder="110 00" className="h-10" />
                </Field>
              </div>
            </Card>

            {status === 'approved' && (
              <Card icon={Store} eyebrow="Dropshipping" title="Branding e-shopu"
                desc="Pod tímto jménem a logem odesíláme dropshipping zásilky vašim zákazníkům.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Název obchodu">
                    <Input value={form.brand_name} onChange={set('brand_name')} placeholder="Váš e-shop" className="h-10" />
                  </Field>
                  <Field label="URL loga">
                    <Input value={form.brand_logo_url} onChange={set('brand_logo_url')} placeholder="https://…/logo.png" className="h-10" />
                  </Field>
                </div>
              </Card>
            )}
          </>
        )}

        {/* ════ NOTIFICATIONS ════ */}
        <Card icon={Bell} eyebrow="Notifikace" title="E-mailová upozornění">
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <span>
                <span className="block text-sm font-medium text-foreground">Novinky a DEAL nabídky</span>
                <span className="block text-xs text-muted-foreground">Akční výprodeje, nové značky a exkluzivní nabídky.</span>
              </span>
              <Switch checked={profile?.notify_offers ?? true} onCheckedChange={(v) => toggleNotify('notify_offers', v)} />
            </label>
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <span>
                <span className="block text-sm font-medium text-foreground">Stav objednávek</span>
                <span className="block text-xs text-muted-foreground">Potvrzení, expedice a sledování zásilek.</span>
              </span>
              <Switch checked={profile?.notify_orders ?? true} onCheckedChange={(v) => toggleNotify('notify_orders', v)} />
            </label>
          </div>
        </Card>

        {/* ════ DEAL WATCHDOGY ════ */}
        <AlertsCard />

        {/* ════ LANGUAGE ════ */}
        <Card icon={Globe} eyebrow="Jazyk" title="Jazyk rozhraní">
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="h-10 w-full sm:w-64 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {ALL_LANGS.map((l) => <option key={l} value={l}>{langNames[l]}</option>)}
          </select>
        </Card>

        {/* ════ E-MAILY ════ */}
        <Card icon={Mail} eyebrow="E-maily" title="E-mailové adresy"
          desc="Přihlašovací e-mail slouží k přihlášení. Hlavní e-mail (✓) vidí náš tým a chodí na něj notifikace.">
          {/* Přihlašovací e-mail — lze změnit (pošle se potvrzovací odkaz) */}
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-semibold text-foreground">Přihlašovací e-mail</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap cursor-pointer">
                <input type="radio" name="primaryEmail" checked={isPrimaryEmail(null)} onChange={() => setPrimaryEmail(null)} />
                Hlavní
              </label>
              <Input type="email" value={emailForm} onChange={(e) => setEmailForm(e.target.value)} className="h-10 flex-1" />
              <Button
                variant="outline"
                onClick={handleChangeEmail}
                disabled={emailSaving || !emailForm.trim() || emailForm.trim().toLowerCase() === (user.email ?? '').toLowerCase()}
                className="h-10 gap-2 shrink-0"
              >
                {emailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Změnit
              </Button>
            </div>
          </div>

          {/* Další kontaktní e-maily */}
          <div className="mt-6 space-y-2 max-w-xl">
            <p className="text-xs font-semibold text-foreground">Další kontaktní e-maily</p>
            {contactEmails.length === 0 && (
              <p className="text-xs text-muted-foreground">Zatím žádné další e-maily.</p>
            )}
            {contactEmails.map((em) => (
              <div key={em} className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap cursor-pointer">
                  <input type="radio" name="primaryEmail" checked={isPrimaryEmail(em)} onChange={() => setPrimaryEmail(em)} />
                  Hlavní
                </label>
                <span className="flex-1 truncate text-sm">{em}</span>
                <Button variant="ghost" size="icon" onClick={() => removeContactEmail(em)} className="h-8 w-8 text-destructive shrink-0" title="Odebrat">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center pt-1">
              <Input
                type="email"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addContactEmail(); } }}
                placeholder="dalsi@email.cz"
                className="h-10 flex-1"
              />
              <Button variant="outline" onClick={addContactEmail} disabled={contactSaving || !newContact.trim()} className="h-10 gap-2 shrink-0">
                {contactSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Přidat e-mail
              </Button>
            </div>
          </div>
        </Card>

        {/* ════ SECURITY ════ */}
        <Card icon={Lock} eyebrow="Zabezpečení" title="Změna hesla">
          <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
            <Field label="Nové heslo">
              <PasswordInput value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} placeholder="alespoň 6 znaků" className="h-10" />
            </Field>
            <Field label="Heslo znovu">
              <PasswordInput value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} placeholder="zopakujte heslo" className="h-10" />
            </Field>
          </div>
          <Button variant="outline" onClick={handlePassword} disabled={pwSaving || !pw.next} className="mt-4 gap-2">
            {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Změnit heslo
          </Button>
        </Card>

        {/* ════ SIGN OUT ════ */}
        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={async () => { await signOut(); navigate('/'); }} className="gap-2 text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4" /> Odhlásit se
          </Button>
        </div>
      </div>

      {/* ── Sticky save bar (only when profile fields are dirty, not for plain accounts) ── */}
      {status !== 'plain' && dirty && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
            <p className="text-sm text-muted-foreground">Máte neuložené změny.</p>
            <Button onClick={handleSave} disabled={saving} className="gap-2 px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Uložit změny
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
