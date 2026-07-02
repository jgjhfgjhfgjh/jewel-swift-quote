// Outbox processor: forwards queued orders to the supplier (EDI adapter)
// and sends partner notification e-mails.
//
// Triggered (a) fire-and-forget from the frontend right after placing an
// order, (b) by Vercel cron as a retry sweep. Idempotent — safe to call
// repeatedly.
//
// Auth: either x-cron-secret header (CRON_SECRET) or a valid Supabase JWT.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdapter, type SupplierPayload } from './_lib/supplier.js';
import { sendEmail } from './_lib/email.js';

const MAX_ATTEMPTS = 5;
const BATCH_SIZE = 10;

function getServiceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_KEY ?? '';
  return createClient(url, key, { auth: { persistSession: false } });
}

async function isAuthorized(req: VercelRequest, supabase: SupabaseClient): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers['x-cron-secret'] === cronSecret) return true;
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const auth = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
  if (cronSecret && auth === cronSecret) return true;
  if (auth) {
    const { data, error } = await supabase.auth.getUser(auth);
    if (!error && data.user) return true;
  }
  return false;
}

interface OutboxRow {
  id: string;
  order_id: string;
  channel: string;
  payload: SupplierPayload;
  status: string;
  attempts: number;
}

async function processOutbox(supabase: SupabaseClient): Promise<{ sent: number; failed: number }> {
  const { data: rows, error } = await supabase
    .from('supplier_orders')
    .select('id, order_id, channel, payload, status, attempts')
    .in('status', ['pending', 'error'])
    .lt('attempts', MAX_ATTEMPTS)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)
    .returns<OutboxRow[]>();

  if (error) throw new Error(`outbox select failed: ${error.message}`);

  let sent = 0;
  let failed = 0;

  for (const row of rows ?? []) {
    const adapter = getAdapter(row.channel);
    const result = adapter
      ? await adapter.send(row.payload)
      : { ok: false as const, error: `Unknown channel: ${row.channel}` };

    if (result.ok) {
      await supabase
        .from('supplier_orders')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          attempts: row.attempts + 1,
          last_error: null,
          supplier_response: result.supplierResponse ?? null,
        })
        .eq('id', row.id);
      await supabase
        .from('orders')
        .update({ status: 'forwarded', forwarded_at: new Date().toISOString() })
        .eq('id', row.order_id)
        .eq('status', 'queued');
      sent++;
    } else {
      await supabase
        .from('supplier_orders')
        .update({
          status: 'error',
          attempts: row.attempts + 1,
          last_error: result.error ?? 'unknown error',
        })
        .eq('id', row.id);
      failed++;
    }
  }

  return { sent, failed };
}

interface OrderForEmail {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  partner_user_id: string;
  total: number;
  currency: string;
  payment_mode: string;
  external_ref: string | null;
}

function confirmationText(o: OrderForEmail): string {
  const lines = [
    `Dobrý den,`,
    ``,
    `přijali jsme Vaši objednávku ${o.order_number}` +
      (o.external_ref ? ` (Vaše reference: ${o.external_ref})` : '') + '.',
    ``,
    `Typ: ${o.order_type === 'dropship' ? 'Dropshipping' : 'Velkoobchod'}`,
    `Celkem: €${Number(o.total).toFixed(2)}`,
    ``,
  ];
  if (o.status === 'awaiting_payment') {
    const bank = process.env.BANK_ACCOUNT_INFO;
    lines.push(
      'Objednávka čeká na úhradu. Po připsání platby ji ihned předáme k expedici.',
      bank ? `Platební údaje: ${bank}, variabilní symbol: ${o.order_number.replace(/\D/g, '')}` : 'Platební údaje Vám zašleme v proforma faktuře.',
    );
  } else {
    lines.push('Objednávka byla předána k expedici. O odeslání Vás budeme informovat.');
  }
  lines.push('', 'Děkujeme,', 'swelt.partner');
  return lines.join('\n');
}

// Confirmation e-mails for fresh orders that don't have one logged yet.
async function sendConfirmations(supabase: SupabaseClient): Promise<number> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, order_type, status, partner_user_id, total, currency, payment_mode, external_ref')
    .in('status', ['awaiting_payment', 'queued', 'forwarded'])
    .order('created_at', { ascending: false })
    .limit(25)
    .returns<OrderForEmail[]>();
  if (error || !orders?.length) return 0;

  const { data: logged } = await supabase
    .from('order_emails')
    .select('order_id')
    .eq('kind', 'confirmation')
    .eq('status', 'sent')
    .in('order_id', orders.map((o) => o.id));
  const done = new Set((logged ?? []).map((r: { order_id: string }) => r.order_id));

  let count = 0;
  for (const order of orders.filter((o) => !done.has(o.id))) {
    const { data: userData } = await supabase.auth.admin.getUserById(order.partner_user_id);
    const email = userData?.user?.email;
    if (!email) continue;

    const result = await sendEmail(
      email,
      `Potvrzení objednávky ${order.order_number}`,
      confirmationText(order)
    );
    await supabase.from('order_emails').insert({
      order_id: order.id,
      kind: 'confirmation',
      recipient: email,
      status: result.ok ? 'sent' : 'error',
      error: result.ok ? null : result.error,
    });
    if (result.ok) count++;
  }
  return count;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getServiceClient();

  if (!(await isAuthorized(req, supabase))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const outbox = await processOutbox(supabase);
    const confirmations = await sendConfirmations(supabase);
    return res.status(200).json({ ok: true, ...outbox, confirmations });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}
