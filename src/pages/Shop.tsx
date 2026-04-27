import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, ArrowRight, Check, Users, Star, Clock, Globe,
  Zap, PackageOpen, Rss, HandCoins, Handshake, ChevronDown,
  Truck, Store, Layers, Settings, Rocket, BadgeCheck, Shield,
  TrendingUp, RefreshCw, Package, BarChart3, Monitor, Palette,
  CheckCircle, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { useStore } from '@/lib/store';
import { shop } from '@/lib/i18n-shop';

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

function FloatingNotif() {
  const notifs = [
    { name: 'Jakub M.', city: 'Praha', action: 'spustil svůj první e-shop za 36 hodin' },
    { name: 'Veronika S.', city: 'Brno', action: 'přidala dropshipping a ruší sklad' },
    { name: 'Tomáš K.', city: 'Ostrava', action: 'dosáhl 80 objednávek v prvním měsíci' },
    { name: 'Alena P.', city: 'Plzeň', action: 'přešla z Shoptetu na swelt.shop za 2 dny' },
    { name: 'Radek V.', city: 'Liberec', action: 'přidává druhý e-shop na slovenský trh' },
    { name: 'Jana H.', city: 'Bratislava', action: 'vydělala 45 000 Kč za první čtvrtletí' },
  ];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = () => { setVisible(true); setTimeout(() => setVisible(false), 4500); };
    const t = setTimeout(show, 3000);
    const interval = setInterval(() => { setIdx(i => (i + 1) % notifs.length); show(); }, 10000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);
  return (
    <div className={`fixed bottom-20 left-4 z-50 transition-all duration-500 lg:bottom-6 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white shadow-xl px-4 py-3 max-w-xs">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <ShoppingCart className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="text-xs font-semibold">{notifs[idx].name} z {notifs[idx].city}</div>
          <div className="text-[11px] text-muted-foreground">{notifs[idx].action} · právě teď</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Interactive shop preview ─── */
const PREVIEW_PRODUCTS: Record<string, { img: string; name: string; price: string; badge?: string }[]> = {
  watches: [
    { img: 'https://cdn.b2bzago.com/images/0/7afe1cca249d731c/100/hodinky-tommy-hilfiger-model-decker-1791349.jpg?hash=-2', name: 'Tommy Hilfiger DECKER', price: '4 475 Kč', badge: 'NOVÉ' },
    { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=70', name: 'Versace V-Chronos', price: '7 225 Kč' },
    { img: 'https://images.unsplash.com/photo-1542496658-e33a6d0d3cde?auto=format&fit=crop&w=200&q=70', name: 'Police Milano Elite', price: '3 125 Kč', badge: '-15%' },
    { img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=200&q=70', name: 'Seiko Presage Auto', price: '5 250 Kč' },
    { img: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=200&q=70', name: 'Citizen Eco-Drive', price: '3 950 Kč' },
    { img: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=200&q=70', name: 'Hugo Boss Integrity', price: '5 600 Kč', badge: 'TOP' },
  ],
  jewelry: [
    { img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=200&q=70', name: 'Swarovski Crystal Set', price: '2 890 Kč' },
    { img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=200&q=70', name: 'Pandora Charm Bracelet', price: '3 450 Kč', badge: 'NOVÉ' },
    { img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=70', name: 'Morellato Pearl Necklace', price: '1 890 Kč' },
    { img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=200&q=70', name: 'DKNY Gold Ring', price: '2 250 Kč', badge: '-20%' },
    { img: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=200&q=70', name: 'Calvin Klein Earrings', price: '1 450 Kč' },
    { img: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?auto=format&fit=crop&w=200&q=70', name: 'Michael Kors Pendant', price: '2 100 Kč' },
  ],
};

function ShopPreview() {
  const [tab, setTab] = useState<'watches' | 'jewelry'>('watches');
  const products = PREVIEW_PRODUCTS[tab];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
      {/* Browser chrome */}
      <div className="bg-slate-100 border-b border-slate-200 px-3 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-lg px-3 py-1 text-[11px] text-slate-400 border border-slate-200 flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-emerald-500" />
          vaseshop.cz
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Fake e-shop navbar */}
      <div className="bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between">
        <div className="font-display font-black text-sm text-slate-800">WatchStore.cz</div>
        <div className="flex items-center gap-5">
          {[
            { key: 'watches', label: 'Hodinky' },
            { key: 'jewelry', label: 'Šperky' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as 'watches' | 'jewelry')}
              className={`text-[11px] font-semibold pb-0.5 border-b-2 transition-colors ${tab === key ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="p-4 grid grid-cols-3 gap-3 bg-slate-50">
        {products.map((p) => (
          <div key={p.name} className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
            <div className="relative">
              <img src={p.img} alt={p.name} className="w-full aspect-square object-cover" loading="lazy" />
              {p.badge && (
                <div className="absolute top-1.5 right-1.5 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">
                  {p.badge}
                </div>
              )}
            </div>
            <div className="p-2">
              <div className="text-[9px] text-slate-600 truncate leading-tight">{p.name}</div>
              <div className="text-[10px] font-black text-primary mt-0.5">{p.price}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between bg-white">
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Zboží aktualizováno před 2 hod.
        </span>
        <span className="text-[10px] text-slate-400">3 000+ produktů</span>
      </div>
    </div>
  );
}

/* ─── Static structure (icons, colors, prices) — text comes from i18n-shop.ts ─── */
const MODE_META = [
  { icon: PackageOpen, badgeColor: 'bg-primary text-white',           color: 'border-primary bg-primary/5',          href: '/dropshipping' },
  { icon: Rss,         badgeColor: 'bg-emerald-600 text-white',        color: 'border-emerald-300 bg-emerald-50/30', href: '/feed' },
];
const STEP_ICONS = [Settings, Package, RefreshCw, Rocket];
const FEATURE_ICONS = [Palette, Package, RefreshCw, TrendingUp, Monitor, BarChart3, Shield, Layers];
const PLATFORMS = ['Shoptet', 'WooCommerce', 'Upgates', 'Custom'];
const PLAN_PRICES = [
  { monthly: 1490, yearly: 1192 },
  { monthly: 2990, yearly: 2392 },
  { monthly: 0,    yearly: 0 },
];
const PLAN_FEATURED = [false, true, false];
const ECO_META = [
  { icon: Handshake,   href: '/velkoobchod',  color: 'text-blue-600 bg-blue-50' },
  { icon: Rss,         href: '/feed',         color: 'text-emerald-600 bg-emerald-50' },
  { icon: PackageOpen, href: '/dropshipping', color: 'text-blue-600 bg-blue-50' },
  { icon: HandCoins,   href: '/luxury',       color: 'text-amber-600 bg-amber-50' },
];
const TRUST_STRIP_ICONS = [Rocket, RefreshCw, Globe, Shield, Truck];

/* ─── Page ─── */
const Shop = () => {
  const navigate = useNavigate();
  const { lang } = useStore();
  const s = shop[lang];
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activePlatform, setActivePlatform] = useState(0);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div
      className="shop-page min-h-screen font-sans"
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

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,100,190,0.07),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-semibold text-primary mb-7">
                  <ShoppingCart className="h-4 w-4" />
                  {s.hero.badge}
                </div>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-[1.05] mb-6">
                  {s.hero.heading}
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
                  {s.hero.sub}
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <Button
                    size="lg"
                    className="gap-2 text-base h-12 px-7"
                    onClick={() => window.location.href = 'mailto:shop@swelt.cz'}
                  >
                    {s.hero.ctaPrimary} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 text-base h-12 px-7"
                    onClick={() => document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {s.hero.ctaSecondary}
                  </Button>
                </div>
              </Reveal>
              <Reveal delay={300}>
                <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                  {s.hero.bullets.map(t => (
                    <div key={t} className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Preview in hero */}
            <Reveal delay={200}>
              <div id="preview">
                <ShopPreview />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { val: 48,   suffix: ' h', label: s.stats[0] },
              { val: 3000, suffix: '+',  label: s.stats[1] },
              { val: 70,   suffix: '+',  label: s.stats[2] },
              { val: 60,   suffix: ' %', label: s.stats[3] },
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

      {/* ── Dvě cesty ── */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                {s.modes.eyebrow}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                {s.modes.heading}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {s.modes.sub}
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {s.modeItems.map((m, i) => {
              const meta = MODE_META[i];
              const Icon = meta.icon;
              return (
                <Reveal key={m.name} delay={i * 100}>
                  <div className={`relative rounded-2xl border-2 p-8 h-full flex flex-col ${meta.color}`}>
                    <div className="flex items-start justify-between mb-5">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${meta.badgeColor}`}>
                        {m.badge}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-black text-foreground mb-1">{m.name}</h3>
                    <p className="text-sm font-semibold text-muted-foreground mb-4 italic">{m.tagline}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{m.desc}</p>
                    <ul className="space-y-2.5 mb-7">
                      {m.pros.map(p => (
                        <li key={p} className="flex items-start gap-2 text-sm text-foreground/80">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="gap-1.5 w-full" onClick={() => navigate(meta.href)}>
                      {s.modes.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Jak to funguje ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-4">
                {s.howItWorks.eyebrow}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                {s.howItWorks.heading}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {s.howItWorks.sub}
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {s.steps.map((step, i) => {
              const Icon = STEP_ICONS[i];
              const n = String(i + 1).padStart(2, '0');
              return (
                <Reveal key={n} delay={i * 80}>
                  <div className="bg-slate-50 rounded-2xl border border-border p-6 h-full">
                    <div className="font-display text-5xl font-black text-primary/20 mb-3 leading-none select-none">{n}</div>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display font-black text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={350}>
            <div className="mt-10 flex justify-center">
              <Button
                size="lg"
                className="gap-2 h-12 px-8 text-base"
                onClick={() => window.location.href = 'mailto:shop@swelt.cz'}
              >
                {s.howItWorks.cta} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Co je v ceně ── */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                {s.whatYouGet.eyebrow}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                {s.whatYouGet.heading}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {s.whatYouGet.sub}
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
            {s.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
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

          {/* Platform selector */}
          <Reveal>
            <div className="bg-white rounded-2xl border border-border p-8">
              <div className="text-center mb-6">
                <h3 className="font-display text-xl font-black text-foreground mb-2">{s.whatYouGet.platformHeading}</h3>
                <p className="text-sm text-muted-foreground">{s.whatYouGet.platformSub}</p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                {PLATFORMS.map((p, i) => (
                  <button
                    key={p}
                    onClick={() => setActivePlatform(i)}
                    className={`rounded-xl px-5 py-2.5 text-sm font-semibold border transition-all ${activePlatform === i ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="rounded-xl bg-slate-50 border border-border p-5 text-center text-sm text-muted-foreground">
                {s.whatYouGet.platformNotes[activePlatform]}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                {s.pricing.eyebrow}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                {s.pricing.heading}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                {s.pricing.sub}
              </p>
              {/* Billing toggle */}
              <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-border">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${billing === 'monthly' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'}`}
                >
                  {s.pricing.monthly}
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'}`}
                >
                  {s.pricing.yearly}
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">-20%</span>
                </button>
              </div>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {s.plans.map((plan, i) => {
              const featured = PLAN_FEATURED[i];
              const priceData = PLAN_PRICES[i];
              const price = billing === 'yearly' ? priceData.yearly : priceData.monthly;
              return (
                <Reveal key={plan.name} delay={i * 100}>
                  <div className={`relative rounded-2xl border p-8 h-full flex flex-col ${featured ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white border-border'}`}>
                    {featured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="bg-primary text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                          {s.pricing.popular}
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className={`font-display text-xl font-black mb-1 ${featured ? 'text-white' : 'text-foreground'}`}>{plan.name}</h3>
                      <p className={`text-xs mb-4 ${featured ? 'text-white/70' : 'text-muted-foreground'}`}>{plan.desc}</p>
                      {priceData.monthly > 0 ? (
                        <div>
                          <span className={`font-display text-3xl font-black ${featured ? 'text-white' : 'text-primary'}`}>
                            {price.toLocaleString('cs')} Kč
                          </span>
                          <span className={`text-xs ml-1 ${featured ? 'text-white/60' : 'text-muted-foreground'}`}>{s.pricing.perMonth}</span>
                          {billing === 'yearly' && (
                            <div className={`text-xs mt-1 ${featured ? 'text-white/60' : 'text-muted-foreground'}`}>
                              {(price * 12).toLocaleString('cs')} {s.pricing.perYear}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`font-display text-2xl font-black ${featured ? 'text-white' : 'text-primary'}`}>{plan.bespoke}</div>
                      )}
                    </div>
                    <ul className="space-y-2.5 flex-1 mb-8">
                      {plan.features.map(f => (
                        <li key={f} className={`flex items-start gap-2 text-sm ${featured ? 'text-white' : 'text-foreground/80'}`}>
                          <Check className={`h-4 w-4 shrink-0 mt-0.5 ${featured ? 'text-white' : 'text-emerald-500'}`} strokeWidth={2.5} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={featured ? 'secondary' : 'outline'}
                      className={`w-full gap-1.5 ${featured ? 'bg-white text-primary hover:bg-white/90' : ''}`}
                      onClick={() => window.location.href = 'mailto:shop@swelt.cz'}
                    >
                      {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={350}>
            <p className="text-center text-sm text-muted-foreground mt-8">
              {s.pricing.setupNote}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Trust section ── */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-6">
                  {s.trust.eyebrow}
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-5">
                  {s.trust.heading}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {s.trust.p}
                </p>
                <div className="space-y-3">
                  {s.trust.bullets.map(item => (
                    <div key={item} className="flex items-center gap-3 text-sm text-foreground/80">
                      <BadgeCheck className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="space-y-5">
                {s.testimonials.map((t, i) => (
                  <div key={t.name} className="bg-white rounded-2xl border border-border p-5">
                    <div className="flex gap-0.5 mb-3">
                      {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-4">"{t.text}"</p>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Ekosystém cross-sell ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                {s.ecosystem.heading}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {s.ecosystem.sub}
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {s.ecosystemItems.map((svc, i) => {
              const Icon = ECO_META[i].icon;
              return (
                <Reveal key={svc.name} delay={i * 80}>
                  <div
                    onClick={() => navigate(ECO_META[i].href)}
                    className="group cursor-pointer bg-slate-50 rounded-2xl border border-border p-6 h-full flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4 ${ECO_META[i].color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-black text-foreground mb-2">{svc.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{svc.desc}</p>
                    <div className="flex items-center gap-1.5 text-primary text-sm font-semibold mt-5 group-hover:gap-2.5 transition-all">
                      {s.ecosystem.learnMore} <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">{s.faq.heading}</h2>
              <p className="text-muted-foreground">{s.faq.sub}</p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {s.faqs.map((faq, i) => (
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
      <section className="py-20 sm:py-28" style={{ background: 'linear-gradient(135deg, hsl(220,60%,28%) 0%, hsl(220,60%,45%) 100%)' }}>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-semibold text-white/90 mb-7">
              <ShoppingCart className="h-4 w-4" />
              {s.finalCta.badge}
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white mb-5">
              {s.finalCta.heading}
            </h2>
            <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              {s.finalCta.sub}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="gap-2 h-12 px-8 text-base bg-white text-primary hover:bg-white/90 font-black"
                onClick={() => window.location.href = 'mailto:shop@swelt.cz'}
              >
                {s.finalCta.ctaSetup} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="gap-2 h-12 px-8 text-base text-white border border-white/30 hover:bg-white/10"
                onClick={() => document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {s.hero.ctaSecondary}
              </Button>
            </div>
            <p className="text-white/50 text-xs mt-8">{s.finalCta.note}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Trust footer ── */}
      <section className="bg-white border-t border-border py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            {s.trustStrip.map((text, i) => {
              const Icon = TRUST_STRIP_ICONS[i];
              return (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary/60" />
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
