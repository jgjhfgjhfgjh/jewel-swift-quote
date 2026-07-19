/**
 * Výchozí pořadí značek ve výlohách — sdílené showcase karuselem
 * (BrandShowcaseCarousel) i shelfem „Všechny značky" (BrandLogoRow), aby
 * obě plochy začínaly stejnými značkami.
 *
 * Klíče jsou canonical UPPERCASE (viz `toBrandKey` v lib/brandNormalize).
 * Značky mimo seznam následují ve stávajícím pořadí z katalogu (podle počtu
 * produktů) — sort je stabilní, takže se jejich vzájemné pořadí nemění.
 */
export const PRIORITY_BRAND_KEYS = [
  'SWAROVSKI',
  'TOMMY HILFIGER',
  'PANDORA',
  'GUESS',
  'TISSOT',
];

/** Seřadí položky katalogu tak, aby prioritní značky byly první. */
export function sortByBrandPriority<T extends { key: string }>(items: T[]): T[] {
  const rank = new Map(PRIORITY_BRAND_KEYS.map((k, i) => [k, i]));
  return [...items].sort(
    (a, b) => (rank.get(a.key) ?? Infinity) - (rank.get(b.key) ?? Infinity),
  );
}
