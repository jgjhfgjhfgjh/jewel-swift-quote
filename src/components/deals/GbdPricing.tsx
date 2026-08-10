import { useState, type ReactNode } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Gbd } from '@/components/GoBigDealLogo';

/**
 * Ceník GoBigDeal — sdílený blok pro homepage (#gbd-pricing v HomeTopDeals)
 * a landing /deals. Stylovaný na TMAVOU plochu (bílé nadpisy, bílé karty).
 *
 * Prodává NÁSKOK, ne přístup: zdarma alert při spuštění, placený tarif
 * Early Access = totéž o 48 hodin dřív. Akce tarifů řeší volající přes
 * `onTier` (stránky se liší auth/navigační logikou).
 *
 * Čtyři úrovně podle toho, co partner smí dělat:
 *  · Public Drop (zdarma) — jen dívat se a dostávat alerty,
 *  · Trade Access (170 €/měs) — plný obchodní toolkit: Split, Want, Create,
 *  · Early Access (250 €/měs) — totéž + alerty a dealy o 48 h dřív,
 *  · Dealer (zdarma) — kdo sám vypisuje dealy, neplatí nic.
 */

export type GbdPricingTier = 'drop' | 'trade' | 'pro' | 'dealer' | 'enterprise';

interface Tier {
  id: 'drop' | 'trade' | 'pro' | 'dealer';
  name: string;
  /** Cena při měsíční platbě (u Early Access se přepíná na roční sazbu) */
  price?: string;
  period?: string;
  /** Cena při roční platbě — účtuje se ročně, zobrazuje se za měsíc */
  priceAnnual?: string;
  /** poznámka pod cenou; u Early Access se liší podle periody */
  note?: string;
  noteAnnual?: string;
  /** přeškrtnutá kotva vedle ceny (roční sazba proti měsíční) */
  wasAnnual?: string;
  badge?: string;
  features: ReactNode[];
  cta: string;
}

const TIERS: Tier[] = [
  {
    id: 'drop',
    name: 'Public Drop',
    price: 'Free',
    note: 'no card needed',
    features: [
      <>Browse every <Gbd /> once it goes public</>,
      'Drop alerts the moment a deal goes live',
    ],
    cta: 'Start free',
  },
  {
    id: 'trade',
    name: 'Trade Access',
    price: '€170',
    period: '/month',
    note: 'cancel anytime',
    priceAnnual: '€83.33',
    wasAnnual: '€170',
    noteAnnual: 'billed yearly · €1 000',
    features: [
      <>Browse every <Gbd /> once it goes public</>,
      'Concern, brand and model alerts',
      'Split Deal — buy together, hit the MOQ',
      'Want Deal — post what you need',
      'Create Deal — publish your own offer',
    ],
    cta: 'Start trading',
  },
  {
    id: 'pro',
    name: 'Early Access',
    price: '€250',
    period: '/month',
    note: 'cancel anytime',
    priceAnnual: '€125',
    wasAnnual: '€250',
    noteAnnual: 'billed yearly · €1 500',
    features: [
      'The same alerts — 48 hours earlier',
      'Split Deal — buy together, hit the MOQ',
      'Want Deal — post what you need',
      'Create Deal — publish your own offer',
      'Create Split Deal — open a group buy',
    ],
    cta: 'Get early access',
  },
  {
    id: 'dealer',
    name: 'Dealer',
    price: 'Free',
    note: 'no fee to list',
    features: [
      'Create Deal — publish your own offer',
      'Create Split Deal — open a group buy',
    ],
    cta: 'Start selling',
  },
];

export function GbdPricing({
  id = 'gbd-pricing',
  onTier,
}: {
  id?: string;
  onTier: (tier: GbdPricingTier) => void;
}) {
  /** Roční sazba je výchozí (levnější, ukotvuje hodnotu) */
  const [annual, setAnnual] = useState(true);

  return (
    <div id={id} className="mx-auto mt-16 max-w-[1160px] scroll-mt-24 px-5 sm:mt-24 sm:px-10 lg:px-14">
      <h3 className="text-center font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.5rem,3.5vw,2.75rem)] text-white">
        Get early access and earn more.
      </h3>
      <p className="mt-3 text-center font-sans font-extralight tracking-tight text-xl sm:text-2xl">
        <span className="text-zinc-400">Everyone gets the alert. </span>
        <span className="text-white">You get it 48 hours early.</span>
      </p>

      {/* přepínač periody — Early Access má měsíční i roční sazbu */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-full bg-white/10 p-1 text-sm font-medium">
          {([
            ['monthly', 'Monthly'],
            ['annual', 'Yearly · save 50%'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setAnnual(key === 'annual')}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                (key === 'annual') === annual ? 'bg-white text-zinc-900' : 'text-zinc-300 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 pt-3 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => (
          <PricingCard key={tier.id} tier={tier} annual={annual} onSelect={() => onTier(tier.id)} />
        ))}
      </div>

      {/* Enterprise — bez ceny, proto samostatný proužek pod kartami */}
      <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-lg font-semibold tracking-tight text-white">Enterprise</p>
          <p className="mt-1 text-sm text-zinc-400">
            Deals on request. Higher quantities, tailored terms, priority support.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onTier('enterprise')}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Talk to us <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/** Jedna pricing karta. Karty jsou vizuálně rovnocenné — early access nesmí
 *  působit jako „má ho každý", to by šlo proti jeho exkluzivitě. Odlišuje jen
 *  tmavé CTA u placené úrovně.
 *  Hierarchie: největší je NÁZEV tarifu, cena je menší pod ním. */
function PricingCard({ tier, onSelect, annual }: { tier: Tier; onSelect: () => void; annual: boolean }) {
  const featured = tier.id === 'pro';
  // U Early Access se cena i poznámka mění podle zvolené periody
  const useAnnual = annual && !!tier.priceAnnual;
  const price = useAnnual ? tier.priceAnnual : tier.price;
  const note = useAnnual ? tier.noteAnnual : tier.note;
  const was = useAnnual ? tier.wasAnnual : undefined;
  return (
    <div className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {tier.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          {tier.badge}
        </span>
      )}
      <p className="text-2xl font-semibold tracking-tight text-zinc-900">{tier.name}</p>
      {price && (
        <p className="mt-2 flex items-baseline gap-1.5">
          {was && (
            <span className="text-sm font-medium text-slate-400 line-through">{was}</span>
          )}
          <span className="text-lg font-semibold tracking-tight text-zinc-900">{price}</span>
          {tier.period && <span className="text-sm text-slate-500">{tier.period}</span>}
        </p>
      )}
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
      <ul className="mt-4 flex-1 space-y-2">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            {/* text musí být JEDEN flex item, jinak se fragmenty s <Gbd /> rozpadnou na sloupce */}
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onSelect}
        className={`mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
          featured
            ? 'bg-zinc-900 text-white hover:bg-zinc-800'
            : 'border border-slate-300 text-slate-900 hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        {tier.cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
