import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ExternalLink } from 'lucide-react';
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
import { GatewaySections } from '@/components/GatewaySections';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { useAuthContext } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
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
      {/* Top slot — Apple-style first screen: big Montserrat headline fills the
          viewport, the showcase carousel only appears after scrolling.
          Catalog view keeps the compact banner. */}
      <div className="relative z-0 mt-14 sm:mt-24 lg:mt-[152px]">
        {viewMode === 'home' ? (
          <>
            {/* First screen: subtract the announcement-bar offset so nothing gets
                pushed below the fold; pt guarantees breathing room on short
                (zoomed) displays; pb lifts content slightly above the centre. */}
            {/* pb lifts the headline slightly above the true viewport centre;
                grows with the navbar offset so it stays above centre on desktop */}
            <section className="relative flex min-h-[calc(100svh-3.5rem-var(--ann-offset,0px))] sm:min-h-[calc(100svh-6rem-var(--ann-offset,0px))] lg:min-h-[calc(100svh-152px-var(--ann-offset,0px))] flex-col items-center justify-center px-6 pb-[20vh] sm:pb-[18vh] lg:pb-[26vh] text-center">
              {/* MCP Server — mini pill top-right */}
              <button
                type="button"
                onClick={() => navigate('/feed')}
                className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#2e2833] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#17141b] sm:right-6 sm:top-6"
              >
                MCP Server <ExternalLink className="h-3.5 w-3.5" />
              </button>

              {/* Size follows viewport HEIGHT (clamp on vh) so it stays big on
                  tall displays but never overflows short / zoomed ones.
                  Mobile: sized so "Sell Luxury with" fits on one line. */}
              <h1 className="font-display font-semibold tracking-tight leading-[1.1] text-[2rem] sm:text-[clamp(3rem,8.5vh,6.5rem)] max-w-5xl text-foreground">
                Sell Luxury with<br />Enterprise Technology.
              </h1>

              {/* Sub-headline — "Product Intelligence Platform" in swelt primary blue + verify note */}
              <div className="mt-5 flex flex-col items-center gap-1 sm:mt-7">
                <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-blue-600 sm:text-xl">
                  Product Intelligence Platform
                </h2>
                <span className="text-xs text-muted-foreground sm:text-sm">Verify Account in 24h</span>
              </div>

              {/* Bottom tagline — stacked on mobile, one row on desktop */}
              <div className="absolute inset-x-0 bottom-10 flex flex-col items-center justify-center gap-1 px-6 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1 sm:bottom-14 sm:text-sm">
                <span className="whitespace-nowrap">Launch Faster</span>
                <span className="whitespace-nowrap">Sell More</span>
                <span className="whitespace-nowrap">Automate</span>
                <span className="whitespace-nowrap">Save Hours</span>
              </div>
              {/* scroll cue */}
              <ChevronDown className="absolute bottom-5 h-6 w-6 animate-bounce text-zinc-300" aria-hidden />
            </section>
            {/* Second screen: brand carousel (logos + product previews) then CTAs */}
            <section className="flex flex-col items-center px-0 pt-12 pb-16 sm:pt-16 sm:pb-20 gap-10 sm:gap-14">
              <BrandShowcaseCarousel />
              <div className="w-full px-6">
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
