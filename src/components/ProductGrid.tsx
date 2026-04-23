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
  selectedGenders?: string[];
  selectedParams?: Record<string, string[]>;
  wishlistIds?: Set<string>;
  onToggleWishlist?: (id: string) => void;
}

/** Split a comma-separated param value into individual trimmed tokens */
function splitParamValue(hodnota: string): string[] {
  return hodnota.split(',').map((v) => v.trim()).filter(Boolean);
}

export function ProductGrid({
  products, search, selectedBrands, selectedCategory,
  stockOnly, minDiscount, selectedGenders, selectedParams,
  wishlistIds, onToggleWishlist,
}: Props) {
  const { lang } = useStore();
  const t = translations[lang];
  const [page, setPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    const query = search.trim().toLowerCase();
    const activeBrands = selectedBrands ?? [];
    const activeGenders = selectedGenders ?? [];
    const activeParams = selectedParams ?? {};

    const nextFilteredProducts = products.filter((product) => {
      const brand = getProductBrand(product);

      // Search
      if (query) {
        const matchesSearch =
          product.name.toLowerCase().includes(query) ||
          brand.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Brands
      if (activeBrands.length > 0 && !activeBrands.includes(brand)) {
        return false;
      }

      // Category
      if (!matchesFeedCategory(product, selectedCategory)) {
        return false;
      }

      // Stock
      if (stockOnly && !(product.stock > 0 || product.inStock)) {
        return false;
      }

      // Discount
      if (minDiscount > 0) {
        const pct = product.price > 0 ? ((product.price - product.wholesale) / product.price) * 100 : 0;
        if (pct < minDiscount) return false;
      }

      // Gender ("Určení") — OR logic: product matches if any of its gender tokens is in activeGenders
      if (activeGenders.length > 0) {
        const productGenders = (product.params ?? [])
          .filter((p) => p.nazev === 'Určení')
          .flatMap((p) => splitParamValue(p.hodnota));
        if (!productGenders.some((g) => activeGenders.includes(g))) return false;
      }

      // Parametry — AND between groups, OR within group
      for (const [nazev, selectedValues] of Object.entries(activeParams)) {
        if (!selectedValues || selectedValues.length === 0) continue;
        const productValues = (product.params ?? [])
          .filter((p) => p.nazev === nazev)
          .flatMap((p) => splitParamValue(p.hodnota));
        if (!productValues.some((v) => selectedValues.includes(v))) return false;
      }

      return true;
    });

    setPage(1);
    setFilteredProducts(nextFilteredProducts);
  }, [products, search, selectedBrands, selectedCategory, stockOnly, minDiscount, selectedGenders, selectedParams]);

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
