import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Loader2, PackageOpen, RefreshCw } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  fetchMyOrders, fetchOrderItems, markOrderPaid, cancelOrder, triggerOutboxProcessing,
  ORDER_STATUS_LABELS_CS,
  type OrderRow, type OrderItemRow, type OrderStatus,
} from '@/lib/orders';
import { toast } from 'sonner';

const STATUS_VARIANT: Record<OrderStatus, string> = {
  awaiting_payment: 'bg-amber-500/15 text-amber-600',
  queued: 'bg-blue-500/15 text-blue-600',
  forwarded: 'bg-indigo-500/15 text-indigo-600',
  confirmed: 'bg-violet-500/15 text-violet-600',
  shipped: 'bg-emerald-500/15 text-emerald-600',
  delivered: 'bg-green-600/15 text-green-700',
  cancelled: 'bg-muted text-muted-foreground',
  failed: 'bg-destructive/15 text-destructive',
};

export default function Orders() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuthContext();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, OrderItemRow[]>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await fetchMyOrders());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) void load();
  }, [user, authLoading, navigate, load]);

  const toggleExpand = async (orderId: string) => {
    if (expanded === orderId) {
      setExpanded(null);
      return;
    }
    setExpanded(orderId);
    if (!items[orderId]) {
      try {
        const rows = await fetchOrderItems(orderId);
        setItems((prev) => ({ ...prev, [orderId]: rows }));
      } catch {
        // row stays collapsible without items
      }
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    setBusyId(orderId);
    try {
      await markOrderPaid(orderId);
      toast.success('Objednávka označena jako zaplacená a předána k expedici');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    setBusyId(orderId);
    try {
      await cancelOrder(orderId);
      toast.success('Objednávka stornována');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  };

  const handleRetryOutbox = async () => {
    await triggerOutboxProcessing();
    toast.success('Zpracování fronty spuštěno');
    setTimeout(() => void load(), 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">
            {isAdmin ? 'Objednávky' : 'Moje objednávky'}
          </h1>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={handleRetryOutbox}>
                <RefreshCw className="mr-1 h-3 w-3" /> Zpracovat frontu
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => void load()}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <PackageOpen className="h-10 w-10" />
            <p>Zatím žádné objednávky</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="rounded-lg border bg-card">
                <button
                  onClick={() => void toggleExpand(o.id)}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{o.order_number}</span>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {o.order_type === 'dropship' ? 'Dropship' : 'Velkoobchod'}
                      </Badge>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_VARIANT[o.status]}`}>
                        {ORDER_STATUS_LABELS_CS[o.status]}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString('cs-CZ')} · {o.ship_to_name}, {o.ship_to_city} ({o.ship_to_country})
                      {o.external_ref ? ` · ref ${o.external_ref}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums">€{Number(o.total).toFixed(2)}</p>
                    {isAdmin && (
                      <p className="text-[10px] tabular-nums text-primary">
                        marže €{Number(o.margin_total).toFixed(2)}
                      </p>
                    )}
                  </div>
                  {expanded === o.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {expanded === o.id && (
                  <div className="border-t px-4 py-3">
                    {items[o.id] ? (
                      <div className="mb-3 divide-y text-sm">
                        {items[o.id].map((i) => (
                          <div key={i.id} className="flex items-center justify-between py-1.5">
                            <span className="truncate pr-2">
                              {i.quantity}× <span className="text-muted-foreground">[{i.sku}]</span> {i.name}
                            </span>
                            <span className="tabular-nums">€{Number(i.line_total).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between py-1.5 text-xs text-muted-foreground">
                          <span>Doprava — {o.shipping_name}</span>
                          <span className="tabular-nums">€{Number(o.shipping_price).toFixed(2)}</span>
                        </div>
                        {Number(o.vat_amount) > 0 && (
                          <div className="flex items-center justify-between py-1.5 text-xs text-muted-foreground">
                            <span>DPH</span>
                            <span className="tabular-nums">€{Number(o.vat_amount).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Loader2 className="my-2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}

                    {o.cod_amount != null && (
                      <p className="mb-2 text-xs text-muted-foreground">Dobírka: €{Number(o.cod_amount).toFixed(2)}</p>
                    )}
                    {o.tracking_number && (
                      <p className="mb-2 text-xs">
                        Tracking:{' '}
                        {o.tracking_url ? (
                          <a href={o.tracking_url} target="_blank" rel="noreferrer" className="text-primary underline">
                            {o.tracking_number}
                          </a>
                        ) : o.tracking_number}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {isAdmin && o.status === 'awaiting_payment' && (
                        <Button
                          size="sm"
                          disabled={busyId === o.id}
                          onClick={() => void handleMarkPaid(o.id)}
                          className="bg-gold text-accent-foreground hover:bg-gold/90"
                        >
                          {busyId === o.id && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                          Označit zaplaceno
                        </Button>
                      )}
                      {(o.status === 'awaiting_payment' || (isAdmin && (o.status === 'queued' || o.status === 'failed'))) && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === o.id}
                          onClick={() => void handleCancel(o.id)}
                          className="text-destructive"
                        >
                          Stornovat
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <CartDrawer />
      {/* Stránka nemá vlastní WishlistDrawer — no-op zachovává dosavadní chování */}
      <BottomNav onOpenWishlist={() => {}} />
    </div>
  );
}
