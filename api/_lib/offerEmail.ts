// Rich HTML offer e-mail for a priced prestige inquiry. Combines the LLM-drafted
// luxury copy with the customer's chosen models (photos + specs pulled from the
// curated catalog), a "why buy from us" reassurance block, a transparent
// step-by-step guide of what happens next, and an academy / authenticity tie-in.

import type { InquiryLike } from './inquiryEmails.js';

const SITE = 'https://swelt.partner';
const PRESTIGE_URL = `${SITE}/prestige`;
const ACCENT = '#0f172a'; // zinc-900
const GOLD = '#9a7b4f';

interface CatalogSpec {
  model: string;
  collection?: string;
  reference?: string;
  image?: string;
  params?: Record<string, string>;
  desc?: string;
}
interface CatalogHouse { name: string; domain: string; models: CatalogSpec[] }

export interface OfferWatch {
  brand: string;
  model: string;
  image?: string;
  collection?: string;
  reference?: string;
  params?: Record<string, string>;
  desc?: string;
  /** Per-item price (admin-entered); rendered on the card when set. */
  price?: number;
}

/** One admin-priced line of the offer. */
export interface OfferItem {
  brand: string;
  model: string;
  price: number;
}

/** Enrich the inquiry's watches with photos/specs from the curated catalog. */
export async function enrichWatches(
  watches: { brand: string; model: string; custom?: boolean }[],
): Promise<OfferWatch[]> {
  let houses: CatalogHouse[] = [];
  try {
    const mod = await import('../../src/data/luxuryCatalog.js');
    houses = (mod as { LUXURY_HOUSES: CatalogHouse[] }).LUXURY_HOUSES;
  } catch {
    houses = [];
  }
  return (watches ?? [])
    .filter((w) => w.brand !== 'Konzultace')
    .map((w) => {
      const house = houses.find(
        (h) => h.name === w.brand || h.name.startsWith(w.brand) || w.brand.startsWith(h.name.split(' ')[0]),
      );
      const spec = house?.models.find(
        (m) => m.model === w.model || w.model.startsWith(m.model) || m.model.startsWith(w.model),
      );
      return {
        brand: w.brand,
        model: w.model,
        image: spec?.image,
        collection: spec?.collection,
        reference: spec?.reference,
        params: spec?.params,
        desc: spec?.desc,
      };
    });
}

function esc(s: string): string {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function firstName(full: string): string {
  return (full || '').trim().split(/\s+/)[0] || '';
}

/** Render the admin-approved copy (plain text w/ blank-line paragraphs) as HTML. */
function bodyToHtml(body: string): string {
  return (body || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#27272a">${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function fmtMoney(n: number, currency: string): string {
  return `${n.toLocaleString('cs-CZ')} ${currency}`;
}

function watchCard(w: OfferWatch, currency?: string): string {
  const specRows = Object.entries(w.params ?? {})
    .slice(0, 4)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:2px 12px 2px 0;font-size:12px;color:#71717a;white-space:nowrap">${esc(k)}</td><td style="padding:2px 0;font-size:12px;color:#27272a">${esc(v)}</td></tr>`,
    )
    .join('');
  const photo = w.image
    ? `<td width="140" valign="top" style="padding:0 16px 0 0"><img src="${esc(w.image)}" width="124" alt="${esc(w.brand)} ${esc(w.model)}" style="width:124px;height:auto;border-radius:8px;background:#fff;border:1px solid #ece7df"></td>`
    : '';
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border:1px solid #ece7df;border-radius:12px;background:#fff">
    <tr><td style="padding:16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        ${photo}
        <td valign="top">
          <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${GOLD};font-weight:700">${esc(w.brand)}</div>
          <div style="font-size:18px;font-weight:700;color:${ACCENT};margin:2px 0 2px">${esc(w.model)}</div>
          ${w.collection ? `<div style="font-size:12px;color:#a1a1aa;margin-bottom:8px">Kolekce ${esc(w.collection)}${w.reference ? ` · ref. ${esc(w.reference)}` : ''}</div>` : ''}
          ${w.desc ? `<div style="font-size:13px;color:#52525b;line-height:1.5;margin-bottom:8px">${esc(w.desc)}</div>` : ''}
          <table role="presentation" cellpadding="0" cellspacing="0">${specRows}</table>
          ${typeof w.price === 'number' && currency ? `<div style="margin-top:10px;padding-top:8px;border-top:1px solid #f0ede7;font-size:15px;font-weight:800;color:${ACCENT}">${fmtMoney(w.price, currency)} <span style="font-size:11px;font-weight:600;color:#a1a1aa">na klíč</span></div>` : ''}
        </td>
      </tr></table>
    </td></tr>
  </table>`;
}

function stepsBlock(): string {
  const steps = [
    ['1', 'Schválení nabídky', 'Odpovíte na tento e-mail (nebo zavoláte). Nabídka je zatím nezávazná — teprve tímto ji potvrzujete.'],
    ['2', 'Závazná objednávka', 'Zašleme Vám shrnutí a potvrzení objednávky. Přesně víte, co objednáváte, za jakou cenu a s jakou dodací lhůtou.'],
    ['3', 'Zálohová faktura', 'Vystavíme zálohovou fakturu. Platíte až na základě řádného dokladu — nikdy ne „naslepo".'],
    ['4', 'Zajištění kusu', 'Model zajistíme z prověřeného distribučního kanálu, s krabičkou, kartou a plnou dokumentací. Průběžně Vás informujeme.'],
    ['5', 'Doručení', 'Pojištěná zásilka s možností sledování. Doklad o pravosti a mezinárodní záruka jsou součástí.'],
    ['6', 'Péče po nákupu', 'Ozveme se, zda vše sedělo, a zůstáváme Vám k dispozici pro servis, doplňky i budoucí akvizice.'],
  ];
  return steps
    .map(
      ([n, t, d]) => `
    <tr>
      <td width="34" valign="top" style="padding:6px 12px 6px 0">
        <div style="width:26px;height:26px;border-radius:50%;background:${ACCENT};color:#fff;font-size:13px;font-weight:700;text-align:center;line-height:26px">${n}</div>
      </td>
      <td valign="top" style="padding:6px 0">
        <div style="font-size:14px;font-weight:700;color:${ACCENT}">${t}</div>
        <div style="font-size:13px;color:#52525b;line-height:1.5">${d}</div>
      </td>
    </tr>`,
    )
    .join('');
}

export interface OfferOptions {
  price: string;
  currency: string;
  body: string;
  /** Per-model prices; when set they drive the cards and the summed total. */
  items?: OfferItem[];
}

export async function buildOfferEmail(
  inquiry: InquiryLike,
  opts: OfferOptions,
): Promise<{ subject: string; text: string; html: string }> {
  let watches: OfferWatch[];
  let priceLabel: string;
  if (opts.items?.length) {
    const enriched = await enrichWatches(opts.items.map((i) => ({ brand: i.brand, model: i.model })));
    watches = opts.items.map((it, idx) => ({ ...(enriched[idx] ?? { brand: it.brand, model: it.model }), price: it.price }));
    priceLabel = fmtMoney(opts.items.reduce((s, i) => s + i.price, 0), opts.currency);
  } else {
    watches = await enrichWatches(inquiry.watches);
    priceLabel = `${esc(opts.price)}${opts.currency ? ` ${esc(opts.currency)}` : ''}`;
  }
  const multi = watches.length > 1;
  const hi = firstName(inquiry.name);

  const html = `<!-- offer -->
<div style="margin:0;padding:0;background:#f4f2ee">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee">
<tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <tr><td style="background:${ACCENT};padding:28px 32px">
      <div style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-.01em">swelt<span style="color:${GOLD}">.</span>partner</div>
      <div style="color:#cbd5e1;font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin-top:4px">Osobní cenová nabídka · prémiový segment</div>
    </td></tr>

    <tr><td style="padding:28px 32px 8px">
      <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#27272a">Dobrý den${hi ? `, ${esc(hi)}` : ''},</p>
      ${bodyToHtml(opts.body)}
    </td></tr>

    <tr><td style="padding:8px 32px 4px">
      <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#a1a1aa;font-weight:700;margin-bottom:12px">Vybrané modely</div>
      ${watches.length ? watches.map((w) => watchCard(w, opts.currency)).join('') : '<p style="font-size:14px;color:#52525b">Modely upřesníme dle konzultace.</p>'}
    </td></tr>

    <tr><td style="padding:8px 32px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f4;border:1px solid #ece7df;border-radius:12px">
        <tr><td style="padding:20px 24px">
          <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${GOLD};font-weight:700">${multi ? 'Cena celkem na klíč' : 'Cena na klíč'}</div>
          <div style="font-size:30px;font-weight:800;color:${ACCENT};margin-top:4px">${priceLabel}</div>
          <div style="font-size:12px;color:#71717a;margin-top:4px">Vč. ověření pravosti, plné dokumentace a pojištěného doručení. Nezávazné do Vašeho potvrzení${multi ? ' — vybrat si můžete i jen některé modely' : ''}.</div>
        </td></tr>
      </table>
    </td></tr>

    <tr><td style="padding:20px 32px 4px">
      <div style="font-size:15px;font-weight:800;color:${ACCENT};margin-bottom:10px">Proč pořídit právě u nás</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;font-size:14px;color:#3f3f46;line-height:1.55">✓ <strong>Garance pravosti</strong> — každý kus s krabičkou, kartou a mezinárodní zárukou.</td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#3f3f46;line-height:1.55">✓ <strong>Nejlepší možná cena</strong> — velkoobchodní podmínky i na jediný kus, transparentně.</td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#3f3f46;line-height:1.55">✓ <strong>Diskrétní služba na klíč</strong> — zajistíme, doručíme, staráme se i po nákupu.</td></tr>
      </table>
    </td></tr>

    <tr><td style="padding:20px 32px 4px">
      <div style="font-size:15px;font-weight:800;color:${ACCENT};margin-bottom:12px">Jak to bude dál — přesně víte, co se děje</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${stepsBlock()}</table>
    </td></tr>

    <tr><td style="padding:16px 32px 4px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:12px">
        <tr><td style="padding:18px 22px">
          <div style="font-size:13px;color:#e2e8f0;line-height:1.6">Jako náš klient máte přístup k <strong style="color:#fff">Hodinkářské akademii</strong> — jak ověřit pravost, které modely drží hodnotu jako investice a jak o hodinky pečovat, aby vydržely generace.</div>
        </td></tr>
      </table>
    </td></tr>

    <tr><td align="center" style="padding:24px 32px 8px">
      <a href="mailto:info@swelt.cz?subject=${encodeURIComponent('Mám zájem — závazná objednávka')}" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:10px">Mám zájem — závazně objednat</a>
      <div style="font-size:12px;color:#a1a1aa;margin-top:12px">Nebo jednoduše odpovězte na tento e-mail — rádi zodpovíme jakýkoliv dotaz.</div>
    </td></tr>

    <tr><td style="padding:20px 32px 28px;border-top:1px solid #f0ede7">
      <div style="font-size:12px;color:#a1a1aa;line-height:1.6">S pozdravem,<br>swelt.partner — prémiový segment na poptávku<br><a href="${PRESTIGE_URL}" style="color:${GOLD};text-decoration:none">${PRESTIGE_URL.replace('https://', '')}</a></div>
    </td></tr>
  </table>
</td></tr>
</table>
</div>`;

  const textLines = [
    `Dobrý den${hi ? `, ${hi}` : ''},`,
    '',
    opts.body,
    '',
    'VYBRANÉ MODELY:',
    ...(watches.length
      ? watches.map((w) => `• ${w.brand} ${w.model}${typeof w.price === 'number' ? ` — ${fmtMoney(w.price, opts.currency)}` : ''}`)
      : ['(upřesníme dle konzultace)']),
    '',
    `${multi ? 'CENA CELKEM NA KLÍČ' : 'CENA NA KLÍČ'}: ${priceLabel.replace(/<[^>]+>/g, '')}`,
    `Vč. ověření pravosti, plné dokumentace a pojištěného doručení. Nezávazné do Vašeho potvrzení${multi ? ' — vybrat si můžete i jen některé modely' : ''}.`,
    '',
    'PROČ U NÁS: garance pravosti · nejlepší možná cena i na 1 kus · diskrétní služba na klíč.',
    '',
    'JAK TO BUDE DÁL: 1) schválení nabídky 2) závazná objednávka 3) zálohová faktura 4) zajištění kusu 5) pojištěné doručení 6) péče po nákupu.',
    '',
    'Mám zájem? Odpovězte na tento e-mail nebo napište na info@swelt.cz.',
    '',
    'S pozdravem, swelt.partner — prémiový segment',
    PRESTIGE_URL,
  ];

  return {
    subject: `Vaše osobní nabídka — ${watches.length ? watches.map((w) => w.brand).slice(0, 2).join(', ') : 'prémiový segment'}`,
    text: textLines.join('\n'),
    html,
  };
}
