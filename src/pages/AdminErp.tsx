import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banknote, Loader2, Package, RefreshCw, TrendingUp, AlertTriangle, Clock, Truck,
} from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { triggerOutboxProcessing, ORDER_STATUS_LABELS_CS, type OrderStatus } from '@/lib/orders';
import { toast } from 'sonner';

interface ErpOrder {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  total: number;
  margin_total: number;
  created_at: string;
}

interface OutboxRow {
  id: string;
  order_id: string;
  channel: string;
  status: string;
  attempts: number;
  last_error: string | null;
  sent_at: string | null;
  created_at: string;
  orders: { order_number: string } | null;
}

function KpiCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function AdminErp() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ErpOrder[]>([]);
  const [outbox, setOutbox] = useState<OutboxRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [ordersRes, outboxRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id, order_number, order_type, status, total, margin_total, created_at')
        .order('created_at', { ascending: false })
        .limit(500),
      supabase
        .from('supplier_orders')
        .select('id, order_id, channel, status, attempts, last_error, sent_at, created_at, orders(order_number)')
        .order('created_at', { ascending: false })
        .limit(50),
    ]);
    if (ordersRes.error) toast.error(ordersRes.error.message);
    setOrders((ordersRes.data ?? []) as ErpOrder[]);
    setOutbox((outboxRes.data ?? []) as unknown as OutboxRow[]);
    setLoading(false);
  }, []);

  // Přístup hlídá AdminGuard v routingu — tady už jen data.
  useEffect(() => {
    void load();
  }, [load]);

  const kpi = useMemo(() => {
    const active = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'failed');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = active.filter((o) => new Date(o.created_at) >= monthStart);
    return {
      total: active.length,
      month: thisMonth.length,
      gmv: active.reduce((s, o) => s + Number(o.total), 0),
      gmvMonth: thisMonth.reduce((s, o) => s + Number(o.total), 0),
      margin: active.reduce((s, o) => s + Number(o.margin_total), 0),
      awaiting: orders.filter((o) => o.status === 'awaiting_payment').length,
      outboxPending: outbox.filter((r) => r.status === 'pending').length,
      outboxErrors: outbox.filter((r) => r.status === 'error').length,
    };
  }, [orders, outbox]);

  const chartData = useMemo(() => {
    const days: { day: string; objednavky: number; gmv: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const inDay = orders.filter((o) => {
        const t = new Date(o.created_at);
        return t >= d && t < next && o.status !== 'cancelled';
      });
      days.push({
        day: d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }),
        objednavky: inDay.length,
        gmv: Math.round(inDay.reduce((s, o) => s + Number(o.total), 0) * 100) / 100,
      });
    }
    return days;
  }, [orders]);

  const handleProcess = async () => {
    await triggerOutboxProcessing();
    toast.success('Zpracování fronty spuštěno');
    setTimeout(() => void load(), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">ERP přehled</h1>
            <p className="text-xs text-muted-foreground">
              Objednávky, marže a zdraví EDI napojení na dodavatele (Zago — POHODA E1 / GRiT)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleProcess}>
              <RefreshCw className="mr-1 h-3 w-3" /> Zpracovat EDI frontu
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void load()}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <KpiCard
                icon={<Package className="h-3.5 w-3.5" />}
                label="Objednávky"
                value={String(kpi.total)}
                sub={`${kpi.month} tento měsíc`}
              />
              <KpiCard
                icon={<Banknote className="h-3.5 w-3.5" />}
                label="Obrat (GMV)"
                value={`€${kpi.gmv.toFixed(0)}`}
                sub={`€${kpi.gmvMonth.toFixed(0)} tento měsíc`}
              />
              <KpiCard
                icon={<TrendingUp className="h-3.5 w-3.5" />}
                label="Marže"
                value={`€${kpi.margin.toFixed(0)}`}
                sub={kpi.gmv > 0 ? `${((kpi.margin / kpi.gmv) * 100).toFixed(1)} % z obratu` : undefined}
              />
              <KpiCard
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Čeká na platbu"
                value={String(kpi.awaiting)}
                sub={kpi.outboxErrors > 0 ? `⚠ ${kpi.outboxErrors} chyb v EDI frontě` : `${kpi.outboxPending} ve frontě EDI`}
              />
            </div>

            <div className="rounded-lg border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold">Posledních 14 dní</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value: number, name: string) =>
                        name === 'gmv' ? [`€${value}`, 'GMV'] : [value, 'Objednávky']}
                    />
                    <Bar yAxisId="left" dataKey="objednavky" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                    <Line yAxisId="right" dataKey="gmv" stroke="#b8860b" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Truck className="h-4 w-4" /> EDI fronta k dodavateli
                </h2>
                <span className="text-xs text-muted-foreground">
                  kanál: {outbox[0]?.channel ?? 'pohoda-xml'}
                </span>
              </div>
              {outbox.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">Fronta je prázdná.</p>
              ) : (
                <div className="divide-y">
                  {outbox.map((r) => (
                    <div key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-sm">
                      <span className="font-medium">{r.orders?.order_number ?? r.order_id.slice(0, 8)}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        r.status === 'sent' || r.status === 'acknowledged'
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : r.status === 'error'
                            ? 'bg-destructive/15 text-destructive'
                            : 'bg-amber-500/15 text-amber-600'
                      }`}>
                        {r.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{r.channel} · pokusů: {r.attempts}</span>
                      {r.sent_at && (
                        <span className="text-xs text-muted-foreground">
                          odesláno {new Date(r.sent_at).toLocaleString('cs-CZ')}
                        </span>
                      )}
                      {r.last_error && (
                        <span className="flex items-center gap-1 text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3" /> {r.last_error}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border bg-card">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-sm font-semibold">Poslední objednávky</h2>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/orders')}>
                  Zobrazit vše
                </Button>
              </div>
              <div className="divide-y">
                {orders.slice(0, 8).map((o) => (
                  <div key={o.id} className="flex items-center gap-4 px-4 py-2.5 text-sm">
                    <span className="font-medium">{o.order_number}</span>
                    <span className="text-xs text-muted-foreground">
                      {o.order_type === 'dropship' ? 'Dropship' : 'Velkoobchod'}
                    </span>
                    <span className="text-xs">{ORDER_STATUS_LABELS_CS[o.status as OrderStatus] ?? o.status}</span>
                    <span className="ml-auto tabular-nums font-semibold">€{Number(o.total).toFixed(2)}</span>
                    <span className="w-24 text-right text-xs tabular-nums text-primary">
                      +€{Number(o.margin_total).toFixed(2)}
                    </span>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="px-4 py-6 text-sm text-muted-foreground">Zatím žádné objednávky.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomNav onOpenWishlist={() => {}} />
    </div>
  );
}
