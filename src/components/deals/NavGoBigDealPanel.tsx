import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Lock } from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';
import { buildCatalog, type DealTileItem } from '@/lib/dealCatalog';
import { BrandLogo } from '@/components/BrandLogo';
import { CountdownTimer } from './CountdownTimer';

/* Karty panelu mají PŘESNĚ stejný tvar, stín i hover jako karty v MyDeal —
   jeden vizuální jazyk napříč mega menu. */
const CARD_BASE =
  'group/deal flex h-[150px] flex-col rounded-[1.25rem] border p-4 text-left transition-all duration-300 ease-out ' +
  'shadow-[0_12px_32px_-8px_rgba(15,23,42,0.16),0_3px_8px_rgba(15,23,42,0.07)] hover:-translate-y-1.5 ' +
  'hover:shadow-[0_36px_64px_-18px_rgba(15,23,42,0.32),0_8px_18px_rgba(15,23,42,0.12)]';
const CARD_LIGHT = 'border-slate-200/70 bg-white hover:border-slate-300';
/* Černá karta = barvy velkých karet z předchozí verze panelu (#151B1E). */
const CARD_DARK = 'border-[#2C3235] bg-[#151B1E] hover:border-[#494F51] hover:bg-[#1C2325]';

/** Kolik miniatur se vejde vedle černé karty (2 řady po 5). */
const MAX_TILES = 9;

/**
 * GoBigDeal mega menu — mřížka miniatur dealů (živé, připravované i uzavřené)
 * plus černá karta „All Deals" jako vstup do celého katalogu. Karty sdílejí
 * tvar, stínování i hover s kartami v MyDeal panelu.
 *
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
     → uzavřené; uvnitř skupiny podle nejbližšího termínu. */
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
      })
      .slice(0, MAX_TILES);
  }, [catalog]);

  const liveCount = catalog.filter((t) => t.kind === 'live').length;
  const totalCount = catalog.filter((t) => t.kind !== 'teaser').length;

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-5 gap-4">
        {tiles.map((item) => (
          <DealMiniCard
            key={item.id}
            item={item}
            onOpen={() => (item.slug ? go(`/deals/${item.slug}`) : go('/deals'))}
          />
        ))}

        {/* Černá karta — vstup do celého katalogu dealů */}
        <button type="button" onClick={() => go('/deals')} className={`${CARD_BASE} ${CARD_DARK}`}>
          <span className="text-[15px] font-semibold tracking-tight text-white">All Deals</span>
          <span className="mt-1.5 text-[13px] leading-snug text-zinc-400">
            {totalCount > 0
              ? `${totalCount} ${totalCount === 1 ? 'deal' : 'deals'}${liveCount > 0 ? ` · ${liveCount} live` : ''}`
              : 'The full closeout catalog'}
          </span>
          <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-white">
            Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/deal:translate-x-0.5" />
          </span>
        </button>
      </div>

      {/* Patička — free drop alert (nejnižší schod konverze) */}
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-200 pt-2.5">
        <button
          type="button"
          onClick={() => go('/alerts')}
          className="group inline-flex items-center gap-1.5 text-[13px] transition-colors"
        >
          <Bell className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-zinc-900" />
          <span className="font-medium text-zinc-700 transition-colors group-hover:text-zinc-900">
            Deal drop alerts — free forever.
          </span>
          <span className="hidden font-normal text-zinc-500 xl:inline">One email when a deal goes live.</span>
        </button>
        <button
          type="button"
          onClick={() => go('/#gbd-pricing')}
          className="group inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-zinc-700 transition-colors hover:text-zinc-900"
        >
          Early Access · 48 h head start
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

/** Miniatura dealu — logo koncernu, název, stav (odpočet / start / uzavřeno). */
function DealMiniCard({ item, onOpen }: { item: DealTileItem; onOpen: () => void }) {
  const closed = item.kind === 'closed';

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${CARD_BASE} ${CARD_LIGHT} ${closed ? 'opacity-70 hover:opacity-100' : ''}`}
    >
      {/* horní řádek: logo koncernu + sleva */}
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-6 min-w-0 flex-1 items-center">
          {item.concernDomain ? (
            <BrandLogo
              name={item.concernName ?? item.supplier}
              domain={item.concernDomain}
              width={200}
              height={80}
              className="max-h-5 max-w-full object-contain opacity-90 [mix-blend-mode:multiply]"
              fallbackClassName="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500"
            />
          ) : (
            <span className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {item.supplier}
            </span>
          )}
        </span>
        {item.maxDiscount > 0 && (
          <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 font-mono text-[10px] font-bold text-red-600 ring-1 ring-red-100">
            −{item.maxDiscount} %
          </span>
        )}
      </div>

      {/* název dealu */}
      <span className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug tracking-tight text-zinc-900">
        {item.title}
      </span>

      {/* stav — odpočet jen u skutečně živého dealu */}
      <span className="mt-auto flex items-center gap-1.5 pt-2">
        {item.kind === 'live' && item.deadline ? (
          <CountdownTimer deadline={item.deadline} variant="compact" lang="en" />
        ) : item.kind === 'upcoming' ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
            <Lock className="h-2.5 w-2.5" /> Opens soon
          </span>
        ) : (
          <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-400">
            Closed
          </span>
        )}
      </span>
    </button>
  );
}
