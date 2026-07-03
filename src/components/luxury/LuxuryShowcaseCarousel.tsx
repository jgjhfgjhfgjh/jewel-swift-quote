import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { HouseLogo } from '@/components/luxury/HouseLogo';
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel';
import { LUXURY_HOUSES, type LuxuryHouse } from '@/data/luxuryCatalog';
import type { SelectedWatch } from '@/components/luxury/LuxuryWatchSearch';

/** Card sizing — matches the homepage BrandShowcaseCarousel cards. */
const CARD_CLASS =
  'shrink-0 w-[80%] sm:w-[45%] lg:w-[30%] h-[360px] sm:h-[400px] lg:h-[430px]';
const ROTATE_MS = 2200;

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
        {/* Big brand logo — the hero of the card */}
        <div className="flex flex-1 items-center justify-center px-6 py-4">
          <HouseLogo
            name={house.name} domain={house.domain} width={520} height={220}
            className="max-h-24 w-auto max-w-[240px] object-contain transition-transform duration-500 ease-out [mix-blend-mode:multiply] group-data-[center]/card:scale-105 sm:max-h-28"
            textClassName="text-center text-3xl font-medium leading-tight text-zinc-800 sm:text-4xl"
          />
        </div>

        {/* Model — just a small text line above the CTA (crossfading) */}
        <div className="relative mx-4 h-6 shrink-0 text-center">
          {house.models.map((m, i) => (
            <p
              key={m.model}
              aria-hidden={i !== idx}
              className={`absolute inset-x-0 truncate text-sm font-medium uppercase tracking-[0.15em] text-zinc-500 transition-opacity duration-700 ease-in-out ${i === idx ? 'opacity-100' : 'opacity-0'}`}
            >
              {m.model}
            </p>
          ))}
        </div>

        {/* CTA — reflects the currently shown model so it's clear what gets added */}
        <div className="flex shrink-0 justify-center p-4">
          <button
            type="button"
            onClick={() => onPick(toWatch(house, idx))}
            className="inline-flex min-w-[200px] max-w-full items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Poptat {house.name} {house.models[idx].model}</span>
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
    <div className="group relative w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
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
