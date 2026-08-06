import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { dealProductsTable } from '@/lib/deals';

/**
 * Ukázka SKUTEČNÉHO zboží z dávky pro médium karty katalogu.
 *
 * Karta obchodníkovi neprodává touhu (to je jazyk koncového zákazníka), ale
 * jistotu: co v dávce je, v jaké kvalitě a s jakou marží. Proto se do média
 * netahá vygenerovaná scéna, ale reálné produktové fotky té konkrétní dávky
 * i s jejich cenami — každý snímek nese svá vlastní data, nic se neprůměruje.
 *
 * KVALITA FOTEK (zjištěno měřením zdrojů, 2026-08-06):
 *  · Fossil Group — fossil.scene7.com, 1200×1200 ✓
 *  · Tommy Hilfiger — storage, 666×1080 ✓
 *  · Timex Group (Versace) — storage, jen 125×181 ✗
 *  · Swarovski — storage, jen 100×100 ✗ (import z xlsx nesl miniatury)
 * Větší varianta v našem úložišti NEEXISTUJE (ověřeno v storage.objects),
 * značková CDN Swarovski jsou za bot ochranou. Co jde bez nového importu:
 * dohledat kus v HLAVNÍM katalogu (`produkty`) přes EAN a vzít plnou fotku
 * odtud — u Versace to pokryje ~58 % kusů, u Swarovski ~6 %. Zbytek se
 * vykreslí v nativní velikosti (viz DealInventoryReel), aby drobná fotka
 * působila jako záměr, ne jako rozmazaná vada.
 */
export interface DealReelItem {
  img: string;
  /** Značka kusu — nese vodoznak přes produkt. */
  brand: string;
  /** Doporučená maloobchodní cena. */
  retail: number;
  /** Nejnižší velkoobchodní cena (nejvyšší hladina) — jen pro přihlášené. */
  wholesale: number;
  /** Sleva v % z retail → wholesale, zaokrouhlená. */
  discount: number;
  available: number;
}

/** Kolik produktů se do reelu natáhne. */
const POOL = 18;

/** Fotky z hlavního katalogu podle EAN — plná velikost místo miniatury. */
async function catalogImagesByEan(eans: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!eans.length) return map;
  const { data } = await supabase
    .from('produkty')
    .select('ean, image_url')
    .in('ean', eans.slice(0, 100));
  for (const row of (data as { ean: string | null; image_url: string | null }[]) ?? []) {
    if (row.ean && row.image_url) map.set(row.ean, row.image_url);
  }
  return map;
}

async function fetchReel(dealId: string): Promise<DealReelItem[]> {
  const { data, error } = await dealProductsTable()
    .select('image_url, brand, ean, retail_price, wholesale_tier3, available')
    .eq('deal_id', dealId)
    .not('image_url', 'is', null)
    .gt('retail_price', 0)
    .order('sort_order', { ascending: true })
    .limit(120);
  if (error || !data) return [];

  const rows = (data as {
    image_url: string | null;
    brand: string | null;
    ean: string | null;
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
        ean: p.ean ?? '',
        brand: p.brand ?? '',
        retail,
        wholesale,
        discount: wholesale > 0 ? Math.round((1 - wholesale / retail) * 100) : 0,
        available: Number(p.available) || 0,
      };
    })
    .sort((a, b) => b.discount - a.discount || b.available - a.available)
    .slice(0, POOL);

  // plné fotky z hlavního katalogu tam, kde kus podle EAN dohledáme
  const better = await catalogImagesByEan(rows.map((r) => r.ean).filter(Boolean));
  return rows.map(({ ean, ...r }) => ({ ...r, img: better.get(ean) ?? r.img }));
}

export function useDealReel(dealId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['deal-reel', dealId],
    queryFn: () => fetchReel(dealId as string),
    enabled: !!dealId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
