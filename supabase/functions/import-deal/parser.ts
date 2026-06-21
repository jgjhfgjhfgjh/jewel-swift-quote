/**
 * Dependency-free .xlsx → deal-products parser for the Edge runtime.
 *
 * Server-side twin of src/lib/xlsxReader.ts + src/lib/dealParser.ts. It uses
 * only Web APIs (DecompressionStream, TextDecoder) that exist in Deno, and
 * skips embedded-image binary extraction — automated imports reference the
 * supplier CDN URL carried in each image's `descr` attribute instead.
 */

// ── ZIP reader ──────────────────────────────────────────────
interface ZipEntry {
  name: string;
  method: number;
  compressedSize: number;
  localHeaderOffset: number;
}

class ZipArchive {
  private view: DataView;
  private bytes: Uint8Array;
  private entries = new Map<string, ZipEntry>();

  constructor(buffer: ArrayBuffer) {
    this.bytes = new Uint8Array(buffer);
    this.view = new DataView(buffer);
    this.readCentralDirectory();
  }

  private readCentralDirectory() {
    const len = this.bytes.length;
    let eocd = -1;
    for (let i = len - 22; i >= 0 && i >= len - 22 - 65536; i--) {
      if (this.view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('Neplatný .xlsx soubor (ZIP nenalezen).');
    const cdOffset = this.view.getUint32(eocd + 16, true);
    const cdCount = this.view.getUint16(eocd + 10, true);
    let p = cdOffset;
    for (let i = 0; i < cdCount; i++) {
      if (this.view.getUint32(p, true) !== 0x02014b50) break;
      const method = this.view.getUint16(p + 10, true);
      const compressedSize = this.view.getUint32(p + 20, true);
      const nameLen = this.view.getUint16(p + 28, true);
      const extraLen = this.view.getUint16(p + 30, true);
      const commentLen = this.view.getUint16(p + 32, true);
      const localHeaderOffset = this.view.getUint32(p + 42, true);
      const name = new TextDecoder('utf-8').decode(this.bytes.subarray(p + 46, p + 46 + nameLen));
      this.entries.set(name, { name, method, compressedSize, localHeaderOffset });
      p += 46 + nameLen + extraLen + commentLen;
    }
  }

  has(name: string): boolean { return this.entries.has(name); }
  list(prefix: string): string[] {
    return [...this.entries.keys()].filter((n) => n.startsWith(prefix));
  }

  private rawData(entry: ZipEntry): Uint8Array {
    const o = entry.localHeaderOffset;
    if (this.view.getUint32(o, true) !== 0x04034b50) {
      throw new Error('Poškozená ZIP položka: ' + entry.name);
    }
    const nameLen = this.view.getUint16(o + 26, true);
    const extraLen = this.view.getUint16(o + 28, true);
    const dataStart = o + 30 + nameLen + extraLen;
    return this.bytes.subarray(dataStart, dataStart + entry.compressedSize);
  }

  async getText(name: string): Promise<string | null> {
    const entry = this.entries.get(name);
    if (!entry) return null;
    const raw = this.rawData(entry);
    if (entry.method === 0) return new TextDecoder('utf-8').decode(raw);
    if (entry.method === 8) {
      const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      const buf = await new Response(stream).arrayBuffer();
      return new TextDecoder('utf-8').decode(buf);
    }
    throw new Error('Nepodporovaná komprese v ZIP (' + entry.method + ').');
  }

  async getBytes(name: string): Promise<Uint8Array | null> {
    const entry = this.entries.get(name);
    if (!entry) return null;
    const raw = this.rawData(entry);
    if (entry.method === 0) return raw;
    if (entry.method === 8) {
      const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    }
    throw new Error('Nepodporovaná komprese v ZIP (' + entry.method + ').');
  }
}

// ── XML helpers ─────────────────────────────────────────────
function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&');
}

function columnToIndex(ref: string): number {
  const letters = ref.replace(/[0-9]/g, '');
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

type CellValue = string | number | null;

function parseSharedStrings(xml: string | null): string[] {
  if (!xml) return [];
  const out: string[] = [];
  const siRe = /<(?:\w+:)?si\b[^>]*>([\s\S]*?)<\/(?:\w+:)?si>/g;
  let m: RegExpExecArray | null;
  while ((m = siRe.exec(xml))) {
    const parts = [...m[1].matchAll(/<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/g)].map((x) => x[1]);
    out.push(decodeEntities(parts.join('')));
  }
  return out;
}

function parseWorksheet(xml: string, shared: string[]): CellValue[][] {
  const rows: CellValue[][] = [];
  const rowRe = /<(?:\w+:)?row[^>]*?\sr="(\d+)"[^>]*>([\s\S]*?)<\/(?:\w+:)?row>/g;
  let rm: RegExpExecArray | null;
  while ((rm = rowRe.exec(xml))) {
    const rowIdx = parseInt(rm[1], 10) - 1;
    const cells: CellValue[] = [];
    const cellRe = /<(?:\w+:)?c\s+r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:\w+:)?c>)/g;
    let cm: RegExpExecArray | null;
    while ((cm = cellRe.exec(rm[2]))) {
      const colIdx = columnToIndex(cm[1]);
      const attrs = cm[2] || '';
      const inner = cm[3] || '';
      const typeMatch = /\st="([^"]+)"/.exec(attrs);
      const type = typeMatch ? typeMatch[1] : '';
      const vRe = /<(?:\w+:)?v>([\s\S]*?)<\/(?:\w+:)?v>/;
      let value: CellValue = null;
      if (type === 's') {
        const v = vRe.exec(inner);
        value = v ? (shared[parseInt(v[1], 10)] ?? '') : null;
      } else if (type === 'inlineStr') {
        const parts = [...inner.matchAll(/<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/g)].map((x) => x[1]);
        value = decodeEntities(parts.join(''));
      } else if (type === 'str') {
        const v = vRe.exec(inner);
        value = v ? decodeEntities(v[1]) : null;
      } else {
        const v = vRe.exec(inner);
        if (v) {
          const num = Number(v[1]);
          value = Number.isFinite(num) ? num : decodeEntities(v[1]);
        }
      }
      cells[colIdx] = value;
    }
    rows[rowIdx] = cells;
  }
  for (let i = 0; i < rows.length; i++) if (!rows[i]) rows[i] = [];
  return rows;
}

export interface EmbeddedImage { bytes: Uint8Array; ext: string }
interface DrawingImage { row: number; sku: string; descr: string; embedded: EmbeddedImage | null }

/** Resolve a drawing-relative media target ("../media/image1.jpeg") to a zip path. */
function resolveMediaPath(target: string): string {
  // Targets may be relative ("../media/image1.jpeg") or absolute ("/xl/media/image.jpg").
  const path = target.replace(/^\/+/, '').replace(/^(\.\.\/)+/, '');
  return path.startsWith('xl/') ? path : 'xl/' + path;
}

async function parseDrawings(zip: ZipArchive): Promise<DrawingImage[]> {
  const out: DrawingImage[] = [];
  for (const file of zip.list('xl/drawings/').filter((n) => /drawing\d+\.xml$/.test(n))) {
    const xml = await zip.getText(file);
    if (!xml) continue;
    // rId → media path, from this drawing's relationships file.
    const relsName = file.replace(/(drawing\d+\.xml)$/, '_rels/$1.rels');
    const relsXml = await zip.getText(relsName);
    const relMap = new Map<string, string>();
    if (relsXml) {
      // Attribute order varies by exporter (Id before or after Target) — parse each separately.
      for (const rel of relsXml.matchAll(/<Relationship\b[^>]*?\/?>/g)) {
        const id = /\bId="([^"]+)"/.exec(rel[0]);
        const target = /\bTarget="([^"]+)"/.exec(rel[0]);
        if (id && target) relMap.set(id[1], target[1]);
      }
    }
    for (const anchor of xml.matchAll(/<xdr:(twoCellAnchor|oneCellAnchor)\b[\s\S]*?<\/xdr:\1>/g)) {
      const block = anchor[0];
      const rowMatch = /<xdr:from>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>/.exec(block);
      if (!rowMatch) continue;
      const descrMatch = /<xdr:cNvPr\b[^>]*\sdescr="([^"]*)"/.exec(block);
      const nameMatch = /<xdr:cNvPr\b[^>]*\sname="([^"]*)"/.exec(block);
      const descr = descrMatch ? decodeEntities(descrMatch[1]) : '';
      const sku = nameMatch ? decodeEntities(nameMatch[1]).trim() : '';

      // Only extract the embedded binary when there is no CDN URL to use instead.
      let embedded: EmbeddedImage | null = null;
      if (!/^https?:\/\//i.test(descr)) {
        const embedMatch = /<a:blip\b[^>]*\sr:embed="([^"]+)"/.exec(block);
        const target = embedMatch ? relMap.get(embedMatch[1]) : undefined;
        if (target) {
          const bytes = await zip.getBytes(resolveMediaPath(target));
          if (bytes && bytes.length) {
            embedded = { bytes, ext: (target.split('.').pop() || 'jpg').toLowerCase() };
          }
        }
      }
      out.push({ row: parseInt(rowMatch[1], 10), sku, descr, embedded });
    }
  }
  return out;
}

// ── deal mapping ────────────────────────────────────────────
export type DealCategory = 'watches' | 'jewelry' | 'general';

export interface ParsedDealProduct {
  brand: string; sku: string; ean: string; gender: string;
  collection: string; item_status: string;
  attr_movement: string; attr_material: string; attr_size: string;
  retail_price: number;
  wholesale_tier1: number; wholesale_tier2: number; wholesale_tier3: number;
  available: number; sort_order: number;
  image_url: string;
}

export interface DealParseResult {
  products: ParsedDealProduct[];
  /** Embedded image per product (same index as `products`), or null when the
   *  product already has a CDN `image_url`. The caller uploads these to storage. */
  productImages: (EmbeddedImage | null)[];
  brands: string[];
  category: DealCategory;
  /** Detected from the workbook; overridable by the caller via meta.currency. */
  currency: string;
  imagesMatched: number;
  warnings: string[];
}

const str = (c: CellValue): string => (c == null ? '' : String(c).trim());
const num = (c: CellValue): number => {
  if (c == null || c === '') return 0;
  const n = typeof c === 'number' ? c : Number(String(c).replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
// Strip diacritics so Czech headers (Výrobce, Kód, Materiál…) match the same
// way English ones do — header matching is accent- and case-insensitive.
const deburr = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

function normalizeBrand(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}
function skuFromDescr(descr: string): string {
  const m = /\/([A-Za-z0-9]+)_main\b/.exec(descr);
  return m ? m[1].toUpperCase() : '';
}
function cdnUrlFromDescr(descr: string): string {
  if (!descr || !/^https?:\/\//i.test(descr)) return '';
  const clean = descr.replace(/&amp;/g, '&').replace(/^http:/i, 'https:');
  const base = clean.replace(/[?&](wid|hei)=\d+/gi, '');
  const join = base.includes('?') ? '&' : '?';
  return `${base}${join}wid=1200&hei=1200&fit=constrain`;
}

/** Parse an .xlsx workbook buffer into structured deal products. */
export async function parseDealXlsx(buffer: ArrayBuffer): Promise<DealParseResult> {
  const zip = new ZipArchive(buffer);

  // Sheet display name — used as the brand for single-brand offers that have no
  // Brand column (e.g. a "Versace" sheet).
  const wbXml = await zip.getText('xl/workbook.xml');
  const sheetNameMatch = wbXml ? /<(?:\w+:)?sheet\b[^>]*\bname="([^"]*)"/.exec(wbXml) : null;
  const sheetName = sheetNameMatch ? decodeEntities(sheetNameMatch[1]).trim() : '';

  let sheetPath = 'xl/worksheets/sheet1.xml';
  if (!zip.has(sheetPath)) {
    const sheets = zip.list('xl/worksheets/').filter((n) => /sheet\d+\.xml$/.test(n)).sort();
    if (!sheets.length) throw new Error('Sešit neobsahuje žádný list.');
    sheetPath = sheets[0];
  }
  const sheetXml = await zip.getText(sheetPath);
  if (!sheetXml) throw new Error('List sešitu se nepodařilo načíst.');
  const shared = parseSharedStrings(await zip.getText('xl/sharedStrings.xml'));
  const rows = parseWorksheet(sheetXml, shared);
  const images = await parseDrawings(zip);

  const warnings: string[] = [];
  // Header row detection — supports both the English Zago/Fossil closeout
  // template (Brand / SKU …) and the Czech ERP catalog export (Výrobce / Kód …).
  const normRow = (r: CellValue[]) => r.map((c) => deburr(str(c).toLowerCase()));
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 12); i++) {
    const cells = normRow(rows[i]);
    const en = cells.includes('brand') && cells.includes('sku');
    const cz = cells.includes('vyrobce') && cells.includes('kod');
    const ref = cells.includes('reference') && cells.includes('ean');
    if (en || cz || ref) { headerIdx = i; break; }
  }
  if (headerIdx < 0) {
    throw new Error('V tabulce nebyl nalezen řádek s hlavičkou (Brand/SKU, Výrobce/Kód nebo Reference/EAN).');
  }
  const header = normRow(rows[headerIdx]);

  const find = (pred: (h: string) => boolean) => header.findIndex(pred);

  // Each column accepts the English label and its Czech catalog-export alias.
  const col = {
    brand: find((h) => h === 'brand' || h === 'vyrobce'),
    sku: find((h) => h === 'sku' || h === 'kod' || h === 'reference'),
    ean: find((h) => h === 'ean' || h.startsWith('ean')),
    gender: find((h) => h === 'gender' || h.includes('urceni')),
    collection: find((h) => h === 'platform' || h.includes('modelova rada') || h === 'description'),
    status: find((h) => h === 'status'),
    movement: find((h) => h.includes('movement') || h.includes('silhouette') || h.includes('strojku')),
    material: find((h) => h.includes('material')),
    size: find((h) =>
      h.includes('case size') || h === 'size' || h.includes('prumer cifernik') || h.includes('velikost cifernik')),
    retail: find((h) => h.includes('retail price') || h.includes('prodejni')),
    w50: find((h) => (h.includes('wholesale') || h.includes('velkoobchodni')) && h.includes('50')),
    w100: find((h) => (h.includes('wholesale') || h.includes('velkoobchodni')) && h.includes('100')),
    w200: find((h) => (h.includes('wholesale') || h.includes('velkoobchodni')) && h.includes('200')),
    available: find((h) => h === 'available' || h.includes('stav zasob')),
  };
  if (col.sku < 0) throw new Error('Hlavička neobsahuje sloupec SKU / Kód / Reference.');
  // Single-brand offers (e.g. a Versace-only sheet) have no Brand column — fall
  // back to the sheet's name. Only the SKU/Reference column is truly required.
  const fallbackBrand = col.brand < 0 ? sheetName : '';
  // A single "Wholesale Price" column (no qty tiers) applies to all three tiers.
  if (col.w50 < 0 && col.w100 < 0 && col.w200 < 0) {
    const wSingle = find((h) => (h.includes('wholesale') || h.includes('velkoobchodni')) && !/[0-9]/.test(h));
    if (wSingle >= 0) { col.w50 = wSingle; col.w100 = wSingle; col.w200 = wSingle; }
  }
  if (col.retail < 0) warnings.push('Sloupec s prodejní cenou (Retail / Prodejní) nenalezen — RRP bude 0.');
  if (col.w50 < 0 || col.w100 < 0 || col.w200 < 0) {
    warnings.push('Některý ze sloupců velkoobchodní ceny (50/100/200 ks) chybí.');
  }

  const movementHeader = col.movement >= 0 ? header[col.movement] : '';
  const headerText = header.join(' ');
  const category: DealCategory =
    movementHeader.includes('movement') || movementHeader.includes('strojku')
      || headerText.includes('cifernik') || headerText.includes('case size')
      ? 'watches'
    : movementHeader.includes('silhouette') ? 'jewelry'
    : 'general';

  // EU business defaults to EUR; only an explicit "(USD)" marker (e.g. Fossil
  // "Retail Price (USD)") switches to USD. Caller can override via meta.currency.
  const currency = headerText.includes('usd') ? 'USD' : 'EUR';

  // CDN-URL images (English template) keyed by row and by SKU…
  const imageByRow = new Map<number, string>();
  const imageBySku = new Map<string, string>();
  // …and embedded binary images (Czech export) keyed the same way.
  const embeddedByRow = new Map<number, EmbeddedImage>();
  const embeddedBySku = new Map<string, EmbeddedImage>();
  for (const img of images) {
    const url = cdnUrlFromDescr(img.descr);
    if (url) {
      if (!imageByRow.has(img.row)) imageByRow.set(img.row, url);
      const s = skuFromDescr(img.descr);
      if (s && !imageBySku.has(s)) imageBySku.set(s, url);
    }
    if (img.embedded) {
      if (!embeddedByRow.has(img.row)) embeddedByRow.set(img.row, img.embedded);
      const su = img.sku.toUpperCase();
      if (su && !embeddedBySku.has(su)) embeddedBySku.set(su, img.embedded);
    }
  }

  const products: ParsedDealProduct[] = [];
  const productImages: (EmbeddedImage | null)[] = [];
  let imagesMatched = 0;
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    const rawBrand = str(row[col.brand]);
    const sku = str(row[col.sku]);
    if (!rawBrand && !sku) continue;
    const url = imageByRow.get(r) || (sku ? imageBySku.get(sku.toUpperCase()) : '') || '';
    const embedded = url ? null : (embeddedByRow.get(r) || (sku ? embeddedBySku.get(sku.toUpperCase()) : undefined) || null);
    if (url || embedded) imagesMatched++;
    productImages.push(embedded);
    products.push({
      brand: normalizeBrand(rawBrand || fallbackBrand),
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
      image_url: url,
    });
  }
  if (!products.length) throw new Error('V tabulce nebyly nalezeny žádné produkty.');

  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort();
  return { products, productImages, brands, category, currency, imagesMatched, warnings };
}
