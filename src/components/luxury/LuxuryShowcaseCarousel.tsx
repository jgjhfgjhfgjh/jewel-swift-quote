import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { HouseLogo } from '@/components/luxury/HouseLogo';
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel';
import { LUXURY_HOUSES, type LuxuryHouse } from '@/data/luxuryCatalog';

/** Compact filter-strip sizing — a smaller sibling of the homepage
 *  BrandShowcaseCarousel cards (same anatomy, reduced scale). */
const CARD_CLASS =
  'shrink-0 w-[42%] sm:w-[30%] lg:w-[19%] h-[220px] sm:h-[240px] lg:h-[260px]';
/** Product crossfade interval — same rhythm as the homepage brand showcase. */
const ROTATE_MS = 1800;

/* ─── Single house card — same anatomy as the homepage BrandCard (logo on top,
 * crossfading product photos, crossfading model name), no CTA: the whole card
 * toggles this brand in the catalog filter. Multiple brands can be selected.
 * Houses without photos yet show their brand mark in the photo area. ─── */
function HouseCard({ house, selected, onToggle }: {
  house: LuxuryHouse;
  selected: boolean;
  onToggle: (brand: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  // Crossfade only through models that actually have an official photo.
  const models = useMemo(() => house.models.filter((m) => m.image), [house]);
  const n = models.length;

  // Crossfade only while the card is on screen (mirrors BrandShowcaseCarousel).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => setVisible(e[e.length - 1].isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || n <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), ROTATE_MS);
    return () => clearInterval(t);
  }, [visible, n]);

  return (
    <div
      ref={rootRef}
      data-card
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onToggle(house.name)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(house.name); } }}
      className={`group/card relative flex cursor-pointer flex-col rounded-xl transition-colors ${CARD_CLASS} ${
        selected ? 'bg-white ring-1 ring-zinc-900' : 'hover:bg-white/60'
      }`}
    >
      {/* Selected badge */}
      {selected && (
        <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white">
          <Check className="h-3 w-3" />
        </span>
      )}

      {/* Brand logo */}
      <div className="flex h-10 shrink-0 items-center justify-center px-4 pt-2 transition-transform duration-500 ease-out group-data-[center]/card:scale-110">
        <HouseLogo
          name={house.name} domain={house.domain} width={300} height={120}
          className="max-h-6 w-auto max-w-[120px] object-contain [mix-blend-mode:multiply]"
          textClassName="truncate text-sm font-medium text-zinc-800"
        />
      </div>

      {/* Crossfading product image (brand mark when no photos yet) */}
      <div className="relative mx-3 mb-1 mt-2 flex-1 origin-bottom transition-transform duration-500 ease-out group-data-[center]/card:scale-110">
        {n > 0 ? (
          models.map((m, i) => (
            <div
              key={m.model}
              aria-hidden={i !== idx}
              className={`absolute inset-0 flex items-center justify-center p-1 transition-opacity duration-700 ease-in-out ${i === idx ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={m.image}
                alt={m.model}
                loading="lazy"
                draggable={false}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <HouseLogo
              name={house.name} domain={house.domain} width={400} height={200}
              className="max-h-12 w-auto max-w-[130px] object-contain opacity-80 [mix-blend-mode:multiply]"
              textClassName="text-center text-lg font-medium leading-tight text-zinc-700"
            />
          </div>
        )}
      </div>

      {/* Crossfading model name */}
      <div className="relative mx-3 mb-3 h-4 shrink-0 transition-transform duration-500 ease-out group-data-[center]/card:scale-110">
        {n > 0 ? (
          models.map((m, i) => (
            <p
              key={m.model}
              aria-hidden={i !== idx}
              className={`absolute inset-x-0 truncate text-center text-[10px] text-zinc-500 transition-opacity duration-700 ease-in-out ${i === idx ? 'opacity-100' : 'opacity-0'}`}
            >
              {m.model}
            </p>
          ))
        ) : (
          <p className="absolute inset-x-0 truncate text-center text-[10px] text-zinc-400">
            {house.models.length} modelů na poptávku
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Compact carousel — multi-select brand filter for the catalog grid ─── */
export function LuxuryShowcaseCarousel({ selectedBrands, onToggleBrand }: {
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
}) {
  const houses = useMemo(() => LUXURY_HOUSES.filter((h) => h.models.length > 0), []);
  const loop = useMemo(() => [...houses, ...houses, ...houses], [houses]);
  const { trackRef, go } = useInfiniteCarousel(houses.length);

  // Scroll-driven centre detection — the centred card carries [data-center]
  // (transform-only, same mechanism as the homepage BrandShowcaseCarousel).
  useEffect(() => {
    const el = trackRef.current;
    if (!el || houses.length === 0) return;
    let raf = 0;
    let marked: HTMLElement | null = null;
    const update = () => {
      raf = 0;
      const cards = el.querySelectorAll<HTMLElement>('[data-card]');
      if (cards.length < 2) return;
      const step = cards[1].offsetLeft - cards[0].offsetLeft;
      const firstMid = cards[0].offsetLeft + cards[0].offsetWidth / 2;
      const centerX = el.scrollLeft + el.clientWidth / 2;
      const i = Math.min(cards.length - 1, Math.max(0, Math.round((centerX - firstMid) / step)));
      const next = cards[i];
      if (next !== marked) { marked?.removeAttribute('data-center'); next.setAttribute('data-center', ''); marked = next; }
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
  }, [houses.length, trackRef]);

  if (houses.length === 0) return null;

  return (
    <div className="group relative w-full" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div
        ref={trackRef}
        className="flex gap-2 overflow-x-auto overflow-y-hidden px-3 pb-3 pt-1 [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] scroll-pl-0 sm:gap-3 sm:scroll-pl-5 sm:px-5 lg:scroll-pl-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {loop.map((house, i) => (
          <HouseCard
            key={`${house.name}-${i}`}
            house={house}
            selected={selectedBrands.includes(house.name)}
            onToggle={onToggleBrand}
          />
        ))}
      </div>

      <button
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-none bg-white/70 text-zinc-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white lg:flex opacity-0 group-hover:opacity-100"
        aria-label="Předchozí"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-none bg-white/70 text-zinc-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white lg:flex opacity-0 group-hover:opacity-100"
        aria-label="Další"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
