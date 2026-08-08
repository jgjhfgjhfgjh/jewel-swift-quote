import { ArrowRight, Bell } from 'lucide-react';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

/**
 * Veřejný alertový řádek — nejnižší schod konverze nad katalogem: alerty jsou
 * zdarma a pro každého, takže tenhle pruh stojí NAD upsellem Early Access
 * i nad první kategorií dávek (není součástí žádné sekce).
 *
 * Materiál je zrcadlo Early Access řádku: stejný tvar i chování hoveru,
 * jen BÍLÝ — dvojice pak čte jako „zdarma / placené".
 */
export function PublicAlertsRow({ onClick }: { onClick: () => void }) {
  const lang = useStore((s) => s.lang);
  const d = dealsI18n[lang].catalog.dash;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-[1.25rem] bg-white px-5 py-4 text-left ring-1 ring-white/15
                 shadow-[0_14px_36px_-10px_rgba(0,0,0,0.8)] transition-all duration-200 hover:-translate-y-0.5
                 hover:shadow-[0_26px_58px_-14px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(255,255,255,0.45)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1215]"
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-600">
          <Bell className="h-3 w-3" /> {d.alertRowEyebrow}
        </span>
        <span className="mt-1 block truncate font-sans text-[15px] font-medium tracking-tighter">
          <span className="text-zinc-900">{d.alertRowTitle} </span>
          <span className="text-slate-400">{d.alertRowMuted}</span>
        </span>
      </span>
      <span className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-4 text-[13px] font-medium text-white transition-colors group-hover:bg-zinc-700">
        {d.alertRowCta} <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
