import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { useStore } from '@/lib/store';
import { home } from '@/lib/i18n-homepage';

const SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1567721913486-6585f069b332?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=80',
];

const SLIDE_HREFS = [
  '#katalog', '#katalog', '#katalog', '#katalog', '#katalog',
  '#katalog', '#katalog', '#katalog', '#kontakt', '#api', '/register',
];

export function HeroBanner({ compact = false }: { compact?: boolean }) {
  const { lang } = useStore();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = useMemo(
    () => home[lang].hero.map((s, i) => ({
      image: SLIDE_IMAGES[i] ?? SLIDE_IMAGES[0],
      title: s.title,
      subtitle: s.subtitle,
      cta: s.cta,
      ctaHref: SLIDE_HREFS[i] ?? '#katalog',
    })),
    [lang],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  // Auto-play
  useEffect(() => {
    if (!emblaApi) return;
    const start = () => {
      intervalRef.current = setInterval(() => emblaApi.scrollNext(), 5000);
    };
    const stop = () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    start();
    emblaApi.on('pointerDown', stop);
    emblaApi.on('pointerUp', start);
    return () => { stop(); emblaApi.off('pointerDown', stop); emblaApi.off('pointerUp', start); };
  }, [emblaApi]);

  return (
    <div className="relative w-full group -mt-14 z-0" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <div
                className={`relative bg-cover bg-center bg-no-repeat flex items-center justify-center overflow-hidden pt-14 pb-12 transition-all duration-500 ${
                  compact ? 'h-[70vh] lg:h-[80vh]' : 'h-[80vh] lg:h-[100vh]'
                }`}
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                {/* Dark overlay for legibility */}
                <div className="absolute inset-0 bg-black/60" />

                {/* Logo watermark */}
                <img
                  src={logo}
                  alt=""
                  className={`absolute inset-0 m-auto opacity-10 pointer-events-none select-none transition-all duration-500 ${
                    compact ? 'w-20 sm:w-24 lg:w-56' : 'w-32 sm:w-40 md:w-48 lg:w-56'
                  }`}
                  draggable={false}
                />
                {/* Text + CTA overlay */}
                <div className="relative z-10 text-center px-6 max-w-xl flex flex-col items-center">
                  <h2 className={`text-white font-bold drop-shadow-lg transition-all duration-500 ${
                    compact ? 'text-base sm:text-lg lg:text-4xl' : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
                  }`}>{slide.title}</h2>
                  <p className={`text-white/85 mt-1 drop-shadow transition-all duration-500 ${
                    compact ? 'text-xs sm:text-sm lg:text-xl' : 'text-sm sm:text-base md:text-lg lg:text-xl'
                  }`}>{slide.subtitle}</p>
                  <Button
                    asChild
                    size={compact ? 'sm' : 'lg'}
                    className="mt-4 sm:mt-5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-semibold"
                  >
                    <a href={slide.ctaHref}>
                      {slide.cta}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop arrows */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition opacity-0 group-hover:opacity-100"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition opacity-0 group-hover:opacity-100"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Paginator dots — overlaid inside the banner */}
      <div className="absolute bottom-28 sm:bottom-32 left-0 right-0 z-20 flex justify-center gap-1.5 pointer-events-none">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-300 pointer-events-auto ${
              i === selectedIndex ? 'w-5 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
