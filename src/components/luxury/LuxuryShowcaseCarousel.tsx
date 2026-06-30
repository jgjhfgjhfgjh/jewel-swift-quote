import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { HouseLogo } from '@/components/luxury/HouseLogo';
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel';
import { LUXURY_HOUSES, formatFrom, type LuxuryHouse } from '@/data/luxuryCatalog';
import type { SelectedWatch } from '@/components/luxury/LuxuryWatchSearch';

/** Card sizing — matches the homepage BrandShowcaseCarousel cards. */
const CARD_CLASS =
  'shrink-0 w-[80%] sm:w-[45%] lg:w-[30%] h-[360px] sm:h-[400px] lg:h-[430px]';
const ROTATE_MS = 2200;

const display: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

function toWatch(house: LuxuryHouse, modelIdx: number): SelectedWatch {
  const m = house.models[modelIdx];
  const id = `${house.name}-${m.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return { id, brand: house.name, model: m.model, domain: house.domain, from: m.from ?? house.from, custom: false };
}

/* ─── Single house card — logo + crossfading models + CTA ─── */
function HouseCard({ house, onPick }: { house: LuxuryHouse; onPick: (w: SelectedWatch) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const n = house.models.length;

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
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-center px-6 pt-1">
          <HouseLogo
            name={house.name} domain={house.domain} width={400} height={160}
            className="max-h-8 max-w-[180px] object-contain [mix-blend-mode:multiply]"
            textClassName="text-xl font-medium text-zinc-800"
          />
        </div>

        {/* Crossfading model — clean typography (these houses have no product photos) */}
        <div className="relative flex flex-1 items-center justify-center px-5 text-center">
          {house.models.map((m, i) => (
            <div
              key={m.model}
              aria-hidden={i !== idx}
              className={`absolute inset-0 flex flex-col items-center justify-center px-5 transition-opacity duration-700 ease-in-out ${i === idx ? 'opacity-100' : 'opacity-0'}`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-400">
                {m.collection && m.collection !== m.model ? m.collection : 'Kolekce'}
              </p>
              <p className="mt-3 text-[1.9rem] leading-tight text-zinc-900 sm:text-4xl" style={display}>{m.model}</p>
              <span className="mt-4 inline-block h-px w-10 bg-zinc-200" />
              <p className="mt-4 text-sm font-medium text-zinc-500">{formatFrom(m.from ?? house.from)}</p>
            </div>
          ))}
        </div>

        {/* CTA — adds the currently shown model to the inquiry */}
        <div className="flex shrink-0 justify-center p-4">
          <button
            type="button"
            onClick={() => onPick(toWatch(house, idx))}
            className="inline-flex min-w-[200px] items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            <Plus className="h-3.5 w-3.5" /> Poptat {house.name}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Carousel ─── */
export function LuxuryShowcaseCarousel({ onPick }: { onPick: (w: SelectedWatch) => void }) {
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
          <HouseCard key={`${house.name}-${i}`} house={house} onPick={onPick} />
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
