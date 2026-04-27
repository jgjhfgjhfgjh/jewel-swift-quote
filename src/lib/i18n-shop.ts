/**
 * swelt.shop landing page translations.
 * CS + EN fully translated; other 16 languages reuse EN as fallback.
 */
import type { Lang } from './i18n';

export interface ShopMode { name: string; tagline: string; badge: string; desc: string; pros: string[] }
export interface ShopStep { title: string; desc: string }
export interface ShopFeature { label: string; desc: string }
export interface ShopPlan { name: string; desc: string; features: string[]; cta: string; bespoke: string }
export interface ShopFaq { q: string; a: string }
export interface ShopEcoItem { name: string; desc: string }
export interface ShopTestimonial { name: string; role: string; text: string }

export interface ShopText {
  hero: { badge: string; heading: string; sub: string; ctaPrimary: string; ctaSecondary: string; bullets: string[] };
  preview: { url: string; updated: string; productCount: string; tabWatches: string; tabJewelry: string };
  stats: string[];
  modes: { eyebrow: string; heading: string; sub: string; cta: string };
  modeItems: ShopMode[];
  howItWorks: { eyebrow: string; heading: string; sub: string; cta: string };
  steps: ShopStep[];
  whatYouGet: { eyebrow: string; heading: string; sub: string; platformHeading: string; platformSub: string; platformNotes: string[] };
  features: ShopFeature[];
  pricing: { eyebrow: string; heading: string; sub: string; monthly: string; yearly: string; popular: string; perMonth: string; perYear: string; setupNote: string };
  plans: ShopPlan[];
  trust: { eyebrow: string; heading: string; p: string; bullets: string[] };
  testimonials: ShopTestimonial[];
  ecosystem: { heading: string; sub: string; learnMore: string };
  ecosystemItems: ShopEcoItem[];
  faq: { heading: string; sub: string };
  faqs: ShopFaq[];
  finalCta: { badge: string; heading: string; sub: string; ctaSetup: string; ctaPreview: string; note: string };
  trustStrip: string[];
}

const cs: ShopText = {
  hero: {
    badge: 'swelt.shop · Hotový e-shop do 48 hodin',
    heading: 'Váš e-shop s prémiovým zbožím. Hotový. Naplněný. Spuštěný.',
    sub: 'Zapomeňte na měsíce vývoje a hledání dodavatelů. Dostanete kompletní e-shop naplněný 3 000+ prémiovými produkty — připravený k prodeji do 48 hodin.',
    ctaPrimary: 'Chci svůj e-shop', ctaSecondary: 'Prohlédnout ukázku',
    bullets: ['Spuštění do 48 hodin', 'Žádné zkušenosti s e-commerce', '3 000+ produktů hned', 'Bez závazků'],
  },
  preview: { url: 'vaseshop.cz', updated: 'Zboží aktualizováno před 2 hod.', productCount: '3 000+ produktů', tabWatches: 'Hodinky', tabJewelry: 'Šperky' },
  stats: ['od objednávky ke spuštění', 'produktů v katalogu', 'prémiových značek', 'průměrná marže pod MOC'],
  modes: { eyebrow: 'Dvě cesty', heading: 'Vyberte si model, který vám sedí', sub: 'Hotový e-shop dostanete v obou případech. Rozdíl je v tom, jak řešíte zásoby a expedici.', cta: 'Zjistit více' },
  modeItems: [
    {
      name: 'swelt.shop + Dropshipping', tagline: 'Prodáváte. My skladujeme a posíláme.', badge: 'Doporučeno',
      desc: 'Hotový e-shop + dropshipping integrace. Zákazník objedná u vás, my mu zboží zabalíme a odešleme přímo pod vaším jménem. Nulový sklad, nulová logistika.',
      pros: ['Žádný sklad — žádné vázané náklady', 'Automatická expedice pod vaší značkou', 'Okamžitě 3 000+ produktů online', 'Vy se staráte jen o marketing a zákazníky'],
    },
    {
      name: 'swelt.shop + Feed', tagline: 'Hotový e-shop. Zboží si naskladníte sami.', badge: 'Plná kontrola',
      desc: 'Hotový e-shop napojený na swelt.feed — produkty, ceny a zásoby se synchronizují automaticky. Zboží si nakupujete sami a sami expedujete.',
      pros: ['Vyšší marže — nakupujete za velkoobchodní ceny', 'Plná kontrola nad zásobami a dodacími lhůtami', 'Automatická synchronizace katalogu přes feed', 'Nižší měsíční náklady na službu'],
    },
  ],
  howItWorks: { eyebrow: 'Jak to funguje', heading: 'Od objednávky k prvnímu prodeji za 48 hodin', sub: 'Celý setup řešíme my. Vy pouze schvalujete a pak prodáváte.', cta: 'Chci zahájit setup' },
  steps: [
    { title: 'Vyberete platformu', desc: 'Shoptet, WooCommerce, Upgates nebo vlastní řešení. Nastavíme e-shop přesně pro vaši potřebu.' },
    { title: 'Naplníme katalog', desc: 'Importujeme 3 000+ produktů se správnými popisky, fotkami, cenami a kategoriemi. Vy nenastavujete nic.' },
    { title: 'Propojíme feed', desc: 'Zásoby a ceny se aktualizují automaticky 1–4× denně. Nikdy nezobrazíte nedostupné zboží.' },
    { title: 'Spouštíte a prodáváte', desc: 'Do 48 hodin máte live e-shop. Vy se věnujete marketingu, my se staráme o zbytek.' },
  ],
  whatYouGet: {
    eyebrow: 'Co dostanete', heading: 'Vše, co potřebujete k úspěšnému prodeji',
    sub: 'Žádné skryté náklady. Žádné doplňky navíc. Dostanete kompletní řešení připravené k prodeji.',
    platformHeading: 'Funguje na platformě, kterou preferujete',
    platformSub: 'Nastavíme e-shop na vaší oblíbené platformě nebo doporučíme tu nejlepší pro váš případ.',
    platformNotes: [
      '✅ Shoptet — naše primární platforma. Nejrychlejší setup, nejlepší podpora, doporučujeme pro první e-shop.',
      '✅ WooCommerce — ideální pokud potřebujete maximum flexibility a vlastních úprav. Běží na WordPressu.',
      '✅ Upgates — česká platforma s výbornou podporou a snadnou správou produktů. Vhodná pro středně velké e-shopy.',
      '✅ Vlastní řešení — máte vývojáře nebo specifické požadavky? Napojíme feed na libovolné řešení přes API.',
    ],
  },
  features: [
    { label: 'Profesionální design', desc: 'Responzivní šablona optimalizovaná pro konverze' },
    { label: '3 000+ produktů', desc: 'Hodinky, šperky a příslušenství 70+ značek' },
    { label: 'Auto-sync katalogu', desc: 'Zásoby a ceny aktuální každé 2–6 hodin' },
    { label: 'SEO připravený', desc: 'Správná struktura, meta tagy, sitemap' },
    { label: 'Mobilní verze', desc: '60 %+ zákazníků nakupuje z mobilu' },
    { label: 'Analytika', desc: 'Google Analytics + Search Console nastaveny' },
    { label: 'SSL + GDPR', desc: 'Zabezpečení a právní náležitosti v pořádku' },
    { label: 'Napojení na srovnávače', desc: 'Heureka, Zbozi.cz, Google Shopping ready' },
  ],
  pricing: {
    eyebrow: 'Ceník', heading: 'Vyberte plán pro váš e-shop',
    sub: 'Měsíční platba bez závazků. Roční platba ušetří 20 %.',
    monthly: 'Měsíčně', yearly: 'Ročně', popular: 'Nejoblíbenější',
    perMonth: '/měsíc', perYear: 'Kč ročně',
    setupNote: 'Jednorázový setup fee dle náročnosti konfigurace. Napište nám pro přesnou kalkulaci.',
  },
  plans: [
    {
      name: 'Starter', desc: 'Rychlý start pro první e-shop',
      features: ['E-shop setup na Shoptet / WooCommerce', 'Import až 500 produktů', 'swelt.feed (1× denní sync)', 'Responzivní šablona', 'Základní SEO nastavení', 'Onboarding a podpora'],
      cta: 'Začít na Starter', bespoke: 'Na míru',
    },
    {
      name: 'Business', desc: 'Kompletní řešení s dropshippingem',
      features: ['E-shop setup (libovolná platforma)', 'Plný katalog 3 000+ produktů', 'swelt.feed (4× denní sync)', 'swelt.dropshipping integrace', 'Premium design s brandingem', 'SEO + Heureka/Zbozi napojení', 'Prioritní podpora'],
      cta: 'Začít na Business', bespoke: 'Na míru',
    },
    {
      name: 'Enterprise', desc: 'Vlastní řešení na míru',
      features: ['Vše z Business plánu', 'Vlastní e-shop na míru', 'API integrace a automatizace', 'White-label možnosti', 'Dedikovaný projektový manažer', 'SLA garance dostupnosti'],
      cta: 'Kontaktovat obchod', bespoke: 'Na míru',
    },
  ],
  trust: {
    eyebrow: 'Proč swelt.shop',
    heading: 'Nestavíte e-shop od nuly. Stavíte na 15 letech zkušeností.',
    p: 'Za swelt.shop stojí tým, který vybudoval B2B distribuci pro 500+ partnerů. Víme, které produkty se prodávají, jak nastavit ceny a jak vyhnout se chybám, které stojí začínající e-shopy měsíce a tisíce korun.',
    bullets: ['Produkty s prokázanou poptávkou — nenakoupíte ležáky', 'Ceny nastavené pro zdravou marži 30–50 %', 'Automatická aktualizace — žádné ruční práce', 'Podpora při prvních objednávkách a reklamacích', 'Zkušenosti z 500+ spuštěných partnerských e-shopů'],
  },
  testimonials: [
    { name: 'Jakub M.', role: 'swelt.shop Business, Praha', text: 'Za 36 hodin jsem měl hotový e-shop s 800 produkty. Měsíc poté jsem měl první objednávky. Bez swelt.shop by mi trvalo minimálně 3 měsíce a stálo 5× víc.' },
    { name: 'Tereza H.', role: 'swelt.shop Starter, Brno', text: 'Myslela jsem, že e-commerce je složitá. swelt.shop mi ukázal, že to být nemusí. Vše bylo nastavené přesně jak potřebuji, stačilo jen začít prodávat.' },
    { name: 'Pavel K.', role: 'swelt.shop + Dropshipping, Ostrava', text: 'Kombinace hotového e-shopu a dropshippingu je pro mě ideální. Žádný sklad, žádná logistika — jen marketing a zákazníci.' },
  ],
  ecosystem: {
    heading: 'Kompletní ekosystém pro váš byznys',
    sub: 'swelt.shop je součástí širší sady nástrojů. Kombinujte je podle potřeby.',
    learnMore: 'Zjistit více',
  },
  ecosystemItems: [
    { name: 'B2B Velkoobchod', desc: 'Nakupujte produkty za velkoobchodní ceny přímo od dodavatele.' },
    { name: 'swelt.feed', desc: 'Automatický feed pro synchronizaci katalogu s vaším existujícím e-shopem.' },
    { name: 'swelt.dropshipping', desc: 'Prodávejte bez skladu. My skladujeme, balíme a expedujeme za vás.' },
    { name: 'Privátní nákupy', desc: 'Prémiové produkty pro soukromé osoby a firemní dárky.' },
  ],
  faq: { heading: 'Nejčastější otázky', sub: 'Vše, co potřebujete vědět před spuštěním.' },
  faqs: [
    { q: 'Co přesně dostanu v rámci swelt.shop?', a: 'Dostanete kompletně nastavenou e-commerce platformu (Shoptet, WooCommerce nebo jinou), naplněnou 3 000+ prémiových produktů s popisky, fotkami a kategoriemi. Katalog je automaticky propojený s naším feedem — ceny a zásoby se aktualizují samy. V Business plánu je součástí i dropshipping integrace, takže nemusíte vůbec nakupovat ani expedovat zboží.' },
    { q: 'Jak rychle budu mít e-shop spuštěný?', a: 'Standardně do 48 hodin od podpisu smlouvy. Při složitější konfiguraci nebo vlastním designu je to 3–5 pracovních dní. V každém případě dostanete přesný harmonogram hned na začátku.' },
    { q: 'Jaký je rozdíl mezi swelt.shop + Feed a swelt.shop + Dropshipping?', a: 'S Feed variantou dostanete e-shop napojený na katalog, ale zboží si musíte nakoupit sami a sami ho expedovat zákazníkům. S Dropshipping variantou nemusíte nic nakupovat ani skladovat — zákazník objedná u vás a my mu zboží zabalíme a odešleme přímo. Dropshipping varianta je výhodná pro ty, kdo chtějí minimální počáteční náklady.' },
    { q: 'Musím mít zkušenosti s e-commerce?', a: 'Vůbec ne. Celé nastavení řešíme my. Dostanete funkční e-shop s produkty, se kterým se naučíte pracovat za pár hodin. Součástí každého plánu je onboarding — provede vás vším, co potřebujete znát.' },
    { q: 'Mohu mít vlastní doménu a branding?', a: 'Ano, samozřejmě. E-shop spustíme na vaší doméně s vaším logem a barvami. V Business plánu je součástí i přizpůsobení designu podle vaší identity.' },
    { q: 'Co když budu chtít e-shop zrušit nebo přejít k jinému dodavateli?', a: 'Žádné lock-in závazky. Smlouvy jsou vždy na dobu určitou (3 nebo 12 měsíců). Po skončení přejdete na svůj plán nebo odejdete — e-shop a data zůstávají vaše.' },
    { q: 'Mohu přidat vlastní produkty mimo katalog swelt?', a: 'Ano. swelt.shop je plnohodnotný e-shop — přidáte do něj cokoliv. Katalog swelt je předvyplněný základ, ale nikdo vám nebrání přidat vlastní produkty nebo jiné dodavatele.' },
  ],
  finalCta: {
    badge: 'swelt.shop · Spuštění do 48 hodin',
    heading: 'Váš prémiový e-shop čeká. Stačí říct jo.',
    sub: 'Kompletní e-shop, naplněný produkty, připravený k prodeji. Do 48 hodin od vaší odpovědi.',
    ctaSetup: 'Zahájit setup', ctaPreview: 'Prohlédnout ukázku',
    note: 'Bezplatná konzultace · Bez závazků · Odpovídáme do 24 hodin',
  },
  trustStrip: ['Spuštění do 48 hodin', 'Automatická synchronizace', 'Shoptet / WooCommerce / Upgates', 'SSL + GDPR v pořádku', 'Dropshipping dostupný'],
};

const en: ShopText = {
  hero: {
    badge: 'swelt.shop · Turnkey shop in 48 hours',
    heading: 'Your e-shop with premium goods. Ready. Loaded. Live.',
    sub: 'Skip months of development and supplier hunting. Get a complete shop preloaded with 3,000+ premium products — ready to sell within 48 hours.',
    ctaPrimary: 'I want my shop', ctaSecondary: 'Browse the demo',
    bullets: ['Live within 48 hours', 'No e-commerce experience needed', '3,000+ products at launch', 'No commitment'],
  },
  preview: { url: 'yourshop.com', updated: 'Catalog updated 2 hours ago', productCount: '3,000+ products', tabWatches: 'Watches', tabJewelry: 'Jewelry' },
  stats: ['from order to launch', 'products in the catalog', 'premium brands', 'average margin below RRP'],
  modes: { eyebrow: 'Two paths', heading: 'Pick the model that fits you', sub: 'You get a turnkey shop in both cases. The difference is how you handle stock and dispatch.', cta: 'Learn more' },
  modeItems: [
    {
      name: 'swelt.shop + Dropshipping', tagline: 'You sell. We store and ship.', badge: 'Recommended',
      desc: 'Turnkey shop + dropshipping integration. Customer orders from you, we pack and ship under your name. No stock, no logistics.',
      pros: ['No stock — no tied-up costs', 'Automatic dispatch under your brand', '3,000+ products online instantly', 'You only handle marketing and customers'],
    },
    {
      name: 'swelt.shop + Feed', tagline: 'Turnkey shop. You handle stock yourself.', badge: 'Full control',
      desc: 'Turnkey shop connected to swelt.feed — products, prices and stock sync automatically. You buy and dispatch yourself.',
      pros: ['Higher margin — buy at wholesale prices', 'Full control of stock and lead times', 'Automatic catalog sync via feed', 'Lower monthly service fees'],
    },
  ],
  howItWorks: { eyebrow: 'How it works', heading: 'From order to first sale in 48 hours', sub: 'We handle the whole setup. You just approve and start selling.', cta: 'Start setup' },
  steps: [
    { title: 'Pick a platform', desc: 'Shoptet, WooCommerce, Upgates or custom. We set up the shop tailored to your needs.' },
    { title: 'Load the catalog', desc: 'We import 3,000+ products with proper descriptions, photos, prices and categories. You configure nothing.' },
    { title: 'Connect the feed', desc: 'Stock and prices update automatically 1–4× per day. You never display unavailable goods.' },
    { title: 'Launch and sell', desc: 'You have a live shop within 48 hours. You focus on marketing — we handle the rest.' },
  ],
  whatYouGet: {
    eyebrow: 'What you get', heading: 'Everything you need to sell successfully',
    sub: 'No hidden costs. No add-ons. You get a complete solution ready to sell.',
    platformHeading: 'Runs on the platform you prefer',
    platformSub: 'We set up the shop on your favorite platform or recommend the best one for your case.',
    platformNotes: [
      '✅ Shoptet — our primary platform. Fastest setup, best support, recommended for the first shop.',
      '✅ WooCommerce — ideal if you need maximum flexibility and custom tweaks. Runs on WordPress.',
      '✅ Upgates — Czech platform with excellent support and easy product management. Suited for mid-size shops.',
      '✅ Custom solution — got a developer or specific requirements? We connect the feed to any solution via API.',
    ],
  },
  features: [
    { label: 'Professional design', desc: 'Responsive template optimized for conversions' },
    { label: '3,000+ products', desc: 'Watches, jewelry and accessories from 70+ brands' },
    { label: 'Auto-sync catalog', desc: 'Stock and prices fresh every 2–6 hours' },
    { label: 'SEO ready', desc: 'Proper structure, meta tags, sitemap' },
    { label: 'Mobile version', desc: '60 %+ of customers shop on mobile' },
    { label: 'Analytics', desc: 'Google Analytics + Search Console set up' },
    { label: 'SSL + GDPR', desc: 'Security and legal essentials in order' },
    { label: 'Comparison engines', desc: 'Heureka, Zbozi.cz, Google Shopping ready' },
  ],
  pricing: {
    eyebrow: 'Pricing', heading: 'Pick a plan for your shop',
    sub: 'Monthly billing with no commitment. Annual saves 20 %.',
    monthly: 'Monthly', yearly: 'Yearly', popular: 'Most popular',
    perMonth: '/month', perYear: 'per year',
    setupNote: 'One-off setup fee depending on configuration complexity. Write to us for an exact quote.',
  },
  plans: [
    { name: 'Starter', desc: 'Quick start for the first shop', features: ['Shop setup on Shoptet / WooCommerce', 'Up to 500 products imported', 'swelt.feed (daily sync)', 'Responsive template', 'Basic SEO setup', 'Onboarding and support'], cta: 'Start with Starter', bespoke: 'Bespoke' },
    { name: 'Business', desc: 'Complete solution with dropshipping', features: ['Shop setup (any platform)', 'Full catalog 3,000+ products', 'swelt.feed (4× daily sync)', 'swelt.dropshipping integration', 'Premium design with branding', 'SEO + Heureka/Zbozi integration', 'Priority support'], cta: 'Start with Business', bespoke: 'Bespoke' },
    { name: 'Enterprise', desc: 'Bespoke solution', features: ['Everything from Business', 'Custom shop tailored to you', 'API integration and automation', 'White-label options', 'Dedicated project manager', 'SLA uptime guarantee'], cta: 'Contact sales', bespoke: 'Bespoke' },
  ],
  trust: {
    eyebrow: 'Why swelt.shop',
    heading: "You're not building from scratch. You're building on 15 years of experience.",
    p: 'Behind swelt.shop is a team that built B2B distribution for 500+ partners. We know which products sell, how to set prices and how to avoid the mistakes that cost new shops months and thousands.',
    bullets: ['Products with proven demand — no slow movers', 'Prices set for healthy 30–50 % margin', 'Automatic updates — no manual work', 'Support during your first orders and returns', 'Experience from 500+ launched partner shops'],
  },
  testimonials: [
    { name: 'Jakub M.', role: 'swelt.shop Business, Prague', text: 'In 36 hours I had a finished shop with 800 products. A month later I had my first orders. Without swelt.shop it would have taken me 3+ months and cost 5× more.' },
    { name: 'Teresa H.', role: 'swelt.shop Starter, Brno', text: 'I thought e-commerce was complex. swelt.shop showed me it does not have to be. Everything was set up exactly how I needed — I just had to start selling.' },
    { name: 'Paul K.', role: 'swelt.shop + Dropshipping, Ostrava', text: 'Combining a turnkey shop with dropshipping is ideal for me. No stock, no logistics — just marketing and customers.' },
  ],
  ecosystem: { heading: 'Complete ecosystem for your business', sub: 'swelt.shop is part of a broader toolkit. Combine as you need.', learnMore: 'Learn more' },
  ecosystemItems: [
    { name: 'B2B Wholesale', desc: 'Buy products at wholesale prices direct from the supplier.' },
    { name: 'swelt.feed', desc: 'Automatic feed to sync the catalog with your existing shop.' },
    { name: 'swelt.dropshipping', desc: 'Sell without stock. We store, pack and ship for you.' },
    { name: 'Private purchases', desc: 'Premium products for individuals and corporate gifts.' },
  ],
  faq: { heading: 'Frequently asked questions', sub: 'Everything you need to know before launch.' },
  faqs: [
    { q: 'What exactly do I get with swelt.shop?', a: 'You get a fully set up e-commerce platform (Shoptet, WooCommerce or other), preloaded with 3,000+ premium products with descriptions, photos and categories. The catalog is automatically connected to our feed — prices and stock update themselves. The Business plan also includes dropshipping integration, so you do not need to buy or ship any goods.' },
    { q: 'How fast will my shop be live?', a: 'Standard turnaround is 48 hours from contract signing. Complex configurations or custom designs take 3–5 business days. In any case you receive a precise schedule from the start.' },
    { q: 'What is the difference between swelt.shop + Feed and swelt.shop + Dropshipping?', a: 'With Feed you get a shop connected to the catalog, but you have to buy and ship goods yourself. With Dropshipping you do not buy or store anything — the customer orders from you and we pack and ship directly. Dropshipping is great for those who want minimal upfront cost.' },
    { q: 'Do I need e-commerce experience?', a: 'Not at all. We handle the whole setup. You get a working shop with products and learn to operate it within hours. Onboarding is included in every plan — it walks you through everything.' },
    { q: 'Can I have my own domain and branding?', a: 'Yes, of course. We launch the shop on your domain with your logo and colors. The Business plan also includes design tailored to your identity.' },
    { q: 'What if I want to cancel or move to another supplier?', a: 'No lock-in. Contracts are always for a fixed term (3 or 12 months). After the term you stay on your plan or leave — the shop and data stay yours.' },
    { q: 'Can I add products outside the swelt catalog?', a: 'Yes. swelt.shop is a full e-shop — add anything you want. The swelt catalog is a preloaded base, but nothing stops you from adding your own products or other suppliers.' },
  ],
  finalCta: {
    badge: 'swelt.shop · Live in 48 hours',
    heading: 'Your premium shop is waiting. Just say yes.',
    sub: 'Complete shop, preloaded with products, ready to sell. Within 48 hours of your reply.',
    ctaSetup: 'Start setup', ctaPreview: 'Browse the demo',
    note: 'Free consultation · No commitment · We reply within 24 hours',
  },
  trustStrip: ['Live in 48 hours', 'Automatic synchronization', 'Shoptet / WooCommerce / Upgates', 'SSL + GDPR in order', 'Dropshipping available'],
};

const sk = en, pl = en, de = en, fr = en, es = en, it = en, nl = en, pt = en;
const hu = en, ro = en, sv = en, da = en, fi = en, no = en, el = en, is = en;

export const shop: Record<Lang, ShopText> = {
  cs, sk, pl, de, en, fr, es, it, nl, pt, hu, ro, sv, da, fi, no, el, is,
};
