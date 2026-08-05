import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, PackageOpen, Truck, Tag, Zap, Users, ShieldCheck,
  HeadphonesIcon, BarChart2, Check, ChevronDown, TrendingUp,
  Globe, Sparkles, RefreshCw, AlertCircle, Layers, Bell, Target,
  Lock, FileText, Camera, Award, MapPin, X, ShoppingCart, Store,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { useWishlist } from '@/hooks/useWishlist';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { useStore } from '@/lib/store';
import { dropshipping as dropT, type DropText } from '@/lib/i18n-dropshipping';

/* ── Sdílené třídy s homepage (stejný vzor jako /deals) ────────────────────
   Full-width sekce se zaobleným horním okrajem, střídání bílá ↔ černá
   (#0d0d10), extralight nadpisy v clampu a iOS pilulková CTA. Wrapper každé
   sekce nese barvu sekce PŘEDCHOZÍ — zaoblené rohy ji odkrývají. */
const DARK = '#0d0d10';
const GRADIENT = 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent';
const SECTION = 'w-full rounded-t-[1.75rem] px-5 pt-16 pb-16 sm:rounded-t-[2.75rem] sm:px-10 sm:pt-24 sm:pb-24 lg:px-14';
const H2 = 'font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.5rem,4.5vw,3rem)]';
const H3 = 'font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.35rem,3vw,2.25rem)]';
const EYEBROW = 'text-[11px] font-semibold uppercase tracking-[0.25em]';
const PILL_LIGHT = 'inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100';
const PILL_OUTLINE_DARK = 'inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10';
const PILL_DARK = 'inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800';
const PILL_OUTLINE_LIGHT = 'inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50';

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/* ─── JSON-LD SEO injection — obsah jede z CS slovníku (jeden zdroj pravdy) ─── */
function SeoHead() {
  useEffect(() => {
    const cs = dropT.cs;
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: cs.faqs.map((f) => ({
        '@type': 'Question', name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };

    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'swelt.partner Dropshipping',
      description: 'Dropshipping prémiových hodinek, šperků a módních doplňků pro české a slovenské e-shopy. 65+ značek, white-label expedice do 24–72 h, real-time synchronizace zásob, swelt.signal AI.',
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

/* ─── Ikonová data (texty žijí v i18n slovníku) ─── */
const PAIN_ICONS = [AlertCircle, Truck, Target, Lock];
const STEP_ICONS = [Users, Layers, Store, PackageOpen, Truck];
const HERO_CARD_ICONS = [ShoppingCart, PackageOpen, Truck];
const SIGNAL_ICONS = [TrendingUp, Globe, BarChart2, Bell];
const USP_ICONS = [Tag, Truck, Zap, Lock, ShieldCheck, RefreshCw, FileText, Award, HeadphonesIcon, Globe];
const CONTACT_ICONS = [HeadphonesIcon, Globe, Users];

/* Demo řádky swelt.signal digestu — identifikátory produktů, ne copy */
const signalProducts = [
  { sku: 'SKU-7712', name: 'Citizen Eco-Drive BM7455', trend: 92, change: '+28%', tone: 'success' },
  { sku: 'SKU-3301', name: 'Seiko Presage SRPE35', trend: 76, change: '+14%', tone: 'accent' },
  { sku: 'SKU-9014', name: 'Police Menelik PEWJG', trend: 61, change: '+6%', tone: 'accent' },
  { sku: 'SKU-2208', name: 'Versace V-Chronos VE5A', trend: 28, change: '−11%', tone: 'destructive' },
];

/* ─── Product Calculator ─── */
const DEMO_PRODUCT = {
  brand: 'TOMMY HILFIGER',
  name: 'DECKER 1791349',
  fullName: 'Hodinky TOMMY HILFIGER model DECKER 1791349',
  img: 'https://cdn.b2bzago.com/images/0/7afe1cca249d731c/100/hodinky-tommy-hilfiger-model-decker-1791349.jpg?hash=-2',
  vocEur: 71.60,
  mocEur: 179.00,
  voc: 1790,   // €71.60 × 25 CZK/EUR
  moc: 4475,   // €179.00 × 25 CZK/EUR
  discount: 60,
  stock: 14,
};

const PLAN_PRICES = {
  starter: { monthly: 1490, yearly: 1192 },
  silver:  { monthly: 2490, yearly: 1992 },
};

const CALC_PLAN_KEYS = ['starter', 'silver', 'gold'] as const;

function ProductCalculator({ d }: { d: DropText }) {
  const c = d.calc;
  const [sellPrice, setSellPrice] = useState(DEMO_PRODUCT.moc);
  const [orders, setOrders] = useState(30);
  const [planTier, setPlanTier] = useState<'starter' | 'silver'>('silver');
  const [planBilling, setPlanBilling] = useState<'quarterly' | 'yearly'>('quarterly');

  const margin = sellPrice - DEMO_PRODUCT.voc;
  const marginPct = sellPrice > 0 ? ((margin / sellPrice) * 100).toFixed(1) : '0.0';
  const monthlyProfit = margin * orders;
  const yearlyProfit = monthlyProfit * 12;
  const isGood = margin >= 500;
  const profitColor = margin >= 1000 ? 'text-emerald-600' : margin >= 0 ? 'text-amber-600' : 'text-red-500';

  const planMonthlyPrice = PLAN_PRICES[planTier][planBilling === 'quarterly' ? 'monthly' : 'yearly'];
  const planYearlyCost = planMonthlyPrice * 12;
  const netYearlyProfit = yearlyProfit - planYearlyCost;

  const navigate = useNavigate();

  const netFor = (monthly: number) => yearlyProfit - monthly * 12;
  const fmt = (n: number) => n.toLocaleString('cs');

  return (
    <div className="space-y-8">

      {/* ── Row 1: Product card + Sliders + Results ── */}
      <div className="grid lg:grid-cols-3 gap-5 items-stretch">

        {/* Product card */}
        <div className="rounded-2xl bg-white ring-1 ring-zinc-200 overflow-hidden flex flex-col">
          <div className="relative">
            <img
              src={DEMO_PRODUCT.img}
              alt={DEMO_PRODUCT.fullName}
              className="w-full aspect-[4/3] object-contain bg-zinc-50 p-4"
              onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="%23f4f4f5"/><text x="150" y="100" text-anchor="middle" font-family="sans-serif" fill="%23a1a1aa">Foto produktu</text></svg>'; }}
            />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white ring-1 ring-zinc-200 px-2 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-zinc-900">{c.live}</span>
            </div>
            <div className="absolute top-3 right-3 rounded-full bg-zinc-900 text-white text-xs font-semibold px-2.5 py-1">
              −{DEMO_PRODUCT.discount}%
            </div>
          </div>
          <div className="p-5 flex flex-col flex-1">
            <div className="text-xs font-semibold text-zinc-400 tracking-wide mb-1">{DEMO_PRODUCT.brand}</div>
            <div className="font-semibold text-sm leading-snug text-zinc-900 mb-3">{DEMO_PRODUCT.fullName}</div>
            <div className="flex items-center gap-1.5 mb-4">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">{c.stockLabel}: {DEMO_PRODUCT.stock} {c.unit}</span>
            </div>
            <div className="rounded-xl bg-zinc-50 ring-1 ring-zinc-100 p-3 space-y-1.5 text-xs mt-auto">
              <div className="flex justify-between">
                <span className="text-zinc-500">{c.vocLabel}</span>
                <span className="font-semibold text-zinc-900">€{DEMO_PRODUCT.vocEur.toFixed(2)} <span className="text-zinc-400 font-normal">≈ {fmt(DEMO_PRODUCT.voc)} {c.currency}</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{c.mocLabel}</span>
                <span className="font-semibold text-zinc-900">€{DEMO_PRODUCT.mocEur.toFixed(2)} <span className="text-zinc-400 font-normal">≈ {fmt(DEMO_PRODUCT.moc)} {c.currency}</span></span>
              </div>
              <div className="h-px bg-zinc-200 my-1" />
              <div className="flex justify-between">
                <span className="text-zinc-500">{c.marginAtMoc}</span>
                <span className="font-bold text-emerald-600">€{(DEMO_PRODUCT.mocEur - DEMO_PRODUCT.vocEur).toFixed(2)} ({DEMO_PRODUCT.discount} %)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="rounded-2xl bg-white ring-1 ring-zinc-200 p-6 flex flex-col gap-8">
          <div className="flex-1 space-y-6">
            <div className={`${EYEBROW} text-zinc-400`}>{c.scenarioEyebrow}</div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-zinc-900 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-zinc-400" />
                  {c.buyPriceLabel}
                </label>
                <span className="font-semibold text-zinc-500 tabular-nums">{fmt(DEMO_PRODUCT.voc)} {c.currency}</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100 relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-zinc-300 rounded-full" style={{ width: `${(DEMO_PRODUCT.voc / 5000) * 100}%` }} />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">{c.buyPriceNote}</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-zinc-900">{c.sellPriceLabel}</label>
                <span className="font-semibold text-zinc-900 tabular-nums">{fmt(sellPrice)} {c.currency}</span>
              </div>
              <Slider value={[sellPrice]} onValueChange={([v]) => setSellPrice(v)} min={DEMO_PRODUCT.voc + 100} max={7000} step={25} />
              <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                <span>{c.minLabel} {fmt(DEMO_PRODUCT.voc + 100)} {c.currency}</span>
                <span className="text-zinc-600 font-medium">{c.mocShort} {fmt(DEMO_PRODUCT.moc)} {c.currency}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-zinc-900">{c.ordersLabel}</label>
                <span className="font-semibold text-zinc-900 tabular-nums">{orders} {c.unit}</span>
              </div>
              <Slider value={[orders]} onValueChange={([v]) => setOrders(v)} min={1} max={200} step={1} />
              <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                <span>1 {c.unit}</span><span>200 {c.unit}</span>
              </div>
            </div>
          </div>

          {/* Mini results */}
          <div className="rounded-xl bg-zinc-50 ring-1 ring-zinc-100 p-4 grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-zinc-500">{c.marginPerPiece}</div>
              <div className={`font-sans text-xl font-semibold tracking-tight ${profitColor}`}>{fmt(margin)} {c.currency}</div>
              <div className="text-xs text-zinc-400">{marginPct} %</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">{c.monthlyProfit}</div>
              <div className={`font-sans text-xl font-semibold tracking-tight ${profitColor}`}>{fmt(monthlyProfit)} {c.currency}</div>
              <div className="text-xs text-zinc-400">{orders} {c.ordersShort}</div>
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div className="rounded-2xl bg-zinc-900 text-white p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="text-xs text-zinc-400 uppercase tracking-wider">{c.resultsEyebrow}</div>

            {/* Plan tier selector */}
            <div className="flex rounded-full bg-white/10 p-0.5 gap-0.5">
              {(['starter', 'silver'] as const).map((t, i) => (
                <button key={t} onClick={() => setPlanTier(t)}
                  className={`flex-1 rounded-full py-1.5 text-[11px] font-semibold transition-colors ${planTier === t ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'}`}>
                  {c.plans[i].name}
                </button>
              ))}
            </div>

            {/* Billing frequency toggle */}
            <div className="flex rounded-full bg-white/10 p-0.5 gap-0.5">
              {(['quarterly', 'yearly'] as const).map(p => (
                <button key={p} onClick={() => setPlanBilling(p)}
                  className={`flex-1 rounded-full py-1.5 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 ${planBilling === p ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'}`}>
                  {p === 'quarterly' ? d.pricing.quarterly : (
                    <span className="flex items-center gap-1.5">{d.pricing.yearly} <span className="text-[9px] bg-emerald-500 text-white rounded-full px-1.5 py-0.5 leading-none">−20 %</span></span>
                  )}
                </button>
              ))}
            </div>

            {/* Gross */}
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">{c.grossLabel}</div>
              <div className="font-sans font-extralight tracking-tight text-4xl leading-none">{fmt(yearlyProfit)}</div>
              <div className="text-sm text-zinc-400 mt-1">{c.yearUnit} · {orders} {c.perMonthOrders}</div>
            </div>

            {/* Selected plan deduction */}
            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">{c.planLabel} {c.plans[planTier === 'starter' ? 0 : 1].name} {c.perYearSuffix}</span>
                <span className="text-red-400 font-semibold">−{fmt(planYearlyCost)} {c.currency}</span>
              </div>
              <div className="text-[10px] text-zinc-500">
                {fmt(planMonthlyPrice)} {c.perMonthShort} · {planBilling === 'quarterly' ? c.billedQuarterly : c.billedYearly}
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between text-sm font-bold">
                <span>{c.netPerYear}</span>
                <span className={netYearlyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {fmt(netYearlyProfit)} {c.currency}
                </span>
              </div>
            </div>
          </div>

          {isGood && (
            <div className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-xs text-zinc-200">
              {c.goodMargin}
            </div>
          )}
        </div>
      </div>

      {/* ── Separator + centered billing toggle ── */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs text-zinc-400 text-center">{c.disclaimer}</p>
        <div className="inline-flex rounded-full bg-white ring-1 ring-zinc-200 p-1 gap-1">
          {(['quarterly', 'yearly'] as const).map(p => (
            <button key={p} onClick={() => setPlanBilling(p)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all flex items-center gap-2 ${planBilling === p ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>
              {p === 'quarterly' ? d.pricing.quarterly : (
                <span className="flex items-center gap-2">{d.pricing.yearly} <span className="text-[10px] bg-emerald-500 text-white rounded-full px-1.5 py-0.5 leading-none">−20 %</span></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Row 2: All plans ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {c.plans.map((plan, i) => {
          const key = CALC_PLAN_KEYS[i];
          const isGold = key === 'gold';
          const prices = isGold ? null : PLAN_PRICES[key as 'starter' | 'silver'];
          const monthlyPrice = prices ? (planBilling === 'quarterly' ? prices.monthly : prices.yearly) : 0;
          const yearlyPlanCost = monthlyPrice * 12;
          const net = prices ? netFor(monthlyPrice) : null;
          const isSelected = planTier === key;
          const featured = key === 'silver';

          return (
            <div key={plan.name}
              className={`relative rounded-2xl bg-white transition-all ${featured ? 'border-2 border-zinc-900' : isSelected ? 'ring-2 ring-zinc-400' : 'ring-1 ring-zinc-200'}`}>

              {plan.badge && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-semibold ${featured ? 'bg-zinc-900 text-white' : 'bg-white ring-1 ring-zinc-300 text-zinc-600'}`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-6 pt-7">
                <div className="text-center mb-5">
                  <div className="text-xl font-semibold tracking-tight text-zinc-900 mb-0.5">{plan.name}</div>
                  <div className="text-xs text-zinc-500 mb-3">{plan.subtitle}</div>
                  {isGold ? (
                    <div className="text-sm text-zinc-500 font-medium py-1">{d.pricing.bespoke}</div>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="font-sans font-extralight tracking-tight text-3xl text-zinc-900">{fmt(monthlyPrice)}</span>
                        <span className="text-sm text-zinc-500">{d.pricing.perMonth}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {planBilling === 'quarterly'
                          ? `${fmt(monthlyPrice * 3)} ${d.pricing.quarterlyNote}`
                          : `${fmt(yearlyPlanCost)} ${d.pricing.yearlyNote}`}
                      </div>
                    </>
                  )}
                </div>

                {net !== null && (
                  <div
                    className={`rounded-xl p-3 mb-4 text-center cursor-pointer transition-all ${isSelected ? 'bg-zinc-900 text-white' : 'bg-zinc-50 ring-1 ring-zinc-100 hover:ring-zinc-300'}`}
                    onClick={() => !isGold && setPlanTier(key as 'starter' | 'silver')}
                  >
                    <div className={`text-[10px] uppercase tracking-wider mb-0.5 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>{c.netPerYear}</div>
                    <div className={`font-sans text-xl font-semibold tracking-tight ${isSelected ? '' : net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {fmt(net)} {c.currency}
                    </div>
                    {!isSelected && <div className="text-[10px] text-zinc-500 mt-0.5">{c.selectPlan}</div>}
                  </div>
                )}

                <ul className="space-y-1.5 mb-5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-zinc-700">
                      <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`${featured ? PILL_DARK : PILL_OUTLINE_LIGHT} w-full`}
                  onClick={() => navigate('/register')}
                >
                  {plan.cta} <ArrowRight className="h-4 w-4" />
                </button>

                {featured && (
                  <p className="text-center text-[10px] text-zinc-400 mt-2">{c.silverNote}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── FAQ Item (tmavá sekce) ─── */
function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left gap-4 text-zinc-100 hover:text-white transition-colors">
        <span className="font-medium text-sm sm:text-base">{q}</span>
        <ChevronDown className={`h-5 w-5 text-zinc-500 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-zinc-400 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ─── Plovoucí social proof ─── */
function FloatingNotif({ t }: { t: DropText['notif'] }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => { setVisible(true); setTimeout(() => setVisible(false), 4500); };
    const interval = setInterval(() => {
      setIdx(i => (i + 1) % t.entries.length);
      show();
    }, 10000);
    const timer = setTimeout(show, 3500);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [t.entries.length]);

  const entry = t.entries[idx];

  return (
    <div className={`fixed bottom-20 left-4 z-50 transition-all duration-500 lg:bottom-6 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="flex items-center gap-3 rounded-2xl bg-white ring-1 ring-zinc-200 shadow-xl px-4 py-3 max-w-xs">
        <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
          <Users className="h-4 w-4 text-zinc-600" />
        </div>
        <div>
          <div className="text-xs font-semibold text-zinc-900">{entry.name} z {entry.city}</div>
          <div className="text-[11px] text-zinc-500">{entry.action} · {t.justNow}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
const Dropshipping = () => {
  const navigate = useNavigate();
  const { wishlistIds } = useWishlist();
  const { lang } = useStore();
  const d = dropT[lang];
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'quarterly' | 'yearly'>('quarterly');
  const [activePlatform, setActivePlatform] = useState(0);
  const [faqLimit, setFaqLimit] = useState(6);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const heroStats = [
    { value: '15+', label: d.hero.statLabels[0] },
    { value: '65+', label: d.hero.statLabels[1] },
    { value: '500+', label: d.hero.statLabels[2] },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-white pb-16 lg:pb-0">
      <SeoHead />
      <Navbar onDark wishlistCount={wishlistIds.size} onOpenWishlist={() => setWishlistOpen(true)} />
      <BackButton />
      <FloatingNotif t={d.notif} />

      <main className="flex-1">

        {/* ══ 1. HERO (černá) ══ */}
        <section className="w-full px-5 pt-28 pb-16 sm:px-10 sm:pt-36 sm:pb-24 lg:px-14" style={{ backgroundColor: DARK }}>
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                  <PackageOpen className="h-3.5 w-3.5" />
                  {d.hero.badge}
                </div>
                <h1 className="mt-6 font-sans font-extralight tracking-tight leading-[1.1] text-[clamp(2.25rem,6vw,4.25rem)] text-white">
                  {d.hero.h1Part1}<br /><span className={GRADIENT}>{d.hero.h1Highlight}</span>
                </h1>
                <p className="mt-6 max-w-xl font-sans text-base font-light leading-relaxed text-zinc-400 sm:text-xl">
                  {d.hero.sub}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button type="button" onClick={() => navigate('/register')} className={PILL_LIGHT}>
                    {d.hero.ctaPrimary} <ArrowRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => scrollTo('jak-to-funguje')} className={PILL_OUTLINE_DARK}>
                    {d.hero.ctaSecondary}
                  </button>
                </div>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {d.hero.bullets.map(t => (
                    <span key={t} className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={3} />{t}
                    </span>
                  ))}
                </div>

                <div className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8">
                  {heroStats.map(s => (
                    <div key={s.label}>
                      <div className="font-sans font-extralight tracking-tight leading-none text-[clamp(1.75rem,4vw,2.75rem)] text-white">{s.value}</div>
                      <div className="mt-2 text-xs text-zinc-400">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flow card — jak to funguje ve 3 krocích */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:ml-auto lg:w-full lg:max-w-md">
                <div className="flex items-center justify-between">
                  <div className={`${EYEBROW} text-zinc-400`}>{d.hero.card.eyebrow}</div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                    {d.hero.card.badge}
                  </span>
                </div>
                <div className="mt-6 space-y-5">
                  {d.hero.card.steps.map((s, i) => {
                    const Icon = HERO_CARD_ICONS[i];
                    return (
                      <div key={s.label} className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{s.label}</div>
                          <div className="text-xs text-zinc-500">{s.sub}</div>
                        </div>
                        <div className="select-none font-sans font-extralight text-2xl leading-none text-zinc-600">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  {d.hero.card.stats.map(s => (
                    <div key={s.label}>
                      <div className="font-sans font-extralight tracking-tight text-2xl text-white">{s.value}</div>
                      <div className="mt-1 text-[10px] text-zinc-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 2. PAIN → SOLUTION (bílá) ══ */}
        <div style={{ backgroundColor: DARK }}>
          <section className={`${SECTION} bg-white`}>
            <div className="mx-auto max-w-[1400px]">
              <div className="mx-auto max-w-[1000px] text-left">
                <div className={`${EYEBROW} text-zinc-400`}>{d.pain.eyebrow}</div>
                <h2 className={`${H2} mt-3 text-zinc-900`}>{d.pain.heading}</h2>
              </div>
              <div className="mx-auto mt-10 grid max-w-[1160px] gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
                {d.pain.items.map((p, i) => {
                  const Icon = PAIN_ICONS[i];
                  return (
                    <div key={p.title} className="rounded-2xl bg-zinc-50 p-6 ring-1 ring-zinc-100">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-zinc-500 ring-1 ring-zinc-200">
                        <Icon className="h-3.5 w-3.5" /> „{p.problem}“
                      </div>
                      <h3 className="mt-5 text-base font-semibold tracking-tight text-zinc-900">{p.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-500">{p.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* ══ 3. JAK TO FUNGUJE (černá) ══ */}
        <div className="bg-white">
          <section id="jak-to-funguje" className={`${SECTION} scroll-mt-16`} style={{ backgroundColor: DARK }}>
            <div className="mx-auto max-w-[1400px]">
              <div className="mx-auto max-w-[1000px] text-left">
                <div className={`${EYEBROW} text-zinc-500`}>{d.steps.eyebrow}</div>
                <h2 className={`${H2} mt-3 text-white`}>{d.steps.heading}</h2>
                <p className="mt-4 max-w-2xl font-sans text-base font-light leading-relaxed text-zinc-400 sm:text-lg">{d.steps.sub}</p>
              </div>
              <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-5">
                {d.steps.items.map((s, i) => {
                  const Icon = STEP_ICONS[i];
                  return (
                    <div key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="select-none font-sans font-extralight leading-none text-4xl text-zinc-600">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold tracking-tight text-white">{s.title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-400">{s.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* ══ 4. SWELT.SIGNAL (bílá) ══ */}
        <div style={{ backgroundColor: DARK }}>
          <section id="signal" className={`${SECTION} scroll-mt-16 bg-white`}>
            <div className="mx-auto max-w-[1160px]">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
                <div className="flex flex-col justify-center">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                    <Sparkles className="h-3.5 w-3.5" /> {d.shopUpsell.badge}
                  </div>
                  <h2 className={`${H2} mt-6`}>
                    <span className="text-zinc-900">{d.shopUpsell.h1}</span><br />
                    <span className={GRADIENT}>{d.shopUpsell.h1Highlight}</span>
                  </h2>
                  <p className="mt-5 max-w-xl font-sans text-base font-light leading-relaxed text-zinc-500 sm:text-lg">
                    {d.shopUpsell.sub}
                  </p>
                  <div className="mt-8 space-y-4">
                    {d.shopUpsell.features.map((f, i) => {
                      const Icon = SIGNAL_ICONS[i];
                      return (
                        <div key={f.title} className="flex gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900">
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-zinc-900">{f.title}</div>
                            <div className="mt-0.5 text-xs text-zinc-500">{f.text}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-8">
                    <button type="button" onClick={() => navigate('/register')} className={PILL_DARK}>
                      {d.shopUpsell.cta1} <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Signal live panel */}
                <div className="flex flex-col justify-center">
                  <div className="rounded-2xl bg-zinc-50 p-6 ring-1 ring-zinc-100">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <div className={`${EYEBROW} text-zinc-500`}>{d.shopUpsell.digestEyebrow}</div>
                        <div className="mt-1 text-xs text-zinc-400">{d.shopUpsell.digestWeek}</div>
                      </div>
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="mb-5 space-y-3">
                      {signalProducts.map((p) => {
                        const tc = p.tone === 'success' ? 'text-emerald-600' : p.tone === 'destructive' ? 'text-red-500' : 'text-blue-600';
                        const bc = p.tone === 'success' ? 'bg-emerald-500' : p.tone === 'destructive' ? 'bg-red-400' : 'bg-blue-600';
                        return (
                          <div key={p.sku} className="flex items-center gap-3">
                            <div className="w-28 shrink-0">
                              <div className="truncate text-xs font-medium text-zinc-900">{p.name.split(' ').slice(0, 2).join(' ')}</div>
                              <div className="text-[10px] text-zinc-400">{p.sku}</div>
                            </div>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200">
                              <div className={`h-full rounded-full ${bc}`} style={{ width: `${p.trend}%` }} />
                            </div>
                            <div className={`w-12 text-right text-xs font-bold ${tc}`}>{p.change}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="rounded-xl bg-white p-4 ring-1 ring-zinc-200">
                      <div className={`${EYEBROW} mb-2 text-zinc-500`}>{d.shopUpsell.digestRecsEyebrow}</div>
                      <ul className="space-y-1.5">
                        {d.shopUpsell.digestRecs.map(r => (
                          <li key={r} className="flex items-start gap-1.5 text-xs text-zinc-700">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ══ 5. LOGISTIKA & KVALITA (černá) ══ */}
        <div className="bg-white">
          <section id="logistika" className={`${SECTION} scroll-mt-16`} style={{ backgroundColor: DARK }}>
            <div className="mx-auto max-w-[1400px]">
              <div className="mx-auto max-w-[1000px] text-left">
                <div className={`${EYEBROW} text-zinc-500`}>{d.logistics.eyebrow}</div>
                <h2 className={`${H2} mt-3 text-white`}>{d.logistics.heading}</h2>
                <p className="mt-4 font-sans text-base font-light leading-relaxed text-zinc-400 sm:text-lg">{d.logistics.sub}</p>
              </div>

              <div className="mx-auto mt-10 grid max-w-[1160px] gap-5 sm:mt-14 lg:grid-cols-2">
                {/* Shipping zones */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-zinc-400" />
                    <h3 className="text-base font-semibold tracking-tight text-white">{d.logistics.zonesTitle}</h3>
                  </div>
                  <div>
                    {d.logistics.zones.map((z, i) => (
                      <div key={z.zone} className={`flex items-center gap-3 py-3 ${i > 0 ? 'border-t border-white/10' : ''}`}>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-white">{z.zone}</div>
                          <div className="text-xs text-zinc-500">{z.couriers}</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-sm font-semibold text-white">{z.time}</div>
                          <div className="text-xs text-emerald-400">{z.reliability}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality check */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <Camera className="h-5 w-5 text-zinc-400" />
                    <h3 className="text-base font-semibold tracking-tight text-white">{d.logistics.qcHeading}</h3>
                  </div>
                  <ol className="space-y-5">
                    {d.logistics.qcSteps.map((s, i) => (
                      <li key={s.title} className="flex gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{s.title}</div>
                          <div className="mt-0.5 text-xs leading-relaxed text-zinc-400">{s.text}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Invoicing + inventory lock callouts */}
              <div className="mx-auto mt-5 grid max-w-[1160px] gap-5 sm:grid-cols-2">
                {[
                  { icon: FileText, ...d.logistics.invoicing },
                  { icon: Lock, ...d.logistics.lock },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Icon className="h-5 w-5 text-zinc-400" />
                      <h3 className="text-base font-semibold tracking-tight text-white">{title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-400">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ══ 6. KALKULAČKA MARŽE (bílá) ══ */}
        <div style={{ backgroundColor: DARK }}>
          <section id="kalkulator" className={`${SECTION} scroll-mt-16 bg-white`}>
            <div className="mx-auto max-w-[1400px]">
              <div className="mx-auto max-w-[1000px] text-left">
                <div className={`${EYEBROW} text-zinc-400`}>{d.calc.eyebrow}</div>
                <h2 className={`${H2} mt-3 text-zinc-900`}>{d.calc.heading}</h2>
                <p className="mt-4 font-sans text-base font-light leading-relaxed text-zinc-500 sm:text-lg">{d.calc.sub}</p>
              </div>
              <div className="mx-auto mt-10 max-w-[1160px] sm:mt-14">
                <ProductCalculator d={d} />
              </div>
            </div>
          </section>
        </div>

        {/* ══ 7. PROČ SWELT.DROPSHIPPING + STATS (černá) ══ */}
        <div className="bg-white">
          <section className={SECTION} style={{ backgroundColor: DARK }}>
            <div className="mx-auto max-w-[1400px]">
              <div className="mx-auto max-w-[1000px] text-left">
                <div className={`${EYEBROW} text-zinc-500`}>{d.usps.eyebrow}</div>
                <h2 className={`${H2} mt-3 text-white`}>{d.usps.heading}</h2>
              </div>
              <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-5">
                {d.usps.items.map((u, i) => {
                  const Icon = USP_ICONS[i];
                  return (
                    <div key={u.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold tracking-tight text-white">{u.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{u.text}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mx-auto mt-12 grid max-w-[1160px] grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-8 sm:mt-16 sm:grid-cols-4 sm:gap-8">
                {d.statsBand.map(s => (
                  <div key={s.label}>
                    <div className="font-sans font-extralight tracking-tight leading-none text-[clamp(1.75rem,4vw,2.75rem)] text-white">{s.value}</div>
                    <div className="mt-2 text-xs text-zinc-400 sm:text-sm">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ══ 8. INTEGRACE (bílá) ══ */}
        <div style={{ backgroundColor: DARK }}>
          <section className={`${SECTION} bg-white`}>
            <div className="mx-auto max-w-[1400px]">
              <div className="mx-auto max-w-[1000px] text-left">
                <div className={`${EYEBROW} text-zinc-400`}>{d.platforms.eyebrow}</div>
                <h2 className={`${H2} mt-3 text-zinc-900`}>{d.platforms.heading}</h2>
                <p className="mt-4 max-w-2xl font-sans text-base font-light leading-relaxed text-zinc-500 sm:text-lg">{d.platforms.sub}</p>
              </div>
              <div className="mx-auto mt-10 max-w-[1000px]">
                <div className="flex flex-wrap gap-2">
                  {d.platforms.items.map((p, i) => (
                    <button key={p.name} type="button" onClick={() => setActivePlatform(i)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${activePlatform === i ? 'bg-zinc-900 text-white' : 'text-zinc-600 ring-1 ring-zinc-200 hover:ring-zinc-300'}`}>
                      {p.name}
                      {p.data.tag && <span className="ml-2 text-[10px] opacity-60">{p.data.tag}</span>}
                    </button>
                  ))}
                </div>
                <div className="mt-6 max-w-xl rounded-2xl bg-zinc-50 p-8 ring-1 ring-zinc-100">
                  <div className={`${H3} text-zinc-900`}>{d.platforms.items[activePlatform].name}</div>
                  <div className="mt-3 flex items-center gap-3">
                    {d.platforms.items[activePlatform].data.tag && (
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 ring-1 ring-zinc-200">
                        {d.platforms.items[activePlatform].data.tag}
                      </span>
                    )}
                    <span className="text-xs text-zinc-500">{d.platforms.setupTime}: {d.platforms.items[activePlatform].data.time}</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-500">{d.platforms.items[activePlatform].data.detail}</p>
                  <button type="button" onClick={() => navigate('/register')} className={`${PILL_DARK} mt-6`}>
                    {d.platforms.cta} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ══ 9. EU EXPANZE (černá) ══ */}
        <div className="bg-white">
          <section className={SECTION} style={{ backgroundColor: DARK }}>
            <div className="mx-auto max-w-[1400px]">
              <div className="mx-auto max-w-[1000px] text-left">
                <div className={`${EYEBROW} text-zinc-500`}>{d.euExpansion.eyebrow}</div>
                <h2 className={`${H2} mt-3 text-white`}>{d.euExpansion.heading}</h2>
                <p className="mt-4 font-sans text-base font-light leading-relaxed text-zinc-400 sm:text-lg">{d.euExpansion.sub}</p>
              </div>
              <div className="mx-auto mt-10 grid max-w-[1160px] gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { flag: '🇨🇿', ...d.euExpansion.markets[0] },
                  { flag: '🇸🇰', ...d.euExpansion.markets[1] },
                  { flag: '🇩🇪', ...d.euExpansion.markets[2] },
                  { flag: '🇦🇹', ...d.euExpansion.markets[3] },
                ].map((m) => (
                  <div key={m.country} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="text-3xl">{m.flag}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="text-sm font-semibold tracking-tight text-white">{m.country}</div>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">{m.badge}</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">{m.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ══ 10. CENÍK (bílá) ══ */}
        <div style={{ backgroundColor: DARK }}>
          <section id="cenik" className={`${SECTION} scroll-mt-16 bg-white`}>
            <div className="mx-auto max-w-[1400px]">
              <div className="mx-auto max-w-[1000px] text-left">
                <div className={`${EYEBROW} text-zinc-400`}>{d.pricing.eyebrow}</div>
                <h2 className={`${H2} mt-3 text-zinc-900`}>{d.pricing.heading}</h2>
              </div>

              <div className="mt-10 flex justify-center">
                <div className="inline-flex gap-1 rounded-full bg-white p-1 ring-1 ring-zinc-200">
                  {(['quarterly', 'yearly'] as const).map(p => (
                    <button key={p} type="button" onClick={() => setBillingPeriod(p)}
                      className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${billingPeriod === p ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>
                      {p === 'quarterly'
                        ? d.pricing.quarterly
                        : <span className="flex items-center gap-2">{d.pricing.yearly} <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] leading-none text-white">−20 %</span></span>
                      }
                    </button>
                  ))}
                </div>
              </div>

              <div className="mx-auto mt-10 grid max-w-[1160px] items-stretch gap-5 lg:grid-cols-3">
                {d.pricing.tiers.map((t, i) => {
                  const monthly = i === 0 ? PLAN_PRICES.starter.monthly : i === 1 ? PLAN_PRICES.silver.monthly : 0;
                  const yearlyMonthly = i === 0 ? PLAN_PRICES.starter.yearly : i === 1 ? PLAN_PRICES.silver.yearly : 0;
                  const price = billingPeriod === 'quarterly' ? monthly : yearlyMonthly;
                  const featured = i === 1;
                  const billingNote = monthly > 0
                    ? (billingPeriod === 'quarterly'
                        ? `${(monthly * 3).toLocaleString('cs')} ${d.pricing.quarterlyNote}`
                        : `${(yearlyMonthly * 12).toLocaleString('cs')} ${d.pricing.yearlyNote}`)
                    : t.priceNote;
                  return (
                    <div key={t.name} className={`relative flex h-full flex-col rounded-2xl bg-white ${featured ? 'border-2 border-zinc-900' : 'ring-1 ring-zinc-200'}`}>
                      {t.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-0.5 text-[11px] font-semibold ${featured ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-300'}`}>
                            {t.badge}
                          </span>
                        </div>
                      )}
                      <div className="border-b border-zinc-100 p-8 pb-6 text-center">
                        <h3 className="text-xl font-semibold tracking-tight text-zinc-900">{t.name}</h3>
                        <p className="mt-1 min-h-[2.5rem] whitespace-pre-line text-sm text-zinc-500">{t.subtitle}</p>
                        <div className="mb-6 mt-6">
                          {monthly > 0 ? (
                            <>
                              <div className="flex items-baseline justify-center gap-1">
                                <span className="font-sans font-extralight tracking-tight text-5xl text-zinc-900">{price.toLocaleString('cs')}</span>
                                <span className="ml-1 text-sm text-zinc-500">{d.pricing.perMonth}</span>
                              </div>
                              <p className="mt-1 text-xs text-zinc-400">{billingNote}</p>
                            </>
                          ) : (
                            <>
                              <div className="font-sans font-extralight tracking-tight text-4xl text-zinc-900">{d.pricing.bespoke}</div>
                              <p className="mt-1 text-xs text-zinc-400">{t.priceNote}</p>
                            </>
                          )}
                        </div>
                        <button type="button" onClick={() => navigate('/register')} className={`${featured ? PILL_DARK : PILL_OUTLINE_LIGHT} w-full`}>
                          {t.cta}
                        </button>
                      </div>
                      <div className="flex-1 rounded-b-2xl bg-zinc-50 p-8 pt-6">
                        {i > 0 && (
                          <div className="mb-3 flex items-center gap-1.5 text-xs text-zinc-500">
                            <ArrowRight className="h-3 w-3" /> {d.pricing.allPrev} {d.pricing.tiers[i - 1].name}, plus…
                          </div>
                        )}
                        <ul className="space-y-2.5">
                          {t.features.map(f => (
                            <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-700">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{f}
                            </li>
                          ))}
                          {t.missing.map(f => (
                            <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-400 opacity-60">
                              <X className="mt-0.5 h-4 w-4 shrink-0" /><span className="line-through">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 flex justify-center">
                <div className="inline-flex items-center gap-3 rounded-2xl bg-zinc-50 px-6 py-4 text-sm text-zinc-500 ring-1 ring-zinc-100">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-zinc-900" />
                  <span>{d.pricing.guarantee}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ══ 11. FAQ + ZÁVĚREČNÉ CTA (černá) ══ */}
        <div className="bg-white">
          <section className={`${SECTION} pb-20 sm:pb-28`} style={{ backgroundColor: DARK }}>
            <div className="mx-auto max-w-[800px]">
              <div className={`${EYEBROW} text-zinc-500`}>{d.faq.eyebrow}</div>
              <h2 className={`${H2} mt-3 text-white`}>{d.faq.heading}</h2>
              <div className="mt-8">
                {d.faqs.slice(0, faqLimit).map((f, i) => <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />)}
              </div>
              {faqLimit < d.faqs.length && (
                <div className="mt-8 text-center">
                  <button type="button" onClick={() => setFaqLimit(d.faqs.length)} className={PILL_OUTLINE_DARK}>
                    {d.faq.showAll} ({d.faqs.length}) <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="mx-auto mt-16 max-w-[1000px] border-t border-white/10 pt-16 text-center sm:mt-24 sm:pt-24">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                <Zap className="h-3.5 w-3.5" /> {d.finalCta.badge}
              </div>
              <h2 className={`${H2} mt-6`}>
                <span className="text-white">{d.finalCta.h2Part1}</span><br />
                <span className={GRADIENT}>{d.finalCta.h2Highlight}</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl font-sans text-base font-light leading-relaxed text-zinc-400 sm:text-lg">
                {d.finalCta.sub}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" onClick={() => navigate('/register')} className={PILL_LIGHT}>
                  {d.finalCta.ctaPrimary} <ArrowRight className="h-4 w-4" />
                </button>
                <a href="mailto:dropshipping@swelt.partner" className={PILL_OUTLINE_DARK}>
                  {d.finalCta.ctaSecondary}
                </a>
              </div>
              <div className="mx-auto mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
                {d.finalCta.contactItems.map((item, i) => {
                  const Icon = CONTACT_ICONS[i];
                  return (
                    <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <Icon className="mx-auto mb-1 h-4 w-4 text-zinc-400" />
                      <div className="text-xs font-medium text-white">{item.label}</div>
                      <div className="text-[10px] text-zinc-500">{item.sub}</div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-6 text-xs text-zinc-500">{d.finalCta.smallNote}</p>
            </div>
          </section>
        </div>

      </main>

      <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
      <BottomNav onOpenWishlist={() => setWishlistOpen(true)} wishlistCount={wishlistIds.size} />
      <ScrollToTopButton />
    </div>
  );
};

export default Dropshipping;
