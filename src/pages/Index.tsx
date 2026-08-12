import { useEffect, useState } from 'react';
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
import { ConcernFilterCarousel } from '@/components/ConcernFilterCarousel';
import { HomeTopDeals } from '@/components/deals/HomeTopDeals';
import { HeroDealDashboard } from '@/components/home/HeroDealDashboard';
import {
  ForBuyersSection, WantDealStrip, ForSellersSection, ConnectivitySection, TrustEndingSection,
} from '@/components/home/PivotSections';
import { HomeFooter } from '@/components/HomeFooter';
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
          Catalog view keeps the compact banner. z-10 (dřív z-0): overlay
          prvky uvnitř (dropdown našeptávače v Top Deals) se musí kreslit
          nad AppsCards (z-0); navbar i pozdější z-10 sekce zůstávají výš. */}
      <div className="relative z-10 mt-14">
        {viewMode === 'home' ? (
          <>
            {/* First screen: subtract the announcement-bar offset so nothing gets
                pushed below the fold; pb lifts the headline slightly above the
                true viewport centre. Navbar is a single compact h-14 row now. */}
            {/* -mt-14 + pt-14: sekce (a video) sahá až k hornímu okraji stránky
                pod průhledný navbar; obsah zůstává pod ním. */}
            {/* min-h drží i poměr videa (1928×1076 → 55.9vw): na širokých
                monitorech je sekce vyšší než obrazovka a video je vidět CELÉ
                (nic se neořezává nahoře ani dole), obsah stránky se posune níž */}
            {/* bg tmavé — než video/poster nakreslí první pixel, je pod
                overlayem tma místo šedé (overlay na bílé = šedý záblesk) */}
            {/* First screen — GoBigDeal hero: motion karta s mockup
                dashboardem pod mlhou, duální CTA (Browse / CreateBigDeal)
                a drop-alert mikrolink. Viz HeroDealDashboard. */}
            <HeroDealDashboard />
            {/* Second screen: brand showcase — bílá karta (headline, karusel,
                B2B CTA), pod ní černá karta se „Ship" headline a budoucí
                prezentací dropshippingu, dole do ztracena (smoothstep fade). */}
            {/* sekce začíná jen lehce PŘES úplný spodek hero videa (negativní
                margin, z-10) — žádný bílý pruh, ale video zůstává celé vidět */}
            {/* ── Pivotované sekce (viz PivotSections) — buyers → živé dealy
                s Early Access ceníkem (kotva #gbd-pricing) → Want Deals →
                sellers → connectivity → pravidla + drop-alert finále ── */}
            <ForBuyersSection />
            {/* HomeTopDeals zůstává: živé dealy + Early Access ceník; drží
                kotvu /#gbd-pricing, na kterou vedou odkazy napříč webem */}
            <div className="relative z-10 bg-white">
              <HomeTopDeals />
            </div>
            <WantDealStrip />
            <ForSellersSection />
            <ConnectivitySection />
            <TrustEndingSection />
          </>
        ) : (
          <div className="pt-5 sm:pt-7"><HeroBanner compact /></div>
        )}
      </div>

      {/* Higgsfield karty (AppsCards) i netflix carousel odstraněny — ocas
          homepage teď začíná rovnou GatewaySections (níže), které přebírají
          bílý zaoblený start na tmavé dropship zóně. */}

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

      {viewMode === 'home' && <HomeFooter />}

      {viewMode === 'catalog' && (
        <div className="relative z-10 bg-white flex flex-col flex-1 animate-fade-in">
          <FilterSidebar {...fp} desktopOnly />
          {/* Filtr značek — stejný carousel jako na homepage, ale karta = filtr
              (klik zaškrtne modrou fajfku a propíše značku do filter baru).
              Šedý pruh (zinc-200 jako homepage pod Top Deals) + bílé iOS karty
              + homepage-style nadpis, aby bylo jasné, že jde o filtr, ne o
              položky katalogu. */}
          <div className="bg-zinc-50 [background-image:radial-gradient(ellipse_90%_75%_at_50%_45%,#ffffff_0%,rgba(255,255,255,0)_72%)] pt-6 pb-5 sm:pt-8 sm:pb-6">
            {/* Koncernový filtr — logo-only karty, toggle všech značek koncernu */}
            <div className="px-3 sm:px-5 lg:px-8 mb-3 sm:mb-4">
              <h2 className="font-sans font-extralight tracking-tight leading-[1.15] text-2xl sm:text-3xl text-foreground">
                Filter the catalog by concern.
              </h2>
            </div>
            <ConcernFilterCarousel
              selectedBrands={selectedBrands}
              onToggleConcern={(raws) => {
                const allActive = raws.length > 0 && raws.every((m) => selectedBrands.includes(m));
                setSelectedBrands(
                  allActive
                    ? selectedBrands.filter((m) => !raws.includes(m))
                    : Array.from(new Set([...selectedBrands, ...raws])),
                );
              }}
            />

            <div className="flex items-baseline justify-between gap-4 px-3 sm:px-5 lg:px-8 mb-4 sm:mb-5 mt-5 sm:mt-6">
              <h2 className="font-sans font-extralight tracking-tight leading-[1.15] text-2xl sm:text-3xl text-foreground">
                Filter the catalog by brand.
              </h2>
              {selectedBrands.length > 0 && (
                <button
                  onClick={() => setSelectedBrands([])}
                  className="shrink-0 text-xs font-medium text-blue-600 hover:underline"
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
