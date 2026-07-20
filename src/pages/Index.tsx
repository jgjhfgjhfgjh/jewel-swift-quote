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
import { ConcernFilterCarousel } from '@/components/ConcernFilterCarousel';
import { DropshipHeadline } from '@/components/DropshipHeadline';
import { DropshipFlowMap } from '@/components/DropshipFlowMap';
import { AgentLogoRow } from '@/components/AgentLogoRow';
import { HomeTopDeals } from '@/components/deals/HomeTopDeals';
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
            <section className="relative -mt-14 flex min-h-[max(calc(100svh-var(--ann-offset,0px)),55.9vw)] flex-col justify-center overflow-hidden px-6 pb-[13vh] pt-14 sm:pb-[11vh]">
              {/* fullscreen video přes celou první sekci + tmavý overlay,
                  aby bílé texty (a bílý navbar nad videem) zůstaly čitelné */}
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-bottom"
                src="/hero-video.mp4"
              />
              <div aria-hidden className="absolute inset-0 z-0 bg-black/40" />
              {/* Size follows viewport HEIGHT (clamp on vh) so it stays big on
                  tall displays but never overflows short / zoomed ones; mobile
                  clamps on vw so "Enterprise Technology" fits on one line.
                  Inter Extra Light (200). Blok je vycentrovaný (w-fit podle H1),
                  řádky uvnitř zarovnané doleva; psaný řádek má na sm+ nulovou
                  šířku, aby psaní neměnilo šířku bloku (přetéká doprava). */}
              {/* blok posunutý lehce dolů (menší pb sekce) a doleva (translate) */}
              <div className="relative z-10 w-full sm:w-fit mx-auto text-left sm:-translate-x-[3vw]">
                <h1 className="font-sans font-extralight tracking-tight leading-[1.1] text-[clamp(2rem,8.5vw,2.75rem)] sm:text-[clamp(3.5rem,12.5vh,7.75rem)] text-white">
                  Sell Luxury with<br />Enterprise Technology
                </h1>
                <div className="font-sans font-extralight tracking-tight leading-[1.1] text-[clamp(2rem,8.5vw,2.75rem)] sm:text-[clamp(3.5rem,12.5vh,7.75rem)] sm:w-0 sm:whitespace-nowrap text-white">
                  <HeroRotatingText />
                </div>
              </div>
              {/* scroll cue — výš, aby ho nepřekryla následující sekce */}
              <ChevronDown className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-10 h-6 w-6 animate-bounce text-white/80" aria-hidden />
            </section>
            {/* Second screen: brand showcase — bílá karta (headline, karusel,
                B2B CTA), pod ní černá karta se „Ship" headline a budoucí
                prezentací dropshippingu, dole do ztracena (smoothstep fade). */}
            {/* sekce začíná jen lehce PŘES úplný spodek hero videa (negativní
                margin, z-10) — žádný bílý pruh, ale video zůstává celé vidět */}
            <section className="relative z-10 -mt-4 sm:-mt-6">
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
                <div className="mx-auto max-w-[1400px] px-1 sm:px-3 lg:px-5 pt-16 sm:pt-24">
                  <BrandShowcaseCarousel />
                </div>
                {/* B2B registrace CTA (iOS pilulka) + trust texty; CTA je na
                    svislém středu mezi karuselem a fajfkami (stejné mezery) */}
                <div className="pt-10 sm:pt-14">
                  <HomeHero />
                </div>
              </div>
              {/* tmavá karta — spotlight headline + interaktivní schéma
                  dropshippingu (DropshipFlowMap): bílo-šedá mapa Evropy,
                  gradientové pohyby objednávek, expanze trhů a kasička zisku */}
              <div className="w-full rounded-t-[1.75rem] min-h-[640px] pt-16 pb-16 sm:rounded-t-[2.75rem] sm:min-h-[1020px] sm:pt-24 sm:pb-24 bg-[linear-gradient(to_bottom,#0d0d10_0%,#26262e_50%,#4b4b57_100%)]">
                <div className="mx-auto max-w-[1400px] px-5 sm:px-10 lg:px-14">
                  <div className="mx-auto max-w-[1000px] text-left">
                    {/* spotlight nadpis: tmavě šedý text, kurzor rozsvěcí ~2 slova
                        v okruhu; barevná věta se rozsvítí celá (viz komponenta) */}
                    <DropshipHeadline />
                  </div>
                  <div className="pt-12 sm:pt-16">
                    <DropshipFlowMap />
                  </div>
                </div>
              </div>
              {/* pokračování tmavé zóny — černé pozadí se rozšiřuje dolů a
                  gradient se ze šedé (#4b4b57, navazuje na spodek dropship karty)
                  postupně obrací zpět do černé. Na tomto podkladu „pluje" bílá
                  karta na velikost obrazovky se stínem (zatím placeholder). */}
              <div className="w-full pt-8 pb-16 sm:pt-12 sm:pb-24 bg-[linear-gradient(to_bottom,#4b4b57_0%,#26262e_45%,#0d0d10_100%)]">
                <div className="mx-auto max-w-[1400px] px-5 sm:px-10 lg:px-14">
                  <div className="relative overflow-hidden rounded-[1.75rem] bg-white shadow-[0_40px_120px_-24px_rgba(0,0,0,0.75)] ring-1 ring-white/10 min-h-[82svh] sm:min-h-[85svh] sm:rounded-[2.5rem]">
                    <div className="grid h-full min-h-[inherit] grid-cols-1 gap-10 p-8 sm:p-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 lg:p-20">
                      {/* levý sloupec — copy (placeholder) */}
                      <div className="flex flex-col justify-center">
                        {/* loga AI agentů, na které se swelt napojí */}
                        <div className="mb-8">
                          <AgentLogoRow />
                        </div>
                        <h2 className="font-sans font-extralight tracking-tight leading-[1.1] text-[clamp(1.75rem,5vw,3.5rem)] text-zinc-900">
                          Connect swelt to
                          <br />
                          your AI agents
                        </h2>
                        <div className="mt-6 max-w-md space-y-3">
                          <div className="h-3 w-full rounded-full bg-zinc-100" />
                          <div className="h-3 w-[85%] rounded-full bg-zinc-100" />
                          <div className="h-3 w-[70%] rounded-full bg-zinc-100" />
                        </div>
                        <span className="mt-8 inline-block w-fit text-sm font-medium text-zinc-400 underline underline-offset-4">
                          Odkaz (placeholder)
                        </span>
                      </div>
                      {/* pravý sloupec — vizuál (placeholder) */}
                      <div className="relative min-h-[280px] overflow-hidden rounded-[1.25rem] bg-zinc-50 ring-1 ring-zinc-100 sm:rounded-[1.75rem]">
                        {/* rozházené dlaždice — náznak budoucí kompozice */}
                        <div className="absolute left-[8%] top-[12%] h-24 w-24 rounded-xl bg-zinc-100 ring-1 ring-zinc-200/70 sm:h-28 sm:w-28" />
                        <div className="absolute right-[14%] top-[8%] h-28 w-28 rounded-xl bg-zinc-100 ring-1 ring-zinc-200/70 sm:h-36 sm:w-36" />
                        <div className="absolute bottom-[14%] left-[16%] h-28 w-28 rounded-xl bg-zinc-100 ring-1 ring-zinc-200/70 sm:h-36 sm:w-36" />
                        <div className="absolute bottom-[10%] right-[10%] h-24 w-32 rounded-xl bg-zinc-100 ring-1 ring-zinc-200/70 sm:h-28 sm:w-40" />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium uppercase tracking-wider text-zinc-300">
                          Vizuál
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Top DEAL nabídky — bílá full-width karta (hero deal + locked
                  karty s Insider paywallem 48 h + countdown „next drop" +
                  carousel koncernů). Černá zóna výše je protažená pod kartu,
                  aby zaoblené rohy odkrývaly černou; bílá sekce pak plynule
                  navazuje na bílý obsah níže (dřívější fade už není potřeba). */}
              {/* z-10: dropdown našeptávače modelů se musí kreslit NAD
                  následující sekce (AppsCards má vlastní z-0 kontext) */}
              <div className="relative z-10 bg-[#0d0d10]">
                <HomeTopDeals />
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
          {/* Filtr značek — stejný carousel jako na homepage, ale karta = filtr
              (klik zaškrtne modrou fajfku a propíše značku do filter baru).
              Šedý pruh (zinc-200 jako homepage pod Top Deals) + bílé iOS karty
              + homepage-style nadpis, aby bylo jasné, že jde o filtr, ne o
              položky katalogu. */}
          <div className="bg-zinc-200 [background-image:radial-gradient(ellipse_90%_75%_at_50%_45%,#f4f4f5_0%,rgba(244,244,245,0)_72%)] pt-6 pb-5 sm:pt-8 sm:pb-6">
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
