import type { ReactNode } from 'react';
import { ArrowRight, Bell } from 'lucide-react';

/* Na MOBILU se první dvě dlaždice prohodí: nejdůležitější („živé dealy")
   patří do pravého sloupce, tedy blíž palci pravačky. Od sm výš zůstává
   čtecí pořadí. Hodnoty musí být doslovné třídy, jinak je Tailwind
   nevygeneruje. */
const MOBILE_ORDER = ['order-2', 'order-1', 'order-3', 'order-4'];

export interface CatalogKpi {
  label: string;
  /** String se vysází velkou bílou typografií, uzel (odpočet) se vloží tak, jak je. */
  value: ReactNode;
  /** Pulsující zelená tečka před hodnotou — živé dávky. */
  liveDot?: boolean;
  /** Drobná akce pod hodnotou — z mrtvého čísla konverzní bod
      („Živé dealy: 0" → alert) nebo zkratka na sekci („GoDeal" → scroll).
      `icon` volí zvoneček (alert, výchozí) nebo šipku (navigace). */
  action?: { label: string; onClick: () => void; icon?: 'bell' | 'arrow' };
}

/**
 * KPI lišta dashboardu — dlaždice s vlasovým rámečkem, velkou hodnotou
 * a drobnou akcí u pravé hrany; živý stav značí zelená pulsující tečka.
 *
 * `variant="dark"` (výchozí) je pro obsidiánový chrom stránky, `"light"`
 * pro BÍLOU hlavu /deals pod carouselem — tam by prosvětlená pole zmizela,
 * takže dlaždice drží bílá plocha s šedým rámečkem.
 */
export function CatalogKpis({
  items,
  variant = 'dark',
}: {
  items: CatalogKpi[];
  variant?: 'dark' | 'light';
}) {
  const light = variant === 'light';
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {items.map((k, i) => (
        <div
          key={k.label}
          className={`relative flex w-full flex-col items-stretch rounded-[1.25rem] border p-4 text-left transition-colors duration-200 sm:p-5 ${
            light
              ? 'border-zinc-200 bg-white hover:border-zinc-300'
              : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]'
          } ${
            MOBILE_ORDER[i] ?? ''
          } sm:order-none`}
        >
            <span className={`block truncate text-[11px] font-medium uppercase tracking-widest ${light ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {k.label}
            </span>
            {/* Akce sedí v řádku hodnoty u PRAVÉ hrany (pokyn) — dlaždice
                s akcí tím drží stejnou výšku jako ty bez ní. */}
            <span className="mt-2.5 flex min-h-[2rem] items-center gap-2.5">
              {k.liveDot && <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400" />}
              {typeof k.value === 'string' ? (
                <span className={`font-sans text-[1.6rem] font-medium leading-none tracking-tighter sm:text-3xl ${light ? 'text-zinc-900' : 'text-white'}`}>
                  {k.value}
                </span>
              ) : (
                k.value
              )}
              {k.action && (
                <button
                  type="button"
                  onClick={k.action.onClick}
                  className={`group/kpi ml-auto inline-flex shrink-0 items-center gap-1.5 text-xs font-medium underline-offset-2 transition-colors hover:underline ${light ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-300 hover:text-white'}`}
                >
                  {k.action.icon === 'arrow' ? (
                    <>
                      {k.action.label}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover/kpi:translate-x-0.5" />
                    </>
                  ) : (
                    <>
                      <Bell className="h-3 w-3" /> {k.action.label}
                    </>
                  )}
                </button>
              )}
            </span>
        </div>
      ))}
    </div>
  );
}
