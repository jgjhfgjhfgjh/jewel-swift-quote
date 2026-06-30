import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowRight, ArrowLeft, Check, Mail, Watch, SlidersHorizontal, User, ClipboardCheck,
  Pencil, MessageCircle, UserCheck, LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LuxuryWatchSearch, type SelectedWatch } from '@/components/luxury/LuxuryWatchSearch';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStore } from '@/lib/store';

const display: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

const BUDGET_CHIPS = ['do 5 000 €', '5 000 – 15 000 €', '15 000 – 40 000 €', '40 000 € a více', 'Poradím se'];

const STEPS = [
  { key: 'models',  label: 'Modely',     icon: Watch,             title: 'Co byste si přáli?',        help: 'Vyberte modely z katalogu prémiových domů, nebo napište jakoukoliv referenci — dohledáme cokoliv jako na Chrono24.' },
  { key: 'detail',  label: 'Upřesnění',  icon: SlidersHorizontal, title: 'Upřesněte své přání',       help: 'Nepovinné — pomůže nám připravit přesnější nabídku. Vše můžete nechat na nás.' },
  { key: 'contact', label: 'Kontakt',    icon: User,              title: 'Kam pošleme nabídku?',      help: 'Ozveme se do 48 hodin se závaznou nabídkou. Žádný spam, žádný závazek.' },
  { key: 'review',  label: 'Odeslání',   icon: ClipboardCheck,    title: 'Zkontrolujte a odešlete',   help: 'Projděte si shrnutí. Cokoliv můžete ještě upravit kliknutím na „Upravit".' },
] as const;

interface FormState { name: string; email: string; phone: string; note: string; budget: string; }

interface Props {
  watches: SelectedWatch[];
  onWatchesChange: (next: SelectedWatch[]) => void;
}

export function LuxuryInquiryWizard({ watches, onWatchesChange }: Props) {
  const { user, profile } = useAuthContext();
  const openAuthModal = useStore((s) => s.openAuthModal);

  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', note: '', budget: '' });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);
  /** 'saved' = use the signed-in profile contact; 'manual' = type a different one. */
  const [contactMode, setContactMode] = useState<'saved' | 'manual'>('manual');

  const total = STEPS.length;

  // Contact saved on the signed-in profile — used to pre-fill so logged-in
  // customers never re-type what we already know.
  const savedContact = useMemo(() => {
    if (!user) return null;
    const name = profile?.contact_name?.trim() || profile?.company_name?.trim() || '';
    const email = user.email || profile?.primary_contact_email || profile?.contact_emails?.[0] || '';
    const phone = profile?.phone || '';
    if (!email && !name) return null;
    return { name, email, phone };
  }, [user, profile]);

  // Pre-fill once from the profile and default to the "use saved contact" mode.
  const applied = useRef(false);
  useEffect(() => {
    if (savedContact && !applied.current) {
      applied.current = true;
      setForm((p) => ({ ...p, name: savedContact.name, email: savedContact.email, phone: savedContact.phone }));
      setContactMode('saved');
    }
  }, [savedContact]);

  function useSavedContact() {
    if (!savedContact) return;
    setForm((p) => ({ ...p, name: savedContact.name, email: savedContact.email, phone: savedContact.phone }));
    setErrors((p) => ({ ...p, name: undefined, email: undefined }));
    setContactMode('saved');
  }

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  }

  function goTo(target: number) {
    if (target <= maxReached) { setStep(target); }
  }

  function validateStep(s: number): boolean {
    const e: Partial<FormState> = {};
    if (s === 2) {
      // In "saved" mode the contact comes verbatim from the profile — only the
      // e-mail is essential. Manual mode validates both fields.
      const usingSaved = contactMode === 'saved' && !!savedContact;
      if (!usingSaved && !form.name.trim()) e.name = 'Zadejte prosím jméno';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Zadejte platný e-mail';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (step === 0 && watches.length === 0) return; // guarded by disabled button
    if (!validateStep(step)) return;
    const n = Math.min(total - 1, step + 1);
    setStep(n);
    setMaxReached((m) => Math.max(m, n));
  }
  function back() { setStep((s) => Math.max(0, s - 1)); }

  function addConsult() {
    const id = 'custom-konzultace';
    if (!watches.some((w) => w.id === id)) {
      onWatchesChange([...watches, { id, brand: 'Konzultace', model: 'Poradenství s výběrem', from: null, custom: true }]);
    }
    const n = 1;
    setStep(n);
    setMaxReached((m) => Math.max(m, n));
  }

  function buildMailto(): string {
    const lines = [
      `Jméno: ${form.name}`,
      `E-mail: ${form.email}`,
      form.phone ? `Telefon: ${form.phone}` : '',
      form.budget ? `Rozpočet: ${form.budget}` : '',
      '',
      'Poptávané modely:',
      ...(watches.length
        ? watches.map((w) => `• ${w.brand} ${w.model}${w.from ? ` (od ${w.from.toLocaleString('cs')} €)` : ''}`)
        : ['(neuvedeno)']),
      '',
      form.note ? `Poznámka: ${form.note}` : '',
    ].filter(Boolean);
    return `mailto:info@swelt.cz?subject=${encodeURIComponent('Poptávka — prémiový segment')}&body=${encodeURIComponent(lines.join('\n'))}`;
  }

  function submit() {
    if (!validateStep(2)) { setStep(2); return; }
    setSubmitted(true);
  }

  function reset() {
    setSubmitted(false);
    setStep(0);
    setMaxReached(0);
    setForm({ name: '', email: '', phone: '', note: '', budget: '' });
    onWatchesChange([]);
  }

  /* ── Success ── */
  if (submitted) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="py-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="mb-2 text-2xl font-medium" style={display}>Poptávka je připravená</h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-zinc-500">
            Děkujeme, {form.name.split(' ')[0]}. Ozveme se na <strong>{form.email}</strong> do 48 hodin
            se závaznou nabídkou{watches.length ? ` na ${watches.length} ${watches.length === 1 ? 'model' : 'modely'}` : ''}.
            Pro okamžité odeslání můžete poptávku poslat i e-mailem.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={buildMailto()}>
              <Button className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800">
                <Mail className="h-4 w-4" /> Otevřít v e-mailu
              </Button>
            </a>
            <Button variant="outline" onClick={reset}>Nová poptávka</Button>
          </div>
        </div>
      </div>
    );
  }

  const current = STEPS[step];

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Progress bar */}
      <div className="h-1 w-full bg-zinc-100">
        <div
          className="h-full bg-zinc-900 transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between gap-1 border-b border-zinc-100 px-4 py-4 sm:px-8">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          const reachable = i <= maxReached;
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => goTo(i)}
              disabled={!reachable}
              className={`group flex flex-1 items-center gap-2 ${reachable ? 'cursor-pointer' : 'cursor-default'}`}
              aria-current={active ? 'step' : undefined}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                  active ? 'border-zinc-900 bg-zinc-900 text-white'
                  : done ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-zinc-300 bg-white text-zinc-400'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span className="hidden min-w-0 flex-col text-left sm:flex">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Krok {i + 1}</span>
                <span className={`truncate text-xs font-medium ${active ? 'text-zinc-900' : 'text-zinc-500'}`}>{s.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Step body */}
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Krok {step + 1} ze {total}</p>
        <h3 className="mt-1 text-2xl font-medium tracking-tight sm:text-[1.7rem]" style={display}>{current.title}</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">{current.help}</p>

        <div className="mt-6">
          {/* ── Step 0 — models ── */}
          {step === 0 && (
            <div>
              <LuxuryWatchSearch selected={watches} onChange={onWatchesChange} />
              {watches.length === 0 && (
                <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 px-4 py-3 text-center">
                  <p className="text-sm text-zinc-500">Ještě nemáte vybraný žádný model.</p>
                  <button
                    type="button"
                    onClick={addConsult}
                    className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 underline-offset-2 hover:underline"
                  >
                    <MessageCircle className="h-4 w-4" /> Nevím přesně — chci poradit
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Step 1 — detail ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Orientační rozpočet <span className="text-zinc-400">(nepovinné)</span></label>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_CHIPS.map((b) => {
                    const on = form.budget === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => set('budget', on ? '' : b)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          on ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="w-note">
                  Poznámka <span className="text-zinc-400">(reference, barva, rok výroby…)</span>
                </label>
                <textarea
                  id="w-note" rows={4} value={form.note} onChange={(e) => set('note', e.target.value)}
                  placeholder="Např. Rolex Submariner Date 126610LN, nepoužité, s dokumentací…"
                  className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
            </div>
          )}

          {/* ── Step 2 — contact ── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Saved profile contact — shown by default for signed-in customers */}
              {savedContact && contactMode === 'saved' ? (
                <div>
                  <div className="flex items-start gap-3 rounded-xl border border-zinc-900/15 bg-zinc-50 p-4 ring-1 ring-zinc-900/5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
                      <UserCheck className="h-5 w-5" />
                    </span>
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
                  <button
                    type="button"
                    onClick={() => setContactMode('manual')}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Použít jiný kontakt
                  </button>
                </div>
              ) : (
                <>
                  {/* Guest hint — offer login so we can pre-fill */}
                  {!user && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                      <p className="text-sm text-zinc-600">Máte u nás účet? Přihlaste se a kontakt vyplníme za vás.</p>
                      <button
                        type="button"
                        onClick={() => openAuthModal('login')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                      >
                        <LogIn className="h-4 w-4" /> Přihlásit se
                      </button>
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="w-name">Jméno a příjmení</label>
                      <input
                        id="w-name" type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
                        placeholder="Jan Novák" autoComplete="name"
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-zinc-900/10 ${errors.name ? 'border-red-400' : 'border-zinc-300 focus:border-zinc-900'}`}
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="w-email">E-mail</label>
                      <input
                        id="w-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                        placeholder="jan@email.cz" autoComplete="email"
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-zinc-900/10 ${errors.email ? 'border-red-400' : 'border-zinc-300 focus:border-zinc-900'}`}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium" htmlFor="w-phone">Telefon <span className="text-zinc-400">(nepovinné)</span></label>
                    <input
                      id="w-phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                      placeholder="+420 …" autoComplete="tel"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                    />
                  </div>
                  {savedContact && (
                    <button
                      type="button"
                      onClick={useSavedContact}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
                    >
                      <UserCheck className="h-3.5 w-3.5" /> Použít uložený kontakt
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Step 3 — review ── */}
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
                <span className="text-sm text-zinc-700">
                  {form.name} · {form.email}{form.phone ? ` · ${form.phone}` : ''}
                </span>
              </ReviewRow>
            </div>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:px-8">
        {step > 0 ? (
          <Button variant="ghost" onClick={back} className="gap-2 text-zinc-600 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" /> Zpět
          </Button>
        ) : <span />}

        {step < total - 1 ? (
          <Button
            onClick={next}
            disabled={step === 0 && watches.length === 0}
            className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40"
          >
            Pokračovat <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={submit} size="lg" className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800">
            Odeslat nezávaznou poptávku <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
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
