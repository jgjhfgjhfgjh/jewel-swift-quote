import { Link } from 'react-router-dom';
import { ArrowRight, Watch, Gem, Package, Tag, Layers } from 'lucide-react';
import { useStore } from '@/lib/store';
import { dealsI18n } from '@/lib/i18n-deals';
import { dealIsLive, type Deal } from '@/lib/deals';
import { CountdownTimer } from './CountdownTimer';

const CATEGORY_ICON = { watches: Watch, jewelry: Gem, general: Package } as const;

/** A deal tile on the DEAL landing page. */
export function DealCard({ deal, count }: { deal: Deal; count: number }) {
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang].card;
  const Icon = CATEGORY_ICON[deal.category] ?? Package;
  const live = dealIsLive(deal);
  const maxDiscount = deal.tiers.reduce((m, x) => Math.max(m, x.discount_percent), 0);
  const shownBrands = deal.brands.slice(0, 4);
  const extraBrands = deal.brands.length - shownBrands.length;

  return (
    <Link
      to={`/deals/${deal.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200
        hover:-translate-y-1 hover:shadow-xl ${live ? 'border-slate-200' : 'border-slate-200 opacity-80'}`}
    >
      {/* visual */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950">
        {deal.hero_image_url ? (
          <img
            src={deal.hero_image_url}
            alt={deal.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon className="h-16 w-16 text-white/15" />
          </div>
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
          <div className="absolute right-3 top-3 rounded-xl bg-red-600 px-2.5 py-1.5 text-right text-white shadow-lg">
            <div className="text-[9px] font-semibold uppercase leading-none tracking-wide">{t.discountUpTo}</div>
            <div className="font-sans text-lg font-bold leading-none">−{maxDiscount} %</div>
          </div>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-5">
        {deal.supplier && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            {deal.supplier}
          </span>
        )}
        <h3 className="mt-1 font-sans text-lg font-bold leading-tight text-slate-900">
          {deal.title}
        </h3>
        {deal.subtitle && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{deal.subtitle}</p>
        )}

        {shownBrands.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {shownBrands.map((b) => (
              <span key={b} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {b}
              </span>
            ))}
            {extraBrands > 0 && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                +{extraBrands}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> {count} {t.models}
          </span>
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" /> {deal.brands.length} {t.brands}
          </span>
          <span className="ml-auto flex items-center gap-1 font-bold text-slate-900 transition-all group-hover:gap-2">
            {t.view} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
