import { useEffect, useRef, useState } from 'react';
import { Check, Lock, TrendingUp, PartyPopper } from 'lucide-react';
import { useStore } from '@/lib/store';
import { dealsI18n, fillTemplate } from '@/lib/i18n-deals';
import { dealProgress, sortedTiers, type DealTier } from '@/lib/deals';

/**
 * The central FOMO element: an animated bar that fills as the partner adds
 * units to the deal order, unlocking higher discount tiers (66 → 67 → 68 %).
 */
export function MinOrderProgress({
  tiers,
  qty,
  className = '',
}: {
  tiers: DealTier[];
  qty: number;
  className?: string;
}) {
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang].progress;
  const t2 = sortedTiers(tiers);
  const top = t2[t2.length - 1]?.min_qty || 1;
  const prog = dealProgress(qty, tiers);

  // Flash when a new tier is unlocked.
  const prevIndex = useRef(prog.activeIndex);
  const [justUnlocked, setJustUnlocked] = useState(false);
  useEffect(() => {
    if (prog.activeIndex > prevIndex.current) {
      setJustUnlocked(true);
      const id = setTimeout(() => setJustUnlocked(false), 1600);
      prevIndex.current = prog.activeIndex;
      return () => clearTimeout(id);
    }
    prevIndex.current = prog.activeIndex;
  }, [prog.activeIndex]);

  const callout = !prog.minimumReached
    ? fillTemplate(t.needMoreForValid, { n: prog.remainingToNext || (t2[0]?.min_qty ?? 0) - qty })
    : prog.nextTier
      ? fillTemplate(t.unlockNext, { n: prog.remainingToNext, percent: prog.nextTier.discount_percent })
      : fillTemplate(t.topReached, { percent: prog.effectiveTier.discount_percent });

  return (
    <div
      className={`rounded-2xl border bg-white p-5 transition-colors ${className}
        ${prog.minimumReached ? 'border-emerald-200' : 'border-amber-200'}
        ${justUnlocked ? 'ring-2 ring-emerald-400' : ''}`}
    >
      {/* header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className={`h-4 w-4 ${prog.minimumReached ? 'text-emerald-600' : 'text-amber-600'}`} />
          <span className="text-sm font-bold text-slate-800">{t.title}</span>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {t.currentDiscount}
          </div>
          <div className={`font-display text-xl font-black leading-none tabular-nums
            ${prog.minimumReached ? 'text-emerald-600' : 'text-slate-300'}`}>
            {prog.minimumReached ? `${prog.effectiveTier.discount_percent} %` : '—'}
          </div>
        </div>
      </div>

      {/* bar with tier markers */}
      <div className="relative pt-2 pb-9">
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`relative h-full rounded-full transition-[width] duration-700 ease-out
              ${prog.minimumReached
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                : 'bg-gradient-to-r from-amber-300 to-amber-500'}`}
            style={{ width: `${Math.max(prog.percentOverall, qty > 0 ? 4 : 0)}%` }}
          >
            <div className="absolute inset-0 animate-pulse rounded-full bg-white/20" />
          </div>
        </div>

        {/* current-qty knob */}
        {qty > 0 && (
          <div
            className="absolute top-0 -translate-x-1/2 transition-[left] duration-700 ease-out"
            style={{ left: `${Math.min(100, Math.max(prog.percentOverall, 4))}%` }}
          >
            <span className="rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-black tabular-nums text-white">
              {qty}
            </span>
          </div>
        )}

        {/* tier milestone markers */}
        {t2.map((tier) => {
          const reached = qty >= tier.min_qty;
          const pos = Math.min(100, (tier.min_qty / top) * 100);
          return (
            <div
              key={tier.min_qty}
              className="absolute flex flex-col items-center"
              style={{ left: `${pos}%`, top: '0', transform: 'translateX(-50%)' }}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-white transition-colors
                  ${reached ? 'border-white bg-emerald-600' : 'border-white bg-slate-300'}`}
              >
                {reached ? <Check className="h-3 w-3" strokeWidth={3} /> : <Lock className="h-2.5 w-2.5" />}
              </span>
              <span className={`mt-1 whitespace-nowrap text-[10px] font-bold tabular-nums
                ${reached ? 'text-emerald-700' : 'text-slate-400'}`}>
                {tier.discount_percent} %
              </span>
              <span className="whitespace-nowrap text-[9px] font-medium text-slate-400 tabular-nums">
                {tier.min_qty} {t.pcs}
              </span>
            </div>
          );
        })}
      </div>

      {/* callout */}
      <div
        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold
          ${prog.nextTier === null && prog.minimumReached
            ? 'bg-emerald-50 text-emerald-700'
            : prog.minimumReached
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-amber-50 text-amber-700'}`}
      >
        {prog.nextTier === null && prog.minimumReached
          ? <PartyPopper className="h-4 w-4 shrink-0" />
          : prog.minimumReached
            ? <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
            : <Lock className="h-4 w-4 shrink-0" />}
        <span>{callout}</span>
      </div>
    </div>
  );
}
