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
            {/* Second screen: brand showcase — bílá karta (headline, karusel,
                B2B CTA), pod ní černá karta se „Ship" headline a budoucí
                prezentací dropshippingu, dole do ztracena (smoothstep fade). */}
            <section className="relative mt-20 sm:mt-28 lg:mt-32">
              {/* bílá karta od kraje do kraje — zaoblený jen horní okraj, stín
                  nahoře (zvednutý horní okraj proti bílému hero) */}
              <div className="w-full rounded-t-[1.75rem] bg-white pt-16 pb-16 sm:rounded-t-[2.5rem] sm:pt-24 sm:pb-24 shadow-[0_-20px_45px_-15px_rgba(0,0,0,0.16)]">
                <div className="mx-auto max-w-[1400px] px-5 sm:px-10 lg:px-14">
                  {/* centrovaný blok, text zarovnaný doleva — jako hero H1;
                      velikost zvolena tak, aby se headline vešla na jeden řádek */}
                  <div className="mx-auto w-fit max-w-full text-left">
                    {/* velikost = (šířka viewportu − padding stránky) / šířka textu
                        v em — drží jeden řádek na sm+ */}
                    <h2 className="font-sans font-extralight tracking-tight leading-[1.1] text-[clamp(1.5rem,calc((100vw-120px)/22),3.5rem)] text-foreground">
                      Sell the brands people already want.
                    </h2>
                  </div>
                </div>
                <div className="mx-auto max-w-[1400px] px-1 sm:px-3 lg:px-5 pt-24 sm:pt-36">
                  <BrandShowcaseCarousel />
                </div>
                {/* B2B registrace CTA (iOS pilulka) + trust texty */}
                <div className="pt-12 sm:pt-16">
                  <HomeHero />
                </div>
              </div>
              {/* tmavá karta — bílý „Ship" headline; gradient tří odstínů šedé
                  (nahoře téměř černá → dole střední šedá); sem přijde prezentace
                  dropshippingu (doplníme později) */}
              <div className="w-full rounded-t-[1.75rem] min-h-[640px] pt-16 pb-24 sm:rounded-t-[2.75rem] sm:min-h-[1020px] sm:pt-24 sm:pb-32 bg-[linear-gradient(to_bottom,#0d0d10_0%,#26262e_50%,#4b4b57_100%)]">
                <div className="mx-auto max-w-[1400px] px-5 sm:px-10 lg:px-14">
                  <div className="mx-auto w-fit max-w-full text-left">
                    <p className="font-sans font-extralight tracking-tight leading-[1.1] text-[clamp(1.5rem,calc((100vw-120px)/22),3.5rem)] text-white">
                      Ship across all of Europe<br />without holding stock.
                    </p>
                  </div>
                </div>
              </div>
              {/* fade pod tmavou kartou — smoothstep easing z koncové šedé do bílé */}
              <div
                aria-hidden
                className="h-24 w-full sm:h-36"
                style={{
                  background:
                    'linear-gradient(to bottom, #4b4b57 0%, rgba(75,75,87,0.972) 10%, rgba(75,75,87,0.896) 20%, rgba(75,75,87,0.784) 30%, rgba(75,75,87,0.648) 40%, rgba(75,75,87,0.5) 50%, rgba(75,75,87,0.352) 60%, rgba(75,75,87,0.216) 70%, rgba(75,75,87,0.104) 80%, rgba(75,75,87,0.028) 90%, rgba(75,75,87,0) 100%)',
                }}
              />
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
