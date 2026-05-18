import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { home } from '@/lib/i18n-homepage';

// ── Images (Unsplash, verified 200) ──────────────────────────────────────
const SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=75',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=75',
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=75',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=75',
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=75',
  'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1200&q=75',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=75',
  'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=75',
  'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1200&q=75',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=75',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=75',
];

const SLIDE_HREFS = [
  '#dropshipping', '#katalog', '#katalog', '#katalog', '#katalog',
  '#katalog', '#katalog', '#katalog', '#kontakt', '#api', '/register',
];

// ── Per-slide metadata (language-independent) ────────────────────────────
const SLIDE_META = [
  { eyebrow: 'Dropshipping',        secondaryCta: 'Zjistit více',          imgPos: 'object-left'            },
  { eyebrow: 'Luxury',              secondaryCta: 'Prohlédnout hodinky',   imgPos: 'object-center'          },
  { eyebrow: 'Nová kolekce',        secondaryCta: 'Celá kolekce',          imgPos: 'object-center'          },
  { eyebrow: 'Novinky sezóny',      secondaryCta: 'Všechny novinky',       imgPos: 'object-[30%_center]'   },
  { eyebrow: 'Exkluzivní akce',     secondaryCta: 'Všechny slevy',         imgPos: 'object-center'          },
  { eyebrow: 'Logistika',           secondaryCta: 'Podmínky doručení',     imgPos: 'object-[20%_center]'   },
  { eyebrow: 'B2B Velkoobchod',     secondaryCta: 'Prozkoumat katalog',    imgPos: 'object-center'          },
  { eyebrow: 'Partnerské značky',   secondaryCta: 'Všechny značky',        imgPos: 'object-center'          },
  { eyebrow: 'Zákaznická podpora',  secondaryCta: 'Kontaktovat tým',       imgPos: 'object-[25%_center]'   },
  { eyebrow: 'Integrace & API',     secondaryCta: 'Dokumentace',           imgPos: 'object-center'          },
  { eyebrow: 'Partnerský program',  secondaryCta: 'Jak začít',             imgPos: 'object-[30%_center]'   },
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

/** Crossfade duration (ms) */
const FADE_MS = 1400;
/** Time each slide stays visible (ms) */
const INTERVAL_MS = 7500;

// ─────────────────────────────────────────────────────────────────────────
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
    intervalRef.current = setInterval(
      () => setCurrent(c => (c + 1) % slides.length),
      INTERVAL_MS,
    );
  }, [slides.length]);

  useEffect(() => {
    startInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startInterval]);

  const handlePrev = () => { setCurrent(c => (c - 1 + slides.length) % slides.length); startInterval(); };
  const handleNext = () => { setCurrent(c => (c + 1) % slides.length); startInterval(); };
  const handleDot  = (i: number) => { setCurrent(i); startInterval(); };

  // Card height — compact for catalog view, full for homepage
  const cardMinH = compact
    ? 'min-h-[360px] sm:min-h-[420px] lg:min-h-[470px]'
    : 'min-h-[440px] sm:min-h-[510px] lg:min-h-[580px]';

  return (
    <div
      className="relative w-full group"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* ── Card shell — rounded corners, overflow clips image ── */}
      <div className={`relative mx-3 sm:mx-5 lg:mx-8 rounded-2xl sm:rounded-3xl overflow-hidden shadow-md ${cardMinH}`}>

        {/* ── Crossfade slides ── */}
        {slides.map((slide, i) => {
          const meta = SLIDE_META[i] ?? SLIDE_META[0];
          return (
            <div
              key={i}
              aria-hidden={i !== current}
              className={`absolute inset-0 bg-slate-100 transition-opacity ease-in-out ${
                i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              style={{ transitionDuration: `${FADE_MS}ms` }}
            >
              {slide.imageOnly ? (
                /* ── Image-only slide ── */
                <div className="relative h-full flex items-center justify-center bg-white">
                  <img
                    src={slide.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                  {slide.ctaHref && (
                    <a href={slide.ctaHref} className="absolute inset-0 z-10" aria-label="Otevřít katalog" />
                  )}
                </div>
              ) : (
                /* ── Standard editorial slide ── */
                <div className="relative h-full">

                  {/* Photo — full bleed, text overlays on desktop via gradient */}
                  <div className="absolute inset-0">
                    <img
                      src={slide.image}
                      alt=""
                      className={`w-full h-full object-cover ${meta.imgPos}`}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                    {/* Mobile: dark gradient so text is legible */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/15 lg:hidden" />
                    {/* Desktop: white fade only under the text column, image shows freely on the right */}
                    <div
                      className="absolute inset-y-0 left-0 w-[58%] hidden lg:block"
                      style={{
                        background: 'linear-gradient(to right, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.94) 52%, rgba(255,255,255,0.3) 78%, transparent 100%)',
                      }}
                    />
                  </div>

                  {/* ── Text content ── */}
                  <div
                    className={`relative z-10 flex flex-col h-full
                      justify-end pb-14 p-7
                      sm:p-10 sm:pb-14
                      lg:justify-center lg:pb-0 lg:p-14
                      lg:w-[50%]`}
                  >
                    {/* Eyebrow */}
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-3.5
                                  text-white/65 lg:text-zinc-400">
                      swelt.PARTNER&nbsp;&nbsp;·&nbsp;&nbsp;{meta.eyebrow}
                    </p>

                    {/* Headline */}
                    <h2
                      className={`font-bold tracking-tight text-balance leading-[1.08] mb-4
                                  text-white lg:text-zinc-900
                                  ${compact
                                    ? 'text-2xl sm:text-3xl lg:text-4xl'
                                    : 'text-[1.75rem] sm:text-4xl lg:text-[3rem]'}`}
                    >
                      {slide.title}
                    </h2>

                    {/* Subtitle */}
                    <p
                      className={`font-light leading-relaxed mb-7 text-pretty
                                  text-white/75 lg:text-zinc-500
                                  ${compact
                                    ? 'text-sm max-w-xs'
                                    : 'text-sm sm:text-base lg:text-lg max-w-sm'}`}
                    >
                      {slide.subtitle}
                    </p>

                    {/* CTA row */}
                    <div className="flex flex-wrap gap-2.5">
                      <a
                        href={slide.ctaHref}
                        className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-colors
                                   bg-white text-zinc-900 hover:bg-zinc-50
                                   lg:bg-zinc-900 lg:text-white lg:hover:bg-zinc-800"
                      >
                        {slide.cta}
                      </a>
                      <a
                        href="/velkoobchod"
                        className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-colors
                                   border border-white/35 text-white hover:bg-white/10
                                   lg:border-zinc-300 lg:text-zinc-700 lg:hover:bg-zinc-100"
                      >
                        {meta.secondaryCta}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Navigation arrows (desktop, appear on group-hover) ── */}
        <button
          onClick={handlePrev}
          className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20
                     h-10 w-10 items-center justify-center rounded-full
                     bg-white/70 backdrop-blur-sm text-zinc-700 shadow-sm
                     hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleNext}
          className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-20
                     h-10 w-10 items-center justify-center rounded-full
                     bg-white/70 backdrop-blur-sm text-zinc-700 shadow-sm
                     hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* ── Dot indicators ── */}
        <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center gap-1.5 pointer-events-none">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDot(i)}
              className={`h-1.5 rounded-full transition-all duration-300 pointer-events-auto
                          drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)] ${
                i === current
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
