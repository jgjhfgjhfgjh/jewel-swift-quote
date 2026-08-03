import { Link } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import type { DealTileItem } from '@/lib/dealCatalog';

/** Podkres bez kampaňové fotky — generovaný obsidianový přechod (public/). */
const FALLBACK_BG = '/gbd-spotlight-bg.jpg';

/**
 * Spotlight banner dashboardu — JEDNA nejnaléhavější dávka přes šířku hlavního
 * sloupce (běžící, jinak nejbližší připravovaná). Nahrazuje dřívější promo
 * karusel: dashboard nemá slidy, má jeden jasný highlight a data pod ním.
 */
export function DealSpotlight({ item }: { item: DealTileItem }) {
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang];
  const live = item.kind === 'live';

  const inner = (
    <div className="group relative flex h-[210px] flex-col justify-between overflow-hidden rounded-[24px] bg-white/[0.04] p-6 ring-1 ring-white/10 transition-all duration-300 hover:ring-white/20 sm:h-[250px] sm:p-8">
      {/* kampaňová fotka dealu, jinak generovaný obsidianový podkres */}
      <img
        src={item.heroImageUrl ?? FALLBACK_BG}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10"
      />

      <div className="relative flex items-start justify-between gap-4">
        {item.concernDomain ? (
          <BrandLogo
            name={item.concernName ?? item.supplier}
            domain={item.concernDomain}
            width={280}
            height={120}
            className="max-h-6 max-w-[140px] object-contain opacity-90 [filter:brightness(0)_invert(1)]"
            fallbackClassName="text-sm font-bold text-white"
          />
        ) : (
          <span className="text-sm font-bold text-white">{item.supplier}</span>
        )}
        {live && item.deadline ? (
          <CountdownTimer deadline={item.deadline} variant="compact" lang={lang} />
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-300 ring-1 ring-blue-400/30 backdrop-blur">
            <Lock className="h-3 w-3" /> {t.catalog.tile.upcoming}
          </span>
        )}
      </div>

      <div className="relative">
        <h2 className="max-w-[26ch] font-sans text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
          {item.title}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {item.maxDiscount > 0 && (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30 backdrop-blur">
              −{item.maxDiscount} %
            </span>
          )}
          {item.brands.slice(0, 3).map((b) => (
            <span key={b} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-zinc-200">
              {b}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors group-hover:bg-zinc-200">
            {t.card.view} <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );

  return item.slug ? (
    <Link to={`/deals/${item.slug}`} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
