import { useEffect, useRef, useState } from 'react';

/**
 * Returns `true` when the user is scrolling down past `threshold` pixels.
 * Returns `false` immediately on any upward scroll.
 *
 * Mirrors the auto-hide behavior of the global Navbar so that any element
 * positioned just below it (e.g. a sticky filter/search bar) can hide and
 * reveal together with the navbar — no orphaned gap is left below a hidden
 * navbar.
 */
export function useScrollHide(threshold: number = 50): boolean {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > threshold);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return hidden;
}
