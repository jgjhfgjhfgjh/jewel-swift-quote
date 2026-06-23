import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
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

/** Czech plural for "deal": 1 deal / 2–4 dealy / 5+ dealů */
function dealsPlural(n: number) {
  if (n === 1) return 'aktivní deal';
  if (n >= 2 && n <= 4) return `${n} aktivní dealy`;
  return `${n} aktivních dealů`;
}

/** First few brand names of a deal, "+N" for the rest. */
function brandList(brands: string[], max: number): { shown: string; extra: number } {
  const shown = brands.slice(0, max).join(', ');
  return { shown, extra: Math.max(0, brands.length - max) };
}

/**
 * Thin lime conversion strip pinned above the navbar. Pushes the whole app down
 * via the `has-announcement` class on <html> (see index.css) so no per-page top
 * offsets need touching; the absolute navbar is anchored to #root and follows.
 *
 * Two modes:
 *  - default pages → live countdown to the soonest-ending DEAL, links to it
 *  - on /deals*    → "browse all active deals (N)", links to the deals listing
 */
export function AnnouncementBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { deals } = useDeals();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('annBarDismissed') === '1';
  });

  const live = useMemo(
    () => deals.filter(dealIsLive).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()),
    [deals],
  );
  const soonest = live[0] ?? null;
  const onDealsPage = pathname.startsWith('/deals');
  const shown = !!soonest && !dismissed;

  // Toggle the global top offset only while the bar is actually shown. The class
  // lives on <html> so --ann-offset reaches body-level portals (toasts) too.
  useEffect(() => {
    const el = document.documentElement;
    if (shown) el.classList.add('has-announcement');
    else el.classList.remove('has-announcement');
    return () => el.classList.remove('has-announcement');
  }, [shown]);

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem('annBarDismissed', '1'); } catch { /* private mode */ }
  };

  if (!shown || !soonest) return null;
  return (
    <Bar
      deadline={soonest.deadline}
      browse={onDealsPage}
      count={live.length}
      brands={soonest.brands}
      onClick={() => navigate(onDealsPage ? '/deals' : `/deals/${soonest.slug}`)}
      onDismiss={dismiss}
    />
  );
}

function Bar({ deadline, browse, count, brands, onClick, onDismiss }: {
  deadline: string; browse: boolean; count: number; brands: string[]; onClick: () => void; onDismiss: () => void;
}) {
  const { ended, text } = useRemaining(deadline);
  if (!browse && ended) return null;

  const bl = brandList(brands, 3);
  const blShort = brandList(brands, 1);

  return (
    <div className="font-display absolute inset-x-0 -top-9 z-[130] h-9 w-full border-b border-border bg-white text-foreground">
      {/* full-width clickable region (separate button so the close X can sit on top) */}
      <button
        type="button"
        onClick={onClick}
        aria-label={browse ? 'Aktivní DEAL nabídky' : 'Zobrazit končící DEAL nabídku'}
        className="flex h-full w-full items-center justify-center px-10"
      >
        {browse ? (
          <span className="text-[11px] sm:text-[13px] font-medium tracking-wide whitespace-nowrap text-muted-foreground">
            <span className="hidden sm:inline">Aktivní DEAL nabídky — <span className="text-foreground">{dealsPlural(count)}</span></span>
            <span className="sm:hidden text-foreground">Aktivní dealy ({count})</span>
          </span>
        ) : (
          <span className="text-[11px] sm:text-[13px] font-medium tracking-wide whitespace-nowrap text-muted-foreground">
            <span className="hidden sm:inline">
              DEAL na <span className="text-foreground">{bl.shown}{bl.extra > 0 ? ` +${bl.extra}` : ''}</span> končí za{' '}
              <span className="font-semibold tabular-nums text-foreground">{text}</span>
            </span>
            <span className="sm:hidden">
              DEAL <span className="text-foreground">{blShort.shown}</span> · <span className="font-semibold tabular-nums text-foreground">{text}</span>
            </span>
          </span>
        )}
      </button>

      {/* Close — removes the bar for the rest of the session */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Zavřít proužek"
        className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
