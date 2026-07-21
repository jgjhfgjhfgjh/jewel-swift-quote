import { useEffect, useRef, useState } from 'react';

/**
 * Výčet značek pod showcase nadpisem se stejným „spotlight" mechanismem jako
 * DropshipHeadline: kurzor v okruhu (~2 slova, zamčeno na řádek) rozsvěcí
 * slova — tady do barevného gradientu z H1 (na bílé kartě by bílá nebyla
 * vidět). Na dotykových zařízeních zůstává klidný šedý text bez efektu.
 */

const WORDS =
  'Swarovski, Pandora, Tommy Hilfiger, Guess, Versace, Armani and more than 60 other luxury brands.'.split(' ');
const GRADIENT =
  'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent';

export function BrandsSpotlightLine() {
  const pRef = useRef<HTMLParagraphElement | null>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  // Vodorovný radius ≈ 4,5× velikost fontu (slovo pod kurzorem + sousední —
  // názvy značek jsou delší slova než běžný text, proto větší faktor než u
  // DropshipHeadline); svisle je spotlight zamčený na řádek kurzoru.
  const rxRef = useRef(90);

  const [interactive] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(hover: hover)').matches,
  );
  const [lit, setLit] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    if (!interactive) return;
    const update = () => {
      const el = pRef.current;
      if (!el) return;
      rxRef.current = parseFloat(getComputedStyle(el).fontSize) * 4.5;
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [interactive]);

  const handleMove = (e: React.MouseEvent) => {
    if (!interactive) return;
    const mx = e.clientX;
    const my = e.clientY;
    const rx = rxRef.current;
    const next = new Set<number>();
    wordRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (my >= r.top && my <= r.bottom && Math.abs(mx - (r.left + r.width / 2)) <= rx) {
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

  return (
    <p
      ref={pRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="mt-4 cursor-pointer select-none font-sans text-base font-light leading-relaxed text-muted-foreground sm:mt-5 sm:text-xl"
    >
      {WORDS.map((w, i) => (
        <span
          key={i}
          ref={(el) => (wordRefs.current[i] = el)}
          className={`transition-colors duration-200 ${lit.has(i) ? GRADIENT : ''}`}
        >
          {w}{' '}
        </span>
      ))}
    </p>
  );
}
