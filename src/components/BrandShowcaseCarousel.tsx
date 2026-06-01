import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { getBrandByName } from '@/data/brands';
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel';

/* ─── Brand normalization (same as Brands / BrandDetail) ─── */
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
  'DKNY': 'DKNY', 'Q&Q': 'Q&Q', 'HIP HOP': 'Hip Hop', 'LA PETITE STORY': 'La Petite Story',
  'HUGO BOSS': 'Hugo Boss', 'EMPORIO ARMANI': 'Emporio Armani', 'TOMMY HILFIGER': 'Tommy Hilfiger',
  'CALVIN KLEIN': 'Calvin Klein', 'MICHAEL KORS': 'Michael Kors', 'PIERRE LANNIER': 'Pierre Lannier',
  'ROBERTO CAVALLI': 'Roberto Cavalli', 'JUST CAVALLI': 'Just Cavalli', 'VERSUS VERSACE': 'Versus Versace',
  'MISS SIXTY': 'Miss Sixty', 'MARK MADDOX': 'Mark Maddox', 'BEVERLY HILLS POLO CLUB': 'Beverly Hills Polo Club',
  'MANUEL ZED': 'Manuel Zed', 'ALVIERO MARTINI': 'Alviero Martini', 'CERRUTI 1881': 'Cerruti 1881',
  'DANIEL WELLINGTON': 'Daniel Wellington',
};

function toDisplayName(key: string): string {
  if (DISPLAY_NAMES[key]) return DISPLAY_NAMES[key];
  return key.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Product {
  id: string;
  name: string;
  manufacturer: string;
  img: string;
  price: number;
  wholesale: number;
  inStock: boolean;
}

interface BrandCardData {
  key: string;
  name: string;
  slug: string;
  count: number;
  products: { id: string; name: string; img: string }[];
}

/** Card sizing — identical to the hero banner cards */
const CARD_CLASS =
  'shrink-0 snap-center sm:snap-start w-[80%] sm:w-[45%] lg:w-[30%] h-[380px] sm:h-[420px] lg:h-[440px]';
/** Product crossfade interval — faster than the brand-detail page (3500 ms) */
const ROTATE_MS = 1800;
const AUTO_MS = 5000;

/* ─── Single brand card — logo + crossfading products + CTA ─── */
function BrandCard({ brand }: { brand: BrandCardData }) {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const n = brand.products.length;

  useEffect(() => {
    if (n <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % n), ROTATE_MS);
    return () => clearInterval(id);
  }, [n]);

  const meta = getBrandByName(brand.name);

  return (
    <div
      data-card
      className={`group/card relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-white shadow-md ${CARD_CLASS}`}
    >
      {/* Brand logo */}
      <div className="h-14 sm:h-16 flex items-center justify-center px-6 pt-5 shrink-0">
        {meta ? (
          <BrandLogo
            name={meta.name}
            domain={meta.domain}
            width={400}
            height={160}
            className="max-h-full max-w-[180px] object-contain [mix-blend-mode:multiply]"
            fallbackClassName="font-display text-lg font-black tracking-tight text-foreground"
          />
        ) : (
          <span className="font-display text-lg font-black tracking-tight text-foreground">{brand.name}</span>
        )}
      </div>

      {/* Crossfading product image */}
      <div className="relative flex-1 mx-4 my-2">
        {brand.products.map((p, i) => (
          <div
            key={p.id}
            aria-hidden={i !== idx}
            className={`absolute inset-0 flex items-center justify-center p-2 transition-opacity duration-700 ease-in-out ${
              i === idx ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={p.img} alt={p.name} loading="lazy" draggable={false} className="max-h-full max-w-full object-contain" />
          </div>
        ))}
      </div>

      {/* Crossfading product name */}
      <div className="relative h-5 mx-4 shrink-0">
        {brand.products.map((p, i) => (
          <p
            key={p.id}
            aria-hidden={i !== idx}
            className={`absolute inset-x-0 text-center text-[11px] text-muted-foreground truncate transition-opacity duration-700 ease-in-out ${
              i === idx ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {p.name}
          </p>
        ))}
      </div>

      {/* CTA */}
      <div className="p-4 shrink-0">
        <button
          type="button"
          onClick={() => navigate(`/brands/${brand.slug}`)}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
        >
          Zobrazit značku <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Carousel ─── */
export function BrandShowcaseCarousel() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/products.json')
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch(() => {});
  }, []);

  const brands = useMemo<BrandCardData[]>(() => {
    const map = new Map<string, { count: number; products: { id: string; name: string; img: string }[] }>();
    for (const p of products) {
      if (!p.manufacturer) continue;
      const key = (BRAND_ALIASES[p.manufacturer.trim()] || p.manufacturer.trim()).toUpperCase();
      if (!key) continue;
      if (!map.has(key)) map.set(key, { count: 0, products: [] });
      const e = map.get(key)!;
      e.count++;
      if (p.img && e.products.length < 10) {
        // prefer in-stock images first
        if (p.inStock) e.products.unshift({ id: p.id, name: p.name, img: p.img });
        else e.products.push({ id: p.id, name: p.name, img: p.img });
      }
    }
    return Array.from(map.entries())
      .map(([key, v]) => ({
        key,
        name: toDisplayName(key),
        slug: key.toLowerCase().replace(/\s+/g, '-'),
        count: v.count,
        products: v.products.slice(0, 10),
      }))
      .filter((b) => b.products.length > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 16);
  }, [products]);

  // Render the brand cards 3× for a seamless infinite loop
  const loop = useMemo(() => [...brands, ...brands, ...brands], [brands]);
  const { trackRef, go, start, stop } = useInfiniteCarousel(AUTO_MS, brands.length);

  if (brands.length === 0) return null;

  return (
    <div
      className="relative w-full group"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      onMouseEnter={stop}
      onMouseLeave={start}
    >
      <div
        ref={trackRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth
                   px-3 sm:px-5 lg:px-8 scroll-pl-0 sm:scroll-pl-5 lg:scroll-pl-8 pb-1
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loop.map((brand, i) => (
          <BrandCard key={`${brand.key}-${i}`} brand={brand} />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => go(-1)}
        className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-zinc-700 shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Předchozí"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-zinc-700 shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Další"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
