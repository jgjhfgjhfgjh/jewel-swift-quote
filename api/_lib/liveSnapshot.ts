// Živý KPI snapshot pro Context Hub a centrální chat — sdílené mezi
// api/context.ts a api/ai/chat.ts. Volá se service klientem PO ověření admina.
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LiveSnapshot } from '../../src/lib/context/bundle';

export async function fetchLiveSnapshot(supabase: SupabaseClient): Promise<LiveSnapshot> {
  const [productsAll, productsStock, ordersRes, inquiriesAll, inquiriesOpen, dealsAll, profilesAll] =
    await Promise.all([
      supabase.from('produkty').select('id', { count: 'exact', head: true }),
      supabase.from('produkty').select('id', { count: 'exact', head: true }).gt('stock', 0),
      supabase
        .from('orders')
        .select('total, margin_total, status')
        .order('created_at', { ascending: false })
        .limit(1000),
      supabase.from('prestige_inquiries').select('id', { count: 'exact', head: true }),
      supabase
        .from('prestige_inquiries')
        .select('id', { count: 'exact', head: true })
        .neq('status', 'closed'),
      supabase.from('deals').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
    ]);

  const orders = (ordersRes.data ?? []) as { total: number; margin_total: number; status: string }[];
  const active = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'failed');

  return {
    fetchedAt: new Date().toISOString(),
    products: { total: productsAll.count ?? 0, inStock: productsStock.count ?? 0 },
    orders: {
      total: active.length,
      gmv: active.reduce((s, o) => s + Number(o.total ?? 0), 0),
      marginTotal: active.reduce((s, o) => s + Number(o.margin_total ?? 0), 0),
      awaitingPayment: orders.filter((o) => o.status === 'awaiting_payment').length,
    },
    inquiries: { total: inquiriesAll.count ?? 0, open: inquiriesOpen.count ?? 0 },
    deals: { total: dealsAll.count ?? 0 },
    customers: { profiles: profilesAll.count ?? 0 },
  };
}
