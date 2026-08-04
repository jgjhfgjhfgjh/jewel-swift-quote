import { Search, X } from 'lucide-react';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

/**
 * Vyhledávací pole katalogu — světlá varianta: bílé pole s hairline slate
 * rámečkem, focus jen ztmaví rámeček. Dvě podoby:
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
    <label className={`relative flex items-center ${compact ? '' : 'mx-auto max-w-2xl'}`}>
      <Search
        className={`pointer-events-none absolute text-slate-400 ${compact ? 'left-3.5 h-4 w-4' : 'left-5 h-5 w-5'}`}
      />
      <span className="sr-only">{c.searchPlaceholder}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={c.searchPlaceholder}
        className={`w-full rounded-lg border border-slate-200 bg-white text-zinc-900 shadow-sm
                    transition-colors duration-200 placeholder:text-slate-400
                    hover:border-slate-300 focus:border-slate-400 focus:outline-none ${
                      compact ? 'h-11 pl-10 pr-9 text-sm' : 'h-14 pl-14 pr-12 text-base'
                    }`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={c.clear}
          className={`absolute flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-slate-300 hover:text-zinc-900 ${
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
