// Proforma (zálohová) invoice for a prestige order: a rich HTML e-mail for the
// customer (payment details, VS, due date, optional Czech QR payment) plus a
// POHODA "faktura vydaná" XML the accountant can import (sent to the admin as
// an attachment).
//
// Config (env): SWELT_COMPANY_NAME, SWELT_ICO, SWELT_DIC, SWELT_BANK
// (account, e.g. "123456789/0100"), optional SWELT_IBAN (enables the QR code),
// ADMIN_NOTIFY_EMAIL.

import type { InquiryLike } from './inquiryEmails.js';

const SITE = 'https://swelt.partner';
const ACCENT = '#0f172a';
const GOLD = '#9a7b4f';

export interface OrderItemLine {
  brand: string;
  model: string;
  price: number;
}

export interface PrestigeOrderRow {
  id: string;
  inquiry_id: string;
  items?: OrderItemLine[] | null;
  order_number: string | null;
  invoice_number: string | null;
  invoice_issued_at: string | null;
  status: string;
  currency: string;
  amount: number;
  vat_rate: number;
  vat_base: number;
  vat_amount: number;
  bill_name: string | null;
  bill_company: string | null;
  bill_ico: string | null;
  bill_dic: string | null;
  bill_street: string | null;
  bill_city: string | null;
  bill_zip: string | null;
  bill_country: string | null;
  public_token: string;
  paid_at: string | null;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
}

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function money(n: number, currency: string): string {
  return `${n.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function czDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('cs-CZ') : '';
}

export function variableSymbol(invoiceNumber: string | null): string {
  return (invoiceNumber ?? '').replace(/\D/g, '');
}

function supplierIdentity() {
  return {
    company: process.env.SWELT_COMPANY_NAME ?? 'swelt.partner',
    ico: process.env.SWELT_ICO ?? '',
    dic: process.env.SWELT_DIC ?? '',
    bank: process.env.SWELT_BANK ?? '',
    iban: process.env.SWELT_IBAN ?? '',
  };
}

/** Czech QR payment (paylibo renders the SPD string as an image). */
function qrUrl(order: PrestigeOrderRow): string | null {
  const { iban } = supplierIdentity();
  if (!iban || !order.invoice_number) return null;
  const p = new URLSearchParams({
    iban: iban.replace(/\s/g, ''),
    amount: order.amount.toFixed(2),
    currency: order.currency,
    vs: variableSymbol(order.invoice_number),
    message: `Zaloha ${order.invoice_number}`,
  });
  return `https://api.paylibo.com/paylibo/generator/czech/image?${p.toString()}`;
}

/** The binding-order lines: order.items when present, otherwise a fallback. */
function orderLines(inq: InquiryLike, order: PrestigeOrderRow): OrderItemLine[] {
  if (order.items?.length) return order.items;
  const real = (inq.watches ?? []).filter((w) => w.brand !== 'Konzultace');
  if (!real.length) return [{ brand: '', model: 'Luxusní hodinky dle dohodnuté specifikace', price: order.amount }];
  // No per-item breakdown available — one summary line.
  return [{ brand: '', model: real.map((w) => `${w.brand} ${w.model}`).join(', '), price: order.amount }];
}

function itemsLabel(inq: InquiryLike, order?: PrestigeOrderRow): string {
  if (order?.items?.length) return order.items.map((i) => `${i.brand} ${i.model}`.trim()).join(', ');
  const real = (inq.watches ?? []).filter((w) => w.brand !== 'Konzultace');
  if (!real.length) return 'Luxusní hodinky dle dohodnuté specifikace';
  return real.map((w) => `${w.brand} ${w.model}`).join(', ');
}

export function buildInvoiceEmail(
  inq: InquiryLike,
  order: PrestigeOrderRow,
): { subject: string; text: string; html: string } {
  const sup = supplierIdentity();
  const vs = variableSymbol(order.invoice_number);
  const issued = czDate(order.invoice_issued_at);
  const due = czDate(order.invoice_issued_at
    ? new Date(new Date(order.invoice_issued_at).getTime() + 7 * 864e5).toISOString()
    : null);
  const lines = orderLines(inq, order);
  const qr = qrUrl(order);
  const isVat = order.vat_rate > 0;

  const buyerLines = [
    order.bill_company || order.bill_name,
    order.bill_company && order.bill_name && order.bill_company !== order.bill_name ? order.bill_name : '',
    order.bill_street,
    [order.bill_zip, order.bill_city].filter(Boolean).join(' '),
    order.bill_ico ? `IČO: ${order.bill_ico}` : '',
    order.bill_dic ? `DIČ: ${order.bill_dic}` : '',
  ].filter(Boolean) as string[];

  const html = `<!-- proforma invoice -->
<div style="margin:0;padding:0;background:#f4f2ee">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee">
<tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <tr><td style="background:${ACCENT};padding:28px 32px">
      <table role="presentation" width="100%"><tr>
        <td><div style="color:#fff;font-size:20px;font-weight:800">swelt<span style="color:${GOLD}">.</span>partner</div></td>
        <td align="right">
          <div style="color:#fff;font-size:15px;font-weight:700">Zálohová faktura</div>
          <div style="color:#cbd5e1;font-size:13px">${esc(order.invoice_number)}</div>
        </td>
      </tr></table>
    </td></tr>

    <tr><td style="padding:24px 32px 8px">
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#27272a">Dobrý den${order.bill_name ? `, ${esc((order.bill_name || '').split(/\s+/)[0])}` : ''},</p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#27272a">děkujeme za Vaši závaznou objednávku <strong>${esc(order.order_number)}</strong>. Zasíláme zálohovou fakturu — po připsání platby ihned zahajujeme zajištění Vašeho kusu a budeme Vás průběžně informovat o každém kroku.</p>
    </td></tr>

    <tr><td style="padding:4px 32px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td valign="top" width="50%" style="padding:12px 8px 12px 0">
            <div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#a1a1aa;font-weight:700;margin-bottom:6px">Dodavatel</div>
            <div style="font-size:13px;color:#27272a;line-height:1.6">${esc(sup.company)}${sup.ico ? `<br>IČO: ${esc(sup.ico)}` : ''}${sup.dic ? `<br>DIČ: ${esc(sup.dic)}` : ''}</div>
          </td>
          <td valign="top" width="50%" style="padding:12px 0 12px 8px">
            <div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#a1a1aa;font-weight:700;margin-bottom:6px">Odběratel</div>
            <div style="font-size:13px;color:#27272a;line-height:1.6">${buyerLines.map(esc).join('<br>')}</div>
          </td>
        </tr>
      </table>
    </td></tr>

    <tr><td style="padding:8px 32px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ece7df;border-radius:12px">
        <tr style="background:#faf8f4">
          <td style="padding:10px 16px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#71717a;font-weight:700">Položka</td>
          <td align="right" style="padding:10px 16px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#71717a;font-weight:700">Částka</td>
        </tr>
        ${lines.map((l) => `
        <tr>
          <td style="padding:14px 16px;font-size:14px;color:#27272a;border-top:1px solid #f0ede7">Záloha 100 % — ${esc(`${l.brand} ${l.model}`.trim())}</td>
          <td align="right" style="padding:14px 16px;font-size:14px;color:#27272a;border-top:1px solid #f0ede7;white-space:nowrap">${money(l.price, order.currency)}</td>
        </tr>`).join('')}
        ${isVat ? `
        <tr>
          <td style="padding:6px 16px;font-size:12px;color:#71717a">Základ${order.vat_rate ? ` (DPH ${order.vat_rate}%)` : ''}</td>
          <td align="right" style="padding:6px 16px;font-size:12px;color:#71717a;white-space:nowrap">${money(order.vat_base, order.currency)}</td>
        </tr>
        <tr>
          <td style="padding:2px 16px 12px;font-size:12px;color:#71717a">DPH ${order.vat_rate}%</td>
          <td align="right" style="padding:2px 16px 12px;font-size:12px;color:#71717a;white-space:nowrap">${money(order.vat_amount, order.currency)}</td>
        </tr>` : ''}
        <tr style="background:${ACCENT}">
          <td style="padding:14px 16px;font-size:14px;color:#fff;font-weight:700">Celkem k úhradě</td>
          <td align="right" style="padding:14px 16px;font-size:18px;color:#fff;font-weight:800;white-space:nowrap">${money(order.amount, order.currency)}</td>
        </tr>
      </table>
    </td></tr>

    <tr><td style="padding:12px 32px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f4;border:1px solid #ece7df;border-radius:12px">
        <tr>
          <td valign="top" style="padding:18px 20px">
            <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${GOLD};font-weight:700;margin-bottom:8px">Platební údaje</div>
            <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:13px;color:#27272a;line-height:1.8">
              ${sup.bank ? `<tr><td style="padding-right:14px;color:#71717a">Účet</td><td><strong>${esc(sup.bank)}</strong></td></tr>` : ''}
              ${sup.iban ? `<tr><td style="padding-right:14px;color:#71717a">IBAN</td><td>${esc(sup.iban)}</td></tr>` : ''}
              <tr><td style="padding-right:14px;color:#71717a">Var. symbol</td><td><strong>${esc(vs)}</strong></td></tr>
              <tr><td style="padding-right:14px;color:#71717a">Částka</td><td><strong>${money(order.amount, order.currency)}</strong></td></tr>
              ${issued ? `<tr><td style="padding-right:14px;color:#71717a">Vystaveno</td><td>${esc(issued)}</td></tr>` : ''}
              ${due ? `<tr><td style="padding-right:14px;color:#71717a">Splatnost</td><td><strong>${esc(due)}</strong></td></tr>` : ''}
            </table>
          </td>
          ${qr ? `<td valign="top" align="right" style="padding:18px 20px 18px 0"><img src="${esc(qr)}" width="132" height="132" alt="QR platba" style="border-radius:8px;border:1px solid #ece7df;background:#fff"><div style="font-size:10px;color:#a1a1aa;text-align:center;margin-top:4px">QR platba</div></td>` : ''}
        </tr>
      </table>
    </td></tr>

    <tr><td style="padding:8px 32px 4px">
      <div style="font-size:14px;font-weight:800;color:${ACCENT};margin-bottom:8px">Co bude následovat</div>
      <div style="font-size:13px;color:#52525b;line-height:1.7">
        1. Po připsání platby Vám potvrdíme přijetí a <strong>ihned zahájíme zajištění kusu</strong> z prověřeného distribučního kanálu.<br>
        2. Jakmile bude zásilka na cestě, dostanete <strong>sledovací číslo</strong> pojištěné přepravy.<br>
        3. Součástí dodání je krabička, karta, plná dokumentace a <strong>garance pravosti</strong>.
      </div>
    </td></tr>

    <tr><td style="padding:16px 32px 6px">
      <div style="font-size:12px;color:#71717a;line-height:1.6;background:#faf8f4;border-radius:10px;padding:12px 16px">Toto je zálohová faktura (výzva k platbě) — není daňovým dokladem. Daňový doklad Vám vystavíme po přijetí platby.</div>
    </td></tr>

    <tr><td style="padding:16px 32px 28px;border-top:1px solid #f0ede7">
      <div style="font-size:12px;color:#a1a1aa;line-height:1.6">Jakýkoliv dotaz? Stačí odpovědět na tento e-mail.<br>S pozdravem, ${esc(sup.company)} — prémiový segment<br><a href="${SITE}/prestige" style="color:${GOLD};text-decoration:none">swelt.partner/prestige</a></div>
    </td></tr>
  </table>
</td></tr>
</table>
</div>`;

  const text = [
    `ZÁLOHOVÁ FAKTURA ${order.invoice_number} (objednávka ${order.order_number})`,
    '',
    `Dodavatel: ${sup.company}${sup.ico ? `, IČO ${sup.ico}` : ''}${sup.dic ? `, DIČ ${sup.dic}` : ''}`,
    `Odběratel: ${buyerLines.join(', ')}`,
    '',
    'Položky:',
    ...lines.map((l) => `• Záloha 100 % — ${`${l.brand} ${l.model}`.trim()}: ${money(l.price, order.currency)}`),
    ...(isVat ? [`Základ: ${money(order.vat_base, order.currency)} · DPH ${order.vat_rate}%: ${money(order.vat_amount, order.currency)}`] : []),
    `CELKEM K ÚHRADĚ: ${money(order.amount, order.currency)}`,
    '',
    'PLATEBNÍ ÚDAJE:',
    ...(sup.bank ? [`Účet: ${sup.bank}`] : []),
    ...(sup.iban ? [`IBAN: ${sup.iban}`] : []),
    `Variabilní symbol: ${vs}`,
    ...(due ? [`Splatnost: ${due}`] : []),
    '',
    'Po připsání platby ihned zahajujeme zajištění kusu; poté obdržíte sledovací číslo pojištěné přepravy. Součástí dodání je plná dokumentace a garance pravosti.',
    '',
    'Zálohová faktura není daňovým dokladem — ten vystavíme po přijetí platby.',
    '',
    `S pozdravem, ${sup.company} — prémiový segment`,
  ].join('\n');

  return {
    subject: `Zálohová faktura ${order.invoice_number} — objednávka ${order.order_number}`,
    text,
    html,
  };
}

/** POHODA "faktura vydaná" (typ zálohová) dataPack for the accountant. */
export function buildInvoicePohodaXml(inq: InquiryLike, order: PrestigeOrderRow): string {
  const sup = supplierIdentity();
  const xesc = (v: unknown) =>
    String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  const el = (tag: string, value: unknown): string => {
    const v = String(value ?? '').trim();
    return v ? `<${tag}>${xesc(v)}</${tag}>` : '';
  };
  const date = (order.invoice_issued_at ?? new Date().toISOString()).slice(0, 10);
  const dueDate = new Date(new Date(date).getTime() + 7 * 864e5).toISOString().slice(0, 10);
  const item = itemsLabel(inq, order);

  return `<?xml version="1.0" encoding="UTF-8"?>
<dat:dataPack id="${xesc(order.invoice_number)}" ico="${xesc(sup.ico)}" application="swelt.partner" version="2.0" note="Zálohová faktura prestige"
  xmlns:dat="http://www.stormware.cz/schema/version_2/data.xsd"
  xmlns:inv="http://www.stormware.cz/schema/version_2/invoice.xsd"
  xmlns:typ="http://www.stormware.cz/schema/version_2/type.xsd">
  <dat:dataPackItem id="${xesc(order.invoice_number)}-1" version="2.0">
    <inv:invoice version="2.0">
      <inv:invoiceHeader>
        <inv:invoiceType>issuedProformaInvoice</inv:invoiceType>
        <inv:number><typ:numberRequested>${xesc(order.invoice_number)}</typ:numberRequested></inv:number>
        ${el('inv:symVar', variableSymbol(order.invoice_number))}
        <inv:date>${xesc(date)}</inv:date>
        <inv:dateDue>${xesc(dueDate)}</inv:dateDue>
        ${el('inv:text', `Záloha 100 % — ${item} (obj. ${order.order_number})`)}
        <inv:partnerIdentity>
          <typ:address>
            ${el('typ:company', order.bill_company)}
            ${el('typ:name', order.bill_name)}
            ${el('typ:street', order.bill_street)}
            ${el('typ:city', order.bill_city)}
            ${el('typ:zip', order.bill_zip)}
            ${el('typ:ico', order.bill_ico)}
            ${el('typ:dic', order.bill_dic)}
            ${el('typ:email', inq.email)}
          </typ:address>
        </inv:partnerIdentity>
      </inv:invoiceHeader>
      <inv:invoiceSummary>
        <inv:homeCurrency>
          <typ:priceHighSum>${order.amount.toFixed(2)}</typ:priceHighSum>
        </inv:homeCurrency>
      </inv:invoiceSummary>
    </inv:invoice>
  </dat:dataPackItem>
</dat:dataPack>
`;
}

/** Binding-order confirmation — sent right after the admin converts the offer. */
export function orderConfirmationEmail(
  inq: InquiryLike,
  order: PrestigeOrderRow,
): { subject: string; text: string } {
  const first = (order.bill_name || inq.name || '').trim().split(/\s+/)[0] || '';
  const lines = orderLines(inq, order);
  return {
    subject: `Potvrzení závazné objednávky ${order.order_number}`,
    text: `Dobrý den${first ? `, ${first}` : ''},

děkujeme — Vaše závazná objednávka ${order.order_number} je potvrzena. Objednali jste:

${lines.map((l) => `• ${`${l.brand} ${l.model}`.trim()} — ${money(l.price, order.currency)}`).join('\n')}

Celkem: ${money(order.amount, order.currency)}

CO BUDE NÁSLEDOVAT
1. Během chvíle Vám zašleme zálohovou fakturu s platebními údaji.
2. Po připsání platby ihned zahájíme zajištění z prověřeného distribučního kanálu.
3. Jakmile bude zásilka na cestě, dostanete sledovací číslo pojištěné přepravy.

V každém kroku přesně víte, co se s Vaší objednávkou děje — a kdykoliv se můžete ozvat odpovědí na tento e-mail.

S pozdravem
swelt.partner — prémiový segment
https://swelt.partner/prestige`,
  };
}

/** Thank-you e-mail once the payment arrives. */
export function paymentReceivedEmail(
  inq: InquiryLike,
  order: PrestigeOrderRow,
): { subject: string; text: string } {
  const first = (order.bill_name || inq.name || '').trim().split(/\s+/)[0] || '';
  const item = itemsLabel(inq, order);
  return {
    subject: `Platba přijata — zahajujeme zajištění (${order.order_number})`,
    text: `Dobrý den${first ? `, ${first}` : ''},

potvrzujeme přijetí Vaší platby k objednávce ${order.order_number} (faktura ${order.invoice_number}).

Právě zahajujeme zajištění: ${item}.

Co bude následovat:
1. Kus zajistíme z prověřeného distribučního kanálu — s krabičkou, kartou a plnou dokumentací.
2. Jakmile bude zásilka na cestě, pošleme Vám sledovací číslo pojištěné přepravy.
3. Po doručení zůstáváme k dispozici — servis, údržba i budoucí akvizice.

Děkujeme za důvěru — je nám ctí.

S pozdravem
swelt.partner — prémiový segment
https://swelt.partner/prestige`,
  };
}
