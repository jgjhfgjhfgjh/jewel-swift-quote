import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { ProductGrid } from '@/components/ProductGrid';
import { CartDrawer } from '@/components/CartDrawer';
import { useProducts } from '@/hooks/useProducts';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { products, loading, manufacturers, categories } = useProducts();
  const { lang } = useStore();

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockOnly, setStockOnly] = useState(false);

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
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="h-14" />
      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar
          manufacturers={manufacturers}
          categories={categories}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          search={search}
          setSearch={setSearch}
          stockOnly={stockOnly}
          setStockOnly={setStockOnly}
        />
        <ProductGrid
          products={products}
          search={search}
          selectedBrand={selectedBrand}
          selectedCategory={selectedCategory}
          stockOnly={stockOnly}
        />
      </div>
      <CartDrawer />
    </div>
  );
};

export default Index;
