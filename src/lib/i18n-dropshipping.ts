/**
 * Dropshipping landing page translations.
 * CS + EN fully translated; other 16 languages reuse EN as fallback.
 */
import type { Lang } from './i18n';

export interface DropPain { problem: string; title: string; text: string }
export interface DropStep { title: string; text: string }
export interface DropUsp { title: string; text: string }
export interface DropPlatform { detail: string; tag: string; time: string }
export interface DropFaq { q: string; a: string }
export interface DropTier { name: string; subtitle: string; priceNote: string; cta: string; badge: string; features: string[]; missing: string[] }
export interface DropMarket { country: string; detail: string; badge: string }
export interface DropZone { zone: string; couriers: string }

export interface DropText {
  hero: { badge: string; h1Part1: string; h1Highlight: string; sub: string; statLabels: string[]; ctaPrimary: string; ctaSecondary: string; bullets: string[] };
  pain: { eyebrow: string; heading: string; items: DropPain[] };
  steps: { eyebrow: string; heading: string; sub: string; items: DropStep[] };
  shopUpsell: { badge: string; h1: string; h1Highlight: string; sub: string; features: { title: string; text: string }[]; cta1: string; cta2: string; digestEyebrow: string; digestWeek: string; digestRecsEyebrow: string };
  logistics: { eyebrow: string; heading: string; sub: string; zones: DropZone[]; deliveryLabel: string; reliabilityLabel: string; courierLabel: string; qcEyebrow: string; qcHeading: string; qcSub: string };
  usps: { eyebrow: string; heading: string; items: DropUsp[] };
  ecosystem: { eyebrow: string; heading: string; sub: string };
  platforms: { eyebrow: string; heading: string; sub: string; items: { name: string; data: DropPlatform }[]; setupTime: string };
  euExpansion: { eyebrow: string; heading: string; sub: string; markets: DropMarket[] };
  pricing: { eyebrow: string; heading: string; quarterly: string; yearly: string; perMonth: string; bespoke: string; quarterlyNote: string; yearlyNote: string; allPrev: string; guarantee: string; tiers: DropTier[] };
  faq: { eyebrow: string; heading: string; showAll: string };
  faqs: DropFaq[];
  finalCta: { badge: string; h2Part1: string; h2Highlight: string; sub: string; ctaPrimary: string; ctaSecondary: string; contactItems: { label: string; sub: string }[]; smallNote: string };
}

const cs: DropText = {
  hero: {
    badge: 'swelt.dropshipping — E-shop bez skladu',
    h1Part1: 'Prodávej prémiové produkty', h1Highlight: 'bez skladu.',
    sub: 'Vyber si z 3 000+ produktů od 70+ světových značek. My je zabalíme, zkontrolujeme a odešleme pod tvou značkou do 24–72 hodin. Real-time inventory lock zabrání přeprodeji. swelt.signal ti každý týden řekne, co teď zákazníci chtějí.',
    statLabels: ['let na trhu', 'značek', 'aktivních partnerů'],
    ctaPrimary: 'Začít dropshipping zdarma', ctaSecondary: 'Jak to funguje? ↓',
    bullets: ['Bez závazků', 'Bez kreditní karty', 'Schválení do 24 h'],
  },
  pain: {
    eyebrow: 'Poznáš se v tom?',
    heading: 'Čtyři překážky, které řešíme za tebe',
    items: [
      { problem: 'Nemám peníze na naskladnění', title: 'Platíš až po prodeji', text: 'Zákazník zaplatí tobě. Ty zaplatíš nám. Nulová investice do zásob — žádné zmrazené peníze v regálech.' },
      { problem: 'Nevím jak řešit logistiku', title: 'O expedici se staráme my', text: 'Balíme, kontrolujeme, odesíláme. Pod tvou fakturou. Zákazník vidí tebe — ne nás. Trojí quality check na každé zásilce.' },
      { problem: 'Bojím se špatně zvolit produkty', title: 'swelt.signal ti poradí', text: 'AI modul sleduje trendy napříč distribucí. Každý týden dostaneš top 10 trending produktů pro tvůj segment — přestaneš hádat.' },
      { problem: 'Bojím se přeprodat zákazníkovi', title: 'Real-time inventory lock', text: 'Jakmile zákazník nakoupí, zásoby se okamžitě uzamknou v systému. Žádné "promiňte, zboží se vyprodalo po zaplacení."' },
    ],
  },
  steps: {
    eyebrow: 'Jak to funguje', heading: 'Od registrace k první objednávce za 48 hodin', sub: 'Stačí 5 kroků. Klikni na krok pro detail.',
    items: [
      { title: 'Registrace zdarma', text: 'Vytvoříš B2B účet. Schválení do 24 hodin v pracovní dny. Stačí IČO — žádné dokumenty předem.' },
      { title: 'Stáhneš produktový feed', text: 'XML, CSV nebo real-time API. Fotky, popisy, ceny, skladovost — vše automaticky. Do Shoptetu v 1 klik.' },
      { title: 'Zákazník nakoupí u tebe', text: 'Nastavíš vlastní cenu a marži. Zákazník platí přímo tobě. Ty si necháš rozdíl — my dostaneme velkoobchodní cenu.' },
      { title: 'Předáš nám objednávku', text: 'Přes platformu, API nebo XML export. Zásilku zabalíme pod tvou hlavičkou a odešleme kuriérem.' },
      { title: 'Zákazník dostane balíček', text: 'Doručení do 24–72 h. Tracking číslo automaticky. Zákazník nikdy nezjistí, kdo zásilku připravil.' },
    ],
  },
  shopUpsell: {
    badge: 'Nová služba — swelt.signal',
    h1: 'Chceš rovnou hotový e-shop?', h1Highlight: 'swelt.shop ti ho postaví za 48 hodin.',
    sub: 'swelt.shop je kompletní e-shop naplněný 3 000+ prémiovými produkty — připravený k prodeji. Kombinuj ho s dropshippingem a nepotřebuješ ani sklad, ani logistiku. Stačí spustit a prodávat.',
    features: [
      { title: 'E-shop setup do 48 hodin', text: 'Shoptet, WooCommerce nebo Upgates — nastavíme vše za tebe.' },
      { title: '3 000+ produktů hned od startu', text: 'Katalog naplněný a synchronizovaný. Nic neimportuješ ručně.' },
      { title: 'Dropshipping integrace v ceně', text: 'Business plán obsahuje plnou dropshipping integraci — nulový sklad.' },
      { title: 'Automatická aktualizace cen a zásob', text: 'Feed se synchronizuje 1–4× denně. Vždy aktuální.' },
    ],
    cta1: 'Chci svůj e-shop', cta2: 'Vyzkoušet dropshipping',
    digestEyebrow: 'Týdenní digest', digestWeek: 'Týden 17 · 2026',
    digestRecsEyebrow: 'AI doporučení tohoto týdne',
  },
  logistics: {
    eyebrow: 'Spolehlivost',
    heading: 'Spolehlivost, na které záleží tvým zákazníkům',
    sub: 'Transparentní logistika. Žádné překvapení.',
    zones: [
      { zone: 'Česká republika', couriers: 'DHL, DPD, GLS' },
      { zone: 'Slovensko',       couriers: 'DPD, GLS' },
      { zone: 'Německo & Rakousko', couriers: 'DHL Express' },
      { zone: 'Zbytek EU',       couriers: 'DHL, FedEx, UPS' },
    ],
    deliveryLabel: 'Doručení', reliabilityLabel: 'Spolehlivost', courierLabel: 'Kuriéři',
    qcEyebrow: 'Triple QC', qcHeading: 'Trojí kontrola na každé zásilce',
    qcSub: 'Kontrola při příjmu od výrobce, kontrola funkčnosti a estetiky před balením, fotodokumentace zásilky. Méně reklamací, lepší recenze.',
  },
  usps: {
    eyebrow: 'Co dostaneš',
    heading: 'Vše, co potřebuješ k úspěšnému prodeji',
    items: [
      { title: '70+ prémiových značek', text: 'Světové značky, které zákazníci znají a chtějí koupit.' },
      { title: 'Expedice do 24–72 hodin', text: 'Sklad v ČR, tři rychlostní pásma, spolehlivé doručení.' },
      { title: 'Shoptet API v 1 klik', text: 'Přímá integrace s nejrozšířenější českou platformou.' },
      { title: 'Real-time inventory lock', text: 'Zásoby uzamčeny v momentě objednávky. Žádný přeprodej.' },
      { title: 'Trojí quality check', text: 'Kontrola při příjmu, před odesláním a fotodokumentace.' },
      { title: 'Aktuální XML/CSV/API feed', text: 'Real-time nebo 4× denně — vždy aktuální ceny a sklad.' },
      { title: 'Consolidated B2B invoicing', text: 'Všechny B2C objednávky = 1 přehledná faktura měsíčně.' },
      { title: 'Bílý štítek od prvního dne', text: 'Zákazník nikdy neuvidí, že zásilku posílá swelt.partner.' },
      { title: 'Osobní account manager', text: 'Skutečný člověk — ne bot, ne ticketovací systém.' },
      { title: 'EU expanze: ČR, SK, DE, AT', text: 'Jeden feed, čtyři trhy. Lokalizovaný v cs/sk/en/de.' },
    ],
  },
  ecosystem: {
    eyebrow: 'Ekosystém',
    heading: 'Nejsme jen dodavatel. Jsme tvůj byznys partner.',
    sub: 'swelt.dropshipping je součástí širší sady nástrojů — kombinuj je podle potřeby.',
  },
  platforms: {
    eyebrow: 'Integrace', heading: 'Funguje s platformou, kterou už máš',
    sub: 'Shoptet, WooCommerce, Upgates, Shopify a další — swelt.dropshipping se napojí bez kódu.',
    items: [
      { name: 'Shoptet',       data: { detail: 'Přímá API integrace. Synchronizace produktů, cen a skladovosti jedním klikem. Nejrychlejší nastavení na CZ trhu.', tag: '#1 v ČR', time: '~15 min' } },
      { name: 'WooCommerce',   data: { detail: 'WordPress plugin s XML feedem. Automatická aktualizace. Plná kontrola nad designem produktových stránek.', tag: 'Open source', time: '~30 min' } },
      { name: 'Upgates',       data: { detail: 'CSV a XML import s plnou kompatibilitou. Automatická synchronizace cen a zásob.', tag: '', time: '~20 min' } },
      { name: 'Eshop-rychle',  data: { detail: 'Nativní podpora produktového feedu. Rychlé nastavení bez technických znalostí.', tag: '', time: '~20 min' } },
      { name: 'Shopify',       data: { detail: 'Ideální pro SK/DE/AT expanzi. Vícejazyčný feed, mezinárodní platební brány.', tag: 'EU expanze', time: '~45 min' } },
      { name: 'PrestaShop',    data: { detail: 'XML feed a REST API přístup. Podpora verzí 1.6, 1.7 i novějších. Custom module na dotaz.', tag: '', time: '~30 min' } },
      { name: 'REST API',      data: { detail: 'Plný programátorský přístup. JSON format, real-time synchronizace, vlastní integrace na libovolnou platformu.', tag: 'Pro devs', time: 'Custom' } },
    ],
    setupTime: 'Nastavení',
  },
  euExpansion: {
    eyebrow: 'EU expanze', heading: 'Začneš v ČR. Dorůsteš do celé EU.',
    sub: 'Jeden partner, jeden feed, čtyři trhy. Bez zakládání poboček nebo skladů v zahraničí.',
    markets: [
      { country: 'Česká republika', detail: 'Primární trh. 24 h doručení. Shoptet, WooCommerce, Upgates.', badge: 'Primární' },
      { country: 'Slovensko',       detail: 'Lokalizovaný SK feed. SK dopravci. Stejný account manager.', badge: 'Live' },
      { country: 'Německo',         detail: 'EN/DE feed. DHL Express. Na dotaz — pomůžeme nastavit.', badge: 'Na dotaz' },
      { country: 'Rakousko',        detail: 'EN/DE feed. DHL Express. Ideální pro Shopify e-shopy.', badge: 'Na dotaz' },
    ],
  },
  pricing: {
    eyebrow: 'Ceník', heading: 'Vyber plán pro svůj e-shop',
    quarterly: 'Čtvrtletně', yearly: 'Ročně', perMonth: 'Kč / měs.', bespoke: 'Na míru',
    quarterlyNote: 'Kč · fakturováno čtvrtletně', yearlyNote: 'Kč · fakturováno ročně',
    allPrev: 'Vše z',
    guarantee: '30denní záruka spokojenosti — pokud do 30 dní zjistíš, že to není pro tebe, vrátíme ti celý poplatek bez otázek.',
    tiers: [
      { name: 'Starter', subtitle: 'Pro první kroky\na testování trhu', priceNote: 'Kč / měsíc bez DPH', cta: 'Začít zdarma na 14 dní', badge: '',
        features: ['500 produktů — základní katalog', '1× denní aktualizace feedu', 'Expedice do 72 hodin', 'E-mailová podpora', 'swelt.launch onboarding'],
        missing: ['Bílý štítek', 'Shoptet API', 'swelt.signal', 'Real-time inventory lock'] },
      { name: 'Silver', subtitle: 'Pro rostoucí e-shopy\nco to myslí vážně', priceNote: 'Kč / měsíc bez DPH', cta: 'Aktivovat Silver →', badge: 'Nejoblíbenější',
        features: ['Celý katalog 3 000+ produktů', 'Real-time API + 4× denně XML/CSV', 'Expedice do 24–48 hodin', 'Bílý štítek — tvoje faktura + logo', 'Shoptet / WooCommerce API', 'Real-time inventory lock', 'Consolidated B2B invoicing', 'Telefonická + chat podpora', 'swelt.signal Lite — weekly digest', 'swelt.launch onboarding', 'Refund kreditem při obratu 50 000 Kč/měsíc'],
        missing: [] },
      { name: 'Gold', subtitle: 'Pro profesionální e-shopy\na EU expanzi', priceNote: 'individuální nabídka', cta: 'Získat nabídku', badge: 'Enterprise',
        features: ['Vše ze Silver', 'Dedikovaný account manager', 'swelt.signal Pro — real-time + API', 'Prioritní vyřízení do 4 hodin', 'EU expanze SK/DE/AT — lokalizace', 'Triple quality check + fotodokumentace', 'Buyback option na slow-movers', 'Vlastní produktové fotky na vyžádání', 'SLA delivery záruka', 'Custom API integrace'],
        missing: [] },
    ],
  },
  faq: { eyebrow: 'FAQ', heading: 'Nejčastější otázky', showAll: 'Zobrazit všech otázek' },
  faqs: [
    { q: 'Co je dropshipping a jak přesně funguje?', a: 'Dropshipping je model prodeje, kde zákazník nakoupí ve tvém e-shopu, ale zboží mu odesíláme přímo my — pod tvou značkou, z tvé faktury. Ty nepotřebuješ sklad ani kapitál v zásobách. Zákazník to nerozezná.' },
    { q: 'Potřebuji IČO nebo živnostenský list?', a: 'Ano. Dropshipping je podnikatelská činnost. Potřebuješ platné IČO nebo živnostenský list. Pomůžeme ti s nastavením, pokud teprve začínáš.' },
    { q: 'Kolik stojí začátek?', a: 'Registrace je zdarma a 14denní trial bez platby. Placené plány začínají od 1 490 Kč/měsíc (Starter). Silver plán (2 490 Kč/měsíc) se ti vrátí jako kredit po dosažení obratu 50 000 Kč/měsíc.' },
    { q: 'Zákazník uvidí, že zásilku posílá swelt.partner?', a: 'Ne. Na zásilce je tvoje faktura, tvoje logo, tvůj název. My nikde nefigurujeme — white-label je zahrnut ve všech placených plánech (kromě Starteru).' },
    { q: 'Jak rychle jsou zásilky odesílány?', a: 'Máme tři rychlostní pásma: Express (do 24 h, >99,5 % spolehlivost), Standard (do 48 h, ~97 %) a Economy (do 72 h, ~95 %). Každá zásilka dostane tracking číslo.' },
    { q: 'Jaká je minimální objednávka?', a: 'Žádná. Posíláme klidně jeden kus na jednoho zákazníka — platíš až po jeho objednávce. Žádné MOQ.' },
    { q: 'Mohu dropshippovat do zahraničí?', a: 'Ano. Dodáváme primárně do ČR a SK, feed je lokalizovaný v cs/sk/en/de. Pro DE a AT expanzi kontaktuj account managera.' },
    { q: 'Co je swelt.signal a proč ho potřebuji?', a: 'swelt.signal je AI modul sledující pohyb produktů napříč naší distribucí. Každý týden dostaneš top 10 trending produktů a 5 klesajících — víš co přidat a co odebrat z feedu dřív než konkurence.' },
    { q: 'Jak funguje real-time inventory lock?', a: 'Jakmile zákazník dokončí objednávku ve tvém e-shopu, zásoby se okamžitě uzamknou v našem systému. Eliminuje riziko přeprodeji a negativní zákaznický zážitek z "promiňte, vyprodáno po zaplacení".' },
    { q: 'Jak funguje consolidated B2B invoicing?', a: 'Všechny tvoje B2C objednávky za měsíc se sloučí do jedné přehledné B2B faktury od nás. Méně administrativy, snadnější účetnictví a daňové přiznání.' },
    { q: 'Co se stane, pokud zákazník chce vrátit zboží?', a: 'Jasný 3-krokový proces: zákazník pošle zboží tobě → ty nás kontaktuješ do 48 h → my řešíme s dodavatelem a ty dostaneš náhradu nebo kredit na příští objednávku. Gold plán zahrnuje buyback option na pomaloobrátové zásoby.' },
    { q: 'Jak funguje triple quality check?', a: 'Každou zásilku kontrolujeme třikrát: (1) kontrola při příjmu od výrobce, (2) kontrola funkčnosti a estetiky před balením, (3) fotodokumentace zásilky. Výsledkem je méně reklamací a lepší recenze ve tvém e-shopu.' },
    { q: 'Mohu kombinovat dropshipping s vlastním skladem?', a: 'Ano. Mnoho partnerů prodává ze svého skladu i z toho našeho najednou. Zákazník nerozezná rozdíl — feed i expedice vypadají stejně.' },
    { q: 'Co je swelt.launch a co zahrnuje?', a: 'Pro nové partnery: 30denní guided onboarding s account managerem. Projdeme nastavení feedu, výběr prvních produktů a podporu s první kampaní. Garantujeme první objednávku do 30 dní — nebo ti prodloužíme trial o měsíc zdarma.' },
  ],
  finalCta: {
    badge: 'Začni prodávat dnes',
    h2Part1: 'Začni prodávat dnes —', h2Highlight: 'bez rizika, bez skladu.',
    sub: 'Tisíce e-shopů v ČR a SK to dělá už teď. Přidej se a prodávej prémiové produkty, které zákazníci chtějí — bez investice do zásob, bez logistické bolesti.',
    ctaPrimary: 'Registrovat se zdarma a začít', ctaSecondary: 'Napsat nám',
    contactItems: [
      { label: 'Po–Pá 9:00–17:00', sub: 'Telefon + chat' },
      { label: 'dropshipping@swelt.partner', sub: 'Odpověď do 2 h' },
      { label: 'Schválení do 24 h', sub: 'Žádné papírování' },
    ],
    smallNote: 'Bez závazků · Bez kreditní karty · Schválení do 24 hodin',
  },
};

const en: DropText = {
  hero: {
    badge: 'swelt.dropshipping — A shop without a warehouse',
    h1Part1: 'Sell premium products', h1Highlight: 'without a warehouse.',
    sub: 'Pick from 3,000+ products from 70+ world brands. We pack, inspect and ship them under your brand within 24–72 hours. Real-time inventory lock prevents overselling. swelt.signal tells you every week what customers actually want.',
    statLabels: ['years on the market', 'brands', 'active partners'],
    ctaPrimary: 'Start dropshipping for free', ctaSecondary: 'How does it work? ↓',
    bullets: ['No commitments', 'No credit card', 'Approval in 24 h'],
  },
  pain: {
    eyebrow: 'Sound familiar?',
    heading: 'Four obstacles we solve for you',
    items: [
      { problem: "I don't have money to stock up", title: 'You pay only after the sale', text: 'The customer pays you. You pay us. Zero stock investment — no money frozen on shelves.' },
      { problem: "I don't know how to handle logistics", title: 'We handle dispatch', text: 'We pack, inspect and ship. Under your invoice. The customer sees you — not us. Triple QC on every shipment.' },
      { problem: "I'm afraid of picking the wrong products", title: 'swelt.signal advises you', text: 'AI module tracks trends across the distribution. Every week get the top 10 trending products for your segment — stop guessing.' },
      { problem: "I'm afraid of overselling", title: 'Real-time inventory lock', text: 'The moment a customer buys, stock locks in our system. No more "sorry, sold out after payment".' },
    ],
  },
  steps: {
    eyebrow: 'How it works', heading: 'From sign-up to first order in 48 hours', sub: '5 steps. Click a step for details.',
    items: [
      { title: 'Free registration', text: 'Create a B2B account. Approval within 24 hours on business days. Just a VAT ID — no documents up front.' },
      { title: 'Download the product feed', text: 'XML, CSV or real-time API. Photos, descriptions, prices, stock — all automatic. Into Shoptet in 1 click.' },
      { title: 'Customer buys from you', text: 'You set your own price and margin. Customer pays you directly. You keep the difference — we get the wholesale price.' },
      { title: 'You forward the order', text: 'Through the platform, API or XML export. We pack the parcel under your branding and ship via courier.' },
      { title: 'Customer gets the package', text: 'Delivery in 24–72 h. Tracking number automatic. Customer never finds out who packed it.' },
    ],
  },
  shopUpsell: {
    badge: 'New service — swelt.signal',
    h1: 'Want a turnkey shop?', h1Highlight: 'swelt.shop builds you one in 48 hours.',
    sub: 'swelt.shop is a complete e-shop preloaded with 3,000+ premium products — ready to sell. Combine it with dropshipping and you need neither warehouse nor logistics. Just launch and sell.',
    features: [
      { title: 'Shop setup in 48 hours', text: 'Shoptet, WooCommerce or Upgates — we set everything up for you.' },
      { title: '3,000+ products from day one', text: 'Catalog filled and synced. You import nothing manually.' },
      { title: 'Dropshipping integration included', text: 'The Business plan includes full dropshipping integration — zero stock.' },
      { title: 'Automatic price and stock updates', text: 'Feed syncs 1–4× daily. Always current.' },
    ],
    cta1: 'I want my shop', cta2: 'Try dropshipping',
    digestEyebrow: 'Weekly digest', digestWeek: 'Week 17 · 2026',
    digestRecsEyebrow: 'AI recommendations of the week',
  },
  logistics: {
    eyebrow: 'Reliability',
    heading: 'Reliability your customers will notice',
    sub: 'Transparent logistics. No surprises.',
    zones: [
      { zone: 'Czech Republic',     couriers: 'DHL, DPD, GLS' },
      { zone: 'Slovakia',           couriers: 'DPD, GLS' },
      { zone: 'Germany & Austria',  couriers: 'DHL Express' },
      { zone: 'Rest of EU',         couriers: 'DHL, FedEx, UPS' },
    ],
    deliveryLabel: 'Delivery', reliabilityLabel: 'Reliability', courierLabel: 'Couriers',
    qcEyebrow: 'Triple QC', qcHeading: 'Triple check on every shipment',
    qcSub: 'Quality control on receipt from manufacturer, functionality and aesthetics check before packing, shipment photo documentation. Fewer claims, better reviews.',
  },
  usps: {
    eyebrow: 'What you get',
    heading: 'Everything you need to sell successfully',
    items: [
      { title: '70+ premium brands', text: 'World brands customers know and want to buy.' },
      { title: 'Dispatch in 24–72 hours', text: 'Warehouse in CZ, three speed tiers, reliable delivery.' },
      { title: 'Shoptet API in 1 click', text: 'Direct integration with the most popular CZ platform.' },
      { title: 'Real-time inventory lock', text: 'Stock locked at the moment of order. No overselling.' },
      { title: 'Triple quality check', text: 'Inspection on receipt, before dispatch and photo documentation.' },
      { title: 'Live XML/CSV/API feed', text: 'Real-time or 4× daily — always current prices and stock.' },
      { title: 'Consolidated B2B invoicing', text: 'All B2C orders = 1 clean invoice per month.' },
      { title: 'White label from day one', text: 'Customer never sees that swelt.partner shipped the order.' },
      { title: 'Personal account manager', text: 'A real human — not a bot, not a ticketing system.' },
      { title: 'EU expansion: CZ, SK, DE, AT', text: 'One feed, four markets. Localized in cs/sk/en/de.' },
    ],
  },
  ecosystem: {
    eyebrow: 'Ecosystem',
    heading: 'We are not just a supplier. We are your business partner.',
    sub: 'swelt.dropshipping is part of a wider toolkit — combine pieces as needed.',
  },
  platforms: {
    eyebrow: 'Integration', heading: 'Works with the platform you already have',
    sub: 'Shoptet, WooCommerce, Upgates, Shopify and more — swelt.dropshipping connects with no code.',
    items: [
      { name: 'Shoptet',       data: { detail: 'Direct API integration. Sync products, prices and stock with one click. Fastest setup on the CZ market.', tag: '#1 in CZ', time: '~15 min' } },
      { name: 'WooCommerce',   data: { detail: 'WordPress plugin with XML feed. Automatic updates. Full control over product page design.', tag: 'Open source', time: '~30 min' } },
      { name: 'Upgates',       data: { detail: 'CSV and XML import with full compatibility. Automatic price and stock sync.', tag: '', time: '~20 min' } },
      { name: 'Eshop-rychle',  data: { detail: 'Native product feed support. Quick setup with no technical knowledge.', tag: '', time: '~20 min' } },
      { name: 'Shopify',       data: { detail: 'Ideal for SK/DE/AT expansion. Multilingual feed, international payment gateways.', tag: 'EU expansion', time: '~45 min' } },
      { name: 'PrestaShop',    data: { detail: 'XML feed and REST API. Supports versions 1.6, 1.7 and newer. Custom module on request.', tag: '', time: '~30 min' } },
      { name: 'REST API',      data: { detail: 'Full programmatic access. JSON format, real-time sync, custom integration with any platform.', tag: 'For devs', time: 'Custom' } },
    ],
    setupTime: 'Setup',
  },
  euExpansion: {
    eyebrow: 'EU expansion', heading: 'Start in CZ. Grow across the EU.',
    sub: 'One partner, one feed, four markets. No setting up branches or warehouses abroad.',
    markets: [
      { country: 'Czech Republic', detail: 'Primary market. 24h delivery. Shoptet, WooCommerce, Upgates.', badge: 'Primary' },
      { country: 'Slovakia',       detail: 'Localized SK feed. SK couriers. Same account manager.', badge: 'Live' },
      { country: 'Germany',        detail: 'EN/DE feed. DHL Express. On request — we will help set up.', badge: 'On request' },
      { country: 'Austria',        detail: 'EN/DE feed. DHL Express. Ideal for Shopify e-shops.', badge: 'On request' },
    ],
  },
  pricing: {
    eyebrow: 'Pricing', heading: 'Pick a plan for your shop',
    quarterly: 'Quarterly', yearly: 'Yearly', perMonth: '/ mo', bespoke: 'Bespoke',
    quarterlyNote: '· billed quarterly', yearlyNote: '· billed yearly',
    allPrev: 'Everything from',
    guarantee: '30-day satisfaction guarantee — if it is not for you within 30 days, we refund the full fee, no questions asked.',
    tiers: [
      { name: 'Starter', subtitle: 'For first steps\nand market testing', priceNote: '/ month excl. VAT', cta: 'Start 14-day free trial', badge: '',
        features: ['500 products — basic catalog', 'Daily feed update', 'Dispatch in 72 hours', 'Email support', 'swelt.launch onboarding'],
        missing: ['White label', 'Shoptet API', 'swelt.signal', 'Real-time inventory lock'] },
      { name: 'Silver', subtitle: 'For growing shops\nwho mean business', priceNote: '/ month excl. VAT', cta: 'Activate Silver →', badge: 'Most popular',
        features: ['Full catalog 3,000+ products', 'Real-time API + 4× daily XML/CSV', 'Dispatch in 24–48 hours', 'White label — your invoice + logo', 'Shoptet / WooCommerce API', 'Real-time inventory lock', 'Consolidated B2B invoicing', 'Phone + chat support', 'swelt.signal Lite — weekly digest', 'swelt.launch onboarding', 'Credit refund at 50,000 CZK monthly turnover'],
        missing: [] },
      { name: 'Gold', subtitle: 'For professional shops\nand EU expansion', priceNote: 'individual offer', cta: 'Get an offer', badge: 'Enterprise',
        features: ['Everything from Silver', 'Dedicated account manager', 'swelt.signal Pro — real-time + API', 'Priority handling within 4 hours', 'EU expansion SK/DE/AT — localization', 'Triple quality check + photo documentation', 'Buyback option for slow movers', 'Custom product photos on request', 'SLA delivery guarantee', 'Custom API integration'],
        missing: [] },
    ],
  },
  faq: { eyebrow: 'FAQ', heading: 'Frequently asked questions', showAll: 'Show all questions' },
  faqs: [
    { q: 'What is dropshipping and how does it work?', a: 'Dropshipping is a sales model where the customer buys from your e-shop, but we ship the goods directly — under your brand, from your invoice. You need no warehouse and no capital tied up in stock. The customer cannot tell.' },
    { q: 'Do I need a VAT ID or business license?', a: 'Yes. Dropshipping is a business activity. You need a valid VAT ID or business license. We will help you set things up if you are just starting.' },
    { q: 'How much does it cost to start?', a: 'Registration is free with a 14-day no-payment trial. Paid plans start at 1,490 CZK/month (Starter). The Silver plan (2,490 CZK/month) returns to you as credit once you reach 50,000 CZK monthly turnover.' },
    { q: 'Will the customer see that swelt.partner ships the order?', a: 'No. Your invoice, your logo, your name on the shipment. We do not appear anywhere — white label is included on every paid plan (except Starter).' },
    { q: 'How fast are shipments dispatched?', a: 'Three speed tiers: Express (within 24 h, >99.5 % reliability), Standard (within 48 h, ~97 %) and Economy (within 72 h, ~95 %). Each shipment gets a tracking number.' },
    { q: 'What is the minimum order?', a: 'None. We ship a single piece for a single customer if you want — you pay only after that order. No MOQ.' },
    { q: 'Can I dropship abroad?', a: 'Yes. We deliver primarily to CZ and SK, the feed is localized in cs/sk/en/de. For DE and AT expansion contact your account manager.' },
    { q: 'What is swelt.signal and why do I need it?', a: 'swelt.signal is an AI module tracking product movement across our distribution. Every week you get the top 10 trending products and 5 declining ones — know what to add and what to remove from the feed before competitors.' },
    { q: 'How does real-time inventory lock work?', a: 'The moment a customer completes an order in your shop, stock locks in our system. Eliminates the risk of overselling and the bad customer experience of "sorry, sold out after payment".' },
    { q: 'How does consolidated B2B invoicing work?', a: 'All your B2C orders for the month are merged into one clean B2B invoice from us. Less admin, easier accounting and tax filing.' },
    { q: 'What happens if a customer wants to return goods?', a: 'A clear 3-step process: customer ships goods to you → you contact us within 48 h → we settle with the supplier and you get a refund or credit for the next order. The Gold plan includes a buyback option for slow movers.' },
    { q: 'How does the triple quality check work?', a: 'Every shipment is checked three times: (1) on receipt from the manufacturer, (2) functionality and aesthetics before packing, (3) photo documentation. Result: fewer claims and better reviews in your shop.' },
    { q: 'Can I combine dropshipping with my own warehouse?', a: 'Yes. Many partners sell from their own warehouse and ours simultaneously. The customer cannot tell — feed and dispatch look the same.' },
    { q: 'What is swelt.launch and what does it include?', a: 'For new partners: 30-day guided onboarding with an account manager. We walk through feed setup, picking the first products and supporting your first campaign. We guarantee a first order within 30 days — or extend your trial by another month for free.' },
  ],
  finalCta: {
    badge: 'Start selling today',
    h2Part1: 'Start selling today —', h2Highlight: 'no risk, no warehouse.',
    sub: 'Thousands of shops in CZ and SK already do. Join them and sell premium products customers want — with no stock investment, no logistics pain.',
    ctaPrimary: 'Register for free and start', ctaSecondary: 'Write to us',
    contactItems: [
      { label: 'Mon–Fri 9:00–17:00', sub: 'Phone + chat' },
      { label: 'dropshipping@swelt.partner', sub: 'Reply within 2 h' },
      { label: 'Approval within 24 h', sub: 'No paperwork' },
    ],
    smallNote: 'No commitments · No credit card · Approval in 24 hours',
  },
};

const sk = en, pl = en, de = en, fr = en, es = en, it = en, nl = en, pt = en;
const hu = en, ro = en, sv = en, da = en, fi = en, no = en, el = en, is = en;

export const dropshipping: Record<Lang, DropText> = {
  cs, sk, pl, de, en, fr, es, it, nl, pt, hu, ro, sv, da, fi, no, el, is,
};
