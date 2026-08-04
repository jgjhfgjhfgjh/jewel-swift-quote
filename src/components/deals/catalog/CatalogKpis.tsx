import type { ReactNode } from 'react';

export interface CatalogKpi {
  label: string;
  /** String se vysází velkou bílou typografií, uzel (odpočet) se vloží tak, jak je. */
  value: ReactNode;
  /** Pulsující tečka před hodnotou — živé dávky (v monochromu bílá). */
  liveDot?: boolean;
  /** Historicky gradientová hodnota — hairline monochrom ji sází bíle; prop
      zůstává v signatuře kvůli volajícím. */
  gradient?: boolean;
}

/**
 * KPI lišta dashboardu — hairline monochrom: karty #050505 s vláskovým
 * rámečkem (hover jen zjasní rámeček), hodnoty velkou bílou typografií
 * font-medium tracking-tighter, živý stav značí bílá pulsující tečka.
 */
export function CatalogKpis({ items }: { items: CatalogKpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {items.map((k) => (
        <div
          key={k.label}
          className="rounded-xl border border-white/[0.08] bg-[#050505] p-4 transition-colors hover:border-white/[0.15] sm:p-5"
        >
          <span className="block truncate text-[11px] font-medium uppercase tracking-widest text-neutral-500">
            {k.label}
          </span>
          <span className="mt-2.5 flex min-h-[2rem] items-center gap-2.5">
            {k.liveDot && <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-white" />}
            {typeof k.value === 'string' ? (
              <span className="font-sans text-[1.6rem] font-medium leading-none tracking-tighter text-white sm:text-3xl">
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
