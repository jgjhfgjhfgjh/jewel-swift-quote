import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Plus, Minus, ShoppingCart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { LeadUpgradeBadge } from '@/components/LeadUpgradeBadge';
import { useProductCommerce, getProductImages } from '@/hooks/useProductCommerce';
import type { Product } from '@/lib/types';

const SWIPE = 50;

interface Props {
  products: Product[];
  index: number | null;          // null = closed
  onIndexChange: (i: number) => void;
  onClose: () => void;
}

/**
 * Fullscreen catalog browser. Opened from a product image, it lets you page
 * through the catalog products with arrows/swipe, add to cart with quantity and
 * a live margin (same as the grid), and — for products with several photos —
 * pick which photo is maximised via thumbnails. The product photo is never
 * shrunk to make room; on mobile the commerce panel floats over its bottom.
 */
export function CatalogLightbox({ products, index, onIndexChange, onClose }: Props) {
  const open = index !== null && products[index] != null;
  const product = open ? products[index] : null;

  if (!open || !product) return null;
  return (
    <LightboxInner
      key={product.id}
      products={products}
      index={index as number}
      product={product}
      onIndexChange={onIndexChange}
      onClose={onClose}
    />
  );
}

function LightboxInner({ products, index, product, onIndexChange, onClose }: {
  products: Product[]; index: number; product: Product; onIndexChange: (i: number) => void; onClose: () => void;
}) {
  const lang = useStore((s) => s.lang);
  const t = translations[lang];
  const openAuthModal = useStore((s) => s.openAuthModal);
  const c = useProductCommerce(product);

  const images = getProductImages(product);
  const [imgIdx, setImgIdx] = useState(0);
  const hasMultiple = images.length > 1;

  const touchX = useRef<number | null>(null);
  const touchY = useRef<number | null>(null);

  const prevProduct = () => onIndexChange((index - 1 + products.length) % products.length);
  const nextProduct = () => onIndexChange((index + 1) % products.length);

  // ESC / arrows + body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') nextProduct();
      else if (e.key === 'ArrowLeft') prevProduct();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, products.length]);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; touchY.current = e.touches[0].clientY; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null || touchY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (Math.abs(dy) > Math.abs(dx) && dy > SWIPE) onClose();
    else if (Math.abs(dx) > SWIPE) (dx < 0 ? nextProduct : prevProduct)();
    touchX.current = null; touchY.current = null;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[20000] flex items-center justify-center bg-white animate-in fade-in duration-150"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Product photo — maximised (full-bleed); controls float over the white ── */}
      <img
        src={images[imgIdx] ?? product.img}
        alt={product.name}
        draggable={false}
        className="max-h-full max-w-full select-none object-contain p-3 sm:p-6"
      />

      {/* Close */}
      <button
        type="button"
        aria-label="Zavřít"
        onClick={onClose}
        className="absolute right-3 top-3 z-[20010] flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-zinc-100 hover:text-foreground"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Margin — compact, top-left */}
      {c.canSeePrices && (
        <div className="absolute left-4 top-4 z-[20005]">
          <p className={`font-display text-xl font-black leading-none tracking-tighter tabular-nums sm:text-2xl ${c.isOverridden ? 'text-blue-600' : 'text-foreground'}`}>
            €{c.totalMargin.toFixed(2)}
          </p>
          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            {t.margin}{c.qty > 1 ? ` · €${c.unitMargin.toFixed(2)}/${t.pcs}` : ''}
          </p>
        </div>
      )}

      {/* Thumbnails — vertical, side (only when several photos); click maximises */}
      {hasMultiple && (
        <div className="absolute right-2 top-1/2 z-[20005] flex max-h-[80%] -translate-y-1/2 flex-col gap-2 overflow-y-auto">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setImgIdx(i)}
              aria-label={`Foto ${i + 1}`}
              className={`h-11 w-11 shrink-0 overflow-hidden rounded-lg border bg-white p-1 transition ${
                i === imgIdx ? 'border-foreground' : 'border-border hover:border-foreground/40'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-contain" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Bottom controls — prev · CTA · next (compact) */}
      <div className="absolute bottom-4 left-1/2 z-[20006] flex -translate-x-1/2 items-center gap-2 sm:bottom-6 sm:gap-3">
        <button
          type="button"
          aria-label="Předchozí produkt"
          onClick={prevProduct}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:bg-zinc-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {c.canSeePrices ? (
          c.qty === 0 ? (
            <Button
              onClick={c.add}
              disabled={c.isOutOfStock}
              className="h-10 gap-1.5 rounded-full bg-foreground px-6 text-xs font-semibold text-background shadow-sm hover:bg-foreground/90"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {c.isOutOfStock ? t.soldOut : t.addToCart}
            </Button>
          ) : (
            <div className="flex items-center gap-3 rounded-full border border-border bg-white px-2 py-1 shadow-sm">
              <button onClick={c.dec} aria-label="Ubrat" className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition hover:bg-zinc-100">
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[1.75rem] text-center text-sm font-bold tabular-nums">{c.qty}</span>
              <button onClick={c.inc} disabled={c.atMax} aria-label="Přidat" className={`flex h-8 w-8 items-center justify-center rounded-full transition ${c.atMax ? 'text-muted-foreground' : 'text-foreground hover:bg-zinc-100'}`}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )
        ) : c.isLead ? (
          <LeadUpgradeBadge />
        ) : (
          <Button onClick={() => openAuthModal('register')} className="h-10 gap-1.5 rounded-full px-6 text-xs font-semibold shadow-sm">
            <Lock className="h-3.5 w-3.5" /> {t.getWholesalePrices}
          </Button>
        )}

        <button
          type="button"
          aria-label="Další produkt"
          onClick={nextProduct}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:bg-zinc-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
