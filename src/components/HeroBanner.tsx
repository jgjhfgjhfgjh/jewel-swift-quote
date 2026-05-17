import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { useStore } from '@/lib/store';
import { home } from '@/lib/i18n-homepage';

// Thematic images for each hero slide (Unsplash, verified 200).
const SLIDE_IMAGES = [
  // 1) Dropshipping — warehouse / packages
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80',
  // 2) Luxury — luxury watches
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&q=80',
  // 3) New collection — perfumes / cosmetics
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1920&q=80',
  // 4) Season novelties — jewellery (gold necklace)
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1920&q=80',
  // 5) Exclusive deals — sales / luxury
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1920&q=80',
  // 6) Fast delivery — courier
  'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1920&q=80',
  // 7) Wholesale prices — business / numbers
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=80',
  // 8) Partner brands — watch collection
  'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1920&q=80',
  // 9) Customer support — team
  'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1920&q=80',
  // 10) Easy integration — notebook / API
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80',
  // 11) Join us — handshake / business
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=80',
];

const SLIDE_HREFS = [
  '#dropshipping', '#katalog', '#katalog', '#katalog', '#katalog',
  '#katalog', '#katalog', '#katalog', '#kontakt', '#api', '/register',
];

type Slide = {
  image: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  ctaHref?: string;
  imageOnly?: boolean;
};

const CATALOG_BANNERS: Slide[] = [];

/** Duration of the opacity crossfade in ms */
const FADE_MS = 1400;
/** How long each slide stays visible before fading to the next */
const INTERVAL_MS = 7500;

export function HeroBanner({ compact = false }: { compact?: boolean }) {
  const { lang } = useStore();
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = useMemo<Slide[]>(() => {
    const base: Slide[] = home[lang].hero.map((s, i) => ({
      image: SLIDE_IMAGES[i] ?? SLIDE_IMAGES[0],
      title: s.title,
      subtitle: s.subtitle,
      cta: s.cta,
      ctaHref: SLIDE_HREFS[i] ?? '#katalog',
    }));
    return compact ? [...CATALOG_BANNERS, ...base] : base;
  }, [lang, compact]);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length);
    }, INTERVAL_MS);
  }, [slides.length]);

  useEffect(() => {
    startInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startInterval]);

  const handlePrev = () => {
    setCurrent(c => (c - 1 + slides.length) % slides.length);
    startInterval();
  };

  const handleNext = () => {
    setCurrent(c => (c + 1) % slides.length);
    startInterval();
  };

  const handleDot = (i: number) => {
    setCurrent(i);
    startInterval();
  };

  const heightCls = compact
    ? 'h-[70vh] lg:h-[80vh]'
    : 'h-[80vh] lg:h-[100vh]';

  return (
    <div
      className="relative w-full group z-0"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* ── Crossfade stack ── */}
      <div className={`relative overflow-hidden ${heightCls}`}>
        {slides.map((slide, i) => (
          <div
            key={i}
            aria-hidden={i !== current}
            className={`absolute inset-0 transition-opacity ease-in-out ${
              i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{ transitionDuration: `${FADE_MS}ms` }}
          >
            {slide.imageOnly ? (
              <div className="relative h-full bg-white flex items-center justify-center">
                <img
                  src={slide.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                  draggable={false}
                />
                {slide.ctaHref && (
                  <a href={slide.ctaHref} className="absolute inset-0 z-10" aria-label="Otevřít katalog" />
                )}
              </div>
            ) : (
              <div
                className="relative h-full bg-cover bg-center flex items-center justify-center pb-12"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                {/* Cinematic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/50 to-black/80" />

                {/* Logo watermark */}
                <img
                  src={logo}
                  alt=""
                  className={`absolute inset-0 m-auto opacity-[0.06] pointer-events-none select-none ${
                    compact ? 'w-20 sm:w-24 lg:w-56' : 'w-32 sm:w-40 md:w-48 lg:w-56'
                  }`}
                  draggable={false}
                />

                {/* Text + CTA */}
                <div className="relative z-10 text-center px-6 max-w-2xl flex flex-col items-center">
                  <h2
                    className={`text-white font-semibold tracking-tight text-balance drop-shadow-xl ${
                      compact
                        ? 'text-base sm:text-lg lg:text-4xl'
                        : 'text-2xl sm:text-3xl md:text-4xl lg:text-6xl'
                    }`}
                  >
                    {slide.title}
                  </h2>
                  <p
                    className={`text-white/80 mt-2 sm:mt-3 max-w-xl text-pretty drop-shadow-md font-light ${
                      compact
                        ? 'text-xs sm:text-sm lg:text-xl'
                        : 'text-sm sm:text-base md:text-lg lg:text-xl'
                    }`}
                  >
                    {slide.subtitle}
                  </p>
                  <Button
                    asChild
                    size={compact ? 'sm' : 'lg'}
                    className="mt-5 sm:mt-7 bg-white text-zinc-900 hover:bg-white/90 shadow-lg font-medium rounded-none px-8 tracking-wide text-sm border-0"
                  >
                    <a href={slide.ctaHref}>{slide.cta}</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Desktop arrows ── */}
      <button
        onClick={handlePrev}
        className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition opacity-0 group-hover:opacity-100"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={handleNext}
        className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition opacity-0 group-hover:opacity-100"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* ── Paginator dots ── */}
      <div
        className="absolute bottom-28 sm:bottom-32 left-0 right-0 z-20 flex justify-center gap-1.5 pointer-events-none"
        style={{ transform: 'translateY(5px)' }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDot(i)}
            className={`h-2 rounded-full transition-all duration-300 pointer-events-auto ${
              i === current ? 'w-5 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
