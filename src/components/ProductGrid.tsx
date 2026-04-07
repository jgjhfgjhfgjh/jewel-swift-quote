import { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { getProductBrand, matchesFeedCategory } from '@/lib/product-feed';

const PAGE_SIZE = 48;

interface Props {
  products: Product[];
  search: string;
  selectedBrands: string[];
  selectedCategory: string | null;
  stockOnly: boolean;
  minDiscount: number;
  wishlistIds?: Set<string>;
  onToggleWishlist?: (id: string) => void;
}

export function ProductGrid({ products, search, selectedBrands, selectedCategory, stockOnly, minDiscount, wishlistIds, onToggleWishlist }: Props) {
  const { lang } = useStore();
  const t = translations[lang];
  const [page, setPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    const query = search.trim().toLowerCase();
    const activeBrands = selectedBrands ?? [];

    const nextFilteredProducts = products.filter((product) => {
      const brand = getProductBrand(product);

      if (query) {
        const matchesSearch =
          product.name.toLowerCase().includes(query) ||
          brand.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      if (activeBrands.length > 0 && !activeBrands.includes(brand)) {
        return false;
      }

      if (!matchesFeedCategory(product, selectedCategory)) {
        return false;
      }

      if (stockOnly && !(product.stock > 0 || product.inStock)) {
        return false;
      }

      if (minDiscount > 0) {
        const pct = product.price > 0 ? ((product.price - product.wholesale) / product.price) * 100 : 0;
        if (pct < minDiscount) return false;
      }

      return true;
    });

    setPage(1);
    setFilteredProducts(nextFilteredProducts);
  }, [products, search, selectedBrands, selectedCategory, stockOnly, minDiscount]);

  const paginated = filteredProducts.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filteredProducts.length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-4 py-2">
        <p className="text-xs text-muted-foreground">
          {filteredProducts.length.toLocaleString()} {t.products}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {paginated.map((p) => (
          <ProductCard key={p.id} product={p} isWishlisted={wishlistIds?.has(p.id)} onToggleWishlist={onToggleWishlist} />
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
