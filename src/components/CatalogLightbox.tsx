import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Plus, Minus, ShoppingCart, Lock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { LeadUpgradeBadge } from '@/components/LeadUpgradeBadge';
import { useProductCommerce, getProductImages } from '@/hooks/useProductCommerce';
import type { Product } from '@/lib/types';

type Tx = (typeof translations)[keyof typeof translations];

interface Props {
  products: Product[];
  index: number | null;          // null = closed
  onIndexChange: (i: number) => void;
  onClose: () => void;
  wishlistIds?: Set<string>;
  onToggleWishlist?: (id: string) => void;
}

/**
 * Fullscreen catalog browser. Pages through the catalog as a native horizontal
 * snap carousel — one product per screen — driven by swipe / trackpad / scroll
 * (arrows just scroll it). Each slide carries its own product photo, live margin
 * and add-to-cart, all centred and anchored to the watch so they slide together.
 */
export function CatalogLightbox({ products, index, onIndexChange, onClose, wishlistIds, onToggleWishlist }: Props) {
  const open = index !== null && products[index] != null;
  if (!open) return null;
  return (
    <LightboxInner
      products={products}
      openIndex={index as number}
      onIndexChange={onIndexChange}
      onClose={onClose}
      wishlistIds={wishlistIds}
      onToggleWishlist={onToggleWishlist}
    />
  );
}

function LightboxInner({ products, openIndex, onIndexChange, onClose, wishlistIds, onToggleWishlist }: {
  products: Product[]; openIndex: number; onIndexChange: (i: number) => void; onClose: () => void;
  wishlistIds?: Set<string>; onToggleWishlist?: (id: string) => void;
}) {
  const lang = useStore((s) => s.lang);
  const t = translations[lang];
  const openAuthModal = useStore((s) => s.openAuthModal);

  const trackRef = useRef<HTMLDivElement>(null);
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start on the opened product (before paint, no flash).
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollLeft = openIndex * el.clientWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the parent index roughly in sync as the user swipes.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      if (settleRef.current) clearTimeout(settleRef.current);
      settleRef.current = setTimeout(() => {
        const w = el.clientWidth || 1;
        const i = Math.max(0, Math.min(products.length - 1, Math.round(el.scrollLeft / w)));
        onIndexChange(i);
      }, 90);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); if (settleRef.current) clearTimeout(settleRef.current); };
  }, [products.length, onIndexChange]);

  const go = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };

  // ESC / arrow keys + body scroll lock.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[20000] bg-white animate-in fade-in duration-150">
      {/* Native horizontal snap track — each product a full-screen slide */}
      <div
        ref={trackRef}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <ProductSlide
            key={p.id}
            product={p}
            t={t}
            openAuthModal={openAuthModal}
            isWishlisted={!!wishlistIds?.has(p.id)}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
      </div>

      {/* Close */}
      <button
        type="button"
        aria-label="Zavřít"
        onClick={onClose}
        className="absolute right-3 top-3 z-[20010] flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-zinc-100 hover:text-foreground"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Product navigation — stays put beside the (centred) product */}
      <button
        type="button"
        aria-label="Předchozí produkt"
        onClick={() => go(-1)}
        className="absolute left-2 top-1/2 z-[20006] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:bg-zinc-100 sm:left-5"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Další produkt"
        onClick={() => go(1)}
        className="absolute right-2 top-1/2 z-[20006] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:bg-zinc-100 sm:right-5"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>,
    document.body,
  );
}

/* ── One product slide — photo + live margin + CTA, centred & anchored together ── */
function ProductSlide({ product, t, openAuthModal, isWishlisted, onToggleWishlist }: {
  product: Product; t: Tx; openAuthModal: (tab?: 'login' | 'register' | 'b2b') => void;
  isWishlisted: boolean; onToggleWishlist?: (id: string) => void;
}) {
  const c = useProductCommerce(product);
  const images = getProductImages(product);
  const [photoIdx, setPhotoIdx] = useState(0);
  const hasMultiple = images.length > 1;

  return (
    <div className="flex h-full w-full shrink-0 snap-center flex-col items-center justify-center gap-3 px-14 py-6 sm:py-8">
      {/* Margin — anchored above the watch */}
      {c.canSeePrices && (
        <div className="shrink-0 text-center">
          <p className={`font-display text-xl font-black leading-none tracking-tighter tabular-nums sm:text-2xl ${c.isOverridden ? 'text-blue-600' : 'text-foreground'}`}>
            €{c.totalMargin.toFixed(2)}
          </p>
          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            {t.margin}{c.qty > 1 ? ` · €${c.unitMargin.toFixed(2)}/${t.pcs}` : ''}
          </p>
        </div>
      )}

      {/* Photo */}
      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
        <img
          src={images[photoIdx] ?? images[0] ?? product.img}
          alt={product.name}
          draggable={false}
          className="max-h-full max-w-full select-none object-contain"
        />
        {onToggleWishlist && (
          <button
            type="button"
            aria-label="Přidat do oblíbených"
            onClick={() => (c.isLoggedIn ? onToggleWishlist(product.id) : openAuthModal('login'))}
            className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-zinc-100 hover:text-foreground"
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-primary text-primary' : ''}`} />
          </button>
        )}
      </div>

      {/* Thumbnails — one row (only when several photos); click maximises */}
      {hasMultiple && (
        <div className="flex shrink-0 flex-wrap justify-center gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPhotoIdx(i)}
              aria-label={`Foto ${i + 1}`}
              className={`h-11 w-11 shrink-0 overflow-hidden rounded-lg border bg-white p-1 transition ${
                i === photoIdx ? 'border-foreground' : 'border-border hover:border-foreground/40'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-contain" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* CTA — anchored below the watch */}
      <div className="shrink-0">
        {c.canSeePrices ? (
          c.qty === 0 ? (
            <Button
              onClick={c.add}
              disabled={c.isOutOfStock}
              className="h-10 gap-1.5 rounded-none bg-foreground px-6 text-xs font-semibold text-background shadow-sm hover:bg-foreground/90"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {c.isOutOfStock ? t.soldOut : t.addToCart}
            </Button>
          ) : (
            <div className="flex items-center gap-3 rounded-none border border-border bg-white px-2 py-1 shadow-sm">
              <button onClick={c.dec} aria-label="Ubrat" className="flex h-8 w-8 items-center justify-center rounded-none text-foreground transition hover:bg-zinc-100">
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[1.75rem] text-center text-sm font-bold tabular-nums">{c.qty}</span>
              <button onClick={c.inc} disabled={c.atMax} aria-label="Přidat" className={`flex h-8 w-8 items-center justify-center rounded-none transition ${c.atMax ? 'text-muted-foreground' : 'text-foreground hover:bg-zinc-100'}`}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )
        ) : c.isLead ? (
          <LeadUpgradeBadge />
        ) : (
          <Button onClick={() => openAuthModal('register')} className="h-10 gap-1.5 rounded-none px-6 text-xs font-semibold shadow-sm">
            <Lock className="h-3.5 w-3.5" /> {t.getWholesalePrices}
          </Button>
        )}
      </div>
    </div>
  );
}
