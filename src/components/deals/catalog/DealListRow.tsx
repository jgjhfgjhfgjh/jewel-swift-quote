import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Lock, Tag } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
import { countLabel, dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import type { DealTileItem } from '@/lib/dealCatalog';

/**
 * Řádek dávky pro seznamové zobrazení dashboardu — hustá, skenovatelná
 * obdoba DealTile v hairline monochromu: #050505 karta s vláskovým rámečkem,
 * data (počty, sleva) v mono písmu, stavy jako bordered chipy.
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
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-neutral-300">
        <Lock className="h-3 w-3" /> {item.kind === 'upcoming' ? c.unlocksIn : c.upcoming}
      </span>
    ) : (
      <span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-neutral-500">
        {c.closed}
      </span>
    );

  const inner = (
    <>
      {/* logo koncernu — bílá silueta na černém podkladu */}
      <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-black p-2">
        {item.concernDomain ? (
          <BrandLogo
            name={item.concernName ?? item.supplier}
            domain={item.concernDomain}
            width={200}
            height={80}
            className={`max-h-5 max-w-full object-contain [filter:brightness(0)_invert(1)] ${
              item.kind === 'teaser' ? 'opacity-45' : 'opacity-90'
            }`}
            fallbackClassName="text-[9px] font-bold leading-none text-white"
          />
        ) : (
          <span className="truncate text-[9px] font-bold leading-none text-white">{item.supplier}</span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        {item.supplier && (
          <span className="block truncate text-[10px] font-medium uppercase tracking-widest text-neutral-500">
            {item.supplier}
          </span>
        )}
        <span className="mt-0.5 block truncate text-sm font-medium tracking-tight text-white">
          {item.title}
        </span>
      </span>

      {/* počty — jen desktop, na mobilu je řádek už tak plný */}
      {item.kind !== 'teaser' && (
        <span className="hidden shrink-0 items-center gap-3 font-mono text-[11px] text-neutral-400 md:flex">
          {item.models > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-neutral-500" /> {countLabel(lang, item.models, 'models')}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-neutral-500" /> {countLabel(lang, item.brands.length, 'brands')}
          </span>
        </span>
      )}

      {item.maxDiscount > 0 && (
        <span className="shrink-0 rounded-full border border-white/[0.15] bg-white/[0.05] px-2.5 py-1 font-mono text-[11px] font-medium text-white">
          −{item.maxDiscount} %
        </span>
      )}
      <span className="shrink-0">{status}</span>
      <ArrowRight className="hidden h-4 w-4 shrink-0 text-neutral-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white sm:block" />
    </>
  );

  const shell =
    'group flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-[#050505] px-3.5 py-3 text-left ' +
    'transition-colors duration-200 hover:border-white/[0.15] sm:gap-4 sm:px-4 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black';

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
