import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Package, Truck, Sparkles, Check, MessageSquare, Search, X, Rss, PackageOpen, HandCoins } from 'lucide-react';
import { getCategorySegment, isBrandSegment, SEGMENT_LABEL, type BrandSegment } from '@/lib/brandSegment';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { BrandLogo } from '@/components/BrandLogo';
import { getBrandByName } from '@/data/brands';

/* ─── Reveal on scroll ─── */
function useReveal(threshold = 0.1): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, revealed];
}
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, revealed] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {children}
    </div>
  );
}

/* ─── Brand normalization (same as Brands.tsx) ─── */
const BRAND_ALIASES: Record<string, string> = {
  'TOMMY HILFIGER JEWELS': 'TOMMY HILFIGER',
  'GUESS JEWELS': 'GUESS',
  'HUGO BOSS JEWELS': 'HUGO BOSS',
  'EMPORIO ARMANI JEWELS': 'EMPORIO ARMANI',
  'EMPORIO ARMANI JEWELRY': 'EMPORIO ARMANI',
  'CALVIN KLEIN JEWELRY': 'CALVIN KLEIN',
  'BREIL JEWELS': 'BREIL',
  'JUST CAVALLI JEWELS': 'JUST CAVALLI',
  'ROBERTO CAVALLI BY FRANCK MULLER': 'ROBERTO CAVALLI',
  'ROBERTO CAVALLI by FRANCK MULLER': 'ROBERTO CAVALLI',
  'POLICE JEWELS': 'POLICE',
  'SECTOR JEWELS': 'SECTOR',
  'VICEROY FASHION': 'VICEROY',
  'VICEROY JEWELS': 'VICEROY',
  'VICEROY KIDS': 'VICEROY',
  'VICEROY KIDS JEWELS': 'VICEROY',
  'DISNEY JEWELS': 'DISNEY',
  'PIERRE LANNIER JEWELRY': 'PIERRE LANNIER',
  'PIERRE LANNIER STRAPS': 'PIERRE LANNIER',
  'HIP HOP STRAPS': 'HIP HOP',
  'MICHAEL KORS JEWELRY': 'MICHAEL KORS',
  'ALVIERO MARTINI JEWELS': 'ALVIERO MARTINI',
  'ZOPPINI JEWELS': 'ZOPPINI',
  'SWATCH BIJOUX': 'SWATCH',
  'CHRONOSTAR BY SECTOR': 'CHRONOSTAR',
  'MARK MADDOX - NEW COLLECTION': 'MARK MADDOX',
  'HACKER LED WATCHES': 'HACKER',
};

const DISPLAY_NAMES: Record<string, string> = {
  'DKNY': 'DKNY',
  'Q&Q': 'Q&Q',
  'HIP HOP': 'Hip Hop',
  'LA PETITE STORY': 'La Petite Story',
  'HUGO BOSS': 'Hugo Boss',
  'EMPORIO ARMANI': 'Emporio Armani',
  'TOMMY HILFIGER': 'Tommy Hilfiger',
  'CALVIN KLEIN': 'Calvin Klein',
  'MICHAEL KORS': 'Michael Kors',
  'PIERRE LANNIER': 'Pierre Lannier',
  'ROBERTO CAVALLI': 'Roberto Cavalli',
  'JUST CAVALLI': 'Just Cavalli',
  'VERSUS VERSACE': 'Versus Versace',
  'MISS SIXTY': 'Miss Sixty',
  'MARK MADDOX': 'Mark Maddox',
  'BEVERLY HILLS POLO CLUB': 'Beverly Hills Polo Club',
  'MANUEL ZED': 'Manuel Zed',
  'ALVIERO MARTINI': 'Alviero Martini',
  'CERRUTI 1881': 'Cerruti 1881',
  'DANIEL WELLINGTON': 'Daniel Wellington',
};

function toDisplayName(key: string): string {
  if (DISPLAY_NAMES[key]) return DISPLAY_NAMES[key];
  return key.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ─── Types ─── */
interface Product {
  id: string;
  name: string;
  manufacturer: string;
  img: string;
  price: number;
  wholesale: number;
  inStock: boolean;
  category: string;
}

interface BrandData {
  key: string;
  name: string;
  sampleProduct: Product;
  rotationProducts: Product[];
  topProducts: Product[];
  count: number;
  maxDiscount: number;
  categories: string[];
  inStockCount: number;
  rawManufacturers: string[];
}

/* ─── Component ─── */
export default function BrandDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { setSelectedBrands, setViewMode } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'b2b'>('login');
  const [rotationIdx, setRotationIdx] = useState(0);
  const [searchParams] = useSearchParams();

  // Category filter inherited from /brands?cat=... — scopes the prev/next nav
  const rawCat = searchParams.get('cat');
  const category: BrandSegment | null = isBrandSegment(rawCat) ? rawCat : null;
  const withCat = (path: string) => (category ? `${path}?cat=${category}` : path);

  // Scroll to top whenever slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [slug]);

  useEffect(() => {
    fetch('/products.json')
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Reset rotation when brand or active category changes
  useEffect(() => { setRotationIdx(0); }, [slug, category]);

  const brandData = useMemo<BrandData | null>(() => {
    if (!slug) return null;
    const targetKey = slug.toUpperCase().replace(/-/g, ' ');

    const brandProducts: Product[] = [];
    const rawManufacturers = new Set<string>();
    for (const p of products) {
      if (!p.manufacturer) continue;
      const raw = p.manufacturer.trim();
      const key = (BRAND_ALIASES[raw] || raw).toUpperCase();
      if (key === targetKey) {
        brandProducts.push(p);
        rawManufacturers.add(raw);
      }
    }

    if (brandProducts.length === 0) return null;

    const inStockProducts = brandProducts.filter((p) => p.inStock && p.img);
    const sampleProduct = inStockProducts[0] || brandProducts.find((p) => p.img) || brandProducts[0];

    // Sorted list (with image) — in-stock first, then by discount.
    // When a category filter is active, restrict to products of that segment
    // so the hero slideshow & top grid never show jewelry on a "watches" view (and vice versa).
    const sorted = [...brandProducts]
      .filter((p) => p.img && (!category || getCategorySegment(p.category) === category))
      .sort((a, b) => {
        if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
        const da = a.price > 0 ? (1 - a.wholesale / a.price) : 0;
        const db = b.price > 0 ? (1 - b.wholesale / b.price) : 0;
        return db - da;
      });

    // Hero rotation — up to 10 products that cycle with crossfade
    const rotationProducts = sorted.slice(0, 10);

    // Top products grid — top 8
    const topProducts = sorted.slice(0, 8);

    const maxDiscount = brandProducts.reduce((max, p) => {
      const d = p.price > 0 ? Math.round((1 - p.wholesale / p.price) * 100) : 0;
      return d > max ? d : max;
    }, 0);

    const categories = Array.from(new Set(brandProducts.map((p) => p.category).filter(Boolean)));

    return {
      key: targetKey,
      name: toDisplayName(targetKey),
      sampleProduct,
      rotationProducts,
      topProducts,
      count: brandProducts.length,
      maxDiscount,
      categories,
      inStockCount: inStockProducts.length,
      rawManufacturers: Array.from(rawManufacturers),
    };
  }, [products, slug, category]);

  // All brand keys (alphabetical by display name) — used for prev/next nav arrows
  // When a category filter is active, restrict to brands that have products in that segment
  const allBrandKeys = useMemo<string[]>(() => {
    const map = new Map<string, { watches: boolean; jewelry: boolean }>();
    for (const p of products) {
      if (!p.manufacturer) continue;
      const raw = p.manufacturer.trim();
      const key = (BRAND_ALIASES[raw] || raw).toUpperCase();
      if (!key) continue;
      if (!map.has(key)) map.set(key, { watches: false, jewelry: false });
      const seg = getCategorySegment(p.category);
      if (seg) map.get(key)![seg] = true;
    }
    const keys = Array.from(map.entries())
      .filter(([, segs]) => !category || segs[category])
      .map(([k]) => k);
    return keys.sort((a, b) => toDisplayName(a).localeCompare(toDisplayName(b), 'cs'));
  }, [products, category]);

  const { prevBrandKey, nextBrandKey } = useMemo(() => {
    if (!brandData || allBrandKeys.length < 2) return { prevBrandKey: null, nextBrandKey: null };
    const idx = allBrandKeys.indexOf(brandData.key);
    if (idx === -1) return { prevBrandKey: null, nextBrandKey: null };
    const len = allBrandKeys.length;
    return {
      prevBrandKey: allBrandKeys[(idx - 1 + len) % len],
      nextBrandKey: allBrandKeys[(idx + 1) % len],
    };
  }, [allBrandKeys, brandData]);

  const goToBrand = (key: string) => {
    const slug = key.toLowerCase().replace(/\s+/g, '-');
    navigate(withCat(`/brands/${slug}`));
  };

  // Crossfade slideshow — cycle through up to 10 products in the hero
  const rotationCount = brandData?.rotationProducts.length ?? 0;
  useEffect(() => {
    if (rotationCount <= 1) return;
    const id = window.setInterval(() => {
      setRotationIdx((i) => (i + 1) % rotationCount);
    }, 3500);
    return () => window.clearInterval(id);
  }, [rotationCount]);

  /* ─── Open brand in catalog: logged-in → activate filter & go to catalog; guest → open auth ─── */
  const handleOpenInCatalog = () => {
    if (!brandData) return;
    if (user) {
      setSelectedBrands(brandData.rawManufacturers);
      setViewMode('catalog');
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    } else {
      setAuthTab('login');
      setAuthOpen(true);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <BackButton to={withCat('/brands')} label="Zpět na seznam značek" />
        <main className="min-h-screen bg-background pt-14 sm:pt-24 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Načítání…</div>
        </main>
      </>
    );
  }

  if (!brandData) {
    return (
      <>
        <Navbar />
        <BackButton to={withCat('/brands')} label="Zpět na seznam značek" />
        <main className="min-h-screen bg-background pt-14 sm:pt-24 flex flex-col items-center justify-center px-6 text-center">
          <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Značka nenalezena</h1>
          <p className="text-muted-foreground mb-6 max-w-md">Tato značka v našem katalogu zatím není.</p>
          <Button onClick={() => navigate(withCat('/brands'))}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Zpět na katalog značek
          </Button>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <BackButton to={withCat('/brands')} label="Zpět na seznam značek" />
      <main className="min-h-screen bg-background pt-14 sm:pt-24">

        {/* ── 1) Hero — brand logo (text placeholder) + sample product on white ── */}
        <section className="py-12 sm:py-20 bg-white border-b border-border">
          <div className="mx-auto max-w-3xl px-6">
            {/* Active category filter indicator — shown when arrived from /brands?cat=... */}
            {category && (
              <Reveal>
                <div className="flex justify-center mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 pl-3 pr-1 py-1 text-[11px] sm:text-xs text-primary">
                    <span className="font-semibold tracking-wide">
                      Procházíte: {SEGMENT_LABEL[category]}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/brands/${slug}`, { replace: true })}
                      className="h-5 w-5 rounded-full inline-flex items-center justify-center hover:bg-primary/10 transition-colors"
                      aria-label="Zrušit filtr"
                      title="Zrušit filtr a procházet všechny značky"
                    >
                      <X className="h-3 w-3" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </Reveal>
            )}

            {/* Brand logo (image from Brandfetch, text fallback if brand not in BRANDS data) + prev/next nav arrows */}
            <Reveal>
              <div className="relative mb-8 sm:mb-12">
                {prevBrandKey && (
                  <button
                    type="button"
                    onClick={() => goToBrand(prevBrandKey)}
                    aria-label={`Předchozí značka: ${toDisplayName(prevBrandKey)}`}
                    title={toDisplayName(prevBrandKey)}
                    className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground backdrop-blur-md bg-white/40 border border-white/60 shadow-md hover:bg-white/70 hover:scale-105 active:scale-95 transition-all"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
                  </button>
                )}
                {nextBrandKey && (
                  <button
                    type="button"
                    onClick={() => goToBrand(nextBrandKey)}
                    aria-label={`Další značka: ${toDisplayName(nextBrandKey)}`}
                    title={toDisplayName(nextBrandKey)}
                    className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground backdrop-blur-md bg-white/40 border border-white/60 shadow-md hover:bg-white/70 hover:scale-105 active:scale-95 transition-all"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
                  </button>
                )}
                <h1 className="text-center flex items-center justify-center min-h-[80px] sm:min-h-[96px] md:min-h-[128px] px-14 sm:px-20">
                  <span className="sr-only">{brandData.name}</span>
                  {(() => {
                    const brand = getBrandByName(brandData.name);
                    if (!brand) {
                      return (
                        <span className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground">
                          {brandData.name}
                        </span>
                      );
                    }
                    return (
                      <BrandLogo
                        name={brand.name}
                        domain={brand.domain}
                        width={600}
                        height={240}
                        className="h-16 sm:h-20 md:h-28 w-auto max-w-[280px] sm:max-w-[400px] md:max-w-[500px] object-contain [mix-blend-mode:multiply]"
                        fallbackClassName="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground"
                      />
                    );
                  })()}
                </h1>
              </div>
            </Reveal>

            {/* Hero slideshow — up to 10 products crossfading every 3.5s */}
            <Reveal delay={120}>
              <div className="relative mx-auto w-56 sm:w-72 md:w-80 aspect-square bg-white">
                {brandData.rotationProducts.map((p, i) => (
                  <div
                    key={p.id}
                    className={`absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-1000 ease-in-out ${i === rotationIdx ? 'opacity-100' : 'opacity-0'}`}
                    aria-hidden={i !== rotationIdx}
                  >
                    <img
                      src={p.img}
                      alt={`${brandData.name} — ${p.name}`}
                      className="max-h-full max-w-full object-contain"
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="relative mt-6 min-h-[2.5rem] sm:min-h-[2.75rem]">
                {brandData.rotationProducts.map((p, i) => (
                  <p
                    key={p.id}
                    className={`absolute inset-x-0 text-center text-xs sm:text-sm text-muted-foreground transition-opacity duration-1000 ease-in-out ${i === rotationIdx ? 'opacity-100' : 'opacity-0'}`}
                    aria-hidden={i !== rotationIdx}
                  >
                    {p.name}
                  </p>
                ))}
              </div>
            </Reveal>

            {/* Primary CTA — open brand in catalog */}
            <Reveal delay={260}>
              <div className="mt-8 flex justify-center">
                <Button
                  size="lg"
                  onClick={handleOpenInCatalog}
                  className="gap-2 px-8 font-semibold"
                >
                  <Search className="h-4 w-4" /> Otevřít {brandData.name} v katalogu
                </Button>
              </div>
              {!user && (
                <p className="text-center text-[11px] text-muted-foreground mt-3">
                  Pro vstup do katalogu se přihlaste nebo vytvořte účet (zdarma).
                </p>
              )}
            </Reveal>
          </div>
        </section>

        {/* ── 2) Stats strip ── */}
        <section className="py-10 sm:py-12 bg-zinc-50 border-b border-border">
          <div className="mx-auto max-w-4xl px-6 grid grid-cols-3 gap-4 text-center">
            <Reveal>
              <div className="font-display text-2xl sm:text-4xl font-black text-primary leading-none">{brandData.count}</div>
              <div className="text-[11px] sm:text-sm text-muted-foreground mt-2">modelů v katalogu</div>
            </Reveal>
            <Reveal delay={80}>
              <div className="font-display text-2xl sm:text-4xl font-black text-primary leading-none">−{brandData.maxDiscount}%</div>
              <div className="text-[11px] sm:text-sm text-muted-foreground mt-2">max. sleva z MOC</div>
            </Reveal>
            <Reveal delay={160}>
              <div className="font-display text-2xl sm:text-4xl font-black text-primary leading-none">{brandData.inStockCount}</div>
              <div className="text-[11px] sm:text-sm text-muted-foreground mt-2">skladem v EU</div>
            </Reveal>
          </div>
        </section>

        {/* ── 3) Story placeholder ── */}
        <section className="py-14 sm:py-20 bg-white border-b border-border">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">O značce</p>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground mb-6">
                Příběh značky {brandData.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                <em className="text-foreground/40 not-italic">[Placeholder]</em> — zde bude unikátní příběh značky {brandData.name}, její historie, hodnoty a co ji odlišuje od konkurence. Doplníme postupně textem na míru každé značce.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── 4) Top products grid (real data from catalog) ── */}
        {brandData.topProducts.length > 0 && (
          <section className="py-14 sm:py-20 bg-zinc-50 border-b border-border">
            <div className="mx-auto max-w-6xl px-6">
              <Reveal>
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 text-center">Vybrané modely</p>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground text-center mb-10">
                  Co od {brandData.name} máme v katalogu
                </h2>
              </Reveal>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {brandData.topProducts.map((p, i) => {
                  const discount = p.price > 0 ? Math.round((1 - p.wholesale / p.price) * 100) : 0;
                  return (
                    <Reveal key={p.id} delay={Math.min(i, 7) * 50}>
                      <div className="group rounded-xl border border-border bg-white overflow-hidden hover:border-primary/30 hover:shadow-md transition-all h-full flex flex-col">
                        <div className="relative aspect-square bg-white overflow-hidden">
                          <img
                            src={p.img}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-300"
                          />
                          {discount > 0 && (
                            <span className="absolute top-1.5 right-1.5 bg-primary text-white text-[9px] sm:text-[10px] font-bold rounded-full px-1.5 sm:px-2 py-0.5">
                              −{discount}%
                            </span>
                          )}
                          {!p.inStock && (
                            <span className="absolute top-1.5 left-1.5 bg-zinc-900/80 text-white text-[9px] sm:text-[10px] font-semibold rounded-full px-1.5 sm:px-2 py-0.5">
                              Na poptávku
                            </span>
                          )}
                        </div>
                        <div className="p-2 sm:p-3 border-t border-border flex-1">
                          <p className="text-[11px] sm:text-xs font-medium leading-tight text-foreground line-clamp-2">{p.name}</p>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
              {brandData.count > brandData.topProducts.length && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    A dalších <strong className="text-foreground">{brandData.count - brandData.topProducts.length}+</strong> modelů v katalogu po přihlášení.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 5) Categories (real data) ── */}
        {brandData.categories.length > 0 && (
          <section className="py-14 sm:py-20 bg-white border-b border-border">
            <div className="mx-auto max-w-4xl px-6">
              <Reveal>
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 text-center">Kolekce</p>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground text-center mb-10">
                  Kategorie {brandData.name}
                </h2>
              </Reveal>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {brandData.categories.map((cat) => (
                  <span key={cat} className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs sm:text-sm font-medium text-foreground/75">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 6) Why us — benefit cards (placeholder text per-brand later) ── */}
        <section className="py-14 sm:py-20 bg-zinc-50 border-b border-border">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 text-center">Proč {brandData.name} u nás</p>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground text-center mb-10">
                Vaše výhody
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Rss, title: 'Možnost automatického feedu', text: 'Automatický XML/CSV feed produktů této značky přímo do vašeho e‑shopu.', action: () => navigate('/feed') },
                { icon: PackageOpen, title: 'Možnost dropshippingu', text: 'Prodávejte tuto značku bez skladu — balíme a expedujeme pod vaší značkou.', action: () => navigate('/dropshipping') },
                { icon: HandCoins, title: 'Možnost nákupu bez registrace', text: 'Soukromý i firemní nákup této značky bez B2B registrace, stačí IČO.', action: () => navigate('/luxury') },
                { icon: Truck, title: 'Skladem v EU', text: 'Expedice do 24–48 h ze středoevropského skladu, doručení do 72 h.', action: handleOpenInCatalog },
              ].map(({ icon: Icon, title, text, action }, i) => (
                <Reveal key={title} delay={Math.min(i, 3) * 70}>
                  <button
                    type="button"
                    onClick={action}
                    className="group text-left w-full h-full rounded-2xl border border-border bg-white p-6 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-md hover:border-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 transition-colors group-hover:bg-primary/15">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display font-black text-lg mb-1.5 text-foreground flex items-center gap-1.5">
                      {title}
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7) FAQ placeholder ── */}
        <section className="py-14 sm:py-20 bg-white border-b border-border">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 text-center">FAQ</p>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground text-center mb-10">
                Časté otázky k {brandData.name}
              </h2>
            </Reveal>
            <div className="space-y-3">
              {[
                { q: `Je možné nakoupit ${brandData.name} bez B2B registrace?`, a: 'Ano. Soukromé i firemní nákupy bez nutnosti IČO řeší swelt.luxury — všechny produkty této značky jsou tam dostupné.' },
                { q: 'Jak rychle expedujete?', a: 'Standardně do 24–48 hodin ze středoevropského skladu. Doručení po celé EU do 72 h.' },
                { q: 'Jsou všechny produkty originální?', a: `Ano. Veškeré modely ${brandData.name} jsou 100 % originální, dodávané přímo od autorizovaných importérů s dokladem o původu.` },
                { q: 'Kde najdu kompletní katalog?', a: 'Kompletní nabídka včetně cen je dostupná po přihlášení B2B partnerům.' },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 60}>
                  <details className="group rounded-2xl border border-border bg-card overflow-hidden">
                    <summary className="cursor-pointer flex items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors list-none">
                      <span>{item.q}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0 ml-3" />
                    </summary>
                    <div className="px-5 pb-4 -mt-1 text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8) Final CTA ── */}
        <section className="py-16 sm:py-24 bg-primary text-primary-foreground">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-4">
                Chcete prodávat {brandData.name}?
              </h2>
              <p className="text-base sm:text-lg opacity-90 mb-8 max-w-xl mx-auto leading-relaxed">
                Zaregistrujte se zdarma jako B2B partner a získejte přístup k velkoobchodním cenám, kompletnímu katalogu a dropshippingu.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="gap-2 px-8 bg-white text-primary hover:bg-white/90" onClick={handleOpenInCatalog}>
                  <Search className="h-4 w-4" /> Otevřít v katalogu
                </Button>
                <Button size="lg" variant="secondary" className="gap-2 px-8" onClick={() => navigate(withCat('/brands'))}>
                  <ArrowLeft className="h-4 w-4" /> Zpět na katalog značek
                </Button>
              </div>
              <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm opacity-80">
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" strokeWidth={3} /> Registrace zdarma</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" strokeWidth={3} /> Schválení do 24 h</li>
                <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5" strokeWidth={3} /> Bez závazků</li>
              </ul>
            </Reveal>
          </div>
        </section>

      </main>

      {/* Auth modal — opened for guests when they click 'Open in catalog' */}
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab={authTab}
        tip={brandData ? `Pro vstup do katalogu ${brandData.name} se nejprve přihlaste.` : undefined}
        onLoginSuccess={() => {
          // After successful login, open the catalog with this brand filter active
          if (brandData) {
            setSelectedBrands(brandData.rawManufacturers);
            setViewMode('catalog');
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
          }
        }}
      />
    </>
  );
}
