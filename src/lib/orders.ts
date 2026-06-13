import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type OrderType = 'wholesale' | 'dropship';
export type OrderStatus =
  | 'awaiting_payment' | 'queued' | 'forwarded' | 'confirmed'
  | 'shipped' | 'delivered' | 'cancelled' | 'failed';
export type Branding = 'partner' | 'swelt' | 'neutral';

export interface ShipTo {
  name: string;
  company?: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface PlaceOrderInput {
  order_type: OrderType;
  items: { produkt_id: string; quantity: number }[];
  shipping_method_id: string;
  ship_to: ShipTo;
  cod_amount?: number;
  external_ref?: string;
  branding?: Branding;
  note?: string;
}

export interface PlaceOrderResult {
  order_id: string;
  order_number: string;
  status: OrderStatus;
  items_subtotal: number;
  shipping_price: number;
  vat_mode: string;
  vat_rate: number;
  vat_amount: number;
  total: number;
}

export interface OrderRow {
  id: string;
  order_number: string;
  order_type: OrderType;
  status: OrderStatus;
  currency: string;
  items_subtotal: number;
  shipping_price: number;
  shipping_name: string;
  vat_amount: number;
  total: number;
  margin_total: number;
  payment_mode: string;
  branding: Branding;
  cod_amount: number | null;
  external_ref: string | null;
  ship_to_name: string;
  ship_to_city: string;
  ship_to_country: string;
  tracking_number: string | null;
  tracking_url: string | null;
  partner_user_id: string;
  created_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  sku: string;
  name: string;
  manufacturer: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

/**
 * Creates the order server-side (pricing, stock and VAT are computed in the
 * place_order RPC — client prices are never trusted) and kicks the supplier
 * outbox processor so credit orders leave for the supplier immediately.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const { data, error } = await supabase.rpc('place_order', { p: input as unknown as Json });
  if (error) throw new Error(error.message);
  const result = data as unknown as PlaceOrderResult;
  void triggerOutboxProcessing();
  return result;
}

/** Fire-and-forget: ask the backend to flush the supplier outbox + e-mails. */
export async function triggerOutboxProcessing(): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch('/api/process-supplier-orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // non-critical — the cron sweep retries pending outbox rows
  }
}

export async function fetchMyOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, order_type, status, currency, items_subtotal, shipping_price, shipping_name, vat_amount, total, margin_total, payment_mode, branding, cod_amount, external_ref, ship_to_name, ship_to_city, ship_to_country, tracking_number, tracking_url, partner_user_id, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as OrderRow[];
}

export async function fetchOrderItems(orderId: string): Promise<OrderItemRow[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('id, order_id, sku, name, manufacturer, quantity, unit_price, line_total')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as OrderItemRow[];
}

export async function markOrderPaid(orderId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_order_paid', { p_order_id: orderId });
  if (error) throw new Error(error.message);
  void triggerOutboxProcessing();
}

export async function cancelOrder(orderId: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_order', { p_order_id: orderId });
  if (error) throw new Error(error.message);
}

export const ORDER_STATUS_LABELS_CS: Record<OrderStatus, string> = {
  awaiting_payment: 'Čeká na platbu',
  queued: 'Ve frontě k odeslání',
  forwarded: 'Předáno dodavateli',
  confirmed: 'Potvrzeno dodavatelem',
  shipped: 'Odesláno',
  delivered: 'Doručeno',
  cancelled: 'Stornováno',
  failed: 'Chyba',
};
