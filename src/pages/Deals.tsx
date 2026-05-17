import { useEffect } from 'react';
import {
  Flame, ArrowRight, MousePointerClick, Layers, TrendingUp, Clock,
  Package, CreditCard, Banknote, FileText, ListOrdered,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { dealsI18n } from '@/lib/i18n-deals';
import { useDeals } from '@/hooks/useDeals';
import { dealIsLive } from '@/lib/deals';
import { DealCard } from '@/components/deals/DealCard';

const STEP_ICONS = [MousePointerClick, Layers, TrendingUp, Clock];
const CONDITION_ICONS = [Package, CreditCard, Banknote, FileText, ListOrdered];

export default function Deals() {
  const lang = useStore((s) => s.lang);
  const d = dealsI18n[lang];
  const { deals, productCounts, loading } = useDeals();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const visible = deals
    .filter((x) => x.status !== 'draft')
    .sort((a, b) => Number(dealIsLive(b)) - Number(dealIsLive(a)));

  const liveCount = visible.filter(dealIsLive).length;
  const allBrands = new Set<string>();
  visible.forEach((x) => x.brands.forEach((b) => allBrands.add(b)));
  const maxDiscount = visible.reduce(
    (m, x) => Math.max(m, ...x.tiers.map((t) => t.discount_percent)), 0,
  );

  const scrollToDeals = () => {
    document.getElementById('active-deals')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <BackButton />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_-10%,rgba(239,68,68,0.18),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-1.5 text-sm font-semibold text-red-300">
              <Flame className="h-4 w-4" />
              {d.hero.badge}
            </div>
            <h1 className="font-sans text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              {d.hero.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              {d.hero.sub}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={scrollToDeals} className="gap-2 bg-red-600 text-base hover:bg-red-700">
                {d.hero.cta} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {/* stat strip */}
            <div className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              {[
                { v: liveCount, l: d.stats.deals },
                { v: allBrands.size, l: d.stats.brands },
                { v: maxDiscount ? `${maxDiscount} %` : '—', l: d.stats.discount },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-sans text-3xl font-bold text-white">{s.v}</div>
                  <div className="mt-1 text-xs text-slate-400">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Active deals ── */}
      <section id="active-deals" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-red-600">{d.active.eyebrow}</div>
          <h2 className="mt-2 font-sans text-3xl font-bold text-slate-900 sm:text-4xl">{d.active.heading}</h2>
          <p className="mt-2 max-w-2xl text-slate-500">{d.active.sub}</p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-400">
            {d.active.empty}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((deal) => (
              <DealCard key={deal.id} deal={deal} count={productCounts[deal.id] ?? 0} />
            ))}
          </div>
        )}
      </section>

      {/* ── How it works ── */}
      <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-red-600">{d.how.eyebrow}</div>
            <h2 className="mt-2 font-sans text-3xl font-bold text-slate-900 sm:text-4xl">{d.how.heading}</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {d.how.steps.map((step, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <div key={step.title} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <div className="mb-3 select-none font-sans text-5xl font-bold leading-none text-slate-200">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                    <Icon className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="font-sans font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Conditions ── */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mb-12 text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-red-600">{d.conditions.eyebrow}</div>
          <h2 className="mt-2 font-sans text-3xl font-bold text-slate-900 sm:text-4xl">{d.conditions.heading}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {d.conditions.items.map((item, i) => {
            const Icon = CONDITION_ICONS[i];
            return (
              <div key={item.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <ScrollToTopButton />
    </div>
  );
}
