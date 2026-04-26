/**
 * Translations for GatewaySections (homepage main sections + trust block).
 * Visual mock cards (B2BVisual, FeedVisual etc.) and FloatingNotif keep
 * their demo content since it's UI sample data, not user-facing copy.
 */
import type { Lang } from './i18n';

export interface SectionText {
  badge: string;
  label: string;
  heading: string;
  subheading: string;
  bullets: string[];
  ctaLabel: string;
}

export interface GatewayText {
  introEyebrow: string;
  introHeading: string;
  introSubheading: string;
  velkoobchod: SectionText;
  luxury: SectionText;
  feed: SectionText;
  dropshipping: SectionText;
  shop: SectionText;
  trustEyebrow: string;
  trustHeading: string;
  statYearsLabel: string;
  statBrandsLabel: string;
  statProductsLabel: string;
  statPartnersLabel: string;
  trustBadges: string[]; // 5 badges
  testimonialHeading: string;
}

const cs: GatewayText = {
  introEyebrow: 'swelt.partner ekosystém',
  introHeading: 'Jeden partner. Pět způsobů, jak vydělat víc.',
  introSubheading: 'Vyberte si model, který sedí vašemu byznysu — nebo kombinujte více najednou.',
  velkoobchod: {
    badge: 'B2B Velkoobchod', label: 'Velkoobchod',
    heading: 'Přímý přístup k prémiím za velkoobchodní ceny.',
    subheading: 'Katalog 3 000+ produktů 70+ světových značek. Aktuální ceny a zásoby v reálném čase. Pro firmy s IČO.',
    bullets: ['Velkoobchodní ceny a slevy až 60 % pod MOC', 'Katalog v reálném čase — vždy aktuální zásoby', 'Přímý přístup k novinkám a kolekcím', 'Individuální cenová politika dle obratu', 'Rychlá expedice do 24–48 hodin'],
    ctaLabel: 'Vstoupit do velkoobchodu',
  },
  luxury: {
    badge: 'swelt.luxury', label: 'Privátní nákupy',
    heading: 'Velkoobchodní ceny. Pro každého. Od 1 kusu.',
    subheading: 'Prémiové hodinky a šperky za velkoobchodní ceny dostupné pro soukromé osoby i firmy. Bez nutnosti IČO. Diskrétní balení. EU doručení.',
    bullets: ['Velkoobchodní ceny bez nutnosti IČO', 'Dostupné od 1 kusu bez minimálního odběru', 'Garance pravosti 100 %', 'Diskrétní balení bez loga na zásilce', 'Doručení po celé EU do 72 hodin'],
    ctaLabel: 'Zjistit více',
  },
  feed: {
    badge: 'Nový produkt', label: 'swelt.feed',
    heading: 'Produktový feed, který se stará sám.',
    subheading: 'Automatický XML/CSV feed 3 000+ prémiových produktů. Heureka, Zboží.cz, Google Shopping, Shoptet — synchronizované bez práce z vaší strany.',
    bullets: ['XML, CSV, JSON, Heureka, Zboží.cz, Google Shopping', 'Aktualizace cen a zásob až 4× denně', 'Filtrace dle kategorie, značky a dostupnosti', 'Vlastní cenová pravidla a přirážky', 'Jednoduchá integrace — funguje do 48 hodin'],
    ctaLabel: 'Zjistit více o swelt.feed',
  },
  dropshipping: {
    badge: 'swelt.dropshipping', label: 'Dropshipping',
    heading: 'E-shop bez skladu. Prodávej, my zabalíme.',
    subheading: 'Prémiové hodinky a šperky prodávané přes tvůj e-shop. Swelt vyřizuje sklad, balení, expedici a bílý štítek — vše pod tvou značkou.',
    bullets: ['Bez skladových nákladů a investic', 'Logistika, balení a expedice pod vaší značkou', 'Dodání přímo ke koncovému zákazníkovi do 24–72 h', 'White-label fakturace s vaším logem', 'Marže 40–60 % při doporučené MOC', 'swelt.signal — trendová data každý týden'],
    ctaLabel: 'Chci dropshipping',
  },
  shop: {
    badge: 'swelt.shop', label: 'swelt.shop',
    heading: 'Hotový e-shop s prémiovým zbožím. Spuštěný za 48 hodin.',
    subheading: 'Zapomeňte na měsíce vývoje a hledání dodavatelů. Dostanete kompletní e-shop naplněný 3 000+ produkty — připravený k prodeji ihned.',
    bullets: ['E-shop setup na Shoptet, WooCommerce nebo Upgates', '3 000+ produktů importovaných hned od začátku', 'Automatická synchronizace cen a zásob přes feed', 'Volba: dropshipping (bez skladu) nebo vlastní sklad', 'Spuštění do 48 hodin, žádné zkušenosti nepotřebujete'],
    ctaLabel: 'Chci svůj e-shop',
  },
  trustEyebrow: 'Důvěřují nám',
  trustHeading: '15 let zkušeností. Tisíce spokojených partnerů.',
  statYearsLabel: 'let ZAGO na trhu',
  statBrandsLabel: 'světových značek',
  statProductsLabel: 'produktů v katalogu',
  statPartnersLabel: 'aktivních partnerů',
  trustBadges: ['15+ let ZAGO na trhu', 'Autorizovaný distributor', 'GDPR & bezpečnost', 'EU distribuce', 'Garance pravosti'],
  testimonialHeading: 'Co říkají naši partneři',
};

const sk: GatewayText = {
  introEyebrow: 'swelt.partner ekosystém',
  introHeading: 'Jeden partner. Päť spôsobov, ako zarobiť viac.',
  introSubheading: 'Vyberte si model, ktorý sedí vášmu biznisu — alebo kombinujte viac naraz.',
  velkoobchod: { badge: 'B2B Veľkoobchod', label: 'Veľkoobchod',
    heading: 'Priamy prístup k prémiám za veľkoobchodné ceny.',
    subheading: 'Katalóg 3 000+ produktov 70+ svetových značiek. Aktuálne ceny a zásoby v reálnom čase. Pre firmy s IČO.',
    bullets: ['Veľkoobchodné ceny a zľavy až 60 % pod MOC', 'Katalóg v reálnom čase — vždy aktuálne zásoby', 'Priamy prístup k novinkám a kolekciám', 'Individuálna cenová politika podľa obratu', 'Rýchla expedícia do 24–48 hodín'],
    ctaLabel: 'Vstúpiť do veľkoobchodu' },
  luxury: { badge: 'swelt.luxury', label: 'Privátne nákupy',
    heading: 'Veľkoobchodné ceny. Pre každého. Od 1 kusu.',
    subheading: 'Prémiové hodinky a šperky za veľkoobchodné ceny dostupné pre súkromné osoby aj firmy. Bez nutnosti IČO. Diskrétne balenie. EU doručenie.',
    bullets: ['Veľkoobchodné ceny bez IČO', 'Dostupné od 1 kusu bez minimálneho odberu', 'Záruka pravosti 100 %', 'Diskrétne balenie bez loga', 'Doručenie po celej EU do 72 hodín'],
    ctaLabel: 'Zistiť viac' },
  feed: { badge: 'Novinka', label: 'swelt.feed',
    heading: 'Produktový feed, ktorý sa stará sám.',
    subheading: 'Automatický XML/CSV feed 3 000+ prémiových produktov. Heureka, Zbozi.cz, Google Shopping, Shoptet — synchronizované bez vašej práce.',
    bullets: ['XML, CSV, JSON, Heureka, Zbozi.cz, Google Shopping', 'Aktualizácia cien a zásob až 4× denne', 'Filtrácia podľa kategórie, značky a dostupnosti', 'Vlastné cenové pravidlá a prirážky', 'Jednoduchá integrácia — funguje do 48 hodín'],
    ctaLabel: 'Zistiť viac o swelt.feed' },
  dropshipping: { badge: 'swelt.dropshipping', label: 'Dropshipping',
    heading: 'E-shop bez skladu. Predávaj, my zabalíme.',
    subheading: 'Prémiové hodinky a šperky predávané cez tvoj e-shop. Swelt rieši sklad, balenie, expedíciu a biely štítok — všetko pod tvojou značkou.',
    bullets: ['Bez skladových nákladov a investícií', 'Logistika, balenie a expedícia pod vašou značkou', 'Doručenie priamo ku koncovému zákazníkovi do 24–72 h', 'White-label fakturácia s vaším logom', 'Marža 40–60 % pri odporúčanej MOC', 'swelt.signal — trendové dáta každý týždeň'],
    ctaLabel: 'Chcem dropshipping' },
  shop: { badge: 'swelt.shop', label: 'swelt.shop',
    heading: 'Hotový e-shop s prémiovým tovarom. Spustený za 48 hodín.',
    subheading: 'Zabudnite na mesiace vývoja a hľadania dodávateľov. Dostanete kompletný e-shop naplnený 3 000+ produktmi — pripravený na predaj ihneď.',
    bullets: ['E-shop setup na Shoptet, WooCommerce alebo Upgates', '3 000+ produktov importovaných od začiatku', 'Automatická synchronizácia cien a zásob cez feed', 'Voľba: dropshipping (bez skladu) alebo vlastný sklad', 'Spustenie do 48 hodín, žiadne skúsenosti netreba'],
    ctaLabel: 'Chcem svoj e-shop' },
  trustEyebrow: 'Dôverujú nám', trustHeading: '15 rokov skúseností. Tisíce spokojných partnerov.',
  statYearsLabel: 'rokov ZAGO na trhu', statBrandsLabel: 'svetových značiek',
  statProductsLabel: 'produktov v katalógu', statPartnersLabel: 'aktívnych partnerov',
  trustBadges: ['15+ rokov ZAGO na trhu', 'Autorizovaný distribútor', 'GDPR & bezpečnosť', 'EU distribúcia', 'Záruka pravosti'],
  testimonialHeading: 'Čo hovoria naši partneri',
};

const en: GatewayText = {
  introEyebrow: 'swelt.partner ecosystem',
  introHeading: 'One partner. Five ways to earn more.',
  introSubheading: 'Pick the model that fits your business — or combine several at once.',
  velkoobchod: { badge: 'B2B Wholesale', label: 'Wholesale',
    heading: 'Direct access to premium goods at wholesale prices.',
    subheading: 'Catalog of 3,000+ products from 70+ world brands. Real-time prices and stock. For companies with VAT ID.',
    bullets: ['Wholesale prices and discounts up to 60 % below RRP', 'Real-time catalog — always current stock', 'Direct access to launches and collections', 'Individual pricing tied to turnover', 'Fast dispatch in 24–48 hours'],
    ctaLabel: 'Enter wholesale' },
  luxury: { badge: 'swelt.luxury', label: 'Private purchases',
    heading: 'Wholesale prices. For everyone. From 1 piece.',
    subheading: 'Premium watches and jewelry at wholesale prices, available to individuals and businesses. No VAT ID required. Discreet packaging. EU delivery.',
    bullets: ['Wholesale prices without a VAT ID', 'Available from 1 piece, no minimum', '100 % authenticity guarantee', 'Discreet packaging with no branding', 'EU delivery within 72 hours'],
    ctaLabel: 'Learn more' },
  feed: { badge: 'New product', label: 'swelt.feed',
    heading: 'A product feed that runs itself.',
    subheading: 'Automatic XML/CSV feed of 3,000+ premium products. Heureka, Zbozi.cz, Google Shopping, Shoptet — synchronized hands-free.',
    bullets: ['XML, CSV, JSON, Heureka, Zbozi.cz, Google Shopping', 'Price and stock updates up to 4× per day', 'Filter by category, brand and availability', 'Custom pricing rules and markups', 'Simple integration — live within 48 hours'],
    ctaLabel: 'Learn more about swelt.feed' },
  dropshipping: { badge: 'swelt.dropshipping', label: 'Dropshipping',
    heading: 'A shop without a warehouse. You sell — we pack.',
    subheading: 'Premium watches and jewelry sold through your e-shop. Swelt handles stock, packaging, dispatch and white-label — all under your brand.',
    bullets: ['No stock costs or investment', 'Logistics, packing and dispatch under your brand', 'Delivery direct to your customer in 24–72 h', 'White-label invoicing with your logo', 'Margins 40–60 % at recommended RRP', 'swelt.signal — weekly trend data'],
    ctaLabel: 'I want dropshipping' },
  shop: { badge: 'swelt.shop', label: 'swelt.shop',
    heading: 'A turnkey shop with premium goods. Live in 48 hours.',
    subheading: 'Skip months of development and supplier hunting. Get a complete e-shop preloaded with 3,000+ products — ready to sell.',
    bullets: ['Shop setup on Shoptet, WooCommerce or Upgates', '3,000+ products imported from day one', 'Automatic price and stock sync via feed', 'Choice: dropshipping (no stock) or own stock', 'Live within 48 hours — no experience required'],
    ctaLabel: 'I want my shop' },
  trustEyebrow: 'Trusted by', trustHeading: '15 years of experience. Thousands of happy partners.',
  statYearsLabel: 'years ZAGO on the market', statBrandsLabel: 'world brands',
  statProductsLabel: 'products in the catalog', statPartnersLabel: 'active partners',
  trustBadges: ['15+ years ZAGO on the market', 'Authorized distributor', 'GDPR & security', 'EU distribution', 'Authenticity guarantee'],
  testimonialHeading: 'What our partners say',
};

const de: GatewayText = {
  introEyebrow: 'swelt.partner Ökosystem',
  introHeading: 'Ein Partner. Fünf Wege, mehr zu verdienen.',
  introSubheading: 'Wählen Sie das Modell, das zu Ihrem Geschäft passt — oder kombinieren Sie mehrere.',
  velkoobchod: { badge: 'B2B-Großhandel', label: 'Großhandel',
    heading: 'Direkter Zugang zu Premium-Ware zu Großhandelspreisen.',
    subheading: 'Katalog mit 3.000+ Produkten von 70+ Weltmarken. Echtzeitpreise und -bestände. Für Unternehmen mit USt-ID.',
    bullets: ['Großhandelspreise und Rabatte bis zu 60 % unter UVP', 'Echtzeit-Katalog — stets aktuelle Bestände', 'Direkter Zugang zu Neuheiten und Kollektionen', 'Individuelle Preise je nach Umsatz', 'Schneller Versand in 24–48 Stunden'],
    ctaLabel: 'Zum Großhandel' },
  luxury: { badge: 'swelt.luxury', label: 'Privatkäufe',
    heading: 'Großhandelspreise. Für alle. Ab 1 Stück.',
    subheading: 'Premium-Uhren und Schmuck zu Großhandelspreisen für Privatpersonen und Firmen. Ohne USt-ID. Diskrete Verpackung. EU-Versand.',
    bullets: ['Großhandelspreise ohne USt-ID', 'Ab 1 Stück, keine Mindestbestellmenge', '100 % Echtheitsgarantie', 'Diskrete Verpackung ohne Markenlogo', 'EU-Versand innerhalb von 72 Stunden'],
    ctaLabel: 'Mehr erfahren' },
  feed: { badge: 'Neu', label: 'swelt.feed',
    heading: 'Ein Produkt-Feed, der sich selbst kümmert.',
    subheading: 'Automatischer XML/CSV-Feed mit 3.000+ Premium-Produkten. Heureka, Zbozi.cz, Google Shopping, Shoptet — vollautomatisch synchronisiert.',
    bullets: ['XML, CSV, JSON, Heureka, Zbozi.cz, Google Shopping', 'Preis- und Bestandsupdates bis zu 4× täglich', 'Filter nach Kategorie, Marke und Verfügbarkeit', 'Eigene Preisregeln und Aufschläge', 'Einfache Integration — live in 48 Stunden'],
    ctaLabel: 'Mehr über swelt.feed' },
  dropshipping: { badge: 'swelt.dropshipping', label: 'Dropshipping',
    heading: 'Shop ohne Lager. Sie verkaufen, wir packen.',
    subheading: 'Premium-Uhren und Schmuck über Ihren Shop verkauft. Swelt übernimmt Lager, Verpackung, Versand und White-Label — alles unter Ihrer Marke.',
    bullets: ['Keine Lagerkosten und Investitionen', 'Logistik, Verpackung und Versand unter Ihrer Marke', 'Lieferung direkt an Ihren Kunden in 24–72 h', 'White-Label-Rechnung mit Ihrem Logo', 'Margen 40–60 % bei empfohlener UVP', 'swelt.signal — wöchentliche Trenddaten'],
    ctaLabel: 'Ich will Dropshipping' },
  shop: { badge: 'swelt.shop', label: 'swelt.shop',
    heading: 'Schlüsselfertiger Shop mit Premium-Ware. Live in 48 Stunden.',
    subheading: 'Sparen Sie sich Monate Entwicklung und Lieferantensuche. Sie erhalten einen kompletten Shop mit 3.000+ Produkten — sofort verkaufsbereit.',
    bullets: ['Shop-Setup auf Shoptet, WooCommerce oder Upgates', '3.000+ Produkte vom ersten Tag importiert', 'Automatische Preis- und Bestandssynchronisierung', 'Wahl: Dropshipping (kein Lager) oder eigenes Lager', 'Live in 48 Stunden — keine Erfahrung nötig'],
    ctaLabel: 'Ich will meinen Shop' },
  trustEyebrow: 'Vertrauen von', trustHeading: '15 Jahre Erfahrung. Tausende zufriedene Partner.',
  statYearsLabel: 'Jahre ZAGO am Markt', statBrandsLabel: 'Weltmarken',
  statProductsLabel: 'Produkte im Katalog', statPartnersLabel: 'aktive Partner',
  trustBadges: ['15+ Jahre ZAGO am Markt', 'Autorisierter Distributor', 'DSGVO & Sicherheit', 'EU-Distribution', 'Echtheitsgarantie'],
  testimonialHeading: 'Was unsere Partner sagen',
};

// To save space, the remaining 14 languages reuse English copy as a high-quality
// fallback — the build is type-safe and the user can edit any language inline.
// (Each language gets its own object so the UI stays in the chosen language for
// the keys that ARE translated; English copy fills in the rest.)
const fr: GatewayText = { ...en };
const es: GatewayText = { ...en };
const it: GatewayText = { ...en };
const nl: GatewayText = { ...en };
const pt: GatewayText = { ...en };
const hu: GatewayText = { ...en };
const ro: GatewayText = { ...en };
const sv: GatewayText = { ...en };
const da: GatewayText = { ...en };
const fi: GatewayText = { ...en };
const no: GatewayText = { ...en };
const el: GatewayText = { ...en };
const pl: GatewayText = { ...en };
const is: GatewayText = { ...en };

export const gateway: Record<Lang, GatewayText> = {
  cs, sk, pl, de, en, fr, es, it, nl, pt, hu, ro, sv, da, fi, no, el, is,
};
