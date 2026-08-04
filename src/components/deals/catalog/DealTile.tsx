import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Lock, Tag } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
import { countLabel, dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import type { DealTileItem } from '@/lib/dealCatalog';

/**
 * Dlaždice dávky — hairline monochrom (referenční bento grid): karta #050505
 * s vláskovým rámečkem, hover jen zjasní rámeček; médium odděluje vláskový
 * border-t, tělo sedí na sotva znatelném podkladu. Data (sleva, počty) v mono
 * písmu, stavy jako bordered chipy — bez barevných akcentů, urgenci nese
 * jen sdílený odpočet.
 *
 * Teaser (`kind: 'teaser'`) je připravovaná dávka bez dat — nikdy nepředstírá
 * živou nabídku: má zámek, štítek „Připravujeme" a klik vede na alert.
 */
export function DealTile({
  item,
  onTeaserClick,
}: {
  item: DealTileItem;
  /** Klik na teaser dlaždici (hradlo registrace / alert). */
  onTeaserClick?: () => void;
}) {
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang];
  const c = t.catalog.tile;

  const media = (
    /* médium — logo koncernu jako bílá silueta na černé ploše */
    <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-white/[0.04] bg-black p-6">
      {item.heroImageUrl ? (
        <img
          src={item.heroImageUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      ) : item.concernDomain ? (
        <BrandLogo
          name={item.concernName ?? item.supplier}
          domain={item.concernDomain}
          width={360}
          height={150}
          className={`max-h-12 max-w-[74%] object-contain [filter:brightness(0)_invert(1)] transition-all duration-300 group-hover:scale-[1.06] ${
            /* teaser: koncern zůstává čitelný (o to jde), jen ztlumený —
               že dávka ještě neběží, říká zámek a štítek */
            item.kind === 'teaser' ? 'opacity-45 group-hover:opacity-90' : 'opacity-90 group-hover:opacity-100'
          }`}
          fallbackClassName="text-center text-lg font-medium tracking-tight text-white"
        />
      ) : (
        <span className="text-center text-lg font-medium tracking-tight text-white">
          {item.supplier || item.title}
        </span>
      )}

      {/* stavový štítek vlevo nahoře */}
      <div className="absolute left-3 top-3">
        {item.kind === 'live' && item.deadline ? (
          <CountdownTimer deadline={item.deadline} variant="compact" lang={lang} />
        ) : item.kind === 'upcoming' && item.startsAt ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-black/60 px-2.5 py-1 text-[11px] font-medium text-neutral-300 backdrop-blur">
            <Lock className="h-3 w-3" /> {c.unlocksIn}
          </span>
        ) : item.kind === 'teaser' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-black/60 px-2.5 py-1 text-[11px] font-medium text-neutral-300 backdrop-blur">
            <Lock className="h-3 w-3" /> {c.upcoming}
          </span>
        ) : (
          <span className="rounded-full border border-white/[0.08] bg-black/60 px-2.5 py-1 text-[11px] font-medium text-neutral-500 backdrop-blur">
            {c.closed}
          </span>
        )}
      </div>

      {item.maxDiscount > 0 && (
        /* sleva — mono číslo v bordered chipu, jediný „datový" akcent karty */
        <span className="absolute right-3 top-3 rounded-full border border-white/[0.2] bg-black/60 px-2.5 py-1 font-mono text-[11px] font-medium text-white backdrop-blur">
          −{item.maxDiscount} %
        </span>
      )}
      {item.kind === 'upcoming' && item.startsAt && (
        <span className="absolute bottom-3 right-3">
          <CountdownTimer deadline={item.startsAt} variant="compact" lang={lang} />
        </span>
      )}
    </div>
  );

  const body = (
    <div className="flex flex-1 flex-col bg-white/[0.01] p-4">
      {item.supplier && (
        <span className="truncate text-[10px] font-medium uppercase tracking-widest text-neutral-500">
          {item.supplier}
        </span>
      )}
      <h3 className="mt-1 line-clamp-2 text-[15px] font-medium leading-snug tracking-tight text-white">
        {item.title}
      </h3>

      {item.brands.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {item.brands.slice(0, 3).map((b) => (
            <span
              key={b}
              className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10px] font-medium text-neutral-400"
            >
              {b}
            </span>
          ))}
          {item.brands.length > 3 && (
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10px] font-medium text-neutral-600">
              +{item.brands.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center gap-3 pt-4 font-mono text-[11px] text-neutral-400">
        {item.kind === 'teaser' ? (
          <span className="font-sans font-medium text-neutral-500">{c.teaserNote}</span>
        ) : (
          <>
            {item.models > 0 && (
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3 text-neutral-500" /> {countLabel(lang, item.models, 'models')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3 text-neutral-500" /> {countLabel(lang, item.brands.length, 'brands')}
            </span>
          </>
        )}
        <ArrowRight className="ml-auto h-4 w-4 text-neutral-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white" />
      </div>
    </div>
  );

  /* hairline karta — hover pouze zjasní rámeček (jazyk referenčního gridu) */
  const shell =
    'group flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#050505] text-left ' +
    'transition-colors duration-200 hover:border-white/[0.15] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black';

  if (item.kind === 'teaser' || !item.slug) {
    return (
      <button type="button" onClick={onTeaserClick} className={shell}>
        {media}
        {body}
      </button>
    );
  }

  return (
    <Link to={`/deals/${item.slug}`} className={`${shell} ${item.kind === 'closed' ? 'opacity-75 hover:opacity-100' : ''}`}>
      {media}
      {body}
    </Link>
  );
}
