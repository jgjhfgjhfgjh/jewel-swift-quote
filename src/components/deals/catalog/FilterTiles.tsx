import { useRef } from 'react';
import { Check, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export interface FilterTileItem {
  /** Hodnota do filtru — slug koncernu nebo kanonický klíč značky. */
  key: string;
  name: string;
  /** Brandfetch doména loga; bez ní se vykreslí textový fallback. */
  domain?: string;
  /** Počet dlaždic katalogu, badge se zobrazí jen když > 0. */
  count?: number;
}

/**
 * Vodorovný pás filtračních dlaždic (mobilní katalog) — hairline monochrom:
 * čtverce #050505 s vláskovým rámečkem, loga jako BÍLÉ siluety
 * (brightness(0) invert(1) — stejná technika jako marquee), výběr = bílý
 * check badge + zjasněný rámeček, počet dávek v mono chipu. Stejná
 * komponenta obsluhuje koncerny i značky — liší se jen daty.
 */
export function FilterTiles({
  items, selected, onToggle, label, allLabel, onClearAll,
}: {
  items: FilterTileItem[];
  selected: string[];
  onToggle: (key: string) => void;
  label: string;
  allLabel: string;
  onClearAll: () => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * Math.max(280, track.current.clientWidth * 0.8), behavior: 'smooth' });

  if (items.length === 0) return null;

  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <h2 className="text-sm font-medium tracking-tight text-white">{label}</h2>
        <div className="flex items-center gap-1.5">
          {/* „Vše" = zrušení výběru v této úrovni */}
          <button
            type="button"
            onClick={onClearAll}
            className={`mr-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selected.length === 0
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            {allLabel}
          </button>
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Předchozí"
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-white transition-colors hover:border-white/[0.2] sm:inline-flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Další"
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-white transition-colors hover:border-white/[0.2] sm:inline-flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* pt-3: check badge přesahuje o 6 px nad dlaždici — overflow-x
          kontejner ořezává i svisle, bez rezervy se badge ořízne */}
      <div
        ref={track}
        className="flex snap-x gap-3 overflow-x-auto px-5 pb-3 pt-3 sm:gap-4 sm:px-8 lg:px-12
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const active = selected.includes(item.key);
          const count = item.count ?? 0;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onToggle(item.key)}
              aria-pressed={active}
              className="group flex w-[104px] shrink-0 snap-start flex-col items-center gap-2 focus:outline-none sm:w-[124px]"
            >
              {/* hairline čtverec — loga jedou jako bílé siluety */}
              <span
                className={`relative flex aspect-square w-full items-center justify-center rounded-xl border bg-[#050505] p-4
                            transition-colors duration-200
                            group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black ${
                              active
                                ? 'border-white/[0.35] bg-white/[0.04]'
                                : 'border-white/[0.08] group-hover:border-white/[0.2]'
                            }`}
              >
                {item.domain ? (
                  <BrandLogo
                    name={item.name}
                    domain={item.domain}
                    width={280}
                    height={120}
                    className="max-h-9 max-w-[78%] object-contain opacity-80 [filter:brightness(0)_invert(1)] transition-all duration-300 group-hover:scale-[1.06] group-hover:opacity-100"
                    fallbackClassName="line-clamp-2 text-center text-xs font-medium leading-tight text-white/80"
                  />
                ) : (
                  <span className="line-clamp-3 text-center text-xs font-medium leading-tight text-white/80">
                    {item.name}
                  </span>
                )}
                {active && (
                  /* bílý badge s černou fajfkou — jediný „plný" prvek výběru */
                  <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black shadow-md ring-2 ring-black">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                )}
                {count > 0 && !active && (
                  /* počet dávek — mono chip */
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full border border-white/[0.1] bg-black/60 px-1.5 py-0.5 font-mono text-[10px] font-medium text-neutral-300">
                    <Layers className="h-2.5 w-2.5" />
                    {count}
                  </span>
                )}
              </span>
              <span
                className={`line-clamp-2 text-center text-[13px] font-medium leading-tight ${
                  active ? 'text-white' : 'text-neutral-300'
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
