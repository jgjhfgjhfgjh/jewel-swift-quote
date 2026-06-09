/**
 * Brand-name normalization shared across Brands, BrandDetail, BrandShowcaseCarousel,
 * and the new Concern (koncern) features.
 *
 * The supplier feed ships brand variants like "GUESS JEWELS" / "SWATCH BIJOUX".
 * `toBrandKey` folds those onto a single canonical UPPERCASE key, and
 * `toDisplayName` turns a key into nicely cased label for the UI.
 */

/* Variant manufacturer string → canonical brand key (after .toUpperCase()) */
export const BRAND_ALIASES: Record<string, string> = {
  'TOMMY HILFIGER JEWELS': 'TOMMY HILFIGER',
  'GUESS JEWELS': 'GUESS',
  'HUGO BOSS JEWELS': 'HUGO BOSS',
  'EMPORIO ARMANI JEWELS': 'EMPORIO ARMANI',
  'EMPORIO ARMANI JEWELRY': 'EMPORIO ARMANI',
  'CALVIN KLEIN JEWELRY': 'CALVIN KLEIN',
  'BREIL JEWELS': 'BREIL',
  'JUST CAVALLI JEWELS': 'JUST CAVALLI',
  'ROBERTO CAVALLI BY FRANCK MULLER': 'ROBERTO CAVALLI',
  'ROBERTO CAVALLI by FRANCK MULLER': 'ROBERTO CAVALLI',
  'POLICE JEWELS': 'POLICE',
  'SECTOR JEWELS': 'SECTOR',
  'VICEROY FASHION': 'VICEROY',
  'VICEROY JEWELS': 'VICEROY',
  'VICEROY KIDS': 'VICEROY',
  'VICEROY KIDS JEWELS': 'VICEROY',
  'DISNEY JEWELS': 'DISNEY',
  'PIERRE LANNIER JEWELRY': 'PIERRE LANNIER',
  'PIERRE LANNIER STRAPS': 'PIERRE LANNIER',
  'HIP HOP STRAPS': 'HIP HOP',
  'MICHAEL KORS JEWELRY': 'MICHAEL KORS',
  'ALVIERO MARTINI JEWELS': 'ALVIERO MARTINI',
  'ZOPPINI JEWELS': 'ZOPPINI',
  'SWATCH BIJOUX': 'SWATCH',
  'CHRONOSTAR BY SECTOR': 'CHRONOSTAR',
  'MARK MADDOX - NEW COLLECTION': 'MARK MADDOX',
  'HACKER LED WATCHES': 'HACKER',
};

/* Canonical key → display label (override default title-casing where needed) */
export const DISPLAY_NAMES: Record<string, string> = {
  'DKNY': 'DKNY',
  'Q&Q': 'Q&Q',
  'HIP HOP': 'Hip Hop',
  'LA PETITE STORY': 'La Petite Story',
  'HUGO BOSS': 'Hugo Boss',
  'EMPORIO ARMANI': 'Emporio Armani',
  'TOMMY HILFIGER': 'Tommy Hilfiger',
  'CALVIN KLEIN': 'Calvin Klein',
  'MICHAEL KORS': 'Michael Kors',
  'PIERRE LANNIER': 'Pierre Lannier',
  'ROBERTO CAVALLI': 'Roberto Cavalli',
  'JUST CAVALLI': 'Just Cavalli',
  'VERSUS VERSACE': 'Versus Versace',
  'MISS SIXTY': 'Miss Sixty',
  'MARK MADDOX': 'Mark Maddox',
  'BEVERLY HILLS POLO CLUB': 'Beverly Hills Polo Club',
  'MANUEL ZED': 'Manuel Zed',
  'ALVIERO MARTINI': 'Alviero Martini',
  'CERRUTI 1881': 'Cerruti 1881',
  'DANIEL WELLINGTON': 'Daniel Wellington',
};

/** Raw feed manufacturer string → canonical UPPERCASE brand key. */
export function toBrandKey(manufacturer: string): string {
  const raw = manufacturer.trim();
  return (BRAND_ALIASES[raw] || raw).toUpperCase();
}

/** Canonical brand key → nicely cased display label. */
export function toDisplayName(key: string): string {
  if (DISPLAY_NAMES[key]) return DISPLAY_NAMES[key];
  return key.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
