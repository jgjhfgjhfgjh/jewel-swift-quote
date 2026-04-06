import { useMemo, useState } from 'react';
import { ProductCard } from './ProductCard';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 48;

interface Props {
  products: Product[];
  search: string;
  selectedBrands: string[];
  selectedCategory: string;
  stockOnly: boolean;
  minDiscount: number;
}

export function ProductGrid({ products, search, selectedBrands, selectedCategory, stockOnly, minDiscount }: Props) {
  const { lang } = useStore();
  const t = translations[lang];
  const [page, setPage] = useState(1);

  // Reset page when filters change
  useMemo(() => { setPage(1); }, [search, selectedBrands, selectedCategory, stockOnly, minDiscount]);

  const filtered = useMemo(() => {
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.manufacturer));
    }
    if (selectedCategory) result = result.filter((p) => p.category.startsWith(selectedCategory));
    if (stockOnly) result = result.filter((p) => p.inStock);
    if (minDiscount > 0) {
      result = result.filter((p) => {
        const pct = p.price > 0 ? ((p.price - p.wholesale) / p.price) * 100 : 0;
        return pct >= minDiscount;
      });
    }
    return result;
  }, [products, search, selectedBrands, selectedCategory, stockOnly, minDiscount]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-4 py-2">
        <p className="text-xs text-muted-foreground">
          {filtered.length.toLocaleString()} {t.products}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {paginated.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pb-8">
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
