import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useBrandCatalog } from '@/hooks/useBrandCatalog';
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel';

interface BrandCardData {
  key: string;
  name: string;
  slug: string;
  domain?: string;
  count: number;
  products: { id: string; name: string; img: string }[];
}

/** Card sizing — identical to the hero banner cards */
const CARD_CLASS =
  'shrink-0 w-[80%] sm:w-[45%] lg:w-[30%] h-[390px] sm:h-[440px] lg:h-[480px]';
/** Product crossfade interval — faster than the brand-detail page (3500 ms) */
const ROTATE_MS = 1800;

/* ─── Single brand card — logo + crossfading products + CTA ─── */
function BrandCard({ brand }: { brand: BrandCardData }) {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const n = brand.products.length;

  // Crossfade only while the card is on screen — with all brands rendered 3x,
  // off-screen intervals re-render constantly and jank the touch swipe.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => setVisible(entries[entries.length - 1].isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || n <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % n), ROTATE_MS);
    return () => clearInterval(id);
  }, [visible, n]);

  return (
    <div
      ref={rootRef}
      data-card
      className={`group/card relative flex flex-col ${CARD_CLASS}
        transition-[width] duration-500 ease-out
        lg:[@media(hover:hover)]:hover:w-[46%] lg:[@media(hover:hover)]:hover:delay-300`}
    >
      {/* Brand logo */}
      <div className="h-14 sm:h-16 flex items-center justify-center px-6 pt-1 shrink-0 transition-transform duration-500 ease-out lg:[@media(hover:hover)]:group-hover/card:scale-110 lg:[@media(hover:hover)]:group-hover/card:delay-300">
        {brand.domain ? (
          <BrandLogo
            name={brand.name}
            domain={brand.domain}
            width={400}
            height={160}
            className="max-h-full max-w-[180px] object-contain [mix-blend-mode:multiply]"
            fallbackClassName="font-display text-lg font-black tracking-tight text-foreground"
          />
        ) : (
          <span className="font-display text-lg font-black tracking-tight text-foreground">{brand.name}</span>
        )}
      </div>

      {/* Crossfading product image — bigger gap below the logo */}
      <div className="relative flex-1 mx-4 mt-[30px] sm:mt-10 lg:mt-[60px] mb-2 transition-transform duration-500 ease-out lg:[@media(hover:hover)]:group-hover/card:scale-110 lg:[@media(hover:hover)]:group-hover/card:delay-300">
        {brand.products.map((p, i) => (
          <div
            key={p.id}
            aria-hidden={i !== idx}
            className={`absolute inset-0 flex items-center justify-center p-2 transition-opacity duration-700 ease-in-out ${
              i === idx ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={p.img} alt={p.name} loading="lazy" draggable={false} className="max-h-full max-w-full object-contain" />
          </div>
        ))}
      </div>

      {/* Crossfading product name */}
      <div className="relative h-5 mx-4 shrink-0 transition-transform duration-500 ease-out lg:[@media(hover:hover)]:group-hover/card:scale-110 lg:[@media(hover:hover)]:group-hover/card:delay-300">
        {brand.products.map((p, i) => (
          <p
            key={p.id}
            aria-hidden={i !== idx}
            className={`absolute inset-x-0 text-center text-[11px] text-muted-foreground truncate transition-opacity duration-700 ease-in-out ${
              i === idx ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {p.name}
          </p>
        ))}
      </div>

      {/* CTA — free-floating, centered (no card frame to fill) */}
      <div className="p-4 shrink-0 flex justify-center transition-transform duration-500 ease-out lg:[@media(hover:hover)]:group-hover/card:scale-110 lg:[@media(hover:hover)]:group-hover/card:delay-300">
        <button
          type="button"
          onClick={() => navigate(`/brands/${brand.slug}`)}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-8 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors min-w-[200px]"
        >
          Zobrazit značku <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Carousel ─── */
export function BrandShowcaseCarousel() {
  const { data: catalog = [] } = useBrandCatalog();

  // Live brand catalog (bound to the feed) — all brands with product previews,
  // ordered by product count
  const brands = useMemo<BrandCardData[]>(() => {
    return catalog
      .filter((e) => e.products.length > 0)
      .map((e) => ({
        key: e.key,
        name: e.name,
        slug: e.slug,
        domain: e.domain,
        count: e.count,
        products: e.products
          .filter((p) => p.img)
          .slice(0, 10)
          .map((p) => ({ id: p.id, name: p.name, img: p.img })),
      }));
  }, [catalog]);

  // Render the brand cards 3× for a seamless infinite loop
  const loop = useMemo(() => [...brands, ...brands, ...brands], [brands]);
  const { trackRef, go } = useInfiniteCarousel(brands.length);

  if (brands.length === 0) return null;

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
        {loop.map((brand, i) => (
          <BrandCard key={`${brand.key}-${i}`} brand={brand} />
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
