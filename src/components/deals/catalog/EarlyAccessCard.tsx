import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

/**
 * Upsell karta Early Access — VŽDY první dlaždice první řady katalogu,
 * stejná velikost jako karta dávky. Věrná referenčnímu screenshotu: tmavá
 * karta na bílé ploše, modrý eyebrow, bílý+šedý headline, zelené fajfky,
 * bílé pilulkové CTA (text CTA dle přejmenování tarifu na Early Access).
 */
export function EarlyAccessCard() {
  const lang = useStore((s) => s.lang);
  const d = dealsI18n[lang];

  return (
    <Link
      to="/#gbd-pricing"
      className="group flex h-full w-full flex-col rounded-xl bg-[#0B1215] p-5 text-left ring-1 ring-white/10 transition-all duration-200 hover:ring-white/25
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
    </Link>
  );
}
