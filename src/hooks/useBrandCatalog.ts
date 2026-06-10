import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toBrandKey, toDisplayName } from '@/lib/brandNormalize';
import { getBrandByName } from '@/data/brands';
import { getCategorySegment } from '@/lib/brandSegment';

/**
 * Central, feed-bound source of truth for every brand surface (brand list,
 * landing pages, carousels, logo shelf, koncern pages).
 *
 * Primary source is the live `produkty` table via the `get_brand_catalog`
 * RPC — after each feed sync new brands appear here automatically, so every
 * component built on this hook stays in lockstep with the catalog. The static
 * `public/products.json` snapshot is only an offline fallback.
 */

export interface BrandPreviewProduct {
  id: string;
  name: string;
  img: string;
  price: number;
  wholesale: number;
  inStock: boolean;
  category: string | null;
}

export interface BrandCatalogEntry {
  /** Canonical UPPERCASE brand key (see toBrandKey) */
  key: string;
  /** Display label, e.g. "Calvin Klein" */
  name: string;
  /** URL slug for /brands/:slug */
  slug: string;
  /** Brandfetch domain for the logo (undefined → text fallback) */
  domain?: string;
  count: number;
  watches: number;
  jewelry: number;
  inStockCount: number;
  maxDiscount: number;
  categories: string[];
  /** Raw manufacturer strings from the feed folded into this brand */
  rawManufacturers: string[];
  /** Up to 10 preview products — in-stock first, then by discount */
  products: BrandPreviewProduct[];
}

export const brandKeyToSlug = (key: string) => key.toLowerCase().replace(/\s+/g, '-');
export const brandSlugToKey = (slug: string) => slug.toUpperCase().replace(/-/g, ' ');

/* Row shape returned by the get_brand_catalog RPC */
interface BrandCatalogRow {
  manufacturer: string;
  total: number;
  watches: number;
  jewelry: number;
  in_stock: number;
  max_discount: number;
  categories: string[] | null;
  top_products: BrandPreviewProduct[] | null;
}

interface Accumulator {
  count: number;
  watches: number;
  jewelry: number;
  inStockCount: number;
  maxDiscount: number;
  categories: Set<string>;
  rawManufacturers: string[];
  products: BrandPreviewProduct[];
}

function newAccumulator(): Accumulator {
  return {
    count: 0, watches: 0, jewelry: 0, inStockCount: 0, maxDiscount: 0,
    categories: new Set(), rawManufacturers: [], products: [],
  };
}

function toEntries(map: Map<string, Accumulator>): BrandCatalogEntry[] {
  return Array.from(map.entries())
    .map(([key, a]) => {
      const name = toDisplayName(key);
      return {
        key,
        name,
        slug: brandKeyToSlug(key),
        domain: getBrandByName(name)?.domain,
        count: a.count,
        watches: a.watches,
        jewelry: a.jewelry,
        inStockCount: a.inStockCount,
        maxDiscount: a.maxDiscount,
        categories: Array.from(a.categories),
        rawManufacturers: a.rawManufacturers,
        products: a.products
          .sort((x, y) => {
            if (x.inStock !== y.inStock) return x.inStock ? -1 : 1;
            const dx = x.price > 0 ? 1 - x.wholesale / x.price : 0;
            const dy = y.price > 0 ? 1 - y.wholesale / y.price : 0;
            return dy - dx;
          })
          .slice(0, 10),
      };
    })
    .sort((a, b) => b.count - a.count);
}

function foldRows(rows: BrandCatalogRow[]): BrandCatalogEntry[] {
  const map = new Map<string, Accumulator>();
  for (const row of rows) {
    const raw = row.manufacturer?.trim();
    if (!raw) continue;
    const key = toBrandKey(raw);
    if (!map.has(key)) map.set(key, newAccumulator());
    const a = map.get(key)!;
    a.count += Number(row.total) || 0;
    a.watches += Number(row.watches) || 0;
    a.jewelry += Number(row.jewelry) || 0;
    a.inStockCount += Number(row.in_stock) || 0;
    a.maxDiscount = Math.max(a.maxDiscount, Number(row.max_discount) || 0);
    for (const c of row.categories ?? []) a.categories.add(c);
    a.rawManufacturers.push(raw);
    a.products.push(...(row.top_products ?? []));
  }
  return toEntries(map);
}

/* Item shape of the public/products.json snapshot (offline fallback) */
interface SnapshotProduct {
  id: string;
  name: string;
  manufacturer: string;
  img: string;
  price: number;
  wholesale: number;
  inStock: boolean;
  category: string;
}

function foldSnapshot(products: SnapshotProduct[]): BrandCatalogEntry[] {
  const map = new Map<string, Accumulator>();
  for (const p of products) {
    if (!p.manufacturer) continue;
    const raw = p.manufacturer.trim();
    const key = toBrandKey(raw);
    if (!map.has(key)) map.set(key, newAccumulator());
    const a = map.get(key)!;
    a.count++;
    const seg = getCategorySegment(p.category);
    if (seg === 'watches') a.watches++;
    else if (seg === 'jewelry') a.jewelry++;
    if (p.inStock) a.inStockCount++;
    const d = p.price > 0 ? Math.round((1 - p.wholesale / p.price) * 100) : 0;
    if (d > a.maxDiscount) a.maxDiscount = d;
    if (p.category) a.categories.add(p.category);
    if (!a.rawManufacturers.includes(raw)) a.rawManufacturers.push(raw);
    if (p.img && a.products.length < 40) {
      a.products.push({
        id: p.id, name: p.name, img: p.img, price: p.price,
        wholesale: p.wholesale, inStock: p.inStock, category: p.category,
      });
    }
  }
  return toEntries(map);
}

async function fetchBrandCatalog(): Promise<BrandCatalogEntry[]> {
  try {
    // get_brand_catalog není v auto-generovaných DB typech (types.ts)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('get_brand_catalog');
    if (!error && Array.isArray(data) && data.length > 0) {
      return foldRows(data as BrandCatalogRow[]);
    }
  } catch {
    /* fall through to snapshot */
  }
  const res = await fetch('/products.json');
  const products: SnapshotProduct[] = await res.json();
  return foldSnapshot(products);
}

export function useBrandCatalog() {
  return useQuery({
    queryKey: ['brand-catalog'],
    queryFn: fetchBrandCatalog,
    staleTime: 5 * 60 * 1000,
  });
}
