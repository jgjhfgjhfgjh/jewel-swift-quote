import { useCallback, useEffect, useState } from 'react';
import { dealsTable } from '@/lib/deals';
import { useAuthContext } from '@/contexts/AuthContext';

/** Dávka, kterou přihlášený uživatel sám zadal (deals.created_by = jeho id). */
export interface MyDeal {
  id: string;
  slug: string;
  dealNo: number | null;
  title: string;
  status: string;
  startsAt: string | null;
  deadline: string | null;
}

/**
 * Dealy PŘIHLÁŠENÉHO dodavatele — vlastní dávky rozdělené na živé a historii.
 *
 * Vlastnictví drží `deals.created_by`. RLS na `deals` pouští veřejně všechno
 * kromě draftů, takže dotaz nepotřebuje zvláštní politiku; vlastní rozepsaný
 * draft ale uvidí jen admin (to je stav DB, ne chyba dotazu).
 *
 * „Živý" = status `active` A termín, který ještě neuplynul. Sám status nestačí:
 * dávky zůstávají v DB `active` i po uzávěrce, katalog je počítá jako uzavřené
 * podle deadline — tady to musí sedět stejně, jinak by karta v menu tvrdila
 * něco jiného než seznam dealů.
 */
export function useMyDeals() {
  const { user } = useAuthContext();
  const [deals, setDeals] = useState<MyDeal[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) { setDeals([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await dealsTable()
      .select('id, slug, deal_no, title, status, starts_at, deadline')
      .eq('created_by', user.id)
      .order('deadline', { ascending: false, nullsFirst: false });
    setDeals(
      ((data as Record<string, unknown>[]) ?? []).map((r) => ({
        id: String(r.id),
        slug: String(r.slug ?? ''),
        dealNo: (r.deal_no as number | null) ?? null,
        title: String(r.title ?? ''),
        status: String(r.status ?? ''),
        startsAt: (r.starts_at as string | null) ?? null,
        deadline: (r.deadline as string | null) ?? null,
      })),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => { void reload(); }, [reload]);

  const now = Date.now();
  const isLive = (d: MyDeal) =>
    d.status === 'active' && (!d.deadline || new Date(d.deadline).getTime() > now);

  return {
    loading,
    /** Běžící dávky, nejbližší uzávěrka první. */
    active: deals
      .filter(isLive)
      .sort((a, b) => new Date(a.deadline ?? 0).getTime() - new Date(b.deadline ?? 0).getTime()),
    /** Doběhlé dávky — podklad pro „nasadit znovu". */
    past: deals.filter((d) => !isLive(d)),
    reload,
  };
}
