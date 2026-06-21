import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeals } from '@/hooks/useDeals';
import { dealIsLive, type Deal } from '@/lib/deals';
import { BrandLogo } from '@/components/BrandLogo';
import { CONCERNS, getConcernForBrandKey } from '@/data/concerns';
import { toBrandKey } from '@/lib/brandNormalize';
import { CountdownTimer } from '@/components/deals/CountdownTimer';

/** The watch concern behind a deal — by supplier/title name, else from brands. */
function concernFor(deal: Deal) {
  const hay = `${deal.supplier} ${deal.title}`.toLowerCase();
  const byName = CONCERNS.find((c) => hay.includes(c.name.toLowerCase()));
  if (byName) return byName;
  for (const b of deal.brands) {
    const c = getConcernForBrandKey(toBrandKey(b));
    if (c) return c;
  }
  return null;
}

/**
 * Compact horizontal carousel of active DEALs for the "DEAL nabídky" mega-menu.
 * Each tile shows the concern logo on white + title + discount + live countdown.
 */
export function NavDealsCarousel({ onNavigate }: { onNavigate: () => void }) {
  const navigate = useNavigate();
  const { deals } = useDeals();

  const live = useMemo(
    () => deals.filter(dealIsLive).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()),
    [deals],
  );

  if (live.length === 0) {
    return <p className="text-sm text-zinc-400">Právě teď nejsou žádné aktivní DEAL nabídky.</p>;
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {live.map((deal) => {
        const concern = concernFor(deal);
        const maxDiscount = deal.tiers.reduce((m, x) => Math.max(m, x.discount_percent), 0);
        return (
          <button
            key={deal.id}
            onClick={() => { onNavigate(); navigate(`/deals/${deal.slug}`); }}
            className="group flex w-[180px] shrink-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* concern logo on white */}
            <div className="relative flex h-20 items-center justify-center border-b border-zinc-100 bg-white p-3">
              {concern ? (
                <BrandLogo
                  name={concern.name}
                  domain={concern.domain}
                  width={300}
                  height={120}
                  className="max-h-10 max-w-[80%] object-contain [mix-blend-mode:multiply] transition-transform duration-300 group-hover:scale-105"
                  fallbackClassName="font-display text-sm font-black tracking-tight text-foreground text-center"
                />
              ) : (
                <span className="font-display text-sm font-black tracking-tight text-foreground text-center">
                  {deal.supplier || deal.title}
                </span>
              )}
              {maxDiscount > 0 && (
                <span className="absolute right-1.5 top-1.5 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm">
                  −{maxDiscount} %
                </span>
              )}
            </div>

            <div className="p-2.5">
              <p className="line-clamp-1 text-[12px] font-semibold leading-tight text-zinc-900">{deal.title}</p>
              <div className="mt-1.5">
                <CountdownTimer deadline={deal.deadline} variant="compact" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
