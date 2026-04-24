import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Rss, Database, Zap, Globe, FileJson, FileText, BarChart3,
  Check, ChevronDown, ArrowRight, RefreshCw, Filter, Download,
  Clock, Package, ShoppingCart, TrendingUp, Shield, Users,
  Settings, Layers, Code, Link, CheckCircle, X, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Navbar } from '@/components/Navbar';

/* ─── SEO / JSON-LD ─── */
function SeoHead() {
  useEffect(() => {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Co je swelt.feed a jak mi pomůže?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'swelt.feed je služba, která automaticky přenese náš katalog 3 000+ prémiových hodinek a šperků do vašeho e-shopu. Stačí si vybrat plán, my vám připravíme soubor (feed) s produkty, cenami a dostupností — a váš e-shop ho jednou denně nebo čtyřikrát denně automaticky načte. Žádné ruční kopírování, žádné zastaralé ceny.',
          },
        },
        {
          '@type': 'Question',
          name: 'Musím umět programovat, abych mohl swelt.feed použít?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Vůbec ne. Pro Shoptet, WooCommerce a Upgates máme připravené přímé integrace — nastavíte je za 10–20 minut bez jediného řádku kódu. Pro ostatní platformy vám pošleme odkaz na feed, který jednoduše vložíte do nastavení vašeho e-shopu. Pokud si nevíte rady, pomůžeme vám zdarma.',
          },
        },
        {
          '@type': 'Question',
          name: 'Jaký je rozdíl mezi swelt.feed a swelt.dropshipping?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'swelt.feed = přenesete náš katalog do svého e-shopu a produkty si musíte nakoupit (nebo mít skladem). swelt.dropshipping = vůbec nic neskladujete. Zákazník u vás objedná, my mu zboží zabalíme a odešleme přímo jeho jménem — vy jen fakturujete. swelt.dropshipping je o krok dál: nulový sklad, nulová logistika.',
          },
        },
        {
          '@type': 'Question',
          name: 'Jak rychle uvidím produkty ve svém e-shopu?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Typicky do 48 hodin od registrace. Přímé integrace pro Shoptet a WooCommerce trvají méně než 20 minut. Technická podpora vám s nastavením pomůže zdarma — stačí napsat.',
          },
        },
        {
          '@type': 'Question',
          name: 'Jak fungují aktualizace cen a dostupnosti?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Katalog aktualizujeme každé 2 hodiny na naší straně. Váš e-shop pak feed načítá: plán Starter 1× denně, plán Pro 4× denně (každých 6 hodin). Pokud se produkt vyprodá, feed ho automaticky označí jako nedostupný — váš zákazník nikdy neobjedná něco, co nemáme.',
          },
        },
        {
          '@type': 'Question',
          name: 'Mohu si vybrat jen část katalogu — třeba jen hodinky?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ano. Ve Feed Builderu si zvolíte kategorie (Hodinky, Šperky, Doplňky), konkrétní značky i maximální počet produktů. Chcete jen Tommy Hilfiger a Festina? Žádný problém. Změny se projeví při dalším načtení feedu.',
          },
        },
        {
          '@type': 'Question',
          name: 'Co se stane, když zákazník chce zboží vrátit?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Při modelu swelt.feed (kde vy sami máte zboží) řešíte vrácení standardně jako každý e-shop — zákazník vrátí zboží vám. U swelt.dropshipping platí B2B pravidla: zákazník vrací zboží vám (ne přímo nám), vy pak situaci řešíte s naším týmem. Před odesláním každé objednávky naše logistika provede vizuální kontrolu kvality.',
          },
        },
      ],
    };

    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'swelt.feed — Produktový feed prémiových hodinek a šperků',
      description: 'Automatický produktový feed 3 000+ prémiových hodinek a šperků pro české a slovenské e-shopy. Shoptet, WooCommerce, Heureka, Zbozi.cz, Google Shopping — bez technických znalostí.',
      provider: { '@type': 'Organization', name: 'ZAGO / swelt.partner', url: 'https://swelt.partner' },
      areaServed: [
        { '@type': 'Country', name: 'CZ' },
        { '@type': 'Country', name: 'SK' },
      ],
      availableLanguage: ['cs', 'sk'],
      offers: [
        { '@type': 'Offer', name: 'Starter', price: '490', priceCurrency: 'CZK' },
        { '@type': 'Offer', name: 'Pro', price: '990', priceCurrency: 'CZK' },
      ],
    };

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'swelt.partner', item: 'https://swelt.partner' },
        { '@type': 'ListItem', position: 2, name: 'swelt.feed', item: 'https://swelt.partner/feed' },
      ],
    };

    [faqSchema, serviceSchema, breadcrumb].forEach((schema, i) => {
      const id = `ld-json-feed-${i}`;
      let el = document.getElementById(id) as HTMLScriptElement | null;
      if (!el) {
        el = document.createElement('script');
        el.id = id;
        el.type = 'application/ld+json';
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(schema);
    });

    return () => {
      [0, 1, 2].forEach(i => document.getElementById(`ld-json-feed-${i}`)?.remove());
    };
  }, []);

  return null;
}

/* ─── Utility hooks & components ─── */
function useReveal(threshold = 0.15): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, revealed];
}

function CountUp({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const [ref, revealed] = useReveal(0.5);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!revealed) return;
    let start = 0;
    const step = Math.ceil(to / 40);
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(id); }
      else setCount(start);
    }, 35);
    return () => clearInterval(id);
  }, [revealed, to]);
  return <span ref={ref}>{prefix}{count.toLocaleString('cs')}{suffix}</span>;
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, revealed] = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 hover:text-primary transition-colors"
      >
        <span className="font-medium text-sm sm:text-base">{q}</span>
        <ChevronDown className={`h-5 w-5 text-primary shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ─── FloatingNotif ─── */
function FloatingNotif({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <div className={`fixed bottom-6 left-6 z-40 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="flex items-center gap-3 bg-white border border-border rounded-2xl shadow-xl px-4 py-3 max-w-xs">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Rss className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">Nový e-shop právě aktivoval feed</p>
          <p className="text-[11px] text-muted-foreground">před 3 minutami · Shoptet integrace</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Data ─── */
const FORMAT_LIST = [
  { id: 'xml',      label: 'XML',             icon: FileText,     color: '#2563eb', desc: 'Funguje na každé platformě — univerzální volba' },
  { id: 'csv',      label: 'CSV',             icon: Download,     color: '#0891b2', desc: 'Vhodný pro import tabulek a vlastní systémy' },
  { id: 'json',     label: 'JSON / API',      icon: FileJson,     color: '#7c3aed', desc: 'Pro vývojáře — real-time API přístup' },
  { id: 'heureka',  label: 'Heureka.cz',      icon: BarChart3,    color: '#ea580c', desc: 'Nativní formát dle specifikace Heureka.cz' },
  { id: 'zbozi',    label: 'Zbozi.cz',        icon: ShoppingCart, color: '#16a34a', desc: 'Ceník kompatibilní se Zbozi.cz' },
  { id: 'google',   label: 'Google Shopping', icon: Globe,        color: '#dc2626', desc: 'Google Merchant Center — spusťte CPC reklamy' },
  { id: 'facebook', label: 'Facebook Catalog',icon: Rss,          color: '#1d4ed8', desc: 'Dynamické reklamy na Facebooku a Instagramu' },
] as const;

type FormatId = typeof FORMAT_LIST[number]['id'];

const CATEGORIES = [
  { id: 'hodinky',  label: 'Hodinky',   count: 1850 },
  { id: 'sperky',   label: 'Šperky',    count: 780  },
  { id: 'doplnky',  label: 'Doplňky',   count: 420  },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

const SAMPLE_PRODUCT = {
  id: '1791349',
  brand: 'Tommy Hilfiger',
  name: 'Decker',
  sku: 'TH1791349',
  ean: '7613272348034',
  price: '4475',
  currency: 'CZK',
  stock: 14,
  url: 'https://swelt.partner/hodinky/tommy-hilfiger-decker-1791349',
  imgUrl: 'https://cdn.b2bzago.com/images/0/7afe1cca249d731c/100/hodinky-tommy-hilfiger-model-decker-1791349.jpg',
  category: 'Hodinky',
  description: 'Pánské analogové hodinky Tommy Hilfiger Decker s datumovkou. Pouzdro 44mm, quartz strojek.',
};

function formatPreview(formatId: FormatId): string {
  const p = SAMPLE_PRODUCT;
  switch (formatId) {
    case 'xml':
    case 'heureka':
      return `<?xml version="1.0" encoding="UTF-8"?>
<SHOP>
  <SHOPITEM>
    <ITEM_ID>${p.id}</ITEM_ID>
    <PRODUCTNAME>${p.brand} ${p.name}</PRODUCTNAME>
    <EAN>${p.ean}</EAN>
    <PRICE_VAT>${p.price}</PRICE_VAT>
    <STOCK_QUANTITY>${p.stock}</STOCK_QUANTITY>
    <CATEGORY>${p.category}</CATEGORY>
    <URL>${p.url}</URL>
  </SHOPITEM>
</SHOP>`;
    case 'zbozi':
      return `<?xml version="1.0" encoding="UTF-8"?>
<PRODUCTS>
  <PRODUCT>
    <EAN>${p.ean}</EAN>
    <PRODUCTNAME>${p.brand} ${p.name}</PRODUCTNAME>
    <PRICE>${p.price}</PRICE>
    <COUNT>${p.stock}</COUNT>
    <URL>${p.url}</URL>
    <IMGURL>${p.imgUrl}</IMGURL>
  </PRODUCT>
</PRODUCTS>`;
    case 'csv':
      return `id,title,price,availability,brand,ean,link
${p.id},"${p.brand} ${p.name}",${p.price},in stock,${p.brand},${p.ean},${p.url}`;
    case 'json':
      return `{
  "products": [{
    "id": "${p.id}",
    "title": "${p.brand} ${p.name}",
    "sku": "${p.sku}",
    "ean": "${p.ean}",
    "price": ${p.price},
    "currency": "${p.currency}",
    "stock": ${p.stock},
    "url": "${p.url}"
  }]
}`;
    case 'google':
      return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <item>
      <g:id>${p.id}</g:id>
      <g:title>${p.brand} ${p.name}</g:title>
      <g:price>${p.price} CZK</g:price>
      <g:availability>in stock</g:availability>
      <g:brand>${p.brand}</g:brand>
      <g:gtin>${p.ean}</g:gtin>
      <g:link>${p.url}</g:link>
    </item>
  </channel>
</rss>`;
    case 'facebook':
      return `id,title,description,price,availability,brand,gtin,link,image_link
${p.id},"${p.brand} ${p.name}","${p.description}","${p.price} CZK","in stock","${p.brand}","${p.ean}","${p.url}","${p.imgUrl}"`;
  }
}

const PLATFORM_LIST = [
  { name: 'Shoptet',           icon: '🏪', desc: 'Přímé propojení — vložte URL feedu do nastavení a hotovo. Žádný kód.', time: '~15 min' },
  { name: 'WooCommerce',       icon: '🛒', desc: 'WordPress plugin pro import XML feedu. Nastavíte sami za pár kliků.', time: '~20 min' },
  { name: 'Upgates',           icon: '⚙️', desc: 'CSV nebo XML import. Ceny a dostupnost se aktualizují automaticky.', time: '~20 min' },
  { name: 'Heureka.cz',        icon: '🔍', desc: 'Nativní XML dle jejich specifikace. Produkty se schválí automaticky.', time: '~10 min' },
  { name: 'Zbozi.cz',          icon: '📦', desc: 'Kompatibilní XML ceník — vaše nabídky se okamžitě synchronizují.', time: '~10 min' },
  { name: 'Google Shopping',   icon: '🛍️', desc: 'Merchant Center RSS2 feed. Spusťte CPC reklamy hned dnes.', time: '~20 min' },
  { name: 'Facebook Catalog',  icon: '📢', desc: 'Meta Catalog CSV pro dynamické reklamy na FB a Instagramu.', time: '~20 min' },
  { name: 'PrestaShop',        icon: '🔧', desc: 'XML feed i REST API. Funguje s verzemi 1.6 i 1.7+.', time: '~30 min' },
  { name: 'REST API',          icon: '</>', desc: 'JSON API pro vývojáře — real-time data pro libovolnou integraci.', time: 'Custom' },
];

const FEATURES = [
  { icon: Clock,      title: 'Automatická aktualizace bez práce',  text: 'Ceny a dostupnost se aktualizují každé 2 hodiny na naší straně. Váš feed pak přenese změny 1× denně (Starter) nebo 4× denně (Pro). Nikdy nezobrazíte vyprodaný produkt ani špatnou cenu.' },
  { icon: TrendingUp, title: 'Vaše ceny, vaše marže',              text: 'Nastavte si globální přirážku nebo různá pravidla pro každou kategorii zvlášť. Feed automaticky přepočítá prodejní ceny — a vy vždy víte, kolik vyděláte na každém prodeji.' },
  { icon: Filter,     title: 'Jen produkty, které chcete',         text: 'Zvolte si kategorie (Hodinky, Šperky, Doplňky), konkrétní značky nebo maximální počet produktů. Zbytek katalogu se do vašeho e-shopu nedostane.' },
  { icon: Shield,     title: 'Nikdy neprodáte to, co nemáme',      text: 'Každá aktualizace feedu ověří dostupnost všech produktů. Jakmile se zboží vyprodá, feed ho označí jako nedostupný — a váš zákazník vidí správný stav.' },
  { icon: Layers,     title: 'Jeden účet, více kanálů najednou',   text: 'Plán Pro vám dá 3 feedů současně. XML pro váš e-shop, nativní Heureka feed a Google Shopping — vše ze stejného katalogu, vše synchronizovaně.' },
  { icon: Code,       title: 'API pro pokročilé',                  text: 'Potřebujete real-time data nebo vlastní integraci? REST API s JSON výstupem umí vše — dotazy na produkty, ceny, dostupnost. Dokumentace a příklady zdarma.' },
];

const FAQS = [
  {
    q: 'Co je swelt.feed a jak mi pomůže?',
    a: 'swelt.feed je služba, která automaticky přenese náš katalog 3 000+ prémiových hodinek a šperků do vašeho e-shopu. Stačí si vybrat plán, my vám připravíme soubor (feed) s produkty, cenami a dostupností — a váš e-shop ho jednou denně nebo čtyřikrát denně automaticky načte. Žádné ruční kopírování, žádné zastaralé ceny.',
  },
  {
    q: 'Musím umět programovat, abych mohl swelt.feed použít?',
    a: 'Vůbec ne. Pro Shoptet, WooCommerce a Upgates máme připravené přímé integrace — nastavíte je za 10–20 minut bez jediného řádku kódu. Pro ostatní platformy vám pošleme odkaz na feed, který jednoduše vložíte do nastavení vašeho e-shopu. Pokud si nevíte rady, pomůžeme vám zdarma.',
  },
  {
    q: 'Jaký je rozdíl mezi swelt.feed a swelt.dropshipping?',
    a: 'swelt.feed = přenesete náš katalog do svého e-shopu a produkty si musíte nakoupit (nebo mít skladem). swelt.dropshipping = vůbec nic neskladujete. Zákazník u vás objedná, my mu zboží zabalíme a odešleme přímo jeho jménem — vy jen fakturujete. swelt.dropshipping je o krok dál: nulový sklad, nulová logistika.',
  },
  {
    q: 'Jak rychle uvidím produkty ve svém e-shopu?',
    a: 'Typicky do 48 hodin od registrace. Přímé integrace pro Shoptet a WooCommerce trvají méně než 20 minut. Technická podpora vám s nastavením pomůže zdarma — stačí napsat.',
  },
  {
    q: 'Jak fungují aktualizace cen a dostupnosti?',
    a: 'Katalog aktualizujeme každé 2 hodiny na naší straně. Váš e-shop pak feed načítá: plán Starter 1× denně, plán Pro 4× denně (každých 6 hodin). Pokud se produkt vyprodá, feed ho automaticky označí jako nedostupný — váš zákazník nikdy neobjedná něco, co nemáme.',
  },
  {
    q: 'Mohu si vybrat jen část katalogu — třeba jen hodinky?',
    a: 'Ano. Ve Feed Builderu si zvolíte kategorie (Hodinky, Šperky, Doplňky), konkrétní značky i maximální počet produktů. Chcete jen Tommy Hilfiger a Festina? Žádný problém. Změny se projeví při dalším načtení feedu.',
  },
  {
    q: 'Co se stane, když zákazník chce zboží vrátit?',
    a: 'Při modelu swelt.feed (kde vy sami máte zboží) řešíte vrácení standardně jako každý e-shop — zákazník vrátí zboží vám. U swelt.dropshipping platí B2B pravidla: zákazník vrací zboží vám (ne přímo nám), vy pak situaci řešíte s naším týmem. Před odesláním každé objednávky naše logistika provede vizuální kontrolu kvality.',
  },
];

/* ─── Feed Builder ─── */
function FeedBuilder() {
  const [selectedFormat, setSelectedFormat] = useState<FormatId>('heureka');
  const [activeCategories, setActiveCategories] = useState<Set<CategoryId>>(new Set(['hodinky', 'sperky', 'doplnky']));
  const [maxProducts, setMaxProducts] = useState([500]);
  const navigate = useNavigate();

  const toggleCategory = useCallback((id: CategoryId) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  }, []);

  const availableCount = CATEGORIES
    .filter(c => activeCategories.has(c.id))
    .reduce((sum, c) => sum + c.count, 0);

  const limitedCount = Math.min(availableCount, maxProducts[0]);

  const currentFormat = FORMAT_LIST.find(f => f.id === selectedFormat)!;
  const FormatIcon = currentFormat.icon;

  const updateFrequency = maxProducts[0] <= 500 ? '1× denně (Starter)' : '4× denně (Pro)';

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left — format selector */}
      <div className="rounded-2xl border border-border bg-white shadow-sm p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Kam chcete posílat feed?</span>
        </div>
        <p className="text-xs text-muted-foreground pb-1">Vyberte platformu nebo kanál — živý náhled dat se okamžitě změní.</p>
        {FORMAT_LIST.map(f => {
          const Ico = f.icon;
          const active = selectedFormat === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFormat(f.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all border text-sm font-medium ${active ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border hover:border-primary/40 hover:bg-muted/60 text-foreground'}`}
            >
              <Ico className="h-4 w-4 shrink-0" style={{ color: active ? currentFormat.color : undefined }} />
              <span className="flex-1">{f.label}</span>
              {active && <CheckCircle className="h-4 w-4 text-primary shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Middle — category + slider */}
      <div className="rounded-2xl border border-border bg-white shadow-sm p-5 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Které produkty chcete?</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Zaškrtněte kategorie, které budete prodávat.</p>
          <div className="space-y-2">
            {CATEGORIES.map(c => {
              const active = activeCategories.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCategory(c.id)}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-all border ${active ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/40'}`}
                >
                  <span className="flex items-center gap-2">
                    {active
                      ? <Check className="h-4 w-4 text-primary" />
                      : <div className="h-4 w-4 rounded border border-muted-foreground/40" />}
                    {c.label}
                  </span>
                  <span className="text-xs font-semibold tabular-nums">{c.count.toLocaleString('cs')} ks</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Kolik produktů chcete v feedu?</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Začněte s méně a postupně přidávejte — nebo rovnou vezměte celý katalog.</p>
          <Slider
            min={100}
            max={3000}
            step={100}
            value={maxProducts}
            onValueChange={setMaxProducts}
            className="mb-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100 ks</span>
            <span className="font-semibold text-foreground">{maxProducts[0].toLocaleString('cs')} ks</span>
            <span>3 000 ks</span>
          </div>
          {maxProducts[0] > 500 && (
            <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Pro více než 500 produktů najednou potřebujete plán <strong>Pro</strong>.
            </p>
          )}
        </div>

        <div className="rounded-xl bg-muted/60 border border-border p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Produktů ve feedu</span>
            <span className="font-bold text-primary">{limitedCount.toLocaleString('cs')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Aktualizace</span>
            <span className="font-semibold text-foreground">{updateFrequency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Formát</span>
            <span className="font-semibold text-foreground">{currentFormat.label}</span>
          </div>
        </div>
      </div>

      {/* Right — live preview */}
      <div className="rounded-2xl border border-border bg-white shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${currentFormat.color}18` }}>
            <FormatIcon className="h-5 w-5" style={{ color: currentFormat.color }} />
          </div>
          <div>
            <div className="font-bold text-sm">{currentFormat.label} — živý náhled</div>
            <div className="text-xs text-muted-foreground">{currentFormat.desc}</div>
          </div>
        </div>

        <div className="flex-1 rounded-xl bg-slate-950 p-4 overflow-auto min-h-[220px]">
          <pre className="text-[11px] leading-relaxed text-emerald-300 font-mono whitespace-pre-wrap break-all">
            {formatPreview(selectedFormat)}
          </pre>
        </div>

        <div className="rounded-xl bg-muted/50 border border-border px-4 py-3 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs text-muted-foreground">
            <strong className="text-foreground">{limitedCount.toLocaleString('cs')} produktů</strong> připraveno · aktualizace {updateFrequency}
          </span>
        </div>

        <Button className="w-full gap-2 font-semibold" onClick={() => navigate('/register')}>
          Chci tento feed
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Feed() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'quarterly' | 'yearly'>('quarterly');
  const [notifVisible, setNotifVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setNotifVisible(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const price = (quarterly: number, yearly: number) =>
    billingCycle === 'quarterly' ? quarterly : yearly;

  const plans = [
    {
      name: 'Starter',
      subtitle: 'Ideální pro první kroky — vyzkoušejte bez závazku',
      monthly: price(490, 392),
      badge: null,
      featured: false,
      cta: 'Začít zdarma →',
      features: [
        '1 feed (XML nebo CSV)',
        'Až 500 produktů',
        'Aktualizace 1× denně',
        'Shoptet, WooCommerce, Upgates',
        'E-mailová podpora',
        'Onboarding krok za krokem',
      ],
      missing: [
        'Heureka / Zbozi / Google / Facebook',
        'Více feedů najednou',
        'API přístup',
      ],
    },
    {
      name: 'Pro',
      subtitle: 'Pro e-shopy, které to myslí vážně',
      monthly: price(990, 792),
      badge: 'Nejoblíbenější',
      featured: true,
      cta: 'Aktivovat Pro →',
      features: [
        '3 feedů najednou',
        'Celý katalog — 3 000+ produktů',
        'Aktualizace 4× denně (každých 6 h)',
        'XML + CSV + Heureka + Zbozi',
        'Google Shopping + Facebook Catalog',
        'Chat podpora',
        'swelt.signal Lite (přehled trendů)',
      ],
      missing: [],
    },
    {
      name: 'Enterprise',
      subtitle: 'Pro velké e-shopy a profesionální týmy',
      monthly: 0,
      badge: 'Na míru',
      featured: false,
      cta: 'Získat nabídku',
      features: [
        'Neomezený počet feedů',
        'Real-time aktualizace (< 2 h)',
        'Plný API přístup (JSON)',
        'Vlastní atributy a mapování polí',
        'SLA garance 99,9 % dostupnosti',
        'Dedikovaný account manager',
        'Prioritní podpora 4h SLA',
      ],
      missing: [],
    },
  ];

  return (
    <div
      className="feed-page min-h-screen bg-background text-foreground"
      style={{
        '--background': '220 30% 98%',
        '--foreground': '220 25% 10%',
        '--card': '0 0% 100%',
        '--primary': '220 80% 50%',
        '--primary-foreground': '0 0% 100%',
        '--muted': '220 20% 94%',
        '--muted-foreground': '220 15% 45%',
        '--border': '220 20% 88%',
      } as React.CSSProperties}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap');
        .feed-page .font-display { font-family: 'Montserrat', sans-serif !important; }
      `}</style>

      <SeoHead />
      <Navbar />

      {/* ─── 1. Hero ─── */}
      <section className="relative overflow-hidden pt-28 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <Reveal>
            <Badge className="mb-5 px-4 py-1.5 text-sm font-semibold bg-primary/10 text-primary border-primary/20 rounded-full">
              <Rss className="h-3.5 w-3.5 mr-2" />
              swelt.feed — prémiové produkty pro váš e-shop
            </Badge>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-5">
              Máte e-shop a chcete přidat<br className="hidden sm:block" />
              <span className="text-primary"> prémiové produkty bez starostí?</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-5 leading-relaxed">
              Pořiďte si <strong className="text-foreground">swelt.feed</strong> a my vám propojíme e-shop s naším katalogem{' '}
              <strong className="text-foreground">3 000+ prémiových hodinek a doplňků</strong> — žádné technické znalosti nejsou potřeba.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Nebo jděte ještě dál: se <strong className="text-foreground">swelt.dropshipping</strong> zboží vůbec nemusíte kupovat ani skladovat — my ho rovnou odešleme vašim zákazníkům.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <Button size="lg" className="px-8 gap-2 font-bold text-base shadow-lg shadow-primary/25" onClick={() => navigate('/register')}>
                Začít s feedem zdarma
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 gap-2 font-semibold text-base" onClick={() => document.getElementById('feed-builder')?.scrollIntoView({ behavior: 'smooth' })}>
                <Database className="h-4 w-4" />
                Vyzkoušet na nečisto
              </Button>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { icon: Package,    label: '3 000+ produktů' },
                { icon: Layers,     label: '7 formátů exportu' },
                { icon: RefreshCw,  label: 'Aktualizace každé 2 hodiny' },
                { icon: CheckCircle,label: 'Bez technických znalostí' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2 shadow-sm text-sm font-medium text-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <FloatingNotif visible={notifVisible} onClose={() => setNotifVisible(false)} />
      </section>

      {/* ─── 2. Stats bar ─── */}
      <section className="bg-primary py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
          {[
            { to: 3000, suffix: '+', label: 'produktů v katalogu' },
            { to: 7,    suffix: '',  label: 'formátů exportu' },
            { to: 48,   suffix: 'h', label: 'do spuštění feedu' },
            { to: 15,   suffix: '+', label: 'let ZAGO na trhu' },
          ].map(({ to, suffix, label }) => (
            <div key={label}>
              <div className="text-3xl sm:text-4xl font-black mb-1">
                <CountUp to={to} suffix={suffix} />
              </div>
              <div className="text-sm text-blue-100 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. Jak swelt.feed funguje ─── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Jak to funguje</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                Jak swelt.feed funguje pro váš e-shop
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Tři jednoduché kroky. Žádný kód. Žádné technické znalosti.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 mb-14">
            {[
              {
                step: '1',
                icon: Users,
                title: 'Zaregistrujete se',
                desc: 'Vyberete plán, vyplníte e-mail a hotovo. Do 48 hodin máte feed připravený. Pomůžeme vám s nastavením zdarma — stačí napsat.',
              },
              {
                step: '2',
                icon: Link,
                title: 'Propojíte e-shop',
                desc: 'Dostanete odkaz na feed (URL). Vložíte ho do nastavení vašeho e-shopu nebo srovnávače — stejně jako byste nastavovali fakturaci. Pro Shoptet, WooCommerce a Upgates máme přímé integrace.',
              },
              {
                step: '3',
                icon: RefreshCw,
                title: 'Vše běží samo',
                desc: 'E-shop automaticky stahuje aktuální ceny a dostupnost. Vy jen prodáváte. My se staráme o to, aby data byla vždy správně.',
              },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <Reveal key={step} delay={i * 100}>
                <div className="relative text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary text-white font-black text-xl mb-5 shadow-lg shadow-primary/25">
                    {step}
                  </div>
                  <div className="absolute top-6 left-1/2 hidden md:block w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent -z-10" />
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Upsell dropshipping */}
          <Reveal delay={200}>
            <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-primary/20 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground mb-1">Nechcete vůbec řešit sklad ani nákup?</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Se <strong className="text-foreground">swelt.dropshipping</strong> zákazník objedná u vás, my zboží zabalíme a odešleme přímo jemu — pod vaším jménem. Vy nic neskladujete, nic nenakupujete, jen fakturujete.
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 font-semibold gap-1.5" onClick={() => navigate('/dropshipping')}>
                Zjistit více
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 4. Feed Builder ─── */}
      <section id="feed-builder" className="py-20 px-4 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Vyzkoušejte si to</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                Sestavte si feed přesně pro svůj e-shop
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Zvolte kam chcete posílat data, které kategorie a kolik produktů. Vpravo vidíte živý náhled toho, co váš e-shop nebo srovnávač dostane.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <FeedBuilder />
          </Reveal>
        </div>
      </section>

      {/* ─── 5. Platforms ─── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Integrace</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                Funguje s tím, co už máte
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Shoptet, WooCommerce, Heureka, Google Shopping — swelt.feed se napojí na vše bez kódu a bez IT oddělení.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORM_LIST.map((p, i) => (
              <Reveal key={p.name} delay={i * 50}>
                <div className="rounded-2xl border border-border bg-white p-5 hover:border-primary/40 hover:shadow-md transition-all group">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl leading-none">{p.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{p.name}</div>
                      <div className="text-xs text-primary font-medium">Nastavení za {p.time}</div>
                    </div>
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. What's in the catalog ─── */}
      <section className="py-20 px-4 bg-muted/40">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Co dostanete v katalogu</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-5">
                3 000+ produktů připravených k prodeji
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Katalog zahrnuje <strong className="text-foreground">prémiové hodinky, šperky a doplňky</strong> od světových značek jako Tommy Hilfiger, Festina, Swarovski a dalších. Každý produkt má kompletní data:
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  'Název, značka, SKU a EAN čárový kód',
                  'Prodejní cena a doporučená maloobchodní cena',
                  'Aktuální dostupnost a počet kusů na skladě',
                  'Fotografie ve vysokém rozlišení (300–800 px)',
                  'Popis produktu, kategorie a podkategorie',
                  'Atributy (pohlaví, voděodolnost, materiál...)',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 leading-relaxed">
                <strong className="text-foreground">Tip:</strong> Chcete katalog bez starostí o sklad? Přejděte na{' '}
                <button className="text-primary font-semibold hover:underline" onClick={() => navigate('/dropshipping')}>swelt.dropshipping</button>{' '}
                — zákazník objedná, my odešleme, vy jen inkasujete.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl bg-slate-950 p-6 shadow-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs text-slate-400 font-mono">heureka-feed.xml — živá ukázka</span>
              </div>
              <pre className="text-[11px] sm:text-xs leading-relaxed font-mono text-emerald-300 whitespace-pre-wrap">{`<?xml version="1.0" encoding="UTF-8"?>
<SHOP>
  <SHOPITEM>
    <ITEM_ID>1791349</ITEM_ID>
    <PRODUCTNAME>
      Tommy Hilfiger Decker
    </PRODUCTNAME>
    <EAN>7613272348034</EAN>
    <PRICE_VAT>4475</PRICE_VAT>
    <STOCK_QUANTITY>14</STOCK_QUANTITY>
    <CATEGORY>Hodinky</CATEGORY>
    <MANUFACTURER>
      Tommy Hilfiger
    </MANUFACTURER>
    <!-- aktualizováno: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} -->
  </SHOPITEM>
  <!-- + 2 999 dalších produktů... -->
</SHOP>`}</pre>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Feed je živý · automatická aktualizace každé 2 hodiny
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 7. Features ─── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Co vše dostanete</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                Vše, co váš e-shop potřebuje
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                swelt.feed není jen XML soubor. Je to živé datové propojení, které pracuje za vás 24 hodin denně.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 60}>
                <div className="rounded-2xl border border-border bg-white p-6 hover:border-primary/40 hover:shadow-md transition-all group h-full">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. Dropshipping cross-sell ─── */}
      <section className="py-16 px-4 bg-gradient-to-br from-indigo-600 to-blue-700">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">Chcete jít ještě dál?</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-white mb-4">
                swelt.dropshipping: žádný sklad, žádná logistika
              </h2>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
                S feedem stále musíte zboží nakoupit a skladovat. Se swelt.dropshipping to odpadá úplně. Zákazník objedná → vy přepošlete objednávku → my zboží zabalíme a odešleme přímo zákazníkovi pod vaším jménem.
              </p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icon: ShoppingCart, title: 'Zákazník objedná u vás', desc: 'Zákazník nakoupí na vašem e-shopu jako obvykle — netuší, že zásilku připravujeme my.' },
              { icon: Zap,          title: 'My vyřídíme vše ostatní', desc: 'Zboží zabalíme, přiložíme dokumenty a odešleme kurýrem (FedEx, DHL, UPS) přímo zákazníkovi.' },
              { icon: TrendingUp,   title: 'Vy jen fakturujete', desc: 'Dostanete jeden souhrnný B2B doklad místo desítek faktur. Žádné zásoby, žádný sklad, čistý zisk.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="rounded-2xl bg-white/10 border border-white/20 p-5 text-white">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">{title}</h3>
                  <p className="text-sm text-blue-100 leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300}>
            <div className="text-center">
              <Button
                size="lg"
                className="bg-white text-indigo-700 hover:bg-white/95 px-8 gap-2 font-bold text-base shadow-xl"
                onClick={() => navigate('/dropshipping')}
              >
                Zjistit víc o swelt.dropshipping
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 9. Pricing ─── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Ceník</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                Jasné ceny. Žádné překvapení.
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Platíte jen za feed. Žádná provize z prodeje, žádná smlouva. Zrušit můžete kdykoliv.
              </p>

              <div className="inline-flex items-center gap-1 bg-muted rounded-xl p-1 border border-border">
                <button
                  onClick={() => setBillingCycle('quarterly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'quarterly' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Čtvrtletně
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Ročně
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">−20 %</span>
                </button>
              </div>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 80}>
                <div className={`rounded-2xl border p-6 flex flex-col h-full transition-all ${plan.featured ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10 ring-2 ring-primary/20' : 'border-border bg-white hover:border-primary/40 hover:shadow-md'}`}>
                  {plan.badge && (
                    <div className="mb-3">
                      <Badge className={plan.featured ? 'bg-primary text-white border-primary' : 'bg-muted text-muted-foreground border-border'}>
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <h3 className={`font-display text-xl font-black mb-1 ${plan.featured ? 'text-primary' : 'text-foreground'}`}>{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{plan.subtitle}</p>

                  <div className="mb-5">
                    {plan.monthly > 0 ? (
                      <>
                        <span className="text-3xl font-black text-foreground">{plan.monthly.toLocaleString('cs')}</span>
                        <span className="text-muted-foreground text-sm ml-1">Kč / měs</span>
                        {billingCycle === 'yearly' && (
                          <div className="text-xs text-emerald-600 mt-1">Ušetříte {(plan.monthly * 12 * 0.2).toLocaleString('cs')} Kč ročně</div>
                        )}
                      </>
                    ) : (
                      <span className="text-xl font-bold text-foreground">Individuální cena</span>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                    {plan.missing.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <X className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground/60 line-through">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.featured ? 'default' : 'outline'}
                    className="w-full font-semibold"
                    onClick={() => navigate('/register')}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={300}>
            <div className="mt-8 rounded-2xl bg-blue-50 border border-blue-200 p-5 text-center">
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong>Chcete jít ještě dál bez skladu?</strong> swelt.dropshipping funguje bez měsíčního paušálu za feed — platíte jen za to, co skutečně prodáte.{' '}
                <button className="font-bold underline hover:no-underline" onClick={() => navigate('/dropshipping')}>Zjistit víc →</button>
              </p>
            </div>
          </Reveal>

          <Reveal delay={350}>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Všechny ceny jsou bez DPH. První měsíc zdarma — žádná karta potřeba.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── 10. FAQ ─── */}
      <section className="py-20 px-4 bg-muted/40">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Časté dotazy</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground">
                Máte otázky? Tady jsou odpovědi.
              </h2>
              <p className="text-muted-foreground mt-3 max-w-md mx-auto">
                Pokud tu odpověď nenajdete, napište nám — odpovíme do hodiny.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-2xl border border-border bg-white shadow-sm px-6 divide-y divide-border">
              {FAQS.map((faq, i) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} defaultOpen={i === 0} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 11. CTA bottom ─── */}
      <section className="py-20 px-4 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-white text-sm font-semibold mb-6">
              <Star className="h-4 w-4 text-yellow-300" />
              15+ let ZAGO na trhu · autorizovaný distributor
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              Přidejte prémiové produkty<br />do svého e-shopu ještě dnes.
            </h2>
            <p className="text-blue-100 text-lg mb-3 max-w-xl mx-auto leading-relaxed">
              První feed připravíme zdarma. Žádná karta, žádný závazek. Spuštění do 48 hodin.
            </p>
            <p className="text-blue-200 text-sm mb-8 max-w-lg mx-auto">
              Nebo rovnou vyzkoušejte <strong className="text-white">swelt.dropshipping</strong> — bez skladu, bez nákupu, bez logistiky.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/95 px-8 gap-2 font-bold text-base shadow-xl"
                onClick={() => navigate('/register')}
              >
                Spustit swelt.feed
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 px-8 gap-2 font-semibold text-base"
                onClick={() => navigate('/dropshipping')}
              >
                <Package className="h-4 w-4" />
                Zkusit dropshipping
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 12. Trust footer strip ─── */}
      <section className="border-t border-border bg-white py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            { icon: Star,        label: '15+ let ZAGO na trhu' },
            { icon: Shield,      label: 'Autorizovaný distributor' },
            { icon: CheckCircle, label: 'GDPR' },
            { icon: Link,        label: 'Šifrované připojení' },
            { icon: Users,       label: 'FedEx · DHL · UPS logistika' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Icon className="h-3.5 w-3.5 text-primary" />
              {label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
