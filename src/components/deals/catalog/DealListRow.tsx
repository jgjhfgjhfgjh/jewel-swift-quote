import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Lock, Tag } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
import { countLabel, dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import type { DealTileItem } from '@/lib/dealCatalog';

/** Kanonický gradient webu (eyebrow dodavatele — shodně s DealTile). */
const GRADIENT = 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent';

/**
 * Řádek dávky pro seznamové zobrazení dashboardu — hustá, skenovatelná
 * obdoba DealTile: logo, titul, počty, sleva a stav na jednom řádku.
 * Stejný barevný jazyk: zelená = přínos, modrá = zamčeno, červená jen odpočet.
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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-2.5 py-1 text-[11px] font-bold text-blue-300 ring-1 ring-blue-400/30">
        <Lock className="h-3 w-3" /> {item.kind === 'upcoming' ? c.unlocksIn : c.upcoming}
      </span>
    ) : (
      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-zinc-400">
        {c.closed}
      </span>
    );

  const inner = (
    <>
      {/* logo koncernu — bílá silueta na glass podkladu, jako médium DealTile */}
      <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] p-2 ring-1 ring-white/10">
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
          <span className={`block truncate text-[10px] font-bold uppercase tracking-wider ${GRADIENT}`}>
            {item.supplier}
          </span>
        )}
        <span className="mt-0.5 block truncate text-sm font-semibold tracking-tight text-white">
          {item.title}
        </span>
      </span>

      {/* počty — jen desktop, na mobilu je řádek už tak plný */}
      {item.kind !== 'teaser' && (
        <span className="hidden shrink-0 items-center gap-3 text-[11px] text-zinc-400 md:flex">
          {item.models > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-emerald-400" /> {countLabel(lang, item.models, 'models')}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-emerald-400" /> {countLabel(lang, item.brands.length, 'brands')}
          </span>
        </span>
      )}

      {item.maxDiscount > 0 && (
        <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/30">
          −{item.maxDiscount} %
        </span>
      )}
      <span className="shrink-0">{status}</span>
      <ArrowRight className="hidden h-4 w-4 shrink-0 text-zinc-500 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white sm:block" />
    </>
  );

  const shell =
    'group flex w-full items-center gap-3 rounded-2xl bg-white/[0.04] px-3.5 py-3 text-left ring-1 ring-white/10 ' +
    'transition-all duration-200 hover:bg-white/[0.07] hover:ring-white/20 sm:gap-4 sm:px-4 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1215]';

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
