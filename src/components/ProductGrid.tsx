import { ProductCard } from './ProductCard';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal } from 'lucide-react';
import { useProductSearch, type SearchFilters } from '@/hooks/useProductSearch';

interface Props {
  filters: SearchFilters;
  wishlistIds?: Set<string>;
  onToggleWishlist?: (id: string) => void;
  onClearFilters?: () => void;
}

export function ProductGrid({
  filters, wishlistIds, onToggleWishlist, onClearFilters,
}: Props) {
  const { lang } = useStore();
  const t = translations[lang];
  const { products, totalCount, loading, loadingMore, hasMore, loadMore } = useProductSearch(filters);

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.selectedBrands.length > 0 ||
    filters.selectedCategory !== null ||
    filters.stockOnly ||
    filters.minDiscount > 0 ||
    filters.selectedGenders.length > 0 ||
    Object.values(filters.selectedParams).some((v) => v.length > 0);

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-4 py-2">
        <p className="text-xs text-muted-foreground">
          {totalCount.toLocaleString()} {t.products}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <SlidersHorizontal className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">Žádné produkty neodpovídají filtrům</h3>
          <p className="text-sm text-muted-foreground mb-4">Zkuste upravit nebo zrušit aktivní filtry.</p>
          {hasActiveFilters && onClearFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              Zrušit všechny filtry
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isWishlisted={wishlistIds?.has(p.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center pb-8">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Načítám…' : 'Načíst další'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
