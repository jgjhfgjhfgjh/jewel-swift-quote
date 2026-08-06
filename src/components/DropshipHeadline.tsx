import { useEffect, useRef, useState } from 'react';

/**
 * Dropshipping headline se „spotlight" efektem: text je v klidu tmavě šedý.
 * Podle pozice kurzoru se v okruhu (radius ≈ 2,6× velikost fontu, tedy zhruba
 * dvě slova) slova rozsvítí do bílé. Barevná věta na konci se bere jako jeden
 * celek — když kurzor zasáhne její okruh, rozsvítí se celá do gradientu
 * (stejný gradient jako H1 na homepage).
 *
 * Na dotykových zařízeních (bez hoveru) se zobrazí rovnou plná verze
 * (bílý text + barevný gradient), aby zůstala čitelná.
 */

const LEAD_WORDS = 'Build your online business and create your freedom'.split(' ');
const COLORED = 'without spending money on stock.';
/* Závěrečná věta za barevnou částí — indexy slov navazují na LEAD_WORDS */
const TAIL_WORDS = "Pay us from customer's money.".split(' ');
const TAIL_OFFSET = LEAD_WORDS.length;
const DIM = 'text-zinc-600';
const GRADIENT =
  'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent';

/* Auto-cyklus (i bez hoveru, po 2 s) rozsvěcí fráze ze šedé do BÍLÉ:
   0 = „online business" → 1 = barevná věta → 2 = „create your freedom"
   → 3 = „Pay us from customer's money."
   Do gradientu se text barví výhradně hoverem. */
const AUTO_ONLINE_BUSINESS = [2, 3];
const AUTO_CREATE_FREEDOM = [5, 6, 7];
const AUTO_TAIL = TAIL_WORDS.map((_, i) => TAIL_OFFSET + i);
const AUTO_PHASES = 4;
const AUTO_INTERVAL_MS = 2000;

export function DropshipHeadline() {
  const pRef = useRef<HTMLParagraphElement | null>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const coloredRef = useRef<HTMLSpanElement | null>(null);
  // Spotlight je zamčený na řádek kurzoru (svisle musí být uvnitř řádkového
  // rámečku slova → žádné přeskakování mezi řádky) a vodorovně má radius na
  // ~dvě slova.
  const rxRef = useRef(175);

  // Zařízení bez hoveru (dotyk) → statická plná verze.
  const [interactive] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(hover: hover)').matches,
  );

  const [litWords, setLitWords] = useState<Set<number>>(() => new Set());
  const [coloredOn, setColoredOn] = useState(false);
  /* 0 = „online business" · 1 = barevná věta · 2 = „create your freedom" */
  const [autoPhase, setAutoPhase] = useState(0);

  /* Auto-cyklus frází (jen desktop se spotlightem; dotyk má plnou verzi
     a uživatelé s vypnutými animacemi klidný text) */
  useEffect(() => {
    if (!interactive) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setAutoPhase((p) => (p + 1) % AUTO_PHASES), AUTO_INTERVAL_MS);
    return () => clearInterval(id);
  }, [interactive]);

  // Vodorovný radius ≈ 3,3× velikost fontu → slovo pod kurzorem + jedno sousední.
  useEffect(() => {
    if (!interactive) return;
    const update = () => {
      const el = pRef.current;
      if (!el) return;
      rxRef.current = parseFloat(getComputedStyle(el).fontSize) * 3.3;
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

    // Slovo kandiduje jen když je kurzor svisle uvnitř jeho řádku; pak rozhoduje
    // vodorovná vzdálenost středů → rozsvítí se ~dvě slova kolem kurzoru.
    const next = new Set<number>();
    wordRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (my >= r.top && my <= r.bottom && Math.abs(mx - (r.left + r.width / 2)) <= rx) {
        next.add(i);
      }
    });
    setLitWords((prev) =>
      prev.size === next.size && [...next].every((i) => prev.has(i)) ? prev : next,
    );

    // Barevná věta = jeden celek (víceřádková): stačí, aby kurzor byl na některém
    // jejím řádku a vodorovně v dosahu radiusu → rozsvítí se celá.
    const rects = coloredRef.current?.getClientRects();
    let on = false;
    if (rects) {
      for (const cr of rects) {
        if (my >= cr.top && my <= cr.bottom && Math.max(cr.left - mx, 0, mx - cr.right) <= rx) {
          on = true;
          break;
        }
      }
    }
    setColoredOn((prev) => (prev === on ? prev : on));
  };

  const handleLeave = () => {
    if (!interactive) return;
    setLitWords((prev) => (prev.size ? new Set() : prev));
    setColoredOn(false);
  };

  const autoLit = (i: number) =>
    (autoPhase === 0 && AUTO_ONLINE_BUSINESS.includes(i)) ||
    (autoPhase === 2 && AUTO_CREATE_FREEDOM.includes(i)) ||
    (autoPhase === 3 && AUTO_TAIL.includes(i));

  const wordClass = (i: number) =>
    `transition-colors duration-500 ${!interactive || litWords.has(i) || autoLit(i) ? 'text-white' : DIM}`;
  /* hover = gradient; auto-cyklus rozsvěcí větu jen do bílé */
  const coloredClass = `transition-colors duration-500 ${
    !interactive || coloredOn ? GRADIENT : autoPhase === 1 ? 'text-white' : DIM
  }`;

  return (
    <p
      ref={pRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="cursor-pointer select-none font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.5rem,calc((100vw-120px)/22),3.5rem)]"
    >
      {LEAD_WORDS.map((w, i) => (
        <span
          key={i}
          ref={(el) => (wordRefs.current[i] = el)}
          className={wordClass(i)}
        >
          {w}{' '}
        </span>
      ))}
      <span ref={coloredRef} className={coloredClass}>
        {COLORED}
      </span>
      {TAIL_WORDS.map((w, i) => (
        <span
          key={TAIL_OFFSET + i}
          ref={(el) => (wordRefs.current[TAIL_OFFSET + i] = el)}
          className={wordClass(TAIL_OFFSET + i)}
        >
          {' '}{w}
        </span>
      ))}
    </p>
  );
}
