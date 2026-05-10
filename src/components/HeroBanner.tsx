import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { useStore } from '@/lib/store';
import { home } from '@/lib/i18n-homepage';

// Obrázky vybrané tematicky pro jednotlivé hero slidy (Unsplash, ověřeno 200).
const SLIDE_IMAGES = [
  // 1) Dropshipping — sklad / balíky
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80',
  // 2) Luxury — luxusní hodinky
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&q=80',
  // 3) Nejnovější kolekce — parfémy / kosmetika
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1920&q=80',
  // 4) Novinky sezóny — šperky (zlatý náhrdelník)
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1920&q=80',
  // 5) Exkluzivní akce — prodejní/luxury
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1920&q=80',
  // 6) Rychlé dodání — doručení
  'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1920&q=80',
  // 7) Velkoobchodní ceny — business / čísla
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=80',
  // 8) Partnerské značky — kolekce hodinek
  'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1920&q=80',
  // 9) Zákaznická podpora — tým
  'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1920&q=80',
  // 10) Snadná integrace — notebook / API
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80',
  // 11) Připoj se k nám — handshake / business
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

// Bannery zobrazené pouze v katalogu (compact). Prepend před standardní slidy.
const CATALOG_BANNERS: Slide[] = [];

export function HeroBanner({ compact = false }: { compact?: boolean }) {
  const { lang } = useStore();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = useMemo<Slide[]>(
    () => {
      const base: Slide[] = home[lang].hero.map((s, i) => ({
        image: SLIDE_IMAGES[i] ?? SLIDE_IMAGES[0],
        title: s.title,
        subtitle: s.subtitle,
        cta: s.cta,
        ctaHref: SLIDE_HREFS[i] ?? '#katalog',
      }));
      return compact ? [...CATALOG_BANNERS, ...base] : base;
    },
    [lang, compact],
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
    <div className="relative w-full group z-0 mt-14 lg:mt-24" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <div
                className={`relative bg-no-repeat flex items-center justify-center overflow-hidden pb-12 transition-all duration-500 ${
                  slide.imageOnly ? 'bg-white' : 'bg-cover bg-center'
                } ${
                  compact ? 'h-[70vh] lg:h-[80vh]' : 'h-[80vh] lg:h-[100vh]'
                }`}
                style={slide.imageOnly ? undefined : { backgroundImage: `url(${slide.image})` }}
              >
                {slide.imageOnly ? (
                  <>
                    <img
                      src={slide.image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain"
                      draggable={false}
                    />
                    {slide.ctaHref ? (
                      <a href={slide.ctaHref} className="absolute inset-0 z-10" aria-label="Otevřít katalog" />
                    ) : null}
                  </>
                ) : (
                  <>
                    {/* Cinematic gradient overlay for legibility */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-black/85" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent mix-blend-overlay" />

                    {/* Logo watermark */}
                    <img
                      src={logo}
                      alt=""
                      className={`absolute inset-0 m-auto opacity-[0.07] pointer-events-none select-none transition-all duration-500 ${
                        compact ? 'w-20 sm:w-24 lg:w-56' : 'w-32 sm:w-40 md:w-48 lg:w-56'
                      }`}
                      draggable={false}
                    />
                    {/* Text + CTA overlay */}
                    <div className="relative z-10 text-center px-6 max-w-2xl flex flex-col items-center">
                      <h2 className={`text-white font-bold tracking-tight text-balance drop-shadow-2xl transition-all duration-500 ${
                        compact ? 'text-base sm:text-lg lg:text-4xl' : 'text-2xl sm:text-3xl md:text-4xl lg:text-6xl'
                      }`}>{slide.title}</h2>
                      <p className={`text-white/90 mt-2 sm:mt-3 max-w-xl text-pretty drop-shadow-lg transition-all duration-500 ${
                        compact ? 'text-xs sm:text-sm lg:text-xl' : 'text-sm sm:text-base md:text-lg lg:text-xl'
                      }`}>{slide.subtitle}</p>
                      <Button
                        asChild
                        size={compact ? 'sm' : 'lg'}
                        className="mt-5 sm:mt-7 bg-white text-zinc-900 hover:bg-white/90 shadow-xl font-semibold rounded-full px-7"
                      >
                        <a href={slide.ctaHref}>
                          {slide.cta}
                        </a>
                      </Button>
                    </div>
                  </>
                )}
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
      <div className="absolute bottom-28 sm:bottom-32 left-0 right-0 z-20 flex justify-center gap-1.5 pointer-events-none" style={{ transform: 'translateY(5px)' }}>
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
