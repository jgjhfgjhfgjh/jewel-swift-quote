import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Search, ArrowRight, Package } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { useScrollHide } from '@/hooks/useScrollHide';

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

/* ─── Brand name normalization ─── */
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

// Brands with specific capitalization overrides
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
  return key
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
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

interface BrandInfo {
  key: string;
  name: string;
  img: string;
  count: number;
}

/* ─── Component ─── */
export default function Brands() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jumpValue, setJumpValue] = useState<string>('');
  const navigate = useNavigate();
  const { setGatewayOpen: openAuth } = useStore();
  const navHidden = useScrollHide();

  // Scroll to top on mount, or to specific brand if URL has hash like #tommy-hilfiger
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, []);

  useEffect(() => {
    fetch('/products.json')
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // After products load & render, scroll to anchored brand card if hash present
  useEffect(() => {
    if (loading) return;
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    // Wait a tick for the grid to paint
    const timer = setTimeout(() => {
      const el = document.getElementById(`brand-${hash}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2'), 2500);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [loading]);

  const brands = useMemo<BrandInfo[]>(() => {
    const map = new Map<string, { imgs: string[]; count: number }>();

    for (const p of products) {
      if (!p.manufacturer) continue;
      const raw = p.manufacturer.trim();
      const key = (BRAND_ALIASES[raw] || raw).toUpperCase();
      if (!key) continue;

      if (!map.has(key)) {
        map.set(key, { imgs: [], count: 0 });
      }
      const entry = map.get(key)!;
      entry.count++;
      if (p.img && p.inStock && entry.imgs.length < 1) entry.imgs.push(p.img);
      else if (p.img && !p.inStock && entry.imgs.length === 0) entry.imgs.push(p.img);
    }

    return Array.from(map.entries())
      .map(([key, v]) => ({
        key,
        name: toDisplayName(key),
        img: v.imgs[0] || '',
        count: v.count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const filtered = useMemo(() => {
    if (!search.trim()) return brands;
    const q = search.toLowerCase();
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, search]);

  // Brands sorted alphabetically by display name for the jump dropdown
  const brandsByName = useMemo(
    () => [...brands].sort((a, b) => a.name.localeCompare(b.name, 'cs')),
    [brands],
  );

  const handleJumpToBrand = (key: string) => {
    setJumpValue(key);
    const slug = key.toLowerCase().replace(/\s+/g, '-');
    const scrollAndHighlight = () => {
      const el = document.getElementById(`brand-${slug}`);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      setTimeout(() => el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2'), 2500);
    };
    // If filter hides the brand, clear search first so the card is rendered
    if (search.trim() && !brands.find((b) => b.key === key)?.name.toLowerCase().includes(search.toLowerCase())) {
      setSearch('');
      setTimeout(scrollAndHighlight, 100);
    } else {
      scrollAndHighlight();
    }
    // Reset the controlled Select so the same brand can be picked again
    setTimeout(() => setJumpValue(''), 300);
  };

  return (
    <>
      <Navbar />
      <BackButton />
      <main className="min-h-screen bg-background pt-14 sm:pt-24">

        {/* ── Hero ── */}
        <section className="py-16 sm:py-20 bg-white border-b border-border text-center">
          <div className="mx-auto max-w-3xl px-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] tracking-[0.2em] uppercase text-primary font-semibold mb-4">
              <Award className="h-3.5 w-3.5" /> Katalog značek
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-black text-foreground mb-3 leading-tight">
              70+ světových značek.<br className="hidden sm:block" /> V jednom místě.
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
              Prémiové hodinky, šperky a doplňky dostupné od 1 kusu za velkoobchodní ceny.
            </p>
          </div>
        </section>

        {/* ── Search bar — sticky pod navbarem, schovava se s nim ── */}
        <div
          className={`sticky top-14 sm:top-24 z-30 bg-white/95 backdrop-blur border-b border-border py-3
            transition-transform duration-500 ease-in-out will-change-transform
            ${navHidden
              ? '-translate-y-[calc(100%+3.5rem)] sm:-translate-y-[calc(100%+6rem)]'
              : 'translate-y-0'}`}
        >
          <div className="mx-auto max-w-6xl px-6 flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Search input */}
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Hledat značku…"
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-zinc-50 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40"
              />
            </div>

            {/* Jump-to-brand dropdown — alphabetical, scrolls to card on select */}
            {!loading && brandsByName.length > 0 && (
              <Select value={jumpValue} onValueChange={handleJumpToBrand}>
                <SelectTrigger className="w-[180px] rounded-xl bg-zinc-50 border-border text-sm">
                  <SelectValue placeholder="Skočit na značku…" />
                </SelectTrigger>
                <SelectContent className="max-h-[60vh]">
                  {brandsByName.map((b) => (
                    <SelectItem key={b.key} value={b.key} className="text-sm">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Count — pushed to the right on wider screens */}
            {!loading && (
              <span className="text-sm text-muted-foreground hidden sm:block sm:ml-auto">
                {filtered.length} značek
              </span>
            )}
          </div>
        </div>

        {/* ── Brand grid ── */}
        <section className="py-14 sm:py-20 bg-white">
          <div className="mx-auto max-w-6xl px-6">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-14">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-full aspect-square rounded-2xl bg-zinc-100 animate-pulse" />
                    <div className="mt-4 h-3 w-2/3 bg-zinc-100 animate-pulse rounded-full" />
                    <div className="mt-2 h-2.5 w-1/2 bg-zinc-100 animate-pulse rounded-full" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Žádná značka nenalezena</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-14">
                {filtered.map((brand, i) => (
                  <Reveal key={brand.key} delay={Math.min(i % 10, 9) * 40}>
                    <button
                      type="button"
                      onClick={() => navigate(`/brands/${brand.key.toLowerCase().replace(/\s+/g, '-')}`)}
                      id={`brand-${brand.key.toLowerCase().replace(/\s+/g, '-')}`}
                      className="group flex flex-col items-center text-center w-full cursor-pointer scroll-mt-28 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      {/* Image — anchored to bottom so all images share a baseline */}
                      <div className="w-full aspect-square flex items-end justify-center p-3 sm:p-4">
                        {brand.img ? (
                          <img
                            src={brand.img}
                            alt={brand.name}
                            loading="lazy"
                            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <span className="text-4xl font-black text-zinc-200">
                            {brand.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Info — consistent spacing from image baseline */}
                      <div className="mt-3 sm:mt-4 px-2">
                        <p className="font-bold text-sm sm:text-base text-foreground leading-tight transition-colors group-hover:text-primary">
                          {brand.name}
                        </p>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                          {brand.count} modelů
                        </p>
                      </div>
                    </button>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── CTA for non-logged-in ── */}
        <section className="py-14 sm:py-20 bg-zinc-50 border-t border-border">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <Reveal>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Připraveni začít?
              </h2>
              <p className="text-muted-foreground mb-8">
                Zaregistrujte se zdarma a získejte okamžitý přístup k celému katalogu s velkoobchodními cenami.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="gap-2 px-8" onClick={() => openAuth(true)}>
                  Vytvořit B2B účet <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2 px-8" onClick={() => navigate('/')}>
                  Zpět na hlavní stránku
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

      </main>
    </>
  );
}
