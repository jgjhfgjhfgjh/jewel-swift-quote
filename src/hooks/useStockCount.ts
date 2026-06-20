import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Live count of in-stock products in the catalog.
 *
 * Uses the same `search_products` RPC as the catalog grid (with only the
 * stock-only filter applied), so the returned number always matches the real
 * count a stock-only catalog query would yield. We request a single row purely
 * to read `total_count` — no product payload is loaded.
 */
export function useStockCount(enabled = true) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;

    supabase
      .rpc('search_products', {
        p_search: null,
        p_brands: null,
        p_category_keywords: null,
        p_stock_only: true,
        p_min_discount: 0,
        p_genders: null,
        p_params: null,
        p_ids: null,
        p_limit: 1,
        p_offset: 0,
      })
      .then(({ data, error }) => {
        if (!active || error || !data) return;
        setCount(data[0]?.total_count ?? 0);
      });

    return () => { active = false; };
  }, [enabled]);

  return count;
}
