import { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react';
import {
  ArrowRight, ArrowLeft, Check, Mail, Watch, SlidersHorizontal, User, ClipboardCheck,
  Pencil, MessageCircle, UserCheck, LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LuxuryWatchSearch } from '@/components/luxury/LuxuryWatchSearch';
import { useInquiry } from '@/lib/useInquiry';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStore } from '@/lib/store';

const display: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

const BUDGET_CHIPS = ['do 5 000 €', '5 000 – 15 000 €', '15 000 – 40 000 €', '40 000 € a více', 'Poradím se'];

const STEPS = [
  { label: 'Modely',    icon: Watch,             title: 'Zvolte model svých hodinek', help: 'Vyberte modely z katalogu prémiových domů, nebo napište jakoukoliv referenci — dohledáme cokoliv jako na Chrono24.' },
  { label: 'Upřesnění', icon: SlidersHorizontal, title: 'Upřesněte své přání',     help: 'Nepovinné — pomůže nám připravit přesnější nabídku.' },
  { label: 'Kontakt',   icon: User,              title: 'Kam pošleme nabídku?',    help: 'Ozveme se do 48 hodin se závaznou nabídkou. Žádný spam, žádný závazek.' },
  { label: 'Odeslání',  icon: ClipboardCheck,    title: 'Zkontrolujte a odešlete', help: 'Projděte si shrnutí. Cokoliv můžete ještě upravit.' },
] as const;

export interface LuxuryInquiryCardHandle {
  /** Jump to step 1 (the model search) — used by the carousel "Poptat" CTA. */
  focusModels: () => void;
}

/**
 * The inquiry IS the search card. It starts as a model search and then expands
 * in place through the remaining steps (details → contact → review) without ever
 * navigating away — the customer never feels like they leave the page.
 */
export const LuxuryInquiryCard = forwardRef<LuxuryInquiryCardHandle>((_props, ref) => {
  const { watches, form, addWatch, setWatches, patchForm, reset } = useInquiry();
  const { user, profile } = useAuthContext();
  const openAuthModal = useStore((s) => s.openAuthModal);

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [contactMode, setContactMode] = useState<'saved' | 'manual'>('manual');
  const total = STEPS.length;

  useImperativeHandle(ref, () => ({ focusModels: () => setStep(0) }));

  const savedContact = useMemo(() => {
    if (!user) return null;
    const name = profile?.contact_name?.trim() || profile?.company_name?.trim() || '';
    const email = user.email || profile?.primary_contact_email || profile?.contact_emails?.[0] || '';
    const phone = profile?.phone || '';
    if (!email && !name) return null;
    return { name, email, phone };
  }, [user, profile]);

  const applied = useRef(false);
  useEffect(() => {
    if (savedContact && !applied.current) {
      applied.current = true;
      patchForm({ name: savedContact.name, email: savedContact.email, phone: savedContact.phone });
      setContactMode('saved');
    }
  }, [savedContact, patchForm]);

  function buildMailto(): string {
    const lines = [
      `Jméno: ${form.name}`, `E-mail: ${form.email}`,
      form.phone ? `Telefon: ${form.phone}` : '',
      form.budget ? `Rozpočet: ${form.budget}` : '', '',
      'Poptávané modely:',
      ...(watches.length ? watches.map((w) => `• ${w.brand} ${w.model}${w.from ? ` (od ${w.from.toLocaleString('cs')} €)` : ''}`) : ['(neuvedeno)']),
      '', form.note ? `Poznámka: ${form.note}` : '',
    ].filter(Boolean);
    return `mailto:info@swelt.cz?subject=${encodeURIComponent('Poptávka — prémiový segment')}&body=${encodeURIComponent(lines.join('\n'))}`;
  }

  function validateContact(): boolean {
    const e: typeof errors = {};
    const usingSaved = contactMode === 'saved' && !!savedContact;
    if (!usingSaved && !form.name.trim()) e.name = 'Zadejte prosím jméno';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Zadejte platný e-mail';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (step === 0 && watches.length === 0) return;
    if (step === 2 && !validateContact()) return;
    setStep((s) => Math.min(total - 1, s + 1));
  }
  function back() { setStep((s) => Math.max(0, s - 1)); }
  function submit() { if (!validateContact()) { setStep(2); return; } setSubmitted(true); }
  function startOver() { reset(); setSubmitted(false); setStep(0); setContactMode(savedContact ? 'saved' : 'manual'); }

  function addConsult() {
    addWatch({ id: 'custom-konzultace', brand: 'Konzultace', model: 'Poradenství s výběrem', from: null, custom: true });
  }
  function useSavedContact() {
    if (!savedContact) return;
    patchForm({ name: savedContact.name, email: savedContact.email, phone: savedContact.phone });
    setErrors({}); setContactMode('saved');
  }

  /* ── Success ── */
  if (submitted) {
    return (
      <CardShell>
        <div className="px-5 py-10 text-center sm:px-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-medium tracking-tight" style={display}>Poptávka je připravená</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            Děkujeme{form.name ? `, ${form.name.split(' ')[0]}` : ''}. Ozveme se{form.email ? <> na <strong>{form.email}</strong></> : null} do 48 hodin se závaznou nabídkou.
            Pro okamžité odeslání můžete poptávku poslat i e-mailem.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={buildMailto()}>
              <Button className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800"><Mail className="h-4 w-4" /> Otevřít v e-mailu</Button>
            </a>
            <Button variant="outline" onClick={startOver}>Nová poptávka</Button>
          </div>
        </div>
      </CardShell>
    );
  }

  const current = STEPS[step];

  return (
    <CardShell progress={((step + 1) / total) * 100}>
      {/* Header: step title + stepper dots */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-7 sm:pt-6">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-400">Krok {step + 1} ze {total}</p>
          <h3 className="mt-0.5 truncate text-xl font-medium tracking-tight sm:text-2xl" style={display}>{current.title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-1">
          {STEPS.map((s, i) => {
            const done = i < step; const active = i === step; const Icon = s.icon;
            return (
              <button
                key={s.label} type="button"
                onClick={() => { if (i <= step) setStep(i); }}
                disabled={i > step}
                aria-label={s.label}
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] transition-colors ${
                  active ? 'border-zinc-900 bg-zinc-900 text-white'
                  : done ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-zinc-200 bg-white text-zinc-300'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      <p className="px-5 pt-2 text-sm leading-relaxed text-zinc-500 sm:px-7">{current.help}</p>

      {/* Body — changes per step */}
      <div key={step} className="animate-fade-in px-5 pb-2 pt-4 sm:px-7">
        {step === 0 && (
          <div>
            <LuxuryWatchSearch variant="hero" selected={watches} onChange={setWatches}
              placeholder="Hledejte jakýkoliv model — Rolex Submariner, Patek Nautilus…" />
            {watches.length === 0 && (
              <button type="button" onClick={addConsult}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline">
                <MessageCircle className="h-4 w-4" /> Nevím přesně — chci poradit
              </button>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">Orientační rozpočet <span className="text-zinc-400">(nepovinné)</span></label>
              <div className="flex flex-wrap gap-2">
                {BUDGET_CHIPS.map((b) => {
                  const on = form.budget === b;
                  return (
                    <button key={b} type="button" onClick={() => patchForm({ budget: on ? '' : b })}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${on ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'}`}>
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="c-note">Poznámka <span className="text-zinc-400">(reference, barva, rok…)</span></label>
              <textarea id="c-note" rows={3} value={form.note} onChange={(e) => patchForm({ note: e.target.value })}
                placeholder="Např. Rolex Submariner Date 126610LN, nepoužité, s dokumentací…"
                className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {savedContact && contactMode === 'saved' ? (
              <div>
                <div className="flex items-start gap-3 rounded-xl border border-zinc-900/15 bg-zinc-50 p-4 ring-1 ring-zinc-900/5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white"><UserCheck className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Přihlášeni — kontakt z profilu</p>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    {savedContact.name && <p className="truncate text-sm font-semibold text-zinc-900">{savedContact.name}</p>}
                    <p className="truncate text-sm text-zinc-600">{savedContact.email}</p>
                    {savedContact.phone && <p className="truncate text-sm text-zinc-600">{savedContact.phone}</p>}
                  </div>
                </div>
                <button type="button" onClick={() => setContactMode('manual')} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline">
                  <Pencil className="h-3.5 w-3.5" /> Použít jiný kontakt
                </button>
              </div>
            ) : (
              <>
                {!user && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                    <p className="text-sm text-zinc-600">Máte u nás účet? Přihlaste se a kontakt vyplníme za vás.</p>
                    <button type="button" onClick={() => openAuthModal('login')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                      <LogIn className="h-4 w-4" /> Přihlásit se
                    </button>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium" htmlFor="c-name">Jméno a příjmení</label>
                    <input id="c-name" type="text" value={form.name} onChange={(e) => { patchForm({ name: e.target.value }); setErrors((p) => ({ ...p, name: undefined })); }}
                      placeholder="Jan Novák" autoComplete="name"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-zinc-900/10 ${errors.name ? 'border-red-400' : 'border-zinc-300 focus:border-zinc-900'}`} />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium" htmlFor="c-email">E-mail</label>
                    <input id="c-email" type="email" value={form.email} onChange={(e) => { patchForm({ email: e.target.value }); setErrors((p) => ({ ...p, email: undefined })); }}
                      placeholder="jan@email.cz" autoComplete="email"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-zinc-900/10 ${errors.email ? 'border-red-400' : 'border-zinc-300 focus:border-zinc-900'}`} />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="c-phone">Telefon <span className="text-zinc-400">(nepovinné)</span></label>
                  <input id="c-phone" type="tel" value={form.phone} onChange={(e) => patchForm({ phone: e.target.value })}
                    placeholder="+420 …" autoComplete="tel"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10" />
                </div>
                {savedContact && (
                  <button type="button" onClick={useSavedContact} className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline">
                    <UserCheck className="h-3.5 w-3.5" /> Použít uložený kontakt
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <ReviewRow label="Modely" onEdit={() => setStep(0)}>
              {watches.length ? (
                <ul className="space-y-1">
                  {watches.map((w) => (
                    <li key={w.id} className="text-sm text-zinc-700">
                      <span className="font-medium">{w.brand}</span> {w.model}
                      {w.from ? <span className="text-zinc-400"> · od {w.from.toLocaleString('cs')} €</span> : null}
                    </li>
                  ))}
                </ul>
              ) : <span className="text-sm text-zinc-400">Neuvedeno</span>}
            </ReviewRow>
            <ReviewRow label="Rozpočet" onEdit={() => setStep(1)}>
              <span className="text-sm text-zinc-700">{form.budget || <span className="text-zinc-400">Neuvedeno</span>}</span>
            </ReviewRow>
            {form.note && (
              <ReviewRow label="Poznámka" onEdit={() => setStep(1)}>
                <span className="text-sm text-zinc-700">{form.note}</span>
              </ReviewRow>
            )}
            <ReviewRow label="Kontakt" onEdit={() => setStep(2)}>
              <span className="text-sm text-zinc-700">{form.name} · {form.email}{form.phone ? ` · ${form.phone}` : ''}</span>
            </ReviewRow>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="mt-2 flex items-center justify-between gap-3 border-t border-zinc-100 px-5 py-4 sm:px-7">
        {step > 0 ? (
          <Button variant="ghost" onClick={back} className="gap-2 text-zinc-600 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" /> Zpět
          </Button>
        ) : <span className="text-xs text-zinc-400">Nezávazné · odpověď do 48 h</span>}

        {step < total - 1 ? (
          <Button onClick={next} disabled={step === 0 && watches.length === 0} className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40">
            {step === 0 ? `Pokračovat k poptávce${watches.length ? ` (${watches.length})` : ''}` : 'Pokračovat'} <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={submit} size="lg" className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800">
            Odeslat poptávku <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </CardShell>
  );
});
LuxuryInquiryCard.displayName = 'LuxuryInquiryCard';

/* ── Card wrapper with optional top progress bar ── */
function CardShell({ children, progress }: { children: React.ReactNode; progress?: number }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)]">
      {progress != null && (
        <div className="h-1 w-full overflow-hidden rounded-t-3xl bg-zinc-100">
          <div className="h-full bg-zinc-900 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      )}
      {children}
    </div>
  );
}

function ReviewRow({ label, onEdit, children }: { label: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
        {children}
      </div>
      <button type="button" onClick={onEdit} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900">
        <Pencil className="h-3 w-3" /> Upravit
      </button>
    </div>
  );
}
