import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel';

// ── "Why Swelt" mega menu — prázdné placeholder karty (Netflix expand efekt).
//    Obsah se doplní později; teď jen šedé karty v nekonečném kolotoči. ──
const CARD_COUNT = 8;
// 4 kopie místo 3: karusel je přes celou šířku menu a na širokých monitorech
// (ultrawide) by 3 kopie nedaly wrap logice dost prostoru pro posun o celou sadu.
const COPIES = 4;
const AUTO_MS = 2800;

/**
 * Full-width kolotoč prázdných placeholder karet pro "Why Swelt" mega menu.
 * Nekonečná smyčka (useInfiniteCarousel), auto-rotace s pauzou na hover,
 * karta se při hoveru rozšíří jako u velkých Netflix karet na homepage.
 */
export function NavShowcaseCarousel() {
  const { trackRef, go } = useInfiniteCarousel(CARD_COUNT);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(1), AUTO_MS);
    return () => clearInterval(id);
  }, [paused, go]);

  return (
    <div
      className="relative group/carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto pb-1
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {Array.from({ length: CARD_COUNT * COPIES }).map((_, i) => (
          <div
            key={i}
            data-card
            className="shrink-0 rounded-xl border border-zinc-200 bg-zinc-100
                       w-[clamp(360px,38vw,520px)] h-[clamp(260px,26vw,360px)]
                       transition-[width] duration-500 ease-out
                       [@media(hover:hover)]:hover:w-[clamp(460px,48vw,660px)]"
          />
        ))}
      </div>

      {/* šipky — objeví se při hoveru nad kolotočem */}
      <button
        type="button"
        onClick={() => go(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center
                   rounded-full bg-white/80 backdrop-blur-sm text-zinc-700 shadow-sm hover:bg-white
                   transition-all opacity-0 group-hover/carousel:opacity-100"
        aria-label="Předchozí"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center
                   rounded-full bg-white/80 backdrop-blur-sm text-zinc-700 shadow-sm hover:bg-white
                   transition-all opacity-0 group-hover/carousel:opacity-100"
        aria-label="Další"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
