import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Lock, Tag } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
import { countLabel, dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import type { DealTileItem } from '@/lib/dealCatalog';

/**
 * Řádek dávky pro seznamové zobrazení dashboardu — hustá, skenovatelná
 * obdoba DealTile ve světlé variantě: bílá karta s hairline rámečkem,
 * logo v plných barvách na slate-50, data v mono písmu, sleva červeně.
 */
export function DealListRow({
  item,
  onTeaserClick,
}: {
  item: DealTileItem;
  onTeaserClick?: () => void;
}) {
  const lang = useStore((s) => s.lang);
  const c = dealsI18n[lang].catalog.tile;

  const status =
    item.kind === 'live' && item.deadline ? (
      <CountdownTimer deadline={item.deadline} variant="compact" lang={lang} />
    ) : item.kind === 'upcoming' || item.kind === 'teaser' ? (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
        <Lock className="h-3 w-3" /> {item.kind === 'upcoming' ? c.unlocksIn : c.upcoming}
      </span>
    ) : (
      <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-400">
        {c.closed}
      </span>
    );

  const inner = (
    <>
      {/* logo koncernu — volně na bílé, plná barva, bez rámečku */}
      <span className="flex h-11 w-14 shrink-0 items-center justify-center">
        {item.concernDomain ? (
          <BrandLogo
            name={item.concernName ?? item.supplier}
            domain={item.concernDomain}
            width={200}
            height={80}
            className={`max-h-6 max-w-full object-contain [mix-blend-mode:multiply] ${
              item.kind === 'teaser' ? 'opacity-50' : 'opacity-90'
            }`}
            fallbackClassName="text-[9px] font-bold leading-none text-zinc-900"
          />
        ) : (
          <span className="truncate text-[9px] font-bold leading-none text-zinc-900">{item.supplier}</span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        {item.supplier && (
          <span className="block truncate text-[10px] font-medium uppercase tracking-widest text-slate-400">
            {item.supplier}
          </span>
        )}
        <span className="mt-0.5 block truncate text-sm font-medium tracking-tight text-zinc-900">
          {item.title}
        </span>
      </span>

      {/* počty — jen desktop, na mobilu je řádek už tak plný */}
      {item.kind !== 'teaser' && (
        <span className="hidden shrink-0 items-center gap-3 font-mono text-[11px] text-slate-500 md:flex">
          {item.models > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-slate-400" /> {countLabel(lang, item.models, 'models')}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-slate-400" /> {countLabel(lang, item.brands.length, 'brands')}
          </span>
        </span>
      )}

      {item.maxDiscount > 0 && (
        <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 font-mono text-[11px] font-bold text-red-600 ring-1 ring-red-100">
          −{item.maxDiscount} %
        </span>
      )}
      <span className="shrink-0">{status}</span>
      <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-zinc-900 sm:block" />
    </>
  );

  const shell =
    'group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left shadow-sm ' +
    'transition-all duration-200 hover:border-slate-300 hover:shadow-md sm:gap-4 sm:px-4 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

  if (item.kind === 'teaser' || !item.slug) {
    return (
      <button type="button" onClick={onTeaserClick} className={shell}>
        {inner}
      </button>
    );
  }
  return (
    <Link
      to={`/deals/${item.slug}`}
      className={`${shell} ${item.kind === 'closed' ? 'opacity-75 hover:opacity-100' : ''}`}
    >
      {inner}
    </Link>
  );
}
