import { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { getProductBrand, matchesFeedCategory } from '@/lib/product-feed';
import { supabase } from '@/integrations/supabase/client';

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

export function ProductGrid({
  products, search, selectedBrands, selectedCategory,
  stockOnly, minDiscount, selectedGenders, selectedParams,
  wishlistIds, onToggleWishlist,
}: Props) {
  const { lang } = useStore();
  const t = translations[lang];
  const [page, setPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // Server-side param filter — returns Set of matching product IDs (null = no filter active)
  const [paramFilteredIds, setParamFilteredIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    const activeGenders = selectedGenders ?? [];
    const activeParams = selectedParams ?? {};
    const hasGenders = activeGenders.length > 0;
    const hasParams = Object.values(activeParams).some((v) => v.length > 0);

    if (!hasGenders && !hasParams) {
      setParamFilteredIds(null);
      return;
    }

    let active = true;

    const paramFilters = Object.fromEntries(
      Object.entries(activeParams).filter(([, v]) => v.length > 0),
    );

    (supabase as any)
      .rpc('filter_products_by_params', {
        p_genders: hasGenders ? activeGenders : null,
        p_params: Object.keys(paramFilters).length > 0 ? paramFilters : null,
      })
      .then(({ data, error }: { data: string[] | null; error: unknown }) => {
        if (!active || error) return;
        setParamFilteredIds(new Set(data ?? []));
      });

    return () => { active = false; };
  }, [selectedGenders, selectedParams]);

  // Client-side filter (search, brand, category, stock, discount) + param ID gate
  useEffect(() => {
    const query = search.trim().toLowerCase();
    const activeBrands = selectedBrands ?? [];

    const next = products.filter((product) => {
      const brand = getProductBrand(product);

      if (query) {
        const ok =
          product.name.toLowerCase().includes(query) ||
          brand.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query);
        if (!ok) return false;
      }

      if (activeBrands.length > 0 && !activeBrands.includes(brand)) return false;

      if (!matchesFeedCategory(product, selectedCategory)) return false;

      if (stockOnly && !(product.stock > 0 || product.inStock)) return false;

      if (minDiscount > 0) {
        const pct = product.price > 0 ? ((product.price - product.wholesale) / product.price) * 100 : 0;
        if (pct < minDiscount) return false;
      }

      // Param / gender filter — server already resolved which IDs match
      if (paramFilteredIds !== null && !paramFilteredIds.has(product.id)) return false;

      return true;
    });

    setPage(1);
    setFilteredProducts(next);
  }, [products, search, selectedBrands, selectedCategory, stockOnly, minDiscount, paramFilteredIds]);

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
