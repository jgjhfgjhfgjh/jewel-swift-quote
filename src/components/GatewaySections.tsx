import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Handshake, PackageOpen, HandCoins, ShoppingCart, Rss,
  Check, ArrowRight, ChevronRight, Users, Star, Shield,
  TrendingUp, Zap, Globe, FileText, BarChart3, Lock,
  Package, Clock, Rocket, RefreshCw, Sparkles, Eye,
} from 'lucide-react';
import { GatewayPanel } from './GatewayPanel';
import { GatewayMascot3D } from './SweltGateway';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/AuthModal';
import { AccessTiersVisual } from '@/components/AccessTiersVisual';
import { useAuthContext } from '@/contexts/AuthContext';
import { buildPartnerContext } from '@/lib/chatContext';
import { useStore } from '@/lib/store';
import { gateway } from '@/lib/i18n-gateway';

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
      v += step;
      if (v >= to) { setCount(to); clearInterval(id); } else setCount(v);
    }, 35);
    return () => clearInterval(id);
  }, [revealed, to]);
  return <span ref={ref}>{count.toLocaleString('cs')}{suffix}</span>;
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
          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
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
    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/60" style={{ minHeight: '360px' }}>

      {/* ── Catalog grid behind the glass ── */}
      <div className="absolute inset-0" style={{ filter: 'blur(1.5px) brightness(0.96)' }}>
        <div className="bg-slate-50 p-3 h-full flex items-center justify-center">
          {/* Centered product grid only — no sidebar, full row visible */}
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm">
            {catalogItems.map((item, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                <div className="relative">
                  <img src={item.img} alt={item.brand} className="w-full aspect-square object-cover object-center" loading="lazy" />
                  <div className="absolute top-1.5 right-1.5 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">{item.disc}</div>
                  <div className="absolute top-1.5 left-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 block ring-2 ring-white" />
                  </div>
                </div>
                <div className="p-2">
                  <div className="text-[9px] font-bold text-amber-600 truncate">{item.brand}</div>
                  <div className="text-[10px] font-bold text-primary">{item.voc}</div>
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
          background: 'linear-gradient(135deg, rgba(255,255,255,0.38) 0%, rgba(219,234,254,0.30) 100%)',
          borderRadius: 'inherit',
        }}
      >
        {/* Glow ring around lock */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full bg-primary/20 blur-md animate-pulse" />
          <div className="relative h-16 w-16 rounded-full bg-white/80 border border-white/70 shadow-xl flex items-center justify-center">
            <Lock className="h-7 w-7 text-primary" />
          </div>
        </div>

        <div>
          <div className="font-display text-2xl font-bold text-foreground mb-1">3 000+ produktů</div>
          <div className="text-sm text-foreground/70 leading-snug">
            70+ prémiových značek · slevy 40–65 %<br />Přihlaste se a odemkněte celý katalog.
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
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />Live zásoby</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />Aktualizace denně</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />Ceny bez DPH</span>
        </div>
      </div>
    </div>
  );
}

function FeedVisual() {
  const formats = ['XML', 'CSV', 'Heureka', 'Zbozi.cz', 'Google'];
  const [active, setActive] = useState(0);
  return (
    <div className="rounded-2xl border border-border bg-white shadow-lg p-5 space-y-4">
      <div className="text-[11px] font-bold text-primary uppercase tracking-wider">swelt.feed — Live preview</div>
      <div className="flex flex-wrap gap-1.5">
        {formats.map((f, i) => (
          <button key={f} onClick={() => setActive(i)}
            className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-all border ${active === i ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-slate-900 text-slate-300 p-3 font-mono text-[10px] leading-relaxed overflow-hidden">
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
        <div className="rounded-lg bg-muted/40 border border-border p-2 text-center">
          <div className="text-lg font-bold text-primary">3 000+</div>
          <div className="text-[10px] text-muted-foreground">produktů v feedu</div>
        </div>
        <div className="rounded-lg bg-muted/40 border border-border p-2 text-center">
          <div className="text-lg font-bold text-primary">4×/den</div>
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
    <div className="rounded-2xl border border-border bg-white shadow-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold text-primary uppercase tracking-wider">Jak to funguje</div>
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-[10px]">Bez skladu</Badge>
      </div>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-lg shrink-0">
              {s.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{s.label}</div>
              <div className="text-[11px] text-muted-foreground">{s.sub}</div>
            </div>
            <div className="text-[10px] font-bold text-primary/60">{s.n}</div>
            {i < steps.length - 1 && (
              <div className="absolute ml-5 mt-12 w-px h-4 bg-primary/20" />
            )}
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-muted/40 border border-border p-3 grid grid-cols-2 gap-2 text-center">
        <div>
          <div className="text-base font-bold text-emerald-600">60 %</div>
          <div className="text-[10px] text-muted-foreground">průměrná marže</div>
        </div>
        <div>
          <div className="text-base font-bold text-primary">0 Kč</div>
          <div className="text-[10px] text-muted-foreground">investice do skladu</div>
        </div>
      </div>
    </div>
  );
}

function LuxuryVisual() {
  const brands = ['Tommy Hilfiger', 'Versace', 'Police', 'Tissot', 'Seiko', 'Hugo Boss', 'Armani', 'Citizen'];
  return (
    <div className="rounded-2xl border border-border bg-white shadow-lg p-5 space-y-4">
      <div className="text-[11px] font-bold text-primary uppercase tracking-wider">Dostupné značky</div>
      <div className="flex flex-wrap gap-2">
        {brands.map(b => (
          <span key={b} className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-foreground/80">{b}</span>
        ))}
        <span className="rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">+62 dalších</span>
      </div>
      <div className="rounded-xl bg-primary text-primary-foreground p-4">
        <div className="text-[10px] opacity-70 uppercase tracking-wider mb-1">Příklad úspory</div>
        <div className="text-2xl font-bold mb-0.5">2 685 Kč</div>
        <div className="text-xs opacity-80">ušetříte na 1 Tommy Hilfiger hodinkách</div>
        <div className="mt-2 flex justify-between text-[11px] opacity-70">
          <span>Retail cena: 4 475 Kč</span>
          <span>Vaše cena: 1 790 Kč</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
        Garance pravosti | Diskrétní balení | EU doručení
      </div>
    </div>
  );
}

function ShopVisual() {
  const [tab, setTab] = useState(0);
  const tabs = ['Hodinky', 'Šperky'];
  const products = [
    { img: 'https://cdn.b2bzago.com/images/0/7afe1cca249d731c/100/hodinky-tommy-hilfiger-model-decker-1791349.jpg?hash=-2', name: 'Tommy Hilfiger', price: '4 475 Kč', badge: 'NOVÉ' },
    { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=70', name: 'Versace', price: '7 225 Kč' },
    { img: 'https://images.unsplash.com/photo-1542496658-e33a6d0d3cde?auto=format&fit=crop&w=200&q=70', name: 'Police', price: '3 125 Kč', badge: '-15%' },
    { img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=200&q=70', name: 'Seiko', price: '5 250 Kč' },
  ];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      {/* Browser chrome */}
      <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded px-2 py-0.5 text-[10px] text-slate-400 border border-slate-200">
          vaseshop.cz
        </div>
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>
      {/* Fake shop nav */}
      <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-white">
        <div className="font-display font-black text-[11px] text-slate-800">WatchStore.cz</div>
        <div className="flex gap-3">
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`text-[10px] font-semibold pb-0.5 border-b transition-colors ${tab === i ? 'text-primary border-primary' : 'text-slate-400 border-transparent'}`}>
              {t}
            </button>
          ))}
        </div>
        <ShoppingCart className="h-3.5 w-3.5 text-primary" />
      </div>
      {/* Product grid */}
      <div className="p-3 grid grid-cols-2 gap-2 bg-slate-50">
        {products.map((p) => (
          <div key={p.name} className="bg-white rounded-xl overflow-hidden border border-slate-100">
            <div className="relative">
              <img src={p.img} alt={p.name} className="w-full aspect-square object-cover" loading="lazy" />
              {p.badge && <div className="absolute top-1 right-1 bg-primary text-white text-[7px] font-black px-1 py-0.5 rounded">{p.badge}</div>}
            </div>
            <div className="p-1.5">
              <div className="text-[9px] text-slate-500 truncate">{p.name}</div>
              <div className="text-[10px] font-black text-primary">{p.price}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Status */}
      <div className="px-3 py-2 border-t border-slate-100 bg-white flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="text-[9px] text-emerald-600 font-semibold">Aktualizováno před 2 hod. · 3 000+ produktů</span>
        <div className="ml-auto flex items-center gap-1">
          <Rocket className="h-3 w-3 text-orange-400" />
          <span className="text-[9px] text-orange-500 font-semibold">swelt.shop</span>
        </div>
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
    <section className="relative bg-gradient-to-b from-background via-secondary/30 to-background py-24 sm:py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-70" />
      <div className="relative mx-auto max-w-6xl px-6">
        {/* Stats */}
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] tracking-[0.2em] uppercase text-primary font-semibold mb-4">
            {g.trustEyebrow}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">{g.trustHeading}</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-20">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="group text-center rounded-2xl border border-border bg-card p-7 shadow-sm hover-lift">
                <div className="font-display text-4xl sm:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
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
              <div className="rounded-2xl border border-border bg-card p-7 shadow-sm flex flex-col gap-4 h-full hover-lift">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[15px] text-foreground/80 leading-relaxed flex-1 text-pretty">"{t.text}"</p>
                <div className="pt-2 border-t border-border">
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-primary">{t.company}</div>
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
                <Icon className="h-4 w-4 text-primary shrink-0" />
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
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const openAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const sections = [
    {
      id: 'velkoobchod', badgeColor: 'bg-primary/10 text-primary', icon: Handshake,
      ...g.velkoobchod,
      ctas: (<div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => navigate('/velkoobchod')} className="gap-2">
          {g.velkoobchod.ctaLabel} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>),
      visual: <B2BVisual />, reverse: false, bg: 'bg-white',
    },
    {
      id: 'luxury', badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200', icon: HandCoins,
      ...g.luxury,
      ctas: (<Button onClick={() => navigate('/luxury')} className="gap-2">
        {g.luxury.ctaLabel} <ArrowRight className="h-4 w-4" />
      </Button>),
      visual: <LuxuryVisual />, reverse: true, bg: 'bg-muted/20',
    },
    {
      id: 'feed', badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: Rss,
      ...g.feed,
      ctas: (<Button onClick={() => navigate('/feed')} className="gap-2">
        {g.feed.ctaLabel} <ArrowRight className="h-4 w-4" />
      </Button>),
      visual: <FeedVisual />, reverse: false, bg: 'bg-white',
    },
    {
      id: 'dropshipping', badgeColor: 'bg-primary/10 text-primary', icon: PackageOpen,
      ...g.dropshipping,
      ctas: (<Button onClick={() => navigate('/dropshipping')} className="gap-2">
        {g.dropshipping.ctaLabel} <ArrowRight className="h-4 w-4" />
      </Button>),
      visual: <DropshippingVisual />, reverse: true, bg: 'bg-muted/20',
    },
    {
      id: 'shop', badgeColor: 'bg-primary/10 text-primary', icon: ShoppingCart,
      ...g.shop,
      ctas: (<Button onClick={() => navigate('/shop')} className="gap-2">
        {g.shop.ctaLabel} <ArrowRight className="h-4 w-4" />
      </Button>),
      visual: <ShopVisual />, reverse: false, bg: 'bg-white',
    },
  ];

  return (
    <div className="gateway-sections relative w-full bg-background text-foreground">
      {/* Intro strip */}
      <div className="relative bg-gradient-subtle border-b border-border py-16 sm:py-20 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-mesh" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-grid opacity-40" />

        <div className="relative">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] tracking-[0.2em] uppercase text-primary font-semibold mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            {g.introEyebrow}
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4 max-w-3xl mx-auto px-6 tracking-tight text-balance">
            {g.introHeading}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto px-6 text-pretty">
            {g.introSubheading}
          </p>
        </Reveal>
        {/* Section quick-nav cards — full label always visible, wraps naturally */}
        <Reveal delay={100} className="mt-8 px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="inline-flex items-center gap-2 shrink-0 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-400 transition-all rounded-2xl px-4 py-2.5 shadow-sm group"
                >
                  <div className="w-7 h-7 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 transition-colors flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-zinc-700 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-zinc-900 font-semibold text-sm whitespace-nowrap">{s.label}</span>
                  <div className="w-5 h-5 rounded-full bg-zinc-900 group-hover:bg-zinc-700 transition-colors flex items-center justify-center shrink-0">
                    <ArrowRight className="h-3 w-3 text-white" />
                  </div>
                </a>
              );
            })}
          </div>
        </Reveal>

        {/* Lead capture — preview catalog (only when not logged in) */}
        {!user && (
          <Reveal delay={130} className="mt-8 px-4 sm:px-6">
            <div className="mx-auto max-w-3xl relative overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white shadow-xl">
              <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative p-5 sm:p-8">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 text-white px-3 py-1 text-[10px] font-semibold tracking-wider uppercase">
                    <Eye className="h-3 w-3" />
                    Zdarma · 30 sekund
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Bez čekání
                  </div>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-black text-zinc-900 leading-tight mb-2 sm:mb-3 text-left">
                  Prohlédněte si celý katalog ještě dnes — zdarma a bez čekání.
                </h3>
                <div className="text-sm sm:text-base text-zinc-600 mb-5 sm:mb-6 text-left max-w-2xl leading-relaxed space-y-3">
                  <p>
                    Víme, že vstoupit do nového partnerství chce důvěru. Proto vám umožňujeme nahlédnout do katalogu ještě předtím, než cokoliv rozhodujete. Stačí se přihlásit přes e-mail nebo Google — trvá to 30 sekund.
                  </p>
                  <p>
                    Uvidíte celý sortiment: 3 000+ produktů, fotky, dostupnost v reálném čase a doporučené maloobchodní ceny (MOC). Takže si rovnou spočítáte, jaké marže vás čekají.
                  </p>
                  <p>
                    Velkoobchodní nákupní ceny jsou skryté a odemknou se automaticky po ověření a schválení vašeho B2B účtu — zpravidla do 24 hodin. Registrace je zcela zdarma.
                  </p>
                </div>

                <div className="mb-5 sm:mb-6">
                  <AccessTiersVisual />
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 sm:items-center">
                  <button
                    onClick={() => openAuth('login')}
                    className="group flex items-center justify-center gap-2 sm:gap-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl px-5 py-3.5 sm:px-6 sm:py-4 shadow-lg transition-all font-bold text-sm sm:text-base"
                  >
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span>Prohlédnout sortiment</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <div className="text-[11px] sm:text-xs text-zinc-500 sm:ml-2">
                    3 000+ produktů · 70+ značek<br className="hidden sm:block" />
                    <span className="sm:hidden"> · </span>Bez závazku
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Unified premium gateway — Account Manager + AI assistant */}
        <Reveal delay={150} className="mt-8 px-4 sm:px-6">
          <div className="mx-auto max-w-3xl relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-white to-zinc-50 shadow-xl">
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative p-5 sm:p-7">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 text-white px-3 py-1 text-[10px] font-semibold tracking-wider uppercase">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  Váš osobní obchodní tým
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online teď
                </div>
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 leading-tight mb-1.5 text-left">
                Potřebujete poradit? Jsme tu pro vás.
              </h3>
              <p className="text-sm text-zinc-600 mb-5 sm:mb-6 text-left max-w-xl">
                Vyberte si, jak vám pomůžeme nejrychleji — okamžitá odpověď AI asistenta, nebo osobní péče vašeho account managera.
              </p>

              {/* Two CTAs */}
              <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                {/* AI assistant CTA — preserves original gateway open route */}
                <button
                  onClick={() => setGatewayOpen(true)}
                  className="group flex items-center gap-3 sm:gap-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 shadow-md transition-all text-left"
                >
                  <div className="shrink-0">
                    <GatewayMascot3D size={44} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-zinc-400 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider mb-0.5">
                      <Sparkles className="h-3 w-3 shrink-0" />
                      <span>Odpověď do 5 vteřin</span>
                    </div>
                    <p className="font-bold text-sm leading-tight">Promluvit s AI asistentem</p>
                    <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">Ceny, dostupnost, doporučení 24/7</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors flex items-center justify-center shrink-0">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </div>
                </button>

                {/* Account manager CTA */}
                <button
                  onClick={() => navigate('/partner')}
                  className="group flex items-center gap-3 sm:gap-4 bg-white hover:bg-amber-50 border border-zinc-200 hover:border-amber-300 rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 shadow-md transition-all text-left"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300/60 flex items-center justify-center shrink-0 shadow-inner">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-amber-700 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider mb-0.5">
                      <Star className="h-3 w-3 shrink-0 fill-amber-500 text-amber-500" />
                      <span>Osobní péče</span>
                    </div>
                    <p className="font-bold text-sm leading-tight text-zinc-900">Kontaktovat account managera</p>
                    <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">Strategie, individuální nabídka, volání</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-900 group-hover:bg-amber-600 transition-colors flex items-center justify-center shrink-0">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </div>
                </button>
              </div>

              {/* Footer reassurance */}
              <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-600" /> Zdarma a nezávazně</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-600" /> Odpověď do 24 h</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-600" /> Česky &amp; slovensky</span>
              </div>
            </div>
          </div>
        </Reveal>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, idx) => {
        const Icon = section.icon;
        return (
          <section
            key={section.id}
            id={section.id}
            className={`relative py-20 sm:py-28 scroll-mt-16 ${idx % 2 === 0 ? 'bg-background' : 'bg-secondary/40'}`}
          >
            {/* Subtle decorative gradient */}
            <div className={`pointer-events-none absolute inset-0 ${idx % 2 === 0 ? 'bg-mesh opacity-60' : ''}`} />

            <div className="relative mx-auto max-w-6xl px-6">
              <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${section.reverse ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''}`}>
                {/* Text side */}
                <Reveal>
                  <div className="space-y-7">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-xs">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                        {section.label}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight mb-4 text-balance">
                        {section.heading}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed text-base sm:text-lg text-pretty max-w-xl">
                        {section.subheading}
                      </p>
                    </div>
                    <BulletList items={section.bullets} />
                    <div className="pt-2">{section.ctas}</div>
                  </div>
                </Reveal>

                {/* Visual side */}
                <Reveal delay={120}>
                  <div className="relative">
                    {/* Glow behind visual */}
                    <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-primary opacity-[0.08] blur-2xl" />
                    <div className="relative">{section.visual}</div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>
        );
      })}

      <SectionDivider />

      {/* Trust section */}
      <TrustSection />

      <FloatingNotif />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
      <GatewayPanel open={gatewayOpen} onClose={() => setGatewayOpen(false)} partnerContext={partnerContext} />
    </div>
  );
}
