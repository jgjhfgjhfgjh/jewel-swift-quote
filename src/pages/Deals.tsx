import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Bell, Check, MousePointerClick, Layers, TrendingUp, Clock,
  Package, CreditCard, Banknote, FileText, ListOrdered,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { useStore } from '@/lib/store';
import { dealsI18n, fillTemplate } from '@/lib/i18n-deals';
import { useDeals } from '@/hooks/useDeals';
import { dealIsLive, sortedTiers, DEFAULT_TIERS } from '@/lib/deals';
import { DealCard } from '@/components/deals/DealCard';

const STEP_ICONS = [MousePointerClick, Layers, TrendingUp, Clock];
const CONDITION_ICONS = [Package, CreditCard, Banknote, FileText, ListOrdered];

/* ── Sdílené třídy s homepage ──────────────────────────────────────────────
   Landing /deals staví na stejném vzoru jako homepage: full-width sekce se
   zaobleným horním okrajem, které se střídají bílá ↔ černá (#0d0d10, stejný
   odstín jako sekce GoBigDeal a dropshipping), extralight nadpisy v clampu
   (tmavé slovo → tlumené slovo → gradientový závěr) a iOS pilulková CTA.
   Wrapper každé sekce má barvu sekce PŘEDCHOZÍ — zaoblené rohy ji odkrývají. */
const DARK = '#0d0d10';
const GRADIENT = 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent';
const SECTION = 'w-full rounded-t-[1.75rem] px-5 pt-16 pb-16 sm:rounded-t-[2.75rem] sm:px-10 sm:pt-24 sm:pb-24 lg:px-14';
const H2 = 'font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.5rem,4.5vw,3rem)]';
const H3 = 'font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.35rem,3vw,2.25rem)]';
/** Tmavá pilulka na světlém pozadí (primární CTA homepage). */
const PILL_DARK = 'inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800';
/** Bílá pilulka na tmavém pozadí. */
const PILL_LIGHT = 'inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100';
const PILL_OUTLINE = 'inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-400 hover:bg-zinc-50';
const PILL_OUTLINE_DARK = 'inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10';

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function Deals() {
  const lang = useStore((s) => s.lang);
  const d = dealsI18n[lang];
  const { deals, productCounts, loading } = useDeals();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const visible = useMemo(() => deals.filter((x) => x.status !== 'draft'), [deals]);
  // Živé dealy řadíme podle nejbližší uzávěrky (největší tlak nahoře),
  // uzavřené od naposledy skončeného.
  const live = useMemo(
    () => visible.filter(dealIsLive)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()),
    [visible],
  );
  const closed = useMemo(
    () => visible.filter((x) => !dealIsLive(x))
      .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime()),
    [visible],
  );

  const hasLive = live.length > 0;

  const allBrands = new Set<string>();
  visible.forEach((x) => x.brands.forEach((b) => allBrands.add(b)));
  const maxDiscount = visible.reduce(
    (m, x) => Math.max(m, ...x.tiers.map((t) => t.discount_percent)), 0,
  );

  // Slevový žebřík v sekci „jak to funguje" bereme z reálného dealu (nejdřív
  // živého), aby čísla odpovídala tomu, co partner uvidí v detailu; bez dealů
  // padáme na výchozí hladiny.
  const ladder = useMemo(() => {
    const source = live[0] ?? visible[0];
    return sortedTiers(source?.tiers?.length ? source.tiers : DEFAULT_TIERS);
  }, [live, visible]);

  const stats = [
    { v: String(live.length), l: d.stats.deals },
    { v: String(allBrands.size), l: d.stats.brands },
    { v: maxDiscount ? `${maxDiscount} %` : '—', l: d.stats.discount },
    { v: d.stats.earlyValue, l: d.stats.early },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <BackButton />

      {/* ── 1. HERO (bílá) — typografie homepage: extralight clamp, tlumená
             prostřední část, gradientový závěr věty ── */}
      <section className="relative overflow-hidden bg-white px-5 pt-24 pb-14 sm:px-10 sm:pt-32 sm:pb-20 lg:px-14">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto max-w-[1000px] text-left">
            <h1 className="font-sans font-extralight tracking-tight leading-[1.12] text-[clamp(2rem,5.5vw,4rem)]">
              <span className="text-zinc-900">{d.hero.headingLead}</span>{' '}
              <span className="text-zinc-500">{d.hero.headingMuted}</span>{' '}
              <span className={GRADIENT}>{d.hero.headingAccent}</span>
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-base font-light leading-relaxed text-muted-foreground sm:mt-7 sm:text-xl">
              {d.hero.sub}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="button" onClick={() => scrollTo('live-deals')} className={PILL_DARK}>
                {d.hero.cta} <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => scrollTo('how-it-works')} className={PILL_OUTLINE}>
                {d.hero.ctaSecondary}
              </button>
            </div>
            <p className="mt-4 text-sm text-zinc-500">{d.hero.note}</p>

            {/* stat strip — čísla ve stejné extralight typografii jako nadpisy */}
            <div className="mt-12 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 border-t border-zinc-200 pt-8 sm:mt-16 sm:grid-cols-4 sm:gap-8">
              {stats.map((s) => (
                <div key={s.l}>
                  <div className="font-sans font-extralight tracking-tight leading-none text-[clamp(1.75rem,4vw,2.75rem)] text-zinc-900">
                    {s.v}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500 sm:text-sm">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. ŽIVÉ DEALY (černá) — bílé karty na černé, stejně jako sekce
             GoBigDeal na homepage ── */}
      <div className="bg-white">
        <section id="live-deals" className={`${SECTION} scroll-mt-16`} style={{ backgroundColor: DARK }}>
          <div className="mx-auto max-w-[1400px]">
            {/* Nadpis nelže: dokud nic neběží, sekce to řekne rovnou a hned
                nabídne alert — uzavřené dávky pod tím slouží jako důkaz. */}
            <div className="mx-auto max-w-[1000px] text-left">
              <h2 className={H2}>
                <span className="text-white">{hasLive ? d.active.headingLead : d.active.empty}</span>{' '}
                <span className="text-zinc-400">
                  {hasLive ? d.active.headingMuted : d.active.emptyHeadingMuted}
                </span>
              </h2>
              <p className="mt-5 max-w-2xl font-sans text-base font-light leading-relaxed text-zinc-400 sm:text-lg">
                {hasLive ? d.active.sub : d.active.emptySub}
              </p>
              {!hasLive && !loading && (
                <Link to="/#gbd-alerts-concerns" className={`${PILL_LIGHT} mt-7`}>
                  <Bell className="h-4 w-4" /> {d.active.emptyCta}
                </Link>
              )}
            </div>

            <div className="mx-auto mt-10 max-w-[1160px] sm:mt-14">
              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-80 animate-pulse rounded-2xl bg-white/10" />
                  ))}
                </div>
              ) : (
                <>
                  {hasLive && (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {live.map((deal) => (
                        <DealCard key={deal.id} deal={deal} count={productCounts[deal.id] ?? 0} />
                      ))}
                    </div>
                  )}
                  {/* uzavřené dávky zůstávají viditelné jako důkaz, že žebřík
                      funguje — a jako důvod zapnout si alert */}
                  {closed.length > 0 && (
                    <div className={hasLive ? 'mt-14 sm:mt-20' : ''}>
                      <h3 className={`${H3} text-white`}>{d.active.closedLabel}</h3>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500">
                        {d.active.closedSub}
                      </p>
                      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {closed.map((deal) => (
                          <DealCard key={deal.id} deal={deal} count={productCounts[deal.id] ?? 0} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ── 3. JAK TO FUNGUJE + SLEVOVÝ ŽEBŘÍK (bílá) ── */}
      <div style={{ backgroundColor: DARK }}>
        <section id="how-it-works" className={`${SECTION} scroll-mt-16 bg-white`}>
          <div className="mx-auto max-w-[1400px]">
            <div className="mx-auto max-w-[1000px] text-left">
              <h2 className={H2}>
                <span className="text-zinc-900">{d.how.headingLead}</span>{' '}
                <span className="text-zinc-500">{d.how.headingMuted}</span>
              </h2>
            </div>

            <div className="mx-auto mt-10 grid max-w-[1160px] gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
              {d.how.steps.map((step, i) => {
                const Icon = STEP_ICONS[i];
                return (
                  <div key={step.title} className="rounded-2xl bg-zinc-50 p-6 ring-1 ring-zinc-100">
                    <div className="select-none font-sans font-extralight leading-none text-4xl text-zinc-300">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold tracking-tight text-zinc-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* slevový žebřík — hladiny z reálného dealu; poslední je vrchol,
                proto gradient (stejný jako závěr headlinů) */}
            <div className="mx-auto mt-16 max-w-[1160px] sm:mt-24">
              <div className="mx-auto max-w-[1000px] text-left">
                <h3 className={H3}>
                  <span className="text-zinc-900">{d.ladder.headingLead}</span>{' '}
                  <span className="text-zinc-500">{d.ladder.headingMuted}</span>
                </h3>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {ladder.map((tier, i) => {
                  const top = i === ladder.length - 1;
                  return (
                    <div
                      key={tier.min_qty}
                      className={`rounded-2xl border p-6 ${top ? 'border-zinc-900' : 'border-zinc-200'}`}
                    >
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        {fillTemplate(d.progress.tierLocked, { qty: tier.min_qty })}
                      </div>
                      <div
                        className={`mt-3 font-sans font-extralight tracking-tight leading-none text-[clamp(2rem,5vw,3.25rem)] ${
                          top ? GRADIENT : 'text-zinc-900'
                        }`}
                      >
                        −{tier.discount_percent} %
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-zinc-500">{d.ladder.note}</p>
            </div>
          </div>
        </section>
      </div>

      {/* ── 4. NÁSKOK 48 H / PRO (černá) — landing verze homepage paywallu ── */}
      <div className="bg-white">
        <section className={SECTION} style={{ backgroundColor: DARK }}>
          <div className="mx-auto max-w-[1160px]">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
              <div className="flex flex-col justify-center">
                <h2 className={H2}>
                  <span className="text-white">{d.early.headingLead}</span>{' '}
                  <span className="text-zinc-400">{d.early.headingMuted}</span>
                </h2>
                <p className="mt-5 max-w-xl font-sans text-base font-light leading-relaxed text-zinc-400 sm:text-lg">
                  {d.early.body}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/#gbd-alerts-concerns" className={PILL_LIGHT}>
                    <Bell className="h-4 w-4" /> {d.early.ctaAlerts}
                  </Link>
                  <Link to="/#gbd-pricing" className={PILL_OUTLINE_DARK}>
                    {d.early.ctaPro} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <ul className="flex flex-col justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                {d.early.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm leading-relaxed text-zinc-200 sm:text-base">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* ── 5. OBCHODNÍ PODMÍNKY (bílá) — informace beze změny, jen v jazyce
             homepage: klidné karty místo eyebrow labelů ── */}
      <div style={{ backgroundColor: DARK }}>
        <section className={`${SECTION} bg-white`}>
          <div className="mx-auto max-w-[1400px]">
            <div className="mx-auto max-w-[1000px] text-left">
              <h2 className={H2}>
                <span className="text-zinc-900">{d.conditions.heading}</span>{' '}
                <span className="text-zinc-500">{d.conditions.headingMuted}</span>
              </h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-[1160px] gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
              {d.conditions.items.map((item, i) => {
                const Icon = CONDITION_ICONS[i];
                return (
                  <div key={item.title} className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold tracking-tight text-zinc-900">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ── 6. ZÁVĚREČNÉ CTA (černá) — poslední rozhodovací bod ── */}
      <div className="bg-white">
        <section className={`${SECTION} pb-20 sm:pb-28`} style={{ backgroundColor: DARK }}>
          <div className="mx-auto max-w-[1000px] text-center">
            <h2 className={H2}>
              <span className="text-white">{d.closing.headingLead}</span>{' '}
              <span className="text-zinc-400">{d.closing.headingMuted}</span>
            </h2>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => scrollTo('live-deals')} className={PILL_LIGHT}>
                {d.closing.cta} <ArrowRight className="h-4 w-4" />
              </button>
              <Link to="/#gbd-alerts-concerns" className={PILL_OUTLINE_DARK}>
                <Bell className="h-4 w-4" /> {d.closing.ctaSecondary}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <ScrollToTopButton />
    </div>
  );
}
