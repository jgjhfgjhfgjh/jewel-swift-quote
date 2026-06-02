import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { home } from '@/lib/i18n-homepage';
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel';

// ── Images (Unsplash, verified 200) — optimized width for narrow cards ────
const SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=75',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=75',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=75',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=75',
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=800&q=75',
  'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=800&q=75',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=75',
  'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=800&q=75',
  'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=800&q=75',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=75',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=75',
];

const SLIDE_HREFS = [
  '#dropshipping', '#katalog', '/deals', '#katalog', '#katalog',
  '#katalog', '#katalog', '#katalog', '#kontakt', '#api', '/register',
];

// ── Per-slide metadata (language-independent) ────────────────────────────
const SLIDE_META = [
  { eyebrow: 'Dropshipping',        imgPos: 'object-left'          },
  { eyebrow: 'Luxury',              imgPos: 'object-center'        },
  { eyebrow: 'Closeout DEAL',       imgPos: 'object-center'        },
  { eyebrow: 'Novinky sezóny',      imgPos: 'object-[30%_center]'  },
  { eyebrow: 'Exkluzivní akce',     imgPos: 'object-center'        },
  { eyebrow: 'Logistika',           imgPos: 'object-[20%_center]'  },
  { eyebrow: 'B2B Velkoobchod',     imgPos: 'object-center'        },
  { eyebrow: 'Partnerské značky',   imgPos: 'object-center'        },
  { eyebrow: 'Zákaznická podpora',  imgPos: 'object-[25%_center]'  },
  { eyebrow: 'Integrace & API',     imgPos: 'object-center'        },
  { eyebrow: 'Partnerský program',  imgPos: 'object-[30%_center]'  },
];

type Slide = {
  image: string;
  title?: string;
  subtitle?: string;
  ctaHref?: string;
};

// ─────────────────────────────────────────────────────────────────────────
export function HeroBanner({ compact = false }: { compact?: boolean }) {
  const { lang } = useStore();

  const slides = useMemo<Slide[]>(
    () =>
      home[lang].hero.map((s, i) => ({
        image: SLIDE_IMAGES[i] ?? SLIDE_IMAGES[0],
        title: s.title,
        subtitle: s.subtitle,
        ctaHref: SLIDE_HREFS[i] ?? '#katalog',
      })),
    [lang],
  );

  // Render the slides 3× for a seamless infinite loop
  const loop = useMemo(() => [...slides, ...slides, ...slides], [slides]);
  const { trackRef, go } = useInfiniteCarousel(slides.length);

  // Card height — slightly smaller in catalog (compact) view
  const cardH = compact
    ? 'h-[300px] sm:h-[340px]'
    : 'h-[380px] sm:h-[420px] lg:h-[440px]';

  return (
    <div
      className="relative w-full group"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* ── Scrollable track — 3 cards + a peek of the 4th ── */}
      <div
        ref={trackRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth
                   px-3 sm:px-5 lg:px-8 scroll-pl-0 sm:scroll-pl-5 lg:scroll-pl-8 pb-1
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loop.map((slide, i) => {
          const meta = SLIDE_META[i % slides.length] ?? SLIDE_META[0];
          return (
            <a
              key={i}
              data-card
              href={slide.ctaHref}
              className={`group/card relative shrink-0 snap-center sm:snap-start overflow-hidden rounded-2xl sm:rounded-3xl shadow-md
                          w-[80%] sm:w-[45%] lg:w-[30%] ${cardH}`}
            >
              {/* Image */}
              <img
                src={slide.image}
                alt=""
                loading={i < 4 ? 'eager' : 'lazy'}
                draggable={false}
                className={`absolute inset-0 h-full w-full object-cover ${meta.imgPos} transition-transform duration-700 group-hover/card:scale-105`}
              />
              {/* Legibility gradient (top-down, text sits at the top) */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/5" />

              {/* Text only, at the TOP — no CTA */}
              <div className="absolute inset-x-0 top-0 p-5 sm:p-6 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 mb-2">
                  swelt.PARTNER&nbsp;·&nbsp;{meta.eyebrow}
                </p>
                <h2 className="font-bold tracking-tight leading-tight text-xl sm:text-2xl mb-1.5 text-balance">
                  {slide.title}
                </h2>
                <p className="text-sm text-white/80 leading-relaxed line-clamp-2">
                  {slide.subtitle}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      {/* ── Navigation arrows (desktop, appear on group-hover) ── */}
      <button
        onClick={() => go(-1)}
        className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20
                   h-10 w-10 items-center justify-center rounded-full
                   bg-white/70 backdrop-blur-sm text-zinc-700 shadow-sm
                   hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Předchozí"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-20
                   h-10 w-10 items-center justify-center rounded-full
                   bg-white/70 backdrop-blur-sm text-zinc-700 shadow-sm
                   hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Další"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
