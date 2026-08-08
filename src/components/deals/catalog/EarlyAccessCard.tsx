import { ArrowRight, Check } from 'lucide-react';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

/** Ceník je nově přímo na stránce — CTA scrolluje na #gbd-pricing. */
const scrollToPricing = () =>
  document.getElementById('gbd-pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/**
 * Upsell karta Early Access — VŽDY na začátku první neprázdné sekce
 * katalogu: modrý eyebrow, bílý+šedý headline, zelené fajfky, bílé pilulkové
 * CTA.
 *
 * Plocha stránky je matně černá, takže tmavá karta by mezi bílými kartami
 * dávek splynula s pozadím. Drží ji proto vlastní ocelový gradient, vlasový
 * bílý ring a MODRÉ halo při hoveru — čte se jako záměrný jiný materiál,
 * ne jako díra v mřížce.
 *
 * `variant="tile"` = dlaždice stejné velikosti jako karta dávky (mřížka),
 * `variant="row"` = plochý banner přes šířku seznamu (řádkové zobrazení).
 */
/** Tvar ŘÁDKU (alerty i Early Access) — na mobilu sloupec s CTA přes celou
    šíři, od sm klasický řádek. Sdílí ho PublicAlertsRow, aby oba pruhy nad
    katalogem stály úplně stejně. */
export const EA_ROW_SHELL =
  'group flex w-full flex-col items-start gap-3 rounded-[1.25rem] px-5 py-4 text-left sm:flex-row sm:items-center sm:gap-4';

/** Tvar CTA pilulky v řádkové variantě — PEVNÁ šířka od sm, aby obě tlačítka
    pod sebou byla stejně dlouhá (různé délky vypadaly rozsypaně). */
export const EA_ROW_CTA =
  'inline-flex h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition-colors sm:w-[13.5rem]';

/** Sdílený materiál obou variant — ocelový gradient + ring + modré halo. */
const EA_SKIN =
  'bg-[linear-gradient(155deg,#1B2731_0%,#0E171C_52%,#0B1215_100%)] ring-1 ring-white/15 ' +
  'shadow-[0_14px_36px_-10px_rgba(0,0,0,0.8)] transition-all duration-200 ' +
  'hover:ring-blue-500/60 hover:shadow-[0_26px_58px_-14px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(59,130,246,0.45)] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1215]';
export function EarlyAccessCard({ variant = 'tile' }: { variant?: 'tile' | 'row' }) {
  const lang = useStore((s) => s.lang);
  const d = dealsI18n[lang];

  if (variant === 'row') {
    return (
      <button
        type="button"
        onClick={scrollToPricing}
        className={`${EA_ROW_SHELL} hover:-translate-y-0.5 ${EA_SKIN}`}
      >
        {/* w-full kvůli mobilnímu sloupci — jinak se text neomezí a přeteče */}
        <span className="w-full min-w-0 sm:flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-widest text-blue-500">
            {d.catalog.dash.eyebrowPro}
          </span>
          <span className="mt-1 block truncate font-sans text-[15px] font-medium tracking-tighter">
            <span className="text-white">{d.early.headingLead} </span>
            <span className="text-zinc-400">{d.early.headingMuted}</span>
          </span>
        </span>
        <span className={`${EA_ROW_CTA} bg-white text-zinc-900 group-hover:bg-slate-100`}>
          {d.early.ctaPro} <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={scrollToPricing}
      className={`group flex h-full w-full flex-col rounded-[1.25rem] p-5 text-left hover:-translate-y-1 sm:p-6 ${EA_SKIN}`}
    >
      <span className="text-[11px] font-bold uppercase tracking-widest text-blue-500">
        {d.catalog.dash.eyebrowPro}
      </span>
      <p className="mt-3 font-sans text-xl font-medium leading-snug tracking-tighter">
        <span className="text-white">{d.early.headingLead} </span>
        <span className="text-zinc-400">{d.early.headingMuted}</span>
      </p>
      <ul className="mt-4 space-y-2">
        {d.early.bullets.slice(0, 3).map((b) => (
          <li key={b} className="flex items-start gap-2 text-[13px] leading-snug text-zinc-300">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={2.5} />
            {b}
          </li>
        ))}
      </ul>
      <span className="mt-auto block pt-6">
        <span className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-white px-5 text-sm font-medium text-zinc-900 transition-colors group-hover:bg-slate-100">
          {d.early.ctaPro} <ArrowRight className="h-4 w-4" />
        </span>
      </span>
    </button>
  );
}
