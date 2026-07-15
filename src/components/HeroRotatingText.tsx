import { useEffect, useState } from 'react';

/** Rotating hero phrases — typed out, held, deleted, next.
 *  `variants`: po napsání a podržení base věty se za ní postupně vystřídají
 *  (typewriter) jednotlivé varianty, pak se smaže vše a jede další fráze. */
type Phrase = { text: string; variants?: string[] };

const PHRASES: Phrase[] = [
  { text: 'Launch Faster' },
  { text: 'Sell More' },
  { text: 'Everywhere your customers scroll. ', variants: ['E-shop', 'TikTok', 'AI Chat', 'Facebook'] },
  { text: 'Grow Around Europe' },
  { text: 'Automate and Save Hours' },
];

const TYPE_MS = 65;
const DELETE_MS = 30;
const HOLD_MS = 1800;
const GAP_MS = 300;

type Stage = 'type' | 'vtype' | 'vdel' | 'del';

/**
 * Gradient typewriter line under the hero headline (blue → cyan → green,
 * jako v předloze). Rendered aria-hidden — the static H1 carries the meaning.
 * Dlouhá věta s variantami se vykresluje v 0.55em, aby se vešla na řádek.
 */
export function HeroRotatingText({ className = '' }: { className?: string }) {
  const [idx, setIdx] = useState(0);
  const [len, setLen] = useState(0);   // napsané znaky base textu
  const [vIdx, setVIdx] = useState(0); // aktuální varianta
  const [vLen, setVLen] = useState(0); // napsané znaky varianty
  const [stage, setStage] = useState<Stage>('type');

  useEffect(() => {
    const { text, variants } = PHRASES[idx];
    let t: number;

    if (stage === 'type') {
      if (len < text.length) t = window.setTimeout(() => setLen((l) => l + 1), TYPE_MS);
      else t = window.setTimeout(() => setStage(variants ? 'vtype' : 'del'), HOLD_MS);
    } else if (stage === 'vtype' && variants) {
      if (vLen < variants[vIdx].length) t = window.setTimeout(() => setVLen((l) => l + 1), TYPE_MS);
      else t = window.setTimeout(() => setStage('vdel'), HOLD_MS);
    } else if (stage === 'vdel' && variants) {
      if (vLen > 0) t = window.setTimeout(() => setVLen((l) => l - 1), DELETE_MS);
      else if (vIdx < variants.length - 1) {
        t = window.setTimeout(() => { setVIdx((i) => i + 1); setStage('vtype'); }, GAP_MS);
      } else {
        setStage('del'); // po poslední variantě plynule umazat i base větu
      }
    } else {
      if (len > 0) t = window.setTimeout(() => setLen((l) => l - 1), DELETE_MS);
      else t = window.setTimeout(() => {
        setVIdx(0);
        setIdx((i) => (i + 1) % PHRASES.length);
        setStage('type');
      }, GAP_MS);
    }
    return () => clearTimeout(t);
  }, [stage, len, vLen, idx, vIdx]);

  const phrase = PHRASES[idx];
  const shown = phrase.text.slice(0, len) + (phrase.variants ? phrase.variants[vIdx].slice(0, vLen) : '');

  return (
    <span
      aria-hidden
      className={`inline-flex min-h-[1.15em] items-baseline ${className}`}
      // dlouhá věta by v plné velikosti přetekla viewport; menší font drží řádek
      // (výšku řádku určuje strut rodičovského divu, takže blok neskáče)
      style={phrase.variants ? { fontSize: '0.55em' } : undefined}
    >
      <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
        {shown || ' '}
      </span>
      <span className="ml-0.5 animate-pulse font-thin text-zinc-300">|</span>
    </span>
  );
}
