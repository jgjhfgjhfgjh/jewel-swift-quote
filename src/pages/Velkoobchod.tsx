import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Handshake, Package, TrendingUp, ShieldCheck, ArrowRight, Check,
  Users, Star, Clock, Globe, Zap, Store, PackageOpen, Rss,
  HandCoins, ShoppingCart, ChevronDown, Truck, BarChart3, Award,
  ShoppingBag, Factory, Lock, BadgeCheck, UserPlus, Eye, CheckCircle, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { AuthModal } from '@/components/AuthModal';
import { LeadUpgradeBadge } from '@/components/LeadUpgradeBadge';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStore } from '@/lib/store';

/* ─── Reveal on scroll ─── */
function useReveal(threshold = 0.12): [React.RefObject<HTMLDivElement>, boolean] {
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

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [ref, revealed] = useReveal(0.5);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!revealed) return;
    let v = 0;
    const step = Math.ceil(to / 40);
    const id = setInterval(() => {
      v = Math.min(v + step, to);
      setCount(v);
      if (v >= to) clearInterval(id);
    }, 35);
    return () => clearInterval(id);
  }, [revealed, to]);
  return <span ref={ref}>{count.toLocaleString('cs')}{suffix}</span>;
}

/* ─── Floating social proof ─── */
function FloatingNotif() {
  const notifs = [
    { name: 'Radek H.', city: 'Praha', action: 'se zaregistroval jako B2B partner' },
    { name: 'Monika B.', city: 'Brno', action: 'zadala objednávku 45 ks hodinek' },
    { name: 'Jan K.', city: 'Ostrava', action: 'obnovil Gold partnerství' },
    { name: 'Petra S.', city: 'Plzeň', action: 'získala přístup k novým kolekcím' },
    { name: 'Tomáš V.', city: 'Bratislava', action: 'expandoval do 3 zemí EU' },
    { name: 'Lucie M.', city: 'Liberec', action: 'dosáhla obratu 200 000 Kč / měs.' },
  ];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => { setVisible(true); setTimeout(() => setVisible(false), 4500); };
    const t = setTimeout(show, 4000);
    const interval = setInterval(() => {
      setIdx(i => (i + 1) % notifs.length);
      show();
    }, 10000);
    return () => { clearTimeout(t); clearInterval(interval); };
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

/* ─── Data ─── */
const BRANDS = [
  'Tommy Hilfiger', 'Versace', 'Emporio Armani', 'Police', 'Seiko',
  'Hugo Boss', 'Citizen', 'Guess', 'DKNY', 'Calvin Klein',
  'Michael Kors', 'Fossil', 'Casio', 'Tissot', 'Lacoste',
  'Swarovski', 'Pandora', 'Morellato', 'Festina', 'Pierre Cardin',
];

const STEPS = [
  {
    n: '01',
    icon: UserPlus,
    title: 'Bezplatná registrace',
    desc: 'Vyplňte základní údaje — jméno, e-mail, telefon. Registrace trvá 2 minuty a je zcela zdarma.',
  },
  {
    n: '02',
    icon: BadgeCheck,
    title: 'Ověření B2B účtu',
    desc: 'Zadejte IČO nebo doložte jiný doklad o podnikání. Přijímáme i fyzické osoby se záměrem dalšího prodeje.',
  },
  {
    n: '03',
    icon: Clock,
    title: 'Schválení do 24 hodin',
    desc: 'Náš obchodní tým prověří žádost a aktivuje vám plný přístup k velkoobchodnímu katalogu.',
  },
  {
    n: '04',
    icon: Package,
    title: 'Nakupujte a vydělávejte',
    desc: 'Prohlédněte si 3 000+ produktů, zadejte objednávku, my se postaráme o expedici do 24–48 hodin.',
  },
];

const TARGETS = [
  {
    icon: Store,
    title: 'Malý obchodník',
    desc: 'Kamenný obchod, tržiště nebo začínající e-shop. Pořizujete 1–30 kusů měsíčně a hledáte prémiové zboží s dobrou marží bez složitých smluvních závazků.',
    bullets: [
      'Žádná minimální objednávka',
      'Nákupní ceny od prvního kusu',
      'Osobní podpora obchodního týmu',
    ],
    highlight: false,
  },
  {
    icon: ShoppingBag,
    title: 'Rostoucí e-shop',
    desc: 'Prodáváte online a chcete automatizovat doplňování katalogu. Obrat 10 000–100 000 Kč měsíčně — a chuť růst dál.',
    bullets: [
      'Automatické napojení přes swelt.feed',
      'Individuální slevy dle obratu',
      'Priority shipping a dedikovaná podpora',
    ],
    highlight: true,
  },
  {
    icon: Factory,
    title: 'Velký distributor',
    desc: 'Zásobujete síť prodejen nebo váš obrat přesahuje 100 000 Kč měsíčně. Potřebujete individuální podmínky, API přístup a dedikovaný servis.',
    bullets: [
      'Individuální cenotvorba a SLA',
      'Dedikovaný account manager',
      'API přístup k datům a zásobám',
    ],
    highlight: false,
  },
];

const CATALOG_FEATURES = [
  { icon: Package, label: '3 000+ produktů', desc: 'Hodinky, šperky, příslušenství' },
  { icon: Award, label: '70+ světových značek', desc: 'Tommy Hilfiger, Versace, Seiko…' },
  { icon: TrendingUp, label: '40–65 % pod MOC', desc: 'Marže s prostorem na zisk' },
  { icon: Clock, label: 'Zásoby v reálném čase', desc: 'Aktualizace každé 2 hodiny' },
  { icon: Globe, label: '15+ kategorií', desc: 'Dámské, pánské, unisex, doplňky' },
  { icon: Truck, label: 'Expedice 24–48 h', desc: 'FedEx, DHL, UPS — celá EU' },
  { icon: BarChart3, label: 'Ceny bez DPH', desc: 'Jasná kalkulace pro B2B partnery' },
  { icon: Zap, label: 'Nové kolekce každý týden', desc: 'Přímý přístup před ostatními' },
];

const VOLUME_TIERS = [
  {
    name: 'Registrace',
    volume: 'Libovolný objem',
    price: 'Zdarma',
    priceNote: 'vstup bez závazků',
    features: [
      'Přístup k B2B katalogu',
      'Nákupní ceny od 1 kusu',
      'Online objednávkový systém',
      'Zákaznická podpora v češtině',
    ],
    cta: 'Registrovat se',
    featured: false,
  },
  {
    name: 'Partner',
    volume: '20 000+ Kč / měsíc',
    price: 'Individuální sleva',
    priceNote: 'nad rámec nákupních cen',
    features: [
      'Vše z Registrace',
      'Individuální sleva dle obratu',
      'Priority shipping bez příplatku',
      'Přístup k novinkám před ostatními',
      'Dedikovaný obchodní zástupce',
    ],
    cta: 'Zjistit podmínky',
    featured: true,
  },
  {
    name: 'Enterprise',
    volume: '200 000+ Kč / měsíc',
    price: 'Na míru',
    priceNote: 'individuální smlouva',
    features: [
      'Vše z Partner',
      'Smluvní ceny a SLA garantie',
      'API přístup k datům a zásobám',
      'White-label možnosti',
      'Zastoupení v EU zemích',
    ],
    cta: 'Kontaktovat obchod',
    featured: false,
  },
];

const ECOSYSTEM = [
  {
    icon: Rss,
    name: 'swelt.feed',
    desc: 'Automatický XML/CSV feed 3 000+ produktů. Synchronizujte katalog s vaším e-shopem bez jakékoliv manuální práce.',
    href: '/feed',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: PackageOpen,
    name: 'swelt.dropshipping',
    desc: 'Prodávejte bez skladu. Zákazník objedná u vás — my mu zboží zabalíme a odešleme přímo pod vaším jménem.',
    href: '/dropshipping',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: HandCoins,
    name: 'Privátní nákupy',
    desc: 'Prémiové produkty pro soukromé osoby a firemní dárky. Diskrétní balení, rychlé EU doručení.',
    href: '/luxury',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: ShoppingCart,
    name: 'swelt.shop',
    desc: 'Hotový e-shop naplněný 3 000+ produkty. Spuštěný do 48 hodin. S nebo bez vlastního skladu.',
    href: '/shop',
    color: 'text-orange-600 bg-orange-50',
  },
];

const FAQS = [
  {
    q: 'Co potřebuji k registraci jako B2B partner?',
    a: 'Stačí vyplnit základní kontaktní údaje a zadat IČO nebo doložit záměr podnikání. Přijímáme e-shopy, kamenné obchody, tržnice i fyzické osoby se záměrem dalšího prodeje. Registrace je zdarma a trvá 2 minuty.',
  },
  {
    q: 'Jak dlouho trvá schválení B2B účtu?',
    a: 'Standardně do 24 hodin v pracovní dny. Po schválení vám přijde e-mail s přístupovými údaji do velkoobchodního katalogu. Urgentní žádosti vyřizujeme i mimo pracovní dobu — napište nám.',
  },
  {
    q: 'Jaké jsou minimální objednávky?',
    a: 'Žádné. Žádné minimální množství ani minimální hodnota objednávky. Pořídíte si klidně 1 kus. Slevy a individuální podmínky se odvíjejí od celkového měsíčního obratu, ne od jednotlivé objednávky.',
  },
  {
    q: 'Jak funguje cenotvorba a jaké slevy mohu získat?',
    a: 'Základní nákupní ceny jsou 40–65 % pod doporučenou maloobchodní cenou (MOC). Nad rámec těchto cen nabízíme individuální slevy pro partnery s vyšším měsíčním obratem. Podmínky nastavujeme osobně — napište nám nebo zavolejte.',
  },
  {
    q: 'Mohu produkty prodávat i v zahraničí?',
    a: 'Ano. Zasíláme po celé EU. Produkty jsou určeny pro další prodej bez geografického omezení v rámci EU. Pokud plánujete prodej mimo EU, konzultujte podmínky s naším obchodním týmem.',
  },
  {
    q: 'Jak mohu propojit katalog se svým e-shopem?',
    a: 'Doporučujeme službu swelt.feed — automatický produktový feed ve formátu XML, CSV nebo přímo pro Heureka, Google Shopping a další srovnávače. Feed se aktualizuje 1–4× denně bez jakékoliv manuální práce z vaší strany.',
  },
  {
    q: 'Mohu kombinovat velkoobchod s dropshippingem?',
    a: 'Ano, a mnoho našich partnerů to tak dělá. Část sortimentu nakoupíte na sklad (velkoobchod), zbytek prodáváte na objednávku bez skladu (dropshipping). Jde to nastavit paralelně na jednom účtu.',
  },
];

/* ─── Page ─── */
const Velkoobchod = () => {
  const navigate = useNavigate();
  const { user, isB2bApproved, isLead } = useAuthContext();
  const { setViewMode } = useStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const openAuth = (tab: 'login' | 'register') => { setAuthTab(tab); setAuthOpen(true); };
  const goToCatalog = () => { setViewMode('catalog'); navigate('/'); };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div
      className="velo-page min-h-screen font-sans"
      style={{
        '--background': '220 30% 98%',
        '--foreground': '220 25% 10%',
        '--card': '0 0% 100%',
        '--card-foreground': '220 25% 10%',
        '--primary': '220 60% 45%',
        '--primary-foreground': '0 0% 100%',
        '--muted': '220 20% 94%',
        '--muted-foreground': '220 15% 45%',
        '--border': '220 20% 88%',
        backgroundColor: 'hsl(220, 30%, 98%)',
        color: 'hsl(220, 25%, 10%)',
      } as React.CSSProperties}
    >
      <Navbar />
      <BackButton />
      <FloatingNotif />
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab={authTab}
        tip="Registrujte se zdarma a uvidíte i velkoobchodní nákupní ceny — B2B účet schválíme do 24 hodin."
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.08),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-32">
          <div className="max-w-3xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/20 px-4 py-1.5 text-sm font-semibold text-primary mb-7">
                <Handshake className="h-4 w-4" />
                B2B Velkoobchod · Přímý přístup k dodavateli
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-[1.05] mb-6">
                Nakupujte prémiové značky přímo od zdroje.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                3 000+ produktů, 70+ světových značek, marže 40–65 %. Žádní prostředníci, žádné zbytečné přirážky. Registrace zdarma — schválení do 24 hodin.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                {!user && (
                  <>
                    <Button size="lg" onClick={() => openAuth('register')} className="gap-2 text-base h-12 px-7">
                      Registrovat se zdarma <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => openAuth('login')} className="gap-2 text-base h-12 px-7">
                      Přihlásit se
                    </Button>
                  </>
                )}
                {user && isB2bApproved && (
                  <Button size="lg" onClick={goToCatalog} className="gap-2 text-base h-12 px-7">
                    Vstoupit do katalogu <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                {user && isLead && !isB2bApproved && (
                  <LeadUpgradeBadge />
                )}
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="flex flex-wrap gap-5 text-sm text-muted-foreground mb-8">
                {[
                  'Registrace zdarma',
                  'Bez minimálního odběru',
                  'Schválení do 24 h',
                  'IČO není podmínkou',
                ].map(text => (
                  <div key={text} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            {!user && (
              <Reveal delay={400}>
                <div className="inline-flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 px-5 py-4 max-w-xl">
                  <Eye className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <span className="font-semibold text-blue-800">Chcete si nejdřív prohlédnout sortiment?</span>
                    <span className="text-blue-700/80"> Zaregistrujte se zdarma přes e-mail nebo Google a okamžitě nahlédněte do celého katalogu — fotky, dostupnost a doporučené ceny. </span>
                    <span className="font-semibold text-blue-800">Velkoobchodní nákupní ceny</span>
                    <span className="text-blue-700/80"> se odemknou po schválení B2B účtu.</span>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { val: 3000, suffix: '+', label: 'produktů v katalogu' },
              { val: 70, suffix: '+', label: 'světových značek' },
              { val: 60, suffix: ' %', label: 'sleva pod MOC' },
              { val: 500, suffix: '+', label: 'aktivních partnerů' },
            ].map(({ val, suffix, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-3xl sm:text-4xl font-black text-primary mb-1">
                  <CountUp to={val} suffix={suffix} />
                </div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nahlédněte do katalogu ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Copywriting */}
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-5">
                  <Eye className="h-3.5 w-3.5" />
                  Nahlédněte bez závazků
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-5">
                  Prohlédněte si celý katalog ještě dnes — zdarma a bez čekání.
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Víme, že vstoupit do nového partnerství chce důvěru. Proto vám umožňujeme nahlédnout do katalogu ještě předtím, než cokoliv rozhodujete. Stačí se přihlásit přes e-mail nebo Google — trvá to 30 sekund.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Uvidíte celý sortiment: <strong className="text-foreground">3 000+ produktů, fotky, dostupnost v reálném čase a doporučené maloobchodní ceny (MOC).</strong> Takže si rovnou spočítáte, jaké marže vás čekají.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  <strong className="text-foreground">Velkoobchodní nákupní ceny</strong> jsou skryté a odemknou se automaticky po ověření a schválení vašeho B2B účtu — zpravidla do 24 hodin. Registrace je zcela zdarma.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {!user ? (
                    <>
                      <Button onClick={() => openAuth('login')} className="gap-2" size="lg">
                        Nahlédnout do katalogu <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => openAuth('register')} variant="outline" size="lg" className="gap-2">
                        Registrovat se
                      </Button>
                    </>
                  ) : isB2bApproved ? (
                    <Button onClick={goToCatalog} className="gap-2" size="lg">
                      Vstoupit do katalogu <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </Reveal>

            {/* Access tier comparison */}
            <Reveal delay={150}>
              <div className="space-y-4">
                {[
                  {
                    label: 'Nepřihlášen',
                    icon: Lock,
                    iconColor: 'text-slate-400',
                    bg: 'bg-slate-50 border-slate-200',
                    labelColor: 'text-slate-500',
                    items: [
                      { text: 'Prohlídka sortimentu', ok: false },
                      { text: 'Fotky a popis produktů', ok: false },
                      { text: 'Doporučené ceny (MOC)', ok: false },
                      { text: 'Živé zásoby', ok: false },
                      { text: 'Velkoobchodní ceny', ok: false },
                      { text: 'Objednávkový systém', ok: false },
                    ],
                  },
                  {
                    label: 'Přihlášen zdarma (Google / e-mail)',
                    icon: Eye,
                    iconColor: 'text-blue-600',
                    bg: 'bg-blue-50 border-blue-200',
                    labelColor: 'text-blue-700',
                    highlight: true,
                    badge: 'Bez čekání',
                    items: [
                      { text: 'Prohlídka sortimentu', ok: true },
                      { text: 'Fotky a popis produktů', ok: true },
                      { text: 'Doporučené ceny (MOC)', ok: true },
                      { text: 'Živé zásoby', ok: true },
                      { text: 'Velkoobchodní ceny', ok: false, locked: true },
                      { text: 'Objednávkový systém', ok: false, locked: true },
                    ],
                  },
                  {
                    label: 'Schválený B2B partner',
                    icon: BadgeCheck,
                    iconColor: 'text-primary',
                    bg: 'bg-primary/5 border-primary/20',
                    labelColor: 'text-primary',
                    badge: 'Plný přístup',
                    items: [
                      { text: 'Prohlídka sortimentu', ok: true },
                      { text: 'Fotky a popis produktů', ok: true },
                      { text: 'Doporučené ceny (MOC)', ok: true },
                      { text: 'Živé zásoby', ok: true },
                      { text: 'Velkoobchodní ceny', ok: true },
                      { text: 'Objednávkový systém', ok: true },
                    ],
                  },
                ].map((tier) => {
                  const TIcon = tier.icon;
                  return (
                    <div key={tier.label} className={`rounded-2xl border p-5 ${tier.bg}`}>
                      <div className="flex items-center gap-2 mb-4">
                        <TIcon className={`h-4 w-4 shrink-0 ${tier.iconColor}`} />
                        <span className={`font-semibold text-sm ${tier.labelColor}`}>{tier.label}</span>
                        {tier.badge && (
                          <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${tier.highlight ? 'bg-blue-200 text-blue-800' : 'bg-primary/15 text-primary'}`}>
                            {tier.badge}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {tier.items.map(item => (
                          <div key={item.text} className="flex items-center gap-1.5 text-xs">
                            {item.ok ? (
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            ) : item.locked ? (
                              <Lock className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                            )}
                            <span className={item.ok ? 'text-foreground/80' : 'text-slate-400'}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Pro koho jsme ── */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                Pro koho jsme
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                Velkoobchod pro každou fázi vašeho podnikání
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ať prodáváte na tržišti, provozujete e-shop nebo zásobujete síť prodejen — máme podmínky, které dávají smysl pro váš objem a ambice.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TARGETS.map((t, i) => {
              const Icon = t.icon;
              return (
                <Reveal key={t.title} delay={i * 100}>
                  <div className={`relative rounded-2xl border p-8 h-full flex flex-col ${t.highlight ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'bg-white border-border'}`}>
                    {t.highlight && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="bg-amber-400 text-amber-900 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                          Nejoblíbenější
                        </span>
                      </div>
                    )}
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-5 ${t.highlight ? 'bg-white/20' : 'bg-primary/10'}`}>
                      <Icon className={`h-6 w-6 ${t.highlight ? 'text-white' : 'text-primary'}`} />
                    </div>
                    <h3 className={`font-display text-xl font-black mb-2 ${t.highlight ? 'text-white' : 'text-foreground'}`}>{t.title}</h3>
                    <p className={`text-sm leading-relaxed mb-6 flex-1 ${t.highlight ? 'text-white/80' : 'text-muted-foreground'}`}>{t.desc}</p>
                    <ul className="space-y-2.5">
                      {t.bullets.map(b => (
                        <li key={b} className={`flex items-start gap-2 text-sm ${t.highlight ? 'text-white' : 'text-foreground/80'}`}>
                          <Check className={`h-4 w-4 shrink-0 mt-0.5 ${t.highlight ? 'text-white' : 'text-emerald-500'}`} strokeWidth={2.5} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Onboarding – jak to funguje ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-4">
                Jak začít
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                Od registrace k první objednávce za 24 hodin
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Žádné papírování, žádné čekání týdny. Jednoduchý proces — stačí se zaregistrovat a o zbytek se postaráme my.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.n} delay={i * 80}>
                  <div className="relative bg-slate-50 rounded-2xl border border-border p-6 h-full">
                    <div className="font-display text-5xl font-black text-primary/10 mb-3 leading-none select-none">{s.n}</div>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display font-black text-foreground mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={400}>
            <div className="mt-10 flex justify-center">
              <Button
                size="lg"
                className="gap-2 h-12 px-8 text-base"
                onClick={() => {
                  if (!user) openAuth('register');
                  else if (isB2bApproved) goToCatalog();
                }}
              >
                {!user ? 'Začít registraci zdarma' : isB2bApproved ? 'Vstoupit do katalogu' : 'Žádost se zpracovává'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Co je v katalogu ── */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                Katalog
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                Co najdete v B2B katalogu
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Přímý přístup k 3 000+ prémiových hodinek a šperků. Vše skladem, vše s aktuálními velkoobchodními cenami a přesným přehledem zásob.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
            {CATALOG_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.label} delay={i * 55}>
                  <div className="bg-white rounded-xl border border-border p-5 flex flex-col items-start gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-display font-black text-foreground text-sm leading-tight">{f.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Brands strip */}
          <Reveal>
            <div className="text-center mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">70+ značek dostupných od prvního kusu</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {BRANDS.map(b => (
                <span key={b} className="rounded-lg bg-white border border-border px-3 py-1.5 text-xs font-semibold text-foreground/70">
                  {b}
                </span>
              ))}
              <span className="rounded-lg bg-primary/8 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary">
                +50 dalších →
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Partnerské podmínky – cenové tiery ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                Partnerské podmínky
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                Ceny, které rostou s vaším obratem
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Základní nákupní ceny jsou otevřené pro všechny registrované partnery. Čím vyšší obrat, tím lepší podmínky — bez složitých smluv od začátku.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {VOLUME_TIERS.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 100}>
                <div className={`relative rounded-2xl border p-8 h-full flex flex-col ${tier.featured ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'bg-white border-border'}`}>
                  {tier.featured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-amber-400 text-amber-900 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                        Doporučeno
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className={`font-display text-xl font-black mb-1 ${tier.featured ? 'text-white' : 'text-foreground'}`}>{tier.name}</h3>
                    <div className={`text-xs mb-4 ${tier.featured ? 'text-white/70' : 'text-muted-foreground'}`}>{tier.volume}</div>
                    <div className={`font-display text-2xl font-black ${tier.featured ? 'text-white' : 'text-primary'}`}>{tier.price}</div>
                    <div className={`text-xs mt-1 ${tier.featured ? 'text-white/60' : 'text-muted-foreground'}`}>{tier.priceNote}</div>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-8">
                    {tier.features.map(f => (
                      <li key={f} className={`flex items-start gap-2 text-sm ${tier.featured ? 'text-white' : 'text-foreground/80'}`}>
                        <Check className={`h-4 w-4 shrink-0 mt-0.5 ${tier.featured ? 'text-white' : 'text-emerald-500'}`} strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={tier.featured ? 'secondary' : 'outline'}
                    className={`w-full gap-1.5 ${tier.featured ? 'bg-white text-primary hover:bg-white/90' : ''}`}
                    onClick={() => {
                      if (tier.name === 'Registrace') {
                        if (!user) openAuth('register');
                        else if (isB2bApproved) goToCatalog();
                      } else {
                        window.location.href = 'mailto:obchod@swelt.cz';
                      }
                    }}
                  >
                    {tier.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={400}>
            <p className="text-center text-sm text-muted-foreground mt-8">
              Potřebujete přesnější kalkulaci? <a href="mailto:obchod@swelt.cz" className="text-primary font-semibold hover:underline">Napište nám</a> — obchodní podmínky nastavíme na míru do 24 hodin.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Ekosystém cross-sell ── */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                Kompletní ekosystém
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                Jedna platforma. Čtyři způsoby, jak vydělávat.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Velkoobchod je základ. Ale naši nejúspěšnější partneři kombinují více služeb — a tím násobí svůj zisk bez nutnosti více dodavatelů.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ECOSYSTEM.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <Reveal key={svc.name} delay={i * 80}>
                  <div
                    onClick={() => navigate(svc.href)}
                    className="group cursor-pointer bg-white rounded-2xl border border-border p-6 h-full flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4 ${svc.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-black text-foreground mb-2">{svc.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{svc.desc}</p>
                    <div className="flex items-center gap-1.5 text-primary text-sm font-semibold mt-5 group-hover:gap-2.5 transition-all">
                      Zjistit více <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Proč Swelt – trust ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-6">
                  Proč Swelt
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-5">
                  15 let zkušeností. Přímý vztah s dodavateli.
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Nejsme překupník. Jsme přímý distributor světových hodinářských a klenotnických značek pro střední a východní Evropu. Díky přímému partnerství s výrobci nabízíme ceny, na které jiní distributoři nedosáhnou.
                </p>
                <div className="space-y-3">
                  {[
                    'Přímé partnerství s 70+ světovými značkami',
                    'Garance originality — 100 % autentické produkty',
                    'Evropský sklad — expedice do 24–48 hodin',
                    'Certifikovaný záruční a pozáruční servis',
                    'GDPR compliance a transparentní obchodní podmínky',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-3 text-sm text-foreground/80">
                      <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { val: 15, suffix: '+', label: 'let na trhu', icon: Award },
                  { val: 500, suffix: '+', label: 'aktivních partnerů', icon: Users },
                  { val: 3000, suffix: '+', label: 'produktů v katalogu', icon: Package },
                  { val: 98, suffix: ' %', label: 'spokojenost partnerů', icon: Star },
                ].map(({ val, suffix, label, icon: Icon }) => (
                  <div key={label} className="bg-slate-50 rounded-2xl border border-border p-6 text-center">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="font-display text-3xl font-black text-primary mb-1">
                      <CountUp to={val} suffix={suffix} />
                    </div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Testimonials */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                name: 'Radek H.',
                role: 'E-shop hodinek, Praha',
                text: 'Díky Sweltu jsem rozšířil katalog o 800 produktů za víkend. Marže na Tommy Hilfiger jsou výrazně lepší než u předchozího dodavatele a zásoby jsou vždy aktuální.',
              },
              {
                name: 'Monika B.',
                role: 'Zlatnictví, Brno',
                text: 'Schválení účtu přišlo do 8 hodin. Přístup do katalogu byl okamžitý. Nikdy jsem nezaznamenala nesoulad zásob — to, co katalog říká „skladem", opravdu je skladem.',
              },
              {
                name: 'Jan K.',
                role: 'Distributor, Ostrava',
                text: 'Zásobuji přes 3 e-shopy a Swelt je za tím vším. Kombinuji velkoobchod s dropshippingem — ideální model, který mi šetří kapitál vázaný ve skladu.',
              },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="bg-slate-50 rounded-2xl border border-border p-6">
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-5">"{t.text}"</p>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                Nejčastější otázky
              </h2>
              <p className="text-muted-foreground">Vše, co potřebujete vědět před registrací.</p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={i} delay={i * 40}>
                <div className="bg-white rounded-xl border border-border overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 hover:bg-slate-50/50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-semibold text-sm text-foreground">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 border-t border-border">
                      <p className="text-sm text-muted-foreground leading-relaxed pt-4">{faq.a}</p>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Bottom ── */}
      <section
        className="py-20 sm:py-28"
        style={{ background: 'linear-gradient(135deg, hsl(220,60%,28%) 0%, hsl(220,60%,45%) 100%)' }}
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-semibold text-white/90 mb-7">
              <Handshake className="h-4 w-4" />
              Připojte se ke komunitě 500+ partnerů
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white mb-5">
              Začněte vydělávat s prémiemi. Dnes.
            </h2>
            <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Registrace zdarma. Schválení do 24 hodin. Přístup k 3 000+ produktům s marží 40–65 %.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Button size="lg" variant="secondary" onClick={() => openAuth('register')} className="gap-2 h-12 px-8 text-base">
                    Registrovat se zdarma <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={() => openAuth('login')}
                    className="gap-2 h-12 px-8 text-base text-white border border-white/30 hover:bg-white/10"
                  >
                    Přihlásit se
                  </Button>
                </>
              ) : isB2bApproved ? (
                <Button size="lg" variant="secondary" onClick={goToCatalog} className="gap-2 h-12 px-8 text-base">
                  Vstoupit do katalogu <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <p className="text-white/70 text-sm italic">Vaše žádost je v procesu schvalování — brzy se ozveme.</p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Trust footer strip ── */}
      <section className="bg-white border-t border-border py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            {[
              { icon: ShieldCheck, text: '100% autentické produkty' },
              { icon: Truck, text: 'FedEx / DHL / UPS expedice' },
              { icon: Globe, text: 'Doručení po celé EU' },
              { icon: BadgeCheck, text: 'Přímý distributor značek' },
              { icon: Lock, text: 'Bezpečné B2B platby' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary/60" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Velkoobchod;
