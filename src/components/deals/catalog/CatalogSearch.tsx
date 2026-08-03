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
      {/* tmavé glass pole — stejný tón jako karty (dashboard look) */}
      <label className="relative mx-auto flex max-w-2xl items-center">
        <Search className="pointer-events-none absolute left-5 h-5 w-5 text-zinc-500" />
        <span className="sr-only">{c.searchPlaceholder}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={c.searchPlaceholder}
          className="h-14 w-full rounded-full border-0 bg-white/[0.06] pl-14 pr-12 text-base text-white
                     ring-1 ring-white/10 transition-all duration-200 placeholder:text-zinc-500
                     hover:bg-white/[0.08] focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={c.clear}
            className="absolute right-4 flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-zinc-300 transition-colors hover:bg-white/25"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </label>
    </div>
  );
}
