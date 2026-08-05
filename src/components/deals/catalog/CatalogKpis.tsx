import type { ReactNode } from 'react';
import { ArrowRight, Bell } from 'lucide-react';

export interface CatalogKpi {
  label: string;
  /** String se vysází velkou tmavou typografií, uzel (odpočet) se vloží tak, jak je. */
  value: ReactNode;
  /** Pulsující zelená tečka před hodnotou — živé dávky. */
  liveDot?: boolean;
  /** Historicky zvýrazněná hodnota (sleva) — světlá varianta ji sází tmavě;
      prop zůstává v signatuře kvůli volajícím. */
  gradient?: boolean;
  /** Hodnotu vysází modře — stejný `blue-500` jako eyebrow na EarlyAccessCard,
      takže „živé dávky" a Early Access mluví v katalogu jednou barvou. */
  accent?: boolean;
  /** Drobná akce pod hodnotou — z mrtvého čísla konverzní bod
      („Živé dealy: 0" → alert) nebo zkratka na sekci („See all" → scroll).
      `icon` volí zvoneček (alert, výchozí) nebo šipku (navigace). */
  action?: { label: string; onClick: () => void; icon?: 'bell' | 'arrow' };
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
          className="rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.10),0_2px_6px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-[0_20px_44px_-12px_rgba(15,23,42,0.18),0_4px_10px_rgba(15,23,42,0.07)] sm:p-5"
        >
          <span className="block truncate text-[11px] font-medium uppercase tracking-widest text-slate-400">
            {k.label}
          </span>
          <span className="mt-2.5 flex min-h-[2rem] items-center gap-2.5">
            {k.liveDot && <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />}
            {typeof k.value === 'string' ? (
              <span
                className={`font-sans text-[1.6rem] font-medium leading-none tracking-tighter sm:text-3xl ${
                  k.accent ? 'text-blue-500' : 'text-zinc-900'
                }`}
              >
                {k.value}
              </span>
            ) : (
              k.value
            )}
          </span>
          {k.action && (
            <button
              type="button"
              onClick={k.action.onClick}
              className="group/kpi mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-900 underline-offset-2 transition-colors hover:underline"
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
        </div>
      ))}
    </div>
  );
}
