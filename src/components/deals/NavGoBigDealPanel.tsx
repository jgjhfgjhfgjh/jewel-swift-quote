import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  useOfferCardsContent,
  type OfferCardContent,
} from '@/components/deals/catalog/CatalogOfferCards';

/* Karty panelu mají PŘESNĚ stejný tvar, stín i hover jako karty v MyDeal —
   jeden vizuální jazyk napříč mega menu. */
const CARD_BASE =
  'group/deal flex h-[158px] flex-col rounded-[1.25rem] border p-5 text-left transition-all duration-300 ease-out ' +
  'shadow-[0_12px_32px_-8px_rgba(15,23,42,0.16),0_3px_8px_rgba(15,23,42,0.07)] hover:-translate-y-1.5 ' +
  'hover:shadow-[0_36px_64px_-18px_rgba(15,23,42,0.32),0_8px_18px_rgba(15,23,42,0.12)]';
/** Titulek / podtitulek / akční řádek — přesně jako karty v MyDeal. */
const CARD_TITLE = 'text-[15px] font-semibold tracking-tight';
const CARD_SUB = 'mt-1.5 text-[13px] leading-snug';
const CARD_ACTION = 'mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold';
const CARD_LIGHT = 'border-slate-200/70 bg-white hover:border-slate-300';

/**
 * GoBigDeal mega menu — čtyři vstupy do dealů: TÁŽ čtveřice, která na /deals
 * stojí nad KPI lištou (alerty, Early Access, Want Deal, Split Deal),
 * v bílém materiálu karet z MyDeal.
 *
 * Do samotných dávek panel nevede — na to je klik na položku GoBigDeal
 * v navigaci, který rovnou otevře /deals.
 */
export function NavGoBigDealPanel({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();

  const go = (path: string) => {
    onNavigate?.();
    navigate(path);
  };

  const offers = useOfferCardsContent();
  const offerAction: Record<OfferCardContent['key'], () => void> = {
    alerts: () => go('/alerts'),
    ea: () => go('/#gbd-pricing'),
    want: () => go('/wantdeal'),
    split: () => go('/splitdeal'),
  };

  return (
    <div className="grid w-full grid-cols-4 gap-4 px-0.5 py-1">
      {offers.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={offerAction[c.key]}
          className={`${CARD_BASE} ${CARD_LIGHT}`}
        >
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-zinc-400">
            <c.icon className="h-3 w-3 shrink-0" /> {c.eyebrow}
          </span>
          <span className={`${CARD_TITLE} mt-2 line-clamp-1 leading-snug text-zinc-900`}>
            {c.title}
          </span>
          <span className={`${CARD_SUB} line-clamp-2 text-zinc-500`}>{c.sub}</span>
          <span className={`${CARD_ACTION} text-zinc-900`}>
            {c.cta}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/deal:translate-x-0.5" />
          </span>
        </button>
      ))}
    </div>
  );
}
