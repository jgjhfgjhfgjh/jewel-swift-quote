import type { Product } from '@/lib/types';

const FEED_CATEGORY_FIELDS = ['category', 'category_text', 'CATEGORY'] as const;
const FEED_BRAND_FIELDS = ['manufacturer', 'brand'] as const;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Hodinky: ['hodinky', 'watches', 'hodin'],
  Šperky: ['šperky', 'jewelry', 'bijoux', 'jewels', 'šperk'],
  Příslušenství: ['příslušenství', 'accessories', 'strap', 'box'],
};

function readFeedString(product: Product, field: string) {
  const value = (product as unknown as Record<string, unknown>)[field];
  return typeof value === 'string' ? value.trim() : '';
}

export function getProductFeedCategories(product: Product) {
  return FEED_CATEGORY_FIELDS.map((field) => readFeedString(product, field)).filter(Boolean);
}

export function getProductBrand(product: Product) {
  return FEED_BRAND_FIELDS.map((field) => readFeedString(product, field)).find(Boolean) ?? '';
}

export function isDropshippingProduct(product: Product) {
  return getProductFeedCategories(product).some((value) => value.toLowerCase().includes('dropshipping'));
}

export function matchesFeedCategory(product: Product, selectedCategory: string | null) {
  if (!selectedCategory) return true;

  const keywords = CATEGORY_KEYWORDS[selectedCategory];
  if (!keywords) return true;

  const categoryValues = getProductFeedCategories(product).map((value) => value.toLowerCase());
  return categoryValues.some((value) => keywords.some((keyword) => value.includes(keyword)));
}