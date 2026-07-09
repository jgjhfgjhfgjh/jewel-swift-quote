import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, X } from 'lucide-react';
import { HouseLogo } from '@/components/luxury/HouseLogo';
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel';
import { LUXURY_HOUSES, type LuxuryHouse } from '@/data/luxuryCatalog';

/** Card sizing — matches the homepage BrandShowcaseCarousel cards. */
const CARD_CLASS =
  'shrink-0 w-[80%] sm:w-[45%] lg:w-[30%] h-[360px] sm:h-[400px] lg:h-[430px]';
/** Product crossfade interval — same rhythm as the homepage brand showcase. */
const ROTATE_MS = 1800;

/* ─── Single house card — logo on top, crossfading product photos below.
 * Clicking it filters the catalog grid to this brand. Houses without any
 * product photos yet show their brand mark large instead. ─── */
function HouseCard({ house, active, onSelect }: {
  house: LuxuryHouse;
  active: boolean;
  onSelect: (brand: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  // Crossfade only through models that actually have an official photo.
  const models = useMemo(() => house.models.filter((m) => m.image), [house]);
  const n = models.length;

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
    <div ref={rootRef} data-card className={`group/card relative flex flex-col ${CARD_CLASS}`}>
      <div className="flex flex-1 flex-col transition-transform duration-500 ease-out group-data-[center]/card:scale-[1.04]">
        {/* Brand logo on top */}
        <div className="flex h-14 shrink-0 items-center justify-center px-6 pt-1 sm:h-16">
          <HouseLogo
            name={house.name} domain={house.domain} width={400} height={160}
            className="max-h-7 w-auto max-w-[170px] object-contain [mix-blend-mode:multiply]"
            textClassName="text-lg font-medium text-zinc-800"
          />
        </div>

        {n > 0 ? (
          <>
            {/* Crossfading product photo */}
            <div className="relative mx-4 mb-2 mt-4 flex-1">
              {models.map((m, i) => (
                <div
                  key={m.model}
                  aria-hidden={i !== idx}
                  className={`absolute inset-0 flex items-center justify-center p-2 transition-opacity duration-700 ease-in-out ${i === idx ? 'opacity-100' : 'opacity-0'}`}
                >
                  <img
                    src={m.image}
                    alt={`${house.name} ${m.model}`}
                    loading="lazy"
                    draggable={false}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
            {/* Crossfading model name */}
            <div className="relative mx-4 h-5 shrink-0">
              {models.map((m, i) => (
                <p
                  key={m.model}
                  aria-hidden={i !== idx}
                  className={`absolute inset-x-0 truncate text-center text-[11px] text-zinc-500 transition-opacity duration-700 ease-in-out ${i === idx ? 'opacity-100' : 'opacity-0'}`}
                >
                  {m.model}
                </p>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* No product photos yet — show the brand mark large */}
            <div className="flex flex-1 items-center justify-center px-6">
              <HouseLogo
                name={house.name} domain={house.domain} width={520} height={220}
                className="max-h-20 w-auto max-w-[220px] object-contain opacity-90 [mix-blend-mode:multiply] sm:max-h-24"
                textClassName="text-center text-3xl font-medium leading-tight text-zinc-800"
              />
            </div>
            <div className="relative mx-4 h-5 shrink-0">
              <p className="absolute inset-x-0 truncate text-center text-[11px] text-zinc-400">
                {house.models.length} modelů na poptávku
              </p>
            </div>
          </>
        )}

        {/* CTA — filters the catalog below to this brand */}
        <div className="flex shrink-0 justify-center p-4">
          <button
            type="button"
            onClick={() => onSelect(house.name)}
            className={`inline-flex min-w-[200px] items-center justify-center gap-1.5 rounded-md px-8 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
          >
            {active ? <><X className="h-3.5 w-3.5" /> Zrušit filtr</> : <>Zobrazit modely <ArrowRight className="h-3.5 w-3.5" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Carousel — brand filter for the on-demand catalog ─── */
export function LuxuryShowcaseCarousel({ activeBrand, onSelectBrand }: {
  activeBrand: string | null;
  onSelectBrand: (brand: string) => void;
}) {
  const houses = useMemo(() => LUXURY_HOUSES.filter((h) => h.models.length > 0), []);
  const loop = useMemo(() => [...houses, ...houses, ...houses], [houses]);
  const { trackRef, go } = useInfiniteCarousel(houses.length);

  // Scroll-driven centre detection — the centred card carries [data-center].
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
        className="flex gap-3 overflow-x-auto overflow-y-hidden px-3 pb-4 pt-1 [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] scroll-pl-0 sm:gap-4 sm:scroll-pl-5 sm:px-5 lg:scroll-pl-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {loop.map((house, i) => (
          <HouseCard
            key={`${house.name}-${i}`}
            house={house}
            active={activeBrand === house.name}
            onSelect={onSelectBrand}
          />
        ))}
      </div>

      <button
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-none bg-white/70 text-zinc-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white lg:flex opacity-0 group-hover:opacity-100"
        aria-label="Předchozí"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-none bg-white/70 text-zinc-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white lg:flex opacity-0 group-hover:opacity-100"
        aria-label="Další"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
