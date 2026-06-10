import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Seamless infinite carousel for a native horizontal scroll track.
 *
 * Render the items **three times** in the track (each card tagged `data-card`)
 * and pass the ORIGINAL item count. The hook keeps the scroll position inside
 * the middle copy: whenever it drifts more than half a set toward either edge
 * it instantly shifts by exactly one set width (which is visually identical),
 * so scrolling/arrows never hit a hard end — it loops forever.
 *
 * No auto-advance — movement is driven only by the user (swipe) or `go()`.
 */
export function useInfiniteCarousel(itemCount: number) {
  const trackRef = useRef<HTMLDivElement>(null);
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

  // Start in the middle copy so it can loop in both directions. Synchronous
  // (no rAF) — rAF can be throttled in background/occluded windows and the
  // track would start at the hard left edge, where swiping back jams.
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el || itemCount === 0) return;
    const set = getSet(el);
    if (set > 0) el.scrollLeft = set;
  }, [itemCount, getSet]);

  // Wrap on scroll. Near the physical track edges wrap immediately so touch
  // momentum never slams into the end mid-swipe; otherwise wait until the
  // scroll settles (instant jumps mid-momentum are visually identical but
  // can cut the momentum short, so they're reserved for the danger zone).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const set = getSet(el);
      if (set > 0) {
        const margin = (set / itemCount) * 2; // ~two cards from the edge
        const max = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft < margin || el.scrollLeft > max - margin) wrap();
      }
      if (idleRef.current) clearTimeout(idleRef.current);
      idleRef.current = setTimeout(wrap, 120);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, [wrap, getSet, itemCount]);

  return { trackRef, go };
}
