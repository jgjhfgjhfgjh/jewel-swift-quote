import { useRef } from 'react';
import { Check, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CONCERNS } from '@/data/concerns';

/**
 * Pás koncernů ve stylu kategorií na Woltu: čtvercová dlaždice s logem na
 * jemném tónovaném podkladu, POPISEK POD dlaždicí (ne uvnitř), vodorovný
 * scroll a kulaté šipky vpravo nahoře.
 *
 * Tóny jsou záměrně tlumené a chladné (blue/cyan/emerald rodina gradientu
 * z homepage) — Wolt má pastelovou duhu, Swelt si drží luxusní klid.
 */
const TINTS = [
  '#F1F5F9', // slate-100
  '#EFF6FF', // blue-50
  '#ECFEFF', // cyan-50
  '#ECFDF5', // emerald-50
  '#F5F3FF', // violet-50
  '#F4F4F5', // zinc-100
  '#F0F9FF', // sky-50
  '#F0FDFA', // teal-50
  '#EEF2FF', // indigo-50
  '#FAFAF9', // stone-50
];

export interface ConcernTilesProps {
  /** Slugy vybraných koncernů. */
  selected: string[];
  onToggle: (slug: string) => void;
  /** Kolik dlaždic katalogu na koncern připadá (0 = jen teaser). */
  countBySlug: Record<string, number>;
  label: string;
  allLabel: string;
  onClearAll: () => void;
}

export function ConcernTiles({
  selected, onToggle, countBySlug, label, allLabel, onClearAll,
}: ConcernTilesProps) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * Math.max(280, track.current.clientWidth * 0.8), behavior: 'smooth' });

  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900">{label}</h2>
        <div className="flex items-center gap-1.5">
          {/* „Vše" = zrušení výběru koncernů, stejná role jako první dlaždice u Woltu */}
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
        className="flex snap-x gap-3 overflow-x-auto px-5 pb-2 sm:gap-4 sm:px-8 lg:px-12
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CONCERNS.map((c, i) => {
          const active = selected.includes(c.slug);
          const count = countBySlug[c.slug] ?? 0;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => onToggle(c.slug)}
              aria-pressed={active}
              className="group flex w-[104px] shrink-0 snap-start flex-col items-center gap-2 focus:outline-none sm:w-[124px]"
            >
              <span
                className={`relative flex aspect-square w-full items-center justify-center rounded-[20px] p-4
                            transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.35)]
                            group-focus-visible:ring-2 group-focus-visible:ring-zinc-900 group-focus-visible:ring-offset-2 ${
                              active ? 'ring-2 ring-zinc-900 ring-offset-2' : ''
                            }`}
                style={{ backgroundColor: TINTS[i % TINTS.length] }}
              >
                <BrandLogo
                  name={c.name}
                  domain={c.domain}
                  width={280}
                  height={120}
                  className="max-h-9 max-w-[78%] object-contain [mix-blend-mode:multiply] transition-transform duration-300 group-hover:scale-[1.06]"
                  fallbackClassName="text-center text-xs font-semibold leading-tight text-zinc-700"
                />
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
                {c.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
