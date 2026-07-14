import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface OrderRow {
  status: string;
  total: number;
  margin_total: number;
  created_at: string;
}
interface ItemRow {
  name: string;
  sku: string;
  quantity: number;
  line_total: number;
}

const eur = (n: number) =>
  `€${n.toLocaleString('cs-CZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/**
 * Finanční sektor — tržby, marže a top produkty z orders/order_items.
 * Klientské dotazy pod admin RLS (vzor AdminErp), grafy recharts.
 */
export default function AdminFinance() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [ordersRes, itemsRes] = await Promise.all([
      supabase
        .from('orders')
        .select('status, total, margin_total, created_at')
        .order('created_at', { ascending: false })
        .limit(2000),
      supabase
        .from('order_items')
        .select('name, sku, quantity, line_total')
        .limit(2000),
    ]);
    setOrders((ordersRes.data ?? []) as OrderRow[]);
    setItems((itemsRes.data ?? []) as ItemRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const active = useMemo(
    () => orders.filter((o) => o.status !== 'cancelled' && o.status !== 'failed'),
    [orders],
  );

  const kpi = useMemo(() => {
    const gmv = active.reduce((s, o) => s + Number(o.total), 0);
    const margin = active.reduce((s, o) => s + Number(o.margin_total), 0);
    return {
      gmv,
      margin,
      marginPct: gmv > 0 ? (margin / gmv) * 100 : 0,
      count: active.length,
      aov: active.length > 0 ? gmv / active.length : 0,
    };
  }, [active]);

  /** posledních 6 měsíců: GMV sloupce + marže linka */
  const monthly = useMemo(() => {
    const out: { month: string; gmv: number; marze: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthOrders = active.filter((o) => {
        const d = new Date(o.created_at);
        return d >= start && d < end;
      });
      out.push({
        month: start.toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' }),
        gmv: Math.round(monthOrders.reduce((s, o) => s + Number(o.total), 0)),
        marze: Math.round(monthOrders.reduce((s, o) => s + Number(o.margin_total), 0)),
      });
    }
    return out;
  }, [active]);

  const topProducts = useMemo(() => {
    const bySku = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const it of items) {
      const cur = bySku.get(it.sku) ?? { name: it.name, qty: 0, revenue: 0 };
      cur.qty += Number(it.quantity);
      cur.revenue += Number(it.line_total);
      bySku.set(it.sku, cur);
    }
    return [...bySku.entries()]
      .map(([sku, v]) => ({ sku, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [items]);

  const stat = (label: string, value: string) => (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-black tabular-nums">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Finance
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">Finanční benchmarky</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Aktivní objednávky (bez zrušených a selhaných), EUR.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Obnovit
          </Button>
        </header>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stat('GMV', eur(kpi.gmv))}
          {stat('Marže', eur(kpi.margin))}
          {stat('Marže %', `${kpi.marginPct.toFixed(1)} %`)}
          {stat('Objednávek', String(kpi.count))}
          {stat('Prům. objednávka', eur(kpi.aov))}
        </section>

        <section className="mt-8 rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            GMV a marže — posledních 6 měsíců
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => eur(v)} />
                <Bar dataKey="gmv" name="GMV" fill="#131517" radius={[4, 4, 0, 0]} />
                <Line dataKey="marze" name="Marže" stroke="#7aa300" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mt-8 rounded-xl border bg-card p-5">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Top produkty podle tržeb
          </h2>
          {topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {loading ? 'Načítání…' : 'Zatím žádné položky objednávek.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[11px] uppercase text-muted-foreground">
                    <th className="py-2 pr-3">Produkt</th>
                    <th className="py-2 pr-3">SKU</th>
                    <th className="py-2 pr-3 text-right">Ks</th>
                    <th className="py-2 text-right">Tržby</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.sku} className="border-b last:border-0">
                      <td className="max-w-[320px] truncate py-2 pr-3">{p.name}</td>
                      <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{p.qty}</td>
                      <td className="py-2 text-right font-semibold tabular-nums">{eur(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
