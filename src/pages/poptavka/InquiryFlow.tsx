import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Check, Mail, Watch, SlidersHorizontal, User, ClipboardCheck,
  Pencil, MessageCircle, UserCheck, LogIn, X,
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { LuxuryWatchSearch } from '@/components/luxury/LuxuryWatchSearch';
import { useInquiry } from '@/lib/useInquiry';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStore } from '@/lib/store';

const BUDGET_CHIPS = ['do 5 000 €', '5 000 – 15 000 €', '15 000 – 40 000 €', '40 000 € a více', 'Poradím se'];

const STEPS = [
  { slug: 'vyber',   label: 'Modely',    icon: Watch,             title: 'Co byste si přáli?',      help: 'Vyberte modely z katalogu prémiových domů, nebo napište jakoukoliv referenci — dohledáme cokoliv jako na Chrono24.' },
  { slug: 'detaily', label: 'Upřesnění', icon: SlidersHorizontal, title: 'Upřesněte své přání',     help: 'Nepovinné — pomůže nám připravit přesnější nabídku. Vše můžete nechat na nás.' },
  { slug: 'kontakt', label: 'Kontakt',   icon: User,              title: 'Kam pošleme nabídku?',    help: 'Ozveme se do 48 hodin se závaznou nabídkou. Žádný spam, žádný závazek.' },
  { slug: 'souhrn',  label: 'Odeslání',  icon: ClipboardCheck,    title: 'Zkontrolujte a odešlete', help: 'Projděte si shrnutí. Cokoliv můžete ještě upravit kliknutím na „Upravit".' },
] as const;

const SLUGS: string[] = STEPS.map((s) => s.slug);

export default function InquiryFlow() {
  const { step: stepParam } = useParams();
  const navigate = useNavigate();
  const { watches, form, addWatch, setWatches, patchForm, reset } = useInquiry();
  const { user, profile } = useAuthContext();
  const openAuthModal = useStore((s) => s.openAuthModal);

  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [contactMode, setContactMode] = useState<'saved' | 'manual'>('manual');

  const isDone = stepParam === 'odeslano';
  const stepIdx = SLUGS.indexOf(stepParam ?? '');
  const total = STEPS.length;

  useEffect(() => { window.scrollTo(0, 0); }, [stepParam]);

  // Saved profile contact — pre-fills the contact step for signed-in customers.
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

  // Guard: invalid slug, or reaching a later step without a selection.
  useEffect(() => {
    if (isDone) return;
    if (stepIdx < 0) { navigate('/poptavka/vyber', { replace: true }); return; }
    if (stepIdx > 0 && watches.length === 0) navigate('/poptavka/vyber', { replace: true });
  }, [stepIdx, isDone, watches.length, navigate]);

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

  /* ── Success page ── */
  if (isDone) {
    return (
      <FlowShell stepIdx={total} hideFooter>
        <div className="py-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">Poptávka je připravená</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">
            Děkujeme{form.name ? `, ${form.name.split(' ')[0]}` : ''}. Ozveme se{form.email ? <> na <strong>{form.email}</strong></> : null} do 48 hodin
            se závaznou nabídkou. Pro okamžité odeslání můžete poptávku poslat i e-mailem.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={buildMailto()}>
              <Button size="lg" className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800">
                <Mail className="h-4 w-4" /> Otevřít v e-mailu
              </Button>
            </a>
            <Button size="lg" variant="outline" onClick={() => { reset(); navigate('/prestige'); }}>
              Zpět na prémiový segment
            </Button>
          </div>
        </div>
      </FlowShell>
    );
  }

  if (stepIdx < 0) return null; // guard effect will redirect

  const current = STEPS[stepIdx];

  function validate(): boolean {
    if (stepIdx !== 2) return true;
    const e: typeof errors = {};
    const usingSaved = contactMode === 'saved' && !!savedContact;
    if (!usingSaved && !form.name.trim()) e.name = 'Zadejte prosím jméno';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Zadejte platný e-mail';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() {
    if (stepIdx === 0 && watches.length === 0) return;
    if (!validate()) return;
    if (stepIdx === total - 1) { navigate('/poptavka/odeslano'); return; }
    navigate(`/poptavka/${SLUGS[stepIdx + 1]}`);
  }
  function goBack() {
    if (stepIdx === 0) { navigate('/prestige'); return; }
    navigate(`/poptavka/${SLUGS[stepIdx - 1]}`);
  }

  function addConsult() {
    addWatch({ id: 'custom-konzultace', brand: 'Konzultace', model: 'Poradenství s výběrem', from: null, custom: true });
  }
  function useSavedContact() {
    if (!savedContact) return;
    patchForm({ name: savedContact.name, email: savedContact.email, phone: savedContact.phone });
    setErrors({});
    setContactMode('saved');
  }

  return (
    <FlowShell
      stepIdx={stepIdx}
      footer={
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 sm:px-6">
          <Button variant="ghost" onClick={goBack} className="gap-2 text-zinc-600 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" /> {stepIdx === 0 ? 'Zpět na nabídku' : 'Zpět'}
          </Button>
          {stepIdx < total - 1 ? (
            <Button onClick={goNext} disabled={stepIdx === 0 && watches.length === 0} className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40">
              Pokračovat <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={goNext} size="lg" className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800">
              Odeslat nezávaznou poptávku <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      }
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-400">Krok {stepIdx + 1} ze {total}</p>
      <h1 className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl">{current.title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">{current.help}</p>

      <div className="mt-8">
        {/* Step 1 — models */}
        {stepIdx === 0 && (
          <div>
            <LuxuryWatchSearch selected={watches} onChange={setWatches} variant="hero" />
            {watches.length === 0 && (
              <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 px-4 py-4 text-center">
                <p className="text-sm text-zinc-500">Ještě nemáte vybraný žádný model.</p>
                <button type="button" onClick={addConsult} className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 underline-offset-2 hover:underline">
                  <MessageCircle className="h-4 w-4" /> Nevím přesně — chci poradit
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2 — details */}
        {stepIdx === 1 && (
          <div className="space-y-7">
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
              <label className="mb-1.5 block text-sm font-medium" htmlFor="f-note">Poznámka <span className="text-zinc-400">(reference, barva, rok výroby…)</span></label>
              <textarea id="f-note" rows={4} value={form.note} onChange={(e) => patchForm({ note: e.target.value })}
                placeholder="Např. Rolex Submariner Date 126610LN, nepoužité, s dokumentací…"
                className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10" />
            </div>
          </div>
        )}

        {/* Step 3 — contact */}
        {stepIdx === 2 && (
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
                    <label className="mb-1.5 block text-sm font-medium" htmlFor="f-name">Jméno a příjmení</label>
                    <input id="f-name" type="text" value={form.name} onChange={(e) => { patchForm({ name: e.target.value }); setErrors((p) => ({ ...p, name: undefined })); }}
                      placeholder="Jan Novák" autoComplete="name"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-zinc-900/10 ${errors.name ? 'border-red-400' : 'border-zinc-300 focus:border-zinc-900'}`} />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium" htmlFor="f-email">E-mail</label>
                    <input id="f-email" type="email" value={form.email} onChange={(e) => { patchForm({ email: e.target.value }); setErrors((p) => ({ ...p, email: undefined })); }}
                      placeholder="jan@email.cz" autoComplete="email"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-zinc-900/10 ${errors.email ? 'border-red-400' : 'border-zinc-300 focus:border-zinc-900'}`} />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="f-phone">Telefon <span className="text-zinc-400">(nepovinné)</span></label>
                  <input id="f-phone" type="tel" value={form.phone} onChange={(e) => patchForm({ phone: e.target.value })}
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

        {/* Step 4 — review */}
        {stepIdx === 3 && (
          <div className="space-y-3">
            <ReviewRow label="Modely" onEdit={() => navigate('/poptavka/vyber')}>
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
            <ReviewRow label="Rozpočet" onEdit={() => navigate('/poptavka/detaily')}>
              <span className="text-sm text-zinc-700">{form.budget || <span className="text-zinc-400">Neuvedeno</span>}</span>
            </ReviewRow>
            {form.note && (
              <ReviewRow label="Poznámka" onEdit={() => navigate('/poptavka/detaily')}>
                <span className="text-sm text-zinc-700">{form.note}</span>
              </ReviewRow>
            )}
            <ReviewRow label="Kontakt" onEdit={() => navigate('/poptavka/kontakt')}>
              <span className="text-sm text-zinc-700">{form.name} · {form.email}{form.phone ? ` · ${form.phone}` : ''}</span>
            </ReviewRow>
          </div>
        )}
      </div>
    </FlowShell>
  );
}

/* ── Full-screen shell (top bar + progress + content + sticky footer) ── */
function FlowShell({
  children, stepIdx, footer, hideFooter,
}: { children: React.ReactNode; stepIdx: number; footer?: React.ReactNode; hideFooter?: boolean }) {
  const total = STEPS.length;
  const pct = Math.min(100, ((stepIdx + 1) / total) * 100);
  return (
    <div className="flex min-h-screen flex-col bg-[#fafaf8] text-zinc-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/prestige" className="flex items-center gap-1 font-display text-lg font-black tracking-tight">
            <img src={logo} alt="swelt" className="h-6 w-auto" />
          </Link>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-400">Nezávazná poptávka</span>
          <Link to="/prestige" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
            <X className="h-4 w-4" /> <span className="hidden sm:inline">Zavřít</span>
          </Link>
        </div>
        {/* Progress */}
        <div className="h-0.5 w-full bg-zinc-100">
          <div className="h-full bg-zinc-900 transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
        </div>
        {/* Stepper */}
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-1 px-4 py-3 sm:px-6">
          {STEPS.map((s, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            const Icon = s.icon;
            return (
              <div key={s.slug} className="flex flex-1 items-center gap-2">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                  active ? 'border-zinc-900 bg-zinc-900 text-white'
                  : done ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-zinc-300 bg-white text-zinc-400'
                }`}>
                  {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </span>
                <span className={`hidden text-xs font-medium sm:block ${active ? 'text-zinc-900' : 'text-zinc-400'}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">{children}</div>
      </main>

      {/* Sticky footer nav */}
      {!hideFooter && (
        <footer className="sticky bottom-0 z-30 border-t border-zinc-200 bg-white/95 py-4 backdrop-blur">
          {footer}
        </footer>
      )}
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
