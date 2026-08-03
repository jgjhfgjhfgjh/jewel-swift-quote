import { Search, X } from 'lucide-react';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

/**
 * Vyhledávací pole katalogu. Dvě podoby:
 * - výchozí: velké pole na střed (mobilní katalog — hledání jako hlavní vstup),
 * - `compact`: štíhlá varianta pro sidebar dashboardu (bez vlastního odsazení).
 *
 * Hledá napříč koncerny, značkami a názvy dávek. Dodavatele záměrně
 * neindexuje — ty Swelt nezveřejňuje.
 */
export function CatalogSearch({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (next: string) => void;
  compact?: boolean;
}) {
  const lang = useStore((s) => s.lang);
  const c = dealsI18n[lang].catalog;

  const input = (
    /* tmavé glass pole — stejný tón jako karty (dashboard look) */
    <label className={`relative flex items-center ${compact ? '' : 'mx-auto max-w-2xl'}`}>
      <Search
        className={`pointer-events-none absolute text-zinc-500 ${compact ? 'left-3.5 h-4 w-4' : 'left-5 h-5 w-5'}`}
      />
      <span className="sr-only">{c.searchPlaceholder}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={c.searchPlaceholder}
        className={`w-full rounded-full border-0 bg-white/[0.06] text-white
                    ring-1 ring-white/10 transition-all duration-200 placeholder:text-zinc-500
                    hover:bg-white/[0.08] focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-white/30 ${
                      compact ? 'h-11 pl-10 pr-9 text-sm' : 'h-14 pl-14 pr-12 text-base'
                    }`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={c.clear}
          className={`absolute flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-zinc-300 transition-colors hover:bg-white/25 ${
            compact ? 'right-2.5' : 'right-4'
          }`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </label>
  );

  return compact ? input : <div className="px-5 sm:px-8 lg:px-12">{input}</div>;
}
