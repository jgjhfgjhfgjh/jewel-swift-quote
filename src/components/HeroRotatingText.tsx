import { useEffect, useState } from 'react';

/** Rotating hero phrases — typed out, held, deleted, next. */
const PHRASES = [
  'Launch Faster',
  'Sell More',
  'Everywhere your customers scroll.',
  'Grow Around Europe',
  'Automate and Save Hours',
];

const TYPE_MS = 65;
const DELETE_MS = 30;
const HOLD_MS = 1800;
const GAP_MS = 300;

/**
 * Gradient typewriter line under the hero headline (blue → cyan → green,
 * jako v předloze). Rendered aria-hidden — the static H1 carries the meaning.
 * Font zůstává v plné velikosti H1 — delší fráze se zalomí na další řádek
 * (rezervu dvou řádků drží min-h na kontejneru v Index.tsx, aby blok neskákal).
 */
export function HeroRotatingText({ className = '' }: { className?: string }) {
  const [idx, setIdx] = useState(0);
  const [len, setLen] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = PHRASES[idx];
    let t: number;
    if (!deleting && len < phrase.length) {
      t = window.setTimeout(() => setLen((l) => l + 1), TYPE_MS);
    } else if (!deleting) {
      t = window.setTimeout(() => setDeleting(true), HOLD_MS);
    } else if (len > 0) {
      t = window.setTimeout(() => setLen((l) => l - 1), DELETE_MS);
    } else {
      t = window.setTimeout(() => {
        setDeleting(false);
        setIdx((i) => (i + 1) % PHRASES.length);
      }, GAP_MS);
    }
    return () => clearTimeout(t);
  }, [len, deleting, idx]);

  return (
    <span aria-hidden className={className}>
      <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
        {PHRASES[idx].slice(0, len) || ' '}
      </span>
      <span className="ml-0.5 animate-pulse font-thin text-zinc-300">|</span>
    </span>
  );
}
