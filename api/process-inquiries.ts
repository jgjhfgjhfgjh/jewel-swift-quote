// Prestige-inquiry automation processor: schedules and sends the inquiry
// e-mails (confirmation, mini-course drip, admin notifications) and prepares
// AI advisory drafts for the admin ERP.
//
// Triggered (a) fire-and-forget from the frontend right after an inquiry is
// submitted (sends the confirmation + admin notification and generates the AI
// advisory draft immediately), (b) by a daily Vercel cron that delivers the
// scheduled mini-course parts. Idempotent — the outbox has a unique
// (inquiry_id, kind) constraint, so repeated calls never duplicate e-mails.
// NOTE: the Hobby plan only allows once-per-day crons, hence the daily sweep.
//
// Auth: x-cron-secret / Bearer CRON_SECRET, a valid Supabase JWT, or anonymous.
// Anonymous calls are safe: the endpoint takes NO parameters — it only drains
// the queue, which the cron does anyway.
//
// Requires (Vercel env): RESEND_API_KEY, EMAIL_FROM, SUPABASE_SERVICE_KEY,
// ANTHROPIC_API_KEY, optional ADMIN_NOTIFY_EMAIL (defaults to info@swelt.cz).
// See vercel.json for the hourly cron schedule that also drains the queue.

import Anthropic from '@anthropic-ai/sdk';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendEmail } from './_lib/email.js';
import {
  confirmationEmail, adminNotificationEmail, courseEmail, advisoryReplySubject,
  isAdvisory, COURSE_SCHEDULE_DAYS, type InquiryLike,
} from './_lib/inquiryEmails.js';
import { buildOfferEmail } from './_lib/offerEmail.js';
import {
  buildInvoiceEmail, buildInvoicePohodaXml, paymentReceivedEmail, orderConfirmationEmail,
  type PrestigeOrderRow,
} from './_lib/invoiceEmail.js';

const MAX_ATTEMPTS = 5;
const BATCH_SIZE = 20;

function getServiceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_KEY ?? '';
  return createClient(url, key, { auth: { persistSession: false } });
}

function adminEmail(): string {
  return process.env.ADMIN_NOTIFY_EMAIL ?? 'info@swelt.cz';
}

interface InquiryRow extends InquiryLike {
  id: string;
  created_at: string;
  status: string;
  ai_draft: string | null;
  offer_price: string | null;
  offer_currency: string | null;
  offer_draft: string | null;
  offer_items: { brand: string; model: string; price: number }[] | null;
}

/* ── 1) Schedule outbox rows for inquiries that don't have them yet ── */
async function scheduleNew(supabase: SupabaseClient): Promise<number> {
  const { data: inquiries, error } = await supabase
    .from('prestige_inquiries')
    .select('*')
    .gte('created_at', new Date(Date.now() - 30 * 864e5).toISOString())
    .order('created_at', { ascending: false })
    .limit(100)
    .returns<InquiryRow[]>();
  if (error) throw new Error(`inquiries select failed: ${error.message}`);
  if (!inquiries?.length) return 0;

  const ids = inquiries.map((i) => i.id);
  const { data: existing } = await supabase
    .from('inquiry_emails')
    .select('inquiry_id')
    .eq('kind', 'confirmation')
    .in('inquiry_id', ids);
  const has = new Set((existing ?? []).map((r) => r.inquiry_id));

  let scheduled = 0;
  for (const inq of inquiries) {
    if (has.has(inq.id)) continue;
    const now = new Date();
    const rows = [
      { inquiry_id: inq.id, kind: 'confirmation', recipient: inq.email, scheduled_at: now.toISOString() },
      { inquiry_id: inq.id, kind: 'admin_notification', recipient: adminEmail(), scheduled_at: now.toISOString() },
      ...Object.entries(COURSE_SCHEDULE_DAYS).map(([kind, days]) => ({
        inquiry_id: inq.id,
        kind,
        recipient: inq.email,
        scheduled_at: new Date(now.getTime() + days * 864e5).toISOString(),
      })),
    ];
    // Unique (inquiry_id, kind) makes this idempotent under concurrent calls.
    const { error: insErr } = await supabase
      .from('inquiry_emails')
      .upsert(rows, { onConflict: 'inquiry_id,kind', ignoreDuplicates: true });
    if (!insErr) scheduled++;
  }
  return scheduled;
}

/* ── 2) Generate AI advisory drafts (admin reviews & sends from the ERP) ── */
async function catalogSummary(): Promise<string> {
  // Compact per-brand model list from the curated dataset. Imported lazily so a
  // bundling hiccup can't break plain e-mail processing.
  try {
    const mod = await import('../src/data/luxuryCatalog.js');
    const houses = (mod as { LUXURY_HOUSES: { name: string; models: { model: string; params?: Record<string, string> }[] }[] }).LUXURY_HOUSES;
    return houses
      .map((h) => `${h.name}: ${h.models.slice(0, 12).map((m) => m.model).join(', ')}`)
      .join('\n');
  } catch {
    return 'IWC, Omega, Baume & Mercier, Bvlgari, Breitling, Cartier, Girard-Perregaux, Jaeger-LeCoultre, Montblanc, Mido, Longines, Locman, TAG Heuer, Tissot, Ulysse Nardin';
  }
}

async function generateAdvisoryDrafts(supabase: SupabaseClient): Promise<number> {
  if (!process.env.ANTHROPIC_API_KEY) return 0;
  const { data: inquiries } = await supabase
    .from('prestige_inquiries')
    .select('*')
    .is('ai_draft', null)
    .eq('status', 'new')
    .gte('created_at', new Date(Date.now() - 14 * 864e5).toISOString())
    .limit(5)
    .returns<InquiryRow[]>();

  const advisory = (inquiries ?? []).filter((i) => isAdvisory(i));
  if (advisory.length === 0) return 0;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const catalog = await catalogSummary();
  let generated = 0;

  for (const inq of advisory) {
    const prompt = `Zákazník poslal poptávku na luxusní hodinky a žádá poradenství s výběrem.

DATA POPTÁVKY
Jméno: ${inq.name}
Typ nákupu: ${inq.purchase_type === 'company' ? 'na firmu (velkoobchodní cena)' : 'osobní'}
Počet kusů: ${inq.quantity ?? '1 kus'}
Rozpočet: ${inq.budget ?? 'neuveden'}
Poznámka zákazníka: ${inq.note ?? '(žádná)'}

NÁŠ KATALOG (značky a modely, které umíme zajistit):
${catalog}

Napiš návrh odpovědního e-mailu (česky, vykej). Struktura:
1. Krátké poděkování a shrnutí, co zákazník hledá.
2. Doporuč PŘESNĚ 3 konkrétní modely z našeho katalogu, každý s 1–2 větami PROČ se hodí (zohledni rozpočet, počet kusů a poznámku).
3. Zakonči nabídkou nezávazného nacenění a otázkou, který z modelů ho zaujal.
Bez předmětu, bez podpisu — jen tělo e-mailu. Střízlivý, profesionální tón concierge služby.`;

    try {
      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 900,
        messages: [{ role: 'user', content: prompt }],
      });
      const draft = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      if (!draft) continue;

      await supabase.from('prestige_inquiries').update({ ai_draft: draft }).eq('id', inq.id);
      await supabase.from('inquiry_emails').upsert(
        [{
          inquiry_id: inq.id,
          kind: 'advisory_draft_ready',
          recipient: adminEmail(),
          scheduled_at: new Date().toISOString(),
          payload: { preview: draft.slice(0, 400) },
        }],
        { onConflict: 'inquiry_id,kind', ignoreDuplicates: true },
      );
      generated++;
    } catch {
      // Non-fatal — next sweep retries (ai_draft is still null).
    }
  }
  return generated;
}

/* ── 3) Cancel pending course parts for closed inquiries ── */
async function cancelClosed(supabase: SupabaseClient): Promise<void> {
  const { data: closed } = await supabase
    .from('prestige_inquiries')
    .select('id')
    .eq('status', 'closed')
    .gte('created_at', new Date(Date.now() - 60 * 864e5).toISOString());
  const ids = (closed ?? []).map((r) => r.id);
  if (ids.length === 0) return;
  await supabase
    .from('inquiry_emails')
    .update({ status: 'cancelled' })
    .in('inquiry_id', ids)
    .like('kind', 'course_%')
    .eq('status', 'pending');
}

/* ── 4) Send everything that is due ── */
interface OutboxRow {
  id: string;
  inquiry_id: string;
  kind: string;
  recipient: string;
  attempts: number;
  payload: { subject?: string; text?: string; preview?: string } | null;
}

async function sendDue(supabase: SupabaseClient): Promise<{ sent: number; failed: number }> {
  const { data: rows, error } = await supabase
    .from('inquiry_emails')
    .select('id, inquiry_id, kind, recipient, attempts, payload')
    .in('status', ['pending', 'error'])
    .lte('scheduled_at', new Date().toISOString())
    .lt('attempts', MAX_ATTEMPTS)
    .order('scheduled_at', { ascending: true })
    .limit(BATCH_SIZE)
    .returns<OutboxRow[]>();
  if (error) throw new Error(`outbox select failed: ${error.message}`);
  if (!rows?.length) return { sent: 0, failed: 0 };

  // Load the referenced inquiries (and their orders, for invoice kinds) in one go.
  const ids = [...new Set(rows.map((r) => r.inquiry_id))];
  const { data: inquiries } = await supabase
    .from('prestige_inquiries')
    .select('*')
    .in('id', ids)
    .returns<InquiryRow[]>();
  const byId = new Map((inquiries ?? []).map((i) => [i.id, i]));

  const orderKinds = new Set(['order_confirmation', 'proforma_invoice', 'invoice_admin_copy', 'payment_received']);
  const orderIds = [...new Set(rows.filter((r) => orderKinds.has(r.kind)).map((r) => r.inquiry_id))];
  const { data: orders } = orderIds.length
    ? await supabase.from('prestige_orders').select('*').in('inquiry_id', orderIds).returns<PrestigeOrderRow[]>()
    : { data: [] as PrestigeOrderRow[] };
  const orderByInquiry = new Map((orders ?? []).map((o) => [o.inquiry_id, o]));

  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    const inq = byId.get(row.inquiry_id);
    const order = orderByInquiry.get(row.inquiry_id);
    let content: {
      subject: string; text: string; html?: string;
      attachments?: { filename: string; content: string }[];
    } | null = null;

    if (row.kind === 'advisory_reply' && row.payload?.text) {
      content = { subject: row.payload.subject || advisoryReplySubject(), text: row.payload.text };
    } else if (inq) {
      if (row.kind === 'confirmation') content = confirmationEmail(inq);
      else if (row.kind === 'admin_notification') content = adminNotificationEmail(inq);
      else if (row.kind === 'offer' && inq.offer_draft && inq.offer_price) {
        content = await buildOfferEmail(inq, {
          price: inq.offer_price,
          currency: inq.offer_currency ?? 'CZK',
          body: inq.offer_draft,
          items: inq.offer_items ?? undefined,
        });
      } else if (row.kind === 'order_confirmation' && order?.order_number) {
        content = orderConfirmationEmail(inq, order);
      } else if (row.kind === 'proforma_invoice' && order?.invoice_number) {
        content = buildInvoiceEmail(inq, order);
      } else if (row.kind === 'invoice_admin_copy' && order?.invoice_number) {
        const inv = buildInvoiceEmail(inq, order);
        content = {
          subject: `[kopie + POHODA XML] ${inv.subject}`,
          text: `Kopie zálohové faktury pro účetnictví.\n\n${inv.text}`,
          html: inv.html,
          attachments: [{
            filename: `${order.invoice_number}.xml`,
            content: buildInvoicePohodaXml(inq, order),
          }],
        };
      } else if (row.kind === 'payment_received' && order) {
        content = paymentReceivedEmail(inq, order);
      } else if (row.kind === 'advisory_draft_ready') {
        content = {
          subject: `AI návrh odpovědi připraven — ${inq.name}`,
          text: `Pro poptávku od ${inq.name} (${inq.email}) je v ERP připraven AI návrh poradenské odpovědi.\n\nNáhled:\n${row.payload?.preview ?? ''}\n\nZkontrolovat a odeslat: https://swelt.partner/admin/poptavky`,
        };
      } else if (/^course_[1-5]$/.test(row.kind)) {
        content = courseEmail(Number(row.kind.split('_')[1]), inq);
      }
    }

    if (!content) {
      await supabase.from('inquiry_emails').update({
        status: 'error', attempts: row.attempts + 1, last_error: 'Unknown kind or missing inquiry',
      }).eq('id', row.id);
      failed++;
      continue;
    }

    // Admin-targeted rows may be queued from the ERP client, which doesn't know
    // ADMIN_NOTIFY_EMAIL — resolve it here.
    const to = row.kind === 'invoice_admin_copy' ? adminEmail() : row.recipient;
    const result = await sendEmail(to, content.subject, content.text, content.attachments, content.html);
    if (result.ok) {
      await supabase.from('inquiry_emails').update({
        status: 'sent', sent_at: new Date().toISOString(), attempts: row.attempts + 1, last_error: null,
      }).eq('id', row.id);
      sent++;
    } else {
      await supabase.from('inquiry_emails').update({
        status: 'error', attempts: row.attempts + 1, last_error: result.error ?? 'send failed',
      }).eq('id', row.id);
      failed++;
    }
  }
  return { sent, failed };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const supabase = getServiceClient();
  try {
    const scheduled = await scheduleNew(supabase);
    const drafts = await generateAdvisoryDrafts(supabase);
    await cancelClosed(supabase);
    const { sent, failed } = await sendDue(supabase);
    res.status(200).json({ ok: true, scheduled, drafts, sent, failed });
  } catch (e) {
    res.status(500).json({ ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}
