import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { AdminBrandPanel } from '@/components/AdminBrandPanel';
import { AdminProductOverridesPanel } from '@/components/AdminProductOverridesPanel';
import { CustomerSelectorPanel } from '@/components/CustomerSelectorPanel';
import { SalesModeBar } from '@/components/SalesModeBar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { ProductGrid } from '@/components/ProductGrid';
import { CartDrawer } from '@/components/CartDrawer';
import { useProducts } from '@/hooks/useProducts';
import { useWishlist } from '@/hooks/useWishlist';
import { useStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { HeroBanner } from '@/components/HeroBanner';
import { TripleGateway } from '@/components/TripleGateway';

const Index = () => {
  const { products, loading, manufacturers, categories } = useProducts();
  const { wishlistIds, toggle: toggleWishlist } = useWishlist();
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const {
    search, setSearch,
    selectedBrands, setSelectedBrands,
    selectedCategory, setSelectedCategory,
    stockOnly, setStockOnly,
    minDiscount, setMinDiscount,
    viewMode, setViewMode,
  } = useStore();

  if (loading) {
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

  return (
    <div className="flex min-h-screen flex-col pb-16 lg:pb-0">
      <Navbar wishlistCount={wishlistIds.size} onOpenWishlist={() => setWishlistOpen(true)} />
      {/* Sticky hero banner - acts as background layer during parallax scroll */}
      <div className="sticky top-0 z-0">
        <HeroBanner />
      </div>

      {/* Everything below slides OVER the hero banner */}
      <div className="relative z-10 bg-background">
        <SalesModeBar />
        <CustomerSelectorPanel />
        <AdminBrandPanel manufacturers={manufacturers} />
        <AdminProductOverridesPanel products={products} />
      </div>

      {viewMode === 'home' && (
        <div className="relative z-10 bg-background animate-fade-in">
          <TripleGateway onOpenCatalog={() => setViewMode('catalog')} />
        </div>
      )}

      {viewMode === 'catalog' && (
        <div className="relative z-10 bg-background flex flex-1 overflow-hidden animate-fade-in">
          <ProductGrid
            products={products}
            search={search}
            selectedBrands={selectedBrands}
            selectedCategory={selectedCategory}
            stockOnly={stockOnly}
            minDiscount={minDiscount}
            wishlistIds={wishlistIds}
            onToggleWishlist={toggleWishlist}
          />
        </div>
      )}

      <CartDrawer />
      <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
      <BottomNav onOpenWishlist={() => setWishlistOpen(true)} wishlistCount={wishlistIds.size} />
    </div>
  );
};

export default Index;
