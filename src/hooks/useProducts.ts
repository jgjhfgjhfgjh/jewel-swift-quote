import { useState, useEffect, useMemo } from 'react';
import type { Product } from '@/lib/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/products.json')
      .then((r) => r.json())
      .then((data: Product[]) => {
        // Exclude dropshipping products and products with empty manufacturers
        const cleaned = data.filter((p) => {
          const cat = (p.category || '').toLowerCase();
          const mfr = (p.manufacturer || '').trim();
          if (!mfr) return false;
          if (cat.includes('dropshipping')) return false;
          return true;
        });
        setProducts(cleaned);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const manufacturers = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      counts.set(p.manufacturer, (counts.get(p.manufacturer) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [products]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      const cat = p.category.split('|')[0]?.trim() || p.category;
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [products]);

  return { products, loading, manufacturers, categories };
}
