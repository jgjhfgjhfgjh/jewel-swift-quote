import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useBrandCatalog } from '@/hooks/useBrandCatalog';
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel';

interface BrandCardData {
  key: string;
  name: string;
  slug: string;
  domain?: string;
  count: number;
  /** Raw manufacturer strings folded into this brand — used to drive the catalog filter */
  rawManufacturers: string[];
  products: { id: string; name: string; img: string }[];
}

interface BrandShowcaseCarouselProps {
  /** Filter mode (catalog): clicking a card toggles the brand as an active
   *  filter (blue check) instead of navigating to the brand-detail page. */
  selectable?: boolean;
  /** Raw manufacturer strings currently active in the filter bar. */
  selectedBrands?: string[];
  /** Toggle handler — receives all raw manufacturer strings of the brand. */
  onToggleBrand?: (rawManufacturers: string[]) => void;
  /** Dark variant (homepage černý panel): černá loga a texty bílé (invert+screen),
   *  produktové fotky s feather maskou, aby bílé JPG pozadí nesvítilo na černé. */
  dark?: boolean;
}

/** Showcase sizing (homepage) — identical to the hero banner cards */
const CARD_CLASS =
  'shrink-0 w-[80%] sm:w-[45%] lg:w-[30%] h-[390px] sm:h-[440px] lg:h-[480px]';
/** Compact sizing (catalog filter) — small fixed cards on every breakpoint,
 *  so mobile matches the shrunk desktop instead of a full-width showcase card */
const CARD_CLASS_COMPACT =
  'shrink-0 w-[150px] sm:w-[190px] lg:w-[210px] h-[210px] sm:h-[230px] lg:h-[240px]';
/** Product crossfade interval — faster than the brand-detail page (3500 ms) */
const ROTATE_MS = 1800;

/** Showcase (homepage) výchozí pořadí prvních značek — canonical UPPERCASE
 *  klíče (viz toBrandKey). Zbytek značek následuje v pořadí podle počtu. */
const PRIORITY_KEYS = ['SWAROVSKI', 'TOMMY HILFIGER', 'PANDORA', 'GUESS', 'TISSOT'];

/* ─── Single brand card — logo + crossfading products + CTA ─── */
function BrandCard({
  brand, selectable, active, onSelect, dark,
}: {
  brand: BrandCardData;
  selectable?: boolean;
  active?: boolean;
  onSelect?: () => void;
  dark?: boolean;
}) {
  // In filter (selectable) mode the card is compact — tighter spacing and no
  // centre-scale animation, so it reads as a control rather than a showcase.
  const compact = !!selectable;
  const cardClass = compact ? CARD_CLASS_COMPACT : CARD_CLASS;
  const scale = compact ? '' : 'transition-transform duration-500 ease-out group-data-[center]/card:scale-110';
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
      onClick={() => (selectable ? onSelect?.() : navigate(`/brands/${brand.slug}`))}
      aria-pressed={selectable ? active : undefined}
      className={`group/card relative flex flex-col cursor-pointer transition-shadow ${cardClass} ${
        compact ? 'overflow-hidden' : ''
      } ${selectable && active ? 'ring-2 ring-blue-500 ring-offset-2 rounded-sm' : ''}`}
    >
      {/* Active-filter check — same blue fajfka used on the homepage bullets */}
      {selectable && active && (
        <div className="absolute right-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-blue-100">
          <Check className="h-4 w-4 text-blue-600" strokeWidth={3} />
        </div>
      )}

      {/* Crossfading product image — hlavní plocha nahoře */}
      <div className={`relative flex-1 mx-4 mb-4 origin-bottom ${compact ? 'mt-3' : 'mt-6 sm:mt-8'} ${scale}`}>
        {n === 0 && (
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <span className={`font-display text-xl font-black tracking-tight text-center ${dark ? 'text-white/25' : 'text-muted-foreground/30'}`}>
              {brand.name}
            </span>
          </div>
        )}
        {brand.products.map((p, i) => (
          <div
            key={p.id}
            aria-hidden={i !== idx}
            className={`absolute inset-0 flex items-center justify-center p-2 transition-opacity duration-700 ease-in-out ${
              i === idx ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={p.img}
              alt={p.name}
              loading="lazy"
              draggable={false}
              className="max-h-full max-w-full object-contain"
              // Feather maska: bílé JPG pozadí (CDN bez CORS → nelze vyříznout
              // pixelově) se na černé rozpustí do měkkého oválu místo tvrdého
              // obdélníku; barvy produktu zůstávají beze změny.
              style={dark ? {
                maskImage: 'radial-gradient(ellipse 62% 62% at center, black 55%, transparent 98%)',
                WebkitMaskImage: 'radial-gradient(ellipse 62% 62% at center, black 55%, transparent 98%)',
              } : undefined}
            />
          </div>
        ))}
      </div>

      {/* Brand logo — pod produkty (popisky modelů odstraněny) */}
      <div className={`${compact ? 'h-10 px-3' : 'h-14 sm:h-16 px-6'} flex items-center justify-center shrink-0 ${scale}`}>
        {brand.domain ? (
          <BrandLogo
            name={brand.name}
            domain={brand.domain}
            width={400}
            height={160}
            className={`max-h-full object-contain ${
              dark ? 'invert mix-blend-screen' : '[mix-blend-mode:multiply]'
            } ${compact ? 'max-w-full' : 'max-w-[180px]'}`}
            fallbackClassName={`font-display font-black tracking-tight truncate max-w-full ${dark ? 'text-white' : 'text-foreground'} ${compact ? 'text-sm' : 'text-lg'}`}
          />
        ) : (
          <span className={`font-display font-black tracking-tight truncate max-w-full ${dark ? 'text-white' : 'text-foreground'} ${compact ? 'text-sm' : 'text-lg'}`}>{brand.name}</span>
        )}
      </div>

      {/* bottom spacer */}
      <div className={`${compact ? 'p-1.5' : 'p-4'} shrink-0`} />

    </div>
  );
}

/* ─── Carousel ─── */
export function BrandShowcaseCarousel({
  selectable, selectedBrands, onToggleBrand, dark,
}: BrandShowcaseCarouselProps = {}) {
  const { data: catalog = [] } = useBrandCatalog();

  // Live brand catalog (bound to the feed) — every brand, ordered by product
  // count. Brands without preview images stay in (with a text placeholder):
  // in selectable mode the card is a filter control, so a brand must never
  // silently disappear from the carousel.
  const brands = useMemo<BrandCardData[]>(() => {
    const mapped = catalog.map((e) => ({
      key: e.key,
      name: e.name,
      slug: e.slug,
      domain: e.domain,
      count: e.count,
      rawManufacturers: e.rawManufacturers,
      products: e.products
        .filter((p) => p.img)
        .slice(0, 10)
        .map((p) => ({ id: p.id, name: p.name, img: p.img })),
    }));

    // Showcase (homepage): pevné výchozí pořadí prvních značek; zbytek si
    // drží řazení podle počtu produktů (stabilní sort). Katalogový filtr
    // (selectable) zůstává čistě podle počtu.
    if (selectable) return mapped;
    const rank = new Map(PRIORITY_KEYS.map((k, i) => [k, i]));
    return [...mapped].sort(
      (a, b) => (rank.get(a.key) ?? Infinity) - (rank.get(b.key) ?? Infinity),
    );
  }, [catalog, selectable]);

  // A brand is "active" when any of its raw manufacturer strings is selected
  // in the filter bar. Toggling adds/removes all of them at once.
  const selectedSet = useMemo(() => new Set(selectedBrands ?? []), [selectedBrands]);
  const isActive = (b: BrandCardData) => b.rawManufacturers.some((m) => selectedSet.has(m));

  // Render the brand cards 3× for a seamless infinite loop
  const loop = useMemo(() => [...brands, ...brands, ...brands], [brands]);
  const { trackRef, go } = useInfiniteCarousel(brands.length);

  // Scroll-driven "hover": the card at the horizontal centre of the track
  // carries [data-center] and its content scales up. Transform-only and set
  // directly on the DOM (no React state, no layout shift) so the swipe stays
  // perfectly smooth.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || brands.length === 0) return;
    let raf = 0;
    let marked: HTMLElement | null = null;
    const update = () => {
      raf = 0;
      const cards = el.querySelectorAll<HTMLElement>('[data-card]');
      if (cards.length < 2) return;
      const step = cards[1].offsetLeft - cards[0].offsetLeft;
      const firstMid = cards[0].offsetLeft + cards[0].offsetWidth / 2;
      const centerX = el.scrollLeft + el.clientWidth / 2;
      const idx = Math.min(cards.length - 1, Math.max(0, Math.round((centerX - firstMid) / step)));
      const next = cards[idx];
      if (next !== marked) {
        marked?.removeAttribute('data-center');
        next.setAttribute('data-center', '');
        marked = next;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
      marked?.removeAttribute('data-center');
    };
  }, [brands.length, trackRef]);

  if (brands.length === 0) return null;

  return (
    <div
      className="relative w-full group"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div
        ref={trackRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch]
                   px-3 sm:px-5 lg:px-8 scroll-pl-0 sm:scroll-pl-5 lg:scroll-pl-8 pt-1 pb-4
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loop.map((brand, i) => (
          <BrandCard
            key={`${brand.key}-${i}`}
            brand={brand}
            selectable={selectable}
            active={selectable && isActive(brand)}
            onSelect={() => onToggleBrand?.(brand.rawManufacturers)}
            dark={dark}
          />
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
  );
}
