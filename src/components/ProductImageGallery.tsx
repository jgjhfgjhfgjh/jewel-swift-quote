import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  /** Render prop for the thumbnail trigger (the existing card image). */
  children: (handlers: {
    onClick: (e: React.MouseEvent) => void;
  }) => React.ReactNode;
}

const SWIPE_THRESHOLD = 50;

export function ProductImageGallery({ images, alt, children }: ProductImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const safeImages = images.filter(Boolean);
  const hasMultiple = safeImages.length > 1;

  const open = () => {
    if (safeImages.length === 0) return;
    setCurrentIndex(0);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  const next = () => setCurrentIndex((i) => (i + 1) % safeImages.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + safeImages.length) % safeImages.length);

  // ESC + body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (hasMultiple && e.key === 'ArrowRight') next();
      else if (hasMultiple && e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hasMultiple, safeImages.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (absY > absX && dy > SWIPE_THRESHOLD) {
      close();
    } else if (hasMultiple && absX > SWIPE_THRESHOLD) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const triggerHandlers = {
    onClick: (_e: React.MouseEvent) => {
      open();
    },
  };

  return (
    <>
      {children(triggerHandlers)}

      {isOpen && safeImages.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={close}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm animate-in fade-in duration-200"
        >
          {/* Close */}
          <button
            type="button"
            aria-label="Zavřít galerii"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="fixed right-4 top-4 z-[10000] flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-gray-900 shadow-md transition hover:bg-black/10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image area */}
          <div
            className="relative flex h-full w-full max-w-5xl items-center justify-center px-4 py-16 md:px-16"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={safeImages[currentIndex]}
              alt={`${alt} – ${currentIndex + 1}/${safeImages.length}`}
              loading="lazy"
              className="max-h-full max-w-full select-none object-contain transition-all duration-300"
              draggable={false}
            />

            {hasMultiple && (
              <>
                <button
                  type="button"
                  aria-label="Předchozí obrázek"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/5 text-gray-900 shadow-md transition hover:bg-black/10 md:left-4"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  aria-label="Další obrázek"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/5 text-gray-900 shadow-md transition hover:bg-black/10 md:right-4"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {safeImages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Obrázek ${i + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(i);
                      }}
                      className={cn(
                        'h-2 rounded-full transition-all',
                        i === currentIndex ? 'w-6 bg-gray-900' : 'w-2 bg-gray-300 hover:bg-gray-500',
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
