import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { getBrandByName } from '@/data/brands';
import { CONCERNS, type Concern } from '@/data/concerns';
import { toBrandKey, toDisplayName } from '@/lib/brandNormalize';
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel';

interface Product {
  manufacturer: string;
}

interface ConcernCardData {
  concern: Concern;
  productCount: number;
  /** Canonical brand keys of this koncern that are actually present in the feed */
  brandKeys: string[];
}

/** Card sizing — mirrors the brand showcase / hero banner cards */
const CARD_CLASS =
  'shrink-0 w-[80%] sm:w-[46%] lg:w-[31%] h-[340px] sm:h-[360px]';

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
      className={`group/card relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-white shadow-md text-left transition-shadow hover:shadow-lg ${CARD_CLASS}`}
    >
      {/* Koncern logo */}
      <div className="h-16 sm:h-20 flex items-center justify-center px-6 pt-6 shrink-0">
        <BrandLogo
          name={concern.name}
          domain={concern.domain}
          width={400}
          height={160}
          className="max-h-full max-w-[200px] object-contain [mix-blend-mode:multiply]"
          fallbackClassName="font-display text-xl font-black tracking-tight text-foreground text-center"
        />
      </div>

      {/* Brand logos of the koncern */}
      <div className="flex-1 px-5 sm:px-6 py-3 grid grid-cols-3 gap-x-3 gap-y-2 place-items-center content-center">
        {logoBrands.map((key) => {
          const meta = getBrandByName(toDisplayName(key));
          return (
            <div key={key} className="flex h-10 w-full items-center justify-center">
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
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/products.json')
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch(() => {});
  }, []);

  const cards = useMemo<ConcernCardData[]>(() => {
    // Tally product counts and which brand keys appear in the feed, per koncern.
    const counts = new Map<string, number>(); // concern.slug → product count
    const presentKeys = new Map<string, Set<string>>(); // concern.slug → brand keys present

    for (const p of products) {
      if (!p.manufacturer) continue;
      const key = toBrandKey(p.manufacturer);
      const concern = CONCERNS.find((c) => c.brandKeys.includes(key));
      if (!concern) continue;
      counts.set(concern.slug, (counts.get(concern.slug) ?? 0) + 1);
      if (!presentKeys.has(concern.slug)) presentKeys.set(concern.slug, new Set());
      presentKeys.get(concern.slug)!.add(key);
    }

    return CONCERNS.map((concern) => ({
      concern,
      productCount: counts.get(concern.slug) ?? 0,
      brandKeys: Array.from(presentKeys.get(concern.slug) ?? []).sort((a, b) =>
        toDisplayName(a).localeCompare(toDisplayName(b), 'cs'),
      ),
    }))
      .filter((c) => c.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount);
  }, [products]);

  // Render the cards 3× for a seamless infinite loop
  const loop = useMemo(() => [...cards, ...cards, ...cards], [cards]);
  const { trackRef, go } = useInfiniteCarousel(cards.length);

  if (cards.length === 0) return null;

  return (
    <div
      className="relative w-full group"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div
        ref={trackRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto [-webkit-overflow-scrolling:touch]
                   px-3 sm:px-5 lg:px-8 scroll-pl-0 sm:scroll-pl-5 lg:scroll-pl-8 pb-1
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loop.map((data, i) => (
          <ConcernCard key={`${data.concern.slug}-${i}`} data={data} />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => go(-1)}
        className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-zinc-700 shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Předchozí"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-zinc-700 shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Další"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
