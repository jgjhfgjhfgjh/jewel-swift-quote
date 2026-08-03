import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Lock, Tag } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
import { countLabel, dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import type { DealTileItem } from '@/lib/dealCatalog';

/**
 * Dlaždice dávky — obdoba karty podniku na Woltu: médium nahoře (logo
 * koncernu na jemném podkladu), stavový štítek vlevo nahoře, sleva vpravo,
 * pod tím název a metadata. Hover zvedne kartu a přiblíží logo.
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
    /* tmavé glass médium — logo koncernu jako bílá silueta (dashboard look);
       kampaňová fotka dealu (hero_image_url) má přednost — branding nese sama */
    <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-white/[0.03] p-6">
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
          fallbackClassName="text-center text-lg font-semibold tracking-tight text-white"
        />
      ) : (
        <span className="text-center text-lg font-semibold tracking-tight text-white">
          {item.supplier || item.title}
        </span>
      )}

      {/* stavový štítek vlevo nahoře */}
      <div className="absolute left-3 top-3">
        {item.kind === 'live' && item.deadline ? (
          <CountdownTimer deadline={item.deadline} variant="compact" lang={lang} />
        ) : item.kind === 'upcoming' && item.startsAt ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-zinc-200 ring-1 ring-white/15">
            <Lock className="h-3 w-3" /> {c.unlocksIn}
          </span>
        ) : item.kind === 'teaser' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/15 backdrop-blur">
            <Lock className="h-3 w-3" /> {c.upcoming}
          </span>
        ) : (
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-zinc-400">
            {c.closed}
          </span>
        )}
      </div>

      {item.maxDiscount > 0 && (
        <span className="absolute right-3 top-3 rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-bold text-red-400 ring-1 ring-red-500/25">
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
    <div className="flex flex-1 flex-col p-4">
      {item.supplier && (
        <span className="truncate text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          {item.supplier}
        </span>
      )}
      <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-white">
        {item.title}
      </h3>

      {item.brands.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {item.brands.slice(0, 3).map((b) => (
            <span key={b} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
              {b}
            </span>
          ))}
          {item.brands.length > 3 && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
              +{item.brands.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center gap-3 pt-4 text-[11px] text-zinc-400">
        {item.kind === 'teaser' ? (
          <span className="font-semibold text-zinc-500">{c.teaserNote}</span>
        ) : (
          <>
            {item.models > 0 && (
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" /> {countLabel(lang, item.models, 'models')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" /> {countLabel(lang, item.brands.length, 'brands')}
            </span>
          </>
        )}
        <ArrowRight className="ml-auto h-4 w-4 text-zinc-500 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white" />
      </div>
    </div>
  );

  /* tmavá glass karta (dashboard look) — hover zesvětlí plochu a „svítí"
     (černý stín by na obsidianu zanikl) */
  const shell =
    'group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white/[0.04] text-left ring-1 ring-white/10 ' +
    'transition-all duration-200 hover:-translate-y-1 hover:bg-white/[0.07] hover:ring-white/20 hover:shadow-[0_16px_36px_-14px_rgba(255,255,255,0.15)] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1215]';

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
