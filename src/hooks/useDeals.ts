import { useCallback, useEffect, useState } from 'react';
import { dealsTable, dealProductsTable, type Deal, type DealProduct, DEFAULT_TIERS } from '@/lib/deals';

function normalizeDeal(raw: Record<string, unknown>): Deal {
  return {
    ...(raw as unknown as Deal),
    brands: Array.isArray(raw.brands) ? (raw.brands as string[]) : [],
    tiers: Array.isArray(raw.tiers) && raw.tiers.length
      ? (raw.tiers as Deal['tiers'])
      : DEFAULT_TIERS,
  };
}

/** All deals visible to the current user (RLS hides drafts from non-admins). */
export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await dealsTable()
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
      setDeals([]);
      setProductCounts({});
      setLoading(false);
      return;
    }
    setError(null);
    const list = ((data as Record<string, unknown>[]) ?? []).map(normalizeDeal);
    setDeals(list);

    const counts: Record<string, number> = {};
    await Promise.all(list.map(async (d) => {
      const { count } = await dealProductsTable()
        .select('id', { count: 'exact', head: true })
        .eq('deal_id', d.id);
      counts[d.id] = count ?? 0;
    }));
    setProductCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { deals, productCounts, loading, error, reload };
}

/** A single deal (by slug) together with its products. */
export function useDeal(slug: string | undefined) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [products, setProducts] = useState<DealProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!slug) { setLoading(false); return; }
    setLoading(true);
    const { data: dealRow, error: dealErr } = await dealsTable()
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (dealErr || !dealRow) {
      setError(dealErr?.message ?? 'Nabídka nenalezena.');
      setDeal(null);
      setProducts([]);
      setLoading(false);
      return;
    }
    const normalized = normalizeDeal(dealRow as Record<string, unknown>);
    // Paginate — PostgREST caps each response at 1000 rows.
    const PAGE = 1000;
    const all: DealProduct[] = [];
    let prodErr: string | null = null;
    for (let from = 0; ; from += PAGE) {
      const { data, error: pErr } = await dealProductsTable()
        .select('*')
        .eq('deal_id', normalized.id)
        .order('sort_order', { ascending: true })
        .range(from, from + PAGE - 1);
      if (pErr) { prodErr = pErr.message; break; }
      const chunk = (data as DealProduct[]) ?? [];
      all.push(...chunk);
      if (chunk.length < PAGE) break;
    }
    setDeal(normalized);
    setProducts(all);
    setError(prodErr);
    setLoading(false);
  }, [slug]);

  useEffect(() => { reload(); }, [reload]);

  return { deal, products, loading, error, reload };
}
