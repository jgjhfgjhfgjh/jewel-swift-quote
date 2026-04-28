/**
 * swelt.feed landing page translations.
 * Focus: hero, stats, "how it works", pricing, FAQ, final CTA, trust strip.
 * Feed Builder simulator + platforms grid + features grid + catalog + cross-sell
 * keep their CS demo content (lots of code samples and technical detail).
 *
 * CS + EN fully translated; other 16 languages reuse EN as fallback.
 */
import type { Lang } from './i18n';

export interface FeedPlan { name: string; subtitle: string; quarterly: number; yearly: number; badge: string | null; cta: string; features: string[]; missing: string[] }
export interface FeedFaq { q: string; a: string }
export interface FeedHowStep { title: string; desc: string }
export interface FeedDropshipBlock { icon: 'cart' | 'zap' | 'trend'; title: string; desc: string }

export interface FeedText {
  hero: { badge: string; h1Part1: string; h1Highlight: string; sub1Pre: string; sub1Mid: string; sub1Post: string; sub2Pre: string; sub2Mid: string; sub2Post: string; ctaPrimary: string; ctaSecondary: string; bullets: string[] };
  stats: string[];
  howItWorks: { eyebrow: string; heading: string; sub: string; steps: FeedHowStep[]; upsellTitle: string; upsellSubPre: string; upsellSubMid: string; upsellSubPost: string; upsellCta: string };
  builder: { eyebrow: string; heading: string; sub: string };
  platforms: { eyebrow: string; heading: string; sub: string };
  catalog: { eyebrow: string; heading: string; pre: string; midBold: string; post: string; bullets: string[]; tipPre: string; tipLink: string; tipPost: string };
  features: { eyebrow: string; heading: string; sub: string };
  dropshipCross: { eyebrow: string; heading: string; sub: string; blocks: FeedDropshipBlock[]; cta: string };
  pricing: { eyebrow: string; heading: string; sub: string; quarterly: string; yearly: string; perMonth: string; bespoke: string; saveYearly: string; bottomCardPre: string; bottomCardMid: string; bottomCardPost: string; bottomCardLink: string; smallNote: string };
  plans: FeedPlan[];
  faq: { eyebrow: string; heading: string; sub: string };
  faqs: FeedFaq[];
  finalCta: { badge: string; heading1: string; heading2: string; sub1: string; sub2Pre: string; sub2Mid: string; sub2Post: string; ctaPrimary: string; ctaSecondary: string };
  trustStrip: string[];
}

const cs: FeedText = {
  hero: {
    badge: 'swelt.feed — prémiové produkty pro váš e-shop',
    h1Part1: 'Máte e-shop a chcete přidat',
    h1Highlight: 'prémiové produkty bez starostí?',
    sub1Pre: 'Pořiďte si ', sub1Mid: 'swelt.feed', sub1Post: ' a my vám propojíme e-shop s naším katalogem 3 000+ prémiových hodinek a doplňků — žádné technické znalosti nejsou potřeba.',
    sub2Pre: 'Nebo jděte ještě dál: se ', sub2Mid: 'swelt.dropshipping', sub2Post: ' zboží vůbec nemusíte kupovat ani skladovat — my ho rovnou odešleme vašim zákazníkům.',
    ctaPrimary: 'Začít s feedem zdarma', ctaSecondary: 'Vyzkoušet na nečisto',
    bullets: ['3 000+ produktů', '7 formátů exportu', 'Aktualizace každé 2 hodiny', 'Bez technických znalostí'],
  },
  stats: ['produktů v katalogu', 'formátů exportu', 'do spuštění feedu', 'let ZAGO na trhu'],
  howItWorks: {
    eyebrow: 'Jak to funguje', heading: 'Jak swelt.feed funguje pro váš e-shop',
    sub: 'Tři jednoduché kroky. Žádný kód. Žádné technické znalosti.',
    steps: [
      { title: 'Zaregistrujete se', desc: 'Vyberete plán, vyplníte e-mail a hotovo. Do 48 hodin máte feed připravený. Pomůžeme vám s nastavením zdarma — stačí napsat.' },
      { title: 'Propojíte e-shop', desc: 'Dostanete odkaz na feed (URL). Vložíte ho do nastavení vašeho e-shopu nebo srovnávače — stejně jako byste nastavovali fakturaci. Pro Shoptet, WooCommerce a Upgates máme přímé integrace.' },
      { title: 'Vše běží samo', desc: 'E-shop automaticky stahuje aktuální ceny a dostupnost. Vy jen prodáváte. My se staráme o to, aby data byla vždy správně.' },
    ],
    upsellTitle: 'Nechcete vůbec řešit sklad ani nákup?',
    upsellSubPre: 'Se ', upsellSubMid: 'swelt.dropshipping', upsellSubPost: ' zákazník objedná u vás, my zboží zabalíme a odešleme přímo jemu — pod vaším jménem. Vy nic neskladujete, nic nenakupujete, jen fakturujete.',
    upsellCta: 'Zjistit více',
  },
  builder: { eyebrow: 'Vyzkoušejte si to', heading: 'Sestavte si feed přesně pro svůj e-shop', sub: 'Zvolte kam chcete posílat data, které kategorie a kolik produktů. Vpravo vidíte živý náhled toho, co váš e-shop nebo srovnávač dostane.' },
  platforms: { eyebrow: 'Integrace', heading: 'Funguje s tím, co už máte', sub: 'Shoptet, WooCommerce, Heureka, Google Shopping — swelt.feed se napojí na vše bez kódu a bez IT oddělení.' },
  catalog: {
    eyebrow: 'Co dostanete v katalogu', heading: '3 000+ produktů připravených k prodeji',
    pre: 'Katalog zahrnuje ', midBold: 'prémiové hodinky, šperky a doplňky', post: ' od světových značek jako Tommy Hilfiger, Festina, Swarovski a dalších. Každý produkt má kompletní data:',
    bullets: ['Název, značka, SKU a EAN čárový kód', 'Prodejní cena a doporučená maloobchodní cena', 'Aktuální dostupnost a počet kusů na skladě', 'Fotografie ve vysokém rozlišení (300–800 px)', 'Popis produktu, kategorie a podkategorie', 'Atributy (pohlaví, voděodolnost, materiál...)'],
    tipPre: 'Tip: Chcete katalog bez starostí o sklad? Přejděte na ', tipLink: 'swelt.dropshipping', tipPost: ' — zákazník objedná, my odešleme, vy jen inkasujete.',
  },
  features: { eyebrow: 'Co vše dostanete', heading: 'Vše, co váš e-shop potřebuje', sub: 'swelt.feed není jen XML soubor. Je to živé datové propojení, které pracuje za vás 24 hodin denně.' },
  dropshipCross: {
    eyebrow: 'Chcete jít ještě dál?', heading: 'swelt.dropshipping: žádný sklad, žádná logistika',
    sub: 'S feedem stále musíte zboží nakoupit a skladovat. Se swelt.dropshipping to odpadá úplně. Zákazník objedná → vy přepošlete objednávku → my zboží zabalíme a odešleme přímo zákazníkovi pod vaším jménem.',
    blocks: [
      { icon: 'cart',  title: 'Zákazník objedná u vás', desc: 'Zákazník nakoupí na vašem e-shopu jako obvykle — netuší, že zásilku připravujeme my.' },
      { icon: 'zap',   title: 'My vyřídíme vše ostatní', desc: 'Zboží zabalíme, přiložíme dokumenty a odešleme kurýrem (FedEx, DHL, UPS) přímo zákazníkovi.' },
      { icon: 'trend', title: 'Vy jen fakturujete', desc: 'Dostanete jeden souhrnný B2B doklad místo desítek faktur. Žádné zásoby, žádný sklad, čistý zisk.' },
    ],
    cta: 'Zjistit víc o swelt.dropshipping',
  },
  pricing: {
    eyebrow: 'Ceník', heading: 'Jasné ceny. Žádné překvapení.',
    sub: 'Platíte jen za feed. Žádná provize z prodeje, žádná smlouva. Zrušit můžete kdykoliv.',
    quarterly: 'Čtvrtletně', yearly: 'Ročně', perMonth: 'Kč / měs', bespoke: 'Individuální cena', saveYearly: 'Ušetříte',
    bottomCardPre: 'Chcete jít ještě dál bez skladu?', bottomCardMid: ' swelt.dropshipping funguje bez měsíčního paušálu za feed — platíte jen za to, co skutečně prodáte. ', bottomCardPost: '',
    bottomCardLink: 'Zjistit víc →',
    smallNote: 'Všechny ceny jsou bez DPH. První měsíc zdarma — žádná karta potřeba.',
  },
  plans: [
    {
      name: 'Starter', subtitle: 'Ideální pro první kroky — vyzkoušejte bez závazku',
      quarterly: 490, yearly: 392, badge: null, cta: 'Začít zdarma →',
      features: ['1 feed (XML nebo CSV)', 'Až 500 produktů', 'Aktualizace 1× denně', 'Shoptet, WooCommerce, Upgates', 'E-mailová podpora', 'Onboarding krok za krokem'],
      missing: ['Heureka / Zbozi / Google / Facebook', 'Více feedů najednou', 'API přístup'],
    },
    {
      name: 'Pro', subtitle: 'Pro e-shopy, které to myslí vážně',
      quarterly: 990, yearly: 792, badge: 'Nejoblíbenější', cta: 'Aktivovat Pro →',
      features: ['3 feedů najednou', 'Celý katalog — 3 000+ produktů', 'Aktualizace 4× denně (každých 6 h)', 'XML + CSV + Heureka + Zbozi', 'Google Shopping + Facebook Catalog', 'Chat podpora', 'swelt.signal Lite (přehled trendů)'],
      missing: [],
    },
    {
      name: 'Enterprise', subtitle: 'Pro velké e-shopy a profesionální týmy',
      quarterly: 0, yearly: 0, badge: 'Na míru', cta: 'Získat nabídku',
      features: ['Neomezený počet feedů', 'Real-time aktualizace (< 2 h)', 'Plný API přístup (JSON)', 'Vlastní atributy a mapování polí', 'SLA garance 99,9 % dostupnosti', 'Dedikovaný account manager', 'Prioritní podpora 4h SLA'],
      missing: [],
    },
  ],
  faq: { eyebrow: 'Časté dotazy', heading: 'Máte otázky? Tady jsou odpovědi.', sub: 'Pokud tu odpověď nenajdete, napište nám — odpovíme do hodiny.' },
  faqs: [
    { q: 'Co je swelt.feed a jak mi pomůže?', a: 'swelt.feed je služba, která automaticky přenese náš katalog 3 000+ prémiových hodinek a šperků do vašeho e-shopu. Stačí si vybrat plán, my vám připravíme soubor (feed) s produkty, cenami a dostupností — a váš e-shop ho jednou denně nebo čtyřikrát denně automaticky načte. Žádné ruční kopírování, žádné zastaralé ceny.' },
    { q: 'Musím umět programovat, abych mohl swelt.feed použít?', a: 'Vůbec ne. Pro Shoptet, WooCommerce a Upgates máme připravené přímé integrace — nastavíte je za 10–20 minut bez jediného řádku kódu. Pro ostatní platformy vám pošleme odkaz na feed, který jednoduše vložíte do nastavení vašeho e-shopu. Pokud si nevíte rady, pomůžeme vám zdarma.' },
    { q: 'Jaký je rozdíl mezi swelt.feed a swelt.dropshipping?', a: 'swelt.feed = přenesete náš katalog do svého e-shopu a produkty si musíte nakoupit (nebo mít skladem). swelt.dropshipping = vůbec nic neskladujete. Zákazník u vás objedná, my mu zboží zabalíme a odešleme přímo jeho jménem — vy jen fakturujete. swelt.dropshipping je o krok dál: nulový sklad, nulová logistika.' },
    { q: 'Jak rychle uvidím produkty ve svém e-shopu?', a: 'Typicky do 48 hodin od registrace. Přímé integrace pro Shoptet a WooCommerce trvají méně než 20 minut. Technická podpora vám s nastavením pomůže zdarma — stačí napsat.' },
    { q: 'Jak fungují aktualizace cen a dostupnosti?', a: 'Katalog aktualizujeme každé 2 hodiny na naší straně. Váš e-shop pak feed načítá: plán Starter 1× denně, plán Pro 4× denně (každých 6 hodin). Pokud se produkt vyprodá, feed ho automaticky označí jako nedostupný — váš zákazník nikdy neobjedná něco, co nemáme.' },
    { q: 'Mohu si vybrat jen část katalogu — třeba jen hodinky?', a: 'Ano. Ve Feed Builderu si zvolíte kategorie (Hodinky, Šperky, Doplňky), konkrétní značky i maximální počet produktů. Chcete jen Tommy Hilfiger a Festina? Žádný problém. Změny se projeví při dalším načtení feedu.' },
    { q: 'Co se stane, když zákazník chce zboží vrátit?', a: 'Při modelu swelt.feed (kde vy sami máte zboží) řešíte vrácení standardně jako každý e-shop — zákazník vrátí zboží vám. U swelt.dropshipping platí B2B pravidla: zákazník vrací zboží vám (ne přímo nám), vy pak situaci řešíte s naším týmem. Před odesláním každé objednávky naše logistika provede vizuální kontrolu kvality.' },
  ],
  finalCta: {
    badge: '15+ let ZAGO na trhu · autorizovaný distributor',
    heading1: 'Přidejte prémiové produkty', heading2: 'do svého e-shopu ještě dnes.',
    sub1: 'První feed připravíme zdarma. Žádná karta, žádný závazek. Spuštění do 48 hodin.',
    sub2Pre: 'Nebo rovnou vyzkoušejte ', sub2Mid: 'swelt.dropshipping', sub2Post: ' — bez skladu, bez nákupu, bez logistiky.',
    ctaPrimary: 'Spustit swelt.feed', ctaSecondary: 'Zkusit dropshipping',
  },
  trustStrip: ['15+ let ZAGO na trhu', 'Autorizovaný distributor', 'GDPR', 'Šifrované připojení', 'FedEx · DHL · UPS logistika'],
};

const en: FeedText = {
  hero: {
    badge: 'swelt.feed — premium products for your shop',
    h1Part1: 'Got an e-shop and want to add',
    h1Highlight: 'premium products with no hassle?',
    sub1Pre: 'Get ', sub1Mid: 'swelt.feed', sub1Post: ' and we will connect your shop to our catalog of 3,000+ premium watches and accessories — no technical skills needed.',
    sub2Pre: 'Or go a step further: with ', sub2Mid: 'swelt.dropshipping', sub2Post: ' you do not need to buy or store goods — we ship directly to your customers.',
    ctaPrimary: 'Start free with the feed', ctaSecondary: 'Try the demo',
    bullets: ['3,000+ products', '7 export formats', 'Updates every 2 hours', 'No technical skills'],
  },
  stats: ['products in the catalog', 'export formats', 'until the feed is live', 'years ZAGO on the market'],
  howItWorks: {
    eyebrow: 'How it works', heading: 'How swelt.feed works for your shop',
    sub: 'Three simple steps. No code. No technical skills.',
    steps: [
      { title: 'Sign up', desc: 'Pick a plan, enter your email and you are done. The feed is ready within 48 hours. We help with setup for free — just write.' },
      { title: 'Connect your shop', desc: 'You get a feed URL. Drop it into your shop or comparison engine settings — like setting up billing. Direct integrations for Shoptet, WooCommerce and Upgates.' },
      { title: 'It runs itself', desc: 'Your shop automatically pulls the latest prices and availability. You just sell. We make sure the data is always correct.' },
    ],
    upsellTitle: 'Do not want to deal with stock or buying at all?',
    upsellSubPre: 'With ', upsellSubMid: 'swelt.dropshipping', upsellSubPost: ' the customer orders from you, we pack and ship directly to them — under your name. You store nothing, buy nothing, just invoice.',
    upsellCta: 'Learn more',
  },
  builder: { eyebrow: 'Try it out', heading: 'Build a feed exactly for your shop', sub: 'Choose where to send data, which categories and how many products. On the right you see a live preview of what your shop or comparison engine receives.' },
  platforms: { eyebrow: 'Integrations', heading: 'Works with what you already have', sub: 'Shoptet, WooCommerce, Heureka, Google Shopping — swelt.feed connects to everything with no code and no IT.' },
  catalog: {
    eyebrow: 'What you get in the catalog', heading: '3,000+ products ready to sell',
    pre: 'The catalog includes ', midBold: 'premium watches, jewelry and accessories', post: ' from world brands like Tommy Hilfiger, Festina, Swarovski and others. Every product has complete data:',
    bullets: ['Name, brand, SKU and EAN barcode', 'Selling price and recommended retail price', 'Current availability and stock count', 'High-resolution photos (300–800 px)', 'Product description, category and subcategory', 'Attributes (gender, water resistance, material...)'],
    tipPre: 'Tip: Want a catalog without stock worries? Move to ', tipLink: 'swelt.dropshipping', tipPost: ' — customer orders, we ship, you collect.',
  },
  features: { eyebrow: 'What you get', heading: 'Everything your shop needs', sub: 'swelt.feed is not just an XML file. It is a live data link working for you 24 hours a day.' },
  dropshipCross: {
    eyebrow: 'Want to go further?', heading: 'swelt.dropshipping: no stock, no logistics',
    sub: 'With the feed you still have to buy and store goods. With swelt.dropshipping that disappears. Customer orders → you forward the order → we pack and ship directly under your name.',
    blocks: [
      { icon: 'cart',  title: 'Customer orders from you', desc: 'The customer buys on your shop as usual — they have no idea we are preparing the shipment.' },
      { icon: 'zap',   title: 'We handle the rest', desc: 'We pack the goods, attach documents and ship via courier (FedEx, DHL, UPS) directly to the customer.' },
      { icon: 'trend', title: 'You just invoice', desc: 'You get one consolidated B2B invoice instead of dozens. No stock, no warehouse, clean profit.' },
    ],
    cta: 'Learn more about swelt.dropshipping',
  },
  pricing: {
    eyebrow: 'Pricing', heading: 'Clear prices. No surprises.',
    sub: 'You only pay for the feed. No commission, no contract. Cancel anytime.',
    quarterly: 'Quarterly', yearly: 'Yearly', perMonth: '/ month', bespoke: 'Custom price', saveYearly: 'Save',
    bottomCardPre: 'Want to go further without stock?', bottomCardMid: ' swelt.dropshipping has no monthly feed fee — you pay only for what you actually sell. ', bottomCardPost: '',
    bottomCardLink: 'Learn more →',
    smallNote: 'All prices excl. VAT. First month free — no card needed.',
  },
  plans: [
    {
      name: 'Starter', subtitle: 'Ideal for the first steps — try with no commitment',
      quarterly: 490, yearly: 392, badge: null, cta: 'Start free →',
      features: ['1 feed (XML or CSV)', 'Up to 500 products', 'Daily updates', 'Shoptet, WooCommerce, Upgates', 'Email support', 'Step-by-step onboarding'],
      missing: ['Heureka / Zbozi / Google / Facebook', 'Multiple feeds at once', 'API access'],
    },
    {
      name: 'Pro', subtitle: 'For shops that mean business',
      quarterly: 990, yearly: 792, badge: 'Most popular', cta: 'Activate Pro →',
      features: ['3 feeds at once', 'Full catalog — 3,000+ products', '4× daily updates (every 6 h)', 'XML + CSV + Heureka + Zbozi', 'Google Shopping + Facebook Catalog', 'Chat support', 'swelt.signal Lite (trend overview)'],
      missing: [],
    },
    {
      name: 'Enterprise', subtitle: 'For large shops and professional teams',
      quarterly: 0, yearly: 0, badge: 'Bespoke', cta: 'Get a quote',
      features: ['Unlimited feeds', 'Real-time updates (< 2 h)', 'Full API access (JSON)', 'Custom attributes and field mapping', '99.9 % uptime SLA', 'Dedicated account manager', 'Priority 4h SLA support'],
      missing: [],
    },
  ],
  faq: { eyebrow: 'FAQ', heading: 'Got questions? Here are the answers.', sub: 'If you cannot find the answer, write to us — we reply within an hour.' },
  faqs: [
    { q: 'What is swelt.feed and how does it help me?', a: 'swelt.feed is a service that automatically transfers our catalog of 3,000+ premium watches and jewelry to your shop. Pick a plan, we prepare the feed file with products, prices and availability — your shop reads it once or four times a day automatically. No manual copying, no stale prices.' },
    { q: 'Do I need to know how to code?', a: 'Not at all. For Shoptet, WooCommerce and Upgates we have direct integrations — set up in 10–20 minutes without a single line of code. For other platforms we send a feed URL that you simply paste into your shop settings. If you get stuck we help for free.' },
    { q: 'What is the difference between swelt.feed and swelt.dropshipping?', a: 'swelt.feed = you transfer our catalog to your shop and you have to buy (or stock) the products. swelt.dropshipping = you store nothing. The customer orders from you, we pack and ship under their name — you just invoice. swelt.dropshipping is one step further: no stock, no logistics.' },
    { q: 'How fast will I see products in my shop?', a: 'Typically within 48 hours of registration. Direct integrations for Shoptet and WooCommerce take less than 20 minutes. Technical support helps with setup for free — just write.' },
    { q: 'How do price and availability updates work?', a: 'We update the catalog every 2 hours on our side. Your shop then loads the feed: Starter plan once a day, Pro plan four times a day (every 6 hours). If a product sells out, the feed marks it unavailable — your customer never orders something we do not have.' },
    { q: 'Can I pick just part of the catalog — say only watches?', a: 'Yes. In the Feed Builder you choose categories (Watches, Jewelry, Accessories), specific brands and a maximum product count. Want only Tommy Hilfiger and Festina? No problem. Changes apply at the next feed load.' },
    { q: 'What happens when a customer wants to return goods?', a: 'With swelt.feed (where you have the goods) you handle returns as any e-shop — the customer returns to you. With swelt.dropshipping B2B rules apply: the customer returns goods to you (not directly to us) and you settle with our team. Our logistics performs a visual quality check before each shipment.' },
  ],
  finalCta: {
    badge: '15+ years ZAGO on the market · authorized distributor',
    heading1: 'Add premium products', heading2: 'to your shop today.',
    sub1: 'We prepare the first feed for free. No card, no commitment. Live within 48 hours.',
    sub2Pre: 'Or try ', sub2Mid: 'swelt.dropshipping', sub2Post: ' right away — no stock, no buying, no logistics.',
    ctaPrimary: 'Launch swelt.feed', ctaSecondary: 'Try dropshipping',
  },
  trustStrip: ['15+ years ZAGO on the market', 'Authorized distributor', 'GDPR', 'Encrypted connection', 'FedEx · DHL · UPS logistics'],
};

const sk = en, pl = en, de = en, fr = en, es = en, it = en, nl = en, pt = en;
const hu = en, ro = en, sv = en, da = en, fi = en, no = en, el = en, is = en;

export const feed: Record<Lang, FeedText> = {
  cs, sk, pl, de, en, fr, es, it, nl, pt, hu, ro, sv, da, fi, no, el, is,
};
