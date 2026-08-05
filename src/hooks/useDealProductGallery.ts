import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DealProduct } from '@/lib/deals';

/**
 * Galerie jednoho produktu dávky — sjednocuje detail dávky s hlavním katalogem.
 *
 * `deal_products` drží jediný `image_url`, takže samo o sobě není co „slidovat".
 * Hlavní katalog (`produkty`) má `image_urls` — víc pohledů na tentýž kus.
 * Hook dávkový produkt spáruje s katalogem a vrátí spojenou galerii.
 *
 * Párování: nejdřív EAN (spolehlivý identifikátor kusu), teprve pak SKU —
 * SKU si dodavatelé formátují po svém, EAN je globální. Skutečné pokrytí je
 * hodně nerovnoměrné (Tommy Hilfiger 100 %, Timex ~58 %, Swarovski ~6 %,
 * Fossil 0 %), takže většina produktů zůstane u jediné fotky. To NENÍ chyba
 * párování — ty kusy prostě v hlavním katalogu nejsou.
 *
 * Pořadí: vlastní fotka dávky je VŽDY první, i když katalog má lepší. Uživatel
 * na ni kliknul na kartě a musí ji v modalu poznat; kdyby se prohodila,
 * působí to jako otevření jiného produktu.
 */

async function fetchGallery(ean: string | null, sku: string | null): Promise<string[]> {
  const pick = async (column: 'ean' | 'sku', value: string) => {
    const { data } = await supabase
      .from('produkty')
      .select('image_urls')
      .eq(column, value)
      .not('image_urls', 'is', null)
      .limit(1)
      .maybeSingle();
    return (data?.image_urls as string[] | null) ?? [];
  };

  if (ean) {
    const byEan = await pick('ean', ean);
    if (byEan.length) return byEan;
  }
  if (sku) return pick('sku', sku);
  return [];
}

/**
 * Vrátí obrázky pro detail produktu dávky — vlastní fotka dávky plus pohledy
 * z hlavního katalogu, bez duplicit. Dokud dotaz běží, vrací aspoň tu vlastní,
 * takže modal nikdy neproblikne prázdnem.
 */
export function useDealProductGallery(product: DealProduct | null): string[] {
  const { data: catalogImages = [] } = useQuery({
    queryKey: ['deal-product-gallery', product?.ean, product?.sku],
    queryFn: () => fetchGallery(product?.ean ?? null, product?.sku ?? null),
    enabled: !!product && (!!product.ean || !!product.sku),
    staleTime: 10 * 60 * 1000,
  });

  const own = product?.image_url ? [product.image_url] : [];
  return [...new Set([...own, ...catalogImages])];
}
