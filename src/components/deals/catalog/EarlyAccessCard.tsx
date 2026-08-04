import { ArrowRight, Check } from 'lucide-react';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

/** Ceník je nově přímo na stránce — CTA scrolluje na #gbd-pricing. */
const scrollToPricing = () =>
  document.getElementById('gbd-pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/**
 * Upsell karta Early Access — VŽDY na začátku první neprázdné sekce
 * katalogu. Věrná referenčnímu screenshotu: tmavá karta na bílé ploše,
 * modrý eyebrow, bílý+šedý headline, zelené fajfky, bílé pilulkové CTA.
 *
 * `variant="tile"` = dlaždice stejné velikosti jako karta dávky (mřížka),
 * `variant="row"` = plochý banner přes šířku seznamu (řádkové zobrazení).
 */
export function EarlyAccessCard({ variant = 'tile' }: { variant?: 'tile' | 'row' }) {
  const lang = useStore((s) => s.lang);
  const d = dealsI18n[lang];

  if (variant === 'row') {
    return (
      <button
        type="button"
        onClick={scrollToPricing}
        className="group flex w-full items-center gap-4 rounded-[1.25rem] bg-[#0B1215] px-5 py-4 text-left shadow-[0_14px_36px_-10px_rgba(11,18,21,0.5)] ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_52px_-14px_rgba(11,18,21,0.6)] hover:ring-white/25
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-widest text-blue-500">
            {d.catalog.dash.eyebrowPro}
          </span>
          <span className="mt-1 block truncate font-sans text-[15px] font-medium tracking-tighter">
            <span className="text-white">{d.early.headingLead} </span>
            <span className="text-zinc-400">{d.early.headingMuted}</span>
          </span>
        </span>
        <span className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-medium text-zinc-900 transition-colors group-hover:bg-slate-100">
          {d.early.ctaPro} <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={scrollToPricing}
      className="group flex h-full w-full flex-col rounded-[1.25rem] bg-[#0B1215] p-5 text-left shadow-[0_14px_36px_-10px_rgba(11,18,21,0.5)] ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_52px_-14px_rgba(11,18,21,0.6)] hover:ring-white/25
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:p-6"
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
