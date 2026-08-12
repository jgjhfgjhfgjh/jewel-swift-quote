import { useEffect, useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { HeroRotatingText } from '@/components/HeroRotatingText';
import PerWordCrossfade from '@/components/ui/per-word-crossfade';
import { CreateBigDealButton } from '@/components/deals/CreateBigDealButton';
import { HeroDealDashboard } from '@/components/home/HeroDealDashboard';
import {
  ForBuyersSection, WantDealStrip, ForSellersSection, ConnectivitySection, TrustEndingSection,
} from '@/components/home/PivotSections';
import { HomeFooter } from '@/components/HomeFooter';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRef } from 'react';

/** Hero video s vynuceným autoplay pro mobily — neprůstřelná varianta.
 *
 *  1) iOS rozhoduje o autoplay v okamžiku, kdy začne load. React ale nastavuje
 *     `muted` jen jako DOM property, ne atribut → src proto nenastavujeme
 *     v JSX, ale až v efektu PO ručním doplnění muted atributu.
 *  2) play() se opakuje při loadeddata/canplaythrough, návratu na kartu
 *     a při každém dotyku/kliku (Low Power Mode povolí play až po gestu).
 *  3) Když je autoplay přesto zablokované, video PŘEKRYJEME čistým posterem —
 *     nativní play ikona tak není nikdy vidět; po prvním dotyku se video
 *     spustí a poster zmizí.
 *
 *  Src i poster musí zůstat same-origin (Vercel edge CDN): remote Supabase
 *  startoval na mobilu tak pomalu, že iOS autoplay vzdal. */
function HeroVideo() {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.setAttribute('muted', '');
    // src až teď — při začátku loadu už muted atribut existuje
    if (!v.src) {
      v.src = '/hero-video.mp4';
      v.load();
    }
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.then === 'function') {
        p.then(() => setBlocked(false)).catch(() => setBlocked(v.paused));
      }
    };
    tryPlay();
    const onReady = () => { if (v.paused) tryPlay(); };
    v.addEventListener('loadeddata', onReady);
    v.addEventListener('canplaythrough', onReady);
    const onVis = () => { if (!document.hidden && v.paused) tryPlay(); };
    document.addEventListener('visibilitychange', onVis);
    const onInput = () => { if (v.paused) tryPlay(); };
    window.addEventListener('touchstart', onInput, { passive: true });
    window.addEventListener('click', onInput);
    return () => {
      v.removeEventListener('loadeddata', onReady);
      v.removeEventListener('canplaythrough', onReady);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('touchstart', onInput);
      window.removeEventListener('click', onInput);
    };
  }, []);

  const mediaClass = 'pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-bottom';

  return (
    <>
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        controls={false}
        poster="/hero-poster.jpg"
        className={mediaClass}
      />
      {/* autoplay zablokované → čistý poster překryje nativní play overlay */}
      {blocked && <img src="/hero-poster.jpg" alt="" aria-hidden className={mediaClass} />}
    </>
  );
}


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
            <section className="relative -mt-14 flex min-h-[max(calc(100svh-var(--ann-offset,0px)),55.9vw)] flex-col justify-center overflow-hidden bg-[#0b0d10] px-6 pb-[10vh] pt-14 sm:pb-[8vh]">
              {/* fullscreen video přes celou první sekci + tmavý overlay,
                  aby bílé texty (a bílý navbar nad videem) zůstaly čitelné */}
              <HeroVideo />
              <div aria-hidden className="absolute inset-0 z-0 bg-black/40" />
              {/* Size follows viewport HEIGHT (clamp on vh) so it stays big on
                  tall displays but never overflows short / zoomed ones; mobile
                  clamps on vw so "smarter tools" line fits on one line.
                  Inter Extra Light (200). Blok je vycentrovaný (w-fit podle H1),
                  řádky uvnitř zarovnané doleva; psaný řádek má na sm+ nulovou
                  šířku, aby psaní neměnilo šířku bloku (přetéká doprava). */}
              {/* blok posunutý lehce dolů (menší pb sekce) a doleva (translate) */}
              {/* širší druhý řádek skoro vyplní šířku — větší posun by se na
                  1280px ořezával; -1vw nechá blok jemně vlevo od středu.
                  Na mobilu jede blok (i marquee níže) o 8vh dolů — nad
                  textem je volný prostor, translate nemění výšku sekce. */}
              <div className="relative z-10 w-full sm:w-fit mx-auto text-left translate-y-[8vh] sm:translate-y-0 sm:-translate-x-[5vw]">
                {/* min(12.5vh,6.3vw) — vh drží velikost na vysokých oknech,
                    vw pojistka brání zalomení řádku „smarter tools…" na
                    užších desktopech */}
                {/* headline nabíhá po slovech (PerWordCrossfade) — druhý řádek
                    startuje, když se první rozjede, gradientová fráze pod ním
                    pak navazuje (startDelay). Zalomení řádku drží <br />, proto
                    dva bloky místo jednoho řetězce. */}
                <h1 className="font-sans font-extralight tracking-tight leading-[1.1] text-[clamp(2rem,8.5vw,2.75rem)] sm:text-[clamp(3.5rem,min(12.5vh,6.3vw),7.75rem)] text-white">
                  <PerWordCrossfade stagger={90}>Buy and sell with</PerWordCrossfade>
                  <br />
                  <PerWordCrossfade delay={360} stagger={90}>
                    smarter tools for modern teams
                  </PerWordCrossfade>
                </h1>
                {/* na mobilu rezerva 2 řádků (min-h) — delší fráze se zalomí do
                    předrezervovaného místa, blok nemění výšku a text neodskočí;
                    na sm+ je řádek jednořádkový (w-0 + nowrap), rezerva zbytečná */}
                <div className="min-h-[2.2em] font-sans font-extralight tracking-tight leading-[1.1] text-[clamp(2rem,8.5vw,2.75rem)] sm:min-h-0 sm:text-[clamp(3.5rem,min(12.5vh,6.3vw),7.75rem)] sm:w-0 sm:whitespace-nowrap text-white">
                  <HeroRotatingText />
                </div>
                {/* CTA pod textem (nahradily marquee log, pokyn): B2B
                    registrace s verifikačním captionem + CreateBigDeal.
                    Přihlášený registraci nepotřebuje — dostane Browse deals. */}
                {/* gap-y-6: na mobilu se dvojice zalomí a pod B2B pilulkou
                    visí verifikační caption — druhý řádek mu nesmí sedět
                    na hlavě */}
                <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-6 sm:mt-10">
                  {user ? (
                    <button
                      type="button"
                      onClick={() => navigate('/deals')}
                      className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-zinc-900 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)] transition-all hover:-translate-y-0.5 hover:bg-zinc-100 hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.65)]"
                    >
                      Browse deals
                      <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <div className="relative flex shrink-0 items-center">
                      <button
                        type="button"
                        onClick={() => openAuthModal('b2b')}
                        className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-zinc-900 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)] transition-all hover:-translate-y-0.5 hover:bg-zinc-100 hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.65)]"
                      >
                        B2B registration
                        <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                      </button>
                      <span className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-[10px] leading-none tracking-wide text-white/60">
                        Verify Account in 24h
                      </span>
                    </div>
                  )}
                  {/* 1:1 s CTA v navigaci — stejná komponenta, tvar i chování */}
                  <CreateBigDealButton className="h-11 px-6 text-[15px]" />
                </div>
              </div>
              {/* scroll cue — výš, aby ho nepřekryla následující sekce */}
              <ChevronDown className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-10 h-6 w-6 animate-bounce text-white/80" aria-hidden />
            </section>
            {/* První sekce POD videem — motion karta s mockup dashboardem
                pod mlhou a duálním CTA (B2B registrace / CreateBigDeal).
                Viz HeroDealDashboard. */}
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
