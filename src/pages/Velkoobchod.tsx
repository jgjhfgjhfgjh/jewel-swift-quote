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
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { AuthModal } from '@/components/AuthModal';
import { LeadUpgradeBadge } from '@/components/LeadUpgradeBadge';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStore } from '@/lib/store';
import { velkoobchod } from '@/lib/i18n-velkoobchod';

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

/* ─── Static structure (text comes from i18n-velkoobchod.ts) ─── */
const BRANDS = [
  'Tommy Hilfiger', 'Versace', 'Emporio Armani', 'Police', 'Seiko',
  'Hugo Boss', 'Citizen', 'Guess', 'DKNY', 'Calvin Klein',
  'Michael Kors', 'Fossil', 'Casio', 'Tissot', 'Lacoste',
  'Swarovski', 'Pandora', 'Morellato', 'Festina', 'Pierre Cardin',
];

const STEP_ICONS = [UserPlus, BadgeCheck, Clock, Package];
const TARGET_ICONS = [Store, ShoppingBag, Factory];
const TARGET_HIGHLIGHT = [false, true, false];
const FEATURE_ICONS = [Package, Award, TrendingUp, Clock, Globe, Truck, BarChart3, Zap];
const VOLUME_FEATURED = [false, true, false];
const ECOSYSTEM_META = [
  { icon: Rss,         href: '/feed',         color: 'text-emerald-600 bg-emerald-50' },
  { icon: PackageOpen, href: '/dropshipping', color: 'text-blue-600 bg-blue-50' },
  { icon: HandCoins,   href: '/luxury',       color: 'text-amber-600 bg-amber-50' },
  { icon: ShoppingCart,href: '/shop',         color: 'text-orange-600 bg-orange-50' },
];
const TRUST_STRIP_ICONS = [ShieldCheck, Truck, Globe, BadgeCheck, Lock];

/* ─── Page ─── */
const Velkoobchod = () => {
  const navigate = useNavigate();
  const { user, isB2bApproved, isLead } = useAuthContext();
  const { setViewMode, lang } = useStore();
  const v = velkoobchod[lang];
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
        tip={v.authTip}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.08),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-32">
          <div className="max-w-3xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/20 px-4 py-1.5 text-sm font-semibold text-primary mb-7">
                <Handshake className="h-4 w-4" />
                {v.hero.badge}
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-[1.05] mb-6">
                {v.hero.heading}
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                {v.hero.sub}
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                {!user && (
                  <>
                    <Button size="lg" onClick={() => openAuth('register')} className="gap-2 text-base h-12 px-7">
                      {v.hero.ctaRegister} <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => openAuth('login')} className="gap-2 text-base h-12 px-7">
                      {v.hero.ctaLogin}
                    </Button>
                  </>
                )}
                {user && isB2bApproved && (
                  <Button size="lg" onClick={goToCatalog} className="gap-2 text-base h-12 px-7">
                    {v.hero.ctaCatalog} <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                {user && isLead && !isB2bApproved && (
                  <LeadUpgradeBadge />
                )}
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="flex flex-wrap gap-5 text-sm text-muted-foreground mb-8">
                {v.hero.bullets.map(text => (
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
                  <div className="text-sm text-blue-700/90">{v.hero.banner}</div>
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
              { val: 3000, suffix: '+', label: v.stats[0] },
              { val: 70,   suffix: '+', label: v.stats[1] },
              { val: 60,   suffix: ' %', label: v.stats[2] },
              { val: 500,  suffix: '+', label: v.stats[3] },
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
                  {v.preview.eyebrow}
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-5">
                  {v.preview.heading}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{v.preview.p1}</p>
                <p className="text-muted-foreground leading-relaxed mb-4">{v.preview.p2}</p>
                <p className="text-muted-foreground leading-relaxed mb-8">{v.preview.p3}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {!user ? (
                    <>
                      <Button onClick={() => openAuth('login')} className="gap-2" size="lg">
                        {v.preview.cta1} <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => openAuth('register')} variant="outline" size="lg" className="gap-2">
                        {v.preview.cta2}
                      </Button>
                    </>
                  ) : isB2bApproved ? (
                    <Button onClick={goToCatalog} className="gap-2" size="lg">
                      {v.hero.ctaCatalog} <ArrowRight className="h-4 w-4" />
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
                    label: v.accessTiers[0].label, badge: v.accessTiers[0].badge,
                    icon: Lock, iconColor: 'text-slate-400',
                    bg: 'bg-slate-50 border-slate-200', labelColor: 'text-slate-500',
                    items: v.accessItems.map(text => ({ text, ok: false })),
                  },
                  {
                    label: v.accessTiers[1].label, badge: v.accessTiers[1].badge,
                    icon: Eye, iconColor: 'text-blue-600',
                    bg: 'bg-blue-50 border-blue-200', labelColor: 'text-blue-700',
                    highlight: true,
                    items: v.accessItems.map((text, i) => ({ text, ok: i < 4, locked: i >= 4 })),
                  },
                  {
                    label: v.accessTiers[2].label, badge: v.accessTiers[2].badge,
                    icon: BadgeCheck, iconColor: 'text-primary',
                    bg: 'bg-primary/5 border-primary/20', labelColor: 'text-primary',
                    items: v.accessItems.map(text => ({ text, ok: true })),
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
                {v.forWhom.eyebrow}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                {v.forWhom.heading}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {v.forWhom.sub}
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {v.targets.map((t, i) => {
              const Icon = TARGET_ICONS[i];
              const highlight = TARGET_HIGHLIGHT[i];
              return (
                <Reveal key={t.title} delay={i * 100}>
                  <div className={`relative rounded-2xl border p-8 h-full flex flex-col ${highlight ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'bg-white border-border'}`}>
                    {highlight && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="bg-amber-400 text-amber-900 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                          {v.forWhom.popular}
                        </span>
                      </div>
                    )}
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-5 ${highlight ? 'bg-white/20' : 'bg-primary/10'}`}>
                      <Icon className={`h-6 w-6 ${highlight ? 'text-white' : 'text-primary'}`} />
                    </div>
                    <h3 className={`font-display text-xl font-black mb-2 ${highlight ? 'text-white' : 'text-foreground'}`}>{t.title}</h3>
                    <p className={`text-sm leading-relaxed mb-6 flex-1 ${highlight ? 'text-white/80' : 'text-muted-foreground'}`}>{t.desc}</p>
                    <ul className="space-y-2.5">
                      {t.bullets.map(b => (
                        <li key={b} className={`flex items-start gap-2 text-sm ${highlight ? 'text-white' : 'text-foreground/80'}`}>
                          <Check className={`h-4 w-4 shrink-0 mt-0.5 ${highlight ? 'text-white' : 'text-emerald-500'}`} strokeWidth={2.5} />
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
                {v.onboarding.eyebrow}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                {v.onboarding.heading}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {v.onboarding.sub}
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {v.steps.map((s, i) => {
              const Icon = STEP_ICONS[i];
              const n = String(i + 1).padStart(2, '0');
              return (
                <Reveal key={n} delay={i * 80}>
                  <div className="relative bg-slate-50 rounded-2xl border border-border p-6 h-full">
                    <div className="font-display text-5xl font-black text-primary/10 mb-3 leading-none select-none">{n}</div>
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
                {!user ? v.onboarding.ctaStart : isB2bApproved ? v.onboarding.ctaApproved : v.onboarding.ctaProcessing}
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
                {v.catalog.eyebrow}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                {v.catalog.heading}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {v.catalog.sub}
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
            {v.features.map((f, i) => {
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

          {/* Brands strip */}
          <Reveal>
            <div className="text-center mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{v.catalog.brandsLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {BRANDS.map(b => (
                <span key={b} className="rounded-lg bg-white border border-border px-3 py-1.5 text-xs font-semibold text-foreground/70">
                  {b}
                </span>
              ))}
              <span className="rounded-lg bg-primary/8 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary">
                {v.catalog.brandsMore}
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
                {v.partnership.eyebrow}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                {v.partnership.heading}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {v.partnership.sub}
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {v.volumeTiers.map((tier, i) => {
              const featured = VOLUME_FEATURED[i];
              const isFirst = i === 0;
              return (
              <Reveal key={tier.name} delay={i * 100}>
                <div className={`relative rounded-2xl border p-8 h-full flex flex-col ${featured ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'bg-white border-border'}`}>
                  {featured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-amber-400 text-amber-900 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                        {v.partnership.recommended}
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className={`font-display text-xl font-black mb-1 ${featured ? 'text-white' : 'text-foreground'}`}>{tier.name}</h3>
                    <div className={`text-xs mb-4 ${featured ? 'text-white/70' : 'text-muted-foreground'}`}>{tier.volume}</div>
                    <div className={`font-display text-2xl font-black ${featured ? 'text-white' : 'text-primary'}`}>{tier.price}</div>
                    <div className={`text-xs mt-1 ${featured ? 'text-white/60' : 'text-muted-foreground'}`}>{tier.priceNote}</div>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-8">
                    {tier.features.map(f => (
                      <li key={f} className={`flex items-start gap-2 text-sm ${featured ? 'text-white' : 'text-foreground/80'}`}>
                        <Check className={`h-4 w-4 shrink-0 mt-0.5 ${featured ? 'text-white' : 'text-emerald-500'}`} strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={featured ? 'secondary' : 'outline'}
                    className={`w-full gap-1.5 ${featured ? 'bg-white text-primary hover:bg-white/90' : ''}`}
                    onClick={() => {
                      if (isFirst) {
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
              );
            })}
          </div>
          <Reveal delay={400}>
            <p className="text-center text-sm text-muted-foreground mt-8">
              {v.contactNote}
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
                {v.ecosystemSell.eyebrow}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
                {v.ecosystemSell.heading}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {v.ecosystemSell.sub}
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {v.ecosystemItems.map((svc, i) => {
              const Icon = ECOSYSTEM_META[i].icon;
              return (
                <Reveal key={svc.name} delay={i * 80}>
                  <div
                    onClick={() => navigate(ECOSYSTEM_META[i].href)}
                    className="group cursor-pointer bg-white rounded-2xl border border-border p-6 h-full flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4 ${ECOSYSTEM_META[i].color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-black text-foreground mb-2">{svc.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{svc.desc}</p>
                    <div className="flex items-center gap-1.5 text-primary text-sm font-semibold mt-5 group-hover:gap-2.5 transition-all">
                      {v.finalCta.learnMore} <ArrowRight className="h-3.5 w-3.5" />
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
                  {v.whySwelt.eyebrow}
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-5">
                  {v.whySwelt.heading}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {v.whySwelt.p}
                </p>
                <div className="space-y-3">
                  {v.whySwelt.bullets.map(item => (
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
                  { val: 15,   suffix: '+',  label: v.whyStats[0], icon: Award },
                  { val: 500,  suffix: '+',  label: v.whyStats[1], icon: Users },
                  { val: 3000, suffix: '+',  label: v.whyStats[2], icon: Package },
                  { val: 98,   suffix: ' %', label: v.whyStats[3], icon: Star },
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
            {v.testimonials.map((t, i) => (
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
                {v.faq.heading}
              </h2>
              <p className="text-muted-foreground">{v.faq.sub}</p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {v.faqItems.map((faq, i) => (
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
              {v.finalCta.communityBadge}
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white mb-5">
              {v.finalCta.bottomHeading}
            </h2>
            <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              {v.finalCta.bottomSub}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Button size="lg" variant="secondary" onClick={() => openAuth('register')} className="gap-2 h-12 px-8 text-base">
                    {v.hero.ctaRegister} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={() => openAuth('login')}
                    className="gap-2 h-12 px-8 text-base text-white border border-white/30 hover:bg-white/10"
                  >
                    {v.hero.ctaLogin}
                  </Button>
                </>
              ) : isB2bApproved ? (
                <Button size="lg" variant="secondary" onClick={goToCatalog} className="gap-2 h-12 px-8 text-base">
                  {v.hero.ctaCatalog} <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <p className="text-white/70 text-sm italic">{v.finalCta.processing}</p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Trust footer strip ── */}
      <section className="bg-white border-t border-border py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            {v.trustStrip.map((text, i) => {
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
      <ScrollToTopButton />
    </div>
  );
};

export default Velkoobchod;
