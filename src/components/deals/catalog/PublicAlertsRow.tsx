import { ArrowRight, Bell } from 'lucide-react';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import { EA_ROW_CTA, EA_ROW_SHELL } from '@/components/deals/catalog/EarlyAccessCard';

/**
 * Veřejný alertový řádek — nejnižší schod konverze: alerty jsou zdarma a pro
 * každého, takže pruh stojí úplně první, nad KPI lištou i nad katalogem.
 *
 * Materiál je STEJNÝ jako KPI dlaždice pod ním (vlasový bílý rámeček na 4%
 * bílé ploše): patří do chromu stránky, ne mezi zboží. Jediná bílá plocha
 * je CTA pilulka — akce se tím drží stejného jazyka jako aktivní stavy
 * v řídicí liště.
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
      className={`${EA_ROW_SHELL} border border-white/10 bg-white/[0.04] transition-colors duration-200
                 hover:border-white/20 hover:bg-white/[0.07]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1215]`}
    >
      {/* w-full: ve sloupcovém (mobilním) rozvržení by se sloupec jinak
          roztáhl podle textu a řádek by přetekl ven z displeje */}
      <span className="w-full min-w-0 sm:flex-1">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-400">
          <Bell className="h-3 w-3" /> {d.alertRowEyebrow}
        </span>
        <span className="mt-1 block truncate font-sans text-[15px] font-medium tracking-tighter">
          <span className="text-white">{promo.alertTitle} </span>
          <span className="text-zinc-500">{promo.alertSub}</span>
        </span>
      </span>
      {/* CTA drží STEJNOU šířku jako pilulka na Early Access řádku pod ním —
          dvě různě dlouhá tlačítka pod sebou vypadala rozsypaně */}
      <span className={`${EA_ROW_CTA} bg-white text-zinc-900 group-hover:bg-zinc-200`}>
        {promo.alertCta} <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
