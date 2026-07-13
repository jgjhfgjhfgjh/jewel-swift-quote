// After-sales e-mails for prestige orders: shipment notification with tracking,
// the satisfaction survey after delivery, and the thank-you gift (digital care
// guide + a voucher for the next acquisition).
//
// Config (env): AFTERCARE_VOUCHER_VALUE (e.g. "5 000 Kč", default) — the value
// printed on the voucher; the code is PRESTIGE-<order_number> so the admin can
// verify it against the order.

import type { InquiryLike } from './inquiryEmails.js';
import { statusPageUrl, type PrestigeOrderRow } from './invoiceEmail.js';
import { siteUrl } from './email.js';

function firstName(inq: InquiryLike, order: PrestigeOrderRow): string {
  return (order.bill_name || inq.name || '').trim().split(/\s+/)[0] || '';
}

function hello(inq: InquiryLike, order: PrestigeOrderRow): string {
  const f = firstName(inq, order);
  return `Dobrý den${f ? `, ${f}` : ''},`;
}

export function orderShippedEmail(
  inq: InquiryLike,
  order: PrestigeOrderRow,
): { subject: string; text: string } {
  const tracking = [
    order.carrier ? `Přepravce: ${order.carrier}` : '',
    order.tracking_number ? `Sledovací číslo: ${order.tracking_number}` : '',
    order.tracking_url ? `Sledování zásilky: ${order.tracking_url}` : '',
  ].filter(Boolean);
  return {
    subject: `Vaše hodinky jsou na cestě — ${order.order_number}`,
    text: `${hello(inq, order)}

skvělá zpráva: Vaše objednávka ${order.order_number} je zabalena a předána pojištěné přepravě.

${tracking.length ? tracking.join('\n') : 'Sledovací údaje doplníme během chvíle.'}

Zásilka je plně pojištěna a obsahuje krabičku, kartu i kompletní dokumentaci s garancí pravosti.

Stav objednávky online: ${statusPageUrl(order)}

Přejeme příjemné očekávání — ozveme se ještě po doručení.

S pozdravem
swelt.partner — prémiový segment`,
  };
}

export function satisfactionSurveyEmail(
  inq: InquiryLike,
  order: PrestigeOrderRow,
): { subject: string; text: string } {
  const base = statusPageUrl(order);
  return {
    subject: 'Jak jste spokojeni se svými novými hodinkami?',
    text: `${hello(inq, order)}

doufáme, že si nové hodinky užíváte. Vaše spokojenost je pro nás to nejdůležitější — budeme rádi za krátké ohodnocení (zabere 10 vteřin):

★★★★★ Výborné:   ${base}?hodnoceni=5
★★★★   Velmi dobré: ${base}?hodnoceni=4
★★★     Dobré:      ${base}?hodnoceni=3
★★       Slabší:     ${base}?hodnoceni=2
★         Špatné:     ${base}?hodnoceni=1

Cokoliv nesedí? Odpovězte na tento e-mail — osobně to vyřešíme.

Děkujeme za důvěru.

S pozdravem
swelt.partner — prémiový segment`,
  };
}

export function aftercareGiftEmail(
  inq: InquiryLike,
  order: PrestigeOrderRow,
): { subject: string; text: string } {
  const voucherValue = process.env.AFTERCARE_VOUCHER_VALUE ?? '5 000 Kč';
  const voucherCode = `PRESTIGE-${order.order_number ?? ''}`;
  return {
    subject: 'Dárek pro Vás — průvodce péčí a voucher na příští akvizici',
    text: `${hello(inq, order)}

jako poděkování za Vaši důvěru máme dva dárky.

1) DIGITÁLNÍ PRŮVODCE PÉČÍ A PRAVOSTÍ
Vše, co Vaše hodinky potřebují, aby vydržely generace: údržba, servisní
intervaly, skladování a jak kdykoliv doložit pravost. Průvodce (můžete si jej
i vytisknout) najdete zde:
${siteUrl()}/pruvodce-peci

2) VOUCHER ${voucherValue} NA PŘÍŠTÍ AKVIZICI
Kód: ${voucherCode}
Při další poptávce jej stačí zmínit — odečteme jej z ceny. Platí pro Vás
i pro osobu, které jej věnujete.

Kdykoliv budete chtít poradit s dalším kusem — od investičních ikon po dárky —
jsme Vám k dispozici: ${siteUrl()}/prestige

S úctou
swelt.partner — prémiový segment`,
  };
}
