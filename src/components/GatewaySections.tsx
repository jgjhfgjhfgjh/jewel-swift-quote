import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Handshake, PackageOpen, HandCoins, ShoppingCart, Rss,
  Check, ArrowRight, Users, Star, Shield,
  Globe, Lock,
  Rocket, Sparkles, Eye,
  X,
} from 'lucide-react';
import { GatewayPanel } from './GatewayPanel';
import { EuropeMap } from './EuropeMap';
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
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('floatingNotifDismissed') === '1';
  });

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
    try { sessionStorage.setItem('floatingNotifDismissed', '1'); } catch {}
  };

  if (dismissed) return null;

  return (
    <div className={`fixed bottom-20 left-4 z-50 transition-all duration-500 lg:bottom-6 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="relative flex items-center gap-3 rounded-xl border border-border bg-white shadow-xl px-4 py-3 pr-9 max-w-xs">
        <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
          <Users className="h-4 w-4 text-zinc-500" />
        </div>
        <div>
          <div className="text-xs font-semibold">{notifs[idx].name} z {notifs[idx].city}</div>
          <div className="text-[11px] text-muted-foreground">{notifs[idx].action} · právě teď</div>
        </div>
        <button
          onClick={handleClose}
          aria-label="Zavřít notifikaci"
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
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
          <Check className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" strokeWidth={2.5} />
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
                  <div className="absolute top-1.5 right-1.5 bg-zinc-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">{item.disc}</div>
                  <div className="absolute top-1.5 left-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 block ring-2 ring-white" />
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
          <div className="absolute h-20 w-20 rounded-full bg-zinc-900/10 blur-md animate-pulse" />
          <div className="relative h-16 w-16 rounded-full bg-white/80 border border-white/70 shadow-xl flex items-center justify-center">
            <Lock className="h-7 w-7 text-zinc-700" />
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
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0" />Aktualizace denně</span>
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
      <div className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">swelt.feed — Live preview</div>
      <div className="flex flex-wrap gap-1.5">
        {formats.map((f, i) => (
          <button key={f} onClick={() => setActive(i)}
            className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-all border ${active === i ? 'bg-zinc-900 text-white border-zinc-900' : 'border-border text-muted-foreground hover:border-zinc-400'}`}>
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
          <div className="text-lg font-bold text-zinc-900">3 000+</div>
          <div className="text-[10px] text-muted-foreground">produktů v feedu</div>
        </div>
        <div className="rounded-lg bg-muted/40 border border-border p-2 text-center">
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
    <div className="rounded-2xl border border-border bg-white shadow-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">Jak to funguje</div>
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-[10px]">Bez skladu</Badge>
      </div>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center text-lg shrink-0">
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
      <div className="rounded-xl bg-muted/40 border border-border p-3 grid grid-cols-2 gap-2 text-center">
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
    <div className="rounded-2xl border border-border bg-white shadow-lg p-5 space-y-4">
      <div className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">Dostupné značky</div>
      <div className="flex flex-wrap gap-2">
        {brands.map(b => (
          <span key={b} className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-foreground/80">{b}</span>
        ))}
        <span className="rounded-lg border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-700">+62 dalších</span>
      </div>
      <div className="rounded-xl bg-zinc-900 text-white p-4">
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
        <div className="font-display font-semibold text-[11px] text-slate-800">WatchStore.cz</div>
        <div className="flex gap-3">
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`text-[10px] font-semibold pb-0.5 border-b transition-colors ${tab === i ? 'text-zinc-900 border-zinc-900' : 'text-slate-400 border-transparent'}`}>
              {t}
            </button>
          ))}
        </div>
        <ShoppingCart className="h-3.5 w-3.5 text-zinc-700" />
      </div>
      {/* Product grid */}
      <div className="p-3 grid grid-cols-2 gap-2 bg-slate-50">
        {products.map((p) => (
          <div key={p.name} className="bg-white rounded-xl overflow-hidden border border-slate-100">
            <div className="relative">
              <img src={p.img} alt={p.name} className="w-full aspect-square object-cover" loading="lazy" />
              {p.badge && <div className="absolute top-1 right-1 bg-zinc-900 text-white text-[7px] font-semibold px-1 py-0.5 rounded">{p.badge}</div>}
            </div>
            <div className="p-1.5">
              <div className="text-[9px] text-slate-500 truncate">{p.name}</div>
              <div className="text-[10px] font-semibold text-zinc-900">{p.price}</div>
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
    <section className="relative bg-slate-50 py-24 sm:py-28 overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6">
        {/* Stats */}
        <Reveal className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">{g.trustHeading}</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-20">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="group text-center rounded-2xl border border-border bg-card p-7 shadow-sm hover-lift">
                <div className="font-display text-4xl sm:text-5xl font-semibold text-zinc-900 mb-2">
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
    {
      id: 'shop',
      ...g.shop,
      ctas: (<Button onClick={() => navigate('/shop')} className="gap-2">
        {g.shop.ctaLabel} <ArrowRight className="h-4 w-4" />
      </Button>),
      visual: <ShopVisual />, reverse: false,
    },
  ];

  const SERVICE_CARDS = [
    {
      id: 'velkoobchod', icon: Handshake, label: 'B2B Velkoobchod', path: '/velkoobchod',
      desc: 'Nakupujte prémiové hodinky a šperky přímo od dodavatele za velkoobchodní ceny. Pro firmy s IČO.',
      img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      cta: 'Vstoupit do velkoobchodu',
    },
    {
      id: 'luxury', icon: HandCoins, label: 'Nákup bez registrace', path: '/luxury',
      desc: 'Velkoobchodní ceny pro soukromé osoby i firmy. Bez nutnosti IČO, od 1 kusu, diskrétní balení.',
      img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      cta: 'Zjistit více',
    },
    {
      id: 'feed', icon: Rss, label: 'Feed', path: '/feed',
      desc: 'Automatický XML/CSV feed 3 000+ produktů pro váš e-shop. Heureka, Zbozi.cz, Google Shopping.',
      img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
      cta: 'Zjistit více o feedu',
    },
    {
      id: 'dropshipping', icon: PackageOpen, label: 'Dropshipping', path: '/dropshipping',
      desc: 'Prodávejte bez skladu. Zákazník objedná u vás — my zabalíme a odešleme pod vaší značkou.',
      img: 'https://cdn.b2bzago.com/images/0/40e7be43bcf6ce73/100/hodinky-calvin-klein-model-even-k7b21626.jpg?hash=-2',
      img2: 'https://cdn.b2bzago.com/images/0/cdefdb9188767a36/100/nahrdelnik-calvin-klein-model-35000294.jpg?hash=-2',
      cta: 'Chci dropshipping',
    },
    {
      id: 'shop', icon: ShoppingCart, label: 'E-shop do 48h', path: '/shop',
      desc: 'Hotový e-shop naplněný 3 000+ produkty. Spuštění do 48 hodin, žádné zkušenosti nepotřebujete.',
      img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
      cta: 'Chci svůj e-shop',
    },
  ];

  const COUNTRIES = [
    { code: 'cz', name: 'Česká republika' },
    { code: 'sk', name: 'Slovensko' },
    { code: 'at', name: 'Rakousko' },
    { code: 'de', name: 'Německo' },
    { code: 'pl', name: 'Polsko' },
    { code: 'hu', name: 'Maďarsko' },
    { code: 'ro', name: 'Rumunsko' },
    { code: 'bg', name: 'Bulharsko' },
    { code: 'hr', name: 'Chorvatsko' },
    { code: 'si', name: 'Slovinsko' },
    { code: 'ba', name: 'Bosna a Hercegovina' },
    { code: 'rs', name: 'Srbsko' },
    { code: 'gr', name: 'Řecko' },
    { code: 'it', name: 'Itálie' },
    { code: 'fr', name: 'Francie' },
  ];

  const BRANDS_STANDARD = [
    'Tommy Hilfiger', 'Versace', 'Emporio Armani', 'Hugo Boss', 'Guess', 'Police',
    'Calvin Klein', 'Citizen', 'Casio', 'Tissot', 'Fossil', 'DKNY',
    'Lacoste', 'Swarovski', 'Pandora', 'Morellato', 'Esprit', 'Pierre Lannier',
    'Roberto Cavalli', 'Sector', 'Invicta', 'Timex', 'Nautica', 'Fila',
    'Breil', 'Viceroy', 'Mark Maddox', 'Moschino', 'Versus Versace', 'Just Cavalli',
  ];

  const BRANDS_PREMIUM = [
    'Tag Heuer', 'Longines', 'Hamilton', 'Certina',
    'Frederique Constant', 'Mido', 'Breitling', 'Rado', 'Oris',
  ];

  return (
    <div className="gateway-sections relative w-full bg-background text-foreground">

      {/* ══════════════════════════════════════════
          0. INTRO — logo + tagline
      ══════════════════════════════════════════ */}
      <section className="pt-10 sm:pt-14 pb-16 sm:pb-24 bg-slate-50 border-b border-border overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 text-center">
          {/* 1) Big swelt. logo — at the top */}
          <Reveal>
            <div className="relative inline-flex items-baseline justify-center mx-auto">
              <h1
                className="font-spartan font-extrabold tracking-tighter text-foreground text-5xl sm:text-8xl md:text-9xl leading-none select-none"
                style={{ letterSpacing: '-0.05em' }}
              >
                swelt.
              </h1>
              <span className="relative ml-1 sm:ml-2 inline-block">
                {/* Width placeholder = PARTNER (centerpiece reference) */}
                <span aria-hidden className="invisible font-sans font-extrabold text-base sm:text-2xl md:text-3xl lg:text-4xl whitespace-nowrap">PARTNER</span>
                <span className="absolute left-0 top-0 font-sans font-extrabold tracking-tight text-base sm:text-2xl md:text-3xl lg:text-4xl">
                  <RotatingSuffix words={['PARTNER', 'EU', 'DROPSHIPPING', 'FEED', 'DEAL']} />
                </span>
              </span>
            </div>
          </Reveal>

          {/* 2) Subtitle — matches section pt so logo sits vertically centered between page top and subtitle */}
          <div className="mt-10 sm:mt-6 text-sm sm:text-lg md:text-xl" aria-hidden />

          {/* 3) Brand pills — clickable, all screens, with breathing room from subtitle */}
          <Reveal delay={140}>
            <div className="mt-8 sm:mt-8 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
              {[
                'Tommy Hilfiger', 'Versace', 'Emporio Armani', 'Hugo Boss', 'Guess',
                'Police', 'Calvin Klein', 'Citizen', 'Casio', 'Tissot', 'Fossil',
                'DKNY', 'Lacoste', 'Swarovski', 'Pandora', 'Morellato', 'Esprit',
                'Pierre Lannier',
              ].map((brand) => (
                <button
                  key={brand}
                  onClick={() => navigate(`/brands#${brand.toLowerCase().replace(/\s+/g, '-')}`)}
                  className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-foreground/75 hover:border-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                >
                  {brand}
                </button>
              ))}
              <button
                onClick={() => navigate('/brands')}
                className="rounded-xl border border-zinc-900 bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-zinc-800 hover:border-zinc-800 transition-colors"
              >
                +50 dalších →
              </button>
            </div>
          </Reveal>

          {/* 4) Value prop — tight gap from pills on both mobile and desktop */}
          <Reveal delay={200}>
            <p className="font-sans mt-10 text-base sm:text-lg font-semibold text-foreground tracking-tight">
              Přístup k 5 000+ produktům<span className="hidden sm:inline"> za velkoobchodní ceny</span>
            </p>
          </Reveal>

          {/* 5) CTAs — original compact size */}
          <Reveal delay={240}>
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={() => openAuth('b2b')}
                className="px-8 py-3 rounded-md bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 transition min-w-[200px]"
              >
                B2B registrace
              </button>
              <button
                onClick={() => openAuth('register')}
                className="px-8 py-3 rounded-md border border-zinc-300 bg-white text-foreground font-semibold text-sm hover:bg-zinc-50 transition min-w-[200px]"
              >
                Prohlédnout katalog
              </button>
            </div>
          </Reveal>

          {/* 6) Bullets */}
          <Reveal delay={280}>
            <ul className="mt-3 sm:mt-[22px] flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} /> Registrace zdarma</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} /> Schválení do 24 hodin</li>
              <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} /> Bez závazků</li>
              <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} /> Bez kreditní karty</li>
            </ul>
          </Reveal>
        </div>

        {/* Brands marquee — two rows opposite directions, desktop only */}
        <Reveal delay={320}>
          <div className="hidden sm:block mt-12 sm:mt-14 w-full space-y-6">
            {[
              ['SWAROVSKI', 'PANDORA', 'D1 MILANO', 'TOMMY HILFIGER', 'CALVIN KLEIN', 'TISSOT', 'PIERRE LANNIER', 'LONGINES'],
              ['TAG HEUER', 'HAMILTON', 'CERTINA', 'BREITLING', 'RADO', 'ORIS', 'MIDO', 'FREDERIQUE CONSTANT'],
            ].map((row, idx) => (
              <div key={idx} className="relative w-full overflow-hidden">
                <div
                  className="flex gap-12 sm:gap-16 whitespace-nowrap"
                  style={{
                    animation: `${idx === 0 ? 'marquee-left' : 'marquee-right'} 40s linear infinite`,
                  }}
                >
                  {[...row, ...row, ...row].map((brand, i) => (
                    <span
                      key={i}
                      className="font-sans text-xl sm:text-2xl md:text-3xl font-bold text-foreground/80 tracking-wider select-none"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <style>{`
          @keyframes marquee-left {
            from { transform: translateX(0); }
            to { transform: translateX(-33.333%); }
          }
          @keyframes marquee-right {
            from { transform: translateX(-33.333%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </section>

      {/* ══════════════════════════════════════════
          1. COUNTRIES — doručovací zóna + dropshipping expanze
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-border">
        <div className="mx-auto max-w-6xl px-6">
          {/* Header — copywriting */}
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-3 tracking-tight">
                Doručujeme do 15+ zemí Evropy.<br className="hidden sm:block" /> Expandujte s námi.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
                Začneš ve své zemi. Škáluješ do celé EU. Přes <strong>Dropshipping</strong> můžeš prodávat do všech níže uvedených zemí — logistiku, celnici i doručení řešíme my.
              </p>
            </div>
          </Reveal>
          {/* Map + countries — 2-col desktop, stacked mobile */}
          <Reveal delay={80}>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-12">
              {/* Left: interactive map */}
              <div className="max-w-sm mx-auto w-full lg:max-w-none">
                <EuropeMap />
              </div>
              {/* Right: country list */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
                  15 doručovacích zemí
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                  {COUNTRIES.map((c) => (
                    <div key={c.name} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                      <span className="text-sm font-medium text-foreground/75">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          {/* Section heading — recognize yourself in these obstacles? */}
          <Reveal delay={120}>
            <div className="text-center mb-8 sm:mb-10">
              <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Poznáš se v tom?
              </div>
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                Čtyři překážky, které řešíme za tebe
              </h3>
            </div>
          </Reveal>

          <div className="border-t border-zinc-200 divide-y divide-zinc-200">
            {[
              { label: 'Nevím jak založit pobočku a sklad v zahraničí abych mohl expandovat', title: 'Jeden partner, jeden feed, EU trhy. Bez zakládání poboček nebo skladů v zahraničí.', text: 'Dropshipping od sweltu je jediný způsob, jak vstoupit na nový evropský trh bez jakýchkoli logistických nákladů. Zákazník objedná ve vaší zemi — my doručíme kamkoli v EU.' },
              { label: 'Nemám peníze na naskladnění',                                          title: 'Platíš až po prodeji',                                                              text: 'Zákazník zaplatí tobě. Ty zaplatíš nám. Nulová investice do zásob — žádné zmrazené peníze v regálech.' },
              { label: 'Nevím jak řešit logistiku',                                            title: 'O expedici se staráme my',                                                         text: 'Balíme, kontrolujeme, odesíláme. Pod tvou fakturou. Zákazník vidí tebe — ne nás. Trojí quality check na každé zásilce.' },
              { label: 'Bojím se že špatně zvolím produkty',                                   title: 'S plánem Silver 5000+ produktů',                                                   text: 'S plánem Silver máš k dispozici všechny produkty z našeho katalogu formou Dropshippingu — přestaneš hádat co nakoupit.' },
            ].map((item, idx) => (
              <Reveal key={item.title} delay={160 + idx * 50}>
                <div className="py-7 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">{item.label}</p>
                    <div className="font-display font-semibold text-foreground mb-1">{item.title}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                  <Button className="gap-2 shrink-0" onClick={() => navigate('/dropshipping')}>
                    Chci dropshipping <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. BRANDS — 70+ značek + premium segment + soukromý nákup
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-border">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-3 tracking-tight">
                70+ světových značek. V jednom místě.
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-base">
                Prémiové hodinky, šperky a doplňky — všechny dostupné za velkoobchodní ceny s jednou smlouvou.
              </p>
            </div>
          </Reveal>

          {/* Standard brands grid — first 18 + expand button */}
          <Reveal delay={60}>
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {BRANDS_STANDARD.slice(0, 18).map((b) => (
                <span key={b} className="rounded-xl border border-border bg-white px-3.5 py-2 text-sm font-medium text-foreground/75 hover:border-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-colors cursor-default">
                  {b}
                </span>
              ))}
              <button
                onClick={() => navigate('/brands')}
                className="rounded-xl border border-zinc-900 bg-zinc-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-zinc-800 hover:border-zinc-800 transition-colors"
              >
                +50 dalších →
              </button>
            </div>
          </Reveal>

          {/* Premium segment */}
          <Reveal delay={120}>
            <div className="border-t border-zinc-200 pt-8 pb-6 mb-2">
              <div className="font-display font-semibold text-foreground text-lg mb-1">Na poptávku i prémiový segment</div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Hledáte značky vyššího segmentu? Na základě poptávky zajistíme i tyto prémiové domy:
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {BRANDS_PREMIUM.map((b) => (
                  <span key={b} className="rounded-xl border border-zinc-200 px-3.5 py-2 text-sm font-semibold text-foreground">
                    {b}
                  </span>
                ))}
              </div>
              <Button variant="outline" className="gap-2 border-zinc-900" onClick={() => window.location.href = 'mailto:info@swelt.cz'}>
                Poslat poptávku <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Reveal>

          {/* Private purchase info */}
          <Reveal delay={160}>
            <div className="border-t border-zinc-200 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex-1">
                <div className="font-display font-semibold text-foreground mb-1">Jakákoliv značka bez registrace?</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Soukromý nákup nebo firemní dárky — zakoupíte cokoliv z katalogu <strong>bez B2B registrace</strong>. Jediným předpokladem k nákupu je <strong>IČO</strong>. Diskrétní balení, EU doručení.
                </p>
              </div>
              <Button className="gap-2 shrink-0" onClick={() => navigate('/luxury')}>
                Soukromý nákup <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. CTA — Prohlédnout sortiment + Vytvořit B2B účet (only for guests)
      ══════════════════════════════════════════ */}
      {!user && <section className="py-14 sm:py-20 bg-slate-50 border-b border-border">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Začněte ještě dnes</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2 leading-tight">
                Přístup k 3 000+ produktům.<br className="hidden sm:block" /> Velkoobchodní ceny od prvního kusu.
              </h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                Zaregistrujte se zdarma a získejte okamžitý přístup k B2B katalogu — nebo si prohlédněte sortiment bez registrace.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="gap-2 px-8 text-base font-semibold"
                  onClick={() => openAuth('register')}
                >
                  Vytvořit B2B účet <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 px-8 text-base border-zinc-900"
                  onClick={() => openAuth('login')}
                >
                  <Eye className="h-4 w-4" /> Prohlédnout sortiment
                </Button>
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
      </section>}

      {/* ══════════════════════════════════════════
          4. CATEGORY CARDS + LEAD CAPTURE + AI/AM
      ══════════════════════════════════════════ */}
      <div className="relative bg-slate-50 border-b border-border py-16 sm:py-20 overflow-hidden">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight text-balance">
                {g.introHeading}
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto text-pretty">
                {g.introSubheading}
              </p>
            </div>
          </Reveal>

          {/* Service cards — vertical stack, image + content + button */}
          <div className="flex flex-col gap-4 mb-10">
            {SERVICE_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <Reveal key={card.id} delay={i * 60}>
                  <div className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="sm:w-48 h-40 sm:h-auto shrink-0 overflow-hidden bg-zinc-100">
                      {'img2' in card ? (
                        <div className="flex w-full h-full">
                          <div className="flex-1 flex items-center justify-center p-2 border-r border-zinc-100">
                            <img src={card.img} alt={card.label} loading="lazy" className="max-h-full max-w-full object-contain" />
                          </div>
                          <div className="flex-1 flex items-center justify-center p-2">
                            <img src={(card as { img2: string }).img2} alt={card.label} loading="lazy" className="max-h-full max-w-full object-contain" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={card.img}
                          alt={card.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex flex-1 items-center gap-4 p-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                            <Icon className="h-3.5 w-3.5 text-zinc-500" />
                          </div>
                          <span className="font-display font-semibold text-foreground text-base">{card.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 shrink-0 hidden sm:inline-flex border-zinc-900"
                        onClick={() => navigate(card.path)}
                      >
                        {card.cta} <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {/* Mobile CTA */}
                    <div className="px-5 pb-4 sm:hidden">
                      <Button variant="outline" size="sm" className="gap-1.5 w-full border-zinc-900" onClick={() => navigate(card.path)}>
                        {card.cta} <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Lead capture */}
          {!user && (
            <Reveal delay={100} className="mb-6">
              <div className="relative border-t border-zinc-200 pt-8">
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 text-white px-3 py-1 text-[10px] font-semibold tracking-wider uppercase">
                      <Eye className="h-3 w-3" /> Zdarma · 30 sekund
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Bez čekání
                    </div>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900 leading-tight mb-2 sm:mb-3 text-left">
                    Prohlédněte si celý katalog ještě dnes — zdarma a bez čekání.
                  </h3>
                  <div className="text-sm sm:text-base text-zinc-600 mb-5 text-left max-w-2xl leading-relaxed space-y-3">
                    <p>Víme, že vstoupit do nového partnerství chce důvěru. Proto vám umožňujeme nahlédnout do katalogu předtím, než cokoliv rozhodujete. Stačí se přihlásit přes e-mail nebo Google — trvá to 30 sekund.</p>
                    <p>Velkoobchodní nákupní ceny se odemknou automaticky po ověření B2B účtu — zpravidla do 24 hodin. Registrace je zcela zdarma.</p>
                  </div>
                  <div className="mb-5"><AccessTiersVisual /></div>
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
                    <button onClick={() => openAuth('login')} className="group flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl px-5 py-3.5 shadow-lg transition-all font-bold text-sm sm:text-base">
                      <Eye className="h-4 w-4 shrink-0" /> Prohlédnout sortiment <ArrowRight className="h-4 w-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <div className="text-[11px] text-zinc-500 sm:ml-2">3 000+ produktů · 70+ značek · Bez závazku</div>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* AI / Account Manager gateway */}
          <Reveal delay={150}>
            <div className="border-t border-zinc-200 pt-8">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 leading-tight mb-1 text-left">Potřebujete poradit?</h3>
              <p className="text-sm text-zinc-500 mb-5 text-left">Vyberte si způsob — okamžitý AI zástupce nebo osobní account manager.</p>

              {/* Karty — vedle sebe na desktopu, pod sebou na mobilu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Karta 1 — AI obchodní zástupce */}
                <button
                  onClick={() => setGatewayOpen(true)}
                  className="group flex flex-col items-center text-center border border-zinc-200 hover:border-zinc-400 bg-white hover:bg-zinc-50 rounded-2xl p-5 sm:p-6 transition-all"
                >
                  {/* Avatar */}
                  <div className="relative mb-4">
                    <img
                      src="/ai-rep.jpg"
                      alt="AI obchodní zástupce"
                      className="w-20 h-20 rounded-full object-cover object-top border border-zinc-200 mx-auto"
                    />
                    <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border-2 border-white">
                      <Sparkles className="h-2.5 w-2.5 text-white" />
                    </span>
                  </div>
                  {/* Tag */}
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">AI · Dostupný 24/7</span>
                  {/* Title + desc */}
                  <p className="font-bold text-sm text-zinc-900 leading-tight mb-1">AI obchodní zástupce</p>
                  <p className="text-[12px] text-zinc-500 leading-snug mb-5">Ceny, dostupnost, doporučení — odpověď do 5 vteřin</p>
                  {/* CTA */}
                  <div className="mt-auto w-full bg-zinc-900 group-hover:bg-zinc-800 transition-colors rounded-xl py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-1.5">
                    Zahájit konverzaci <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>

                {/* Karta 2 — Osobní account manager */}
                <button
                  onClick={() => navigate('/partner')}
                  className="group flex flex-col items-center text-center border border-zinc-200 hover:border-zinc-400 bg-white hover:bg-zinc-50 rounded-2xl p-5 sm:p-6 transition-all"
                >
                  {/* Avatar placeholder */}
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-full bg-zinc-200 border border-zinc-300 mx-auto flex items-center justify-center">
                      <Users className="h-8 w-8 text-zinc-400" />
                    </div>
                    <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  {/* Tag */}
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Osobní péče · Do 24 h</span>
                  {/* Title + desc */}
                  <p className="font-bold text-sm text-zinc-900 leading-tight mb-1">Osobní account manager</p>
                  <p className="text-[12px] text-zinc-500 leading-snug mb-5">Strategie, individuální nabídka, telefonní konzultace</p>
                  {/* CTA */}
                  <div className="mt-auto w-full bg-zinc-900 group-hover:bg-zinc-800 transition-colors rounded-xl py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-1.5">
                    Kontaktovat <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>

              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-500" /> Zdarma a nezávazně</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-500" /> Česky &amp; slovensky</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-500" /> Bez závazku</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          6. GATEWAY SECTIONS — 5 alternujících sekcí
      ══════════════════════════════════════════ */}
      {sections.map((section) => {
        return (
          <section
            key={section.id}
            id={section.id}
            className="relative py-20 sm:py-28 scroll-mt-16 bg-slate-50 border-b border-border"
          >
            <div className="pointer-events-none absolute inset-0" />
            <div className="relative mx-auto max-w-6xl px-6">
              <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${section.reverse ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''}`}>
                <Reveal>
                  <div className="space-y-7">
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
                <Reveal delay={120}>
                  <div className="relative">
                    <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-zinc-900/5 blur-2xl" />
                    <div className="relative">{section.visual}</div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>
        );
      })}

      <SectionDivider />

      <FloatingNotif />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
      <GatewayPanel open={gatewayOpen} onClose={() => setGatewayOpen(false)} partnerContext={partnerContext} />
    </div>
  );
}
