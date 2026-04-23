import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { FilterSidebar } from '@/components/FilterSidebar';
import { ProductGrid } from '@/components/ProductGrid';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { useProducts } from '@/hooks/useProducts';
import { useWishlist } from '@/hooks/useWishlist';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { getProductBrand, getProductFeedCategories } from '@/lib/product-feed';

const Favorites = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthContext();
  const { products, loading, availableParams } = useProducts();
  const { wishlistIds, toggle: toggleWishlist } = useWishlist();
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const {
    search, setSearch,
    selectedBrands, setSelectedBrands,
    selectedCategory, setSelectedCategory,
    stockOnly, setStockOnly,
    minDiscount, setMinDiscount,
    selectedGenders, setSelectedGenders,
    selectedParams, setSelectedParams,
    setViewMode,
  } = useStore();

  // Only favorited products
  const favoriteProducts = useMemo(
    () => products.filter((p) => wishlistIds.has(p.id)),
    [products, wishlistIds]
  );

  // Manufacturers/categories computed from favorites only — sidebar reflects what's in favorites
  const manufacturers = useMemo(() => {
    const counts = new Map<string, number>();
    favoriteProducts.forEach((p) => {
      const brand = getProductBrand(p);
      if (brand) counts.set(brand, (counts.get(brand) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [favoriteProducts]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    favoriteProducts.forEach((p) => {
      const cat = getProductFeedCategories(p)[0] || p.category || '';
      if (!cat) return;
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [favoriteProducts]);

  const fp = {
    manufacturers, categories,
    selectedBrands, setSelectedBrands,
    selectedCategory, setSelectedCategory,
    search, setSearch,
    stockOnly, setStockOnly,
    minDiscount, setMinDiscount,
    selectedGenders, setSelectedGenders,
    selectedParams, setSelectedParams,
    availableParams,
  };

  // Force catalog view mode so FilterSidebar renders catalog (not home menu) layout
  const { viewMode } = useStore();
  if (viewMode !== 'catalog') {
    setViewMode('catalog');
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1">
          <div className="hidden lg:block lg:w-64 border-r p-4 space-y-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
          <div className="flex-1 p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasFavorites = favoriteProducts.length > 0;

  return (
    <div className="flex min-h-screen flex-col pb-16 lg:pb-0 pt-14">
      <Navbar wishlistCount={wishlistIds.size} onOpenWishlist={() => setWishlistOpen(true)} />

      <FilterSidebar {...fp} mobileOnly />

      <div className="relative z-10 bg-background flex flex-1 items-start animate-fade-in">
        <FilterSidebar {...fp} desktopOnly />

        {hasFavorites ? (
          <ProductGrid
            products={favoriteProducts}
            search={search}
            selectedBrands={selectedBrands}
            selectedCategory={selectedCategory}
            stockOnly={stockOnly}
            minDiscount={minDiscount}
            selectedGenders={selectedGenders}
            selectedParams={selectedParams}
            wishlistIds={wishlistIds}
            onToggleWishlist={toggleWishlist}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
            <div className="rounded-full bg-muted p-6 mb-6">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-2">
              Zatím nemáte žádné oblíbené produkty
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Procházejte katalog a klikněte na srdíčko u produktů, které si chcete uložit.
            </p>
            <Button
              size="lg"
              onClick={() => {
                setViewMode('catalog');
                navigate('/');
              }}
            >
              Přejít do katalogu
            </Button>
          </div>
        )}
      </div>

      <CartDrawer />
      <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
      <BottomNav onOpenWishlist={() => setWishlistOpen(true)} wishlistCount={wishlistIds.size} />
      <ScrollToTopButton />
    </div>
  );
};

export default Favorites;
