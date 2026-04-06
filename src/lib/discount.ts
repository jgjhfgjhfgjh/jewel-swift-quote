import type { Product, BrandDiscount } from './types';

/**
 * Discount hierarchy (replacement, NOT additive):
 * 1. Individual product override (highest priority)
 * 2. Admin brand discount
 * 3. Base feed discount (lowest / default)
 */
export function getActiveDiscount(
  product: Product,
  productDiscounts: Record<string, number>,
  brandDiscounts: BrandDiscount[]
): { percent: number; source: 'manual' | 'brand' | 'feed' } {
  const baseDiscount = product.price > 0
    ? ((product.price - product.wholesale) / product.price) * 100
    : 0;

  // Priority 1: Individual product override
  if (product.id in productDiscounts) {
    return { percent: productDiscounts[product.id], source: 'manual' };
  }

  // Priority 2: Admin brand discount
  const brandDiscount = brandDiscounts.find((d) => d.brand === product.manufacturer);
  if (brandDiscount) {
    return { percent: brandDiscount.percent, source: 'brand' };
  }

  // Priority 3: Base feed discount
  return { percent: baseDiscount, source: 'feed' };
}
