import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { fetchSplitTotals, splitCommitmentsTable, type SplitDealTotalRow } from '@/lib/splitDeals';
import { sortedTiers, type Deal } from '@/lib/deals';

/** Součty za dávku — z RPC, aby nikdo neviděl cizí závazky. */
interface PoolTotals {
  committedQty: number;
  participants: number;
}

export interface SplitPool {
  deal: Deal;
  /** MOQ dávky = první (nejnižší) hladina slevy; pod ní dávka neběží. */
  target: number;
  committed: number;
  participants: number;
  /** Kolik kusů ještě chybí do MOQ. */
  missing: number;
  /** 0–1, ořezané na 1. */
  progress: number;
  /** Kolik kusů drží přihlášený uživatel (0 = nepřipojen). */
  myQty: number;
  deadline: string | null;
}

/**
 * SplitDeal — skupinový nákup na MOQ.
 *
 * Logika: každá dávka má MOQ (nejnižší hladina v `tiers`), kterou musí naplnit
 * objednávka, aby se otevřela. Malý obchodník ji sám nedá. SplitDeal proto
 * počítá závazky VÍCE obchodníků do jednoho společného objemu: součet
 * závazků plní MOQ dávky a otevře ji všem najednou.
 *
 * Data: `split_commitments` (jeden řádek na uživatele a dávku, RLS pouští jen
 * vlastní) + RPC `split_deal_totals()`, které vrací POUZE součty — naplněnost
 * tak vidí každý, ale cizí závazky nikdo.
 *
 * Závazek NENÍ objednávka: je platný, dokud dávka běží. Naplní-li se MOQ do
 * uzávěrky, otevře se dávka všem účastníkům; když ne, závazek zanikne a nikomu
 * nic nevzniká. Přepis závazku (jiné množství) je upsert, zrušení je smazání
 * řádku — pool se okamžitě přepočítá.
 */
export function useSplitDeals(deals: Deal[]) {
  const { user } = useAuthContext();
  const [totals, setTotals] = useState<Record<string, PoolTotals>>({});
  const [mine, setMine] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busyDeal, setBusyDeal] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await fetchSplitTotals();
    const map: Record<string, PoolTotals> = {};
    for (const r of (data as SplitDealTotalRow[]) ?? []) {
      map[r.deal_id] = { committedQty: Number(r.committed_qty), participants: Number(r.participants) };
    }
    setTotals(map);

    if (user) {
      const { data: own } = await splitCommitmentsTable()
        .select('deal_id, qty')
        .neq('status', 'cancelled');
      const mineMap: Record<string, number> = {};
      for (const r of (own as { deal_id: string; qty: number }[]) ?? []) mineMap[r.deal_id] = Number(r.qty);
      setMine(mineMap);
    } else {
      setMine({});
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { void reload(); }, [reload]);

  /** Zapsat / přepsat vlastní závazek. Vrací false, když není kdo se zavázat. */
  const commit = useCallback(async (dealId: string, qty: number) => {
    if (!user || qty <= 0) return false;
    setBusyDeal(dealId);
    const { error } = await splitCommitmentsTable()
      .upsert(
        { deal_id: dealId, user_id: user.id, qty, status: 'pending', updated_at: new Date().toISOString() },
        { onConflict: 'deal_id,user_id' },
      );
    await reload();
    setBusyDeal(null);
    return !error;
  }, [user, reload]);

  /** Odstoupit z poolu — řádek zmizí a objem se hned přepočítá. */
  const leave = useCallback(async (dealId: string) => {
    if (!user) return false;
    setBusyDeal(dealId);
    const { error } = await splitCommitmentsTable()
      .delete()
      .eq('deal_id', dealId)
      .eq('user_id', user.id);
    await reload();
    setBusyDeal(null);
    return !error;
  }, [user, reload]);

  const pools = useMemo<SplitPool[]>(() => {
    const now = Date.now();
    return deals
      .filter((d) => d.status === 'active' && (!d.deadline || new Date(d.deadline).getTime() > now))
      .map((deal) => {
        const target = sortedTiers(deal.tiers)[0]?.min_qty ?? 0;
        const t = totals[deal.id];
        const committed = t?.committedQty ?? 0;
        return {
          deal,
          target,
          committed,
          participants: t?.participants ?? 0,
          missing: Math.max(0, target - committed),
          progress: target > 0 ? Math.min(1, committed / target) : 0,
          myQty: mine[deal.id] ?? 0,
          deadline: deal.deadline ?? null,
        };
      })
      /* nejblíž k naplnění nahoru — tam se obchod uzavře nejdřív */
      .sort((a, b) => b.progress - a.progress);
  }, [deals, totals, mine]);

  return { pools, loading, busyDeal, commit, leave, reload };
}
