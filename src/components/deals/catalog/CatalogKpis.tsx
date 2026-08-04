import type { ReactNode } from 'react';

export interface CatalogKpi {
  label: string;
  /** String se vysází velkou tmavou typografií, uzel (odpočet) se vloží tak, jak je. */
  value: ReactNode;
  /** Pulsující zelená tečka před hodnotou — živé dávky. */
  liveDot?: boolean;
  /** Historicky zvýrazněná hodnota (sleva) — světlá varianta ji sází tmavě;
      prop zůstává v signatuře kvůli volajícím. */
  gradient?: boolean;
}

/**
 * KPI lišta dashboardu — světlá varianta: bílé karty s hairline slate
 * rámečkem a jemným stínem, hodnoty velkou tmavou typografií font-medium
 * tracking-tighter, živý stav značí zelená pulsující tečka.
 */
export function CatalogKpis({ items }: { items: CatalogKpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {items.map((k) => (
        <div
          key={k.label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md sm:p-5"
        >
          <span className="block truncate text-[11px] font-medium uppercase tracking-widest text-slate-400">
            {k.label}
          </span>
          <span className="mt-2.5 flex min-h-[2rem] items-center gap-2.5">
            {k.liveDot && <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />}
            {typeof k.value === 'string' ? (
              <span className="font-sans text-[1.6rem] font-medium leading-none tracking-tighter text-zinc-900 sm:text-3xl">
                {k.value}
              </span>
            ) : (
              k.value
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
