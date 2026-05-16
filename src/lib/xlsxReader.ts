/**
 * Minimal, dependency-free .xlsx reader for the browser.
 *
 * An .xlsx file is a ZIP archive of XML parts. We:
 *  1. read the ZIP central directory,
 *  2. inflate the parts we need with the native DecompressionStream API,
 *  3. parse the worksheet cells and the embedded drawing images.
 *
 * Only what the deal importer needs is implemented — no formulas, styles, dates.
 */

interface ZipEntry {
  name: string;
  method: number; // 0 = stored, 8 = deflate
  compressedSize: number;
  uncompressedSize: number;
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
    // End Of Central Directory record — scan backwards for signature 0x06054b50.
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
      const uncompressedSize = this.view.getUint32(p + 24, true);
      const nameLen = this.view.getUint16(p + 28, true);
      const extraLen = this.view.getUint16(p + 30, true);
      const commentLen = this.view.getUint16(p + 32, true);
      const localHeaderOffset = this.view.getUint32(p + 42, true);
      const name = new TextDecoder('utf-8').decode(
        this.bytes.subarray(p + 46, p + 46 + nameLen),
      );
      this.entries.set(name, { name, method, compressedSize, uncompressedSize, localHeaderOffset });
      p += 46 + nameLen + extraLen + commentLen;
    }
  }

  has(name: string): boolean {
    return this.entries.has(name);
  }

  list(prefix: string): string[] {
    return [...this.entries.keys()].filter((n) => n.startsWith(prefix));
  }

  private rawData(entry: ZipEntry): Uint8Array {
    // Local file header has its own (possibly different) extra-field length.
    const o = entry.localHeaderOffset;
    if (this.view.getUint32(o, true) !== 0x04034b50) {
      throw new Error('Poškozená ZIP položka: ' + entry.name);
    }
    const nameLen = this.view.getUint16(o + 26, true);
    const extraLen = this.view.getUint16(o + 28, true);
    const dataStart = o + 30 + nameLen + extraLen;
    return this.bytes.subarray(dataStart, dataStart + entry.compressedSize);
  }

  async getBytes(name: string): Promise<Uint8Array | null> {
    const entry = this.entries.get(name);
    if (!entry) return null;
    const raw = this.rawData(entry);
    if (entry.method === 0) return raw;
    if (entry.method === 8) {
      const stream = new Blob([raw]).stream().pipeThrough(
        new DecompressionStream('deflate-raw'),
      );
      const buf = await new Response(stream).arrayBuffer();
      return new Uint8Array(buf);
    }
    throw new Error('Nepodporovaná komprese v ZIP (' + entry.method + ').');
  }

  async getText(name: string): Promise<string | null> {
    const bytes = await this.getBytes(name);
    return bytes ? new TextDecoder('utf-8').decode(bytes) : null;
  }

  async getBlob(name: string, mime: string): Promise<Blob | null> {
    const bytes = await this.getBytes(name);
    if (!bytes) return null;
    return new Blob([bytes], { type: mime });
  }
}

// ── XML helpers ─────────────────────────────────────────────
function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
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

// ── shared strings ──────────────────────────────────────────
function parseSharedStrings(xml: string | null): string[] {
  if (!xml) return [];
  const out: string[] = [];
  const siRe = /<si>([\s\S]*?)<\/si>/g;
  let m: RegExpExecArray | null;
  while ((m = siRe.exec(xml))) {
    const parts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]);
    out.push(decodeEntities(parts.join('')));
  }
  return out;
}

export type CellValue = string | number | null;

// ── worksheet ───────────────────────────────────────────────
function parseWorksheet(xml: string, shared: string[]): CellValue[][] {
  const rows: CellValue[][] = [];
  const rowRe = /<row[^>]*?\sr="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  let rm: RegExpExecArray | null;
  while ((rm = rowRe.exec(xml))) {
    const rowIdx = parseInt(rm[1], 10) - 1;
    const cells: CellValue[] = [];
    const cellRe = /<c\s+r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
    let cm: RegExpExecArray | null;
    while ((cm = cellRe.exec(rm[2]))) {
      const colIdx = columnToIndex(cm[1]);
      const attrs = cm[2] || '';
      const inner = cm[3] || '';
      const typeMatch = /\st="([^"]+)"/.exec(attrs);
      const type = typeMatch ? typeMatch[1] : '';
      let value: CellValue = null;
      if (type === 's') {
        const v = /<v>([\s\S]*?)<\/v>/.exec(inner);
        value = v ? (shared[parseInt(v[1], 10)] ?? '') : null;
      } else if (type === 'inlineStr') {
        const parts = [...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]);
        value = decodeEntities(parts.join(''));
      } else if (type === 'str') {
        const v = /<v>([\s\S]*?)<\/v>/.exec(inner);
        value = v ? decodeEntities(v[1]) : null;
      } else {
        const v = /<v>([\s\S]*?)<\/v>/.exec(inner);
        if (v) {
          const num = Number(v[1]);
          value = Number.isFinite(num) ? num : decodeEntities(v[1]);
        }
      }
      cells[colIdx] = value;
    }
    rows[rowIdx] = cells;
  }
  // Normalise: fill gaps so callers can index safely.
  for (let i = 0; i < rows.length; i++) if (!rows[i]) rows[i] = [];
  return rows;
}

// ── embedded images (spreadsheet drawings) ──────────────────
export interface XlsxImage {
  /** 0-based worksheet row the image is anchored to. */
  row: number;
  /** The image's `descr` attribute — often a CDN URL containing the SKU. */
  descr: string;
  blob: Blob;
  ext: string;
}

const MIME_BY_EXT: Record<string, string> = {
  jpeg: 'image/jpeg', jpg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp',
};

async function parseDrawingImages(zip: ZipArchive): Promise<XlsxImage[]> {
  const drawingFiles = zip.list('xl/drawings/').filter((n) => /drawing\d+\.xml$/.test(n));
  const images: XlsxImage[] = [];

  for (const drawingFile of drawingFiles) {
    const xml = await zip.getText(drawingFile);
    if (!xml) continue;
    const relsName = drawingFile.replace(/([^/]+)$/, '_rels/$1.rels');
    const relsXml = await zip.getText(relsName);
    const relMap = new Map<string, string>();
    if (relsXml) {
      for (const r of relsXml.matchAll(/<Relationship\b[^>]*>/g)) {
        const id = /Id="([^"]+)"/.exec(r[0])?.[1];
        const target = /Target="([^"]+)"/.exec(r[0])?.[1];
        if (id && target) {
          const resolved = target.startsWith('../')
            ? 'xl/' + target.replace(/^\.\.\//, '')
            : 'xl/drawings/' + target;
          relMap.set(id, resolved.replace(/\\/g, '/'));
        }
      }
    }

    for (const anchor of xml.matchAll(/<xdr:(twoCellAnchor|oneCellAnchor)\b[\s\S]*?<\/xdr:\1>/g)) {
      const block = anchor[0];
      const rowMatch = /<xdr:from>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>/.exec(block);
      const embedMatch = /<a:blip[^>]*r:embed="([^"]+)"/.exec(block);
      const descrMatch = /<xdr:cNvPr\b[^>]*\sdescr="([^"]*)"/.exec(block);
      if (!rowMatch || !embedMatch) continue;
      const mediaPath = relMap.get(embedMatch[1]);
      if (!mediaPath) continue;
      const ext = (mediaPath.split('.').pop() || 'jpeg').toLowerCase();
      const blob = await zip.getBlob(mediaPath, MIME_BY_EXT[ext] || 'image/jpeg');
      if (!blob) continue;
      images.push({
        row: parseInt(rowMatch[1], 10),
        descr: descrMatch ? decodeEntities(descrMatch[1]) : '',
        blob,
        ext: ext === 'jpg' ? 'jpeg' : ext,
      });
    }
  }
  return images;
}

// ── public API ──────────────────────────────────────────────
export interface ParsedXlsx {
  rows: CellValue[][];
  images: XlsxImage[];
}

export async function parseXlsx(file: File | ArrayBuffer): Promise<ParsedXlsx> {
  const buffer = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
  const zip = new ZipArchive(buffer);

  // Locate the first worksheet via the workbook relationships.
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
  const images = await parseDrawingImages(zip);

  return { rows, images };
}
