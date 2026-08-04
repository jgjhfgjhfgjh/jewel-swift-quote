import { useEffect, useMemo, useState } from 'react';
import { BrandLogo } from '@/components/BrandLogo';
import { useBrandCatalog } from '@/hooks/useBrandCatalog';
import { sortByBrandPriority } from '@/lib/brandOrder';

/**
 * Střídající se VELKÉ logo značky — ústřední prvek hero /deals. Světlá
 * varianta: loga v jednotné šedé (grayscale + multiply na bílé ploše),
 * plynulý crossfade s jemným scale (opacity + transform, žádný layout
 * shift). Kurátorský výběr = prioritní značky s logem, ne celý katalog.
 *
 * Vyplní rodiče (absolute inset-0 vrstvy) — rodič určuje plochu výjevu.
 */
export function BrandSpotlight({ intervalMs = 3200 }: { intervalMs?: number }) {
  const { data: catalog = [] } = useBrandCatalog();
  const list = useMemo(
    () => sortByBrandPriority(catalog.filter((b) => b.count > 0 && b.domain)).slice(0, 14),
    [catalog],
  );
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % list.length), intervalMs);
    return () => clearInterval(t);
  }, [list.length, intervalMs]);

  if (list.length === 0) return null;

  const prev = (idx - 1 + list.length) % list.length;
  const next = (idx + 1) % list.length;

  return (
    <div className="relative h-full w-full" aria-hidden>
      {list.map((b, i) => {
        const active = i === idx;
        // Montované drží jen aktivní + sousedi: předchozí kvůli crossfade
        // (fade-out přes transition), následující jako preload obrázku.
        if (!active && i !== prev && i !== next) return null;
        return (
          <div
            key={b.key}
            className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-out motion-reduce:transition-none ${
              active ? 'scale-100 opacity-100' : 'scale-[0.96] opacity-0'
            }`}
          >
            <BrandLogo
              name={b.name}
              domain={b.domain!}
              width={560}
              height={240}
              lowPriority
              className="max-h-20 w-auto max-w-[82%] object-contain opacity-70 [filter:grayscale(1)] [mix-blend-mode:multiply] sm:max-h-28 lg:max-h-36"
              fallbackClassName="text-center text-3xl font-medium tracking-tighter text-slate-300 sm:text-4xl"
            />
          </div>
        );
      })}
    </div>
  );
}
