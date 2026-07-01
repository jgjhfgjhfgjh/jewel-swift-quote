import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Plus, Minus, ShoppingCart, Lock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { LeadUpgradeBadge } from '@/components/LeadUpgradeBadge';
import { useProductCommerce, getProductImages } from '@/hooks/useProductCommerce';
import type { Product } from '@/lib/types';

interface Props {
  products: Product[];
  index: number | null;          // null = closed
  onIndexChange: (i: number) => void;
  onClose: () => void;
  wishlistIds?: Set<string>;
  onToggleWishlist?: (id: string) => void;
}

/**
 * Fullscreen catalog browser. Opened from a product image, it pages through the
 * catalog as a native horizontal snap carousel — one product per screen —
 * driven by swipe / trackpad / scroll (arrows just scroll it), exactly like the
 * homepage brand showcase. The centred product drives a live margin + add-to-cart
 * panel; products with several photos expose thumbnails to maximise a given shot.
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
  const [current, setCurrent] = useState(openIndex);
  const [photoIdx, setPhotoIdx] = useState(0);

  const product = products[current] ?? products[0];
  const c = useProductCommerce(product);
  const images = getProductImages(product);
  const hasMultiple = images.length > 1;

  // Start the track on the product that was opened (before paint, no flash).
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollLeft = openIndex * el.clientWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track which product is centred as the user swipes/scrolls.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      if (settleRef.current) clearTimeout(settleRef.current);
      settleRef.current = setTimeout(() => {
        const w = el.clientWidth || 1;
        const i = Math.max(0, Math.min(products.length - 1, Math.round(el.scrollLeft / w)));
        setCurrent((prev) => {
          if (prev !== i) { setPhotoIdx(0); onIndexChange(i); }
          return i;
        });
      }, 70);
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

  // ── Shared pieces (reused in the mobile overlay + desktop side panel) ──
  const marginEl = c.canSeePrices ? (
    <div>
      <p className={`font-display text-xl font-black leading-none tracking-tighter tabular-nums sm:text-2xl ${c.isOverridden ? 'text-blue-600' : 'text-foreground'}`}>
        €{c.totalMargin.toFixed(2)}
      </p>
      <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        {t.margin}{c.qty > 1 ? ` · €${c.unitMargin.toFixed(2)}/${t.pcs}` : ''}
      </p>
    </div>
  ) : null;

  const ctaEl = c.canSeePrices ? (
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
  );

  const thumbButtons = images.map((src, i) => (
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
  ));

  const arrowBtn = (dir: 1 | -1) => (
    <button
      type="button"
      aria-label={dir === -1 ? 'Předchozí produkt' : 'Další produkt'}
      onClick={() => go(dir)}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:bg-zinc-100"
    >
      {dir === -1 ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
    </button>
  );

  return createPortal(
    <div className="fixed inset-0 z-[20000] flex flex-col bg-white animate-in fade-in duration-150 lg:flex-row">
      {/* Wishlist */}
      {onToggleWishlist && (
        <button
          type="button"
          aria-label="Přidat do oblíbených"
          onClick={() => (c.isLoggedIn ? onToggleWishlist(product.id) : openAuthModal('login'))}
          className="absolute right-14 top-3 z-[20010] flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-zinc-100 hover:text-foreground"
        >
          <Heart className={`h-5 w-5 ${wishlistIds?.has(product.id) ? 'fill-primary text-primary' : ''}`} />
        </button>
      )}

      {/* Close */}
      <button
        type="button"
        aria-label="Zavřít"
        onClick={onClose}
        className="absolute right-3 top-3 z-[20010] flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-zinc-100 hover:text-foreground"
      >
        <X className="h-5 w-5" />
      </button>

      {/* ── Image carousel — native horizontal snap track, one product per screen ── */}
      <div className="relative flex min-h-0 min-w-0 flex-1">
        <div
          ref={trackRef}
          className="flex h-full w-full min-w-0 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p, i) => {
            const imgs = getProductImages(p);
            const src = (i === current ? imgs[photoIdx] : imgs[0]) ?? imgs[0] ?? p.img;
            return (
              <div key={p.id} className="flex h-full w-full shrink-0 snap-center items-center justify-center">
                <img
                  src={src}
                  alt={p.name}
                  draggable={false}
                  loading="lazy"
                  className="max-h-full max-w-full select-none object-contain p-3 sm:p-6"
                />
              </div>
            );
          })}
        </div>

        {/* desktop arrows — beside the watch */}
        <div className="absolute left-4 top-1/2 hidden -translate-y-1/2 lg:block">{arrowBtn(-1)}</div>
        <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 lg:block">{arrowBtn(1)}</div>

        {/* mobile: margin (top-left) */}
        {marginEl && <div className="absolute left-4 top-4 z-[20005] lg:hidden">{marginEl}</div>}

        {/* mobile: thumbnails on the side */}
        {hasMultiple && (
          <div className="absolute right-2 top-1/2 z-[20005] flex max-h-[70%] -translate-y-1/2 flex-col gap-2 overflow-y-auto lg:hidden">
            {thumbButtons}
          </div>
        )}

        {/* mobile: prev · CTA · next at the bottom */}
        <div className="absolute bottom-4 left-1/2 z-[20006] flex -translate-x-1/2 items-center gap-2 lg:hidden">
          {arrowBtn(-1)}
          {ctaEl}
          {arrowBtn(1)}
        </div>
      </div>

      {/* ── Desktop side panel — margin above the CTA, vertically + horizontally centred ── */}
      <div className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:items-center lg:justify-center lg:gap-5 lg:px-6 lg:text-center">
        {marginEl}
        {ctaEl}
        {hasMultiple && <div className="flex max-w-[220px] flex-wrap justify-center gap-2 pt-2">{thumbButtons}</div>}
      </div>
    </div>,
    document.body,
  );
}
