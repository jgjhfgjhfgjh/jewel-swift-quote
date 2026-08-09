import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * SplitDeal — skupinový nákup na MOQ.
 *
 * `split_commitments` drží JEDEN závazek na uživatele a dávku (unique
 * deal_id+user_id). RLS pouští jen vlastní řádky, takže naplněnost poolu se
 * nečte z tabulky, ale z RPC `split_deal_totals()` — to vrací pouze součty.
 *
 * Tabulka zatím není v generovaných typech (soubor je za živou DB pozadu,
 * stejně jako u deal_alerts), proto řádkový typ držíme lokálně a chodíme
 * přes untyped klienta.
 */
export interface SplitCommitment {
  id: string;
  deal_id: string;
  user_id: string;
  qty: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  note: string | null;
  created_at: string;
  updated_at: string;
}

/** Řádek z `split_deal_totals()` — veřejná naplněnost poolu. */
export interface SplitDealTotalRow {
  deal_id: string;
  committed_qty: number;
  participants: number;
}

const db = supabase as unknown as SupabaseClient;

export const splitCommitmentsTable = () => db.from('split_commitments');
export const fetchSplitTotals = () => db.rpc('split_deal_totals');
