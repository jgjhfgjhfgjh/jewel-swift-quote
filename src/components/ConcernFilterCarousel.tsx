import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CONCERNS } from '@/data/concerns';
import { useBrandCatalog } from '@/hooks/useBrandCatalog';
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel';

interface ConcernFilterCardData {
  slug: string;
  name: string;
  domain: string;
  /** All raw manufacturer strings of the koncern's brands present in the feed */
  rawManufacturers: string[];
}

/** Logo-only cards — proporčně menší než brand showcase karty v katalogu,
 *  po vzoru homepage „Všechny značky" shelfu (16:9), jen zmenšené. */
const CARD_CLASS =
  'shrink-0 w-[120px] sm:w-[150px] lg:w-[170px] aspect-[16/9]';

/**
 * Koncernový filtr v katalogu — stejný vzor jako brand showcase filtr
 * (bílá iOS karta na zinc-200, modrá fajfka = aktivní), ale karta nese jen
 * logo koncernu. Kliknutí togglene všechny značky koncernu ve filtru.
 */
export function ConcernFilterCarousel({
  selectedBrands = [],
  onToggleConcern,
}: {
  selectedBrands?: string[];
  onToggleConcern?: (rawManufacturers: string[]) => void;
}) {
  const { data: catalog = [] } = useBrandCatalog();

  // Koncern → raw výrobci jeho značek přítomných ve feedu (jen s produkty).
  const cards = useMemo<ConcernFilterCardData[]>(() => {
    return CONCERNS.map((concern) => {
      const present = catalog.filter((e) => concern.brandKeys.includes(e.key) && e.count > 0);
      return {
        slug: concern.slug,
        name: concern.name,
        domain: concern.domain,
        rawManufacturers: present.flatMap((e) => e.rawManufacturers),
        productCount: present.reduce((sum, e) => sum + e.count, 0),
      };
    })
      .filter((c) => c.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
      .map(({ productCount: _unused, ...card }) => card);
  }, [catalog]);

  const selectedSet = useMemo(() => new Set(selectedBrands), [selectedBrands]);
  // Koncern je aktivní, když jsou vybrané VŠECHNY jeho značky — toggle je
  // doplní/odebere najednou, takže částečný výběr fajfku nerozsvítí.
  const isActive = (c: ConcernFilterCardData) =>
    c.rawManufacturers.length > 0 && c.rawManufacturers.every((m) => selectedSet.has(m));

  // Render the cards 3× for a seamless infinite loop
  const loop = useMemo(() => [...cards, ...cards, ...cards], [cards]);
  const { trackRef, go } = useInfiniteCarousel(cards.length);

  if (cards.length === 0) return null;

  return (
    <div className="relative w-full group" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div
        ref={trackRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch]
                   px-3 sm:px-5 lg:px-8 scroll-pl-0 sm:scroll-pl-5 lg:scroll-pl-8 pt-1 pb-2
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loop.map((card, i) => {
          const active = isActive(card);
          return (
            <button
              key={`${card.slug}-${i}`}
              type="button"
              data-card
              aria-pressed={active}
              onClick={() => onToggleConcern?.(card.rawManufacturers)}
              className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm p-3 sm:p-4 cursor-pointer transition-shadow ${CARD_CLASS} ${
                active ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {active && (
                <div className="absolute right-1.5 top-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-blue-100">
                  <Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} />
                </div>
              )}
              <BrandLogo
                name={card.name}
                domain={card.domain}
                width={360}
                height={160}
                className="max-h-full max-w-[85%] object-contain [mix-blend-mode:multiply]"
                fallbackClassName="font-display font-black tracking-tight text-foreground text-xs text-center"
              />
            </button>
          );
        })}
      </div>

      {/* Arrows */}
      <button
        onClick={() => go(-1)}
        className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-none bg-white/70 backdrop-blur-sm text-zinc-700 shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Předchozí"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => go(1)}
        className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-none bg-white/70 backdrop-blur-sm text-zinc-700 shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Další"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
