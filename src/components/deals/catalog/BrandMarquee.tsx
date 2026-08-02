import { BrandLogo } from '@/components/BrandLogo';

export interface MarqueeBrand {
  key: string;
  name: string;
  domain?: string;
}

/**
 * Nekonečně běžící pás log značek pod headerem — reference „logo row" ze
 * SaaS landing pages: loga sjednocená do šedobílých siluet s průhledností,
 * plynulý CSS marquee (žádný JS — jede i bez rAF), fade na okrajích přes
 * mask-image.
 *
 * Siluety: brightness(0) → černá silueta, invert(1) → bílá; opacity dodá
 * ten tlumený šedý vzhled na tmavé ploše. Loga bez staženého obrázku
 * spadnou na textový fallback ve stejné šedé.
 */
export function BrandMarquee({ brands }: { brands: MarqueeBrand[] }) {
  const list = brands.filter((b) => b.domain);
  if (list.length < 4) return null;

  // Dvě identické kopie + posun o -50 % šířky = bezešvá smyčka.
  const copies = [0, 1] as const;

  return (
    <div
      className="relative overflow-hidden py-2
                 [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]"
    >
      <style>{'@keyframes gbd-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}'}</style>
      <div className="flex w-max items-center gap-12 [animation:gbd-marquee_48s_linear_infinite] motion-reduce:[animation:none] sm:gap-16">
        {copies.map((copy) => (
          <div key={copy} className="flex items-center gap-12 sm:gap-16" aria-hidden={copy === 1}>
            {list.map((b) => (
              <BrandLogo
                key={`${copy}-${b.key}`}
                name={b.name}
                domain={b.domain!}
                width={200}
                height={80}
                className="h-5 w-auto max-w-[110px] shrink-0 object-contain opacity-40 [filter:brightness(0)_invert(1)] sm:h-6 sm:max-w-[130px]"
                fallbackClassName="shrink-0 whitespace-nowrap text-sm font-semibold tracking-wide text-white/40"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
