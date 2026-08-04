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
 * Ekonomika (proč to drží pohromadě): odemčení stojí 129 €, takže
 *  · 1 deal měsíčně → kredit se vyplatí (129 € < 209 €),
 *  · od 2 dealů měsíčně → Early Access ročně (209 €/měs < 258 €),
 *  · od 4 dealů nebo bez závazku → Early Access měsíčně (399 €).
 */

export type GbdPricingTier = 'drop' | 'pro' | 'enterprise';

interface Tier {
  id: 'drop' | 'pro';
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
      'Drop alerts the moment a deal goes live',
      <>Every <Gbd /> once it goes public</>,
      'Wholesale prices from 1 unit',
    ],
    cta: 'Start free',
  },
  {
    id: 'pro',
    name: 'Early Access',
    price: '€399',
    period: '/month',
    note: 'cancel anytime',
    priceAnnual: '€209',
    wasAnnual: '€399',
    noteAnnual: 'billed yearly · €2 508',
    features: [
      'The same alerts — 48 hours earlier',
      'Every deal open before it goes public',
      'Concern, brand and model alerts',
      'First pick while stock lasts',
      'Dedicated account manager',
    ],
    cta: 'Get early access',
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
            ['annual', 'Yearly · save 48%'],
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

      <div className="mx-auto mt-6 grid max-w-[760px] grid-cols-1 gap-4 pt-3 sm:grid-cols-2">
        {TIERS.map((tier) => (
          <PricingCard key={tier.id} tier={tier} annual={annual} onSelect={() => onTier(tier.id)} />
        ))}
      </div>

      {/* Enterprise — bez ceny, proto samostatný proužek pod kartami */}
      <div className="mx-auto mt-4 flex max-w-[760px] flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center">
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
            {f}
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
