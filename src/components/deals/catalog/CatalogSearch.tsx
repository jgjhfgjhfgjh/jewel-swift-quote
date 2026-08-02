import { Search, X } from 'lucide-react';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

/**
 * Vyhledávací pole na prvním místě katalogu — pod headerem, na střed.
 * Marketplace pattern: hledání je hlavní vstup do katalogu, ne doplněk lišty.
 * Katalog leží na černé ploše → pole je plně bílé (jako karty), bez rámečku.
 *
 * Hledá napříč koncerny, značkami a názvy dávek. Dodavatele záměrně
 * neindexuje — ty Swelt nezveřejňuje.
 */
export function CatalogSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const lang = useStore((s) => s.lang);
  const c = dealsI18n[lang].catalog;

  return (
    <div className="px-5 sm:px-8 lg:px-12">
      <label className="relative mx-auto flex max-w-2xl items-center">
        <Search className="pointer-events-none absolute left-5 h-5 w-5 text-zinc-400" />
        <span className="sr-only">{c.searchPlaceholder}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={c.searchPlaceholder}
          className="h-14 w-full rounded-full border-0 bg-white pl-14 pr-12 text-base text-zinc-900
                     shadow-[0_8px_28px_-10px_rgba(0,0,0,0.6)] transition-all duration-200 placeholder:text-zinc-400
                     focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#0d0d10]"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={c.clear}
            className="absolute right-4 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </label>
    </div>
  );
}
