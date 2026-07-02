// POHODA XML renderer — builds a Stormware dataPack with a received order
// (objednávka přijatá) that the supplier (Zago, POHODA E1) imports directly:
// Soubor → Datová komunikace → XML import/export, or automated via Jazzware.
//
// Schema: http://www.stormware.cz/xml (version 2, order.xsd uses xsd:all so
// element order is flexible; everything except orderType/date/partnerIdentity
// is optional). Prices are intentionally omitted — POHODA fills them from the
// supplier's own stock cards; our purchase prices travel in the e-mail body.
//
// Config (env):
//   POHODA_ICO         — accounting unit the dataPack targets (Zago IČO)
//   SWELT_COMPANY_NAME — ordering party shown in partnerIdentity
//   SWELT_ICO, SWELT_DIC

import type { SupplierPayload } from './supplier.js';

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Non-empty element or empty string (POHODA dislikes empty tags). */
function el(tag: string, value: unknown): string {
  const v = String(value ?? '').trim();
  return v ? `<${tag}>${esc(v)}</${tag}>` : '';
}

export function buildPohodaOrderXml(payload: SupplierPayload): string {
  const ico = process.env.POHODA_ICO ?? '28741846';
  const buyerCompany = process.env.SWELT_COMPANY_NAME ?? 'swelt.partner';
  const buyerIco = process.env.SWELT_ICO ?? '';
  const buyerDic = process.env.SWELT_DIC ?? '';

  const date = payload.created_at.slice(0, 10);

  const noteParts = [
    payload.order_type === 'dropship' ? 'DROPSHIP (white-label)' : 'VELKOOBCHOD',
    payload.branding.brand_name ? `Branding: ${payload.branding.brand_name}` : 'Branding: neutrální',
    `Doprava: ${payload.shipping.name}`,
    payload.cod ? `DOBÍRKA ${payload.cod.amount.toFixed(2)} ${payload.cod.currency}` : 'bez dobírky',
    payload.external_ref ? `Ref. partnera: ${payload.external_ref}` : '',
    payload.note ? `Pozn.: ${payload.note}` : '',
  ].filter(Boolean);

  const items = payload.items.map((i) => `
      <ord:orderItem>
        ${el('ord:text', `${i.name}${i.ean ? ` (EAN ${i.ean})` : ''}`)}
        <ord:quantity>${i.quantity}</ord:quantity>
        ${el('ord:code', i.sku)}
      </ord:orderItem>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<dat:dataPack id="${esc(payload.order_number)}" ico="${esc(ico)}" application="swelt.partner" version="2.0" note="Objednávka swelt.partner"
  xmlns:dat="http://www.stormware.cz/schema/version_2/data.xsd"
  xmlns:ord="http://www.stormware.cz/schema/version_2/order.xsd"
  xmlns:typ="http://www.stormware.cz/schema/version_2/type.xsd">
  <dat:dataPackItem id="${esc(payload.order_number)}-1" version="2.0">
    <ord:order version="2.0">
      <ord:orderHeader>
        <ord:orderType>receivedOrder</ord:orderType>
        ${el('ord:numberOrder', payload.external_ref ?? payload.order_number)}
        <ord:date>${esc(date)}</ord:date>
        ${el('ord:text', noteParts.join(' | '))}
        <ord:partnerIdentity>
          <typ:address>
            ${el('typ:company', buyerCompany)}
            ${el('typ:ico', buyerIco)}
            ${el('typ:dic', buyerDic)}
          </typ:address>
          <typ:shipToAddress>
            ${el('typ:company', payload.ship_to.company)}
            ${el('typ:name', payload.ship_to.name)}
            ${el('typ:street', payload.ship_to.street)}
            ${el('typ:city', payload.ship_to.city)}
            ${el('typ:zip', payload.ship_to.zip)}
            ${el('typ:country', payload.ship_to.country)}
            ${el('typ:phone', payload.ship_to.phone)}
            ${el('typ:email', payload.ship_to.email)}
          </typ:shipToAddress>
        </ord:partnerIdentity>
      </ord:orderHeader>
      <ord:orderDetail>${items}
      </ord:orderDetail>
    </ord:order>
  </dat:dataPackItem>
</dat:dataPack>
`;
}
