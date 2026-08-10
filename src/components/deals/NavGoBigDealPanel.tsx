import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';
import { buildCatalog, type DealTileItem } from '@/lib/dealCatalog';
import { BrandLogo } from '@/components/BrandLogo';
import { useOfferCardsContent, type OfferCardContent } from '@/components/deals/catalog/CatalogOfferCards';
import { CountdownTimer } from './CountdownTimer';

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

/** Šířka karty v kolotoči — pět karet na běžném desktopu, zbytek se odjede. */
const CARD_W = 'w-[clamp(190px,17vw,248px)]';

/**
 * GoBigDeal mega menu — dvě řady:
 *  1) nahoře čtyři vstupy do dealů — TÁŽ čtveřice, která na /deals stojí
 *     nad KPI lištou (alerty, Early Access, Want Deal, Split Deal),
 *  2) pod nimi kolotoč dealů (živé → připravované → uzavřené), v čele karta
 *     „All Deals" jako vstup do celého katalogu.
 *
 * Karty sdílejí s MyDeal panelem VŠECHNO — tvar, bílý materiál, stín,
 * hover i typografii.
 * Nikdy nepředstírá živou nabídku: odpočet nese jen deal, který opravdu běží,
 * uzavřené jsou ztlumené a označené.
 */
export function NavGoBigDealPanel({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { deals, productCounts } = useDeals();

  const go = (path: string) => {
    onNavigate?.();
    navigate(path);
  };

  // Stejná data jako /deals — co panel slíbí, to po prokliku sedí.
  const catalog = useMemo(() => buildCatalog(deals, productCounts, () => ''), [deals, productCounts]);

  /* Reálné dealy (teasery koncernů sem nepatří) v pořadí živé → připravované
     → uzavřené; uvnitř skupiny podle nejbližšího termínu. Kolotoč je nemusí
     ořezávat — co se nevejde, to se odjede. */
  const tiles = useMemo(() => {
    const rank = { live: 0, upcoming: 1, closed: 2, teaser: 3 } as const;
    return catalog
      .filter((t) => t.kind !== 'teaser')
      .sort((a, b) => {
        const byKind = rank[a.kind] - rank[b.kind];
        if (byKind !== 0) return byKind;
        const at = new Date(a.deadline ?? a.startsAt ?? 0).getTime();
        const bt = new Date(b.deadline ?? b.startsAt ?? 0).getTime();
        return a.kind === 'closed' ? bt - at : at - bt;
      });
  }, [catalog]);

  const liveCount = catalog.filter((t) => t.kind === 'live').length;
  const totalCount = tiles.length;

  const offers = useOfferCardsContent();
  const offerAction: Record<OfferCardContent['key'], () => void> = {
    alerts: () => go('/alerts'),
    ea: () => go('/#gbd-pricing'),
    want: () => go('/wantdeal'),
    split: () => go('/splitdeal'),
  };

  return (
    <div className="flex flex-col">
      {/* ── 1. řada — čtyři vstupy do dealů (shodné s lištou nad KPI na
             /deals), v bílém materiálu karet z MyDeal ── */}
      <div className="grid grid-cols-4 gap-4 px-0.5 pt-1">
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

      {/* ── 2. řada — kolotoč dealů, All Deals v čele ── */}
      <div className="mt-1">
        <Carousel>
          <button
            type="button"
            onClick={() => go('/deals')}
            className={`${CARD_BASE} ${CARD_LIGHT} ${CARD_W} shrink-0`}
          >
            <span className={`${CARD_TITLE} text-zinc-900`}>All Deals</span>
            <span className={`${CARD_SUB} text-zinc-500`}>
              {totalCount > 0
                ? `${totalCount} ${totalCount === 1 ? 'deal' : 'deals'}${liveCount > 0 ? ` · ${liveCount} live` : ''}`
                : 'The full closeout catalog'}
            </span>
            <span className={`${CARD_ACTION} text-zinc-900`}>
              Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/deal:translate-x-0.5" />
            </span>
          </button>

          {tiles.map((item) => (
            <DealMiniCard
              key={item.id}
              item={item}
              onOpen={() => (item.slug ? go(`/deals/${item.slug}`) : go('/deals'))}
            />
          ))}
        </Carousel>
      </div>
    </div>
  );
}

/** Vodorovný kolotoč karet — šipky se objeví až při hoveru nad řadou. */
function Carousel({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <div className="group/carousel relative">
      <div
        ref={trackRef}
        /* pt/pb — karty se na hover zvedají a stín nesmí být uříznutý */
        className="flex gap-4 overflow-x-auto scroll-smooth px-0.5 pb-3 pt-1
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Předchozí dealy"
        className="absolute left-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full
                   bg-white/85 text-zinc-700 opacity-0 shadow-md backdrop-blur-sm transition-all
                   hover:bg-white group-hover/carousel:opacity-100"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Další dealy"
        className="absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full
                   bg-white/85 text-zinc-700 opacity-0 shadow-md backdrop-blur-sm transition-all
                   hover:bg-white group-hover/carousel:opacity-100"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Dlaždice dealu — TÝŽ tvar i anatomie jako karty v MyDeal: hlavička
 *  (logo koncernu + sleva), titulek, spodní akční řádek. Stav dávky nese
 *  levá strana akčního řádku. */
function DealMiniCard({ item, onOpen }: { item: DealTileItem; onOpen: () => void }) {
  const closed = item.kind === 'closed';

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`relative shrink-0 overflow-hidden ${CARD_W} ${CARD_BASE} ${CARD_LIGHT} ${closed ? 'opacity-70 hover:opacity-100' : ''}`}
    >
      {/* UZAVŘENÁ dávka — stejné razítko jako na kartách katalogu. Miniatura
          nemá fotku, takže bílý nápis by na světlé kartě zmizel: razítko je
          šedé a průsvitné, aby nepřebilo název dávky. */}
      {closed && (
        <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rotate-[-8deg] text-lg font-black uppercase tracking-[0.22em] text-zinc-900/[0.16]">
            Closed
          </span>
        </span>
      )}

      {/* Hlavička jako u MyDeal: logo koncernu na místě ikony, sleva vpravo
          na místě odznaku „kolik jich běží". */}
      <span className="flex items-center gap-2">
        <span className="flex h-5 min-w-0 flex-1 items-center">
          {item.concernDomain ? (
            <BrandLogo
              name={item.concernName ?? item.supplier}
              domain={item.concernDomain}
              width={200}
              height={80}
              className="max-h-5 max-w-[110px] object-contain opacity-90 [mix-blend-mode:multiply]"
              fallbackClassName="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500"
            />
          ) : (
            <span className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {item.supplier}
            </span>
          )}
        </span>
        {item.maxDiscount > 0 && (
          <span className="ml-auto shrink-0 font-mono text-[11px] font-semibold text-red-600">
            −{item.maxDiscount} %
          </span>
        )}
      </span>

      {/* název dealu — titulek karty (stejná velikost i váha jako v MyDeal) */}
      <span className={`${CARD_TITLE} mt-1.5 line-clamp-2 leading-snug text-zinc-900`}>
        {item.title}
      </span>

      {/* akční řádek jako v MyDeal, jen vlevo nese stav dávky —
          odpočet patří jen dealu, který opravdu běží */}
      <span className={`${CARD_ACTION} w-full justify-between text-zinc-900`}>
        <span className="min-w-0 truncate font-medium text-zinc-500">
          {item.kind === 'live' && item.deadline ? (
            <CountdownTimer deadline={item.deadline} variant="compact" lang="en" />
          ) : item.kind === 'upcoming' ? (
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3 w-3 shrink-0" /> Opens soon
            </span>
          ) : (
            'Closed'
          )}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5">
          Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/deal:translate-x-0.5" />
        </span>
      </span>
    </button>
  );
}
