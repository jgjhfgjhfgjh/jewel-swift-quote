import { ArrowRight, Bell } from 'lucide-react';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import { EA_ROW_CTA, EA_ROW_SHELL } from '@/components/deals/catalog/EarlyAccessCard';

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
  const t = dealsI18n[lang];
  /* Text bere ZAVEDENÉ znění alertů z webu („Nechte deal, ať si najde vás.") —
     tenhle pruh nemá vymýšlet vlastní slova. */
  const promo = t.catalog.promo;
  const d = t.catalog.dash;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${EA_ROW_SHELL} bg-white ring-1 ring-white/15
                 shadow-[0_14px_36px_-10px_rgba(0,0,0,0.8)] transition-all duration-200 hover:-translate-y-0.5
                 hover:shadow-[0_26px_58px_-14px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(255,255,255,0.45)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1215]`}
    >
      {/* w-full: ve sloupcovém (mobilním) rozvržení by se sloupec jinak
          roztáhl podle textu a řádek by přetekl ven z displeje */}
      <span className="w-full min-w-0 sm:flex-1">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-600">
          <Bell className="h-3 w-3" /> {d.alertRowEyebrow}
        </span>
        <span className="mt-1 block truncate font-sans text-[15px] font-medium tracking-tighter">
          <span className="text-zinc-900">{promo.alertTitle} </span>
          <span className="text-slate-400">{promo.alertSub}</span>
        </span>
      </span>
      {/* CTA drží STEJNOU šířku jako pilulka na Early Access řádku pod ním —
          dvě různě dlouhá tlačítka pod sebou vypadala rozsypaně */}
      <span className={`${EA_ROW_CTA} bg-zinc-900 text-white group-hover:bg-zinc-700`}>
        {promo.alertCta} <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
