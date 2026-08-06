import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Lock, Tag } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
import { countLabel, dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import type { DealTileItem } from '@/lib/dealCatalog';
import { getDealVideo } from '@/data/dealVideos';
import { DealVideoMedia } from '@/components/deals/catalog/DealVideoMedia';
import { DealInventoryReel } from '@/components/deals/catalog/DealInventoryReel';
import { useDealReel } from '@/hooks/useDealReel';

/** EA pill vede na ceník na stránce (#gbd-pricing) — ne do karty. */
const scrollToPricing = () =>
  document.getElementById('gbd-pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/**
 * Dlaždice dávky — světlá varianta (jazyk bílých karet homepage): bílá karta
 * s hairline slate rámečkem a jemným stínem, médium na slate-50 s logem
 * koncernu v plných barvách (mix-blend multiply), data (sleva, počty) v mono
 * písmu. Sleva = červená pilulka (zavedený jazyk webu), zamčené stavy slate.
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

  /* Médium karty pro OBCHODNÍKA: první je „inventory reel" — mřížka skutečného
     zboží z dávky s cenami (odpovídá na „co v tom je a kolik na tom vydělám").
     Vygenerovaná reklama je až náhradník pro dávky bez produktových fotek —
     prodává touhu koncovému zákazníkovi, ne jistotu kupci. */
  const video = getDealVideo(item.concernSlug, item.supplier);
  const isRealDeal = item.kind !== 'teaser' && !!item.slug;
  const { data: reel = [] } = useDealReel(item.id, isRealDeal);
  const hasReel = isRealDeal && reel.length >= 4;

  const media = (
    /* médium — proporce PŘEVZATÉ z brandshow karuselu (kompaktní karta
       210×240 px = 7:8), aby produkt i logo značky měly stejný prostor jako
       tam; karta je tím vyšší, spodní část se lepí pod médium beze změny */
    <div className="relative flex aspect-[7/8] items-center justify-center overflow-hidden border-b border-slate-100 bg-slate-50 p-6">
      {hasReel ? (
        <DealInventoryReel
          dealId={item.id}
          concernName={item.concernName ?? item.supplier}
          concernDomain={item.concernDomain}
          className="absolute inset-0"
        />
      ) : video ? (
        <>
          <DealVideoMedia
            video={video}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {/* scrim + logo koncernu — video nese produkt, logo drží branding */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent"
          />
          {item.concernDomain && (
            <BrandLogo
              name={item.concernName ?? item.supplier}
              domain={item.concernDomain}
              width={200}
              height={80}
              className="absolute bottom-3 left-3 max-h-5 w-auto max-w-[110px] object-contain opacity-95 [filter:brightness(0)_invert(1)] drop-shadow"
              fallbackClassName="absolute bottom-3 left-3 text-xs font-bold text-white drop-shadow"
            />
          )}
        </>
      ) : item.heroImageUrl ? (
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
          /* logo koncernu vždy v PLNÉ barvě — i u teaserů („Připravujeme"):
             ztlumení působilo jako vada, že dávka neběží říkají zámek a štítek.
             PEVNÁ výška (ne max-h) → všechna loga mají napříč kartami stejnou
             vizuální váhu; max-w jen brání přetečení u velmi širokých značek. */
          className="h-11 w-auto max-w-[74%] object-contain opacity-100 [mix-blend-mode:multiply] transition-transform duration-300 group-hover:scale-[1.06]"
          fallbackClassName="text-center text-lg font-medium tracking-tight text-zinc-900"
        />
      ) : (
        <span className="text-center text-lg font-medium tracking-tight text-zinc-900">
          {item.supplier || item.title}
        </span>
      )}

      {/* horní pás štítků — JEDEN flex s wrapem místo dvou absolutních rohů:
          na úzké kartě se pravý cluster zalomí POD levý pill, nikdy se
          nepřekryjí (viz kolize EA pillu s „Připravujeme") */}
      <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-1.5">
        <div className="pointer-events-auto">
          {item.kind === 'live' && item.deadline ? (
            <CountdownTimer deadline={item.deadline} variant="compact" lang={lang} />
          ) : item.kind === 'upcoming' || item.kind === 'teaser' ? (
            /* EA upsell pill — SAMOSTATNÝ cíl uvnitř klikací karty: klik vede
               na ceník (stopPropagation + preventDefault), silný hover
               invertuje do plné modré; nápověda „co klik udělá" je TOOLTIP
               POD pillem (absolute) — nemění šířku pillu, takže nekoliduje
               se stavovým štítkem. span[role=button] kvůli vnoření. */
            <span
              role="button"
              tabIndex={0}
              aria-label={`${t.catalog.dash.earlyBadge} — ${t.catalog.dash.earlyBadgeHint}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollToPricing(); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); scrollToPricing(); }
              }}
              className="group/ea relative inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/95 px-2.5 py-1 text-[11px] font-bold text-blue-700 backdrop-blur
                         transition-all duration-200 hover:scale-[1.05] hover:border-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-[0_6px_16px_-4px_rgba(37,99,235,0.5)]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <Lock className="h-3 w-3" /> {t.catalog.dash.earlyBadge}
              <span className="pointer-events-none absolute left-0 top-full z-20 mt-1.5 whitespace-nowrap rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/ea:opacity-100 group-focus-visible/ea:opacity-100">
                {t.catalog.dash.earlyBadgeHint}
              </span>
            </span>
          ) : (
            <span className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-400 backdrop-blur">
              {c.closed}
            </span>
          )}
        </div>

        {/* pravý cluster: sleva + u připravovaných stavový štítek (bez zámku) */}
        <div className="pointer-events-auto ml-auto flex flex-col items-end gap-1.5">
          {/* kartová sleva jen BEZ reelu — s reelem už cenu i slevu nese pruh
              u konkrétního kusu a dvě červené pilulky si konkurují */}
          {!hasReel && item.maxDiscount > 0 && (
            /* sleva — červená pilulka, zavedený jazyk světlých karet webu */
            <span className="rounded-full bg-red-50 px-2.5 py-1 font-mono text-[11px] font-bold text-red-600 ring-1 ring-red-100">
              −{item.maxDiscount} %
            </span>
          )}
          {(item.kind === 'upcoming' || item.kind === 'teaser') && (
            <span className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-600 backdrop-blur">
              {item.kind === 'upcoming' ? c.unlocksIn : c.upcoming}
            </span>
          )}
        </div>
      </div>
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
        <span className="truncate text-[10px] font-medium uppercase tracking-widest text-slate-400">
          {item.supplier}
        </span>
      )}
      <h3 className="mt-1 line-clamp-2 text-[15px] font-medium leading-snug tracking-tight text-zinc-900">
        {item.title}
      </h3>

      {item.brands.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {item.brands.slice(0, 3).map((b) => (
            <span
              key={b}
              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600"
            >
              {b}
            </span>
          ))}
          {item.brands.length > 3 && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-400">
              +{item.brands.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center gap-3 pt-4 font-mono text-[11px] text-slate-500">
        {item.kind === 'teaser' ? (
          <span className="font-sans font-medium text-slate-400">{c.teaserNote}</span>
        ) : (
          <>
            {item.models > 0 && (
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3 text-slate-400" /> {countLabel(lang, item.models, 'models')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3 text-slate-400" /> {countLabel(lang, item.brands.length, 'brands')}
            </span>
          </>
        )}
        <ArrowRight className="ml-auto h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-zinc-900" />
      </div>
    </div>
  );

  /* Bílá karta s „netflixím" hoverem: karta se ZVĚTŠÍ a vystoupí NAD sousedy
     (relative + hover:z-20), stín se prohloubí. Detaily, na kterých ten efekt
     stojí:
      · `hover:delay-150` — Netflix nechá kartu vyskočit až když u ní myš chvíli
        zůstane; bez prodlevy grid poskakuje při každém přejetí kurzorem,
      · odchod BEZ prodlevy (delay-0 v základu) — zmenšení musí být okamžité,
        jinak se karty při rychlém pohybu překrývají,
      · `origin-center` + `duration-300 ease-out` — růst z těžiště, ne z rohu,
      · scale drží 1.05: víc už na krajních sloupcích leze mimo mřížku,
      · `motion-reduce:` vypne zvětšení i posun, zůstane jen stín. */
  const shell =
    'group relative flex h-full w-full flex-col overflow-hidden rounded-[1.25rem] border border-slate-100 bg-white text-left ' +
    'shadow-[0_8px_24px_-6px_rgba(15,23,42,0.10),0_2px_6px_rgba(15,23,42,0.05)] ' +
    'origin-center transition-all delay-0 duration-300 ease-out will-change-transform ' +
    'hover:z-20 hover:-translate-y-1.5 hover:scale-[1.05] hover:delay-150 ' +
    'hover:shadow-[0_28px_60px_-16px_rgba(15,23,42,0.28),0_6px_14px_rgba(15,23,42,0.10)] ' +
    'motion-reduce:transform-none motion-reduce:hover:transform-none ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

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
