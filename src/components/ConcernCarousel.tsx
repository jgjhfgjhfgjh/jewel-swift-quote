import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { getBrandByName } from '@/data/brands';
import { CONCERNS, type Concern } from '@/data/concerns';
import { toDisplayName } from '@/lib/brandNormalize';
import { useBrandCatalog } from '@/hooks/useBrandCatalog';
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel';

interface ConcernCardData {
  concern: Concern;
  productCount: number;
  /** Canonical brand keys of this koncern that are actually present in the feed */
  brandKeys: string[];
}

/** Card sizing — same widths as the "Všechny značky" logo shelf cards */
const CARD_CLASS =
  'shrink-0 w-[clamp(200px,55vw,240px)] md:w-[240px] min-[1200px]:w-[280px] h-[340px] sm:h-[360px]';

/* ─── Single koncern card — logo + brand logos + stats + CTA (static) ─── */
function ConcernCard({ data }: { data: ConcernCardData }) {
  const navigate = useNavigate();
  const { concern, productCount, brandKeys } = data;
  const logoBrands = brandKeys.slice(0, 6);

  return (
    <button
      type="button"
      data-card
      onClick={() => navigate(`/koncerny/${concern.slug}`)}
      className={`group/card relative flex flex-col overflow-hidden rounded-none border border-border bg-white shadow-md text-left transition-shadow hover:shadow-lg ${CARD_CLASS}`}
    >
      {/* Koncern logo — labelled so it reads clearly as the parent group */}
      <div className="pt-4 shrink-0 flex flex-col items-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Koncern
        </span>
        <div className="h-12 sm:h-14 mt-1 flex items-center justify-center px-6">
          <BrandLogo
            name={concern.name}
            domain={concern.domain}
            width={400}
            height={160}
            className="max-h-full max-w-[200px] object-contain [mix-blend-mode:multiply]"
            fallbackClassName="font-display text-xl font-black tracking-tight text-foreground text-center"
          />
        </div>
      </div>

      {/* Divider — separates the group from its member brands */}
      <div className="px-6 mt-2 shrink-0 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Značky koncernu
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Member brand logos — wrapped rows, always centred (1 brand = centred) */}
      <div className="flex-1 px-5 sm:px-6 py-3 flex flex-wrap items-center justify-center content-center gap-x-3 gap-y-2">
        {logoBrands.map((key) => {
          const meta = getBrandByName(toDisplayName(key));
          return (
            <div key={key} className="flex h-10 w-[29%] items-center justify-center">
              {meta ? (
                <BrandLogo
                  name={meta.name}
                  domain={meta.domain}
                  width={240}
                  height={100}
                  className="max-h-9 max-w-full object-contain opacity-80 [mix-blend-mode:multiply]"
                  fallbackClassName="text-[11px] font-semibold text-muted-foreground text-center"
                />
              ) : (
                <span className="text-[11px] font-semibold text-muted-foreground text-center">
                  {toDisplayName(key)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="px-6 shrink-0">
        <p className="text-center text-xs text-muted-foreground">
          {brandKeys.length} {brandKeys.length === 1 ? 'značka' : brandKeys.length < 5 ? 'značky' : 'značek'}
          {' · '}
          {productCount} modelů
        </p>
      </div>

      {/* CTA */}
      <div className="p-4 shrink-0">
        <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white group-hover/card:bg-zinc-800 transition-colors">
          Zobrazit koncern <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

/* ─── Carousel ─── */
export function ConcernCarousel() {
  // Live brand catalog (bound to the feed) — counts per koncern follow it
  const { data: catalog = [] } = useBrandCatalog();

  const cards = useMemo<ConcernCardData[]>(() => {
    return CONCERNS.map((concern) => {
      const present = catalog.filter((e) => concern.brandKeys.includes(e.key));
      return {
        concern,
        productCount: present.reduce((sum, e) => sum + e.count, 0),
        brandKeys: present
          .map((e) => e.key)
          .sort((a, b) => toDisplayName(a).localeCompare(toDisplayName(b), 'cs')),
      };
    })
      .filter((c) => c.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount);
  }, [catalog]);

  // Render the cards 3× for a seamless infinite loop
  const loop = useMemo(() => [...cards, ...cards, ...cards], [cards]);
  const { trackRef, go } = useInfiniteCarousel(cards.length);

  if (cards.length === 0) return null;

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header — same look as the "Všechny značky" shelf header */}
      <div className="px-4 min-[480px]:px-5 md:px-8 min-[1200px]:px-11 flex items-center gap-3 sm:gap-4 mb-4">
        <h2 className="text-sm sm:text-base font-semibold text-foreground">
          Hodinářské koncerny
        </h2>
      </div>

      <div className="relative w-full group">
      <div
        ref={trackRef}
        className="flex flex-nowrap overflow-x-auto [-webkit-overflow-scrolling:touch] pb-2
                   gap-3 min-[480px]:gap-4 md:gap-5 min-[1200px]:gap-6
                   px-4 min-[480px]:px-5 md:px-8 min-[1200px]:px-11
                   scroll-pl-4 min-[480px]:scroll-pl-5 md:scroll-pl-8 min-[1200px]:scroll-pl-11
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loop.map((data, i) => (
          <ConcernCard key={`${data.concern.slug}-${i}`} data={data} />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => go(-1)}
        className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-none bg-white/70 backdrop-blur-sm text-zinc-700 shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Předchozí"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-none bg-white/70 backdrop-blur-sm text-zinc-700 shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Další"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      </div>
    </div>
  );
}
