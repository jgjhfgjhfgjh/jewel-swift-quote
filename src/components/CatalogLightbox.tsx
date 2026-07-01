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
    <div className="fixed inset-0 z-[20000] flex flex-col bg-white animate-in fade-in duration-150">
      {/* Close */}
      <button
        type="button"
        aria-label="Zavřít"
        onClick={onClose}
        className="absolute right-3 top-3 z-[20010] flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-zinc-100 hover:text-foreground"
      >
        <X className="h-6 w-6" />
      </button>

      {/* ── Margin — prominent number, top ── */}
      {c.canSeePrices && (
        <div className="shrink-0 pt-14 pb-1 text-center sm:pt-16">
          <p className={`font-display text-5xl font-black tracking-tighter tabular-nums sm:text-6xl ${c.isOverridden ? 'text-blue-600' : 'text-foreground'}`}>
            €{c.totalMargin.toFixed(2)}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {t.margin}{c.qty > 1 ? ` · €${c.unitMargin.toFixed(2)} / ${t.pcs}` : ''}
          </p>
        </div>
      )}

      {/* ── Product photo — never shrinks; arrows + swipe navigate products ── */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={images[imgIdx] ?? product.img}
          alt={product.name}
          draggable={false}
          className="max-h-full max-w-full select-none object-contain px-16 py-4 sm:px-24 sm:py-8"
        />

        {/* prev / next PRODUCT */}
        <button
          type="button"
          aria-label="Předchozí produkt"
          onClick={prevProduct}
          className="absolute left-2 top-1/2 z-[20006] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-foreground transition hover:bg-zinc-100 sm:left-6"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
        <button
          type="button"
          aria-label="Další produkt"
          onClick={nextProduct}
          className="absolute right-2 top-1/2 z-[20006] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-foreground transition hover:bg-zinc-100 sm:right-6"
        >
          <ChevronRight className="h-7 w-7" />
        </button>

        {/* thumbnails — only when the product has several photos; click maximises */}
        {hasMultiple && (
          <div className="absolute inset-x-0 bottom-2 z-[20005] flex flex-wrap justify-center gap-2 px-16">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImgIdx(i)}
                aria-label={`Foto ${i + 1}`}
                className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-white p-1 transition ${
                  i === imgIdx ? 'border-foreground' : 'border-border hover:border-foreground/40'
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-contain" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── CTA — directly below the product ── */}
      <div className="flex shrink-0 justify-center px-6 pb-10 pt-2 sm:pb-12">
        {c.canSeePrices ? (
          c.qty === 0 ? (
            <Button
              onClick={c.add}
              disabled={c.isOutOfStock}
              className="h-12 gap-2 rounded-full bg-foreground px-10 text-sm font-semibold text-background hover:bg-foreground/90"
            >
              <ShoppingCart className="h-4 w-4" />
              {c.isOutOfStock ? t.soldOut : t.addToCart}
            </Button>
          ) : (
            <div className="flex items-center gap-6 rounded-full border border-border px-4 py-2">
              <button onClick={c.dec} aria-label="Ubrat" className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-zinc-100">
                <Minus className="h-5 w-5" />
              </button>
              <span className="min-w-[2.5rem] text-center text-xl font-bold tabular-nums">{c.qty}</span>
              <button onClick={c.inc} disabled={c.atMax} aria-label="Přidat" className={`flex h-9 w-9 items-center justify-center rounded-full transition ${c.atMax ? 'text-muted-foreground' : 'text-foreground hover:bg-zinc-100'}`}>
                <Plus className="h-5 w-5" />
              </button>
            </div>
          )
        ) : c.isLead ? (
          <LeadUpgradeBadge />
        ) : (
          <Button onClick={() => openAuthModal('register')} className="h-12 gap-2 rounded-full px-10 text-sm font-semibold">
            <Lock className="h-4 w-4" /> {t.getWholesalePrices}
          </Button>
        )}
      </div>
    </div>,
    document.body,
  );
}
