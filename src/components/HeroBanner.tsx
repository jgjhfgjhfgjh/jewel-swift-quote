import { useState, useCallback, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import logo from '@/assets/logo.png';

const slides = [
  { bg: 'from-slate-800 to-slate-900', title: 'Swelt Dropshipping', subtitle: 'Your partner for easy logistics.' },
  { bg: 'from-indigo-800 to-indigo-950', title: 'Swelt Luxury', subtitle: 'Personal orders of major brands. No min order.' },
  { bg: 'from-emerald-800 to-emerald-950', title: 'Discover our latest collections', subtitle: 'Premium fragrances & cosmetics at wholesale prices.' },
  { bg: 'from-violet-800 to-violet-950', title: 'New Season Arrivals', subtitle: 'Explore trending products across top brands.' },
  { bg: 'from-rose-800 to-rose-950', title: 'Exclusive Deals', subtitle: 'Up to 60% off on selected items.' },
  { bg: 'from-amber-800 to-amber-950', title: 'Fast Shipping', subtitle: 'Reliable delivery across Europe in 2-4 days.' },
  { bg: 'from-cyan-800 to-cyan-950', title: 'Wholesale Pricing', subtitle: 'Competitive margins for your business growth.' },
  { bg: 'from-fuchsia-800 to-fuchsia-950', title: 'Brand Partners', subtitle: 'Authorized distributor for 200+ brands.' },
  { bg: 'from-teal-800 to-teal-950', title: 'Customer Support', subtitle: 'Dedicated account managers for your success.' },
  { bg: 'from-orange-800 to-orange-950', title: 'Easy Integration', subtitle: 'Connect your e-shop in minutes with our API.' },
  { bg: 'from-sky-800 to-sky-950', title: 'Join Swelt Today', subtitle: 'Start selling premium products with zero risk.' },
];

export function HeroBanner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    <div className="relative w-full group -mt-14 z-0">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <div className={`relative bg-gradient-to-br ${slide.bg} flex items-center justify-center h-[100vh] overflow-hidden pt-14`}>
                {/* Logo watermark */}
                <img
                  src={logo}
                  alt=""
                  className="absolute inset-0 m-auto w-32 sm:w-40 md:w-48 lg:w-56 opacity-10 pointer-events-none select-none"
                  draggable={false}
                />
                {/* Text overlay – pushed down to avoid header overlap */}
                <div className="relative z-10 text-center px-6 max-w-xl">
                  <h2 className="text-white font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl drop-shadow-lg">{slide.title}</h2>
                  <p className="text-white/80 text-sm sm:text-base md:text-lg lg:text-xl mt-2 drop-shadow">{slide.subtitle}</p>
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

      {/* Paginator dots */}
      <div className="flex justify-center gap-1.5 py-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === selectedIndex ? 'w-5 bg-primary' : 'w-2 bg-muted-foreground/30'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
