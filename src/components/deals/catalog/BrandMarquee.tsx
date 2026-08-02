import { useMemo } from 'react';
import { BrandLogo } from '@/components/BrandLogo';
import { useBrandCatalog } from '@/hooks/useBrandCatalog';
import { sortByBrandPriority } from '@/lib/brandOrder';

/**
 * Nekonečně běžící pás log značek pod headerem — reference „logo row" ze
 * SaaS landing pages: loga sjednocená do šedobílých siluet s průhledností,
 * plynulý CSS marquee (žádný JS — jede i bez rAF), fade na okrajích přes
 * mask-image.
 *
 * Zdroj: CELÝ velkoobchodní katalog (useBrandCatalog — feed-bound, stejný
 * jako karusely značek na homepage), NE dealy — marquee říká „tohle všechno
 * u nás je", filtrační dlaždice níže filtrují jen dealy. Značky bez domény
 * jedou jako textová silueta ve stejné šedé.
 *
 * Siluety: brightness(0) → černá silueta, invert(1) → bílá; opacity dodá
 * tlumený šedý vzhled na tmavé ploše.
 */
export function BrandMarquee({ all = false }: {
  /** true = všechna loga z katalogu (homepage hero); default jen značky s produkty (/deals). */
  all?: boolean;
}) {
  const { data: catalog = [] } = useBrandCatalog();
  // Prioritní značky první (stejné řazení jako zbytek webu).
  const list = useMemo(
    () => sortByBrandPriority(all ? catalog : catalog.filter((b) => b.count > 0)),
    [catalog, all],
  );

  if (list.length < 4) return null;

  // Dvě identické kopie + posun o -50 % šířky = bezešvá smyčka; rychlost
  // drží tempo nezávisle na počtu log (delší pás = delší perioda).
  const copies = [0, 1] as const;
  const duration = Math.max(40, Math.round(list.length * 2.2));

  return (
    <div
      className="relative overflow-hidden py-2
                 [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]"
    >
      <style>{'@keyframes gbd-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}'}</style>
      <div
        className="flex w-max items-center gap-12 [animation:gbd-marquee_60s_linear_infinite] motion-reduce:[animation:none] sm:gap-16"
        style={{ animationDuration: `${duration}s` }}
      >
        {copies.map((copy) => (
          <div key={copy} className="flex items-center gap-12 sm:gap-16" aria-hidden={copy === 1}>
            {list.map((b) =>
              b.domain ? (
                <BrandLogo
                  key={`${copy}-${b.key}`}
                  name={b.name}
                  domain={b.domain}
                  width={200}
                  height={80}
                  className="h-5 w-auto max-w-[110px] shrink-0 object-contain opacity-40 [filter:brightness(0)_invert(1)] sm:h-6 sm:max-w-[130px]"
                  fallbackClassName="shrink-0 whitespace-nowrap text-sm font-semibold tracking-wide text-white/40"
                />
              ) : (
                <span
                  key={`${copy}-${b.key}`}
                  className="shrink-0 whitespace-nowrap text-sm font-semibold tracking-wide text-white/40"
                >
                  {b.name}
                </span>
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
