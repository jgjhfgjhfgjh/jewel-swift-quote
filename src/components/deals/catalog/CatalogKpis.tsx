import type { ReactNode } from 'react';
import { ArrowRight, Bell } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

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
  /** Gradientová motion křivka u pravé hrany hodnoty — dekor z hero
      mockupu (nakreslí se tahem při zobrazení, tvar je pevný). */
  spark?: boolean;
}

/** Křivka ve značkovém gradientu — pathLength se dokreslí tahem (motion). */
function KpiSpark({ id, reduce }: { id: string; reduce: boolean }) {
  return (
    <svg viewBox="0 0 64 24" className="h-6 w-16 shrink-0 overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="0.5" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0 20 L10 16 L20 18 L30 10 L40 12 L52 5 L64 2"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="2"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.8, delay: 0.5, ease: 'easeOut' }}
      />
    </svg>
  );
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
  const reduce = useReducedMotion();
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
              {/* křivka sedí mezi hodnotou a akcí; bez akce jde k pravé hraně */}
              {k.spark && (
                <span className={k.action ? '' : 'ml-auto'}>
                  <KpiSpark id={`kpi-spark-${i}`} reduce={!!reduce} />
                </span>
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
