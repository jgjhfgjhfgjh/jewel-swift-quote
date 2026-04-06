import type { Product, BrandDiscount } from './types';

/**
 * Discount hierarchy (replacement, NOT additive):
 * 1. Individual product override — session (highest priority)
 * 2. Customer permanent product discount
 * 3. Admin session brand discount
 * 4. Customer permanent brand discount
 * 5. Base feed discount (lowest / default)
 * 
 * Customer base_discount is applied ADDITIONALLY on top of the active discount.
 */
export function getActiveDiscount(
  product: Product,
  productDiscounts: Record<string, number>,
  brandDiscounts: BrandDiscount[],
  customerProductDiscounts?: Record<string, number>,
  customerBrandDiscounts?: BrandDiscount[]
): { percent: number; source: 'manual' | 'brand' | 'customer-product' | 'customer-brand' | 'feed' } {
  const baseDiscount = product.price > 0
    ? ((product.price - product.wholesale) / product.price) * 100
    : 0;

  // Priority 1: Session individual product override
  if (product.id in productDiscounts) {
    return { percent: productDiscounts[product.id], source: 'manual' };
  }

  // Priority 2: Customer permanent product discount
  if (customerProductDiscounts && product.id in customerProductDiscounts) {
    return { percent: customerProductDiscounts[product.id], source: 'customer-product' };
  }

  // Priority 3: Session brand discount
  const brandDiscount = brandDiscounts.find((d) => d.brand === product.manufacturer);
  if (brandDiscount) {
    return { percent: brandDiscount.percent, source: 'brand' };
  }

  // Priority 4: Customer permanent brand discount
  if (customerBrandDiscounts) {
    const custBrand = customerBrandDiscounts.find((d) => d.brand === product.manufacturer);
    if (custBrand) {
      return { percent: custBrand.percent, source: 'customer-brand' };
    }
  }

  // Priority 5: Base feed discount
  return { percent: baseDiscount, source: 'feed' };
}

/**
 * Calculate the final VOC price including customer base discount.
 * 
 * Final VOC = MOC * (1 - activeDiscount/100) * (1 - customerDiscount/100)
 */
export function getFinalVoc(
  moc: number,
  activeDiscountPercent: number,
  customerBaseDiscount: number = 0
): number {
  const afterActive = moc * (1 - activeDiscountPercent / 100);
  if (customerBaseDiscount > 0) {
    return afterActive * (1 - customerBaseDiscount / 100);
  }
  return afterActive;
}
