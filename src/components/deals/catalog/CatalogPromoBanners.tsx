import { ArrowRight, Bell, Lock } from 'lucide-react';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

/** Ceník Early Access je přímo na stránce — CTA na něj odroluje. */
const scrollToPricing = () =>
  document.getElementById('gbd-pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/**
 * Dvojice bannerů pod KPI lištou v bílé hlavě /deals: alerty zdarma vlevo,
 * Early Access vpravo — dva schody téhož (zdarma → placený náskok), proto
 * stojí vedle sebe a ne pod sebou.
 *
 * Materiál drží bílou hlavu: bílá plocha, šedý vlasový rámeček, plná černá
 * pilulka jako akce. WantDeal a SplitDeal tu nejsou — ty mají vlastní
 * dlaždice v KPI liště nad tím.
 */
export function CatalogPromoBanners({ onAlerts }: { onAlerts: () => void }) {
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang];
  const promo = t.catalog.promo;
  const d = t.catalog.dash;

  const banners = [
    {
      key: 'alerts',
      icon: Bell,
      eyebrow: d.alertRowEyebrow,
      title: promo.alertTitle,
      sub: promo.alertSub,
      cta: promo.alertCta,
      onClick: onAlerts,
    },
    {
      key: 'ea',
      icon: Lock,
      eyebrow: d.eyebrowPro,
      title: t.early.headingLead,
      sub: t.early.headingMuted,
      cta: t.early.ctaPro,
      onClick: scrollToPricing,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
      {banners.map((b) => (
        <button
          key={b.key}
          type="button"
          onClick={b.onClick}
          className="group/promo flex w-full flex-col items-start gap-3 rounded-[1.25rem] border border-zinc-200 bg-white p-4 text-left transition-colors duration-200 hover:border-zinc-300 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
        >
          <span className="w-full min-w-0 sm:flex-1">
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-zinc-400">
              <b.icon className="h-3 w-3" /> {b.eyebrow}
            </span>
            <span className="mt-1.5 block font-sans text-[15px] font-medium leading-snug tracking-tighter">
              <span className="text-zinc-900">{b.title} </span>
              <span className="text-zinc-500">{b.sub}</span>
            </span>
          </span>
          {/* pilulka drží pevnou šířku od sm — dva různě dlouhé popisky
              vedle sebe by jinak vypadaly rozsypaně */}
          <span className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-4 text-[13px] font-medium text-white transition-colors group-hover/promo:bg-zinc-700 sm:w-[13.5rem]">
            {b.cta} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </button>
      ))}
    </div>
  );
}
