import type { ReactNode } from 'react';

/** Kanonický gradient webu — nese gradientovou hodnotu („Sleva až"). */
const GRADIENT = 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent';

export interface CatalogKpi {
  label: string;
  /** String se vysází velkou extralight typografií, uzel (odpočet) se vloží tak, jak je. */
  value: ReactNode;
  /** Pulsující zelená tečka před hodnotou — živé dávky. */
  liveDot?: boolean;
  /** Hodnota v kanonickém gradientu — sleva. */
  gradient?: boolean;
}

/**
 * KPI lišta dashboardu — čtyři tmavé glass dlaždice s přehledem trhu (živé
 * dávky, šířka katalogu, nejhlubší sleva, nejbližší termín). Obchodník vidí
 * stav nabídky dřív, než začne scrollovat.
 */
export function CatalogKpis({ items }: { items: CatalogKpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {items.map((k) => (
        <div key={k.label} className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 sm:p-5">
          <span className="block truncate text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            {k.label}
          </span>
          <span className="mt-2.5 flex min-h-[2rem] items-center gap-2.5">
            {k.liveDot && <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-emerald-400" />}
            {typeof k.value === 'string' ? (
              <span
                className={`font-sans text-[1.6rem] font-extralight leading-none tracking-tight sm:text-3xl ${
                  k.gradient ? GRADIENT : 'text-white'
                }`}
              >
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
