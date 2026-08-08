import type { ReactNode } from 'react';
import { ArrowRight, Bell, X } from 'lucide-react';

/** Pastelová paleta hodnot — každá dlaždice mluví svou barvou (pokyn).
    Odstíny 300 drží na obsidiánu kontrast a přitom zůstanou pastelové. */
export const KPI_TONES = {
  blue: 'text-blue-300',
  violet: 'text-violet-300',
  rose: 'text-rose-300',
  mint: 'text-emerald-300',
} as const;

/* Na MOBILU se první dvě dlaždice prohodí: nejdůležitější („živé dealy")
   patří do pravého sloupce, tedy blíž palci pravačky. Od sm výš zůstává
   čtecí pořadí. Hodnoty musí být doslovné třídy, jinak je Tailwind
   nevygeneruje. */
const MOBILE_ORDER = ['order-2', 'order-1', 'order-3', 'order-4'];

export interface CatalogKpi {
  label: string;
  /** String se vysází velkou barevnou typografií, uzel (odpočet) se vloží tak, jak je. */
  value: ReactNode;
  /** Pulsující zelená tečka před hodnotou — živé dávky. */
  liveDot?: boolean;
  /** Pastelový odstín hodnoty; bez něj se sází bíle. */
  tone?: keyof typeof KPI_TONES;
  /** Drobná akce pod hodnotou — z mrtvého čísla konverzní bod
      („Živé dealy: 0" → alert) nebo zkratka na sekci („GoDeal" → scroll).
      `icon` volí zvoneček (alert, výchozí) nebo šipku (navigace). */
  action?: { label: string; onClick: () => void; icon?: 'bell' | 'arrow' };
  /** Klik na CELOU dlaždici — dashboard tak není jen ukazatel, ale ovladač
      (např. „nejvyšší sleva" rovnou odfiltruje dávky s tou slevou). Dlaždice
      dostane šipku v pravém dolním rohu. NEKOMBINOVAT s `action`: uvnitř
      tlačítka nesmí být další tlačítko. */
  onClick?: () => void;
  /** Filtr z této dlaždice právě běží — dlaždice svítí a šipka se otočí. */
  active?: boolean;
  /** Popisek pro čtečky + tooltip u klikací dlaždice. */
  hint?: string;
}

/**
 * KPI lišta dashboardu — tmavá hairline varianta na matně černé ploše:
 * dlaždice jsou jen jemně prosvětlené pole s vlasovým rámečkem, každá hodnota
 * ve svém pastelovém odstínu, živý stav značí zelená pulsující tečka. Chrom
 * stránky je záměrně tmavý — bílé zůstávají jen karty dávek.
 */
export function CatalogKpis({ items }: { items: CatalogKpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {items.map((k, i) => {
        /* flex column + items-stretch: dlaždice v mřížce se natahují na výšku
           řádku a tlačítko by svůj obsah svisle vycentrovalo — klikací dlaždice
           by tak seděla níž než ostatní. */
        const skin =
          `relative flex w-full flex-col items-stretch rounded-[1.25rem] border p-4 text-left transition-colors duration-200 sm:p-5 ` +
          `${MOBILE_ORDER[i] ?? ''} sm:order-none ` +
          (k.active
            ? 'border-white/40 bg-white/[0.10]'
            : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]');

        const inner = (
          <>
            <span className="block truncate text-[11px] font-medium uppercase tracking-widest text-zinc-500">
              {k.label}
            </span>
            <span className="mt-2.5 flex min-h-[2rem] items-center gap-2.5">
              {k.liveDot && <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400" />}
              {typeof k.value === 'string' ? (
                <span
                  className={`font-sans text-[1.6rem] font-medium leading-none tracking-tighter sm:text-3xl ${
                    k.tone ? KPI_TONES[k.tone] : 'text-white'
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
                className="group/kpi mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 underline-offset-2 transition-colors hover:text-white hover:underline"
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
          </>
        );

        return k.onClick ? (
          <button
            key={k.label}
            type="button"
            onClick={k.onClick}
            aria-pressed={k.active}
            aria-label={k.hint ? `${k.label} — ${k.hint}` : k.label}
            title={k.hint}
            className={`group/tile ${skin} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1215]`}
          >
            {inner}
            {/* pravý dolní roh: šipka = „dlaždice něco udělá", křížek =
                „filtr běží, klikem ho zruším" */}
            {k.active ? (
              <X className="absolute bottom-3.5 right-3.5 h-4 w-4 text-white" />
            ) : (
              <ArrowRight className="absolute bottom-3.5 right-3.5 h-4 w-4 text-zinc-500 transition-all duration-200 group-hover/tile:translate-x-0.5 group-hover/tile:text-white" />
            )}
          </button>
        ) : (
          <div key={k.label} className={skin}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
