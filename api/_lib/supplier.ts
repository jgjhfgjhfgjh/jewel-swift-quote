// Supplier (EDI) adapter layer.
//
// The real channel to the supplier (Zago) is not known yet, so every
// outbox row carries a `channel` and the processor picks the matching
// adapter. Adding REST/XML/EDIFACT later means adding one adapter here —
// nothing else in the pipeline changes.

import { sendEmail } from './email.js';
import { buildPohodaOrderXml } from './pohodaXml.js';

export interface SupplierPayloadItem {
  line_no: number;
  supplier_product_id: string;
  sku: string;
  ean: string;
  name: string;
  manufacturer: string;
  quantity: number;
  unit_price: number;
  currency: string;
}

export interface SupplierPayload {
  document: 'ORDER';
  order_number: string;
  order_type: 'wholesale' | 'dropship';
  external_ref: string | null;
  created_at: string;
  buyer: { company: string; ico: string | null; vat_id: string | null };
  branding: { mode: 'partner' | 'swelt' | 'neutral'; brand_name: string | null };
  ship_to: {
    name: string; company: string; street: string; city: string;
    zip: string; country: string; phone: string; email: string;
  };
  shipping: { code: string; name: string };
  cod: { amount: number; currency: string } | null;
  note: string | null;
  items: SupplierPayloadItem[];
  totals: { purchase_subtotal: number; currency: string };
}

export interface SendResult {
  ok: boolean;
  error?: string;
  supplierResponse?: unknown;
}

export interface SupplierAdapter {
  channel: string;
  send(payload: SupplierPayload): Promise<SendResult>;
}

function formatOrderText(p: SupplierPayload): string {
  const lines: string[] = [
    `OBJEDNÁVKA ${p.order_number}`,
    `Typ: ${p.order_type === 'dropship' ? 'DROPSHIPPING (white-label)' : 'VELKOOBCHOD'}`,
    p.external_ref ? `Reference partnera: ${p.external_ref}` : '',
    '',
    `Odběratel: ${p.buyer.company}${p.buyer.ico ? ` (IČO ${p.buyer.ico})` : ''}`,
    p.branding.brand_name ? `Branding zásilky a dokladů: ${p.branding.brand_name}` : 'Branding zásilky: neutrální',
    '',
    'DORUČIT NA:',
    `  ${p.ship_to.name}${p.ship_to.company ? `, ${p.ship_to.company}` : ''}`,
    `  ${p.ship_to.street}`,
    `  ${p.ship_to.zip} ${p.ship_to.city}, ${p.ship_to.country}`,
    `  Tel: ${p.ship_to.phone || '—'} | E-mail: ${p.ship_to.email || '—'}`,
    '',
    `Doprava: ${p.shipping.name} (${p.shipping.code})`,
    p.cod ? `DOBÍRKA: ${p.cod.amount.toFixed(2)} ${p.cod.currency}` : 'Bez dobírky',
    p.note ? `Poznámka: ${p.note}` : '',
    '',
    'POLOŽKY:',
    ...p.items.map((i) =>
      `  ${i.line_no}. [${i.sku}] ${i.name} — ${i.quantity} ks à ${i.unit_price.toFixed(2)} ${i.currency} (EAN ${i.ean || '—'})`
    ),
    '',
    `Celkem (nákup): ${p.totals.purchase_subtotal.toFixed(2)} ${p.totals.currency}`,
  ];
  return lines.filter((l) => l !== '').join('\n');
}

// StubAdapter: e-mails a human-readable order to the supplier so the
// pipeline is fully functional before the real EDI channel is known.
// Requires SUPPLIER_ORDER_EMAIL; falls back to error (row stays visible
// in the admin outbox) when not configured.
const stubAdapter: SupplierAdapter = {
  channel: 'stub',
  async send(payload) {
    const to = process.env.SUPPLIER_ORDER_EMAIL;
    if (!to) {
      return { ok: false, error: 'SUPPLIER_ORDER_EMAIL not configured' };
    }
    const subject = `Objednávka ${payload.order_number} (${payload.order_type})`;
    const result = await sendEmail(to, subject, formatOrderText(payload));
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true, supplierResponse: { channel: 'stub', delivered_to: to } };
  },
};

// PohodaXmlAdapter: e-mails the order with a POHODA dataPack XML attached.
// Zago (POHODA E1 + Jazzware) imports the file straight into their ERP —
// manually via XML import or automated by watching the mailbox/folder.
// Replaced by a GRiT ORiON adapter (EDIFACT ORDERS) once credentials exist.
const pohodaXmlAdapter: SupplierAdapter = {
  channel: 'pohoda-xml',
  async send(payload) {
    const to = process.env.SUPPLIER_ORDER_EMAIL;
    if (!to) {
      return { ok: false, error: 'SUPPLIER_ORDER_EMAIL not configured' };
    }
    const xml = buildPohodaOrderXml(payload);
    const subject = `Objednávka ${payload.order_number} (${payload.order_type}) — POHODA XML`;
    const result = await sendEmail(to, subject, formatOrderText(payload), [
      { filename: `${payload.order_number}.xml`, content: xml },
    ]);
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true, supplierResponse: { channel: 'pohoda-xml', delivered_to: to, format: 'stormware-datapack-2.0' } };
  },
};

const adapters: Record<string, SupplierAdapter> = {
  stub: stubAdapter,
  'pohoda-xml': pohodaXmlAdapter,
};

export function getAdapter(channel: string): SupplierAdapter | null {
  return adapters[channel] ?? null;
}
