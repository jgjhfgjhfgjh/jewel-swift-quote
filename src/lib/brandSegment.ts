/**
 * Brand category segment — derived from a product's `category` string.
 * Categories in products.json look like:
 *   "HODINKY | HODINKY SKLADEM | GUESS"
 *   "ŠPERKY | ŠPERKY SKLADEM | PANDORA"
 *   "VÝHRADNÍ DISTRIBUCE | HODINKY | VICEROY"
 *   "VÝHRADNÍ DISTRIBUCE | ŠPERKY | BREIL"
 *   "VÝHRADNÍ DISTRIBUCE | ŘEMÍNKY | HIP HOP" → null
 *   "PŘÍSLUŠENSTVÍ | PANDORA"                  → null
 */
export type BrandSegment = 'watches' | 'jewelry';

export function getCategorySegment(category: string | undefined | null): BrandSegment | null {
  if (!category) return null;
  const c = category.toUpperCase();
  // ŠPERKY first because some entries contain both (none do today, but safer)
  if (c.includes('ŠPERKY')) return 'jewelry';
  if (c.includes('HODINKY')) return 'watches';
  return null;
}

export const SEGMENT_LABEL: Record<BrandSegment, string> = {
  watches: 'Hodinky',
  jewelry: 'Šperky',
};

export const SEGMENT_LABEL_GENITIVE: Record<BrandSegment, string> = {
  watches: 'hodinek',
  jewelry: 'šperků',
};

export function isBrandSegment(v: string | null | undefined): v is BrandSegment {
  return v === 'watches' || v === 'jewelry';
}
