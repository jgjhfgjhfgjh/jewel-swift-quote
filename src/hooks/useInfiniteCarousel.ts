import { useCallback, useEffect, useRef } from 'react';

/**
 * Seamless infinite carousel for a native horizontal scroll track.
 *
 * Render the items **three times** in the track (each card tagged `data-card`)
 * and pass the ORIGINAL item count. The hook keeps the scroll position inside
 * the middle copy: whenever it drifts more than half a set toward either edge
 * it instantly shifts by exactly one set width (which is visually identical),
 * so scrolling/auto-advancing never hits a hard end — it loops forever.
 */
export function useInfiniteCarousel(autoMs: number, itemCount: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Exact pixel width of one item-set (copy), measured from the cards.
  const getSet = useCallback((el: HTMLDivElement) => {
    const cards = el.querySelectorAll<HTMLElement>('[data-card]');
    if (cards.length < itemCount + 1 || itemCount === 0) return 0;
    return cards[itemCount].offsetLeft - cards[0].offsetLeft;
  }, [itemCount]);

  const wrap = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const set = getSet(el);
    if (set <= 0) return;
    if (el.scrollLeft > set * 1.5) el.scrollLeft -= set;
    else if (el.scrollLeft < set * 0.5) el.scrollLeft += set;
  }, [getSet]);

  const go = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    wrap(); // re-centre into the middle copy (instant) before animating
    const cards = el.querySelectorAll<HTMLElement>('[data-card]');
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : el.clientWidth;
    el.scrollBy({ left: step * dir, behavior: 'smooth' });
  }, [wrap]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const start = useCallback(() => {
    stop();
    intervalRef.current = setInterval(() => go(1), autoMs);
  }, [autoMs, go, stop]);

  // Start in the middle copy so it can loop in both directions.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || itemCount === 0) return;
    const raf = requestAnimationFrame(() => {
      const set = getSet(el);
      if (set > 0) el.scrollLeft = set;
    });
    return () => cancelAnimationFrame(raf);
  }, [itemCount, getSet]);

  // Wrap once scrolling settles — handles manual touch swipes.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      if (idleRef.current) clearTimeout(idleRef.current);
      idleRef.current = setTimeout(wrap, 120);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, [wrap]);

  // Auto-advance
  useEffect(() => {
    if (itemCount === 0) return;
    start();
    return stop;
  }, [itemCount, start, stop]);

  return { trackRef, go, start, stop };
}
