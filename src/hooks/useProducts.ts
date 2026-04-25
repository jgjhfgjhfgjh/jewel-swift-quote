import { useState, useEffect, useMemo } from 'react';
import type { Product } from '@/lib/types';
import { getProductBrand, getProductFeedCategories, isDropshippingProduct } from '@/lib/product-feed';
import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'produkty-obrazky';

type ImageRow = {
  storage_path: string | null;
  original_url: string | null;
  je_hlavni: boolean;
  stazeno: boolean;
};

type ProduktyRow = {
  id: string;
  sku: string;
  ean: string | null;
  product_name: string | null;
  manufacturer: string | null;
  category_text: string | null;
  long_description: string | null;
  short_description: string | null;
  retail_price: number | null;
  wholesale_price: number | null;
  wholesale_discount: number | null;
  stock: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  produkty_obrazky: ImageRow[];
};

export type AvailableParam = {
  nazev: string;
  values: string[];
};

function resolveImageUrl(img: ImageRow): string | null {
  if (img.stazeno && img.storage_path) {
    return supabase.storage.from(BUCKET).getPublicUrl(img.storage_path).data.publicUrl;
  }
  return img.original_url ?? null;
}

function mapRow(row: ProduktyRow): Product {
  const images = row.produkty_obrazky ?? [];
  const mainImg = images.find((i) => i.je_hlavni) ?? images[0];
  const storedImgUrl = mainImg ? resolveImageUrl(mainImg) : null;
  const storedAllImageUrls = images
    .map(resolveImageUrl)
    .filter((u): u is string => Boolean(u));

  const imgUrl = storedImgUrl ?? row.image_url ?? null;
  const allImageUrls = storedAllImageUrls.length > 0
    ? storedAllImageUrls
    : (row.image_urls ?? []).filter(Boolean);

  return {
    id: row.id,
    name: row.product_name || row.sku,
    manufacturer: row.manufacturer || '',
    sku: row.sku,
    ean: row.ean || '',
    description: row.long_description || '',
    short_description: row.short_description || undefined,
    category: row.category_text || '',
    img: imgUrl || '',
    image_urls: allImageUrls,
    price: Number(row.retail_price ?? 0),
    wholesale: Number(row.wholesale_price ?? 0),
    stock: row.stock ?? 0,
    inStock: (row.stock ?? 0) > 0,
  };
}

const cleanProducts = (data: Product[]) =>
  data.filter((p) => Boolean(getProductBrand(p)) && !isDropshippingProduct(p));

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableParams, setAvailableParams] = useState<AvailableParam[]>([]);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        // Lightweight product query — no embedded params (avoids huge payload)
        const { data, error } = await (supabase as any)
          .from('produkty')
          .select(`
            id, sku, ean, product_name, manufacturer, category_text,
            long_description, short_description, retail_price, wholesale_price,
            wholesale_discount, stock, image_url, image_urls,
            produkty_obrazky (storage_path, original_url, je_hlavni, stazeno)
          `) as { data: ProduktyRow[] | null; error: unknown };

        if (!error && data && data.length > 0) {
          if (!active) return;
          setProducts(cleanProducts(data.map(mapRow)));
        } else {
          // Fallback to static JSON
          const response = await fetch('/products.json');
          const fallbackData = await response.json() as Product[];
          if (!active) return;
          setProducts(cleanProducts(fallbackData));
        }
      } catch {
        if (!active) return;
        setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    // Load param options from server-side RPC (lightweight aggregation)
    const loadParamOptions = async () => {
      try {
        const { data, error } = await (supabase as any).rpc('get_param_options');
        if (error || !data) return;
        const mapped: AvailableParam[] = (data as Array<{ nazev: string; moznosti: string[] }>)
          .map((row) => ({
            nazev: row.nazev,
            values: (row.moznosti ?? []).sort((a: string, b: string) => a.localeCompare(b, 'cs')),
          }))
          .sort((a, b) => a.nazev.localeCompare(b.nazev, 'cs'));
        if (active) setAvailableParams(mapped);
      } catch {
        // Param options are non-critical — silently ignore
      }
    };

    loadProducts();
    loadParamOptions();
    return () => { active = false; };
  }, []);

  const manufacturers = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      const brand = getProductBrand(p);
      if (brand) counts.set(brand, (counts.get(brand) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [products]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      const category = getProductFeedCategories(p)[0] || p.category || '';
      if (!category) return;
      counts.set(category, (counts.get(category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [products]);

  return { products, loading, manufacturers, categories, availableParams };
}
