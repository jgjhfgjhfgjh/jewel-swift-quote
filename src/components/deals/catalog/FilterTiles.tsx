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
 * Vodorovný pás filtračních dlaždic ve stylu kategorií na Woltu: logo na
 * tmavém glass čtverci, POPISEK POD dlaždicí (ne uvnitř), scroll-snap a
 * kulaté šipky vpravo nahoře. Stejná komponenta obsluhuje koncerny i značky
 * — mají být k nerozeznání, liší se jen daty.
 *
 * „Luxusní dashboard" look (pokyn Tomka, screenshot PRO karty): dlaždice
 * bg-white/5 + ring-white/10 na obsidianu, loga sjednocená do BÍLÝCH siluet
 * (brightness(0) invert(1) — stejná technika jako marquee).
 *
 * Barvy podle referenční PRO karty: MODRÁ = výběr (stejně jako u světlého
 * ConcernFilterCarousel na homepage), ZELENÁ = počet živých dávek (stejně
 * jako „{n} live" v mega menu).
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
        <h2 className="text-sm font-semibold tracking-tight text-white">{label}</h2>
        <div className="flex items-center gap-1.5">
          {/* „Vše" = zrušení výběru v této úrovni, jako první dlaždice u Woltu */}
          <button
            type="button"
            onClick={onClearAll}
            className={`mr-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              selected.length === 0
                ? 'bg-white text-zinc-900'
                : 'text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {allLabel}
          </button>
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Předchozí"
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/10 transition-colors hover:bg-white/20 sm:inline-flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Další"
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/10 transition-colors hover:bg-white/20 sm:inline-flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* pt-3: hover zvedá dlaždici o 4 px a check badge přesahuje o 6 px
          nad ni — overflow-x kontejner ořezává i svisle, bez rezervy se
          zvednutá dlaždice ořízne o horní hranu */}
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
              {/* tmavý glass čtverec — loga jedou jako bílé siluety */}
              <span
                className={`relative flex aspect-square w-full items-center justify-center rounded-[20px] bg-white/[0.04] p-4
                            transition-all duration-200 group-hover:-translate-y-1 group-hover:bg-white/[0.08] group-hover:shadow-[0_12px_28px_-12px_rgba(255,255,255,0.18)]
                            group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#0B1215] ${
                              active
                                ? 'bg-blue-500/[0.12] ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0B1215]'
                                : 'ring-1 ring-white/10'
                            }`}
              >
                {item.domain ? (
                  <BrandLogo
                    name={item.name}
                    domain={item.domain}
                    width={280}
                    height={120}
                    className="max-h-9 max-w-[78%] object-contain opacity-80 [filter:brightness(0)_invert(1)] transition-all duration-300 group-hover:scale-[1.06] group-hover:opacity-100"
                    fallbackClassName="line-clamp-2 text-center text-xs font-semibold leading-tight text-white/80"
                  />
                ) : (
                  <span className="line-clamp-3 text-center text-xs font-semibold leading-tight text-white/80">
                    {item.name}
                  </span>
                )}
                {active && (
                  /* modrý badge s bílou fajfkou — čitelný na dlaždici i na
                     černém pozadí, přes které rohem přesahuje */
                  <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-md ring-2 ring-[#0B1215]">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                )}
                {count > 0 && !active && (
                  /* zelený počet dávek — „kolik je tu pro vás" */
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/25">
                    <Layers className="h-2.5 w-2.5" />
                    {count}
                  </span>
                )}
              </span>
              <span
                className={`line-clamp-2 text-center text-[13px] leading-tight ${
                  active ? 'font-semibold text-white' : 'font-medium text-zinc-200'
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
