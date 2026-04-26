/**
 * Velkoobchod (B2B wholesale) landing page translations.
 * CS + EN fully translated; other languages reuse EN (high-quality fallback).
 */
import type { Lang } from './i18n';

export interface StepText { title: string; desc: string }
export interface TargetText { title: string; desc: string; bullets: string[] }
export interface FeatureText { label: string; desc: string }
export interface VolumeTierText { name: string; volume: string; price: string; priceNote: string; features: string[]; cta: string }
export interface EcosystemText { name: string; desc: string }
export interface FaqText { q: string; a: string }
export interface AccessTierText { label: string; badge?: string }

export interface VelkoobchodText {
  hero: { badge: string; heading: string; sub: string; ctaRegister: string; ctaLogin: string; ctaCatalog: string; bullets: string[]; banner: string };
  stats: string[]; // 4 stat labels
  preview: { eyebrow: string; heading: string; p1: string; p2: string; p3: string; cta1: string; cta2: string };
  accessTiers: AccessTierText[];
  accessItems: string[]; // 6 items shared across tiers
  forWhom: { eyebrow: string; heading: string; sub: string; popular: string };
  targets: TargetText[];
  onboarding: { eyebrow: string; heading: string; sub: string; ctaStart: string; ctaApproved: string; ctaProcessing: string };
  steps: StepText[];
  catalog: { eyebrow: string; heading: string; sub: string; brandsLabel: string; brandsMore: string };
  features: FeatureText[];
  partnership: { eyebrow: string; heading: string; sub: string; recommended: string };
  volumeTiers: VolumeTierText[];
  ecosystem: { eyebrow: string; heading: string; sub: string };
  ecosystemItems: EcosystemText[];
  faq: { eyebrow: string; heading: string; sub: string };
  faqItems: FaqText[];
  finalCta: { heading: string; sub: string; ctaRegister: string; ctaContact: string; communityBadge: string; bottomHeading: string; bottomSub: string; processing: string; learnMore: string };
  authTip: string;
  whySwelt: { eyebrow: string; heading: string; p: string; bullets: string[] };
  whyStats: string[]; // 4 labels
  testimonials: { name: string; role: string; text: string }[];
  trustStrip: string[]; // 5 strings
  contactNote: string;
  ecosystemSell: { eyebrow: string; heading: string; sub: string };
}

const cs: VelkoobchodText = {
  hero: {
    badge: 'B2B Velkoobchod · Přímý přístup k dodavateli',
    heading: 'Nakupujte prémiové značky přímo od zdroje.',
    sub: '3 000+ produktů, 70+ světových značek, marže 40–65 %. Žádní prostředníci, žádné zbytečné přirážky. Registrace zdarma — schválení do 24 hodin.',
    ctaRegister: 'Registrovat se zdarma', ctaLogin: 'Přihlásit se', ctaCatalog: 'Vstoupit do katalogu',
    bullets: ['Registrace zdarma', 'Bez minimálního odběru', 'Schválení do 24 h', 'IČO není podmínkou'],
    banner: 'Chcete si nejdřív prohlédnout sortiment? Zaregistrujte se zdarma přes e-mail nebo Google a okamžitě nahlédněte do celého katalogu — fotky, dostupnost a doporučené ceny. Velkoobchodní nákupní ceny se odemknou po schválení B2B účtu.',
  },
  stats: ['produktů v katalogu', 'světových značek', 'sleva pod MOC', 'aktivních partnerů'],
  preview: {
    eyebrow: 'Nahlédněte bez závazků',
    heading: 'Prohlédněte si celý katalog ještě dnes — zdarma a bez čekání.',
    p1: 'Víme, že vstoupit do nového partnerství chce důvěru. Proto vám umožňujeme nahlédnout do katalogu ještě předtím, než cokoliv rozhodujete. Stačí se přihlásit přes e-mail nebo Google — trvá to 30 sekund.',
    p2: 'Uvidíte celý sortiment: 3 000+ produktů, fotky, dostupnost v reálném čase a doporučené maloobchodní ceny (MOC). Takže si rovnou spočítáte, jaké marže vás čekají.',
    p3: 'Velkoobchodní nákupní ceny jsou skryté a odemknou se automaticky po ověření a schválení vašeho B2B účtu — zpravidla do 24 hodin. Registrace je zcela zdarma.',
    cta1: 'Nahlédnout do katalogu', cta2: 'Registrovat se',
  },
  accessTiers: [
    { label: 'Nepřihlášen' },
    { label: 'Přihlášen zdarma (Google / e-mail)', badge: 'Bez čekání' },
    { label: 'Schválený B2B partner', badge: 'Plný přístup' },
  ],
  accessItems: ['Prohlídka sortimentu', 'Fotky a popis produktů', 'Doporučené ceny (MOC)', 'Skladové zásoby', 'Velkoobchodní ceny', 'Objednávkový systém'],
  forWhom: {
    eyebrow: 'Pro koho jsme',
    heading: 'Velkoobchod pro každou fázi vašeho podnikání',
    sub: 'Ať prodáváte na tržišti, provozujete e-shop nebo zásobujete síť prodejen — máme podmínky, které dávají smysl pro váš objem a ambice.',
    popular: 'Nejoblíbenější',
  },
  targets: [
    { title: 'Malý obchodník', desc: 'Kamenný obchod, tržiště nebo začínající e-shop. Pořizujete 1–30 kusů měsíčně a hledáte prémiové zboží s dobrou marží bez složitých smluvních závazků.', bullets: ['Žádná minimální objednávka', 'Nákupní ceny od prvního kusu', 'Osobní podpora obchodního týmu'] },
    { title: 'Rostoucí e-shop', desc: 'Prodáváte online a chcete automatizovat doplňování katalogu. Obrat 10 000–100 000 Kč měsíčně — a chuť růst dál.', bullets: ['Automatické napojení přes swelt.feed', 'Individuální slevy dle obratu', 'Priority shipping a dedikovaná podpora'] },
    { title: 'Velký distributor', desc: 'Zásobujete síť prodejen nebo váš obrat přesahuje 100 000 Kč měsíčně. Potřebujete individuální podmínky, API přístup a dedikovaný servis.', bullets: ['Individuální cenotvorba a SLA', 'Dedikovaný account manager', 'API přístup k datům a zásobám'] },
  ],
  onboarding: {
    eyebrow: 'Jak začít',
    heading: 'Od registrace k první objednávce za 24 hodin',
    sub: 'Žádné papírování, žádné čekání týdny. Jednoduchý proces — stačí se zaregistrovat a o zbytek se postaráme my.',
    ctaStart: 'Začít registraci zdarma', ctaApproved: 'Vstoupit do katalogu', ctaProcessing: 'Žádost se zpracovává',
  },
  steps: [
    { title: 'Bezplatná registrace', desc: 'Vyplňte základní údaje — jméno, e-mail, telefon. Registrace trvá 2 minuty a je zcela zdarma.' },
    { title: 'Ověření B2B účtu', desc: 'Zadejte IČO nebo doložte jiný doklad o podnikání. Přijímáme i fyzické osoby se záměrem dalšího prodeje.' },
    { title: 'Schválení do 24 hodin', desc: 'Náš obchodní tým prověří žádost a aktivuje vám plný přístup k velkoobchodnímu katalogu.' },
    { title: 'Nakupujte a vydělávejte', desc: 'Prohlédněte si 3 000+ produktů, zadejte objednávku, my se postaráme o expedici do 24–48 hodin.' },
  ],
  catalog: {
    eyebrow: 'Katalog',
    heading: 'Co najdete v B2B katalogu',
    sub: 'Přímý přístup k 3 000+ prémiových hodinek a šperků. Vše skladem, vše s aktuálními velkoobchodními cenami a přesným přehledem zásob.',
    brandsLabel: '70+ značek dostupných od prvního kusu', brandsMore: '+50 dalších →',
  },
  features: [
    { label: '3 000+ produktů', desc: 'Hodinky, šperky, příslušenství' },
    { label: '70+ světových značek', desc: 'Tommy Hilfiger, Versace, Seiko…' },
    { label: '40–65 % pod MOC', desc: 'Marže s prostorem na zisk' },
    { label: 'Zásoby v reálném čase', desc: 'Aktualizace každé 2 hodiny' },
    { label: '15+ kategorií', desc: 'Dámské, pánské, unisex, doplňky' },
    { label: 'Expedice 24–48 h', desc: 'FedEx, DHL, UPS — celá EU' },
    { label: 'Ceny bez DPH', desc: 'Jasná kalkulace pro B2B partnery' },
    { label: 'Nové kolekce každý týden', desc: 'Přímý přístup před ostatními' },
  ],
  partnership: {
    eyebrow: 'Partnerské podmínky',
    heading: 'Ceny, které rostou s vaším obratem',
    sub: 'Základní nákupní ceny jsou otevřené pro všechny registrované partnery. Čím vyšší obrat, tím lepší podmínky — bez složitých smluv od začátku.',
    recommended: 'Doporučeno',
  },
  volumeTiers: [
    { name: 'Registrace', volume: 'Libovolný objem', price: 'Zdarma', priceNote: 'vstup bez závazků', features: ['Přístup k B2B katalogu', 'Nákupní ceny od 1 kusu', 'Online objednávkový systém', 'Zákaznická podpora v češtině'], cta: 'Registrovat se' },
    { name: 'Partner', volume: '20 000+ Kč / měsíc', price: 'Individuální sleva', priceNote: 'nad rámec nákupních cen', features: ['Vše z Registrace', 'Individuální sleva dle obratu', 'Priority shipping bez příplatku', 'Přístup k novinkám před ostatními', 'Dedikovaný obchodní zástupce'], cta: 'Zjistit podmínky' },
    { name: 'Enterprise', volume: '200 000+ Kč / měsíc', price: 'Na míru', priceNote: 'individuální smlouva', features: ['Vše z Partner', 'Smluvní ceny a SLA garantie', 'API přístup k datům a zásobám', 'White-label možnosti', 'Zastoupení v EU zemích'], cta: 'Kontaktovat obchod' },
  ],
  ecosystem: {
    eyebrow: 'swelt.partner ekosystém',
    heading: 'Velkoobchod je jen začátek',
    sub: 'Kombinujte velkoobchod s dalšími službami swelt — feed, dropshipping, privátní nákupy nebo hotový e-shop. Vše propojené, vše pod jednou střechou.',
  },
  ecosystemItems: [
    { name: 'swelt.feed', desc: 'Automatický XML/CSV feed 3 000+ produktů. Synchronizujte katalog s vaším e-shopem bez jakékoliv manuální práce.' },
    { name: 'swelt.dropshipping', desc: 'Prodávejte bez skladu. Zákazník objedná u vás — my mu zboží zabalíme a odešleme přímo pod vaším jménem.' },
    { name: 'Privátní nákupy', desc: 'Prémiové produkty pro soukromé osoby a firemní dárky. Diskrétní balení, rychlé EU doručení.' },
    { name: 'swelt.shop', desc: 'Hotový e-shop naplněný 3 000+ produkty. Spuštěný do 48 hodin. S nebo bez vlastního skladu.' },
  ],
  faq: { eyebrow: 'Časté otázky', heading: 'Nejčastější otázky', sub: 'Vše, co potřebujete vědět před registrací.' },
  faqItems: [
    { q: 'Co potřebuji k registraci jako B2B partner?', a: 'Stačí vyplnit základní kontaktní údaje a zadat IČO nebo doložit záměr podnikání. Přijímáme e-shopy, kamenné obchody, tržnice i fyzické osoby se záměrem dalšího prodeje. Registrace je zdarma a trvá 2 minuty.' },
    { q: 'Jak dlouho trvá schválení B2B účtu?', a: 'Standardně do 24 hodin v pracovní dny. Po schválení vám přijde e-mail s přístupovými údaji do velkoobchodního katalogu. Urgentní žádosti vyřizujeme i mimo pracovní dobu — napište nám.' },
    { q: 'Jaké jsou minimální objednávky?', a: 'Žádné. Žádné minimální množství ani minimální hodnota objednávky. Pořídíte si klidně 1 kus. Slevy a individuální podmínky se odvíjejí od celkového měsíčního obratu, ne od jednotlivé objednávky.' },
    { q: 'Jak funguje cenotvorba a jaké slevy mohu získat?', a: 'Základní nákupní ceny jsou 40–65 % pod doporučenou maloobchodní cenou (MOC). Nad rámec těchto cen nabízíme individuální slevy pro partnery s vyšším měsíčním obratem. Podmínky nastavujeme osobně — napište nám nebo zavolejte.' },
    { q: 'Mohu produkty prodávat i v zahraničí?', a: 'Ano. Zasíláme po celé EU. Produkty jsou určeny pro další prodej bez geografického omezení v rámci EU. Pokud plánujete prodej mimo EU, konzultujte podmínky s naším obchodním týmem.' },
    { q: 'Jak mohu propojit katalog se svým e-shopem?', a: 'Doporučujeme službu swelt.feed — automatický produktový feed ve formátu XML, CSV nebo přímo pro Heureka, Google Shopping a další srovnávače. Feed se aktualizuje 1–4× denně bez jakékoliv manuální práce z vaší strany.' },
    { q: 'Mohu kombinovat velkoobchod s dropshippingem?', a: 'Ano, a mnoho našich partnerů to tak dělá. Část sortimentu nakoupíte na sklad (velkoobchod), zbytek prodáváte na objednávku bez skladu (dropshipping). Jde to nastavit paralelně na jednom účtu.' },
  ],
  finalCta: {
    heading: 'Připraveni začít?',
    sub: 'Registrace zdarma. Schválení do 24 hodin. Žádné měsíční poplatky, žádné minimální odběry.',
    ctaRegister: 'Registrovat se zdarma', ctaContact: 'Kontaktovat obchodní tým',
    communityBadge: 'Připojte se ke komunitě 500+ partnerů',
    bottomHeading: 'Začněte vydělávat s prémiemi. Dnes.',
    bottomSub: 'Registrace zdarma. Schválení do 24 hodin. Přístup k 3 000+ produktům s marží 40–65 %.',
    processing: 'Vaše žádost je v procesu schvalování — brzy se ozveme.',
    learnMore: 'Zjistit více',
  },
  authTip: 'Registrujte se zdarma a uvidíte i velkoobchodní nákupní ceny — B2B účet schválíme do 24 hodin.',
  whySwelt: {
    eyebrow: 'Proč Swelt',
    heading: '15 let zkušeností. Přímý vztah s dodavateli.',
    p: 'Nejsme překupník. Jsme přímý distributor světových hodinářských a klenotnických značek pro střední a východní Evropu. Díky přímému partnerství s výrobci nabízíme ceny, na které jiní distributoři nedosáhnou.',
    bullets: ['Přímé partnerství s 70+ světovými značkami', 'Garance originality — 100 % autentické produkty', 'Evropský sklad — expedice do 24–48 hodin', 'Certifikovaný záruční a pozáruční servis', 'GDPR compliance a transparentní obchodní podmínky'],
  },
  whyStats: ['let na trhu', 'aktivních partnerů', 'produktů v katalogu', 'spokojenost partnerů'],
  testimonials: [
    { name: 'Radek H.', role: 'E-shop hodinek, Praha', text: 'Díky Sweltu jsem rozšířil katalog o 800 produktů za víkend. Marže na Tommy Hilfiger jsou výrazně lepší než u předchozího dodavatele a zásoby jsou vždy aktuální.' },
    { name: 'Monika B.', role: 'Zlatnictví, Brno', text: 'Schválení účtu přišlo do 8 hodin. Přístup do katalogu byl okamžitý. Nikdy jsem nezaznamenala nesoulad zásob — to, co katalog říká „skladem", opravdu je skladem.' },
    { name: 'Jan K.', role: 'Distributor, Ostrava', text: 'Zásobuji přes 3 e-shopy a Swelt je za tím vším. Kombinuji velkoobchod s dropshippingem — ideální model, který mi šetří kapitál vázaný ve skladu.' },
  ],
  trustStrip: ['100% autentické produkty', 'FedEx / DHL / UPS expedice', 'Doručení po celé EU', 'Přímý distributor značek', 'Bezpečné B2B platby'],
  contactNote: 'Potřebujete přesnější kalkulaci? Napište nám — obchodní podmínky nastavíme na míru do 24 hodin.',
  ecosystemSell: { eyebrow: 'Kompletní ekosystém', heading: 'Jedna platforma. Čtyři způsoby, jak vydělávat.', sub: 'Velkoobchod je základ. Ale naši nejúspěšnější partneři kombinují více služeb — a tím násobí svůj zisk bez nutnosti více dodavatelů.' },
};

const en: VelkoobchodText = {
  hero: {
    badge: 'B2B Wholesale · Direct supplier access',
    heading: 'Buy premium brands directly from the source.',
    sub: '3,000+ products, 70+ world brands, margins 40–65 %. No middlemen, no extra markups. Free registration — approval within 24 hours.',
    ctaRegister: 'Register for free', ctaLogin: 'Sign in', ctaCatalog: 'Enter the catalog',
    bullets: ['Free registration', 'No minimum order', 'Approval in 24 h', 'VAT ID not required'],
    banner: 'Want to browse the assortment first? Sign up for free with email or Google and instantly see the whole catalog — photos, availability and recommended prices. Wholesale prices unlock once your B2B account is approved.',
  },
  stats: ['products in catalog', 'world brands', 'discount below RRP', 'active partners'],
  preview: {
    eyebrow: 'Browse without commitment',
    heading: 'See the whole catalog today — free, no waiting.',
    p1: 'We know entering a new partnership takes trust. That is why we let you preview the catalog before deciding anything. Just sign in with email or Google — it takes 30 seconds.',
    p2: 'You will see the entire range: 3,000+ products, photos, real-time stock and recommended retail prices (RRP). So you can immediately calculate the margins you can expect.',
    p3: 'Wholesale prices are hidden and unlock automatically after your B2B account is verified — typically within 24 hours. Registration is completely free.',
    cta1: 'Browse the catalog', cta2: 'Register',
  },
  accessTiers: [
    { label: 'Not signed in' },
    { label: 'Signed in (free / Google / email)', badge: 'No waiting' },
    { label: 'Approved B2B partner', badge: 'Full access' },
  ],
  accessItems: ['Browse the assortment', 'Photos and product info', 'Recommended prices (RRP)', 'Stock levels', 'Wholesale prices', 'Order system'],
  forWhom: {
    eyebrow: 'Who we serve',
    heading: 'Wholesale for every stage of your business',
    sub: 'Whether you sell at a market, run an online shop, or supply a network of stores — we have terms that make sense for your volume and ambitions.',
    popular: 'Most popular',
  },
  targets: [
    { title: 'Small retailer', desc: 'A bricks-and-mortar shop, market stall or starting e-shop. You buy 1–30 pieces a month and want premium goods with healthy margins, no complex contracts.', bullets: ['No minimum order', 'Wholesale prices from the first piece', 'Personal sales-team support'] },
    { title: 'Growing e-shop', desc: 'You sell online and want to automate catalog refreshes. Turnover €500–€5,000 a month — and the appetite to grow further.', bullets: ['Automatic sync via swelt.feed', 'Individual discounts based on turnover', 'Priority shipping and dedicated support'] },
    { title: 'Large distributor', desc: 'You supply a network of stores or your turnover exceeds €5,000 per month. You need individual terms, API access and dedicated service.', bullets: ['Individual pricing and SLA', 'Dedicated account manager', 'API access to data and stock'] },
  ],
  onboarding: {
    eyebrow: 'How to start',
    heading: 'From registration to first order in 24 hours',
    sub: 'No paperwork, no waiting weeks. A simple process — just sign up and we handle the rest.',
    ctaStart: 'Start free registration', ctaApproved: 'Enter the catalog', ctaProcessing: 'Application is being processed',
  },
  steps: [
    { title: 'Free registration', desc: 'Fill in basic details — name, email, phone. Registration takes 2 minutes and is completely free.' },
    { title: 'B2B account verification', desc: 'Provide a VAT ID or other proof of business activity. We also accept individuals planning to resell.' },
    { title: 'Approval within 24 hours', desc: 'Our sales team reviews the application and activates full access to the wholesale catalog.' },
    { title: 'Buy and earn', desc: 'Browse 3,000+ products, place an order, and we will handle dispatch within 24–48 hours.' },
  ],
  catalog: {
    eyebrow: 'Catalog',
    heading: 'What you will find in the B2B catalog',
    sub: 'Direct access to 3,000+ premium watches and jewelry. Everything in stock, with current wholesale prices and accurate stock visibility.',
    brandsLabel: '70+ brands available from the first piece', brandsMore: '+50 more →',
  },
  features: [
    { label: '3,000+ products', desc: 'Watches, jewelry, accessories' },
    { label: '70+ world brands', desc: 'Tommy Hilfiger, Versace, Seiko…' },
    { label: '40–65 % below RRP', desc: 'Margins with room for profit' },
    { label: 'Real-time stock', desc: 'Updates every 2 hours' },
    { label: '15+ categories', desc: 'Women, men, unisex, accessories' },
    { label: 'Dispatch in 24–48 h', desc: 'FedEx, DHL, UPS — across the EU' },
    { label: 'Prices excl. VAT', desc: 'Clear calculation for B2B partners' },
    { label: 'New collections every week', desc: 'Direct access ahead of others' },
  ],
  partnership: {
    eyebrow: 'Partnership terms',
    heading: 'Prices that grow with your turnover',
    sub: 'Basic wholesale prices are open to every registered partner. The higher your turnover, the better the terms — without complex contracts from day one.',
    recommended: 'Recommended',
  },
  volumeTiers: [
    { name: 'Registration', volume: 'Any volume', price: 'Free', priceNote: 'no-strings entry', features: ['Access to the B2B catalog', 'Wholesale prices from 1 piece', 'Online ordering system', 'Customer support'], cta: 'Register' },
    { name: 'Partner', volume: '€800+ / month', price: 'Individual discount', priceNote: 'on top of wholesale prices', features: ['Everything from Registration', 'Individual discount based on turnover', 'Priority shipping with no surcharge', 'Early access to launches', 'Dedicated sales rep'], cta: 'See terms' },
    { name: 'Enterprise', volume: '€8,000+ / month', price: 'Bespoke', priceNote: 'individual contract', features: ['Everything from Partner', 'Contractual prices and SLA guarantees', 'API access to data and stock', 'White-label options', 'EU country representation'], cta: 'Contact sales' },
  ],
  ecosystem: {
    eyebrow: 'swelt.partner ecosystem',
    heading: 'Wholesale is only the beginning',
    sub: 'Combine wholesale with other swelt services — feed, dropshipping, private purchases or a turnkey shop. All connected, all under one roof.',
  },
  ecosystemItems: [
    { name: 'swelt.feed', desc: 'Automatic XML/CSV feed of 3,000+ products. Sync your shop with no manual work.' },
    { name: 'swelt.dropshipping', desc: 'Sell without a warehouse. Customer orders from you — we pack and ship under your name.' },
    { name: 'Private purchases', desc: 'Premium products for individuals and corporate gifts. Discreet packaging, fast EU delivery.' },
    { name: 'swelt.shop', desc: 'Turnkey e-shop preloaded with 3,000+ products. Live in 48 hours. With or without your own stock.' },
  ],
  faq: { eyebrow: 'Frequent questions', heading: 'Frequently asked questions', sub: 'Everything you need to know before signing up.' },
  faqItems: [
    { q: 'What do I need to register as a B2B partner?', a: 'Just fill in basic contact details and provide a VAT ID or proof of business intent. We accept e-shops, brick-and-mortar shops, market stalls and individuals planning to resell. Registration is free and takes 2 minutes.' },
    { q: 'How long does B2B account approval take?', a: 'Standard turnaround is 24 hours on business days. After approval you receive an email with access credentials. Urgent requests are handled outside business hours too — just write to us.' },
    { q: 'What are the minimum orders?', a: 'None. No minimum quantity, no minimum order value. You can buy a single piece. Discounts and individual terms depend on monthly turnover, not on a single order.' },
    { q: 'How does pricing work and what discounts can I get?', a: 'Base wholesale prices are 40–65 % below RRP. On top of that we offer individual discounts to partners with higher monthly turnover. Terms are negotiated personally — write or call us.' },
    { q: 'Can I sell the products abroad?', a: 'Yes. We ship across the EU. Products can be resold without geographic restrictions within the EU. For sales outside the EU, please consult our sales team.' },
    { q: 'How can I sync the catalog with my e-shop?', a: 'We recommend swelt.feed — an automatic product feed in XML, CSV or directly for Heureka, Google Shopping and other comparison engines. The feed updates 1–4× per day with no manual work.' },
    { q: 'Can I combine wholesale with dropshipping?', a: 'Yes, and many of our partners do exactly that. Stock part of the assortment (wholesale) and resell the rest on demand without stock (dropshipping). Both can run in parallel on a single account.' },
  ],
  finalCta: {
    heading: 'Ready to start?',
    sub: 'Free registration. Approval within 24 hours. No monthly fees, no minimum orders.',
    ctaRegister: 'Register for free', ctaContact: 'Contact the sales team',
    communityBadge: 'Join the community of 500+ partners',
    bottomHeading: 'Start earning with premium goods. Today.',
    bottomSub: 'Free registration. Approval in 24 hours. Access to 3,000+ products with 40–65 % margins.',
    processing: 'Your application is being processed — we will be in touch soon.',
    learnMore: 'Learn more',
  },
  authTip: 'Register for free and unlock wholesale prices — your B2B account is approved within 24 hours.',
  whySwelt: {
    eyebrow: 'Why Swelt',
    heading: '15 years of experience. Direct supplier relationships.',
    p: 'We are not a reseller. We are the direct distributor of world watch and jewelry brands for Central and Eastern Europe. Thanks to direct partnerships with manufacturers we offer prices other distributors cannot reach.',
    bullets: ['Direct partnership with 70+ world brands', 'Originality guarantee — 100 % authentic products', 'European warehouse — dispatch in 24–48 hours', 'Certified warranty and post-warranty service', 'GDPR compliance and transparent terms'],
  },
  whyStats: ['years on the market', 'active partners', 'products in the catalog', 'partner satisfaction'],
  testimonials: [
    { name: 'Radek H.', role: 'Watch e-shop, Prague', text: 'Thanks to Swelt I expanded my catalog by 800 products over a weekend. Margins on Tommy Hilfiger are dramatically better than my previous supplier and stock is always accurate.' },
    { name: 'Monika B.', role: 'Jewelry shop, Brno', text: 'Account approval came within 8 hours. Catalog access was instant. I have never seen a stock mismatch — what the catalog says "in stock" really is in stock.' },
    { name: 'Jan K.', role: 'Distributor, Ostrava', text: 'I supply 3 e-shops and Swelt is behind all of them. I mix wholesale with dropshipping — the ideal model that frees up capital that would otherwise be tied up in stock.' },
  ],
  trustStrip: ['100% authentic products', 'FedEx / DHL / UPS dispatch', 'EU-wide delivery', 'Direct brand distributor', 'Secure B2B payments'],
  contactNote: 'Need a more precise calculation? Write to us — we set up bespoke terms within 24 hours.',
  ecosystemSell: { eyebrow: 'Complete ecosystem', heading: 'One platform. Four ways to earn.', sub: 'Wholesale is the foundation. But our most successful partners combine several services — multiplying profit without needing more suppliers.' },
};

// Other 16 languages reuse English copy (high-quality fallback).
const sk = en, pl = en, de = en, fr = en, es = en, it = en, nl = en, pt = en;
const hu = en, ro = en, sv = en, da = en, fi = en, no = en, el = en, is = en;

export const velkoobchod: Record<Lang, VelkoobchodText> = {
  cs, sk, pl, de, en, fr, es, it, nl, pt, hu, ro, sv, da, fi, no, el, is,
};
