import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { BRANDS } from '@/data/brands';

type Brand = { name: string; domain: string };
type Preview = { brand: Brand; left: number; top: number; width: number };

/**
 * Amazon-style horizontal "shelf" of brand logos with a desktop-only
 * hover-to-expand preview (Prime Video style): after a short dwell a larger
 * floating panel pops over the card with the logo enlarged + info + CTA.
 * Touch devices get no preview (plain tap → brand detail).
 */
export function BrandLogoRow() {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);

  const [preview, setPreview] = useState<Preview | null>(null);
  const dwellRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const clearDwell = () => {
    if (dwellRef.current) clearTimeout(dwellRef.current);
    dwellRef.current = null;
  };
  const cancelClose = () => {
    if (closeRef.current) clearTimeout(closeRef.current);
    closeRef.current = null;
  };
  const scheduleClose = () => {
    cancelClose();
    closeRef.current = setTimeout(() => setPreview(null), 90);
  };

  // Open the expand preview after a dwell delay (hover-capable devices only)
  const handleEnter = (brand: Brand, el: HTMLElement) => {
    if (typeof window === 'undefined' || !window.matchMedia('(hover: hover)').matches) return;
    cancelClose();
    clearDwell();
    dwellRef.current = setTimeout(() => {
      const r = el.getBoundingClientRect();
      const width = Math.round(r.width * 1.56);
      const left = Math.max(8, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 8));
      const top = Math.max(8, r.top - 24);
      setPreview({ brand, left, top, width });
    }, 450);
  };

  // Close preview on any scroll / resize (fixed panel detaches from the card)
  useEffect(() => {
    const close = () => { clearDwell(); setPreview(null); };
    window.addEventListener('scroll', close, { passive: true, capture: true });
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', close);
    };
  }, []);

  return (
    <div className="mt-12 sm:mt-16" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header — title + "see more" inline (Amazon style) */}
      <div className="px-4 min-[480px]:px-5 md:px-8 min-[1200px]:px-11 flex items-center gap-3 sm:gap-4 mb-4">
        <h2 className="text-sm sm:text-base font-semibold text-foreground">
          Všechny značky
        </h2>
        <button
          type="button"
          onClick={() => navigate('/brands')}
          className="group inline-flex items-center gap-0.5 text-sm sm:text-base font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Vidět víc
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Shelf */}
      <div className="relative group">
        <div
          ref={trackRef}
          className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory pb-2
                     gap-3 min-[480px]:gap-4 md:gap-5 min-[1200px]:gap-6
                     px-4 min-[480px]:px-5 md:px-8 min-[1200px]:px-11
                     scroll-pl-4 min-[480px]:scroll-pl-5 md:scroll-pl-8 min-[1200px]:scroll-pl-11
                     [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {BRANDS.map((brand) => (
            <button
              key={brand.name}
              type="button"
              onClick={() => navigate(`/brands/${slug(brand.name)}`)}
              onMouseEnter={(e) => handleEnter(brand, e.currentTarget)}
              onMouseLeave={() => { clearDwell(); scheduleClose(); }}
              aria-label={brand.name}
              className="shrink-0 snap-start aspect-[16/9]
                         w-[clamp(150px,42vw,200px)] md:w-[240px] min-[1200px]:w-[280px]
                         rounded-[8px] border border-border bg-white shadow-sm flex items-center justify-center p-4 md:p-5"
            >
              <BrandLogo
                name={brand.name}
                domain={brand.domain}
                width={360}
                height={160}
                className="max-h-[44px] md:max-h-[56px] max-w-[80%] object-contain [mix-blend-mode:multiply]"
                fallbackClassName="font-display font-black text-foreground text-base"
              />
            </button>
          ))}
        </div>

        {/* Arrows (desktop, on hover) */}
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/85 backdrop-blur border border-border text-zinc-700 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="Předchozí"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/85 backdrop-blur border border-border text-zinc-700 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="Další"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* ── Hover-expand preview (desktop only, fixed overlay) ── */}
      {preview && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={() => setPreview(null)}
          onClick={() => { navigate(`/brands/${slug(preview.brand.name)}`); setPreview(null); }}
          className="pv-pop fixed z-[60] cursor-pointer overflow-hidden rounded-[8px] bg-zinc-900 shadow-[0_4px_8px_2px_rgba(0,5,13,0.5)]"
          style={{ left: preview.left, top: preview.top, width: preview.width }}
        >
          {/* Logo area — 16:9, white (stand-in for the video still) */}
          <div className="w-full aspect-[16/9] bg-white flex items-center justify-center p-6">
            <BrandLogo
              name={preview.brand.name}
              domain={preview.brand.domain}
              width={520}
              height={240}
              className="max-h-[80px] max-w-[68%] object-contain [mix-blend-mode:multiply]"
              fallbackClassName="font-display font-black text-2xl text-foreground"
            />
          </div>
          {/* Info panel */}
          <div className="px-4 py-3 text-white">
            <div className="font-display font-black text-base leading-tight">{preview.brand.name}</div>
            <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-white/80">
              Zobrazit značku <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
