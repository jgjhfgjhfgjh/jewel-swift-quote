import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Flame } from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';
import { dealIsLive } from '@/lib/deals';

/** Live ticking remainder until a deadline, compact ("2d 05:30:12" or "05:30:12"). */
function useRemaining(deadline: string) {
  const target = new Date(deadline).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = Math.max(0, target - now);
  const pad = (n: number) => String(n).padStart(2, '0');
  const d = Math.floor(left / 86_400_000);
  const h = Math.floor(left / 3_600_000) % 24;
  const m = Math.floor(left / 60_000) % 60;
  const s = Math.floor(left / 1_000) % 60;
  return { ended: left === 0, text: d > 0 ? `${d}d ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}` };
}

/**
 * Thin lime conversion strip pinned above the navbar. Shows a live countdown to
 * the soonest-ending active DEAL and links to it. Pushes the whole app down via
 * the `has-announcement` class on #root (see index.css) so no per-page top
 * offsets need touching; the absolute navbar is anchored to #root and follows.
 */
export function AnnouncementBar() {
  const navigate = useNavigate();
  const { deals } = useDeals();

  // The live deal that ends soonest.
  const deal = useMemo(() => {
    return deals
      .filter(dealIsLive)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0] ?? null;
  }, [deals]);

  // Toggle the global top offset only while the bar is actually shown. The class
  // lives on <html> so --ann-offset reaches body-level portals (toasts) too.
  useEffect(() => {
    const el = document.documentElement;
    if (deal) el.classList.add('has-announcement');
    else el.classList.remove('has-announcement');
    return () => el.classList.remove('has-announcement');
  }, [deal]);

  if (!deal) return null;
  return <Bar deadline={deal.deadline} onClick={() => navigate(`/deals/${deal.slug}`)} />;
}

function Bar({ deadline, onClick }: { deadline: string; onClick: () => void }) {
  const { ended, text } = useRemaining(deadline);
  if (ended) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Zobrazit končící DEAL nabídku"
      className="font-grotesk fixed inset-x-0 top-0 z-[130] flex h-9 w-full items-center justify-center gap-2 sm:gap-3
                 bg-[#d1fe17] px-3 text-[#131517] shadow-sm transition-[filter] hover:brightness-95"
    >
      <Flame className="h-3.5 w-3.5 shrink-0" />
      <span className="rounded-[5px] bg-[#131517] px-1.5 py-0.5 text-[11px] sm:text-[13px] font-bold tabular-nums text-[#d1fe17]">
        {text}
      </span>
      <span className="text-[11px] sm:text-[13px] font-bold uppercase tracking-tight whitespace-nowrap">
        <span className="hidden sm:inline">Tento deal brzy končí — stihněte ještě tuto nabídku</span>
        <span className="sm:hidden">Deal brzy končí</span>
      </span>
      {/* Simple chevrons pulling the eye toward the click — like the hamburger arrows */}
      <span className="flex items-center -space-x-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <ChevronRight
            key={i}
            className="h-3.5 w-3.5 animate-[annNudge_1.1s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
    </button>
  );
}
