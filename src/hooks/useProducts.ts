import { useState, useEffect, useMemo } from 'react';
import type { Product } from '@/lib/types';
import { getProductBrand, getProductFeedCategories, isDropshippingProduct } from '@/lib/product-feed';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type ProductRow = Tables<'products'>;

const cleanProducts = (data: Product[]) => data.filter((p) => {
  const brand = getProductBrand(p);
  return Boolean(brand) && !isDropshippingProduct(p);
});

const mapProductRow = (row: ProductRow): Product => ({
  id: row.id,
  name: row.product_name_is || row.original_name_cz || row.sku,
  manufacturer: row.manufacturer || '',
  sku: row.sku,
  ean: row.ean || '',
  description: row.description_is || row.original_description_cz || '',
  category: row.category_text || '',
  img: row.image_url || row.image_urls?.[0] || '',
  image_urls: row.image_urls ?? [],
  price: Number(row.manual_price_isk ?? row.supplier_price ?? 0),
  wholesale: Number(row.supplier_price ?? row.manual_price_isk ?? 0),
  stock: row.stock_quantity ?? 0,
  inStock: (row.stock_quantity ?? 0) > 0,
});

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, sku, manufacturer, ean, original_name_cz, product_name_is, original_description_cz, description_is, category_text, image_url, image_urls, supplier_price, manual_price_isk, stock_quantity');

        if (!error && data && data.length > 0) {
          if (!active) return;
          setProducts(cleanProducts(data.map(mapProductRow)));
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

    return () => {
      active = false;
    };
  }, []);

  const manufacturers = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      const brand = getProductBrand(p);
      if (brand) {
        counts.set(brand, (counts.get(brand) || 0) + 1);
      }
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

  return { products, loading, manufacturers, categories };
}
