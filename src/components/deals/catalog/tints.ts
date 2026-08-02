/**
 * Barevná škála katalogu GoBigDeal — teal/petrol paleta dle reference
 * (2026-07-27): 50 #F2F9F9 → 950 #0B1215 „obsidian".
 *
 * Jeden zdroj pravdy pro celou stránku /deals: obsidian je barva plochy,
 * světlý konec škály jsou podklady dlaždic a karet (loga s multiply blendem
 * potřebují světlý podklad), tmavý konec nesou tmavé karty hero pásu.
 */
export const GBD_TEAL = {
  50: '#F2F9F9',
  100: '#DDEEF0',
  200: '#BFDEE2',
  300: '#93C5CD',
  400: '#60A4B0',
  500: '#448996',
  600: '#3B717F',
  700: '#355D69',
  800: '#324E58',
  900: '#2D434C',
  950: '#0B1215',
} as const;

/** Barva plochy stránky /deals. */
export const OBSIDIAN = GBD_TEAL[950];

/** Podklady dlaždic — světlý konec škály (loga jedou přes multiply);
 *  5 stupňů kvůli rozptylu, ať sousední dlaždice nesplývají. */
export const TINTS = [GBD_TEAL[50], GBD_TEAL[100], GBD_TEAL[200], GBD_TEAL[300], GBD_TEAL[400]] as const;

/** Tón podle pozice v řadě — čistá rotace škály, sousedé nikdy nesplývají. */
export function tintForIndex(i: number): string {
  return TINTS[i % TINTS.length];
}

/* Koncern → pevný tón podle pořadí v CONCERNS. Dlaždice koncernů jdou ve
   stejném pořadí, takže rotace v pásu i barva na kartě dealu se shodují. */
import { CONCERNS } from '@/data/concerns';
const CONCERN_TINT = new Map(CONCERNS.map((c, i) => [c.slug, tintForIndex(i)]));

/** Stabilní tón podle klíče: koncerny z mapy, ostatní klíče hashem. */
export function tintForKey(key: string | undefined): string {
  if (!key) return TINTS[0];
  const fixed = CONCERN_TINT.get(key);
  if (fixed) return fixed;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}
