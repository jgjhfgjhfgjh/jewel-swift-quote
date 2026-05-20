/**
 * Maps a parsed Fossil-Group offer workbook into structured deal products.
 *
 * The supplier ships two layouts (watches / jewelry) with slightly different
 * columns, so columns are detected by header text rather than fixed indices.
 */
import type { CellValue, ParsedXlsx, XlsxImage } from './xlsxReader';
import type { DealCategory } from './deals';

export interface ParsedDealProduct {
  brand: string;
  sku: string;
  ean: string;
  gender: string;
  collection: string;
  item_status: string;
  attr_movement: string;
  attr_material: string;
  attr_size: string;
  retail_price: number;
  wholesale_tier1: number;
  wholesale_tier2: number;
  wholesale_tier3: number;
  available: number;
  sort_order: number;
  /** Embedded image extracted from the workbook (uploaded later). */
  image?: XlsxImage;
  /** CDN URL pulled from the image's descr — used only if no embedded image. */
  cdnUrl?: string;
}

export interface DealParseResult {
  products: ParsedDealProduct[];
  brands: string[];
  category: DealCategory;
  imagesFound: number;
  imagesMatched: number;
  warnings: string[];
}

const str = (c: CellValue): string => (c == null ? '' : String(c).trim());
const num = (c: CellValue): number => {
  if (c == null || c === '') return 0;
  const n = typeof c === 'number' ? c : Number(String(c).replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

/** Normalise inconsistent supplier brand spellings ("FOSSIL", "Diesel Jewelry"
 *  vs "DIESEL JEWELRY") into a single Title Case form so filters stay clean. */
function normalizeBrand(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

/** Pull the SKU out of a Fossil scene7 descr URL ("…/SKU_main?…"). */
function skuFromDescr(descr: string): string {
  const m = /\/([A-Za-z0-9]+)_main\b/.exec(descr);
  return m ? m[1].toUpperCase() : '';
}

/** Normalise the descr URL into a high-resolution https image URL.
 *  The supplier embeds 100×100 thumbnail URLs; we override the size so
 *  the catalog cards and the zoom gallery get a usable resolution. */
function cdnUrlFromDescr(descr: string): string {
  if (!descr || !/^https?:\/\//i.test(descr)) return '';
  const clean = descr.replace(/&amp;/g, '&').replace(/^http:/i, 'https:');
  // Drop any existing wid=/hei= query params and append big ones.
  const base = clean.replace(/[?&](wid|hei)=\d+/gi, '');
  const join = base.includes('?') ? '&' : '?';
  return `${base}${join}wid=1200&hei=1200&fit=constrain`;
}

export function parseDealWorkbook(parsed: ParsedXlsx): DealParseResult {
  const { rows, images } = parsed;
  const warnings: string[] = [];

  // ── locate the header row ───────────────────────────────
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 12); i++) {
    const cells = rows[i].map((c) => str(c).toLowerCase());
    if (cells.includes('brand') && cells.includes('sku')) { headerIdx = i; break; }
  }
  if (headerIdx < 0) {
    throw new Error('V tabulce nebyl nalezen řádek s hlavičkou (Brand / SKU).');
  }
  const header = rows[headerIdx].map((c) => str(c).toLowerCase());

  const find = (pred: (h: string) => boolean): number => header.findIndex(pred);
  const exact = (label: string) => find((h) => h === label);
  const incl = (...needles: string[]) =>
    find((h) => needles.every((n) => h.includes(n)));

  const col = {
    brand: exact('brand'),
    sku: exact('sku'),
    ean: exact('ean'),
    gender: exact('gender'),
    collection: exact('platform'),
    status: exact('status'),
    movement: find((h) => h.includes('movement') || h.includes('silhouette')),
    material: find((h) => h.includes('material')),
    size: find((h) => h.includes('case size') || h === 'size'),
    retail: incl('retail price'),
    w50: incl('wholesale', '50'),
    w100: incl('wholesale', '100'),
    w200: incl('wholesale', '200'),
    available: exact('available'),
  };

  if (col.brand < 0 || col.sku < 0) {
    throw new Error('Hlavička neobsahuje povinné sloupce Brand a SKU.');
  }
  if (col.retail < 0) warnings.push('Sloupec "Retail Price" nenalezen — RRP bude 0.');
  if (col.w50 < 0 || col.w100 < 0 || col.w200 < 0) {
    warnings.push('Některý ze sloupců velkoobchodní ceny (50/100/200 ks) chybí.');
  }

  const category: DealCategory =
    col.movement >= 0 && header[col.movement]?.includes('movement')
      ? 'watches'
      : col.movement >= 0 && header[col.movement]?.includes('silhouette')
        ? 'jewelry'
        : 'general';

  // ── images: index by anchored row and by SKU ────────────
  const imageByRow = new Map<number, XlsxImage>();
  const imageBySku = new Map<string, XlsxImage>();
  for (const img of images) {
    if (!imageByRow.has(img.row)) imageByRow.set(img.row, img);
    const s = skuFromDescr(img.descr);
    if (s && !imageBySku.has(s)) imageBySku.set(s, img);
  }

  // ── data rows ───────────────────────────────────────────
  const products: ParsedDealProduct[] = [];
  let imagesMatched = 0;

  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    const rawBrand = str(row[col.brand]);
    const sku = str(row[col.sku]);
    if (!rawBrand && !sku) continue; // skip blank / separator rows
    const brand = normalizeBrand(rawBrand);

    const img = imageByRow.get(r) || (sku ? imageBySku.get(sku.toUpperCase()) : undefined);
    if (img) imagesMatched++;
    const descr = img?.descr || '';

    products.push({
      brand,
      sku,
      ean: str(row[col.ean]),
      gender: str(row[col.gender]),
      collection: str(row[col.collection]),
      item_status: str(row[col.status]),
      attr_movement: col.movement >= 0 ? str(row[col.movement]) : '',
      attr_material: col.material >= 0 ? str(row[col.material]) : '',
      attr_size: col.size >= 0 ? str(row[col.size]) : '',
      retail_price: col.retail >= 0 ? num(row[col.retail]) : 0,
      wholesale_tier1: col.w50 >= 0 ? num(row[col.w50]) : 0,
      wholesale_tier2: col.w100 >= 0 ? num(row[col.w100]) : 0,
      wholesale_tier3: col.w200 >= 0 ? num(row[col.w200]) : 0,
      available: col.available >= 0 ? Math.round(num(row[col.available])) : 0,
      sort_order: products.length,
      image: img,
      cdnUrl: cdnUrlFromDescr(descr),
    });
  }

  if (!products.length) {
    throw new Error('V tabulce nebyly nalezeny žádné produkty.');
  }

  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort();

  return {
    products,
    brands,
    category,
    imagesFound: images.length,
    imagesMatched,
    warnings,
  };
}
