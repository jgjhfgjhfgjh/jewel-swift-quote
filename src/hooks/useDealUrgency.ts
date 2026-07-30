import { useEffect, useState } from 'react';
import { dealsTable } from '@/lib/deals';

const URGENT_MS = 48 * 3600 * 1000;

/**
 * True, když nějaký živý deal končí do 48 hodin — pohání červenou tečku
 * u GoBigDeal v navigaci. Jeden lehký dotaz bez počtů produktů (useDeals
 * dotahuje počty per deal, což je na každé načtení stránky zbytečné).
 */
export function useDealUrgency() {
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    let mounted = true;
    dealsTable()
      .select('deadline,starts_at,status')
      .eq('status', 'active')
      .then(({ data }) => {
        if (!mounted || !data) return;
        const now = Date.now();
        setUrgent((data as { deadline: string; starts_at: string }[]).some((d) => {
          const start = new Date(d.starts_at).getTime();
          const end = new Date(d.deadline).getTime();
          return start <= now && end > now && end - now <= URGENT_MS;
        }));
      });
    return () => { mounted = false; };
  }, []);

  return urgent;
}
