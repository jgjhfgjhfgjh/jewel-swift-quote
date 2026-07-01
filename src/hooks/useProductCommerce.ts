import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { getActiveDiscount, getFinalVoc } from '@/lib/discount';
import type { Product } from '@/lib/types';

/**
 * Shared catalog commerce logic — discount, wholesale price, live margin and
 * cart quantity controls. Used by the product card and the fullscreen lightbox
 * so both stay in sync (margin updates as quantity changes).
 */
export function useProductCommerce(product: Product) {
  const {
    cart, brandDiscounts, productDiscounts, addToCart, updateQuantity, removeFromCart,
    salesCustomer, salesBrandDiscounts, salesProductDiscounts,
  } = useStore();
  const { isLead, profile, user } = useAuthContext();

  const cartItem = cart.find((i) => i.product.id === product.id);
  const qty = cartItem?.quantity ?? 0;
  const isOutOfStock = product.stock <= 0;
  const atMax = qty >= product.stock;

  const effectiveProductDiscounts = salesCustomer ? salesProductDiscounts : productDiscounts;
  const effectiveBrandDiscounts = salesCustomer ? salesBrandDiscounts : brandDiscounts;
  const customerDiscount = salesCustomer ? salesCustomer.base_discount : (profile?.base_discount ?? 0);

  const { percent: activeDiscount, source } = getActiveDiscount(product, effectiveProductDiscounts, effectiveBrandDiscounts);
  const effectiveVoc = getFinalVoc(product.price, activeDiscount, customerDiscount);
  const unitMargin = product.price - effectiveVoc;
  const totalMargin = unitMargin * Math.max(qty, 1);
  const isOverridden = source === 'manual' || source === 'brand' || source === 'customer-product' || source === 'customer-brand';

  const canSeePrices = !!user && !isLead;

  const add = () => { if (!isOutOfStock) addToCart(product); };
  const inc = () => { if (!atMax) updateQuantity(product.id, qty + 1); };
  const dec = () => { if (qty <= 1) removeFromCart(product.id); else updateQuantity(product.id, qty - 1); };
  const setQty = (n: number) => {
    if (n <= 0) removeFromCart(product.id);
    else updateQuantity(product.id, Math.min(n, product.stock));
  };

  return {
    qty, isOutOfStock, atMax, activeDiscount, customerDiscount, effectiveVoc,
    unitMargin, totalMargin, isOverridden, canSeePrices, isLead, isLoggedIn: !!user,
    add, inc, dec, setQty,
  };
}

/** Resolve a product's image list (main + additional), mirroring the card logic. */
export function getProductImages(product: Product): string[] {
  const raw = product as unknown as Record<string, unknown>;
  const addRaw = raw.add_images;
  const addImages: string[] = Array.isArray(addRaw)
    ? (addRaw as unknown[]).filter((v): v is string => typeof v === 'string')
    : typeof addRaw === 'string' && addRaw ? [addRaw] : [];

  const p = product as Product & { image_urls?: string[]; image_url?: string | null };
  if (p.image_urls && p.image_urls.length > 0) return p.image_urls.filter(Boolean);
  return [
    (typeof raw.img_url === 'string' ? raw.img_url : '') || p.image_url || product.img,
    ...addImages,
  ].filter((v): v is string => Boolean(v));
}
