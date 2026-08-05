import { useQuery } from '@tanstack/react-query';
import { dealProductsTable } from '@/lib/deals';

/**
 * Ukázka SKUTEČNÉHO zboží z dávky pro médium karty katalogu.
 *
 * Karta obchodníkovi neprodává touhu (to je jazyk koncového zákazníka), ale
 * jistotu: co v dávce je, v jaké kvalitě a s jakou marží. Proto se do média
 * netahá vygenerovaná scéna, ale reálné produktové fotky té konkrétní dávky
 * i s jejich cenami — každý snímek nese svá vlastní data, nic se neprůměruje.
 *
 * Řadíme podle hloubky slevy: první dojem má dělat to nejzajímavější zboží.
 */
export interface DealReelItem {
  img: string;
  /** Doporučená maloobchodní cena. */
  retail: number;
  /** Nejnižší velkoobchodní cena (nejvyšší hladina) — jen pro přihlášené. */
  wholesale: number;
  /** Sleva v % z retail → wholesale, zaokrouhlená. */
  discount: number;
  available: number;
}

/** Kolik produktů se do reelu natáhne (mřížka 6 + zásoba na střídání). */
const POOL = 18;

async function fetchReel(dealId: string): Promise<DealReelItem[]> {
  const { data, error } = await dealProductsTable()
    .select('image_url, retail_price, wholesale_tier3, available')
    .eq('deal_id', dealId)
    .not('image_url', 'is', null)
    .gt('retail_price', 0)
    .order('sort_order', { ascending: true })
    .limit(120);
  if (error || !data) return [];

  return (data as {
    image_url: string | null;
    retail_price: number | null;
    wholesale_tier3: number | null;
    available: number | null;
  }[])
    .filter((p) => !!p.image_url && (p.retail_price ?? 0) > 0)
    .map((p) => {
      const retail = Number(p.retail_price) || 0;
      const wholesale = Number(p.wholesale_tier3) || 0;
      return {
        img: p.image_url as string,
        retail,
        wholesale,
        discount: wholesale > 0 ? Math.round((1 - wholesale / retail) * 100) : 0,
        available: Number(p.available) || 0,
      };
    })
    .sort((a, b) => b.discount - a.discount || b.available - a.available)
    .slice(0, POOL);
}

export function useDealReel(dealId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['deal-reel', dealId],
    queryFn: () => fetchReel(dealId as string),
    enabled: !!dealId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
