/**
 * DEAL (closeout offers) translations.
 * CS + EN fully translated; all other languages fall back to EN.
 */
import { ALL_LANGS, type Lang } from './i18n';

export interface DealsText {
  navLabel: string;
  // landing
  hero: { badge: string; heading: string; sub: string; cta: string; ctaSecondary: string };
  stats: { deals: string; brands: string; discount: string };
  how: { eyebrow: string; heading: string; steps: { title: string; desc: string }[] };
  active: { eyebrow: string; heading: string; sub: string; empty: string };
  conditions: { eyebrow: string; heading: string; items: { title: string; desc: string }[] };
  // deal card
  card: { models: string; brands: string; view: string; endsIn: string; discountUpTo: string; ended: string; closed: string };
  // deal detail
  detail: {
    backToDeals: string;
    supplier: string;
    catalogHeading: string;
    filterAll: string;
    searchPlaceholder: string;
    noMatch: string;
    loginToOrder: string;
    closedNotice: string;
  };
  countdown: { label: string; closed: string; days: string; hours: string; minutes: string; seconds: string };
  progress: {
    title: string;
    minOrder: string;
    pcs: string;
    validUnlocked: string;
    needMoreForValid: string; // {n}
    unlockNext: string;       // {n} {percent}
    topReached: string;       // {percent}
    currentDiscount: string;
    tierUnlocked: string;     // {percent}
    tierLocked: string;       // {qty}
  };
  orderBar: {
    items: string;
    value: string;
    margin: string;
    discount: string;
    submit: string;
    submitLocked: string; // {n}
    empty: string;
  };
  product: { rrp: string; yourPrice: string; inStock: string; soldOut: string; margin: string; add: string; perPc: string };
}

const cs: DealsText = {
  navLabel: 'DEAL nabídky',
  hero: {
    badge: 'Closeout nabídky',
    heading: 'Časově omezené DEAL nabídky pro partnery',
    sub: 'Closeout kolekce předních značek za mimořádných podmínek. Čím více kusů objednáte, tím vyšší sleva — až 68 %. Nabídky jsou časově omezené a rezervují se dle pořadí objednávek.',
    cta: 'Procházet nabídky',
    ctaSecondary: 'Jak to funguje',
  },
  stats: { deals: 'Aktivní nabídky', brands: 'Značek v nabídce', discount: 'Maximální sleva' },
  how: {
    eyebrow: 'Jak to funguje',
    heading: 'Od výběru nabídky k odemčené slevě',
    steps: [
      { title: 'Vyberte nabídku', desc: 'Procházejte aktivní closeout dealy a katalog jednotlivých modelů.' },
      { title: 'Naplňte objednávku', desc: 'Skládejte kusy napříč značkami. Sledujte, jak se plní minimální odběr.' },
      { title: 'Odemkněte slevu', desc: '50 ks = sleva 66 %, 100 ks = 67 %, 200 ks = 68 %. Sleva platí na celou objednávku.' },
      { title: 'Potvrďte včas', desc: 'Rezervace probíhá dle pořadí přijatých objednávek. Kdo objedná dříve, bude dříve obsloužen.' },
    ],
  },
  active: {
    eyebrow: 'Aktuální nabídky',
    heading: 'Aktivní DEAL nabídky',
    sub: 'Každá nabídka má vlastní katalog, odpočet do uzávěrky a slevové hladiny dle objednaného množství.',
    empty: 'Momentálně nejsou žádné aktivní nabídky. Brzy přidáme nové.',
  },
  conditions: {
    eyebrow: 'Obchodní podmínky',
    heading: 'Jak nákup z DEAL nabídky probíhá',
    items: [
      { title: 'Na objednávku', desc: 'Closeout zboží na objednávku, dodací lhůta cca 4–6 týdnů.' },
      { title: 'Záloha 30 %', desc: 'Po přijetí objednávky vystavíme zálohovou fakturu 30 %. Platba do 3 pracovních dnů, jinak je objednávka zrušena.' },
      { title: 'Platba převodem', desc: 'Platba předem je akceptována pouze bankovním převodem.' },
      { title: 'Finální faktura', desc: 'Po naskladnění vystavíme finální fakturu se započtenou 30% zálohou. Po doplacení zboží ihned expedujeme.' },
      { title: 'Dle pořadí', desc: 'Otevřená offline nabídka — rezervace modelů a kusů probíhá dle pořadí přijatých objednávek.' },
    ],
  },
  card: {
    models: 'modelů', brands: 'značek', view: 'Zobrazit nabídku',
    endsIn: 'Končí za', discountUpTo: 'Sleva až', ended: 'Ukončeno', closed: 'Uzavřeno',
  },
  detail: {
    backToDeals: 'Zpět na nabídky',
    supplier: 'Dodavatel',
    catalogHeading: 'Katalog nabídky',
    filterAll: 'Všechny značky',
    searchPlaceholder: 'Hledat model, SKU, EAN…',
    noMatch: 'Žádný model neodpovídá filtru.',
    loginToOrder: 'Pro objednání a zobrazení cen se přihlaste.',
    closedNotice: 'Tato nabídka je uzavřená — objednávky již nelze zadávat.',
  },
  countdown: {
    label: 'Nabídka končí za', closed: 'Nabídka uzavřena',
    days: 'dní', hours: 'hod', minutes: 'min', seconds: 's',
  },
  progress: {
    title: 'Naplnění minimální objednávky',
    minOrder: 'Minimální odběr',
    pcs: 'ks',
    validUnlocked: 'Platná objednávka odemčena',
    needMoreForValid: 'Pro platnou objednávku přidejte ještě {n} ks',
    unlockNext: 'Do slevy {percent} % zbývá {n} ks',
    topReached: 'Maximální sleva {percent} % odemčena',
    currentDiscount: 'Aktuální sleva',
    tierUnlocked: 'Sleva {percent} %',
    tierLocked: 'od {qty} ks',
  },
  orderBar: {
    items: 'Kusů v objednávce',
    value: 'Hodnota objednávky',
    margin: 'Vaše marže',
    discount: 'Aktuální sleva',
    submit: 'Odeslat poptávku',
    submitLocked: 'Přidejte ještě {n} ks',
    empty: 'Vyberte modely a sestavte objednávku.',
  },
  product: {
    rrp: 'RRP', yourPrice: 'Vaše cena', inStock: 'skladem', soldOut: 'Vyprodáno',
    margin: 'Marže', add: 'Přidat', perPc: 'za ks',
  },
};

const en: DealsText = {
  navLabel: 'DEAL offers',
  hero: {
    badge: 'Closeout offers',
    heading: 'Time-limited DEAL offers for partners',
    sub: 'Closeout collections from leading brands on exceptional terms. The more units you order, the higher the discount — up to 68 %. Offers are time-limited and reserved in the order received.',
    cta: 'Browse offers',
    ctaSecondary: 'How it works',
  },
  stats: { deals: 'Active offers', brands: 'Brands on offer', discount: 'Maximum discount' },
  how: {
    eyebrow: 'How it works',
    heading: 'From picking an offer to unlocking the discount',
    steps: [
      { title: 'Pick an offer', desc: 'Browse active closeout deals and the catalog of individual models.' },
      { title: 'Build your order', desc: 'Combine units across brands. Watch the minimum order fill up.' },
      { title: 'Unlock the discount', desc: '50 pcs = 66 % off, 100 pcs = 67 %, 200 pcs = 68 %. The discount applies to the whole order.' },
      { title: 'Confirm in time', desc: 'Reservations follow the order received — first come, first served.' },
    ],
  },
  active: {
    eyebrow: 'Current offers',
    heading: 'Active DEAL offers',
    sub: 'Each offer has its own catalog, a countdown to the deadline and discount tiers by ordered quantity.',
    empty: 'There are no active offers right now. New ones are coming soon.',
  },
  conditions: {
    eyebrow: 'Business terms',
    heading: 'How a DEAL purchase works',
    items: [
      { title: 'Made to order', desc: 'Closeout goods made to order, delivery in approx. 4–6 weeks.' },
      { title: '30 % deposit', desc: 'A 30 % deposit invoice is issued on order. Payment within 3 business days, otherwise the order is cancelled.' },
      { title: 'Bank transfer', desc: 'Advance payment is accepted by bank transfer only.' },
      { title: 'Final invoice', desc: 'After goods arrive a final invoice is issued with the 30 % deposit deducted. Goods ship immediately after settlement.' },
      { title: 'Order received', desc: 'Open offline offer — models and units are reserved in the order received.' },
    ],
  },
  card: {
    models: 'models', brands: 'brands', view: 'View offer',
    endsIn: 'Ends in', discountUpTo: 'Up to', ended: 'Ended', closed: 'Closed',
  },
  detail: {
    backToDeals: 'Back to offers',
    supplier: 'Supplier',
    catalogHeading: 'Offer catalog',
    filterAll: 'All brands',
    searchPlaceholder: 'Search model, SKU, EAN…',
    noMatch: 'No model matches the filter.',
    loginToOrder: 'Sign in to order and see prices.',
    closedNotice: 'This offer is closed — orders can no longer be placed.',
  },
  countdown: {
    label: 'Offer ends in', closed: 'Offer closed',
    days: 'days', hours: 'hrs', minutes: 'min', seconds: 's',
  },
  progress: {
    title: 'Minimum order progress',
    minOrder: 'Minimum order',
    pcs: 'pcs',
    validUnlocked: 'Valid order unlocked',
    needMoreForValid: 'Add {n} more pcs for a valid order',
    unlockNext: '{n} pcs left to unlock {percent} %',
    topReached: 'Maximum discount {percent} % unlocked',
    currentDiscount: 'Current discount',
    tierUnlocked: '{percent} % off',
    tierLocked: 'from {qty} pcs',
  },
  orderBar: {
    items: 'Items in order',
    value: 'Order value',
    margin: 'Your margin',
    discount: 'Current discount',
    submit: 'Send enquiry',
    submitLocked: 'Add {n} more pcs',
    empty: 'Pick models and build your order.',
  },
  product: {
    rrp: 'RRP', yourPrice: 'Your price', inStock: 'in stock', soldOut: 'Sold out',
    margin: 'Margin', add: 'Add', perPc: 'per pc',
  },
};

export const dealsI18n: Record<Lang, DealsText> = ALL_LANGS.reduce((acc, lang) => {
  acc[lang] = lang === 'cs' ? cs : en;
  return acc;
}, {} as Record<Lang, DealsText>);

/** Substitute {key} placeholders in a translation string. */
export function fillTemplate(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
