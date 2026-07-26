import { useRef } from 'react';
import { Check, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { tintForKey } from './tints';

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
 * Vodorovný pás filtračních dlaždic ve stylu kategorií na Woltu: logo na
 * tónovaném čtverci, POPISEK POD dlaždicí (ne uvnitř), scroll-snap a kulaté
 * šipky vpravo nahoře. Stejná komponenta obsluhuje koncerny i značky — mají
 * být k nerozeznání, liší se jen daty.
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
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900">{label}</h2>
        <div className="flex items-center gap-1.5">
          {/* „Vše" = zrušení výběru v této úrovni, jako první dlaždice u Woltu */}
          <button
            type="button"
            onClick={onClearAll}
            className={`mr-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              selected.length === 0
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            {allLabel}
          </button>
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Předchozí"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-50 sm:inline-flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Další"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-50 sm:inline-flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={track}
        className="flex snap-x gap-3 overflow-x-auto px-5 pb-2 pt-1 sm:gap-4 sm:px-8 lg:px-12
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
              <span
                className={`relative flex aspect-square w-full items-center justify-center rounded-[20px] p-4
                            transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.35)]
                            group-focus-visible:ring-2 group-focus-visible:ring-zinc-900 group-focus-visible:ring-offset-2 ${
                              active ? 'ring-2 ring-zinc-900 ring-offset-2' : ''
                            }`}
                style={{ backgroundColor: tintForKey(item.key) }}
              >
                {item.domain ? (
                  <BrandLogo
                    name={item.name}
                    domain={item.domain}
                    width={280}
                    height={120}
                    className="max-h-9 max-w-[78%] object-contain [mix-blend-mode:multiply] transition-transform duration-300 group-hover:scale-[1.06]"
                    fallbackClassName="line-clamp-2 text-center text-xs font-semibold leading-tight text-zinc-700"
                  />
                ) : (
                  <span className="line-clamp-3 text-center text-xs font-semibold leading-tight text-zinc-700">
                    {item.name}
                  </span>
                )}
                {active && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white shadow">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                )}
                {count > 0 && !active && (
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/85 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600 backdrop-blur">
                    <Layers className="h-2.5 w-2.5" />
                    {count}
                  </span>
                )}
              </span>
              <span className="line-clamp-2 text-center text-[13px] font-medium leading-tight text-zinc-800">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
