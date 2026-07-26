import { X } from 'lucide-react';
import { dealsI18n, fillTemplate } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import { filtersActive, type CatalogFilters } from '@/lib/dealCatalog';

/**
 * Lepivá stavová lišta katalogu: kolik dlaždic odpovídá filtru, jaké filtry
 * běží a jak je zrušit. Hledání sedí nad prvním karuselem (CatalogSearch),
 * koncerny a značky se filtrují dlaždicemi (FilterTiles) — v liště zůstává
 * jen to, co má být po ruce při scrollování.
 *
 * Dodavatelé tu ZÁMĚRNĚ nejsou a nebudou: Swelt je nezveřejňuje ani směrem
 * k zákazníkům, ani zákazníky směrem k nim.
 *
 * Navbar je `absolute`, ne fixed — lišta proto může lepit na `top-0`.
 */
export function DealFilterBar({
  filters,
  onChange,
  resultCount,
  activeLabels,
}: {
  filters: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
  resultCount: number;
  /** Čitelné názvy zapnutých filtrů (ne slugy) pro výpis v liště. */
  activeLabels: string[];
}) {
  const lang = useStore((s) => s.lang);
  const c = dealsI18n[lang].catalog;
  const active = filtersActive(filters);

  return (
    <div className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="flex items-center gap-3 px-5 py-2.5 sm:px-8 lg:px-12">
        <span className="shrink-0 text-xs font-medium text-zinc-500">
          {fillTemplate(c.results, { n: resultCount })}
        </span>

        {/* běžící filtry vypsané jménem — po scrollu je jinak nevidět */}
        {activeLabels.length > 0 && (
          <span className="min-w-0 truncate text-xs text-zinc-400">
            {activeLabels.join(' · ')}
          </span>
        )}

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
