import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Watch, Gem, Package, Tag, Layers } from 'lucide-react';
import { useStore } from '@/lib/store';
import { countLabel, dealsI18n } from '@/lib/i18n-deals';
import { dealIsLive, type Deal } from '@/lib/deals';
import { CountdownTimer } from './CountdownTimer';
import { BrandLogo } from '@/components/BrandLogo';
import { CONCERNS, getConcernForBrandKey } from '@/data/concerns';
import { toBrandKey } from '@/lib/brandNormalize';

const CATEGORY_ICON = { watches: Watch, jewelry: Gem, general: Package } as const;

/** A deal tile on the DEAL landing page.
 *
 *  Vizuál sdílí jazyk karet ze sekce GoBigDeal na homepage (StripLiveCard):
 *  bílá karta rounded-2xl, semibold tracking-tight nadpisy a tlumená červená
 *  pilulka místo křiklavého badge — karta tak funguje i na černém pozadí. */
export function DealCard({ deal, count }: { deal: Deal; count: number }) {
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang].card;
  const Icon = CATEGORY_ICON[deal.category] ?? Package;
  const live = dealIsLive(deal);

  // The watch concern behind this deal — matched by supplier/title name first,
  // then derived from the deal's brands. Its logo is shown on white.
  const concern = useMemo(() => {
    const hay = `${deal.supplier} ${deal.title}`.toLowerCase();
    const byName = CONCERNS.find((c) => hay.includes(c.name.toLowerCase()));
    if (byName) return byName;
    for (const b of deal.brands) {
      const c = getConcernForBrandKey(toBrandKey(b));
      if (c) return c;
    }
    return null;
  }, [deal]);
  const maxDiscount = deal.tiers.reduce((m, x) => Math.max(m, x.discount_percent), 0);
  const shownBrands = deal.brands.slice(0, 4);
  const extraBrands = deal.brands.length - shownBrands.length;

  return (
    <Link
      to={`/deals/${deal.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200
        hover:-translate-y-1 hover:shadow-xl ${live ? 'border-slate-200' : 'border-slate-200 opacity-70'}`}
    >
      {/* visual — concern logo on white */}
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden border-b border-slate-100 bg-white p-6">
        {concern ? (
          <BrandLogo
            name={concern.name}
            domain={concern.domain}
            width={440}
            height={180}
            className="max-h-16 max-w-[72%] object-contain [mix-blend-mode:multiply] transition-transform duration-300 group-hover:scale-105"
            fallbackClassName="text-2xl font-semibold tracking-tight text-slate-900 text-center"
          />
        ) : (
          <span className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900 text-center">
            <Icon className="h-6 w-6 text-slate-400" /> {deal.supplier || deal.title}
          </span>
        )}
        <div className="absolute left-3 top-3">
          {live ? (
            <CountdownTimer deadline={deal.deadline} variant="compact" />
          ) : (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
              {deal.status === 'ended' ? t.ended : t.closed}
            </span>
          )}
        </div>
        {maxDiscount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 ring-1 ring-red-100">
            {t.discountUpTo} {maxDiscount} %
          </span>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-5">
        {deal.supplier && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {deal.supplier}
          </span>
        )}
        <h3 className="mt-1.5 text-lg font-semibold leading-snug tracking-tight text-slate-900">
          {deal.title}
        </h3>
        {deal.subtitle && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">{deal.subtitle}</p>
        )}

        {shownBrands.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {shownBrands.map((b) => (
              <span key={b} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {b}
              </span>
            ))}
            {extraBrands > 0 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                +{extraBrands}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center gap-4 pt-5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> {countLabel(lang, count, 'models')}
          </span>
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" /> {countLabel(lang, deal.brands.length, 'brands')}
          </span>
          <span className="ml-auto flex items-center gap-1 font-semibold text-slate-900 transition-all group-hover:gap-2">
            {t.view} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
