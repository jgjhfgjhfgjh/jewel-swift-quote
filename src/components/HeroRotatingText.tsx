import { useEffect, useState } from 'react';
import PerWordCrossfade from '@/components/ui/per-word-crossfade';

/** Rotating hero phrases — revealed word by word, held, then swapped. */
const PHRASES = [
  'Launch Faster',
  'Sell More',
  'Everywhere',
  'Grow Around Europe',
  'Connect to AI Agents',
  'Automate and Save Hours',
];

/** Musí sedět s DURATION_S v PerWordCrossfade (0.7 s). */
const REVEAL_MS = 700;
const STAGGER_MS = 90;
/** Jak dlouho fráze zůstane stát, když doběhne náběh. */
const HOLD_MS = 2400;

/**
 * Gradient line under the hero headline (blue → cyan → green). Fráze se
 * nepíšou po písmenech, ale nabíhají po SLOVECH (PerWordCrossfade) — stejný
 * klidný rytmus jako H1 nad nimi. Rendered aria-hidden — the static H1
 * carries the meaning.
 *
 * `key={idx}` je záměr: přemountováním se náběh přehraje znovu, jinak by
 * druhá a další fráze naskočily bez animace.
 */
export function HeroRotatingText({
  className = '',
  startDelay = 0,
}: {
  className?: string;
  /** Odklad první fráze, ať nenaskočí dřív než headline nad ní. */
  startDelay?: number;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const words = PHRASES[idx].split(' ').length;
    const lifetime =
      (idx === 0 ? startDelay : 0) + (words - 1) * STAGGER_MS + REVEAL_MS + HOLD_MS;
    const t = window.setTimeout(() => setIdx((i) => (i + 1) % PHRASES.length), lifetime);
    return () => clearTimeout(t);
  }, [idx, startDelay]);

  return (
    <span aria-hidden className={`inline-flex min-h-[1.15em] items-baseline ${className}`}>
      <PerWordCrossfade
        key={idx}
        delay={idx === 0 ? startDelay : 0}
        stagger={STAGGER_MS}
        className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent"
      >
        {PHRASES[idx]}
      </PerWordCrossfade>
    </span>
  );
}
