/**
 * Luxury (private purchases) landing page translations.
 * CS + EN fully translated; other 16 languages reuse EN as fallback.
 */
import type { Lang } from './i18n';

export interface LuxBenefit { title: string; text: string }
export interface LuxStep { title: string; text: string }
export interface LuxFaq { q: string; a: string }

export interface LuxuryText {
  hero: { badge: string; h1Part1: string; h1Highlight: string; h1Part2: string; sub: string; ctaInquiry: string; ctaBrands: string; pills: string[]; sampleLabel: string; productCount: string; brandsLabel: string; moreCount: string };
  stats: string[]; // 4 labels
  benefits: { eyebrow: string; heading: string; items: LuxBenefit[] };
  howItWorks: { eyebrow: string; heading: string; steps: LuxStep[] };
  brandsStrip: string;
  inquiry: { eyebrow: string; heading: string; submitted: string; submittedSub: string; submitAgain: string; nonbinding: string; replyTime: string; nameLabel: string; namePh: string; nameError: string; emailLabel: string; emailPh: string; emailError: string; phoneLabel: string; phonePh: string; descLabel: string; descPh: string; descError: string; qtyLabel: string; budgetLabel: string; submit: string; noSpam: string; whyTrust: string; recentActivity: string; activityNote: string; euDelivery: string; euDeliveryNote: string };
  qtyOptions: string[]; // 4 options: '1 piece', '2-5', '6-20', '20+'
  budgetOptions: string[]; // 4 options
  trustItems: string[]; // 5 strings
  notifications: { name: string; city: string; product: string }[];
  productsSection: { eyebrow: string; heading: string; sub: string; available: string };
  faq: { eyebrow: string; heading: string };
  faqs: LuxFaq[];
  cta: { heading: string; sub: string; button: string };
  trustStrip: string[]; // 5 short labels
}

const cs: LuxuryText = {
  hero: {
    badge: 'swelt.luxury — Privátní přístup k prémiím',
    h1Part1: 'Prémiové hodinky a šperky.',
    h1Highlight: 'Bez kompromisů.',
    h1Part2: 'Za velkoobchodní ceny.',
    sub: 'Exkluzivní přístup k 3 000+ produktům světových značek. Pro soukromé osoby i firmy. Bez nutnosti IČO. Dostupné od 1 kusu.',
    ctaInquiry: 'Odeslat poptávku', ctaBrands: 'Prohlédnout značky',
    pills: ['Od 1 kusu', 'Bez nutnosti IČO', 'Doručení EU do 72h'],
    sampleLabel: 'Ukázka katalogu', productCount: '3 000+ produktů',
    brandsLabel: 'Značky v katalogu:', moreCount: '+65 dalších',
  },
  stats: ['Produktů v katalogu', 'Světových značek', 'Průměrná úspora', 'Let ZAGO na trhu'],
  benefits: {
    eyebrow: 'Proč swelt.luxury?', heading: 'Přístup k prémiím bez zbytečných překážek',
    items: [
      { title: 'Velkoobchodní ceny', text: 'Stejné ceny jako pro B2B partnery. Průměrná úspora 40–60 % oproti retailu. Platíte co distributorský zákazník, ne co koncový spotřebitel.' },
      { title: 'Dostupné od 1 kusu', text: 'Žádné minimální odběry. Jeden kus, desítky kusů — funguje stejně. Ideální pro osobní nákup i firemní dárkové balíčky.' },
      { title: 'Diskrétní servis', text: 'Balení bez loga, nenápadná zásilka. Faktura přizpůsobená vašim potřebám — pro soukromé osoby i pro firemní účetnictví.' },
    ],
  },
  howItWorks: {
    eyebrow: 'Jak to funguje', heading: 'Tři kroky k vašemu produktu',
    steps: [
      { title: 'Popište, co hledáte', text: 'Vyplňte formulář nebo nám napište. Máme katalog 3 000+ produktů 70+ světových značek. Nevíte přesně? Poradíme.' },
      { title: 'Obdržíte nabídku do 24 hodin', text: 'Odešleme vám přesnou cenovou nabídku s aktuální dostupností a velkoobchodní cenou. Bez závazku, bez poplatku.' },
      { title: 'Zásilka přímo k vám', text: 'Po potvrzení a platbě expedujeme do 24–48 hodin. Diskrétní balení, pojištěná zásilka, sledování zásilky online.' },
    ],
  },
  brandsStrip: '70+ světových značek — výběr z katalogu',
  inquiry: {
    eyebrow: 'Poptávkový formulář', heading: 'Napište nám, co hledáte',
    submitted: 'Poptávka odeslána!', submittedSub: 'Odpovíme vám do 24 hodin na',
    submitAgain: 'Odeslat další poptávku',
    nonbinding: 'Nezávazná poptávka', replyTime: 'Odpovíme do 24 hodin',
    nameLabel: 'Jméno a příjmení *', namePh: 'Jan Novák', nameError: 'Vyplňte jméno',
    emailLabel: 'E-mail *', emailPh: 'jan@firma.cz', emailError: 'Zadejte platný e-mail',
    phoneLabel: 'Telefon', phonePh: '+420 123 456 789',
    descLabel: 'Co hledáte? *', descPh: 'Popište produkt, značku, model nebo příležitost — narozeniny, firemní dar, osobní nákup...', descError: 'Popište, co hledáte',
    qtyLabel: 'Počet kusů', budgetLabel: 'Rozpočet',
    submit: 'Odeslat poptávku', noSpam: 'Bez závazku. Nebudeme vás spamovat.',
    whyTrust: 'Proč věřit swelt.luxury?',
    recentActivity: 'Nedávná aktivita', activityNote: 'právě odeslal/a poptávku',
    euDelivery: 'Doručení po celé EU', euDeliveryNote: 'ČR, SK, DE, AT a další země EU do 72 hodin',
  },
  qtyOptions: ['1 kus', '2–5 kusů', '6–20 kusů', '20+ kusů'],
  budgetOptions: ['do 5 000 Kč', '5 000–15 000 Kč', '15 000–50 000 Kč', '50 000+ Kč'],
  trustItems: ['15+ let ZAGO na trhu', 'Autorizovaný distributor 70+ značek', 'Garance pravosti produktů', 'Pojištěné zásilky', 'GDPR — vaše data jsou v bezpečí'],
  notifications: [
    { name: 'Petr K.', city: 'Prahy', product: 'Tommy Hilfiger hodinky' },
    { name: 'Markéta S.', city: 'Brna', product: 'firemní dary' },
  ],
  productsSection: {
    eyebrow: 'Ukázka produktů', heading: 'Velkoobchodní ceny — přehled',
    sub: 'Ceny jsou orientační. Přesnou nabídku dostanete po odeslání poptávky.',
    available: 'Dostupný v poptávce',
  },
  faq: { eyebrow: 'Časté dotazy', heading: 'Máte otázky?' },
  faqs: [
    { q: 'Musím mít IČO nebo firmu, abych mohl nakoupit?', a: 'Ne. swelt.luxury je dostupné pro soukromé osoby i firmy bez nutnosti IČO. Stačí vyplnit poptávkový formulář. Pro firmy vystavíme fakturu odpovídající jejich potřebám.' },
    { q: 'Jaká je minimální výše objednávky?', a: 'Minimální odběr je 1 kus. Nejsme vázáni žádnými MOQ. Objednáte jeden kus jako narozeninový dárek nebo sto kusů jako firemní prezenty — podmínky jsou stejné.' },
    { q: 'Jak dlouho trvá vyřízení poptávky?', a: 'Odpovídáme do 24 hodin v pracovní dny. Cenová nabídka obsahuje přesnou dostupnost, velkoobchodní cenu a odhadovaný čas doručení. Po potvrzení expedujeme do 24–48 hodin.' },
    { q: 'Jsou produkty originální?', a: 'Ano. Jsme autorizovaný distributor 70+ světových značek. Každý produkt je originální, pochází přímo od výrobce nebo autorizovaného dovozce a je doplněn dokladem o původu.' },
    { q: 'Jak probíhá platba a dodání?', a: 'Po potvrzení nabídky obdržíte fakturu (hotovost, převod nebo karta). Po platbě zásilku expedujeme. Doručení po celé EU do 72 hodin. Zásilka je pojištěná a sledovatelná online.' },
  ],
  cta: { heading: 'Prémiové produkty dostupné pro každého.', sub: 'Vyplňte poptávku — nabídku zašleme do 24 hodin.', button: 'Odeslat poptávku' },
  trustStrip: ['15+ let ZAGO', 'Autorizovaný distributor', 'Garance pravosti', 'GDPR', 'Pojištěné zásilky'],
};

const en: LuxuryText = {
  hero: {
    badge: 'swelt.luxury — Private access to premium goods',
    h1Part1: 'Premium watches and jewelry.',
    h1Highlight: 'No compromises.',
    h1Part2: 'At wholesale prices.',
    sub: 'Exclusive access to 3,000+ products from world brands. For individuals and companies. No VAT ID required. Available from 1 piece.',
    ctaInquiry: 'Send inquiry', ctaBrands: 'Browse brands',
    pills: ['From 1 piece', 'No VAT ID required', 'EU delivery in 72h'],
    sampleLabel: 'Catalog sample', productCount: '3,000+ products',
    brandsLabel: 'Brands in the catalog:', moreCount: '+65 more',
  },
  stats: ['Products in catalog', 'World brands', 'Average savings', 'Years ZAGO on the market'],
  benefits: {
    eyebrow: 'Why swelt.luxury?', heading: 'Premium goods without unnecessary barriers',
    items: [
      { title: 'Wholesale prices', text: 'The same prices as B2B partners. Average savings 40–60 % vs retail. You pay distributor prices, not consumer prices.' },
      { title: 'Available from 1 piece', text: 'No minimums. One piece or dozens — it works the same way. Ideal for personal purchases and corporate gift packages.' },
      { title: 'Discreet service', text: 'Plain packaging, low-key shipment. Invoicing tailored to your needs — for individuals and corporate accounting alike.' },
    ],
  },
  howItWorks: {
    eyebrow: 'How it works', heading: 'Three steps to your product',
    steps: [
      { title: 'Tell us what you are looking for', text: 'Fill out the form or write to us. We have a catalog of 3,000+ products from 70+ world brands. Not sure? We will help.' },
      { title: 'Receive a quote within 24 hours', text: 'We will send a precise quote with current availability and wholesale price. No commitment, no fee.' },
      { title: 'Shipment direct to you', text: 'After confirmation and payment we dispatch within 24–48 hours. Discreet packaging, insured shipment, online tracking.' },
    ],
  },
  brandsStrip: '70+ world brands — selection from the catalog',
  inquiry: {
    eyebrow: 'Inquiry form', heading: 'Tell us what you are looking for',
    submitted: 'Inquiry sent!', submittedSub: 'We will reply within 24 hours to',
    submitAgain: 'Send another inquiry',
    nonbinding: 'Non-binding inquiry', replyTime: 'We reply within 24 hours',
    nameLabel: 'Full name *', namePh: 'John Doe', nameError: 'Please enter a name',
    emailLabel: 'Email *', emailPh: 'john@company.com', emailError: 'Enter a valid email',
    phoneLabel: 'Phone', phonePh: '+420 123 456 789',
    descLabel: 'What are you looking for? *', descPh: 'Describe the product, brand, model or occasion — birthday, corporate gift, personal purchase...', descError: 'Please describe what you are looking for',
    qtyLabel: 'Quantity', budgetLabel: 'Budget',
    submit: 'Send inquiry', noSpam: 'No commitment. We will not spam you.',
    whyTrust: 'Why trust swelt.luxury?',
    recentActivity: 'Recent activity', activityNote: 'just sent an inquiry',
    euDelivery: 'EU-wide delivery', euDeliveryNote: 'CZ, SK, DE, AT and other EU countries within 72 hours',
  },
  qtyOptions: ['1 piece', '2–5 pieces', '6–20 pieces', '20+ pieces'],
  budgetOptions: ['under €200', '€200–€600', '€600–€2,000', '€2,000+'],
  trustItems: ['15+ years ZAGO on the market', 'Authorized distributor of 70+ brands', 'Authenticity guarantee', 'Insured shipments', 'GDPR — your data is safe'],
  notifications: [
    { name: 'Peter K.', city: 'Prague', product: 'Tommy Hilfiger watches' },
    { name: 'Margaret S.', city: 'Brno', product: 'corporate gifts' },
  ],
  productsSection: {
    eyebrow: 'Sample products', heading: 'Wholesale prices — overview',
    sub: 'Prices are indicative. You will receive a precise quote after sending an inquiry.',
    available: 'Available on request',
  },
  faq: { eyebrow: 'FAQ', heading: 'Have questions?' },
  faqs: [
    { q: 'Do I need a VAT ID or company to buy?', a: 'No. swelt.luxury is available to individuals and companies without a VAT ID. Just fill out the inquiry form. For companies we issue an invoice that fits their needs.' },
    { q: 'What is the minimum order?', a: 'Minimum order is 1 piece. We have no MOQs. You can order one piece for a birthday gift or a hundred for corporate gifts — terms are the same.' },
    { q: 'How long does an inquiry take?', a: 'We reply within 24 hours on business days. The quote includes precise availability, wholesale price and estimated delivery. After confirmation we dispatch within 24–48 hours.' },
    { q: 'Are the products original?', a: 'Yes. We are an authorized distributor of 70+ world brands. Every product is original, sourced directly from the manufacturer or authorized importer, with proof of origin.' },
    { q: 'How does payment and delivery work?', a: 'After accepting the quote you receive an invoice (cash, transfer or card). After payment we dispatch the shipment. EU delivery within 72 hours. Shipments are insured and trackable online.' },
  ],
  cta: { heading: 'Premium products available to everyone.', sub: 'Submit an inquiry — we will send the quote within 24 hours.', button: 'Send inquiry' },
  trustStrip: ['15+ years ZAGO', 'Authorized distributor', 'Authenticity guarantee', 'GDPR', 'Insured shipments'],
};

const sk = en, pl = en, de = en, fr = en, es = en, it = en, nl = en, pt = en;
const hu = en, ro = en, sv = en, da = en, fi = en, no = en, el = en, is = en;

export const luxury: Record<Lang, LuxuryText> = {
  cs, sk, pl, de, en, fr, es, it, nl, pt, hu, ro, sv, da, fi, no, el, is,
};
