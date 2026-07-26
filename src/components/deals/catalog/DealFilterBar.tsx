import { Lock, Search, X } from 'lucide-react';
import { dealsI18n, fillTemplate } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import { filtersActive, type CatalogFilters } from '@/lib/dealCatalog';

/**
 * Lepivá lišta filtrů pod dlaždicovými pásy: fulltext, počet výsledků,
 * zrušení filtrů a zamčený slot „Dodavatelé" (přibude, až jich bude víc).
 * Koncerny i značky se filtrují dlaždicemi NAD lištou (FilterTiles) — lišta
 * proto nese jen to, co má zůstat po ruce při scrollování.
 *
 * Navbar je `absolute`, ne fixed — lišta proto může lepit na `top-0`.
 */
export function DealFilterBar({
  filters,
  onChange,
  resultCount,
}: {
  filters: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
  resultCount: number;
}) {
  const lang = useStore((s) => s.lang);
  const c = dealsI18n[lang].catalog;
  const active = filtersActive(filters);

  return (
    <div className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="flex items-center gap-3 px-5 py-3 sm:px-8 lg:px-12">
        <label className="relative flex min-w-0 flex-1 items-center sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-zinc-400" />
          <span className="sr-only">{c.searchPlaceholder}</span>
          <input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder={c.searchPlaceholder}
            className="h-10 w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-9 text-sm text-zinc-900 placeholder:text-zinc-400
                       transition-colors focus:border-zinc-900 focus:bg-white focus:outline-none"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, search: '' })}
              aria-label={c.clear}
              className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-300"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </label>

        <span className="hidden shrink-0 text-xs font-medium text-zinc-500 sm:inline">
          {fillTemplate(c.results, { n: resultCount })}
        </span>

        {/* dodavatelé zatím jako zamčený slot — filtr přibude, až jich bude víc */}
        <span
          title={c.suppliersSoon}
          className="hidden shrink-0 cursor-not-allowed items-center gap-1.5 rounded-full border border-dashed border-zinc-300 px-3.5 py-1.5 text-xs font-semibold text-zinc-400 lg:inline-flex"
        >
          <Lock className="h-3 w-3" /> {c.suppliersLabel} · {c.suppliersSoon}
        </span>

        {active > 0 && (
          <button
            type="button"
            onClick={() => onChange({ concerns: [], brands: [], search: '' })}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            <X className="h-3.5 w-3.5" /> {c.clear} · {active}
          </button>
        )}
      </div>
    </div>
  );
}
