import { LayoutGrid, Rows3, X } from 'lucide-react';
import { dealsI18n, fillTemplate } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

export type CatalogSortKey = 'ending' | 'discount' | 'models' | 'newest';
export type CatalogView = 'grid' | 'list';

/**
 * Řídicí lišta dashboardu — řazení, přepínač mřížka/seznam, počet výsledků
 * a zrušení filtrů. Tmavá varianta na matně černé ploše: aktivní stav je
 * INVERZNÍ (bílá pilulka, černý text), klid tlumeně zinc, počty v mono písmu.
 */
export function CatalogControlBar({
  resultCount,
  activeCount,
  activeLabels,
  onClear,
  sort,
  onSort,
  view,
  onView,
}: {
  resultCount: number;
  /** Počet běžících filtrů (koncerny + značky + hledání). */
  activeCount: number;
  /** Čitelné názvy běžících filtrů do druhého řádku. */
  activeLabels: string[];
  onClear: () => void;
  sort: CatalogSortKey;
  onSort: (s: CatalogSortKey) => void;
  view: CatalogView;
  onView: (v: CatalogView) => void;
}) {
  const lang = useStore((s) => s.lang);
  const d = dealsI18n[lang];
  const s = d.catalog.dash;

  const sorts: { key: CatalogSortKey; label: string }[] = [
    { key: 'ending', label: s.sortEnding },
    { key: 'discount', label: s.sortDiscount },
    { key: 'models', label: s.sortModels },
    { key: 'newest', label: s.sortNewest },
  ];

  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0B1215]/90 py-3 backdrop-blur supports-[backdrop-filter]:bg-[#0B1215]/75">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {/* řazení — segmenty jako pilulky, na úzkém displeji scrollují */}
        <div
          className="flex items-center gap-1 overflow-x-auto
                     [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {sorts.map((o) => (
            <button
              key={o.key}
              type="button"
              aria-pressed={sort === o.key}
              onClick={() => onSort(o.key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                sort === o.key
                  ? 'bg-white text-zinc-900'
                  : 'text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          {activeCount > 0 && (
            <>
              <span className="hidden font-mono text-xs text-zinc-500 sm:block">
                {fillTemplate(d.catalog.results, { n: String(resultCount) })}
              </span>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
              >
                <X className="h-3.5 w-3.5" /> {d.catalog.clear} · {activeCount}
              </button>
            </>
          )}
          {/* mřížka / seznam */}
          <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-0.5">
            <button
              type="button"
              aria-label={s.viewGrid}
              aria-pressed={view === 'grid'}
              onClick={() => onView('grid')}
              className={`flex h-7 w-8 items-center justify-center rounded-full transition-colors ${
                view === 'grid' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label={s.viewList}
              aria-pressed={view === 'list'}
              onClick={() => onView('list')}
              className={`flex h-7 w-8 items-center justify-center rounded-full transition-colors ${
                view === 'list' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Rows3 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      {activeLabels.length > 0 && (
        <div className="mt-2 truncate text-xs text-zinc-500">{activeLabels.join(' · ')}</div>
      )}
    </div>
  );
}
