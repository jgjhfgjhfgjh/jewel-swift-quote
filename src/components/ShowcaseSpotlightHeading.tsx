import { useRef, useState } from 'react';

/**
 * Showcase nadpis + výčet značek s jedním společným „spotlight" efektem
 * (stejný princip jako DropshipHeadline): kurzor v okruhu rozsvěcí slova do
 * gradientu z H1 — radius bere nadpis i výčet značek.
 *
 * Bez problikávání: background-image (gradient) nejde animovat, proto má
 * každé slovo dvě vrstvy — základní barvu a gradientovou kopii — a přepínají
 * se plynulou opacity transition (cross-fade).
 *
 * Radius se odvozuje z výšky řádku konkrétního slova (~3,2×), takže u velkého
 * nadpisu je úměrně větší než u malého výčtu; svisle je zamčený na řádek.
 */

const H2_WORDS = 'Sell the brands people already want.'.split(' ');
const BRAND_WORDS =
  'Swarovski, Pandora, Tommy Hilfiger, Guess, Versace, Armani and more than 60 other luxury brands.'.split(' ');
const GRADIENT =
  'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent';

export function ShowcaseSpotlightHeading() {
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [interactive] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(hover: hover)').matches,
  );
  const [lit, setLit] = useState<Set<number>>(() => new Set());

  const handleMove = (e: React.MouseEvent) => {
    if (!interactive) return;
    const mx = e.clientX;
    const my = e.clientY;
    const next = new Set<number>();
    wordRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      // radius z výšky řádku slova → škáluje s velikostí fontu daného bloku
      if (my >= r.top && my <= r.bottom && Math.abs(mx - (r.left + r.width / 2)) <= r.height * 3.2) {
        next.add(i);
      }
    });
    setLit((prev) =>
      prev.size === next.size && [...next].every((i) => prev.has(i)) ? prev : next,
    );
  };

  const handleLeave = () => {
    if (!interactive) return;
    setLit((prev) => (prev.size ? new Set() : prev));
  };

  /** Slovo se dvěma vrstvami (základní + gradient) cross-fadovanými přes opacity */
  const word = (text: string, id: number, baseColor: string) => (
    <span
      key={id}
      ref={(el) => (wordRefs.current[id] = el)}
      className="relative inline-block whitespace-pre"
    >
      <span className={`${baseColor} transition-opacity duration-300 ${lit.has(id) ? 'opacity-0' : 'opacity-100'}`}>
        {text}
      </span>
      <span
        aria-hidden
        className={`absolute inset-0 ${GRADIENT} transition-opacity duration-300 ${lit.has(id) ? 'opacity-100' : 'opacity-0'}`}
      >
        {text}
      </span>
    </span>
  );

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={interactive ? 'cursor-pointer select-none' : ''}
    >
      <h2 className="font-sans font-extralight tracking-tight leading-[1.1] text-[clamp(1.5rem,calc((100vw-120px)/22),3.5rem)] text-foreground">
        {H2_WORDS.map((w, i) => [word(w, i, 'text-foreground'), ' '])}
      </h2>
      <p className="mt-4 font-sans text-base font-light leading-relaxed text-muted-foreground sm:mt-5 sm:text-xl">
        {BRAND_WORDS.map((w, i) => [word(w, H2_WORDS.length + i, 'text-muted-foreground'), ' '])}
      </p>
    </div>
  );
}
