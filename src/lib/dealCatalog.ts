/**
 * Datová vrstva katalogu GoBigDeal (/deals).
 *
 * Stránka je „Wolt dealů": místo restaurací dlaždice dávek, místo kuchyní
 * filtry na koncerny a značky (dodavatelé přibudou později). Aby katalog žil
 * i ve chvíli, kdy zrovna neběží žádná nabídka, míchá reálné dealy s
 * TEASER dlaždicemi odvozenými z koncernů — ty jsou vždy označené jako
 * připravované, nikdy nepředstírají živou nabídku s vymyšlenou uzávěrkou.
 */
import { CONCERNS, getConcernForDeal, type Concern } from '@/data/concerns';
import { toBrandKey } from '@/lib/brandNormalize';
import { dealIsLive, type Deal, type DealCategory } from '@/lib/deals';

export type TileKind = 'live' | 'closed' | 'upcoming' | 'teaser';

export interface DealTileItem {
  id: string;
  /** Číslo dávky (deals.deal_no) — zákaznická i interní evidence. */
  dealNo?: number;
  kind: TileKind;
  /** Cíl prokliku; teaser dlaždice ho nemají (řeší se hradlem registrace). */
  slug?: string;
  title: string;
  supplier: string;
  category: DealCategory;
  concernSlug?: string;
  concernName?: string;
  concernDomain?: string;
  brands: string[];
  /** Kanonické klíče značek pro filtrování (viz toBrandKey). */
  brandKeys: string[];
  models: number;
  maxDiscount: number;
  /** Živá dlaždice → odpočet do uzávěrky. */
  deadline?: string;
  /** Připravovaná dlaždice → odpočet do startu. */
  startsAt?: string;
  /** Kampaňová fotka dealu — nahrazuje tónovaný podklad s logem koncernu. */
  heroImageUrl?: string;
}

/** Reálný deal → dlaždice katalogu. */
export function tileFromDeal(deal: Deal, models: number): DealTileItem {
  const concern = getConcernForDeal(deal);
  const live = dealIsLive(deal);
  const upcoming = deal.status === 'active' && new Date(deal.starts_at).getTime() > Date.now();
  return {
    id: deal.id,
    dealNo: deal.deal_no ?? undefined,
    kind: upcoming ? 'upcoming' : live ? 'live' : 'closed',
    slug: deal.slug,
    title: deal.title,
    supplier: deal.supplier,
    category: deal.category,
    concernSlug: concern?.slug,
    concernName: concern?.name,
    concernDomain: concern?.domain,
    brands: deal.brands,
    brandKeys: deal.brands.map(toBrandKey),
    models,
    maxDiscount: deal.tiers.reduce((m, t) => Math.max(m, t.discount_percent), 0),
    deadline: deal.deadline,
    startsAt: deal.starts_at,
    heroImageUrl: deal.hero_image_url ?? undefined,
  };
}

/**
 * Teaser dlaždice pro koncern, o kterém zatím žádný deal neběží. Nese jen to,
 * co je pravda: koncern, jeho značky a fakt, že se dávka připravuje.
 */
export function teaserFromConcern(concern: Concern, title: string): DealTileItem {
  return {
    id: `teaser-${concern.slug}`,
    kind: 'teaser',
    title,
    supplier: concern.name,
    category: 'watches',
    concernSlug: concern.slug,
    concernName: concern.name,
    concernDomain: concern.domain,
    brands: concern.brandKeys.slice(0, 4),
    brandKeys: concern.brandKeys,
    models: 0,
    maxDiscount: 0,
  };
}

/**
 * Katalog = reálné dealy + teasery koncernů, které mezi nimi chybí.
 * `teaserTitle` dostane jméno koncernu (i18n šablona `{concern}`).
 */
export function buildCatalog(
  deals: Deal[],
  counts: Record<string, number>,
  teaserTitle: (concernName: string) => string,
): DealTileItem[] {
  const real = deals
    .filter((d) => d.status !== 'draft')
    .map((d) => tileFromDeal(d, counts[d.id] ?? 0));
  const covered = new Set(real.map((t) => t.concernSlug).filter(Boolean));
  const teasers = CONCERNS
    .filter((c) => !covered.has(c.slug))
    .map((c) => teaserFromConcern(c, teaserTitle(c.name)));
  return [...real, ...teasers];
}

export interface CatalogFilters {
  /** Slug koncernu; prázdné = bez omezení. */
  concerns: string[];
  /** Kanonické klíče značek. */
  brands: string[];
  search: string;
  /** Minimální sleva v procentech; 0 = bez omezení. Zapíná ji klik na KPI
      dlaždici „nejvyšší sleva" — dashboard tak není jen ukazatel, ale filtr. */
  minDiscount: number;
}

export const EMPTY_FILTERS: CatalogFilters = { concerns: [], brands: [], search: '', minDiscount: 0 };

export function filtersActive(f: CatalogFilters): number {
  return f.concerns.length + f.brands.length + (f.search.trim() ? 1 : 0) + (f.minDiscount ? 1 : 0);
}

export function applyFilters(items: DealTileItem[], f: CatalogFilters): DealTileItem[] {
  const q = f.search.trim().toLowerCase();
  return items.filter((t) => {
    if (f.concerns.length && (!t.concernSlug || !f.concerns.includes(t.concernSlug))) return false;
    if (f.brands.length && !t.brandKeys.some((k) => f.brands.includes(k))) return false;
    if (f.minDiscount && t.maxDiscount < f.minDiscount) return false;
    if (q) {
      const hay = `${t.title} ${t.supplier} ${t.concernName ?? ''} ${t.brands.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Řady katalogu — pořadí odpovídá tomu, co má obchodně největší tah. */
export interface CatalogRow {
  id: string;
  /** Klíč do i18n `catalog.rows`, nebo přímo název koncernu. */
  title: string;
  items: DealTileItem[];
}

const byDeadline = (a: DealTileItem, b: DealTileItem) =>
  new Date(a.deadline ?? 0).getTime() - new Date(b.deadline ?? 0).getTime();

export function buildRows(
  items: DealTileItem[],
  labels: {
    endingSoon: string; fresh: string; watches: string; jewelry: string;
    upcoming: string; closed: string; byConcern: (name: string) => string;
  },
): CatalogRow[] {
  const live = items.filter((t) => t.kind === 'live');
  const upcoming = items.filter((t) => t.kind === 'upcoming' || t.kind === 'teaser');
  const closed = items.filter((t) => t.kind === 'closed');

  const rows: CatalogRow[] = [];
  if (live.length) {
    rows.push({ id: 'ending-soon', title: labels.endingSoon, items: [...live].sort(byDeadline) });
    if (live.length > 3) {
      rows.push({
        id: 'fresh',
        title: labels.fresh,
        items: [...live].sort((a, b) => new Date(b.startsAt ?? 0).getTime() - new Date(a.startsAt ?? 0).getTime()),
      });
    }
  }
  if (upcoming.length) rows.push({ id: 'upcoming', title: labels.upcoming, items: upcoming });

  // Kategorie mají smysl jen tam, kde je co ukázat (jinak by řada byla prázdná).
  const watches = items.filter((t) => t.category === 'watches' && t.kind !== 'teaser');
  const jewelry = items.filter((t) => t.category === 'jewelry' && t.kind !== 'teaser');
  if (watches.length >= 2) rows.push({ id: 'watches', title: labels.watches, items: watches });
  if (jewelry.length >= 2) rows.push({ id: 'jewelry', title: labels.jewelry, items: jewelry });

  // Řada za každý koncern, který má aspoň dvě dlaždice — jako „kuchyně" u Woltu.
  for (const c of CONCERNS) {
    const own = items.filter((t) => t.concernSlug === c.slug);
    if (own.length >= 2) rows.push({ id: `concern-${c.slug}`, title: labels.byConcern(c.name), items: own });
  }

  if (closed.length) rows.push({ id: 'closed', title: labels.closed, items: closed });
  return rows;
}
