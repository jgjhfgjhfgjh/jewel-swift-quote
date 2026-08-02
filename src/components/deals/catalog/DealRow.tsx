import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DealTile } from './DealTile';
import type { DealTileItem } from '@/lib/dealCatalog';

/**
 * Jedna řada katalogu — nadpis, kulaté šipky vpravo a vodorovný scroll-snap
 * pás dlaždic (vzor převzatý z Woltu / 21st „Carousel Cards"). Šipky jsou
 * jen na desktopu, mobil swipuje prstem.
 */
export function DealRow({
  title,
  items,
  seeAllLabel,
  onSeeAll,
  onTeaserClick,
}: {
  title: string;
  items: DealTileItem[];
  seeAllLabel: string;
  onSeeAll?: () => void;
  onTeaserClick?: () => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * Math.max(300, track.current.clientWidth * 0.85), behavior: 'smooth' });

  if (items.length === 0) return null;

  return (
    <section className="min-w-0 py-5 sm:py-6">
      {/* na černé ploše katalogu: bílý nadpis, bílé kulaté šipky */}
      <div className="mb-3 flex items-baseline justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <h2 className="font-sans text-lg font-semibold tracking-tight text-white sm:text-xl">
          {title}
          <span className="ml-2 text-sm font-normal text-zinc-500">{items.length}</span>
        </h2>
        <div className="flex items-center gap-1.5">
          {onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="mr-1 hidden text-xs font-semibold text-zinc-400 transition-colors hover:text-white sm:inline"
            >
              {seeAllLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Předchozí"
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-700 transition-colors hover:bg-zinc-200 sm:inline-flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Další"
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-700 transition-colors hover:bg-zinc-200 sm:inline-flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* pt-3: karty se na hover zvedají o 4 px + focus ring 4 px — bez
          rezervy je overflow-x kontejner svisle ořízne o horní hranu */}
      <div
        ref={track}
        className="flex snap-x gap-4 overflow-x-auto px-5 pb-3 pt-3 sm:px-8 lg:px-12
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div key={item.id} className="w-[248px] shrink-0 snap-start sm:w-[276px]">
            <DealTile item={item} onTeaserClick={onTeaserClick} />
          </div>
        ))}
      </div>
    </section>
  );
}
