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

type ParamRow = {
  nazev: string;
  hodnota: string;
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
  produkty_parametry: ParamRow[];
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

  // Fallback to direct URL columns saved by sync script when produkty_obrazky is empty
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
    params: row.produkty_parametry ?? [],
  };
}

const cleanProducts = (data: Product[]) =>
  data.filter((p) => Boolean(getProductBrand(p)) && !isDropshippingProduct(p));

function computeAvailableParams(products: Product[]): AvailableParam[] {
  const map = new Map<string, Set<string>>();
  products.forEach((p) => {
    (p.params ?? []).forEach(({ nazev, hodnota }) => {
      if (!map.has(nazev)) map.set(nazev, new Set());
      hodnota.split(',').map((v) => v.trim()).filter(Boolean).forEach((v) => {
        map.get(nazev)!.add(v);
      });
    });
  });
  return Array.from(map.entries())
    .filter(([, values]) => values.size >= 2)
    .map(([nazev, values]) => ({ nazev, values: Array.from(values).sort((a, b) => a.localeCompare(b, 'cs')) }))
    .sort((a, b) => a.nazev.localeCompare(b.nazev, 'cs'));
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableParams, setAvailableParams] = useState<AvailableParam[]>([]);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('produkty')
          .select(`
            id, sku, ean, product_name, manufacturer, category_text,
            long_description, short_description, retail_price, wholesale_price,
            wholesale_discount, stock, image_url, image_urls,
            produkty_obrazky (storage_path, original_url, je_hlavni, stazeno),
            produkty_parametry (nazev, hodnota)
          `) as { data: ProduktyRow[] | null; error: unknown };

        if (!error && data && data.length > 0) {
          if (!active) return;
          const clean = cleanProducts(data.map(mapRow));
          setProducts(clean);
          setAvailableParams(computeAvailableParams(clean));
          return;
        }

        const response = await fetch('/products.json');
        const fallbackData = await response.json() as Product[];
        if (!active) return;
        setProducts(cleanProducts(fallbackData));
      } catch {
        if (!active) return;
        setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProducts();
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
