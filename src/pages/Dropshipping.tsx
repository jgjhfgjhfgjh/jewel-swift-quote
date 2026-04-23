import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, PackageOpen, Truck, Tag, Zap, Users, ShieldCheck,
  HeadphonesIcon, BarChart2, Check, ChevronDown, TrendingUp,
  Store, Globe, Sparkles, Calculator, RefreshCw, AlertCircle,
  ArrowUpRight, Layers, Bell, Target, Lock, FileText,
  Camera, Award, MapPin, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { useWishlist } from '@/hooks/useWishlist';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import bgDrop from '@/assets/gateway-dropshipping.jpg';
import heroLight from '@/assets/intel-hero-light.jpg';

/* ─── JSON-LD SEO injection ─── */
function SeoHead() {
  useEffect(() => {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Co je dropshipping a jak funguje?', acceptedAnswer: { '@type': 'Answer', text: 'Dropshipping je model prodeje, kde zákazník nakoupí ve tvém e-shopu, ale zboží mu odesíláme přímo my — pod tvou značkou. Ty nepotřebuješ sklad ani kapitál v zásobách.' } },
        { '@type': 'Question', name: 'Potřebuji IČO nebo živnostenský list?', acceptedAnswer: { '@type': 'Answer', text: 'Ano, dropshipping je podnikatelská činnost. Potřebuješ platné IČO nebo živnostenský list.' } },
        { '@type': 'Question', name: 'Zákazník uvidí, že zásilku posílá swelt.partner?', acceptedAnswer: { '@type': 'Answer', text: 'Ne. Na zásilce je tvoje faktura, tvůj název, tvoje logo. My nikde nefigurujeme — white-label od prvního dne.' } },
        { '@type': 'Question', name: 'Jak rychle jsou zásilky odesílány?', acceptedAnswer: { '@type': 'Answer', text: 'Express do 24 h (>99,5 % spolehlivost), Standard do 48 h (~97 %), Economy do 72 h. Každá zásilka je sledovatelná online.' } },
        { '@type': 'Question', name: 'Jaká je minimální objednávka?', acceptedAnswer: { '@type': 'Answer', text: 'Žádná. Posíláme i jeden kus na jednoho zákazníka — platíš až po objednávce zákazníka.' } },
        { '@type': 'Question', name: 'Mohu dropshippovat do zahraničí?', acceptedAnswer: { '@type': 'Answer', text: 'Ano, dodáváme do celé EU. Feed je dostupný v češtině, slovenštině, angličtině a němčině. Primárně ČR a SK, expanze DE/AT na dotaz.' } },
        { '@type': 'Question', name: 'Co je swelt.signal?', acceptedAnswer: { '@type': 'Answer', text: 'swelt.signal je AI modul, který sleduje trending produkty napříč naší distribucí a každý týden ti posílá přehled: co přidat do feedu, co odebrat a co roste.' } },
        { '@type': 'Question', name: 'Jak funguje real-time inventory lock?', acceptedAnswer: { '@type': 'Answer', text: 'Jakmile zákazník dokončí objednávku, zásoby se okamžitě uzamknou v systému. Eliminuje riziko přeprodeji a negativní zákaznickou zkušenost.' } },
        { '@type': 'Question', name: 'Jak funguje consolidated B2B invoicing?', acceptedAnswer: { '@type': 'Answer', text: 'Všechny tvoje B2C objednávky za měsíc se sloučí do jediné přehledné B2B faktury od nás. Méně administrativy, snadnější účetnictví.' } },
        { '@type': 'Question', name: 'Co se stane, pokud zákazník chce vrátit zboží?', acceptedAnswer: { '@type': 'Answer', text: 'Zákazník pošle zboží tobě, ty nás kontaktuješ do 48 h, my to řešíme s dodavatelem a ty dostaneš náhradu nebo kredit. Máme i buyback option na pomaloobrátové zásoby.' } },
        { '@type': 'Question', name: 'Mám API přístup?', acceptedAnswer: { '@type': 'Answer', text: 'Ano — Silver a Gold plány zahrnují plný API přístup (XML, CSV, JSON, REST API) pro automatickou synchronizaci objednávek a zásob.' } },
        { '@type': 'Question', name: 'Jak funguje triple quality check?', acceptedAnswer: { '@type': 'Answer', text: 'Kontrolujeme zboží třikrát: při příjmu od výrobce, před balením (funkčnost a estetika) a fotodokumentace zásilky. Méně reklamací pro tebe.' } },
        { '@type': 'Question', name: 'Mohu kombinovat dropshipping s vlastním skladem?', acceptedAnswer: { '@type': 'Answer', text: 'Ano, mnoho partnerů to dělá. Prodáváš ze svého skladu i z našeho — zákazník nerozezná rozdíl.' } },
        { '@type': 'Question', name: 'Jak funguje swelt.launch onboarding?', acceptedAnswer: { '@type': 'Answer', text: 'Nový partner dostane 30denní guided onboarding s account managerem: nastavení feedu, výběr prvních produktů, podpora s první kampaní. Garantujeme první objednávku do 30 dní nebo prodloužíme trial zdarma.' } },
      ],
    };

    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'swelt.partner Dropshipping',
      description: 'Kompletní dropshipping řešení pro české a slovenské e-shopy. Prémiové hodinky, šperky a módní doplňky — 70+ značek, white-label, real-time synchronizace, swelt.signal AI.',
      provider: { '@type': 'Organization', name: 'swelt.partner', url: 'https://swelt.partner' },
      areaServed: [
        { '@type': 'Country', name: 'CZ' },
        { '@type': 'Country', name: 'SK' },
        { '@type': 'Country', name: 'DE' },
        { '@type': 'Country', name: 'AT' },
      ],
      availableLanguage: ['cs', 'sk', 'en', 'de'],
      offers: [
        { '@type': 'Offer', name: 'Starter', price: '1490', priceCurrency: 'CZK' },
        { '@type': 'Offer', name: 'Silver', price: '2490', priceCurrency: 'CZK' },
      ],
    };

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'swelt.partner', item: 'https://swelt.partner' },
        { '@type': 'ListItem', position: 2, name: 'Dropshipping', item: 'https://swelt.partner/dropshipping' },
      ],
    };

    [faqSchema, serviceSchema, breadcrumb].forEach((schema, i) => {
      const id = `ld-json-drop-${i}`;
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
      [0, 1, 2].forEach(i => document.getElementById(`ld-json-drop-${i}`)?.remove());
    };
  }, []);

  return null;
}

/* ─── Utility hooks ─── */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function CountUp({ to, duration = 1400, suffix = '', prefix = '' }: { to: number; duration?: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useReveal<HTMLSpanElement>();
  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, to, duration]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
      {children}
    </div>
  );
}

/* ─── Data ─── */
const painPoints = [
  { problem: 'Nemám peníze na naskladnění', icon: AlertCircle, title: 'Platíš až po prodeji', text: 'Zákazník zaplatí tobě. Ty zaplatíš nám. Nulová investice do zásob — žádné zmrazené peníze v regálech.' },
  { problem: 'Nevím jak řešit logistiku', icon: Truck, title: 'O expedici se staráme my', text: 'Balíme, kontrolujeme, odesíláme. Pod tvou fakturou. Zákazník vidí tebe — ne nás. Trojí quality check na každé zásilce.' },
  { problem: 'Bojím se špatně zvolit produkty', icon: Target, title: 'swelt.signal ti poradí', text: 'AI modul sleduje trendy napříč distribucí. Každý týden dostaneš top 10 trending produktů pro tvůj segment — přestaneš hádat.' },
  { problem: 'Bojím se přeprodat zákazníkovi', icon: Lock, title: 'Real-time inventory lock', text: 'Jakmile zákazník nakoupí, zásoby se okamžitě uzamknou v systému. Žádné "promiňte, zboží se vyprodalo po zaplacení."' },
];

const steps = [
  { num: 1, title: 'Registrace zdarma', text: 'Vytvoříš B2B účet. Schválení do 24 hodin v pracovní dny. Stačí IČO — žádné dokumenty předem.', icon: Users },
  { num: 2, title: 'Stáhneš produktový feed', text: 'XML, CSV nebo real-time API. Fotky, popisy, ceny, skladovost — vše automaticky. Do Shoptetu v 1 klik.', icon: Layers },
  { num: 3, title: 'Zákazník nakoupí u tebe', text: 'Nastavíš vlastní cenu a marži. Zákazník platí přímo tobě. Ty si necháš rozdíl — my dostaneme velkoobchodní cenu.', icon: Store },
  { num: 4, title: 'Předáš nám objednávku', text: 'Přes platformu, API nebo XML export. Zásilku zabalíme pod tvou hlavičkou a odešleme kuriérem.', icon: PackageOpen },
  { num: 5, title: 'Zákazník dostane balíček', text: 'Doručení do 24–72 h. Tracking číslo automaticky. Zákazník nikdy nezjistí, kdo zásilku připravil.', icon: Truck },
];

const usps = [
  { icon: Tag, title: '70+ prémiových značek', text: 'Světové značky, které zákazníci znají a chtějí koupit.' },
  { icon: Truck, title: 'Expedice do 24–72 hodin', text: 'Sklad v ČR, tři rychlostní pásma, spolehlivé doručení.' },
  { icon: Zap, title: 'Shoptet API v 1 klik', text: 'Přímá integrace s nejrozšířenější českou platformou.' },
  { icon: Lock, title: 'Real-time inventory lock', text: 'Zásoby uzamčeny v momentě objednávky. Žádný přeprodej.' },
  { icon: ShieldCheck, title: 'Trojí quality check', text: 'Kontrola při příjmu, před odesláním a fotodokumentace.' },
  { icon: RefreshCw, title: 'Aktuální XML/CSV/API feed', text: 'Real-time nebo 4× denně — vždy aktuální ceny a sklad.' },
  { icon: FileText, title: 'Consolidated B2B invoicing', text: 'Všechny B2C objednávky = 1 přehledná faktura měsíčně.' },
  { icon: Award, title: 'Bílý štítek od prvního dne', text: 'Zákazník nikdy neuvidí, že zásilku posílá swelt.partner.' },
  { icon: HeadphonesIcon, title: 'Osobní account manager', text: 'Skutečný člověk — ne bot, ne ticketovací systém.' },
  { icon: Globe, title: 'EU expanze: ČR, SK, DE, AT', text: 'Jeden feed, čtyři trhy. Lokalizovaný v cs/sk/en/de.' },
];

const platforms = [
  { name: 'Shoptet', detail: 'Přímá API integrace. Synchronizace produktů, cen a skladovosti jedním klikem. Nejrychlejší nastavení na CZ trhu.', tag: '#1 v ČR', time: '~15 min' },
  { name: 'WooCommerce', detail: 'WordPress plugin s XML feedem. Automatická aktualizace. Plná kontrola nad designem produktových stránek.', tag: 'Open source', time: '~30 min' },
  { name: 'Upgates', detail: 'CSV a XML import s plnou kompatibilitou. Automatická synchronizace cen a zásob.', tag: '', time: '~20 min' },
  { name: 'Eshop-rychle', detail: 'Nativní podpora produktového feedu. Rychlé nastavení bez technických znalostí.', tag: '', time: '~20 min' },
  { name: 'Shopify', detail: 'Ideální pro SK/DE/AT expanzi. Vícejazyčný feed, mezinárodní platební brány.', tag: 'EU expanze', time: '~45 min' },
  { name: 'PrestaShop', detail: 'XML feed a REST API přístup. Podpora verzí 1.6, 1.7 i novějších. Custom module na dotaz.', tag: '', time: '~30 min' },
  { name: 'REST API', detail: 'Plný programátorský přístup. JSON format, real-time synchronizace, vlastní integrace na libovolnou platformu.', tag: 'Pro devs', time: 'Custom' },
];

const faqs = [
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
];

const tiers = [
  {
    name: 'Starter', subtitle: 'Pro první kroky\na testování trhu',
    monthlyPrice: 1490, quarterlyPrice: 1192, priceNote: 'Kč / měsíc bez DPH',
    cta: 'Začít zdarma na 14 dní', ctaVariant: 'outline' as const, featured: false,
    badge: '',
    features: ['500 produktů — základní katalog', '1× denní aktualizace feedu', 'Expedice do 72 hodin', 'E-mailová podpora', 'swelt.launch onboarding'],
    missing: ['Bílý štítek', 'Shoptet API', 'swelt.signal', 'Real-time inventory lock'],
  },
  {
    name: 'Silver', subtitle: 'Pro rostoucí e-shopy\nco to myslí vážně',
    monthlyPrice: 2490, quarterlyPrice: 1992, priceNote: 'Kč / měsíc bez DPH',
    cta: 'Aktivovat Silver →', ctaVariant: 'default' as const, featured: true,
    badge: 'Nejoblíbenější',
    features: ['Celý katalog 3 000+ produktů', 'Real-time API + 4× denně XML/CSV', 'Expedice do 24–48 hodin', 'Bílý štítek — tvoje faktura + logo', 'Shoptet / WooCommerce API', 'Real-time inventory lock', 'Consolidated B2B invoicing', 'Telefonická + chat podpora', 'swelt.signal Lite — weekly digest', 'swelt.launch onboarding', 'Refund kreditem při obratu 50 000 Kč/měsíc'],
    missing: [],
  },
  {
    name: 'Gold', subtitle: 'Pro profesionální e-shopy\na EU expanzi',
    monthlyPrice: 0, quarterlyPrice: 0, priceNote: 'individuální nabídka',
    cta: 'Získat nabídku', ctaVariant: 'outline' as const, featured: false,
    badge: 'Enterprise',
    features: ['Vše ze Silver', 'Dedikovaný account manager', 'swelt.signal Pro — real-time + API', 'Prioritní vyřízení do 4 hodin', 'EU expanze SK/DE/AT — lokalizace', 'Triple quality check + fotodokumentace', 'Buyback option na slow-movers', 'Vlastní produktové fotky na vyžádání', 'SLA delivery záruka', 'Custom API integrace'],
    missing: [],
  },
];

const signalProducts = [
  { sku: 'SKU-7712', name: 'Citizen Eco-Drive BM7455', trend: 92, change: '+28%', action: 'Přidat do feedu', actionTone: 'success' },
  { sku: 'SKU-3301', name: 'Seiko Presage SRPE35', trend: 76, change: '+14%', action: 'Sledovat', actionTone: 'accent' },
  { sku: 'SKU-9014', name: 'Police Menelik PEWJG', trend: 61, change: '+6%', action: 'Sledovat', actionTone: 'accent' },
  { sku: 'SKU-2208', name: 'Versace V-Chronos VE5A', trend: 28, change: '−11%', action: 'Odebrat z feedu', actionTone: 'destructive' },
];

const logisticsZones = [
  { zone: 'Česká republika', time: 'do 24 h', reliability: '99.5 %', couriers: 'DHL, DPD, GLS', color: 'emerald' },
  { zone: 'Slovensko', time: 'do 48 h', reliability: '97 %', couriers: 'DPD, GLS', color: 'blue' },
  { zone: 'Německo & Rakousko', time: 'do 72 h', reliability: '96 %', couriers: 'DHL Express', color: 'violet' },
  { zone: 'Zbytek EU', time: 'na dotaz', reliability: '95 %+', couriers: 'DHL, FedEx, UPS', color: 'slate' },
];

/* ─── Margin Calculator ─── */
function MarginCalculator() {
  const [buyPrice, setBuyPrice] = useState(800);
  const [sellPrice, setSellPrice] = useState(1400);
  const [orders, setOrders] = useState(30);

  const margin = sellPrice - buyPrice;
  const marginPct = sellPrice > 0 ? ((margin / sellPrice) * 100).toFixed(1) : '0.0';
  const monthlyProfit = margin * orders;
  const yearlyProfit = monthlyProfit * 12;
  const positive = margin >= 0;

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      <div className="space-y-8">
        {[
          { label: 'Nákupní cena (Kč)', value: buyPrice, set: setBuyPrice, min: 100, max: 5000, step: 50 },
          { label: 'Prodejní cena (Kč)', value: sellPrice, set: setSellPrice, min: 100, max: 8000, step: 50 },
          { label: 'Objednávky za měsíc', value: orders, set: setOrders, min: 1, max: 500, step: 1, suffix: ' ks' },
        ].map(({ label, value, set, min, max, step, suffix }) => (
          <div key={label}>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">{label}</label>
              <span className="font-semibold text-primary tabular-nums">{value.toLocaleString('cs')}{suffix ?? ' Kč'}</span>
            </div>
            <Slider value={[value]} onValueChange={([v]) => set(v)} min={min} max={max} step={step} />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
              <span>{min.toLocaleString('cs')}{suffix ?? ' Kč'}</span>
              <span>{max.toLocaleString('cs')}{suffix ?? ' Kč'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 space-y-4">
        <div className="text-[11px] tracking-[0.2em] uppercase text-primary font-semibold">Výsledek kalkulace</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-border">
            <div className="text-xs text-muted-foreground mb-1">Marže na kus</div>
            <div className={`font-display text-2xl font-bold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>{margin.toLocaleString('cs')} Kč</div>
            <div className="text-xs text-muted-foreground">{marginPct} %</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm border border-border">
            <div className="text-xs text-muted-foreground mb-1">Měsíční zisk</div>
            <div className={`font-display text-2xl font-bold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>{monthlyProfit.toLocaleString('cs')} Kč</div>
            <div className="text-xs text-muted-foreground">{orders} obj.</div>
          </div>
        </div>
        <div className="rounded-xl bg-primary text-primary-foreground p-5 shadow-md">
          <div className="text-xs opacity-80 mb-1">Roční potenciál</div>
          <div className="font-display text-4xl font-bold">{yearlyProfit.toLocaleString('cs')} Kč</div>
          <div className="text-xs opacity-70 mt-1">při {orders} objednávkách měsíčně</div>
        </div>
        <p className="text-xs text-muted-foreground">* Kalkulace je orientační, nezohledňuje náklady na reklamu, platformu ani platební brány.</p>
      </div>
    </div>
  );
}

/* ─── FAQ Item ─── */
function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left gap-4 hover:text-primary transition-colors">
        <span className="font-medium text-sm sm:text-base">{q}</span>
        <ChevronDown className={`h-5 w-5 text-primary shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ─── Floating social proof ─── */
function FloatingNotif() {
  const notifs = [
    { name: 'Jan K.', city: 'Praha', action: 'se zaregistroval' },
    { name: 'Tereza M.', city: 'Brno', action: 'aktivoval Silver plán' },
    { name: 'Ondřej P.', city: 'Ostrava', action: 'spustil první feed' },
    { name: 'Lucie V.', city: 'Plzeň', action: 'přidal 120 produktů' },
    { name: 'Martin S.', city: 'Bratislava', action: 'expandoval na SK' },
  ];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => { setVisible(true); setTimeout(() => setVisible(false), 4500); };
    const interval = setInterval(() => {
      setIdx(i => (i + 1) % notifs.length);
      show();
    }, 10000);
    const t = setTimeout(show, 3500);
    return () => { clearInterval(interval); clearTimeout(t); };
  }, []);

  return (
    <div className={`fixed bottom-20 left-4 z-50 transition-all duration-500 lg:bottom-6 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white shadow-xl px-4 py-3 max-w-xs">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="text-xs font-semibold">{notifs[idx].name} z {notifs[idx].city}</div>
          <div className="text-[11px] text-muted-foreground">{notifs[idx].action} · právě teď</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
const Dropshipping = () => {
  const navigate = useNavigate();
  const { wishlistIds } = useWishlist();
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly'>('monthly');
  const [activePlatform, setActivePlatform] = useState(0);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [faqLimit, setFaqLimit] = useState(6);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div
      className="relative flex min-h-screen flex-col pb-16 lg:pb-0 bg-background text-foreground"
      style={{
        ['--background' as any]: '220 30% 98%',
        ['--foreground' as any]: '220 20% 10%',
        ['--card' as any]: '0 0% 100%',
        ['--card-foreground' as any]: '220 20% 10%',
        ['--muted' as any]: '220 20% 95%',
        ['--muted-foreground' as any]: '220 10% 50%',
        ['--border' as any]: '220 20% 88%',
        ['--primary' as any]: '220 80% 50%',
        ['--primary-foreground' as any]: '0 0% 100%',
        ['--accent' as any]: '220 80% 50%',
        ['--accent-foreground' as any]: '0 0% 100%',
      }}
    >
      <SeoHead />
      <Navbar wishlistCount={wishlistIds.size} onOpenWishlist={() => setWishlistOpen(true)} />
      <FloatingNotif />

      <main className="flex-1 pt-14">

        {/* ══ HERO ══ */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 pointer-events-none">
            <img src={bgDrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.07]" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          </div>

          <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
                <PackageOpen className="h-3.5 w-3.5" />
                swelt.dropshipping — E-shop bez skladu
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
                Prodávej prémiové<br />produkty <span className="italic text-primary">bez skladu.</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Vyber si z 3 000+ produktů od 70+ světových značek. My je zabalíme, zkontrolujeme a odešleme
                pod tvou značkou do 24–72 hodin. Real-time inventory lock zabrání přeprodeji. swelt.signal ti
                každý týden řekne, co teď zákazníci chtějí.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                {[{ n: 15, s: '+', l: 'let na trhu' }, { n: 70, s: '+', l: 'značek' }, { n: 500, s: '+', l: 'aktivních partnerů' }].map(({ n, s, l }) => (
                  <div key={l}>
                    <div className="font-display text-3xl font-bold text-primary"><CountUp to={n} suffix={s} /></div>
                    <div className="text-[11px] text-muted-foreground mt-1">{l}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => navigate('/register')} className="shadow-md">
                  Začít dropshipping zdarma <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#jak-to-funguje">Jak to funguje? ↓</a>
                </Button>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {['Bez závazků', 'Bez kreditní karty', 'Schválení do 24 h'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />{t}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Live signal hero card */}
            <Reveal delay={200}>
              <div className="relative rounded-2xl border border-border bg-white shadow-2xl p-6 max-w-md ml-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] tracking-[0.2em] uppercase text-primary font-semibold">swelt.signal — Trending now</div>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="space-y-3">
                  {signalProducts.map((p) => {
                    const tc = p.actionTone === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      p.actionTone === 'destructive' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200';
                    const bc = p.actionTone === 'success' ? '#10b981' : p.actionTone === 'destructive' ? '#ef4444' : 'hsl(220 80% 50%)';
                    return (
                      <div key={p.sku} className="rounded-xl border border-border p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="text-[10px] text-muted-foreground">{p.sku}</div>
                            <div className="text-sm font-medium leading-snug">{p.name}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold" style={{ color: bc }}>{p.change}</div>
                            <span className={`text-[10px] border rounded px-1.5 py-0.5 font-medium ${tc}`}>{p.action}</span>
                          </div>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${p.trend}%`, background: bc }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>Aktualizováno dnes v 09:00</span>
                  <button className="text-primary font-medium hover:underline flex items-center gap-1">
                    Zobrazit vše <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ PAIN → SOLUTION ══ */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-[11px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">Poznáš se v tom?</div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">Čtyři překážky, které řešíme za tebe</h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {painPoints.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} delay={i * 80}>
                  <div className="group h-full rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary/30 transition-all">
                    <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-100 px-3 py-1 text-xs text-red-600 font-medium mb-5">
                      <Icon className="h-3.5 w-3.5" /> {p.problem}
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section id="jak-to-funguje" className="border-y border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="text-center max-w-2xl mx-auto mb-14">
              <div className="text-[11px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">Jak to funguje</div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">Od registrace k první objednávce za 48 hodin</h2>
              <p className="mt-3 text-muted-foreground">Stačí 5 kroků. Klikni na krok pro detail.</p>
            </Reveal>

            <div className="relative">
              <div className="hidden lg:block absolute top-[52px] left-[calc(10%+24px)] right-[calc(10%+24px)] h-px bg-border z-0" />
              <div className="grid gap-4 sm:grid-cols-5 relative z-10">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  const isActive = activeStep === i;
                  return (
                    <Reveal key={s.num} delay={i * 80}>
                      <button onClick={() => setActiveStep(isActive ? null : i)} className="w-full text-left group">
                        <div className={`rounded-2xl border p-5 transition-all duration-300 cursor-pointer
                          ${isActive ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-[1.02]' : 'border-border bg-white hover:border-primary/40 hover:shadow-md'}`}>
                          <div className={`flex items-center justify-center h-10 w-10 rounded-full mb-4 font-display font-semibold text-sm transition-colors
                            ${isActive ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>{s.num}</div>
                          <Icon className={`h-5 w-5 mb-3 ${isActive ? 'text-white/80' : 'text-primary'}`} />
                          <h3 className={`font-semibold text-sm mb-2 ${isActive ? 'text-white' : ''}`}>{s.title}</h3>
                          <p className={`text-xs leading-relaxed ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>{s.text}</p>
                        </div>
                      </button>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ══ SWELT.SIGNAL ══ */}
        <section id="signal" className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-primary/8 overflow-hidden">
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-0">
              <div className="p-10 lg:p-14">
                <Reveal>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary mb-6">
                    <Sparkles className="h-3.5 w-3.5" /> Nová služba — swelt.signal
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">
                    Prodávej s daty v ruce,<br /><span className="italic text-primary">ne s pocitem v žaludku.</span>
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-8">
                    swelt.signal je dropshippingová verze naší B2B intelligence služby. Sleduje pohyb produktů napříč
                    celou distribucí a každý týden ti doporučí, co přidat nebo odebrat z feedu — bez nutnosti sledovat
                    konkurenci ručně nebo interpretovat složité grafy.
                  </p>
                  <div className="space-y-4 mb-8">
                    {[
                      { icon: TrendingUp, title: 'Top 10 trending produktů každý týden', text: 'Ve tvém segmentu, dřív než je uvidí konkurence.' },
                      { icon: Bell, title: 'Early warning — klesající zájem', text: 'Odeber produkt z feedu dřív, než zákazníci přestanou kupovat.' },
                      { icon: BarChart2, title: 'Benchmark vůči ostatním partnerům', text: 'Anonymní srovnání — víš kde vedeš a kde ztrácíš.' },
                      { icon: Globe, title: 'EU expansion radar (Signal Pro)', text: 'Trendy v SK, DE, AT — vstup na trh dřív než ostatní.' },
                    ].map((f, i) => {
                      const Icon = f.icon;
                      return (
                        <Reveal key={f.title} delay={i * 70}>
                          <div className="flex gap-3">
                            <div className="shrink-0 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{f.title}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{f.text}</div>
                            </div>
                          </div>
                        </Reveal>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => navigate('/intelligence')}>
                      Zjistit více o swelt.intelligence <ArrowUpRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/register')}>
                      Vyzkoušet v Silver plánu
                    </Button>
                  </div>
                </Reveal>
              </div>

              {/* Signal live panel */}
              <div className="border-l border-primary/10 bg-white/60 p-10 lg:p-14 flex flex-col justify-center">
                <Reveal delay={150}>
                  <div className="rounded-2xl border border-border bg-white shadow-lg p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="text-[10px] tracking-[0.2em] uppercase text-primary font-semibold">Týdenní digest</div>
                        <div className="text-xs text-muted-foreground">Týden 17 · 2026</div>
                      </div>
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="space-y-3 mb-5">
                      {signalProducts.map((p) => {
                        const tc = p.actionTone === 'success' ? 'text-emerald-600' : p.actionTone === 'destructive' ? 'text-red-500' : 'text-blue-600';
                        const bc = p.actionTone === 'success' ? 'bg-emerald-500' : p.actionTone === 'destructive' ? 'bg-red-400' : 'bg-primary';
                        return (
                          <div key={p.sku} className="flex items-center gap-3">
                            <div className="w-28 shrink-0">
                              <div className="text-xs font-medium truncate">{p.name.split(' ').slice(0, 2).join(' ')}</div>
                              <div className="text-[10px] text-muted-foreground">{p.sku}</div>
                            </div>
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${bc}`} style={{ width: `${p.trend}%` }} />
                            </div>
                            <div className={`text-xs font-bold w-12 text-right ${tc}`}>{p.change}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="rounded-xl bg-primary/5 border border-primary/15 p-4">
                      <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-2">AI doporučení tohoto týdne</div>
                      <ul className="space-y-1.5">
                        {['Přidej Citizen Eco-Drive — trend +28 % MoM', 'Odeber Versace V-Chronos — klesá 3 týdny v řadě', 'Sleduj Seiko Presage — stabilní růst, dobré timing'].map(r => (
                          <li key={r} className="flex items-start gap-1.5 text-xs">
                            <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ══ LOGISTIKA & KVALITA (nové) ══ */}
        <section id="logistika" className="border-y border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="text-center max-w-2xl mx-auto mb-14">
              <div className="text-[11px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">Spolehlivost</div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">Spolehlivost, na které záleží tvým zákazníkům</h2>
              <p className="mt-4 text-muted-foreground">Transparentní logistika. Žádné překvapení.</p>
            </Reveal>

            <div className="grid lg:grid-cols-2 gap-10 mb-14">
              {/* Shipping zones */}
              <Reveal>
                <div className="rounded-2xl border border-border bg-white shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Doručovací zóny</h3>
                  </div>
                  <div className="space-y-3">
                    {logisticsZones.map((z) => (
                      <div key={z.zone} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">{z.zone}</div>
                          <div className="text-xs text-muted-foreground">{z.couriers}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-foreground">{z.time}</div>
                          <div className="text-xs text-emerald-600">{z.reliability}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Quality check */}
              <Reveal delay={100}>
                <div className="rounded-2xl border border-border bg-white shadow-sm p-6 h-full">
                  <div className="flex items-center gap-2 mb-5">
                    <Camera className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Trojí quality check</h3>
                  </div>
                  <ol className="space-y-5">
                    {[
                      { n: '01', title: 'Kontrola při příjmu', text: 'Každý produkt projde vizuální kontrolou při příjmu od výrobce. Poškozené zboží vrátíme okamžitě.' },
                      { n: '02', title: 'Kontrola před balením', text: 'Funkčnost, estetika, kompletnost. Baterie zkontrolovány. Výsledek: méně reklamací v tvém e-shopu.' },
                      { n: '03', title: 'Fotodokumentace zásilky', text: 'Každá zásilka vyfotografována před odesláním. V případě sporu máš důkaz — okamžitě.' },
                    ].map(s => (
                      <li key={s.n} className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">{s.n}</div>
                        <div>
                          <div className="font-semibold text-sm">{s.title}</div>
                          <div className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.text}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            </div>

            {/* Consolidated invoicing + inventory lock callouts */}
            <div className="grid sm:grid-cols-2 gap-6">
              <Reveal>
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Consolidated B2B invoicing</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Všechny tvoje B2C objednávky za měsíc = <strong className="text-foreground">1 přehledná faktura</strong> od nás. Snadnější účetnictví,
                    méně administrativy, čistší cash flow. PDF + strojově čitelný export.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Real-time inventory lock</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Zásoby se <strong className="text-foreground">uzamknou v momentě objednávky</strong> zákazníka. Žádný přeprodej, žádné "promiňte, vyprodáno
                    po zaplacení." Zákaznická zkušenost bez kompromisů.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══ MARGIN CALCULATOR ══ */}
        <section id="kalkulator" className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-[11px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">Kalkulačka marže</div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">Kolik můžeš vydělat?</h2>
            <p className="mt-4 text-muted-foreground">Nastav ceny a počet objednávek — kalkulačka ukáže tvůj potenciál.</p>
          </Reveal>
          <Reveal>
            <div className="rounded-2xl border border-border bg-white shadow-sm p-8 sm:p-10">
              <MarginCalculator />
            </div>
          </Reveal>
        </section>

        {/* ══ USP GRID ══ */}
        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="text-center max-w-2xl mx-auto mb-14">
              <div className="text-[11px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">Proč swelt.dropshipping</div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">Nejsme jen dodavatel. Jsme tvůj byznys partner.</h2>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {usps.map((u, i) => {
                const Icon = u.icon;
                return (
                  <Reveal key={u.title} delay={(i % 5) * 60}>
                    <div className="group h-full rounded-2xl border border-border bg-white p-5 hover:-translate-y-1 hover:shadow-md hover:border-primary/30 transition-all">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                        <Icon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1.5">{u.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{u.text}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ STATS ══ */}
        <section className="bg-primary">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-primary-foreground">
              {[
                { val: 15, suffix: '+', label: 'let na trhu' },
                { val: 70, suffix: '+', label: 'prémiových značek' },
                { val: 3000, suffix: '+', label: 'produktů v katalogu' },
                { val: 500, suffix: '+', label: 'aktivních partnerů' },
              ].map((s, i) => (
                <Reveal key={s.label} delay={i * 80}>
                  <div>
                    <div className="font-display text-5xl font-bold mb-2"><CountUp to={s.val} suffix={s.suffix} /></div>
                    <div className="text-sm opacity-80">{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PLATFORM TABS ══ */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-[11px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">Integrace</div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">Funguje s platformou, kterou už máš</h2>
          </Reveal>
          <Reveal>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {platforms.map((p, i) => (
                <button key={p.name} onClick={() => setActivePlatform(i)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${activePlatform === i ? 'border-primary bg-primary text-white shadow-md' : 'border-border bg-white hover:border-primary/40'}`}>
                  {p.name}
                  {p.tag && <span className="ml-2 text-[10px] opacity-70">{p.tag}</span>}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-white p-8 max-w-lg mx-auto text-center">
              <div className="font-display text-2xl font-semibold mb-2">{platforms[activePlatform].name}</div>
              <div className="flex items-center justify-center gap-3 mb-4">
                {platforms[activePlatform].tag && (
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{platforms[activePlatform].tag}</Badge>
                )}
                <span className="text-xs text-muted-foreground">Nastavení: {platforms[activePlatform].time}</span>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">{platforms[activePlatform].detail}</p>
              <Button variant="outline" onClick={() => navigate('/register')}>
                Zjistit více o integraci <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Reveal>
        </section>

        {/* ══ EU EXPANZE (nové) ══ */}
        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="text-center max-w-2xl mx-auto mb-12">
              <div className="text-[11px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">EU expanze</div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">Začneš v ČR. Dorůsteš do celé EU.</h2>
              <p className="mt-4 text-muted-foreground">Jeden partner, jeden feed, čtyři trhy. Bez zakládání poboček nebo skladů v zahraničí.</p>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { flag: '🇨🇿', country: 'Česká republika', detail: 'Primární trh. 24 h doručení. Shoptet, WooCommerce, Upgates.', badge: 'Primární' },
                { flag: '🇸🇰', country: 'Slovensko', detail: 'Lokalizovaný SK feed. SK dopravci. Stejný account manager.', badge: 'Live' },
                { flag: '🇩🇪', country: 'Německo', detail: 'EN/DE feed. DHL Express. Na dotaz — pomůžeme nastavit.', badge: 'Na dotaz' },
                { flag: '🇦🇹', country: 'Rakousko', detail: 'EN/DE feed. DHL Express. Ideální pro Shopify e-shopy.', badge: 'Na dotaz' },
              ].map((m, i) => (
                <Reveal key={m.country} delay={i * 80}>
                  <div className="rounded-2xl border border-border bg-white p-6 text-center hover:shadow-md hover:border-primary/30 transition-all">
                    <div className="text-4xl mb-3">{m.flag}</div>
                    <div className="font-semibold mb-1">{m.country}</div>
                    <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/10 text-xs">{m.badge}</Badge>
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PRICING ══ */}
        <section id="cenik" className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-[11px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">Ceník</div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">Vyber plán pro svůj e-shop</h2>
          </Reveal>
          <Reveal className="flex justify-center mb-10">
            <div className="inline-flex rounded-xl border border-border bg-white p-1 gap-1">
              {(['monthly', 'quarterly'] as const).map(p => (
                <button key={p} onClick={() => setBillingPeriod(p)}
                  className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${billingPeriod === p ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                  {p === 'monthly' ? 'Měsíčně' : <span className="flex items-center gap-2">Čtvrtletně <span className="text-[10px] bg-emerald-500 text-white rounded px-1.5 py-0.5">−20 %</span></span>}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            {tiers.map((t, i) => {
              const price = billingPeriod === 'monthly' ? t.monthlyPrice : t.quarterlyPrice;
              return (
                <Reveal key={t.name} delay={i * 80}>
                  <div className={`relative h-full rounded-2xl border bg-white flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all ${t.featured ? 'border-primary border-2 shadow-lg' : 'border-border'}`}>
                    {t.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className={`text-white hover:opacity-90 ${t.featured ? 'bg-primary' : 'bg-slate-700'}`}>{t.badge}</Badge>
                      </div>
                    )}
                    <div className="p-8 pb-6 border-b border-border text-center">
                      <h3 className="font-display text-3xl font-semibold mb-2">{t.name}</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line min-h-[2.5rem]">{t.subtitle}</p>
                      <div className="mt-6 mb-6">
                        {t.monthlyPrice > 0 ? (
                          <>
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="font-display text-5xl font-bold">{price.toLocaleString('cs')}</span>
                              <span className="text-sm text-muted-foreground ml-1">Kč</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{t.priceNote}</p>
                          </>
                        ) : (
                          <>
                            <div className="font-display text-3xl font-semibold">Na míru</div>
                            <p className="text-xs text-muted-foreground mt-1">{t.priceNote}</p>
                          </>
                        )}
                      </div>
                      <Button variant={t.ctaVariant} className="w-full" size="lg" onClick={() => navigate('/register')}>{t.cta}</Button>
                    </div>
                    <div className="p-8 pt-6 flex-1 bg-muted/20 rounded-b-2xl">
                      {i > 0 && (
                        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                          <ArrowRight className="h-3 w-3" /> Vše z {tiers[i - 1].name}, plus…
                        </div>
                      )}
                      <ul className="space-y-2.5">
                        {t.features.map(f => (
                          <li key={f} className="flex items-start gap-2.5 text-sm">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />{f}
                          </li>
                        ))}
                        {t.missing.map(f => (
                          <li key={f} className="flex items-start gap-2.5 text-sm opacity-35">
                            <X className="h-4 w-4 shrink-0 mt-0.5" /><span className="line-through">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-4 text-sm text-muted-foreground shadow-sm">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <span><strong className="text-foreground">30denní záruka spokojenosti</strong> — pokud do 30 dní zjistíš, že to není pro tebe, vrátíme ti celý poplatek bez otázek.</span>
            </div>
          </Reveal>
        </section>

        {/* ══ FAQ ══ */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <Reveal className="text-center mb-14">
              <div className="text-[11px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">FAQ</div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">Nejčastější otázky</h2>
            </Reveal>
            <Reveal>
              <div className="rounded-2xl border border-border bg-white shadow-sm px-8 py-2">
                {faqs.slice(0, faqLimit).map((f, i) => <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />)}
              </div>
              {faqLimit < faqs.length && (
                <div className="text-center mt-6">
                  <Button variant="outline" onClick={() => setFaqLimit(faqs.length)}>
                    Zobrazit všech {faqs.length} otázek <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </Reveal>
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="border-t border-border">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <img src={heroLight} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-white to-primary/5" />
            </div>
            <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
                  <Calculator className="h-3.5 w-3.5" /> Začni prodávat dnes
                </div>
                <h2 className="font-display text-3xl sm:text-5xl font-semibold mb-4">
                  Začni prodávat dnes —<br /><span className="italic text-primary">bez rizika, bez skladu.</span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg leading-relaxed">
                  Tisíce e-shopů v ČR a SK to dělá už teď. Přidej se a prodávej prémiové produkty, které zákazníci
                  chtějí — bez investice do zásob, bez logistické bolesti.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" onClick={() => navigate('/register')} className="shadow-lg">
                    Registrovat se zdarma a začít <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="mailto:dropshipping@swelt.partner">Napsat nám</a>
                  </Button>
                </div>
                <div className="mt-6 grid sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                  {[
                    { icon: HeadphonesIcon, label: 'Po–Pá 9:00–17:00', sub: 'Telefon + chat' },
                    { icon: Globe, label: 'dropshipping@swelt.partner', sub: 'Odpověď do 2 h' },
                    { icon: Users, label: 'Schválení do 24 h', sub: 'Žádné papírování' },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="rounded-xl border border-border bg-white/80 p-3 text-center">
                      <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
                      <div className="text-xs font-medium">{label}</div>
                      <div className="text-[10px] text-muted-foreground">{sub}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-xs text-muted-foreground">Bez závazků · Bez kreditní karty · Schválení do 24 hodin</p>
              </Reveal>
            </div>
          </div>
        </section>

      </main>

      <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
      <BottomNav onOpenWishlist={() => setWishlistOpen(true)} wishlistCount={wishlistIds.size} />
    </div>
  );
};

export default Dropshipping;
