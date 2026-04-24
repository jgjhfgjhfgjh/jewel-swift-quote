import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Handshake, PackageOpen, HandCoins, BrainCircuit, Rss,
  Check, ArrowRight, ChevronRight, Users, Star, Shield,
  TrendingUp, Zap, Globe, FileText, BarChart3, Lock,
  Package, Clock, LogIn, UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/AuthModal';
import { useAuthContext } from '@/contexts/AuthContext';

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
    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/60" style={{ minHeight: '380px' }}>

      {/* ── Blurred catalog grid behind the glass ── */}
      <div className="absolute inset-0 scale-[1.04] origin-center" style={{ filter: 'blur(3px) brightness(0.92)' }}>
        <div className="bg-slate-50 p-3 h-full">
          {/* Sidebar mock */}
          <div className="flex gap-2 h-full">
            <div className="w-24 shrink-0 bg-white rounded-lg p-2 space-y-2">
              {['Pouze živě', 'Sleva 60%+', 'Hodinky', 'Šperky', 'Příslušenství'].map(f => (
                <div key={f} className="h-4 rounded bg-slate-200/80 w-full" />
              ))}
              <div className="h-px bg-slate-200 my-1" />
              {['Tommy Hilfiger', 'Versace', 'Seiko', 'Police', 'Citizen'].map(b => (
                <div key={b} className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded border border-slate-300 bg-white shrink-0" />
                  <div className="h-3 rounded bg-slate-200/70 flex-1" />
                </div>
              ))}
            </div>
            {/* Product grid */}
            <div className="flex-1 grid grid-cols-3 gap-2 content-start">
              {catalogItems.map((item, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden border border-slate-100">
                  <div className="relative">
                    <img src={item.img} alt={item.brand} className="w-full aspect-square object-cover object-center" loading="lazy" />
                    <div className="absolute top-1 right-1 bg-primary text-white text-[8px] font-bold px-1 rounded">{item.disc}</div>
                    <div className="absolute top-1 left-1 flex items-center gap-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                  <div className="p-1.5">
                    <div className="text-[8px] font-bold text-amber-600 truncate">{item.brand}</div>
                    <div className="text-[9px] font-bold text-primary">{item.voc}</div>
                    <div className="text-[8px] text-slate-400 line-through">{item.moc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Liquid glass overlay ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center px-6"
        style={{
          backdropFilter: 'blur(12px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(12px) saturate(1.4)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(219,234,254,0.45) 100%)',
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

function IntelligenceVisual() {
  const products = [
    { name: 'Citizen Eco-Drive BM7455', score: 92, trend: '+28%', action: 'Naskladnit', color: 'emerald' },
    { name: 'Seiko Presage SRPE35', score: 76, trend: '+14%', action: 'Sledovat', color: 'blue' },
    { name: 'Police Menelik PEWJG', score: 61, trend: '+6%', action: 'Sledovat', color: 'blue' },
    { name: 'Versace V-Chronos VE5A', score: 28, trend: '−11%', action: 'Redukovat', color: 'red' },
  ];
  return (
    <div className="rounded-2xl border border-border bg-white shadow-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold text-primary uppercase tracking-wider">swelt.signal — Live skóre</div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-emerald-600 font-semibold">Live</span>
        </div>
      </div>
      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.name} className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-2.5">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
              p.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
              p.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'
            }`}>{p.score}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-foreground truncate">{p.name}</div>
              <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${
                  p.color === 'emerald' ? 'bg-emerald-500' : p.color === 'blue' ? 'bg-primary' : 'bg-red-400'
                }`} style={{ width: `${p.score}%` }} />
              </div>
            </div>
            <div className={`text-[10px] font-bold shrink-0 ${
              p.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-500'
            }`}>{p.trend}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Trust section ── */
function TrustSection() {
  const stats = [
    { val: 15, suf: '+', label: 'let ZAGO na trhu' },
    { val: 70, suf: '+', label: 'světových značek' },
    { val: 3000, suf: '+', label: 'produktů v katalogu' },
    { val: 500, suf: '+', label: 'aktivních partnerů' },
  ];
  const testimonials = [
    { name: 'Martin H.', company: 'WatchStore.cz', text: 'Dropshipping od swelt změnil náš byznys. Za 3 měsíce jsme přidali 800 produktů bez jediné koruny do skladu.', rating: 5 },
    { name: 'Tereza K.', company: 'LuxuryTime.sk', text: 'Feed se aktualizuje automaticky, ceny sedí na haléř. Ušetřím 10 hodin týdně na správě katalogu.', rating: 5 },
    { name: 'Pavel S.', company: 'GiftShop.cz', text: 'Privátní nákup hodinek pro celý tým — rychle, diskrétně, za skvělou cenu. Doporučuji.', rating: 5 },
  ];

  return (
    <section className="bg-gradient-to-b from-muted/30 to-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Stats */}
        <Reveal className="text-center mb-14">
          <div className="text-[11px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">Důvěřují nám</div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-2">15 let zkušeností. Tisíce spokojených partnerů.</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="text-center rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="font-display text-4xl font-bold text-primary mb-1">
                  <CountUp to={s.val} suffix={s.suf} />
                </div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid sm:grid-cols-3 gap-6 mb-14">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex flex-col gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-primary">{t.company}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Trust badges */}
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-6 py-8 border-t border-border">
            {[
              { icon: Shield, text: '15+ let ZAGO na trhu' },
              { icon: Check, text: 'Autorizovaný distributor' },
              { icon: Lock, text: 'GDPR & bezpečnost' },
              { icon: Globe, text: 'EU distribuce' },
              { icon: Star, text: 'Garance pravosti' },
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
  const { user } = useAuthContext();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const openAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const sections = [
    {
      id: 'velkoobchod',
      badge: 'B2B Velkoobchod',
      badgeColor: 'bg-primary/10 text-primary',
      icon: Handshake,
      label: 'Velkoobchod',
      heading: 'Přímý přístup k prémiím za velkoobchodní ceny.',
      subheading: 'Katalog 3 000+ produktů 70+ světových značek. Aktuální ceny a zásoby v reálném čase. Pro firmy s IČO.',
      bullets: [
        'Velkoobchodní ceny a slevy až 60 % pod MOC',
        'Katalog v reálném čase — vždy aktuální zásoby',
        'Přímý přístup k novinkám a kolekcím',
        'Individuální cenová politika dle obratu',
        'Rychlá expedice do 24–48 hodin',
      ],
      ctas: (
        <div className="flex flex-col sm:flex-row gap-3">
          {user ? (
            <Button onClick={() => navigate('/velkoobchod')} className="gap-2">
              Vstoupit do katalogu <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button onClick={() => openAuth('login')} className="gap-2">
                <LogIn className="h-4 w-4" /> Přihlásit se
              </Button>
              <Button variant="outline" onClick={() => openAuth('register')} className="gap-2">
                <UserPlus className="h-4 w-4" /> B2B Registrace
              </Button>
            </>
          )}
        </div>
      ),
      visual: <B2BVisual />,
      reverse: false,
      bg: 'bg-white',
    },
    {
      id: 'feed',
      badge: 'Nový produkt',
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      icon: Rss,
      label: 'swelt.feed',
      heading: 'Produktový feed, který se stará sám.',
      subheading: 'Automatický XML/CSV feed 3 000+ prémiových produktů. Heureka, Zbozi.cz, Google Shopping, Shoptet — synchronizované bez práce z vaší strany.',
      bullets: [
        'XML, CSV, JSON, Heureka, Zbozi.cz, Google Shopping',
        'Aktualizace cen a zásob až 4× denně',
        'Filtrace dle kategorie, značky a dostupnosti',
        'Vlastní cenová pravidla a přirážky',
        'Jednoduchá integrace — funguje do 48 hodin',
      ],
      ctas: (
        <Button onClick={() => navigate('/feed')} className="gap-2">
          Zjistit více o swelt.feed <ArrowRight className="h-4 w-4" />
        </Button>
      ),
      visual: <FeedVisual />,
      reverse: true,
      bg: 'bg-muted/20',
    },
    {
      id: 'dropshipping',
      badge: 'swelt.dropshipping',
      badgeColor: 'bg-primary/10 text-primary',
      icon: PackageOpen,
      label: 'Dropshipping',
      heading: 'E-shop bez skladu. Prodávej, my zabalíme.',
      subheading: 'Prémiové hodinky a šperky prodávané přes tvůj e-shop. Swelt vyřizuje sklad, balení, expedici a bílý štítek — vše pod tvou značkou.',
      bullets: [
        'Bez skladových nákladů a investic',
        'Logistika, balení a expedice pod vaší značkou',
        'Dodání přímo ke koncovému zákazníkovi do 24–72 h',
        'White-label fakturace s vaším logem',
        'Marže 40–60 % při doporučené MOC',
        'swelt.signal — trendová data každý týden',
      ],
      ctas: (
        <Button onClick={() => navigate('/dropshipping')} className="gap-2">
          Chci dropshipping <ArrowRight className="h-4 w-4" />
        </Button>
      ),
      visual: <DropshippingVisual />,
      reverse: false,
      bg: 'bg-white',
    },
    {
      id: 'luxury',
      badge: 'swelt.luxury',
      badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200',
      icon: HandCoins,
      label: 'Privátní nákupy',
      heading: 'Velkoobchodní ceny. Pro každého. Od 1 kusu.',
      subheading: 'Prémiové hodinky a šperky za velkoobchodní ceny dostupné pro soukromé osoby i firmy. Bez nutnosti IČO. Diskrétní balení. EU doručení.',
      bullets: [
        'Velkoobchodní ceny bez nutnosti IČO',
        'Dostupné od 1 kusu bez minimálního odběru',
        'Garance pravosti 100 %',
        'Diskrétní balení bez loga na zásilce',
        'Doručení po celé EU do 72 hodin',
      ],
      ctas: (
        <Button onClick={() => navigate('/luxury')} className="gap-2">
          Zjistit více <ArrowRight className="h-4 w-4" />
        </Button>
      ),
      visual: <LuxuryVisual />,
      reverse: true,
      bg: 'bg-muted/20',
    },
    {
      id: 'intelligence',
      badge: 'swelt.intelligence',
      badgeColor: 'bg-violet-50 text-violet-700 border border-violet-200',
      icon: BrainCircuit,
      label: 'Intelligence',
      heading: 'Vidíte celý trh. Ne jen svůj kousek.',
      subheading: 'Prediktivní tržní data postavená na pohybu zboží napříč celou distribucí. Vždy víte, co naskladnit, co sledovat a co redukovat.',
      bullets: [
        'Prediktivní skóre poptávky pro každý SKU',
        'Trendy kategorií dřív, než jsou viditelné trhu',
        'Benchmark vašich prodejů vůči anonymnímu trhu',
        'Upozornění na rostoucí i klesající produkty',
        'swelt.signal — real-time trendový přehled',
      ],
      ctas: (
        <Button onClick={() => navigate('/intelligence')} className="gap-2">
          Zjistit více o Intelligence <ArrowRight className="h-4 w-4" />
        </Button>
      ),
      visual: <IntelligenceVisual />,
      reverse: false,
      bg: 'bg-white',
    },
  ];

  return (
    <div
      className="gateway-sections relative w-full bg-background text-foreground"
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
        .gateway-sections .font-display { font-family: 'Montserrat', sans-serif !important; }
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Intro strip */}
      <div className="bg-gradient-to-b from-white/60 to-white border-b border-border py-12 text-center">
        <Reveal>
          <div className="text-[11px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">swelt.partner ekosystém</div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4 max-w-2xl mx-auto px-6">
            Jeden partner. Pět způsobů, jak vydělat víc.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto px-6">
            Vyberte si model, který sedí vašemu byznysu — nebo kombinujte více najednou.
          </p>
        </Reveal>
        {/* Section quick-nav pills */}
        <Reveal delay={100} className="mt-8">
          <div className="flex flex-wrap gap-2 justify-center px-6">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <a key={s.id} href={`#${s.id}`}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary transition-all shadow-sm">
                  <Icon className="h-3.5 w-3.5" />
                  {s.label}
                </a>
              );
            })}
          </div>
        </Reveal>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <section key={section.id} id={section.id} className={`${section.bg} py-20 scroll-mt-16`}>
            <div className="mx-auto max-w-6xl px-6">
              <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${section.reverse ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''}`}>
                {/* Text side */}
                <Reveal>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${section.badgeColor}`}>
                        {section.badge}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-4">{section.heading}</h2>
                      <p className="text-muted-foreground leading-relaxed">{section.subheading}</p>
                    </div>
                    <BulletList items={section.bullets} />
                    <div className="pt-2">{section.ctas}</div>
                  </div>
                </Reveal>

                {/* Visual side */}
                <Reveal delay={120}>
                  {section.visual}
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
    </div>
  );
}
