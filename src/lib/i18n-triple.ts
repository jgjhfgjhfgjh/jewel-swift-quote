/**
 * TripleGateway translations (4 home cards: partner, dropshipping, luxury, intelligence).
 * Action keys (login/register/navigate) stay in code; only labels translate.
 */
import type { Lang } from './i18n';

export interface TripleCard {
  label: string;
  title: string;
  description: string;
  ctaLabels: string[]; // 1-2 buttons in same order as in component
  detailsHeading: string;
  detailsSubheading?: string;
  bullets: string[];
}

export interface TripleText {
  partner: TripleCard;
  dropshipping: TripleCard;
  luxury: TripleCard;
  intelligence: TripleCard;
}

const cs: TripleText = {
  partner: {
    label: 'B2B', title: 'Velkoobchod',
    description: 'Získejte aktuální ceny a skladové zásoby.',
    ctaLabels: ['Vstoupit', 'Registrovat'],
    detailsHeading: 'Pro ověřené partnery',
    detailsSubheading: 'Velkoobchodní podmínky pro firmy s IČO',
    bullets: ['Aktuální velkoobchodní ceny a slevy', 'Skladové zásoby v reálném čase', 'Přímý přístup k novinkám a kolekcím', 'Individuální cenová politika', 'Rychlé objednávky a expedice'],
  },
  dropshipping: {
    label: 'Swelt.dropshipping', title: 'Dropshipping',
    description: 'Prodávejte, my se postaráme o zbytek.',
    ctaLabels: ['Chci dropshipping'],
    detailsHeading: 'E-shop bez investic',
    detailsSubheading: 'Kompletní fulfillment pod vaší značkou',
    bullets: ['Bez skladových nákladů a investic', 'Logistika, balení a odeslání pod vaší značkou', 'Dodání přímo ke koncovému zákazníkovi', 'Produktový feed pro váš e-shop', 'Široký katalog světových značek'],
  },
  luxury: {
    label: 'Swelt.luxury', title: 'Privátní nákupy',
    description: 'Odemykáme vám exkluzivní přístup.',
    ctaLabels: ['Zjistit více'],
    detailsHeading: 'Pro firmy a živnostníky',
    detailsSubheading: 'Velkoobchodní ceny pro soukromé nákupy',
    bullets: ['Exkluzivní přístup k velkoobchodním cenám', 'Soukromé nákupy nebo firemní dary', 'Už od jednoho kusu', 'Bez nutnosti registrace', 'Diskrétní a profesionální servis'],
  },
  intelligence: {
    label: 'Swelt.intelligence', title: 'Inteligence',
    description: 'Vidíte celý trh, ne jen svůj kousek.',
    ctaLabels: ['Zjistit více'],
    detailsHeading: 'Tržní data pro vaše rozhodování',
    detailsSubheading: 'Prediktivní přehledy postavené na pohybu zboží napříč celou distribucí',
    bullets: ['Prediktivní skóre poptávky pro každý SKU', 'Trendy kategorií dřív, než jsou viditelné trhu', 'Benchmark vašich prodejů vůči anonymnímu trhu', 'Upozornění na rostoucí i klesající produkty', 'Doporučení k akci — naskladnit, sledovat, redukovat'],
  },
};

const sk: TripleText = {
  partner: {
    label: 'B2B', title: 'Veľkoobchod',
    description: 'Získajte aktuálne ceny a skladové zásoby.',
    ctaLabels: ['Vstúpiť', 'Registrovať'],
    detailsHeading: 'Pre overených partnerov',
    detailsSubheading: 'Veľkoobchodné podmienky pre firmy s IČO',
    bullets: ['Aktuálne veľkoobchodné ceny a zľavy', 'Skladové zásoby v reálnom čase', 'Priamy prístup k novinkám a kolekciám', 'Individuálna cenová politika', 'Rýchle objednávky a expedícia'],
  },
  dropshipping: {
    label: 'Swelt.dropshipping', title: 'Dropshipping',
    description: 'Predávajte, my sa postaráme o zvyšok.',
    ctaLabels: ['Chcem dropshipping'],
    detailsHeading: 'E-shop bez investícií',
    detailsSubheading: 'Kompletný fulfillment pod vašou značkou',
    bullets: ['Bez skladových nákladov a investícií', 'Logistika, balenie a odoslanie pod vašou značkou', 'Doručenie priamo ku koncovému zákazníkovi', 'Produktový feed pre váš e-shop', 'Široký katalóg svetových značiek'],
  },
  luxury: {
    label: 'Swelt.luxury', title: 'Privátne nákupy',
    description: 'Odomkýname vám exkluzívny prístup.',
    ctaLabels: ['Zistiť viac'],
    detailsHeading: 'Pre firmy a živnostníkov',
    detailsSubheading: 'Veľkoobchodné ceny pre súkromné nákupy',
    bullets: ['Exkluzívny prístup k veľkoobchodným cenám', 'Súkromné nákupy alebo firemné dary', 'Už od jedného kusu', 'Bez nutnosti registrácie', 'Diskrétny a profesionálny servis'],
  },
  intelligence: {
    label: 'Swelt.intelligence', title: 'Inteligencia',
    description: 'Vidíte celý trh, nie len svoj kúsok.',
    ctaLabels: ['Zistiť viac'],
    detailsHeading: 'Trhové dáta pre vaše rozhodovanie',
    detailsSubheading: 'Prediktívne prehľady postavené na pohybe tovaru naprieč celou distribúciou',
    bullets: ['Prediktívne skóre dopytu pre každé SKU', 'Trendy kategórií skôr, ako sú viditeľné trhu', 'Benchmark vašich predajov voči anonymnému trhu', 'Upozornenia na rastúce i klesajúce produkty', 'Odporúčania k akcii — naskladniť, sledovať, redukovať'],
  },
};

const en: TripleText = {
  partner: {
    label: 'B2B', title: 'Wholesale',
    description: 'Access live prices and stock levels.',
    ctaLabels: ['Enter', 'Register'],
    detailsHeading: 'For verified partners',
    detailsSubheading: 'Wholesale terms for companies with VAT ID',
    bullets: ['Current wholesale prices and discounts', 'Stock levels in real time', 'Direct access to launches and collections', 'Individual pricing policy', 'Fast ordering and dispatch'],
  },
  dropshipping: {
    label: 'Swelt.dropshipping', title: 'Dropshipping',
    description: 'You sell, we handle the rest.',
    ctaLabels: ['I want dropshipping'],
    detailsHeading: 'Shop without investment',
    detailsSubheading: 'Full fulfillment under your brand',
    bullets: ['No stock costs or investment', 'Logistics, packaging and shipping under your brand', 'Delivery direct to the end customer', 'Product feed for your shop', 'Broad catalog of world brands'],
  },
  luxury: {
    label: 'Swelt.luxury', title: 'Private purchases',
    description: 'We unlock exclusive access for you.',
    ctaLabels: ['Learn more'],
    detailsHeading: 'For companies and individuals',
    detailsSubheading: 'Wholesale prices for personal purchases',
    bullets: ['Exclusive access to wholesale prices', 'Personal purchases or corporate gifts', 'From a single piece', 'No registration required', 'Discreet, professional service'],
  },
  intelligence: {
    label: 'Swelt.intelligence', title: 'Intelligence',
    description: 'See the whole market, not just your slice.',
    ctaLabels: ['Learn more'],
    detailsHeading: 'Market data to inform your decisions',
    detailsSubheading: 'Predictive insights built on goods movement across the distribution',
    bullets: ['Predictive demand score for every SKU', 'Category trends before the market sees them', 'Benchmark your sales against the anonymous market', 'Alerts on rising and falling products', 'Action recommendations — restock, watch, reduce'],
  },
};

const de: TripleText = {
  partner: {
    label: 'B2B', title: 'Großhandel',
    description: 'Aktuelle Preise und Bestände abrufen.',
    ctaLabels: ['Eintreten', 'Registrieren'],
    detailsHeading: 'Für verifizierte Partner',
    detailsSubheading: 'Großhandelskonditionen für Firmen mit USt-ID',
    bullets: ['Aktuelle Großhandelspreise und Rabatte', 'Bestände in Echtzeit', 'Direkter Zugang zu Neuheiten und Kollektionen', 'Individuelle Preispolitik', 'Schnelle Bestellung und Versand'],
  },
  dropshipping: {
    label: 'Swelt.dropshipping', title: 'Dropshipping',
    description: 'Sie verkaufen, wir kümmern uns um den Rest.',
    ctaLabels: ['Ich will Dropshipping'],
    detailsHeading: 'Shop ohne Investitionen',
    detailsSubheading: 'Vollständiges Fulfillment unter Ihrer Marke',
    bullets: ['Keine Lagerkosten und Investitionen', 'Logistik, Verpackung und Versand unter Ihrer Marke', 'Lieferung direkt an den Endkunden', 'Produkt-Feed für Ihren Shop', 'Breiter Katalog von Weltmarken'],
  },
  luxury: {
    label: 'Swelt.luxury', title: 'Privatkäufe',
    description: 'Wir öffnen Ihnen exklusiven Zugang.',
    ctaLabels: ['Mehr erfahren'],
    detailsHeading: 'Für Firmen und Selbstständige',
    detailsSubheading: 'Großhandelspreise für private Einkäufe',
    bullets: ['Exklusiver Zugang zu Großhandelspreisen', 'Privatkäufe oder Firmengeschenke', 'Schon ab einem Stück', 'Keine Registrierung erforderlich', 'Diskreter, professioneller Service'],
  },
  intelligence: {
    label: 'Swelt.intelligence', title: 'Intelligence',
    description: 'Sehen Sie den ganzen Markt, nicht nur Ihren Teil.',
    ctaLabels: ['Mehr erfahren'],
    detailsHeading: 'Marktdaten für Ihre Entscheidungen',
    detailsSubheading: 'Prädiktive Einblicke auf Basis der Warenbewegung im gesamten Vertrieb',
    bullets: ['Prädiktiver Demand-Score für jedes SKU', 'Kategorietrends, bevor sie der Markt sieht', 'Benchmark Ihrer Verkäufe gegenüber dem anonymen Markt', 'Alarme bei steigenden und fallenden Produkten', 'Handlungsempfehlungen — einlagern, beobachten, reduzieren'],
  },
};

// Other 14 languages reuse English copy as a high-quality fallback.
const fr = en, es = en, it = en, nl = en, pt = en, hu = en, ro = en;
const sv = en, da = en, fi = en, no = en, el = en, pl = en, is = en;

export const triple: Record<Lang, TripleText> = {
  cs, sk, pl, de, en, fr, es, it, nl, pt, hu, ro, sv, da, fi, no, el, is,
};
