import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Plus, Minus, ShoppingCart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <div className="fixed inset-0 z-[20000] flex flex-col bg-white/98 backdrop-blur-sm animate-in fade-in duration-150 lg:flex-row">
      {/* Close */}
      <button
        type="button"
        aria-label="Zavřít"
        onClick={onClose}
        className="fixed right-3 top-3 z-[20010] flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-foreground shadow-md transition hover:bg-black/10"
      >
        <X className="h-6 w-6" />
      </button>

      {/* ── Image area (never shrinks; fills remaining space) ── */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={images[imgIdx] ?? product.img}
          alt={product.name}
          draggable={false}
          className="max-h-full max-w-full select-none object-contain p-4 sm:p-8 lg:p-12"
        />

        {/* prev / next PRODUCT */}
        <button
          type="button"
          aria-label="Předchozí produkt"
          onClick={prevProduct}
          className="absolute left-2 top-1/2 z-[20006] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/5 text-foreground shadow-md transition hover:bg-black/10 lg:left-4"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          aria-label="Další produkt"
          onClick={nextProduct}
          className="absolute right-2 top-1/2 z-[20006] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/5 text-foreground shadow-md transition hover:bg-black/10 lg:right-4"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* thumbnails — one centred row; clicking a thumbnail maximises that photo.
            Kept clear of the side arrows and (on mobile) the floating commerce sheet. */}
        {hasMultiple && (
          <div className="absolute inset-x-0 bottom-[150px] z-[20005] flex flex-wrap justify-center gap-2 px-14 lg:bottom-5">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImgIdx(i)}
                aria-label={`Foto ${i + 1}`}
                className={`h-11 w-11 shrink-0 overflow-hidden rounded-md border bg-white p-0.5 transition lg:h-14 lg:w-14 lg:p-1 ${
                  i === imgIdx ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-foreground/40'
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-contain" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        {/* product position */}
        <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/5 px-3 py-1 text-[11px] font-semibold tabular-nums text-muted-foreground">
          {index + 1} / {products.length}
        </span>
      </div>

      {/* ── Commerce panel — right column (desktop) / floating bottom sheet (mobile) ── */}
      <div className="absolute inset-x-0 bottom-0 z-[20005] border-t border-border bg-white/95 backdrop-blur-md
                      lg:static lg:z-auto lg:w-[380px] lg:shrink-0 lg:border-l lg:border-t-0 lg:bg-white lg:backdrop-blur-none">
        <div className="mx-auto max-w-2xl px-4 py-3 lg:h-full lg:max-w-none lg:overflow-y-auto lg:px-7 lg:py-10">
          {/* brand + discount */}
          <div className="flex items-start justify-between gap-3">
            <span className="text-[10px] font-medium uppercase tracking-wider text-gold">{product.manufacturer}</span>
            {c.canSeePrices && c.activeDiscount > 0 && (
              <Badge className={`text-[10px] font-bold ${c.isOverridden ? 'bg-blue-500 text-white' : 'bg-primary text-destructive-foreground'}`}>
                -{Math.round(c.activeDiscount)}%{c.customerDiscount > 0 ? ` -${c.customerDiscount}%` : ''}
              </Badge>
            )}
          </div>
          <h2 className="mt-0.5 line-clamp-2 text-base font-semibold leading-snug text-foreground lg:text-xl">{product.name}</h2>

          {c.canSeePrices && (
            <p className={`mt-1 text-[11px] font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-destructive'}`}>
              {product.stock > 0 ? `${t.stockCount}: ${product.stock >= 20 ? '20+' : product.stock} ${t.pcs}` : t.outOfStock}
            </p>
          )}

          {c.canSeePrices ? (
            <div className="mt-3 flex items-end justify-between gap-4 lg:mt-6 lg:flex-col lg:items-stretch lg:gap-4">
              {/* margin (live) */}
              <div className="min-w-0">
                <p className={`text-xl font-bold tabular-nums lg:text-2xl ${c.isOverridden ? 'text-blue-600' : 'text-primary'}`}>
                  {c.qty > 1 ? t.marginTotal : t.margin}: €{c.totalMargin.toFixed(2)}
                </p>
                {c.qty > 1 && (
                  <p className="text-[11px] text-muted-foreground tabular-nums">{t.marginPerPc}: €{c.unitMargin.toFixed(2)}</p>
                )}
                <div className="mt-0.5 flex items-baseline gap-2 text-xs text-muted-foreground">
                  <span>{t.voc}: €{c.effectiveVoc.toFixed(2)}</span>
                  <span>{t.moq}: €{product.price.toFixed(2)}</span>
                </div>
              </div>

              {/* add to cart / qty */}
              <div className="shrink-0 lg:w-full">
                {c.qty === 0 ? (
                  <Button
                    className="h-11 w-full gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={c.add}
                    disabled={c.isOutOfStock}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="text-sm">{c.isOutOfStock ? t.soldOut : t.addToCart}</span>
                  </Button>
                ) : (
                  <div className="flex w-full items-center justify-between gap-2 rounded-full border border-primary/30 bg-primary/5 p-1 lg:justify-center lg:gap-4">
                    <button onClick={c.dec} aria-label="Ubrat" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center text-base font-semibold tabular-nums">{c.qty}</span>
                    <button onClick={c.inc} disabled={c.atMax} aria-label="Přidat" className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${c.atMax ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'}`}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : c.isLead ? (
            <div className="mt-3"><LeadUpgradeBadge /></div>
          ) : (
            <Button className="mt-3 h-11 w-full gap-1.5" onClick={() => openAuthModal('register')}>
              <Lock className="h-4 w-4" /> <span className="text-sm">{t.getWholesalePrices}</span>
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
