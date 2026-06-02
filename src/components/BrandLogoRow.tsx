import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { BRANDS } from '@/data/brands';

/**
 * Amazon-style horizontal "shelf" of brand logos.
 * Wide thumbnail cards (for now just the logo — later richer thumbnails),
 * a "Všechny značky" heading and a "Vidět víc →" link, plus desktop arrows.
 */
export function BrandLogoRow() {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <div className="mt-12 sm:mt-16" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header — title + "see more" inline (Amazon style) */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center gap-3 sm:gap-4 mb-4">
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
          className="flex gap-3 sm:gap-4 overflow-x-auto snap-x px-4 sm:px-6 lg:px-8 pb-2
                     [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {BRANDS.map((brand) => (
            <button
              key={brand.name}
              type="button"
              onClick={() => navigate(`/brands/${brand.name.toLowerCase().replace(/\s+/g, '-')}`)}
              aria-label={brand.name}
              className="group/card shrink-0 snap-start w-[150px] sm:w-[200px] lg:w-[220px] aspect-[16/9]
                         rounded-xl border border-border bg-white shadow-sm flex items-center justify-center p-5
                         hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <BrandLogo
                name={brand.name}
                domain={brand.domain}
                width={360}
                height={160}
                className="max-h-[40px] sm:max-h-[52px] max-w-[82%] object-contain [mix-blend-mode:multiply] transition-transform duration-300 group-hover/card:scale-105"
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
    </div>
  );
}
