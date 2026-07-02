// Tests the POHODA XML renderer that lives in api/_lib (Vercel side) —
// vitest only picks up tests under src/**, hence the relative import.
import { describe, expect, it } from 'vitest';
import { buildPohodaOrderXml } from '../../api/_lib/pohodaXml.js';
import type { SupplierPayload } from '../../api/_lib/supplier.js';

const payload: SupplierPayload = {
  document: 'ORDER',
  order_number: 'SW-2026-00042',
  order_type: 'dropship',
  external_ref: 'ESHOP-777',
  created_at: '2026-07-02T10:00:00+00:00',
  buyer: { company: 'Partner s.r.o.', ico: '12345678', vat_id: 'CZ12345678' },
  branding: { mode: 'partner', brand_name: 'MyBrand & Co' },
  ship_to: {
    name: 'Jan Novák', company: '', street: 'Dlouhá 12', city: 'Praha',
    zip: '11000', country: 'CZ', phone: '+420777111222', email: 'jan@example.com',
  },
  shipping: { code: 'dhl-parcel', name: 'DHL Parcel Connect' },
  cod: { amount: 99.9, currency: 'EUR' },
  note: 'Křehké <sklo>',
  items: [
    {
      line_no: 1, supplier_product_id: '53567', sku: '590782C01-19',
      ean: '5700302970753', name: 'Náramek PANDORA', manufacturer: 'PANDORA',
      quantity: 2, unit_price: 52.5, currency: 'EUR',
    },
  ],
  totals: { purchase_subtotal: 105, currency: 'EUR' },
};

describe('buildPohodaOrderXml', () => {
  it('renders a parseable dataPack with receivedOrder', () => {
    const xml = buildPohodaOrderXml(payload);

    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    expect(doc.querySelector('parsererror')).toBeNull();

    expect(xml).toContain('<ord:orderType>receivedOrder</ord:orderType>');
    expect(xml).toContain('ico="28741846"'); // dataPack targets Zago's accounting unit
    expect(xml).toContain('<ord:numberOrder>ESHOP-777</ord:numberOrder>');
    expect(xml).toContain('<typ:name>Jan Novák</typ:name>');
    expect(xml).toContain('<typ:country>CZ</typ:country>');
    expect(xml).toContain('<ord:code>590782C01-19</ord:code>');
    expect(xml).toContain('<ord:quantity>2</ord:quantity>');
    // note carries COD + branding for the operator
    expect(xml).toContain('DOBÍRKA 99.90 EUR');
    expect(xml).toContain('MyBrand &amp; Co');
    // XML-unsafe note text must be escaped
    expect(xml).toContain('Křehké &lt;sklo&gt;');
  });

  it('falls back to order_number and omits empty elements', () => {
    const xml = buildPohodaOrderXml({ ...payload, external_ref: null, cod: null, note: null });
    expect(xml).toContain('<ord:numberOrder>SW-2026-00042</ord:numberOrder>');
    expect(xml).toContain('bez dobírky');
    expect(xml).not.toContain('<typ:company></typ:company>');
  });
});
