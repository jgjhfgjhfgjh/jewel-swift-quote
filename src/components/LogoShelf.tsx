import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export type LogoShelfItem = { name: string; domain?: string; slug: string };
type Preview = { item: LogoShelfItem; left: number; top: number; width: number };

/**
 * Amazon-style horizontal „shelf" log s desktop hover-expand náhledem
 * (Prime Video styl). Prezentační komponenta — data i navigaci dodává rodič
 * (BrandLogoRow = značky, ConcernLogoRow = koncerny), takže obě police vypadají
 * úplně stejně.
 */
export function LogoShelf({
  items,
  title,
  detailLabel,
  onSeeMore,
  onItemClick,
  topMargin = 'mt-12 sm:mt-16',
  compact = false,
}: {
  items: LogoShelfItem[];
  title: string;
  /** popisek v hover náhledu, např. „Zobrazit značku" / „Zobrazit koncern" */
  detailLabel: string;
  onSeeMore: () => void;
  onItemClick: (item: LogoShelfItem) => void;
  topMargin?: string;
  /** menší karty i nadpis (mega menu) — víc obsahu na obrazovku */
  compact?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const dwellRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const clearDwell = () => { if (dwellRef.current) clearTimeout(dwellRef.current); dwellRef.current = null; };
  const cancelClose = () => { if (closeRef.current) clearTimeout(closeRef.current); closeRef.current = null; };
  const scheduleClose = () => { cancelClose(); closeRef.current = setTimeout(() => setPreview(null), 90); };
  const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

  const openFor = (item: LogoShelfItem, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const width = Math.round(r.width * 1.56);
    const left = Math.max(8, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 8));
    const top = Math.max(8, r.top - 24);
    setPreview({ item, left, top, width });
  };

  const handleEnter = (item: LogoShelfItem, el: HTMLElement) => {
    if (!canHover()) return;
    cancelClose();
    clearDwell();
    dwellRef.current = setTimeout(() => openFor(item, el), 100);
  };

  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const onMove = (e: MouseEvent) => { pointerRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Po swipu znovu vyhodnotíme kartu pod (nehybným) kurzorem přes elementFromPoint
  useEffect(() => {
    let idle: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      clearDwell();
      setPreview(null);
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => {
        if (!canHover()) return;
        const p = pointerRef.current;
        if (!p) return;
        const hit = document.elementFromPoint(p.x, p.y) as HTMLElement | null;
        const card = hit?.closest('[data-shelf-card]') as HTMLElement | null;
        if (!card) return;
        const name = card.getAttribute('data-name');
        const domain = card.getAttribute('data-domain') || undefined;
        const slug = card.getAttribute('data-slug');
        if (name && slug) openFor({ name, domain, slug }, card);
      }, 150);
    };
    const onResize = () => { clearDwell(); setPreview(null); };
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', onResize);
      if (idle) clearTimeout(idle);
    };
  }, []);

  return (
    <div className={topMargin} style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header — title + „Vidět víc" inline (Amazon styl) */}
      <div className={`px-4 min-[480px]:px-5 md:px-8 min-[1200px]:px-11 flex items-center gap-3 sm:gap-4 ${compact ? 'mb-2' : 'mb-4'}`}>
        <h2 className={`font-semibold text-foreground ${compact ? 'text-xs' : 'text-sm sm:text-base'}`}>{title}</h2>
        <button
          type="button"
          onClick={onSeeMore}
          className={`group inline-flex items-center gap-0.5 font-semibold text-muted-foreground hover:text-foreground transition-colors ${compact ? 'text-[11px]' : 'text-xs sm:text-sm'}`}
        >
          Vidět víc
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Shelf */}
      <div className="relative group">
        <div
          ref={trackRef}
          className="flex flex-nowrap overflow-x-auto [-webkit-overflow-scrolling:touch] pb-2
                     gap-3 min-[480px]:gap-4 md:gap-5 min-[1200px]:gap-6
                     px-4 min-[480px]:px-5 md:px-8 min-[1200px]:px-11
                     scroll-pl-4 min-[480px]:scroll-pl-5 md:scroll-pl-8 min-[1200px]:scroll-pl-11
                     [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <button
              key={item.slug}
              type="button"
              data-shelf-card
              data-name={item.name}
              data-domain={item.domain ?? ''}
              data-slug={item.slug}
              onClick={() => onItemClick(item)}
              onMouseEnter={(e) => handleEnter(item, e.currentTarget)}
              onMouseLeave={() => { clearDwell(); scheduleClose(); }}
              aria-label={item.name}
              className={`shrink-0 aspect-[16/9] rounded-none border border-border bg-white shadow-sm flex items-center justify-center ${
                compact
                  ? 'w-[150px] md:w-[168px] min-[1200px]:w-[186px] p-3'
                  : 'w-[clamp(200px,55vw,240px)] md:w-[240px] min-[1200px]:w-[280px] p-4 md:p-5'
              }`}
            >
              {item.domain ? (
                <BrandLogo
                  name={item.name}
                  domain={item.domain}
                  width={360}
                  height={160}
                  className={`max-w-[80%] object-contain [mix-blend-mode:multiply] ${compact ? 'max-h-[34px] md:max-h-[40px]' : 'max-h-[48px] md:max-h-[56px]'}`}
                  fallbackClassName={`font-display font-black text-foreground ${compact ? 'text-sm' : 'text-base'}`}
                />
              ) : (
                <span className={`font-display font-black text-foreground ${compact ? 'text-sm' : 'text-base'}`}>{item.name}</span>
              )}
            </button>
          ))}
        </div>

        {/* Arrows (desktop, on hover) */}
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-none bg-white/85 backdrop-blur border border-border text-zinc-700 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="Předchozí"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-none bg-white/85 backdrop-blur border border-border text-zinc-700 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="Další"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Hover-expand náhled (desktop only, fixed overlay) */}
      {preview && (
        <div
          key={preview.item.name}
          aria-hidden
          className="pv-pop pointer-events-none fixed z-[60] overflow-hidden rounded-none bg-zinc-900 shadow-[0_4px_8px_2px_rgba(0,5,13,0.5)]"
          style={{ left: preview.left, top: preview.top, width: preview.width }}
        >
          <div className="w-full aspect-[16/9] bg-white flex items-center justify-center p-6">
            {preview.item.domain ? (
              <BrandLogo
                name={preview.item.name}
                domain={preview.item.domain}
                width={520}
                height={240}
                className="max-h-[80px] max-w-[68%] object-contain [mix-blend-mode:multiply]"
                fallbackClassName="font-display font-black text-2xl text-foreground"
              />
            ) : (
              <span className="font-display font-black text-2xl text-foreground">{preview.item.name}</span>
            )}
          </div>
          <div className="px-4 py-3 text-white">
            <div className="font-display font-black text-base leading-tight">{preview.item.name}</div>
            <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-white/80">
              {detailLabel} <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
