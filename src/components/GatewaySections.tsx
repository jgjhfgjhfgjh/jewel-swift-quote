import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, ArrowRight, Users, Star, Shield,
  Globe, Lock,
  Eye,
  X,
} from 'lucide-react';
import { GatewayPanel } from './GatewayPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/AuthModal';
import { AccessTiersVisual } from '@/components/AccessTiersVisual';
import { useAuthContext } from '@/contexts/AuthContext';
import { buildPartnerContext } from '@/lib/chatContext';
import { useStore } from '@/lib/store';
import { gateway } from '@/lib/i18n-gateway';
import { BRANDS_PREMIUM } from '@/data/brands';
import { BrandLogo } from '@/components/BrandLogo';
import { BrandLogoRow } from '@/components/BrandLogoRow';
import { ConcernCarousel } from '@/components/ConcernCarousel';
import { HomeFooter } from '@/components/HomeFooter';



/* ── Reveal on scroll ── */
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
      className={`transition-all duration-500 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
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
      v += step;
      if (v >= to) { setCount(to); clearInterval(id); } else setCount(v);
    }, 35);
    return () => clearInterval(id);
  }, [revealed, to]);
  return <span ref={ref}>{count.toLocaleString('cs')}{suffix}</span>;
}

/* ── Rotating suffix (simple fade/slide swap between words) ── */
export function RotatingSuffix({ words, interval = 2200 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  useEffect(() => {
    const t = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setI((v) => (v + 1) % words.length);
        setPhase('in');
      }, 280);
    }, interval);
    return () => clearInterval(t);
  }, [interval, words.length]);
  return (
    <span
      key={i}
      className={`inline-block whitespace-nowrap transition-all duration-300 ease-out ${
        phase === 'in'
          ? 'opacity-100 translate-y-0 blur-0'
          : 'opacity-0 -translate-y-2 blur-sm'
      }`}
      aria-label={words[i]}
    >
      {words[i]}
    </span>
  );
}

/* ── Floating social proof ── */
function FloatingNotif() {
  const notifs = [
    { name: 'Jan K.', city: 'Praha', action: 'se zaregistroval jako partner' },
    { name: 'Tereza M.', city: 'Brno', action: 'aktivoval Silver plán' },
    { name: 'Ondřej P.', city: 'Ostrava', action: 'spustil první feed' },
    { name: 'Lucie V.', city: 'Plzeň', action: 'přidal 120 produktů do e-shopu' },
    { name: 'Martin S.', city: 'Bratislava', action: 'expandoval na slovenský trh' },
    { name: 'Radek H.', city: 'Liberec', action: 'odeslal poptávku na hodinky' },
  ];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  // Notifikace se ukazují až od poloviny stránky — nahoře (hero video,
  // showcase) nechávají čistou scénu.
  const [pastHalf, setPastHalf] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('floatingNotifDismissed') === '1';
  });

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const half = (doc.scrollHeight - window.innerHeight) / 2;
      setPastHalf(window.scrollY > half);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const show = () => { setVisible(true); setTimeout(() => setVisible(false), 4500); };
    const interval = setInterval(() => {
      setIdx(i => (i + 1) % notifs.length);
      show();
    }, 10000);
    const t = setTimeout(show, 3500);
    return () => { clearInterval(interval); clearTimeout(t); };
  }, [dismissed]);

  const handleClose = () => {
    setVisible(false);
    setDismissed(true);
    try { sessionStorage.setItem('floatingNotifDismissed', '1'); } catch { /* private mode — ignorovat */ }
  };

  if (dismissed || !pastHalf) return null;

  return (
    <div className={`fixed bottom-20 left-4 z-50 transition-all duration-500 lg:bottom-6 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="relative flex items-center gap-3 rounded-none border border-border bg-white shadow-xl px-4 py-3 pr-9 max-w-xs">
        <div className="h-8 w-8 rounded-none bg-zinc-100 flex items-center justify-center shrink-0">
          <Users className="h-4 w-4 text-zinc-500" />
        </div>
        <div>
          <div className="text-xs font-semibold">{notifs[idx].name} z {notifs[idx].city}</div>
          <div className="text-[11px] text-muted-foreground">{notifs[idx].action} · právě teď</div>
        </div>
        <button
          onClick={handleClose}
          aria-label="Zavřít notifikaci"
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-none text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Section divider ── */
function SectionDivider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto max-w-4xl" />;
}

/* ── Feature bullet list ── */
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── Visual mock cards ── */
function B2BVisual() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const catalogItems = [
    { img: 'https://cdn.b2bzago.com/images/0/7afe1cca249d731c/100/hodinky-tommy-hilfiger-model-decker-1791349.jpg?hash=-2', brand: 'Tommy Hilfiger', voc: '1 790 Kč', moc: '4 475 Kč', disc: '-60%' },
    { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=70', brand: 'Versace', voc: '2 890 Kč', moc: '7 225 Kč', disc: '-60%' },
    { img: 'https://images.unsplash.com/photo-1542496658-e33a6d0d3cde?auto=format&fit=crop&w=200&q=70', brand: 'Police', voc: '1 250 Kč', moc: '3 125 Kč', disc: '-60%' },
    { img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=200&q=70', brand: 'Seiko', voc: '2 100 Kč', moc: '5 250 Kč', disc: '-60%' },
    { img: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=200&q=70', brand: 'Citizen', voc: '1 580 Kč', moc: '3 950 Kč', disc: '-60%' },
    { img: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=200&q=70', brand: 'Hugo Boss', voc: '2 240 Kč', moc: '5 600 Kč', disc: '-60%' },
  ];

  return (
    <div className="relative rounded-none overflow-hidden shadow-2xl border border-white/60" style={{ minHeight: '360px' }}>

      {/* ── Catalog grid behind the glass ── */}
      <div className="absolute inset-0" style={{ filter: 'blur(1.5px) brightness(0.96)' }}>
        <div className="bg-zinc-50 p-3 h-full flex items-center justify-center">
          {/* Centered product grid only — no sidebar, full row visible */}
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm">
            {catalogItems.map((item, i) => (
              <div key={i} className="bg-white rounded-none overflow-hidden border border-slate-100 shadow-sm">
                <div className="relative">
                  <img src={item.img} alt={item.brand} className="w-full aspect-square object-cover object-center" loading="lazy" />
                  <div className="absolute top-1.5 right-1.5 bg-zinc-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-none">{item.disc}</div>
                  <div className="absolute top-1.5 left-1.5">
                    <span className="h-2 w-2 rounded-none bg-emerald-400 block ring-2 ring-white" />
                  </div>
                </div>
                <div className="p-2">
                  <div className="text-[9px] font-bold text-amber-600 truncate">{item.brand}</div>
                  <div className="text-[10px] font-bold text-zinc-800">{item.voc}</div>
                  <div className="text-[9px] text-slate-400 line-through">{item.moc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Liquid glass overlay ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center px-6"
        style={{
          backdropFilter: 'blur(5px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(5px) saturate(1.2)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.22) 100%)',
          borderRadius: 'inherit',
        }}
      >
        {/* Glow ring around lock */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-none bg-zinc-900/10 blur-md animate-pulse" />
          <div className="relative h-16 w-16 rounded-none bg-white/80 border border-white/70 shadow-xl flex items-center justify-center">
            <Lock className="h-7 w-7 text-zinc-700" />
          </div>
        </div>

        <div>
          <div className="font-display text-2xl font-bold text-foreground mb-1">15 000+ produktů</div>
          <div className="text-sm text-foreground/70 leading-snug">
            65+ prémiových značek · slevy 40–65 %<br />Přihlaste se a odemkněte celý katalog.
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-[200px]">
          <Button
            className="w-full gap-2 shadow-lg"
            onClick={() => user ? navigate('/velkoobchod') : undefined}
          >
            Vstoupit do katalogu <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-foreground/60 flex-wrap justify-center">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-none bg-emerald-500 shrink-0" />Live zásoby</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-none bg-zinc-400 shrink-0" />Aktualizace denně</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-none bg-amber-500 shrink-0" />Ceny bez DPH</span>
        </div>
      </div>
    </div>
  );
}

function FeedVisual() {
  const formats = ['XML', 'CSV', 'Heureka', 'Zbozi.cz', 'Google'];
  const [active, setActive] = useState(0);
  return (
    <div className="rounded-none border border-border bg-white shadow-lg p-5 space-y-4">
      <div className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">swelt.feed — Live preview</div>
      <div className="flex flex-wrap gap-1.5">
        {formats.map((f, i) => (
          <button key={f} onClick={() => setActive(i)}
            className={`rounded-none px-3 py-1 text-[11px] font-semibold transition-all border ${active === i ? 'bg-zinc-900 text-white border-zinc-900' : 'border-border text-muted-foreground hover:border-zinc-400'}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="rounded-none bg-slate-900 text-slate-300 p-3 font-mono text-[10px] leading-relaxed overflow-hidden">
        {active === 0 && (
          <>
            <div className="text-slate-500">{'<?xml version="1.0"?>'}</div>
            <div className="text-emerald-400">{'<SHOP>'}</div>
            <div className="ml-3 text-blue-300">{'<SHOPITEM>'}</div>
            <div className="ml-6 text-yellow-300">{'<PRODUCTNAME>Tommy Hilfiger DECKER</PRODUCTNAME>'}</div>
            <div className="ml-6 text-yellow-300">{'<PRICE_VAT>4475</PRICE_VAT>'}</div>
            <div className="ml-6 text-yellow-300">{'<URL>https://vaseshop.cz/...</URL>'}</div>
            <div className="ml-6 text-yellow-300">{'<IMGURL>cdn.b2bzago.com/...</IMGURL>'}</div>
            <div className="ml-3 text-blue-300">{'</SHOPITEM>'}</div>
            <div className="text-emerald-400">{'</SHOP>'}</div>
          </>
        )}
        {active === 1 && (
          <>
            <div className="text-emerald-400">PRODUCTNAME;PRICE;EAN;BRAND;URL</div>
            <div className="text-slate-300">Tommy Hilfiger DECKER;4475;3168526...</div>
            <div className="text-slate-300">Versace V-Chrono;7225;8053632...</div>
            <div className="text-slate-300">Police MENELIK;3125;4894327...</div>
          </>
        )}
        {active >= 2 && (
          <>
            <div className="text-slate-500">{`<!-- ${formats[active]} feed -->`}</div>
            <div className="text-emerald-400">{'<item>'}</div>
            <div className="ml-3 text-yellow-300">{'<title>Tommy Hilfiger DECKER 1791349</title>'}</div>
            <div className="ml-3 text-yellow-300">{`<price currency="CZK">4475</price>`}</div>
            <div className="ml-3 text-yellow-300">{'<availability>available</availability>'}</div>
            <div className="text-emerald-400">{'</item>'}</div>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-none bg-muted/40 border border-border p-2 text-center">
          <div className="text-lg font-bold text-zinc-900">15 000+</div>
          <div className="text-[10px] text-muted-foreground">produktů v feedu</div>
        </div>
        <div className="rounded-none bg-muted/40 border border-border p-2 text-center">
          <div className="text-lg font-bold text-zinc-900">4×/den</div>
          <div className="text-[10px] text-muted-foreground">aktualizace cen</div>
        </div>
      </div>
    </div>
  );
}

function DropshippingVisual() {
  const steps = [
    { n: '01', label: 'Zákazník objedná', sub: 'na tvém e-shopu', icon: '🛒' },
    { n: '02', label: 'swelt zabalí', sub: 'pod tvou značkou', icon: '📦' },
    { n: '03', label: 'Doručení', sub: 'do 24–48 hodin', icon: '🚚' },
  ];
  return (
    <div className="rounded-none border border-border bg-white shadow-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">Jak to funguje</div>
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-[10px]">Bez skladu</Badge>
      </div>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-none bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center text-lg shrink-0">
              {s.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{s.label}</div>
              <div className="text-[11px] text-muted-foreground">{s.sub}</div>
            </div>
            <div className="text-[10px] font-bold text-zinc-400">{s.n}</div>
            {i < steps.length - 1 && (
              <div className="absolute ml-5 mt-12 w-px h-4 bg-zinc-200" />
            )}
          </div>
        ))}
      </div>
      <div className="rounded-none bg-muted/40 border border-border p-3 grid grid-cols-2 gap-2 text-center">
        <div>
          <div className="text-base font-bold text-emerald-600">60 %</div>
          <div className="text-[10px] text-muted-foreground">průměrná marže</div>
        </div>
        <div>
          <div className="text-base font-bold text-zinc-800">0 Kč</div>
          <div className="text-[10px] text-muted-foreground">investice do skladu</div>
        </div>
      </div>
    </div>
  );
}

function LuxuryVisual() {
  const brands = ['Tommy Hilfiger', 'Versace', 'Police', 'Tissot', 'Seiko', 'Hugo Boss', 'Armani', 'Citizen'];
  return (
    <div className="rounded-none border border-border bg-white shadow-lg p-5 space-y-4">
      <div className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">Dostupné značky</div>
      <div className="flex flex-wrap gap-2">
        {brands.map(b => (
          <span key={b} className="rounded-none border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-foreground/80">{b}</span>
        ))}
        <span className="rounded-none border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-700">+62 dalších</span>
      </div>
      <div className="rounded-none bg-zinc-900 text-white p-4">
        <div className="text-[10px] opacity-70 uppercase tracking-wider mb-1">Příklad úspory</div>
        <div className="text-2xl font-semibold mb-0.5">2 685 Kč</div>
        <div className="text-xs opacity-80">ušetříte na 1 Tommy Hilfiger hodinkách</div>
        <div className="mt-2 flex justify-between text-[11px] opacity-70">
          <span>Retail cena: 4 475 Kč</span>
          <span>Vaše cena: 1 790 Kč</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Shield className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
        Garance pravosti | Diskrétní balení | EU doručení
      </div>
    </div>
  );
}

/* ── Trust section ── */
function TrustSection() {
  const { lang } = useStore();
  const g = gateway[lang];
  const stats = [
    { val: 15, suf: '+', label: g.statYearsLabel },
    { val: 70, suf: '+', label: g.statBrandsLabel },
    { val: 3000, suf: '+', label: g.statProductsLabel },
    { val: 500, suf: '+', label: g.statPartnersLabel },
  ];
  const testimonials = [
    { name: 'Martin H.', company: 'WatchStore.cz', text: 'Dropshipping od swelt změnil náš byznys. Za 3 měsíce jsme přidali 800 produktů bez jediné koruny do skladu.', rating: 5 },
    { name: 'Tereza K.', company: 'LuxuryTime.sk', text: 'Feed se aktualizuje automaticky, ceny sedí na haléř. Ušetřím 10 hodin týdně na správě katalogu.', rating: 5 },
    { name: 'Pavel S.', company: 'GiftShop.cz', text: 'Privátní nákup hodinek pro celý tým — rychle, diskrétně, za skvělou cenu. Doporučuji.', rating: 5 },
  ];

  return (
    <section className="relative bg-zinc-50 py-24 sm:py-28 overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6">
        {/* Stats */}
        <Reveal className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-balance">{g.trustHeading}</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-20">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="group text-center rounded-none border border-border bg-card p-7 shadow-sm hover-lift">
                <div className="font-display text-4xl sm:text-5xl font-black text-primary mb-2">
                  <CountUp to={s.val} suffix={s.suf} />
                </div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 mb-16">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div className="rounded-none border border-border bg-card p-7 shadow-sm flex flex-col gap-4 h-full hover-lift">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[15px] text-foreground/80 leading-relaxed flex-1 text-pretty">"{t.text}"</p>
                <div className="pt-2 border-t border-border">
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-zinc-500">{t.company}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Trust badges */}
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-8 border-t border-border">
            {[
              { icon: Shield, text: g.trustBadges[0] },
              { icon: Check,  text: g.trustBadges[1] },
              { icon: Lock,   text: g.trustBadges[2] },
              { icon: Globe,  text: g.trustBadges[3] },
              { icon: Star,   text: g.trustBadges[4] },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 text-zinc-500 shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Main GatewaySections component ── */
interface Props {
  onOpenCatalog?: () => void;
}

export function GatewaySections({ onOpenCatalog }: Props) {
  const navigate = useNavigate();
  const { user, profile, role } = useAuthContext();
  const partnerContext = buildPartnerContext({ profile, role });
  const { lang, gatewayOpen, setGatewayOpen } = useStore();
  const g = gateway[lang];
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'b2b'>('login');

  const openAuth = (tab: 'login' | 'register' | 'b2b') => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const sections = [
    {
      id: 'velkoobchod',
      ...g.velkoobchod,
      ctas: (<div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => navigate('/velkoobchod')} className="gap-2">
          {g.velkoobchod.ctaLabel} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>),
      visual: <B2BVisual />, reverse: false,
    },
    {
      id: 'luxury',
      ...g.luxury,
      ctas: (<Button onClick={() => navigate('/luxury')} className="gap-2">
        {g.luxury.ctaLabel} <ArrowRight className="h-4 w-4" />
      </Button>),
      visual: <LuxuryVisual />, reverse: true,
    },
    {
      id: 'feed',
      ...g.feed,
      ctas: (<Button onClick={() => navigate('/feed')} className="gap-2">
        {g.feed.ctaLabel} <ArrowRight className="h-4 w-4" />
      </Button>),
      visual: <FeedVisual />, reverse: false,
    },
    {
      id: 'dropshipping',
      ...g.dropshipping,
      ctas: (<Button onClick={() => navigate('/dropshipping')} className="gap-2">
        {g.dropshipping.ctaLabel} <ArrowRight className="h-4 w-4" />
      </Button>),
      visual: <DropshippingVisual />, reverse: true,
    },
  ];

  return (
    <div className="gateway-sections relative w-full bg-white text-foreground">

      {/* ══════════════════════════════════════════
          0. INTRO — logo + tagline
      ══════════════════════════════════════════ */}
      <section className="relative pt-1 sm:pt-[18px] lg:pt-5 pb-14 sm:pb-20">
        {/* Netflix-carousel (HeroBanner) odstraněn — sekce začíná rovnou
            policemi značek a koncernů. */}

        {/* ── Brand logos — Amazon-style shelf carousel (all brands) ── */}
        <div className="mt-2 sm:mt-3">
          <BrandLogoRow />
        </div>

        {/* ── Concern carousel — hodinářské koncerny (last of the three) ── */}
        <div className="mt-12 sm:mt-16">
          <ConcernCarousel />
        </div>

        {/* ── Premium segment + private purchase (contained) ── */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* ── Prémiový segment na poptávku — v typografii homepage
                 (extralight nadpis, iOS pilulka), CTA vede na /prestige ── */}
          <Reveal delay={200}>
            <div className="mt-10 pt-10 border-t border-border text-center">
              <h2 className="font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.35rem,3vw,2.25rem)] text-foreground mb-3">
                Na poptávku i <span className="text-zinc-400">prémiový segment.</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-2xl mx-auto">
                Omega, Cartier nebo IWC — kurátorovaný výběr prémiových domů zajistíme na poptávku.
                Nabídku dostanete do 24 hodin.
              </p>
              <div className="flex flex-wrap gap-x-2 gap-y-3 items-center justify-center mb-7">
                {BRANDS_PREMIUM.map((brand) => (
                  <div key={brand.name} className="px-4 py-2.5 flex items-center justify-center min-w-[96px] group">
                    <BrandLogo
                      name={brand.name}
                      domain={brand.domain}
                      width={320}
                      height={128}
                      className="h-6 sm:h-7 w-auto max-w-[130px] object-contain transition-transform duration-300 ease-out group-hover:scale-110 [mix-blend-mode:multiply]"
                      fallbackClassName="text-xs sm:text-sm font-semibold text-foreground"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate('/prestige')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                Prozkoumat prémiový výběr <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </Reveal>

        </div>
      </section>

      {/* Sekce „Doručujeme do 15+ zemí" (mapa + seznam trhů) i „Čtyři
          překážky" odstraněny — expanzi vypráví DropshipFlowMap výše. */}

      {/* ══════════════════════════════════════════
          3. CTA — Prohlédnout sortiment + Vytvořit B2B účet (only for guests)
      ══════════════════════════════════════════ */}
      {/* Plnoformátová sekce ve vzoru homepage: zaoblený horní okraj odkrývá
          bílou předchozí sekce, jemný zinc-50 tón s radiálem (stejný jako
          filtrační pruh katalogu). */}
      {!user && <div className="bg-white">
      <section className="w-full rounded-t-[1.75rem] sm:rounded-t-[2.75rem] bg-zinc-50 [background-image:radial-gradient(ellipse_90%_75%_at_50%_45%,#ffffff_0%,rgba(255,255,255,0)_72%)] px-5 py-14 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="text-center">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Začněte ještě dnes</p>
              <h2 className="font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.5rem,4vw,2.75rem)] text-foreground mb-3">
                15 000+ produktů.{' '}
                <span className="text-zinc-400">Velkoobchodní ceny od 1 kusu.</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                Zaregistrujte se zdarma — katalog otevřete hned, velkoobchodní ceny se odemknou
                po schválení do 24 hodin.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                  onClick={() => openAuth('register')}
                >
                  Vytvořit B2B účet <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 px-7 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50"
                  onClick={() => openAuth('login')}
                >
                  Prohlédnout sortiment
                </button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Registrace zdarma</span>
                <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Schválení do 24 hodin</span>
                <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Bez závazků</span>
                <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Bez kreditní karty</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      </div>}

      {/* ══════════════════════════════════════════
          4. KATALOG — lead capture (jen pro hosty; nadpis „Jeden partner…",
          servisní karty i blok „Potřebujete poradit?" odstraněny).
          Plnobarevná sekce v tmavé brand modré (blue-900), zaoblený okraj
          odkrývá zinc-50 sekce nad ní.
      ══════════════════════════════════════════ */}
      {!user && (
      <div className="bg-zinc-50">
      <section className="w-full rounded-t-[1.75rem] sm:rounded-t-[2.75rem] px-5 py-16 sm:px-10 sm:py-24 text-white bg-blue-900">
        <div className="relative mx-auto max-w-4xl">
            <Reveal delay={100}>
              <div className="relative">
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 text-white px-3 py-1 text-[10px] font-semibold tracking-wider uppercase backdrop-blur">
                      <Eye className="h-3 w-3" /> Zdarma · 30 sekund
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-white/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Bez čekání
                    </div>
                  </div>
                  <h3 className="font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.5rem,3.5vw,2.5rem)] text-white mb-3 text-left">
                    Prohlédněte si celý katalog —{' '}
                    <span className="text-white/70">zdarma a bez čekání.</span>
                  </h3>
                  <div className="text-sm sm:text-base text-white/85 mb-5 text-left max-w-2xl leading-relaxed space-y-3">
                    <p>
                      Nahlédněte dřív, než cokoli rozhodnete: přihlášení e-mailem nebo přes Google
                      trvá 30 sekund. Velkoobchodní ceny se odemknou po ověření B2B účtu —
                      zpravidla do 24 hodin, zcela zdarma.
                    </p>
                  </div>
                  {/* AccessTiersVisual je stavěný na bílou — na gradientu jede v bílé kartě */}
                  <div className="mb-5 rounded-2xl bg-white p-4 sm:p-5">
                    <AccessTiersVisual />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
                    <button onClick={() => openAuth('login')} className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 sm:text-base">
                      <Eye className="h-4 w-4 shrink-0" /> Prohlédnout sortiment <ArrowRight className="h-4 w-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <div className="text-[11px] text-white/80 sm:ml-2">15 000+ produktů · 65+ značek · Bez závazku</div>
                  </div>
                </div>
              </div>
            </Reveal>
        </div>
      </section>
      </div>
      )}

      {/* ══════════════════════════════════════════
          Závěr stránky — užitečné funkce + rozcestník webu
      ══════════════════════════════════════════ */}
      <HomeFooter />

      <FloatingNotif />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
      <GatewayPanel open={gatewayOpen} onClose={() => setGatewayOpen(false)} partnerContext={partnerContext} />
    </div>
  );
}
