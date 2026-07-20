/**
 * Watchdog alerty — hlídače deal dropů na čtyřech úrovních:
 * 'deals' (všechny nové dealy, free tier), 'concern' (slug koncernu),
 * 'brand' (kanonický brand key z toBrandKey), 'product' (SKU modelu).
 *
 * V1 pouze ukládá stav do tabulky `deal_alerts`; notifikace při dropu
 * se napojí v další fázi. Tabulka zatím není v generovaných typech
 * (soubor je za živou DB pozadu — viz pozn. v lib/admin/integrations.ts),
 * proto řádkový typ držíme lokálně a přistupujeme přes untyped klienta.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AlertLevel = 'deals' | 'concern' | 'brand' | 'product';

export interface DealAlert {
  id: string;
  user_id: string;
  level: AlertLevel;
  target: string;
  label: string;
  created_at: string;
}

const db = supabase as unknown as SupabaseClient;

export const dealAlertsTable = () => db.from('deal_alerts');
