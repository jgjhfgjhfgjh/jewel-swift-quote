import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HandCoins, Star, Shield, Clock, Package, Check, ChevronDown,
  ArrowRight, Users, Phone, Mail, MessageSquare, Lock, Award,
  Globe, Gem, Watch, Truck, Eye, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { useStore } from '@/lib/store';
import { luxury } from '@/lib/i18n-luxury';

/* ─── Utility hooks ─── */
function useReveal(threshold = 0.15): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold }
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

/* ─── Static brand list (no translation) + icons (text comes from i18n-luxury.ts) ─── */
const brands = [
  'Tommy Hilfiger', 'Versace', 'Police', 'Tissot', 'Seiko', 'Citizen',
  'Hugo Boss', 'Armani Exchange', 'Michael Kors', 'Guess', 'Fossil',
  'Swarovski', 'Calvin Klein', 'DKNY', 'Bulova', 'Casio G-Shock',
  'Daniel Wellington', 'Lacoste', 'Emporio Armani', 'Skagen',
];
const BENEFIT_ICONS = [HandCoins, Package, Lock];
const STEP_ICONS = [MessageSquare, Clock, Truck];
const TRUST_ICONS = [Award, Star, Shield, Package, Lock];
const TRUST_STRIP_ICONS = [Award, Star, Shield, Lock, Truck];
const products = [
  { brand: 'Tommy Hilfiger', name: 'DECKER',    category: 'Hodinky', voc: 1790, moc: 4475 },
  { brand: 'Police',         name: 'MENELIK',   category: 'Hodinky', voc: 1250, moc: 3125 },
  { brand: 'Versace',        name: 'V-Chronos', category: 'Hodinky', voc: 2890, moc: 7225 },
];

/* ─── Form state type ─── */
interface FormState {
  name: string;
  email: string;
  phone: string;
  description: string;
  quantity: string;
  budget: string;
}

/* ─── Main component ─── */
export default function Luxury() {
  const navigate = useNavigate();
  const { lang } = useStore();
  const l = luxury[lang];
  const initialForm: FormState = {
    name: '', email: '', phone: '', description: '',
    quantity: l.qtyOptions[0], budget: l.budgetOptions[0],
  };
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  /* JSON-LD SEO */
  useEffect(() => {
    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'swelt.luxury — Privátní přístup k prémiím',
      description: 'Exkluzivní přístup k velkoobchodním cenám prémiových hodinek a šperků pro soukromé osoby i firmy. Bez nutnosti IČO, dostupné od 1 kusu, doručení po celé EU.',
      provider: { '@type': 'Organization', name: 'ZAGO / swelt.partner', url: 'https://swelt.partner' },
      areaServed: [
        { '@type': 'Country', name: 'CZ' },
        { '@type': 'Country', name: 'SK' },
        { '@type': 'Country', name: 'DE' },
        { '@type': 'Country', name: 'AT' },
      ],
      availableLanguage: ['cs', 'sk'],
    };

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: l.faqs.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'swelt.partner', item: 'https://swelt.partner' },
        { '@type': 'ListItem', position: 2, name: 'swelt.luxury', item: 'https://swelt.partner/luxury' },
      ],
    };

    [serviceSchema, faqSchema, breadcrumb].forEach((schema, i) => {
      const id = `ld-json-luxury-${i}`;
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
      [0, 1, 2].forEach(i => document.getElementById(`ld-json-luxury-${i}`)?.remove());
    };
  }, []);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = l.inquiry.nameError;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = l.inquiry.emailError;
    if (!form.description.trim()) e.description = l.inquiry.descError;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  }

  function handleChange(field: keyof FormState) {
    return (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [field]: ev.target.value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };
  }

  const discount = (voc: number, moc: number) => Math.round((1 - voc / moc) * 100);

  return (
    <div
      className="luxury-page min-h-screen bg-background text-foreground"
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
      <Navbar />
      <BackButton />

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <Reveal>
                <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 font-medium px-3 py-1 text-xs uppercase tracking-wider">
                  {l.hero.badge}
                </Badge>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-foreground mb-5">
                  {l.hero.h1Part1}{' '}
                  <span className="text-primary">{l.hero.h1Highlight}</span>{' '}
                  {l.hero.h1Part2}
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
                  {l.hero.sub}
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <Button size="lg" className="gap-2 text-base font-semibold shadow-md" onClick={scrollToForm}>
                    {l.hero.ctaInquiry} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2 text-base">
                    {l.hero.ctaBrands} <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Reveal>
              <Reveal delay={320}>
                <div className="flex flex-wrap gap-3">
                  {l.hero.pills.map(pill => (
                    <span key={pill} className="inline-flex items-center gap-1.5 bg-white border border-border rounded-full px-4 py-1.5 text-sm font-medium text-foreground shadow-sm">
                      <Check className="h-3.5 w-3.5 text-primary" />
                      {pill}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Right — product showcase card */}
            <Reveal delay={200} className="lg:flex lg:justify-end">
              <div className="bg-white rounded-2xl shadow-xl border border-border p-6 max-w-sm w-full mx-auto lg:mx-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest">{l.hero.sampleLabel}</span>
                  <Badge variant="secondary" className="text-xs">{l.hero.productCount}</Badge>
                </div>
                <div className="space-y-3 mb-5">
                  {products.map(p => (
                    <div key={p.name} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
                        <Watch className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                        <p className="text-sm font-semibold truncate">{p.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-primary">{p.voc.toLocaleString('cs')} Kč</p>
                        <p className="text-xs text-muted-foreground line-through">{p.moc.toLocaleString('cs')} Kč</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">{l.hero.brandsLabel}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Tommy Hilfiger', 'Versace', 'Police', 'Tissot', 'Seiko'].map(b => (
                      <span key={b} className="text-xs bg-primary/8 text-primary border border-primary/15 rounded-full px-2 py-0.5 font-medium">{b}</span>
                    ))}
                    <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{l.hero.moreCount}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-primary py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-primary-foreground">
            <div>
              <p className="text-3xl font-bold font-display"><CountUp to={3000} suffix="+" /></p>
              <p className="text-sm opacity-80 mt-1">{l.stats[0]}</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-display"><CountUp to={70} suffix="+" /></p>
              <p className="text-sm opacity-80 mt-1">{l.stats[1]}</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-display"><CountUp to={60} suffix="%" /></p>
              <p className="text-sm opacity-80 mt-1">{l.stats[2]}</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-display"><CountUp to={15} suffix="+" /></p>
              <p className="text-sm opacity-80 mt-1">{l.stats[3]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider">{l.benefits.eyebrow}</Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">{l.benefits.heading}</h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-6">
            {l.benefits.items.map((b, i) => {
              const Icon = BENEFIT_ICONS[i];
              return (
                <Reveal key={b.title} delay={i * 100}>
                  <div className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 sm:py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider">{l.howItWorks.eyebrow}</Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">{l.howItWorks.heading}</h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-border" style={{ left: '16.67%', right: '16.67%' }} />
            {l.howItWorks.steps.map((s, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <Reveal key={i} delay={i * 120}>
                  <div className="relative text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-5 shadow-md">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-5 h-5 rounded-full bg-white border-2 border-primary text-primary text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <h3 className="font-semibold text-base mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Brands strip ── */}
      <section className="py-14 bg-white border-y border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-8">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              {l.brandsStrip}
            </p>
          </Reveal>
          <div className="flex flex-wrap justify-center gap-3">
            {brands.map((brand, i) => (
              <Reveal key={brand} delay={i * 30}>
                <span className="inline-flex items-center gap-1.5 bg-muted border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-default">
                  <Gem className="h-3.5 w-3.5 text-primary/60" />
                  {brand}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Inquiry form ── */}
      <section ref={formRef} className="py-16 sm:py-24 bg-background scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider">{l.inquiry.eyebrow}</Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">{l.inquiry.heading}</h2>
          </Reveal>
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8">
                {submitted ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-display font-bold text-xl mb-2">{l.inquiry.submitted}</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      {l.inquiry.submittedSub} <strong>{form.email}</strong>.
                    </p>
                    <Button variant="outline" onClick={() => { setSubmitted(false); setForm(initialForm); }}>
                      {l.inquiry.submitAgain}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div>
                      <p className="font-semibold text-lg mb-0.5">{l.inquiry.nonbinding}</p>
                      <p className="text-sm text-muted-foreground">{l.inquiry.replyTime}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="lux-name">{l.inquiry.nameLabel}</label>
                        <input
                          id="lux-name"
                          type="text"
                          value={form.name}
                          onChange={handleChange('name')}
                          placeholder={l.inquiry.namePh}
                          className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 transition ${errors.name ? 'border-red-400' : 'border-border'}`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="lux-email">{l.inquiry.emailLabel}</label>
                        <input
                          id="lux-email"
                          type="email"
                          value={form.email}
                          onChange={handleChange('email')}
                          placeholder={l.inquiry.emailPh}
                          className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 transition ${errors.email ? 'border-red-400' : 'border-border'}`}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="lux-phone">{l.inquiry.phoneLabel}</label>
                      <input
                        id="lux-phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange('phone')}
                        placeholder={l.inquiry.phonePh}
                        className="w-full rounded-lg border border-border px-3 py-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="lux-desc">{l.inquiry.descLabel}</label>
                      <textarea
                        id="lux-desc"
                        rows={4}
                        value={form.description}
                        onChange={handleChange('description')}
                        placeholder={l.inquiry.descPh}
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 transition resize-none ${errors.description ? 'border-red-400' : 'border-border'}`}
                      />
                      {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="lux-qty">{l.inquiry.qtyLabel}</label>
                        <select
                          id="lux-qty"
                          value={form.quantity}
                          onChange={handleChange('quantity')}
                          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 transition"
                        >
                          {l.qtyOptions.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="lux-budget">{l.inquiry.budgetLabel}</label>
                        <select
                          id="lux-budget"
                          value={form.budget}
                          onChange={handleChange('budget')}
                          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 transition"
                        >
                          {l.budgetOptions.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full gap-2 font-semibold text-base mt-2">
                      {l.inquiry.submit} <ArrowRight className="h-4 w-4" />
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">{l.inquiry.noSpam}</p>
                  </form>
                )}
              </div>
            </div>

            {/* Trust side */}
            <div className="lg:col-span-2 space-y-5">
              <Reveal>
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                  <h3 className="font-semibold text-base mb-4">{l.inquiry.whyTrust}</h3>
                  <ul className="space-y-3">
                    {l.trustItems.map(text => (
                      <li key={text} className="flex items-center gap-3 text-sm">
                        <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{l.inquiry.recentActivity}</p>
                  <div className="space-y-3">
                    {l.notifications.map((n, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Users className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium leading-tight">{n.name} {n.city}</p>
                          <p className="text-muted-foreground text-xs">{n.product} — {l.inquiry.activityNote}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 text-center">
                  <Globe className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold mb-1">{l.inquiry.euDelivery}</p>
                  <p className="text-xs text-muted-foreground">{l.inquiry.euDeliveryNote}</p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured products ── */}
      <section className="py-16 sm:py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider">{l.productsSection.eyebrow}</Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">{l.productsSection.heading}</h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-lg mx-auto">
              {l.productsSection.sub}
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <Reveal key={p.name} delay={i * 100}>
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gradient-to-br from-primary/8 to-primary/3 p-8 flex items-center justify-center">
                    <Watch className="h-16 w-16 text-primary/40" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{p.brand}</p>
                        <h3 className="font-bold text-base">{p.name}</h3>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs shrink-0">
                        -{discount(p.voc, p.moc)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{p.category}</p>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-xl font-bold text-primary">{p.voc.toLocaleString('cs')} Kč</span>
                      <span className="text-sm text-muted-foreground line-through mb-0.5">{p.moc.toLocaleString('cs')} Kč MOC</span>
                    </div>
                    <Badge variant="outline" className="text-xs w-full justify-center py-1.5">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      {l.productsSection.available}
                    </Badge>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider">{l.faq.eyebrow}</Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">{l.faq.heading}</h2>
          </Reveal>
          <div className="bg-white rounded-2xl border border-border shadow-sm px-6 sm:px-8">
            {l.faqs.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA bottom ── */}
      <section className="py-16 sm:py-24 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <Gem className="h-10 w-10 mx-auto mb-5 opacity-80" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
              {l.cta.heading}
            </h2>
            <p className="text-base opacity-85 mb-8">
              {l.cta.sub}
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 font-semibold text-base shadow-lg"
              onClick={scrollToForm}
            >
              {l.cta.button} <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ── Trust footer strip ── */}
      <section className="py-8 bg-white border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-sm text-muted-foreground">
            {l.trustStrip.map((text, i) => {
              const Icon = TRUST_STRIP_ICONS[i];
              return (
                <span key={text} className="flex items-center gap-1.5 font-medium">
                  <Icon className="h-4 w-4 text-primary" />
                  {text}
                </span>
              );
            })}
          </div>
        </div>
      </section>
      <ScrollToTopButton />
    </div>
  );
}
