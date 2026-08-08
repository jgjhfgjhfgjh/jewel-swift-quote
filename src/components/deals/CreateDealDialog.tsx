import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import { ArrowLeft, ArrowRight, ArrowUpRight, Plus, X } from 'lucide-react';
import { openSupplierGate } from '@/components/suppliers/SupplierGateDialog';
import { BigDealSupplierLogo } from '@/components/BigDealSupplierLogo';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStore } from '@/lib/store';
import { supplierMailto } from '@/lib/supplierContact';

/**
 * CreateBigDeal — vstup pro toho, kdo chce deal PŘIDAT (vložit svoje zboží),
 * ne koupit. Otevírá se z CTA v navigaci (openCreateDealDialog), dialog je
 * namountovaný jednou v App.tsx.
 *
 * Nepřihlášený projde rozřazením: v jakém stavu je zboží (strategie) a jak
 * velký je lot (velikost). Obojí lze přeskočit — první krok musí být levný,
 * dodavatel nechce hned na začátku vypisovat, co má ve skladu. Podle segmentu
 * se pak liší závěrečný text a mailto pro obchod nese odpověď s sebou.
 *
 * Přihlášený vidí dosavadní poptávku dealu na míru beze změny — samoobslužný
 * sestavovač zatím neexistuje.
 *
 * Vizuál i copy patří do dodavatelského světa (skill
 * `bigdealsupplier-copywriting`): tmavá karta, vlasové linky, mono popisky,
 * hrany 2px, oznamovací způsob. Odběratelská pravidla tu NEPLATÍ.
 */
interface CreateDealState {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const useCreateDealStore = create<CreateDealState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
}));

export function openCreateDealDialog() {
  useCreateDealStore.setState({ open: true });
}

/* ── Segmentace ──────────────────────────────────────────────────────────
   Pět situací odpovídá segmentům na /suppliers — stejná strategie, jen
   posunutá do produktu, takže se dodavatel pozná v obojím stejně.        */
type SituationId = 'pressure' | 'stocked' | 'brand' | 'seasonal' | 'entry';
type SizeId = 'under100' | 'to1k' | 'to10k' | 'over10k';

const SITUATIONS: { id: SituationId; label: string }[] = [
  { id: 'pressure', label: 'Cash is tight and the year is closing.' },
  { id: 'stocked', label: 'The warehouse is full. Cash isn’t the issue.' },
  { id: 'brand', label: 'We’re the brand, and distribution is the point.' },
  { id: 'seasonal', label: 'Fashion stock. Value drops every quarter.' },
  { id: 'entry', label: 'No European distribution yet.' },
];

const SIZES: { id: SizeId; label: string }[] = [
  { id: 'under100', label: 'Under 100 pieces' },
  { id: 'to1k', label: '100 – 1 000 pieces' },
  { id: 'to10k', label: '1 000 – 10 000 pieces' },
  { id: 'over10k', label: 'Over 10 000 pieces' },
];

/** Závěrečná věta podle situace — jiná vrstva argumentů pro každý segment. */
const OUTCOME: Record<SituationId, string> = {
  pressure:
    'We price closeout lots quickly and take them whole. One buyer, one invoice, one shipment — you don’t chase small orders to clear a pallet.',
  stocked:
    'We place stock in a channel that never touches your price list, and report back what it actually sold for.',
  brand:
    'Territory, floor price and channel limits are agreed before a single line goes live. Your name never appears against the lot.',
  seasonal:
    'We take the lot as it stands — mixed references, broken sizes, odd quantities — before the next quarter moves the floor again.',
  entry:
    'You get European retail distribution without a rep or a warehouse on this side. You ship the lot, we hold the small end.',
};

const OUTCOME_SKIPPED =
  'Send the list and we come back with a price and a route. Nothing on your side changes until you accept it.';

/** Doplňková věta podle velikosti lotu. */
const SIZE_NOTE: Record<SizeId, string> = {
  under100: 'Small lots are fine — the network buys from one unit.',
  to1k: 'That size opens as a single deal.',
  to10k: 'We split it across markets so it doesn’t compete with itself.',
  over10k: 'Lots that size get a route per market and a schedule.',
};

const RULE = 'border-[rgba(255,255,255,0.14)]';
const MONO = 'font-plex text-[10px] uppercase tracking-[0.2em]';

/** Řádek volby — vlasová linka, mono index, žádné karty ani stíny. */
function OptionRow({ index, label, onClick }: { index: number; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-4 border-b py-4 text-left transition-colors hover:bg-white/[0.04] ${RULE}`}
    >
      <span className={`${MONO} shrink-0 text-zinc-600 transition-colors group-hover:text-[#B0793F]`}>
        {String(index).padStart(2, '0')}
      </span>
      <span className="flex-1 text-[14px] leading-snug text-zinc-300 transition-colors group-hover:text-white">
        {label}
      </span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:text-white" />
    </button>
  );
}

export function CreateDealDialog() {
  const { open, setOpen } = useCreateDealStore();
  const { user } = useAuthContext();
  const openAuthModal = useStore((s) => s.openAuthModal);
  const navigate = useNavigate();

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [situation, setSituation] = useState<SituationId | null>(null);
  const [size, setSize] = useState<SizeId | null>(null);

  // Každé otevření začíná na prvním kroku — dodavatel se vrací s jiným lotem.
  useEffect(() => {
    if (open) {
      setStep(0);
      setSituation(null);
      setSize(null);
    }
  }, [open]);

  const goToSuppliers = () => {
    setOpen(false);
    openSupplierGate();
  };

  /* ── Přihlášený: poptávka dealu na míru, beze změny ────────────────── */
  if (user) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden rounded-[28px] border-none bg-white p-0 text-zinc-900 sm:max-w-lg sm:rounded-[28px] [&>button]:hidden">
          <div className="px-7 pb-7 pt-9 sm:px-9">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-zinc-600 transition-colors hover:bg-slate-200 hover:text-zinc-900"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <Plus className="h-3 w-3" /> Deal on request
            </span>

            <DialogTitle className="mt-5 font-sans text-2xl font-bold tracking-tight text-zinc-900">
              Missing a deal you would buy?
            </DialogTitle>
            <DialogDescription className="mt-2 text-base leading-relaxed text-zinc-500">
              Tell us the brands and volumes and we go source it.
            </DialogDescription>

            <div className="mt-6 grid gap-2.5">
              {([
                ['01', 'Send us the wish list', 'Brands, references and how many units you can take.'],
                ['02', 'We check availability', 'We go to the concern and come back with a price.'],
                ['03', 'It opens as a GoBigDeal', 'You get first pick before it goes public.'],
              ] as [string, string, string][]).map(([n, title, desc]) => (
                <div
                  key={n}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3
                             shadow-[0_8px_24px_-6px_rgba(15,23,42,0.10),0_2px_6px_rgba(15,23,42,0.05)]"
                >
                  <span className="font-mono text-[11px] font-bold text-slate-300">{n}</span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-zinc-900">{title}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-zinc-500">{desc}</span>
                  </span>
                </div>
              ))}
            </div>

            <a
              href={supplierMailto('CreateBigDeal')}
              onClick={() => setOpen(false)}
              className="mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 text-base font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              Request a deal <ArrowRight className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={goToSuppliers}
              className="group/sup mt-5 flex w-full items-center gap-3 border-t border-slate-100 pt-5 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-zinc-900">Have stock to move instead?</span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  BigDealSupplier — bring closeouts and overstock to European retailers.
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 transition-all group-hover/sup:translate-x-0.5 group-hover/sup:text-zinc-900" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /* ── Nepřihlášený: rozřazení a registrace ──────────────────────────── */

  const situationLabel = SITUATIONS.find((s) => s.id === situation)?.label ?? 'Not stated';
  const sizeLabel = SIZES.find((s) => s.id === size)?.label ?? 'Not stated';

  // Odpovědi jdou s poptávkou — obchod nemusí zjišťovat to samé znovu.
  const mailto = supplierMailto(
    'CreateBigDeal — new supplier',
    `Situation: ${situationLabel}\nLot size: ${sizeLabel}\n\nBrands and quantities:\n`,
  );

  const startRegistration = () => {
    setOpen(false);
    openAuthModal('b2b');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="overflow-hidden rounded-[4px] border border-white/10 p-0 text-[#F3F1EC] sm:max-w-lg sm:rounded-[4px] [&>button]:hidden"
        style={{ backgroundColor: '#111315' }}
      >
        <div className="px-7 pb-8 pt-7 sm:px-9">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-[2px] bg-white/[0.08] text-white transition-colors hover:bg-white/[0.16]"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Hlavička — značka dodavatelského světa a stav postupu */}
          <div className="flex items-center gap-3">
            <BigDealSupplierLogo className="text-sm" />
            <span className={`${MONO} text-zinc-600`}>{step < 2 ? `Step ${step + 1} / 2` : 'Done'}</span>
          </div>

          {step === 0 && (
            <>
              <DialogTitle className="mt-7 font-grotesk text-[1.55rem] font-medium leading-tight tracking-[-0.03em] text-[#F3F1EC]">
                What is the stock doing right now?
              </DialogTitle>
              <DialogDescription className="mt-2.5 text-[14px] leading-relaxed text-zinc-400">
                It decides which desk picks the lot up. Skip anything you would rather not put in
                writing yet.
              </DialogDescription>

              <div className={`mt-7 border-t ${RULE}`}>
                {SITUATIONS.map((s, i) => (
                  <OptionRow
                    key={s.id}
                    index={i + 1}
                    label={s.label}
                    onClick={() => { setSituation(s.id); setStep(1); }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className={`${MONO} mt-5 text-zinc-500 transition-colors hover:text-zinc-300`}
              >
                Rather not say &rarr;
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <DialogTitle className="mt-7 font-grotesk text-[1.55rem] font-medium leading-tight tracking-[-0.03em] text-[#F3F1EC]">
                How big is the lot?
              </DialogTitle>
              <DialogDescription className="mt-2.5 text-[14px] leading-relaxed text-zinc-400">
                A range is enough. It sets the route, not the price.
              </DialogDescription>

              <div className={`mt-7 border-t ${RULE}`}>
                {SIZES.map((s, i) => (
                  <OptionRow
                    key={s.id}
                    index={i + 1}
                    label={s.label}
                    onClick={() => { setSize(s.id); setStep(2); }}
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className={`${MONO} inline-flex items-center gap-1.5 text-zinc-500 transition-colors hover:text-zinc-300`}
                >
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`${MONO} text-zinc-500 transition-colors hover:text-zinc-300`}
                >
                  Not sure yet &rarr;
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <DialogTitle className="mt-7 font-grotesk text-[1.55rem] font-medium leading-tight tracking-[-0.03em] text-[#F3F1EC]">
                That is enough to start.
              </DialogTitle>
              <DialogDescription className="mt-2.5 text-[14px] leading-relaxed text-zinc-400">
                {situation ? OUTCOME[situation] : OUTCOME_SKIPPED}
                {size ? ` ${SIZE_NOTE[size]}` : ''}
              </DialogDescription>

              {/* Rekapitulace odpovědí — dodavatel vidí, co o sobě řekl */}
              <dl className={`mt-7 border-t ${RULE}`}>
                {[['Situation', situationLabel], ['Lot size', sizeLabel]].map(([k, v]) => (
                  <div key={k} className={`flex items-baseline gap-4 border-b py-3.5 ${RULE}`}>
                    <dt className={`${MONO} w-24 shrink-0 text-zinc-600`}>{k}</dt>
                    <dd className="flex-1 text-[13px] leading-snug text-zinc-300">{v}</dd>
                  </div>
                ))}
              </dl>

              <button
                type="button"
                onClick={startRegistration}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-[2px] bg-[#F3F1EC] py-4 text-[13px] font-medium tracking-wide text-[#111315] transition-colors hover:bg-white"
              >
                Create a supplier account <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <p className={`${MONO} mt-3.5 text-center text-zinc-600`}>
                Approved in 24 h &nbsp;·&nbsp; No exclusivity
              </p>

              <div className={`mt-6 flex items-center justify-between border-t pt-5 ${RULE}`}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`${MONO} inline-flex items-center gap-1.5 text-zinc-500 transition-colors hover:text-zinc-300`}
                >
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
                <a
                  href={mailto}
                  onClick={() => setOpen(false)}
                  className={`${MONO} inline-flex items-center gap-1.5 text-zinc-500 transition-colors hover:text-zinc-300`}
                >
                  Send the list by e-mail <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </>
          )}

          {/* Odběratelský svět — pro toho, kdo naopak zboží hledá */}
          {step < 2 && (
            <button
              type="button"
              onClick={() => { setOpen(false); navigate('/deals'); }}
              className={`${MONO} mt-7 flex w-full items-center justify-between border-t pt-5 text-left text-zinc-600 transition-colors hover:text-zinc-400 ${RULE}`}
            >
              Looking to buy instead? Browse the deals
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
