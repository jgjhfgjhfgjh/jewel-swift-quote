import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel';

// ── Placeholder karty pro "Why Swelt" mega menu — mini verze Netflix
//    expandujících karet z HeroBanneru. Obsah je zástupný, obrázky sdílíme
//    s HeroBannerem (ověřené Unsplash URL), jen v menší šířce. ──
const CARDS = [
  {
    eyebrow: 'Dropshipping',
    title: 'Prodávejte bez skladu',
    subtitle: 'Balíme a odesíláme pod vaší značkou.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=480&q=70',
    path: '/dropshipping',
  },
  {
    eyebrow: 'B2B Velkoobchod',
    title: '3 000+ produktů skladem',
    subtitle: 'Prémiové značky za velkoobchodní ceny.',
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=480&q=70',
    path: '/velkoobchod',
  },
  {
    eyebrow: 'Logistika',
    title: 'Doručení 24–48 h po EU',
    subtitle: 'Spolehlivě do 15+ zemí Evropy.',
    image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=480&q=70',
    path: '/dropshipping',
  },
  {
    eyebrow: 'Product Intelligence',
    title: 'Trendová data & AI',
    subtitle: 'Rozhodujte se podle reálné poptávky.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=480&q=70',
    path: '/feed?to=product-intelligence',
  },
  {
    eyebrow: 'MCP Server',
    title: 'AI agenti v katalogu',
    subtitle: 'Napojení přes Model Context Protocol.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=480&q=70',
    path: '/feed?to=mcp',
  },
  {
    eyebrow: 'Produktový feed',
    title: 'XML/CSV 4× denně',
    subtitle: 'Ceny a dostupnost v reálném čase.',
    image: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=480&q=70',
    path: '/feed',
  },
  {
    eyebrow: 'Top Deals',
    title: 'Slevy až 65 % z MOC',
    subtitle: 'Časově omezené DEAL nabídky.',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=480&q=70',
    path: '/deals',
  },
  {
    eyebrow: 'Podpora 24/7',
    title: 'AI chat + account manager',
    subtitle: 'Odpověď do 24 hodin v pracovní dny.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=480&q=70',
    path: '/support',
  },
];

const AUTO_MS = 2800;

/**
 * Mini Netflix-style expandující karty pro "Why Swelt" mega menu — 8 karet
 * v nekonečném kolotoči (3 kopie + useInfiniteCarousel), auto-rotace se
 * zastavuje při hoveru, karta se při hoveru rozšíří.
 */
export function NavShowcaseCarousel({ onNavigate }: { onNavigate: (path: string) => void }) {
  const loop = useMemo(() => [...CARDS, ...CARDS, ...CARDS], []);
  const { trackRef, go } = useInfiniteCarousel(CARDS.length);
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
        className="flex gap-2 overflow-x-auto pb-1
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loop.map((card, i) => (
          <button
            key={i}
            data-card
            type="button"
            onClick={() => onNavigate(card.path)}
            className="group/card relative shrink-0 overflow-hidden rounded-lg shadow-sm text-left
                       w-[128px] h-[200px] transition-[width] duration-500 ease-out
                       [@media(hover:hover)]:hover:w-[210px]"
          >
            {/* eager — panel se mountuje až při otevření menu, obrázky chceme hned
                (lazy by čekalo na IntersectionObserver); 3 kopie sdílí URL, browser dedupuje */}
            <img
              src={card.image}
              alt=""
              loading="eager"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/10" />
            <div className="absolute inset-x-0 top-0 p-3 text-white">
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/70 mb-1 line-clamp-1">
                swelt.&nbsp;·&nbsp;{card.eyebrow}
              </p>
              <h4 className="text-[13px] font-bold leading-snug tracking-tight">
                {card.title}
              </h4>
              <p className="mt-1 text-[11px] leading-snug text-white/80 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 line-clamp-3">
                {card.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* šipky — objeví se při hoveru nad kolotočem */}
      <button
        type="button"
        onClick={() => go(-1)}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center
                   rounded-full bg-white/80 backdrop-blur-sm text-zinc-700 shadow-sm hover:bg-white
                   transition-all opacity-0 group-hover/carousel:opacity-100"
        aria-label="Předchozí"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center
                   rounded-full bg-white/80 backdrop-blur-sm text-zinc-700 shadow-sm hover:bg-white
                   transition-all opacity-0 group-hover/carousel:opacity-100"
        aria-label="Další"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
