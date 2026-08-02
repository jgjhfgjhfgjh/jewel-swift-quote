/**
 * Dropshipping landing page translations.
 * CS + EN fully translated; other 16 languages reuse EN as fallback.
 *
 * Tone of voice: B2B registr dle .claude/skills/swelt-copywriting —
 * vykání, krátké úderné věty, čtenář je hrdina, každé tvrzení kryté číslem.
 */
import type { Lang } from './i18n';

export interface DropPain { problem: string; title: string; text: string }
export interface DropStep { title: string; text: string }
export interface DropUsp { title: string; text: string }
export interface DropPlatform { detail: string; tag: string; time: string }
export interface DropFaq { q: string; a: string }
export interface DropTier { name: string; subtitle: string; priceNote: string; cta: string; badge: string; features: string[]; missing: string[] }
export interface DropMarket { country: string; detail: string; badge: string }
export interface DropZone { zone: string; couriers: string; time: string; reliability: string }
export interface DropCalcPlan { name: string; subtitle: string; badge: string; features: string[]; cta: string }

export interface DropText {
  hero: {
    badge: string; h1Part1: string; h1Highlight: string; sub: string;
    statLabels: string[]; ctaPrimary: string; ctaSecondary: string; bullets: string[];
    card: { eyebrow: string; badge: string; steps: { label: string; sub: string }[]; stats: { value: string; label: string }[] };
  };
  pain: { eyebrow: string; heading: string; items: DropPain[] };
  steps: { eyebrow: string; heading: string; sub: string; items: DropStep[] };
  shopUpsell: {
    badge: string; h1: string; h1Highlight: string; sub: string;
    features: { title: string; text: string }[]; cta1: string;
    digestEyebrow: string; digestWeek: string; digestRecsEyebrow: string; digestRecs: string[];
  };
  logistics: {
    eyebrow: string; heading: string; sub: string; zonesTitle: string; zones: DropZone[];
    qcHeading: string; qcSteps: { title: string; text: string }[];
    invoicing: { title: string; text: string }; lock: { title: string; text: string };
  };
  calc: {
    eyebrow: string; heading: string; sub: string;
    live: string; stockLabel: string; unit: string; currency: string;
    vocLabel: string; mocLabel: string; marginAtMoc: string;
    scenarioEyebrow: string; buyPriceLabel: string; buyPriceNote: string;
    sellPriceLabel: string; minLabel: string; mocShort: string; ordersLabel: string;
    marginPerPiece: string; monthlyProfit: string; ordersShort: string;
    resultsEyebrow: string; grossLabel: string; yearUnit: string; perMonthOrders: string;
    planLabel: string; perYearSuffix: string; billedQuarterly: string; billedYearly: string; perMonthShort: string;
    netPerYear: string; goodMargin: string; disclaimer: string; selectPlan: string;
    plans: DropCalcPlan[]; silverNote: string;
  };
  usps: { eyebrow: string; heading: string; items: DropUsp[] };
  statsBand: { value: string; label: string }[];
  platforms: { eyebrow: string; heading: string; sub: string; items: { name: string; data: DropPlatform }[]; setupTime: string; cta: string };
  euExpansion: { eyebrow: string; heading: string; sub: string; markets: DropMarket[] };
  pricing: {
    eyebrow: string; heading: string; quarterly: string; yearly: string; perMonth: string; bespoke: string;
    quarterlyNote: string; yearlyNote: string; allPrev: string; guarantee: string; tiers: DropTier[];
  };
  faq: { eyebrow: string; heading: string; showAll: string };
  faqs: DropFaq[];
  finalCta: {
    badge: string; h2Part1: string; h2Highlight: string; sub: string;
    ctaPrimary: string; ctaSecondary: string; contactItems: { label: string; sub: string }[]; smallNote: string;
  };
  notif: { entries: { name: string; city: string; action: string }[]; justNow: string };
}

const cs: DropText = {
  hero: {
    badge: 'swelt.Dropshipping — e-shop bez skladu',
    h1Part1: 'Prodávejte prémiové produkty', h1Highlight: 'bez skladu.',
    sub: 'Vyberte si z 3 000+ produktů od 70+ světových značek. My zabalíme, zkontrolujeme a odešleme — pod vaší značkou do 24–72 hodin. Real-time inventory lock hlídá přeprodej, swelt.signal vám každý týden řekne, co zákazníci právě chtějí.',
    statLabels: ['zemí doručení', 'značek', 'aktivních partnerů'],
    ctaPrimary: 'Chci dropshipping', ctaSecondary: 'Jak to funguje?',
    bullets: ['Bez závazků', 'Bez kreditní karty', 'Schválení do 24 h'],
    card: {
      eyebrow: 'Jak to funguje', badge: 'Bez skladu',
      steps: [
        { label: 'Zákazník objedná', sub: 'na vašem e-shopu' },
        { label: 'swelt zabalí a odešle', sub: 'pod vaší značkou' },
        { label: 'Doručení', sub: 'do 24–48 hodin' },
      ],
      stats: [
        { value: '60 %', label: 'průměrná marže' },
        { value: '0 Kč', label: 'investice do skladu' },
      ],
    },
  },
  pain: {
    eyebrow: 'Poznáváte se?',
    heading: 'Čtyři překážky, které řešíme za vás',
    items: [
      { problem: 'Nemám peníze na naskladnění', title: 'Platíte až po prodeji', text: 'Zákazník zaplatí vám. Vy zaplatíte nám. Nulová investice do zásob — žádné peníze zmrazené v regálech.' },
      { problem: 'Nevím, jak řešit logistiku', title: 'Expedici řešíme my', text: 'Balíme, kontrolujeme, odesíláme. Pod vaší fakturou. Zákazník vidí vás — ne nás. Trojí quality check na každé zásilce.' },
      { problem: 'Bojím se, že špatně zvolím produkty', title: 'swelt.signal vám poradí', text: 'AI modul sleduje trendy napříč distribucí. Každý týden dostanete top 10 trending produktů pro váš segment — přestanete hádat.' },
      { problem: 'Bojím se přeprodat zákazníkovi', title: 'Real-time inventory lock', text: 'Jakmile zákazník nakoupí, zásoby se v systému okamžitě uzamknou. Žádné „promiňte, zboží se vyprodalo po zaplacení“.' },
    ],
  },
  steps: {
    eyebrow: 'Jak to funguje', heading: 'Od registrace k první objednávce za 48 hodin', sub: 'Stačí pět kroků. Žádné papírování předem.',
    items: [
      { title: 'Registrace zdarma', text: 'Vytvoříte B2B účet. Schválení do 24 hodin v pracovní dny. Stačí IČO — žádné dokumenty předem.' },
      { title: 'Stáhnete produktový feed', text: 'XML, CSV nebo real-time API. Fotky, popisy, ceny, skladovost — vše automaticky. Do Shoptetu na 1 klik.' },
      { title: 'Zákazník nakoupí u vás', text: 'Nastavíte vlastní cenu a marži. Zákazník platí přímo vám. Rozdíl si necháte — my dostaneme velkoobchodní cenu.' },
      { title: 'Předáte nám objednávku', text: 'Přes platformu, API nebo XML export. Zásilku zabalíme pod vaší hlavičkou a předáme kurýrovi.' },
      { title: 'Zákazník dostane balíček', text: 'Doručení do 24–72 h. Tracking číslo automaticky. Zákazník se nikdy nedozví, kdo zásilku připravil.' },
    ],
  },
  shopUpsell: {
    badge: 'Nová služba — swelt.signal',
    h1: 'Co se bude prodávat?', h1Highlight: 'swelt.signal to ví předem.',
    sub: 'swelt.signal je product intelligence pro váš sortiment — týdenní digest trendů z katalogu 3 000+ produktů a AI doporučení, co přidat, co stáhnout a kdy. Součást plánů Silver a Gold.',
    features: [
      { title: 'Trendová data každý týden', text: 'Vidíte, co roste a co klesá napříč celým katalogem.' },
      { title: 'Signály z celé EU', text: 'Prodejní data z 15+ evropských trhů, ne jen z toho vašeho.' },
      { title: 'AI doporučení sortimentu', text: 'Konkrétní tipy, co přidat, co stáhnout a kdy — bez hádání.' },
      { title: 'Upozornění na příležitosti', text: 'Cenové poklesy, closeouty a nové kolekce se dozvíte první.' },
    ],
    cta1: 'Vyzkoušet dropshipping',
    digestEyebrow: 'Týdenní digest', digestWeek: 'Týden 17 · 2026',
    digestRecsEyebrow: 'AI doporučení tohoto týdne',
    digestRecs: [
      'Přidejte Citizen Eco-Drive — trend +28 % MoM',
      'Odeberte Versace V-Chronos — klesá 3 týdny v řadě',
      'Sledujte Seiko Presage — stabilní růst, dobrý timing',
    ],
  },
  logistics: {
    eyebrow: 'Spolehlivost',
    heading: 'Spolehlivost, na které záleží vašim zákazníkům',
    sub: 'Transparentní logistika. Žádná překvapení.',
    zonesTitle: 'Doručovací zóny',
    zones: [
      { zone: 'Česká republika',    couriers: 'DHL, DPD, GLS',   time: 'do 24 h',  reliability: '99,5 %' },
      { zone: 'Slovensko',          couriers: 'DPD, GLS',        time: 'do 48 h',  reliability: '97 %' },
      { zone: 'Německo & Rakousko', couriers: 'DHL Express',     time: 'do 72 h',  reliability: '96 %' },
      { zone: 'Zbytek EU',          couriers: 'DHL, FedEx, UPS', time: 'na dotaz', reliability: '95 %+' },
    ],
    qcHeading: 'Trojí quality check',
    qcSteps: [
      { title: 'Kontrola při příjmu', text: 'Každý produkt projde vizuální kontrolou při příjmu od výrobce. Poškozené zboží vracíme okamžitě.' },
      { title: 'Kontrola před balením', text: 'Funkčnost, estetika, kompletnost, baterie. Výsledek: méně reklamací ve vašem e-shopu.' },
      { title: 'Fotodokumentace zásilky', text: 'Každou zásilku před odesláním vyfotíme. V případě sporu máte důkaz — okamžitě.' },
    ],
    invoicing: { title: 'Consolidated B2B invoicing', text: 'Všechny vaše B2C objednávky za měsíc = 1 přehledná faktura od nás. Snadnější účetnictví, méně administrativy, čistší cash flow. PDF + strojově čitelný export.' },
    lock: { title: 'Real-time inventory lock', text: 'Zásoby se uzamknou v momentě objednávky zákazníka. Žádný přeprodej, žádné „promiňte, vyprodáno po zaplacení“. Zákaznická zkušenost bez kompromisů.' },
  },
  calc: {
    eyebrow: 'Kalkulačka marže',
    heading: 'Kolik můžete vydělat?',
    sub: 'Nastavte cenu a počet objednávek — kalkulačka ukáže váš roční potenciál.',
    live: 'Živě', stockLabel: 'Skladem', unit: 'ks', currency: 'Kč',
    vocLabel: 'VOC (nákup)', mocLabel: 'MOC (doporučená)', marginAtMoc: 'Marže při MOC',
    scenarioEyebrow: 'Nastavte svůj scénář',
    buyPriceLabel: 'Nákupní cena (pevná)', buyPriceNote: 'Velkoobchodní cena swelt.partner — fixní',
    sellPriceLabel: 'Vaše prodejní cena', minLabel: 'min.', mocShort: 'MOC:', ordersLabel: 'Objednávky za měsíc',
    marginPerPiece: 'Marže / kus', monthlyProfit: 'Měsíční zisk', ordersShort: 'obj.',
    resultsEyebrow: 'Roční potenciál po odečtení plánu',
    grossLabel: 'Hrubý potenciál', yearUnit: 'Kč / rok', perMonthOrders: 'obj./měsíc',
    planLabel: 'Plán', perYearSuffix: '/ rok', billedQuarterly: 'fakturováno čtvrtletně', billedYearly: 'fakturováno ročně', perMonthShort: 'Kč/měs',
    netPerYear: 'Čistý zisk / rok',
    goodMargin: '✓ Výborná marže — tento produkt stojí za propagaci',
    disclaimer: '* Orientační kalkulace. Nezahrnuje náklady na reklamu a platební brány.',
    selectPlan: 'Vybrat plán →',
    plans: [
      { name: 'Starter', subtitle: 'Rozjezd bez rizika', badge: '',
        features: ['Katalog 500 produktů', 'XML/CSV feed 1× denně', 'Expedice do 48 h', 'E-mailová podpora'],
        cta: 'Začít se Starterem' },
      { name: 'Silver', subtitle: 'Pro rostoucí e-shopy', badge: 'Nejoblíbenější',
        features: ['Celý katalog 3 000+ produktů', 'Real-time API + XML/CSV', 'Expedice do 24–48 h', 'White-label fakturace', 'Shoptet / WooCommerce API', 'swelt.signal Lite', 'Chat + telefonická podpora'],
        cta: 'Aktivovat Silver' },
      { name: 'Gold', subtitle: 'Enterprise & EU expanze', badge: 'Enterprise',
        features: ['Vše ze Silver', 'Dedikovaný account manager', 'swelt.signal Pro — real-time', 'Prioritní vyřízení do 4 h', 'EU expanze SK/DE/AT', 'SLA záruka doručení', 'Custom API integrace'],
        cta: 'Získat nabídku' },
    ],
    silverNote: 'Refund kreditem při obratu 50 000 Kč/měsíc',
  },
  usps: {
    eyebrow: 'Proč swelt.Dropshipping',
    heading: 'Nejsme jen dodavatel. Jsme váš byznys partner.',
    items: [
      { title: '70+ prémiových značek', text: 'Světové značky, které zákazníci znají a chtějí koupit.' },
      { title: 'Expedice do 24–72 hodin', text: 'Sklad v ČR, tři rychlostní pásma, spolehlivé doručení.' },
      { title: 'Shoptet API na 1 klik', text: 'Přímá integrace s nejrozšířenější českou platformou.' },
      { title: 'Real-time inventory lock', text: 'Zásoby uzamčeny v momentě objednávky. Žádný přeprodej.' },
      { title: 'Trojí quality check', text: 'Kontrola při příjmu, před odesláním a fotodokumentace.' },
      { title: 'Aktuální XML/CSV/API feed', text: 'Real-time nebo 4× denně — vždy aktuální ceny a sklad.' },
      { title: 'Consolidated B2B invoicing', text: 'Všechny B2C objednávky = 1 přehledná faktura měsíčně.' },
      { title: 'Bílý štítek od prvního dne', text: 'Zákazník nikdy neuvidí, že zásilku posílá swelt.partner.' },
      { title: 'Osobní account manager', text: 'Skutečný člověk — žádný bot, žádný ticketovací systém.' },
      { title: 'EU expanze: ČR, SK, DE, AT', text: 'Jeden feed, čtyři trhy. Lokalizovaný v cs/sk/en/de.' },
    ],
  },
  statsBand: [
    { value: '15+',     label: 'zemí doručení' },
    { value: '70+',     label: 'prémiových značek' },
    { value: '3 000+',  label: 'produktů v katalogu' },
    { value: '500+',    label: 'aktivních partnerů' },
  ],
  platforms: {
    eyebrow: 'Integrace', heading: 'Funguje s platformou, kterou už máte',
    sub: 'Shoptet, WooCommerce, Upgates, Shopify a další — swelt.Dropshipping napojíte bez kódu.',
    items: [
      { name: 'Shoptet',       data: { detail: 'Přímá API integrace. Synchronizace produktů, cen a skladovosti jedním klikem. Nejrychlejší nastavení na CZ trhu.', tag: '#1 v ČR', time: '~15 min' } },
      { name: 'WooCommerce',   data: { detail: 'WordPress plugin s XML feedem. Automatická aktualizace. Plná kontrola nad designem produktových stránek.', tag: 'Open source', time: '~30 min' } },
      { name: 'Upgates',       data: { detail: 'CSV a XML import s plnou kompatibilitou. Automatická synchronizace cen a zásob.', tag: '', time: '~20 min' } },
      { name: 'Eshop-rychle',  data: { detail: 'Nativní podpora produktového feedu. Rychlé nastavení bez technických znalostí.', tag: '', time: '~20 min' } },
      { name: 'Shopify',       data: { detail: 'Ideální pro SK/DE/AT expanzi. Vícejazyčný feed, mezinárodní platební brány.', tag: 'EU expanze', time: '~45 min' } },
      { name: 'PrestaShop',    data: { detail: 'XML feed a REST API přístup. Podpora verzí 1.6, 1.7 i novějších. Custom module na dotaz.', tag: '', time: '~30 min' } },
      { name: 'REST API',      data: { detail: 'Plný programátorský přístup. JSON formát, real-time synchronizace, vlastní integrace na libovolnou platformu.', tag: 'Pro vývojáře', time: 'Custom' } },
    ],
    setupTime: 'Nastavení',
    cta: 'Propojit můj e-shop',
  },
  euExpansion: {
    eyebrow: 'EU expanze', heading: 'Začnete v ČR. Dorostete do celé EU.',
    sub: 'Jeden partner, jeden feed, čtyři trhy. Bez poboček a skladů v zahraničí.',
    markets: [
      { country: 'Česká republika', detail: 'Primární trh. Doručení do 24 h. Shoptet, WooCommerce, Upgates.', badge: 'Primární' },
      { country: 'Slovensko',       detail: 'Lokalizovaný SK feed. SK dopravci. Stejný account manager.', badge: 'Live' },
      { country: 'Německo',         detail: 'EN/DE feed. DHL Express. Na dotaz — pomůžeme s nastavením.', badge: 'Na dotaz' },
      { country: 'Rakousko',        detail: 'EN/DE feed. DHL Express. Ideální pro Shopify e-shopy.', badge: 'Na dotaz' },
    ],
  },
  pricing: {
    eyebrow: 'Ceník', heading: 'Vyberte plán pro svůj e-shop',
    quarterly: 'Čtvrtletně', yearly: 'Ročně', perMonth: 'Kč / měs.', bespoke: 'Na míru',
    quarterlyNote: 'Kč · fakturováno čtvrtletně', yearlyNote: 'Kč · fakturováno ročně',
    allPrev: 'Vše ze',
    guarantee: '30denní záruka spokojenosti — pokud do 30 dní zjistíte, že to není pro vás, vrátíme vám celý poplatek. Bez otázek.',
    tiers: [
      { name: 'Starter', subtitle: 'Pro první kroky\na testování trhu', priceNote: 'Kč / měsíc bez DPH', cta: 'Začít zdarma na 14 dní', badge: '',
        features: ['500 produktů — základní katalog', '1× denní aktualizace feedu', 'Expedice do 72 hodin', 'E-mailová podpora', 'swelt.launch onboarding'],
        missing: ['Bílý štítek', 'Shoptet API', 'swelt.signal', 'Real-time inventory lock'] },
      { name: 'Silver', subtitle: 'Pro rostoucí e-shopy,\nkteré to myslí vážně', priceNote: 'Kč / měsíc bez DPH', cta: 'Aktivovat Silver →', badge: 'Nejoblíbenější',
        features: ['Celý katalog 3 000+ produktů', 'Real-time API + 4× denně XML/CSV', 'Expedice do 24–48 hodin', 'Bílý štítek — vaše faktura + logo', 'Shoptet / WooCommerce API', 'Real-time inventory lock', 'Consolidated B2B invoicing', 'Telefonická + chat podpora', 'swelt.signal Lite — týdenní digest', 'swelt.launch onboarding', 'Refund kreditem při obratu 50 000 Kč/měsíc'],
        missing: [] },
      { name: 'Gold', subtitle: 'Pro profesionální e-shopy\na EU expanzi', priceNote: 'individuální nabídka', cta: 'Získat nabídku', badge: 'Enterprise',
        features: ['Vše ze Silver', 'Dedikovaný account manager', 'swelt.signal Pro — real-time + API', 'Prioritní vyřízení do 4 hodin', 'EU expanze SK/DE/AT — lokalizace', 'Trojí quality check + fotodokumentace', 'Buyback pomaloobrátkových zásob', 'Vlastní produktové fotky na vyžádání', 'SLA záruka doručení', 'Custom API integrace'],
        missing: [] },
    ],
  },
  faq: { eyebrow: 'FAQ', heading: 'Nejčastější otázky', showAll: 'Zobrazit všechny otázky' },
  faqs: [
    { q: 'Co je dropshipping a jak přesně funguje?', a: 'Zákazník nakoupí ve vašem e-shopu, zboží mu odešleme my — pod vaší značkou, s vaší fakturou. Nepotřebujete sklad ani kapitál v zásobách. Zákazník rozdíl nepozná.' },
    { q: 'Potřebuji IČO nebo živnostenský list?', a: 'Ano. Dropshipping je podnikání. Potřebujete platné IČO nebo živnostenský list. Pokud teprve začínáte, s nastavením vám pomůžeme.' },
    { q: 'Kolik stojí začátek?', a: 'Registrace je zdarma, prvních 14 dní také — bez platby. Placené plány začínají na 1 490 Kč/měsíc (Starter). Silver (2 490 Kč/měsíc) se vám vrací jako kredit při obratu 50 000 Kč/měsíc.' },
    { q: 'Uvidí zákazník, že zásilku posílá swelt.partner?', a: 'Ne. Na zásilce je vaše faktura, vaše logo, váš název. My nikde nefigurujeme — white-label je součástí všech placených plánů (kromě Starteru).' },
    { q: 'Jak rychle expedujete?', a: 'Tři rychlostní pásma: Express do 24 h (>99,5 % spolehlivost), Standard do 48 h (~97 %), Economy do 72 h (~95 %). Každá zásilka má tracking číslo.' },
    { q: 'Jaká je minimální objednávka?', a: 'Žádná. Pošleme i jeden kus jednomu zákazníkovi — platíte až po jeho objednávce. Žádné MOQ.' },
    { q: 'Mohu dropshippovat do zahraničí?', a: 'Ano. Primárně ČR a SK, feed je lokalizovaný v cs/sk/en/de. Pro expanzi do DE a AT kontaktujte svého account managera.' },
    { q: 'Co je swelt.signal a proč ho potřebuji?', a: 'AI modul, který sleduje pohyb produktů napříč naší distribucí. Každý týden dostanete top 10 rostoucích a 5 klesajících produktů — víte, co přidat a co stáhnout, dřív než konkurence.' },
    { q: 'Jak funguje real-time inventory lock?', a: 'Jakmile zákazník dokončí objednávku ve vašem e-shopu, zásoby se v našem systému okamžitě uzamknou. Žádný přeprodej, žádné „promiňte, vyprodáno po zaplacení“.' },
    { q: 'Jak funguje consolidated B2B invoicing?', a: 'Všechny vaše B2C objednávky za měsíc sloučíme do jedné přehledné B2B faktury. Méně administrativy, snadnější účetnictví i daňové přiznání.' },
    { q: 'Co když zákazník vrátí zboží?', a: 'Jasné tři kroky: zákazník pošle zboží vám → do 48 hodin nás kontaktujete → my to vyřešíme s dodavatelem a vy dostanete náhradu nebo kredit na příští objednávku. Gold plán navíc obsahuje buyback pomaloobrátkových zásob.' },
    { q: 'Jak funguje trojí quality check?', a: 'Každou zásilku kontrolujeme třikrát: při příjmu od výrobce, před balením (funkčnost a estetika) a fotodokumentací před odesláním. Výsledek: méně reklamací a lepší recenze ve vašem e-shopu.' },
    { q: 'Mohu kombinovat dropshipping s vlastním skladem?', a: 'Ano. Řada partnerů prodává ze svého skladu i z našeho současně. Zákazník rozdíl nepozná — feed i expedice vypadají stejně.' },
    { q: 'Co je swelt.launch a co zahrnuje?', a: 'Onboarding pro nové partnery: 30 dní s account managerem — nastavení feedu, výběr prvních produktů, podpora první kampaně. Garantujeme první objednávku do 30 dní, jinak vám trial prodloužíme o měsíc zdarma.' },
  ],
  finalCta: {
    badge: 'Začněte prodávat dnes',
    h2Part1: 'Začněte prodávat ještě dnes —', h2Highlight: 'bez rizika, bez skladu.',
    sub: '500+ partnerů v ČR a SK už s námi prodává. Přidejte se — prodávejte prémiové produkty bez investice do zásob a bez starostí s logistikou.',
    ctaPrimary: 'Registrovat se zdarma', ctaSecondary: 'Napsat nám',
    contactItems: [
      { label: 'Po–Pá 9:00–17:00', sub: 'Telefon + chat' },
      { label: 'dropshipping@swelt.partner', sub: 'Odpověď do 2 h' },
      { label: 'Schválení do 24 h', sub: 'Žádné papírování' },
    ],
    smallNote: 'Bez závazků · Bez kreditní karty · Schválení do 24 hodin',
  },
  notif: {
    entries: [
      { name: 'Jan K.',    city: 'Prahy',      action: 'se zaregistroval' },
      { name: 'Tereza M.', city: 'Brna',       action: 'aktivovala Silver plán' },
      { name: 'Ondřej P.', city: 'Ostravy',    action: 'spustil první feed' },
      { name: 'Lucie V.',  city: 'Plzně',      action: 'přidala 120 produktů' },
      { name: 'Martin S.', city: 'Bratislavy', action: 'expandoval na SK' },
    ],
    justNow: 'právě teď',
  },
};

const en: DropText = {
  hero: {
    badge: 'swelt.Dropshipping — a shop without a warehouse',
    h1Part1: 'Sell premium products', h1Highlight: 'without a warehouse.',
    sub: 'Pick from 3,000+ products by 70+ world brands. We pack, inspect and ship — under your brand within 24–72 hours. Real-time inventory lock stops overselling, swelt.signal tells you every week what customers want right now.',
    statLabels: ['delivery countries', 'brands', 'active partners'],
    ctaPrimary: 'Start dropshipping free', ctaSecondary: 'How it works',
    bullets: ['No commitment', 'No credit card', 'Approval within 24 h'],
    card: {
      eyebrow: 'How it works', badge: 'No warehouse',
      steps: [
        { label: 'Customer orders', sub: 'in your e-shop' },
        { label: 'swelt packs & ships', sub: 'under your brand' },
        { label: 'Delivered', sub: 'within 24–48 hours' },
      ],
      stats: [
        { value: '60%', label: 'average margin' },
        { value: '0 Kč', label: 'stock investment' },
      ],
    },
  },
  pain: {
    eyebrow: 'Sound familiar?',
    heading: 'Four obstacles we remove for you',
    items: [
      { problem: "I don't have money to stock up", title: 'Pay only after you sell', text: 'The customer pays you. You pay us. Zero investment in stock — no money frozen on shelves.' },
      { problem: "I don't know how to handle logistics", title: 'We handle dispatch', text: 'We pack, inspect and ship. Under your invoice. The customer sees you — not us. Triple quality check on every parcel.' },
      { problem: "I'm afraid of picking the wrong products", title: 'swelt.signal guides you', text: 'The AI module tracks trends across our distribution. Every week you get the top 10 trending products for your segment — stop guessing.' },
      { problem: "I'm afraid of overselling", title: 'Real-time inventory lock', text: 'The moment a customer buys, stock locks in our system. No more "sorry, sold out after payment".' },
    ],
  },
  steps: {
    eyebrow: 'How it works', heading: 'From sign-up to first order in 48 hours', sub: 'Five steps. No paperwork up front.',
    items: [
      { title: 'Register for free', text: 'Create a B2B account. Approval within 24 hours on business days. A VAT ID is all you need — no documents up front.' },
      { title: 'Download the product feed', text: 'XML, CSV or real-time API. Photos, descriptions, prices, stock — all automatic. Into Shoptet in 1 click.' },
      { title: 'Customer buys from you', text: 'Set your own price and margin. The customer pays you directly. You keep the difference — we get the wholesale price.' },
      { title: 'Forward us the order', text: 'Via the platform, API or XML export. We pack the parcel under your branding and hand it to the courier.' },
      { title: 'Customer gets the parcel', text: 'Delivery within 24–72 h. Tracking number automatic. The customer never learns who packed it.' },
    ],
  },
  shopUpsell: {
    badge: 'New service — swelt.signal',
    h1: 'What will sell next?', h1Highlight: 'swelt.signal knows ahead of time.',
    sub: 'swelt.signal is product intelligence for your assortment — a weekly trend digest across the 3,000+ product catalog with AI recommendations on what to add, what to drop and when. Included in the Silver and Gold plans.',
    features: [
      { title: 'Trend data every week', text: 'See what is rising and falling across the entire catalog.' },
      { title: 'Signals from all over the EU', text: 'Sales data from 15+ European markets, not just yours.' },
      { title: 'AI assortment recommendations', text: 'Concrete tips on what to add, what to drop and when — no guessing.' },
      { title: 'Opportunity alerts', text: 'Price drops, closeouts and new collections — you hear it first.' },
    ],
    cta1: 'Try dropshipping',
    digestEyebrow: 'Weekly digest', digestWeek: 'Week 17 · 2026',
    digestRecsEyebrow: 'AI recommendations of the week',
    digestRecs: [
      'Add Citizen Eco-Drive — trending +28% MoM',
      'Drop Versace V-Chronos — declining 3 weeks straight',
      'Watch Seiko Presage — steady growth, good timing',
    ],
  },
  logistics: {
    eyebrow: 'Reliability',
    heading: 'Reliability your customers will notice',
    sub: 'Transparent logistics. No surprises.',
    zonesTitle: 'Delivery zones',
    zones: [
      { zone: 'Czech Republic',    couriers: 'DHL, DPD, GLS',   time: 'within 24 h', reliability: '99.5%' },
      { zone: 'Slovakia',          couriers: 'DPD, GLS',        time: 'within 48 h', reliability: '97%' },
      { zone: 'Germany & Austria', couriers: 'DHL Express',     time: 'within 72 h', reliability: '96%' },
      { zone: 'Rest of EU',        couriers: 'DHL, FedEx, UPS', time: 'on request',  reliability: '95%+' },
    ],
    qcHeading: 'Triple quality check',
    qcSteps: [
      { title: 'Inspection on receipt', text: 'Every product passes a visual check on receipt from the manufacturer. Damaged goods go straight back.' },
      { title: 'Check before packing', text: 'Functionality, aesthetics, completeness, batteries. The result: fewer claims in your e-shop.' },
      { title: 'Photo documentation', text: 'Every parcel is photographed before dispatch. In a dispute, you have proof — instantly.' },
    ],
    invoicing: { title: 'Consolidated B2B invoicing', text: 'All your B2C orders for the month = 1 clean invoice from us. Easier accounting, less admin, cleaner cash flow. PDF + machine-readable export.' },
    lock: { title: 'Real-time inventory lock', text: 'Stock locks the moment your customer orders. No overselling, no "sorry, sold out after payment". Customer experience without compromise.' },
  },
  calc: {
    eyebrow: 'Margin calculator',
    heading: 'How much can you earn?',
    sub: 'Set your price and monthly orders — the calculator shows your yearly potential.',
    live: 'Live', stockLabel: 'In stock', unit: 'pcs', currency: 'CZK',
    vocLabel: 'VOC (purchase)', mocLabel: 'MOC (recommended)', marginAtMoc: 'Margin at MOC',
    scenarioEyebrow: 'Set your scenario',
    buyPriceLabel: 'Purchase price (fixed)', buyPriceNote: 'swelt.partner wholesale price — fixed',
    sellPriceLabel: 'Your selling price', minLabel: 'min.', mocShort: 'MOC:', ordersLabel: 'Orders per month',
    marginPerPiece: 'Margin / piece', monthlyProfit: 'Monthly profit', ordersShort: 'orders',
    resultsEyebrow: 'Yearly potential after plan costs',
    grossLabel: 'Gross potential', yearUnit: 'CZK / year', perMonthOrders: 'orders/month',
    planLabel: 'Plan', perYearSuffix: '/ year', billedQuarterly: 'billed quarterly', billedYearly: 'billed yearly', perMonthShort: 'CZK/mo',
    netPerYear: 'Net profit / year',
    goodMargin: '✓ Great margin — this product is worth promoting',
    disclaimer: '* Indicative calculation. Excludes ad spend and payment gateway fees.',
    selectPlan: 'Choose plan →',
    plans: [
      { name: 'Starter', subtitle: 'Risk-free start', badge: '',
        features: ['Catalog of 500 products', 'XML/CSV feed 1× daily', 'Dispatch within 48 h', 'Email support'],
        cta: 'Start with Starter' },
      { name: 'Silver', subtitle: 'For growing e-shops', badge: 'Most popular',
        features: ['Full catalog of 3,000+ products', 'Real-time API + XML/CSV', 'Dispatch within 24–48 h', 'White-label invoicing', 'Shoptet / WooCommerce API', 'swelt.signal Lite', 'Chat + phone support'],
        cta: 'Activate Silver' },
      { name: 'Gold', subtitle: 'Enterprise & EU expansion', badge: 'Enterprise',
        features: ['Everything in Silver', 'Dedicated account manager', 'swelt.signal Pro — real-time', 'Priority handling within 4 h', 'EU expansion SK/DE/AT', 'SLA delivery guarantee', 'Custom API integration'],
        cta: 'Get an offer' },
    ],
    silverNote: 'Refunded as credit at 50,000 CZK monthly turnover',
  },
  usps: {
    eyebrow: 'Why swelt.Dropshipping',
    heading: 'Not just a supplier. Your business partner.',
    items: [
      { title: '70+ premium brands', text: 'World brands customers know and want to buy.' },
      { title: 'Dispatch within 24–72 hours', text: 'Warehouse in CZ, three speed tiers, reliable delivery.' },
      { title: 'Shoptet API in 1 click', text: 'Direct integration with the most popular CZ platform.' },
      { title: 'Real-time inventory lock', text: 'Stock locked at the moment of order. No overselling.' },
      { title: 'Triple quality check', text: 'Inspection on receipt, before dispatch and photo documentation.' },
      { title: 'Live XML/CSV/API feed', text: 'Real-time or 4× daily — always current prices and stock.' },
      { title: 'Consolidated B2B invoicing', text: 'All B2C orders = 1 clean invoice per month.' },
      { title: 'White label from day one', text: 'The customer never sees that swelt.partner shipped the order.' },
      { title: 'Personal account manager', text: 'A real human — no bot, no ticketing system.' },
      { title: 'EU expansion: CZ, SK, DE, AT', text: 'One feed, four markets. Localized in cs/sk/en/de.' },
    ],
  },
  statsBand: [
    { value: '15+',    label: 'delivery countries' },
    { value: '70+',    label: 'premium brands' },
    { value: '3,000+', label: 'products in catalog' },
    { value: '500+',   label: 'active partners' },
  ],
  platforms: {
    eyebrow: 'Integration', heading: 'Works with the platform you already run',
    sub: 'Shoptet, WooCommerce, Upgates, Shopify and more — connect swelt.Dropshipping with no code.',
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
    cta: 'Connect my e-shop',
  },
  euExpansion: {
    eyebrow: 'EU expansion', heading: 'Start in CZ. Grow across the EU.',
    sub: 'One partner, one feed, four markets. No branches or warehouses abroad.',
    markets: [
      { country: 'Czech Republic', detail: 'Primary market. Delivery within 24 h. Shoptet, WooCommerce, Upgates.', badge: 'Primary' },
      { country: 'Slovakia',       detail: 'Localized SK feed. SK couriers. Same account manager.', badge: 'Live' },
      { country: 'Germany',        detail: 'EN/DE feed. DHL Express. On request — we help you set up.', badge: 'On request' },
      { country: 'Austria',        detail: 'EN/DE feed. DHL Express. Ideal for Shopify e-shops.', badge: 'On request' },
    ],
  },
  pricing: {
    eyebrow: 'Pricing', heading: 'Pick the plan for your e-shop',
    quarterly: 'Quarterly', yearly: 'Yearly', perMonth: 'CZK / mo', bespoke: 'Bespoke',
    quarterlyNote: 'CZK · billed quarterly', yearlyNote: 'CZK · billed yearly',
    allPrev: 'Everything from',
    guarantee: '30-day satisfaction guarantee — if you find within 30 days it is not for you, we refund the full fee. No questions asked.',
    tiers: [
      { name: 'Starter', subtitle: 'For first steps\nand market testing', priceNote: 'CZK / month excl. VAT', cta: 'Start 14 days free', badge: '',
        features: ['500 products — basic catalog', 'Daily feed update', 'Dispatch within 72 hours', 'Email support', 'swelt.launch onboarding'],
        missing: ['White label', 'Shoptet API', 'swelt.signal', 'Real-time inventory lock'] },
      { name: 'Silver', subtitle: 'For growing e-shops\nthat mean business', priceNote: 'CZK / month excl. VAT', cta: 'Activate Silver →', badge: 'Most popular',
        features: ['Full catalog of 3,000+ products', 'Real-time API + 4× daily XML/CSV', 'Dispatch within 24–48 hours', 'White label — your invoice + logo', 'Shoptet / WooCommerce API', 'Real-time inventory lock', 'Consolidated B2B invoicing', 'Phone + chat support', 'swelt.signal Lite — weekly digest', 'swelt.launch onboarding', 'Credit refund at 50,000 CZK monthly turnover'],
        missing: [] },
      { name: 'Gold', subtitle: 'For professional e-shops\nand EU expansion', priceNote: 'individual offer', cta: 'Get an offer', badge: 'Enterprise',
        features: ['Everything from Silver', 'Dedicated account manager', 'swelt.signal Pro — real-time + API', 'Priority handling within 4 hours', 'EU expansion SK/DE/AT — localization', 'Triple quality check + photo documentation', 'Buyback option for slow movers', 'Custom product photos on request', 'SLA delivery guarantee', 'Custom API integration'],
        missing: [] },
    ],
  },
  faq: { eyebrow: 'FAQ', heading: 'Frequently asked questions', showAll: 'Show all questions' },
  faqs: [
    { q: 'What is dropshipping and how does it work?', a: 'The customer buys in your e-shop, we ship the goods — under your brand, with your invoice. You need no warehouse and no capital tied up in stock. The customer cannot tell the difference.' },
    { q: 'Do I need a VAT ID or business license?', a: 'Yes. Dropshipping is a business activity. You need a valid VAT ID or business license. If you are just starting, we help you with the setup.' },
    { q: 'How much does it cost to start?', a: 'Registration is free, and so are the first 14 days — no payment. Paid plans start at 1,490 CZK/month (Starter). Silver (2,490 CZK/month) comes back to you as credit at 50,000 CZK monthly turnover.' },
    { q: 'Will the customer see that swelt.partner ships the order?', a: 'No. Your invoice, your logo, your name on the parcel. We appear nowhere — white label is part of every paid plan (except Starter).' },
    { q: 'How fast do you dispatch?', a: 'Three speed tiers: Express within 24 h (>99.5% reliability), Standard within 48 h (~97%), Economy within 72 h (~95%). Every parcel gets a tracking number.' },
    { q: 'What is the minimum order?', a: 'None. We ship a single piece to a single customer — you pay only after their order. No MOQ.' },
    { q: 'Can I dropship abroad?', a: 'Yes. Primarily CZ and SK, the feed is localized in cs/sk/en/de. For DE and AT expansion, contact your account manager.' },
    { q: 'What is swelt.signal and why do I need it?', a: 'An AI module tracking product movement across our distribution. Every week you get the top 10 rising and 5 declining products — you know what to add and what to drop before your competitors do.' },
    { q: 'How does real-time inventory lock work?', a: 'The moment a customer completes an order in your e-shop, stock locks in our system. No overselling, no "sorry, sold out after payment".' },
    { q: 'How does consolidated B2B invoicing work?', a: 'We merge all your B2C orders for the month into one clean B2B invoice. Less admin, easier accounting and tax filing.' },
    { q: 'What if a customer returns goods?', a: 'Three clear steps: the customer ships the goods to you → you contact us within 48 hours → we settle it with the supplier and you get a refund or credit for the next order. The Gold plan also includes a buyback option for slow movers.' },
    { q: 'How does the triple quality check work?', a: 'We check every parcel three times: on receipt from the manufacturer, before packing (functionality and aesthetics) and with photo documentation before dispatch. The result: fewer claims and better reviews in your e-shop.' },
    { q: 'Can I combine dropshipping with my own warehouse?', a: 'Yes. Many partners sell from their own warehouse and ours at the same time. The customer cannot tell — feed and dispatch look identical.' },
    { q: 'What is swelt.launch and what does it include?', a: 'Onboarding for new partners: 30 days with an account manager — feed setup, picking your first products, support for your first campaign. We guarantee a first order within 30 days, or we extend your trial by a month for free.' },
  ],
  finalCta: {
    badge: 'Start selling today',
    h2Part1: 'Start selling today —', h2Highlight: 'no risk, no warehouse.',
    sub: '500+ partners in CZ and SK already sell with us. Join them — sell premium products with zero stock investment and zero logistics pain.',
    ctaPrimary: 'Register for free', ctaSecondary: 'Write to us',
    contactItems: [
      { label: 'Mon–Fri 9:00–17:00', sub: 'Phone + chat' },
      { label: 'dropshipping@swelt.partner', sub: 'Reply within 2 h' },
      { label: 'Approval within 24 h', sub: 'No paperwork' },
    ],
    smallNote: 'No commitment · No credit card · Approval within 24 hours',
  },
  notif: {
    entries: [
      { name: 'Jan K.',    city: 'Prague',     action: 'just signed up' },
      { name: 'Tereza M.', city: 'Brno',       action: 'activated the Silver plan' },
      { name: 'Ondřej P.', city: 'Ostrava',    action: 'launched their first feed' },
      { name: 'Lucie V.',  city: 'Plzeň',      action: 'added 120 products' },
      { name: 'Martin S.', city: 'Bratislava', action: 'expanded to SK' },
    ],
    justNow: 'just now',
  },
};

const sk = en, pl = en, de = en, fr = en, es = en, it = en, nl = en, pt = en;
const hu = en, ro = en, sv = en, da = en, fi = en, no = en, el = en, is = en;

export const dropshipping: Record<Lang, DropText> = {
  cs, sk, pl, de, en, fr, es, it, nl, pt, hu, ro, sv, da, fi, no, el, is,
};
