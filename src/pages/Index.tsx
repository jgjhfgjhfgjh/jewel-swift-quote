import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
import { BrandShowcaseCarousel } from '@/components/BrandShowcaseCarousel';
import { AppsCards } from '@/components/AppsCards';
import { HomeHero } from '@/components/HomeHero';
import { HeroRotatingText } from '@/components/HeroRotatingText';
import { GatewaySections } from '@/components/GatewaySections';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { useAuthContext } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading: authLoading } = useAuthContext();
  const { manufacturers, categories, availableParams, loading } = useProducts();
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
    viewMode, setViewMode, openAuthModal,
  } = useStore();

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

  const filters = {
    search, selectedBrands, selectedCategory,
    stockOnly, minDiscount, selectedGenders, selectedParams,
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedBrands([]);
    setSelectedCategory(null);
    setStockOnly(false);
    setMinDiscount(0);
    setSelectedGenders([]);
    setSelectedParams({});
  };

  // Nepřihlášený uživatel mířící do katalogu → otevřeme přihlašovací popup
  // (stejný, jaký používáme na homepage) a vrátíme ho na úvod. Nahrazuje
  // dřívější zastaralou celostránkovou CatalogGateway.
  const needsAuthForCatalog = !authLoading && !user && viewMode === 'catalog';
  useEffect(() => {
    if (needsAuthForCatalog) {
      openAuthModal('login');
      setViewMode('home');
    }
  }, [needsAuthForCatalog, openAuthModal, setViewMode]);
  if (needsAuthForCatalog) return null;

  // Product data is only needed by the catalog view — the homepage renders
  // instantly (no skeleton flash before the headline).
  if (loading && viewMode === 'catalog') {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1">
          <div className="hidden lg:block lg:w-64 border-r p-4 space-y-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
          <div className="flex-1 p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white pb-16 lg:pb-0">
      <Navbar wishlistCount={wishlistIds.size} onOpenWishlist={() => setWishlistOpen(true)} />
      {/* Top slot — Apple-style first screen: big light headline fills the
          viewport, the showcase carousel only appears after scrolling.
          Catalog view keeps the compact banner. */}
      <div className="relative z-0 mt-14">
        {viewMode === 'home' ? (
          <>
            {/* First screen: subtract the announcement-bar offset so nothing gets
                pushed below the fold; pb lifts the headline slightly above the
                true viewport centre. Navbar is a single compact h-14 row now. */}
            <section className="relative flex min-h-[calc(100svh-3.5rem-var(--ann-offset,0px))] flex-col justify-center px-6 pb-[18vh] sm:pb-[16vh]">
              {/* Size follows viewport HEIGHT (clamp on vh) so it stays big on
                  tall displays but never overflows short / zoomed ones; mobile
                  clamps on vw so "Enterprise Technology" fits on one line.
                  Inter Extra Light (200). Blok je vycentrovaný (w-fit podle H1),
                  řádky uvnitř zarovnané doleva; psaný řádek má na sm+ nulovou
                  šířku, aby psaní neměnilo šířku bloku (přetéká doprava). */}
              <div className="w-full sm:w-fit mx-auto text-left">
                <h1 className="font-sans font-extralight tracking-tight leading-[1.1] text-[clamp(2rem,8.5vw,2.75rem)] sm:text-[clamp(3.5rem,12.5vh,7.75rem)] text-foreground">
                  Sell Luxury with<br />Enterprise Technology
                </h1>
                <div className="font-sans font-extralight tracking-tight leading-[1.1] text-[clamp(2rem,8.5vw,2.75rem)] sm:text-[clamp(3.5rem,12.5vh,7.75rem)] sm:w-0 sm:whitespace-nowrap">
                  <HeroRotatingText />
                </div>
              </div>
              {/* scroll cue */}
              <ChevronDown className="absolute bottom-5 left-1/2 -translate-x-1/2 h-6 w-6 animate-bounce text-zinc-300" aria-hidden />
            </section>
            {/* Second screen: brand showcase — white elevated panel (jako modrá
                Shopify sekce, ale bílá + stín, aby karusel zůstal na bílém).
                Headline ve stejném fontu jako H1 uvádí, na co se zákazník dívá. */}
            <section className="px-4 pt-10 pb-4 sm:px-6 sm:pt-14 lg:px-8">
              <div className="mx-auto max-w-[1400px] rounded-3xl bg-white px-5 pt-10 pb-6 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.22)] ring-1 ring-zinc-200/70 sm:rounded-[2.5rem] sm:px-9 sm:pt-14 sm:pb-8 lg:px-14 lg:pt-16">
                <div className="max-w-4xl">
                  <p className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400 sm:mb-5 sm:text-xs">
                    70+ premium brands · wholesale
                  </p>
                  <h2 className="font-sans font-extralight tracking-tight leading-[1.08] text-[clamp(1.9rem,4.6vw,4rem)] text-foreground">
                    Every brand here is<br className="hidden sm:block" /> money you can make.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-zinc-500 sm:mt-5 sm:text-lg">
                    Watches and jewellery people already search for — at wholesale
                    prices, ready to sell everywhere your customers scroll.
                  </p>
                </div>
                <div className="mt-8 -mx-2 sm:mt-12 sm:-mx-4 lg:-mx-8">
                  <BrandShowcaseCarousel />
                </div>
              </div>
            </section>
            {/* CTAs */}
            <section className="flex flex-col items-center px-6 pt-8 pb-16 sm:pt-12 sm:pb-20">
              <div className="w-full">
                <HomeHero />
              </div>
            </section>
          </>
        ) : (
          <div className="pt-5 sm:pt-7"><HeroBanner compact /></div>
        )}
      </div>

      {/* Apps/tools cards */}
      {viewMode === 'home' && (
        <div className="relative z-0">
          <AppsCards />
        </div>
      )}

      {/* Admin/sales panels — only relevant in the catalog view */}
      {viewMode === 'catalog' && (
        <div className="relative z-10 bg-white">
          <SalesModeBar />
          <CustomerSelectorPanel />
          <AdminBrandPanel manufacturers={manufacturers} />
          <AdminProductOverridesPanel />
        </div>
      )}

      {/* Mobile sidebar overlay — works in all modes */}
      <FilterSidebar {...fp} mobileOnly />

      {viewMode === 'home' && (
        <div className="relative z-10 animate-fade-in bg-white pt-8 sm:pt-12">
          <GatewaySections onOpenCatalog={() => { setViewMode('catalog'); window.scrollTo({ top: 0, behavior: 'instant' }); }} />
        </div>
      )}

      {viewMode === 'catalog' && (
        <div className="relative z-10 bg-white flex flex-col flex-1 animate-fade-in">
          <FilterSidebar {...fp} desktopOnly />
          {/* Brand showcase — same carousel as the homepage, but here each card
              is a brand filter: clicking checks it (blue fajfka) and writes the
              brand into the filter bar instead of opening the brand-detail page. */}
          <div className="border-b bg-white pt-2 pb-1">
            <div className="flex items-center justify-between px-3 sm:px-5 lg:px-8 mb-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Filtrovat podle značky
              </p>
              {selectedBrands.length > 0 && (
                <button
                  onClick={() => setSelectedBrands([])}
                  className="text-[11px] font-medium text-blue-600 hover:underline"
                >
                  Zrušit ({selectedBrands.length})
                </button>
              )}
            </div>
            <BrandShowcaseCarousel
              selectable
              selectedBrands={selectedBrands}
              onToggleBrand={(raws) => {
                const anyActive = raws.some((m) => selectedBrands.includes(m));
                setSelectedBrands(
                  anyActive
                    ? selectedBrands.filter((m) => !raws.includes(m))
                    : Array.from(new Set([...selectedBrands, ...raws])),
                );
              }}
            />
          </div>
          <ProductGrid
            filters={filters}
            wishlistIds={wishlistIds}
            onToggleWishlist={toggleWishlist}
            onClearFilters={clearAllFilters}
          />
        </div>
      )}

      <CartDrawer />
      <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
      {viewMode === 'catalog' && (
        <BottomNav onOpenWishlist={() => setWishlistOpen(true)} wishlistCount={wishlistIds.size} />
      )}
      <ScrollToTopButton />
    </div>
  );
};

export default Index;
