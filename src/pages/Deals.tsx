import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Bell, Check, MousePointerClick, Layers, TrendingUp,
  Clock, Package, CreditCard, Banknote, FileText, ListOrdered, SearchX,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { dealsI18n, fillTemplate } from '@/lib/i18n-deals';
import { useDeals } from '@/hooks/useDeals';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import { sortedTiers, DEFAULT_TIERS } from '@/lib/deals';
import { toDisplayName } from '@/lib/brandNormalize';
import { getBrandByName } from '@/data/brands';
import { CONCERNS } from '@/data/concerns';
import {
  applyFilters, buildCatalog, EMPTY_FILTERS,
  type CatalogFilters, type DealTileItem,
} from '@/lib/dealCatalog';
import { GoBigDealLogo } from '@/components/GoBigDealLogo';
import { BrandSpotlight } from '@/components/deals/catalog/BrandSpotlight';
import { CatalogKpis } from '@/components/deals/catalog/CatalogKpis';
import { CatalogFilterNav } from '@/components/deals/catalog/CatalogFilterNav';
import { EarlyAccessCard } from '@/components/deals/catalog/EarlyAccessCard';
import { GbdPricing, type GbdPricingTier } from '@/components/deals/GbdPricing';
import {
  CatalogControlBar, type CatalogSortKey, type CatalogView,
} from '@/components/deals/catalog/CatalogControlBar';
import { DealTile } from '@/components/deals/catalog/DealTile';
import { DealListRow } from '@/components/deals/catalog/DealListRow';
import { DealSpotlight } from '@/components/deals/catalog/DealSpotlight';
import { CountdownTimer } from '@/components/deals/CountdownTimer';

const STEP_ICONS = [MousePointerClick, Layers, TrendingUp, Clock];
const CONDITION_ICONS = [Package, CreditCard, Banknote, FileText, ListOrdered];

/* ── Sdílené třídy s homepage ──────────────────────────────────────────────
   Vysvětlující část pod katalogem drží vzor homepage: full-width sekce se
   zaobleným horním okrajem, střídání bílá ↔ černá (#0B1215), extralight
   nadpisy v clampu (lead → tlumené → gradient) a iOS pilulková CTA.
   Wrapper každé sekce nese barvu sekce PŘEDCHOZÍ — rohy ji odkrývají. */
/* Obsidian = 950 z teal palety katalogu (tints.ts) — plocha CELÉ stránky. */
const DARK = '#0B1215';
const GRADIENT = 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent';
const SECTION = 'w-full rounded-t-[1.75rem] px-5 pt-16 pb-16 sm:rounded-t-[2.75rem] sm:px-10 sm:pt-24 sm:pb-24 lg:px-14';
const H2 = 'font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.5rem,4.5vw,3rem)]';
const H3 = 'font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.35rem,3vw,2.25rem)]';
const PILL_LIGHT = 'inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100';
const PILL_OUTLINE_DARK = 'inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10';
/* CTA dvojice pod hero (bílá plocha dashboardu) */
const CTA_PRIMARY = 'inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-700';
const CTA_GHOST = 'inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-300 px-6 text-sm font-semibold text-zinc-900 transition-colors hover:bg-slate-50';

/* Řazení dashboardu — uplatní se UVNITŘ stavových sekcí (živé / připravujeme /
   uzavřené); stav má vždy přednost, obchodník nikdy nemíchá živé s mrtvým. */
const FAR_FUTURE = 8640000000000000; // dlaždice bez termínu patří nakonec
const SORTERS: Record<CatalogSortKey, (a: DealTileItem, b: DealTileItem) => number> = {
  ending: (a, b) =>
    new Date(a.deadline ?? a.startsAt ?? FAR_FUTURE).getTime() -
    new Date(b.deadline ?? b.startsAt ?? FAR_FUTURE).getTime(),
  discount: (a, b) => b.maxDiscount - a.maxDiscount,
  models: (a, b) => b.models - a.models,
  newest: (a, b) => new Date(b.startsAt ?? 0).getTime() - new Date(a.startsAt ?? 0).getTime(),
};

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function Deals() {
  const lang = useStore((s) => s.lang);
  const openAuthModal = useStore((s) => s.openAuthModal);
  const { user } = useAuthContext();
  const { hasEarlyAccess } = useEarlyAccess();
  const navigate = useNavigate();
  const d = dealsI18n[lang];
  const { deals, productCounts, loading } = useDeals();
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<CatalogSortKey>('ending');
  const [view, setView] = useState<CatalogView>('grid');
  const location = useLocation();
  const dash = d.catalog.dash;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Proklik z mega menu (?concern= / ?brand=) předvybere filtr — funguje
  // i když už na /deals jsme, proto efekt na query, ne jen initial state.
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const concern = q.get('concern');
    const brand = q.get('brand');
    if (!concern && !brand) return;
    setFilters({
      ...EMPTY_FILTERS,
      concerns: concern ? [concern] : [],
      brands: brand ? [brand] : [],
    });
    window.scrollTo(0, 0);
  }, [location.search]);

  /* ── Katalog ─────────────────────────────────────────────────────────── */
  const catalog = useMemo(
    () => buildCatalog(deals, productCounts, (name) =>
      fillTemplate(d.catalog.tile.teaserTitle, { concern: name })),
    [deals, productCounts, d],
  );
  const filtered = useMemo(() => applyFilters(catalog, filters), [catalog, filters]);

  /* Dashboardové sekce — dlaždice dělí STAV, pořadí uvnitř řídí řazení. */
  const sections = useMemo(() => {
    const s = SORTERS[sort];
    return {
      live: filtered.filter((t) => t.kind === 'live').sort(s),
      upcoming: filtered.filter((t) => t.kind === 'upcoming' || t.kind === 'teaser').sort(s),
      closed: filtered.filter((t) => t.kind === 'closed').sort(s),
    };
  }, [filtered, sort]);

  /* KPI lišta — počítá se z CELÉHO katalogu, ne z filtru: přehled trhu
     se obchodníkovi nemění pod rukama, když si filtruje. */
  const kpis = useMemo(() => {
    const real = catalog.filter((t) => t.kind !== 'teaser');
    const live = real.filter((t) => t.kind === 'live');
    return {
      liveCount: live.length,
      models: real.reduce((n, t) => n + t.models, 0),
      maxDiscount: catalog.reduce((m, t) => Math.max(m, t.maxDiscount), 0),
      nextDeadline: live.map((t) => t.deadline).filter(Boolean).sort()[0],
      nextStart: real
        .filter((t) => t.kind === 'upcoming' && t.startsAt)
        .map((t) => t.startsAt as string)
        .sort()[0],
    };
  }, [catalog]);

  // Dlaždice koncernů — badge nese počet REÁLNÝCH dávek, teaser se nepočítá.
  const concernTiles = useMemo(() => {
    const totals: Record<string, number> = {};
    const lives: Record<string, number> = {};
    catalog.forEach((t) => {
      if (t.kind !== 'teaser' && t.concernSlug) {
        totals[t.concernSlug] = (totals[t.concernSlug] ?? 0) + 1;
        if (t.kind === 'live') lives[t.concernSlug] = (lives[t.concernSlug] ?? 0) + 1;
      }
    });
    return CONCERNS.map((c) => ({
      key: c.slug, name: c.name, domain: c.domain,
      count: totals[c.slug] ?? 0, live: lives[c.slug] ?? 0,
    }));
  }, [catalog]);

  // Dlaždice značek stavíme z katalogu — každá tak něco skutečně filtruje;
  // řadíme podle počtu dávek, doména loga přes statický rejstřík značek.
  const brandTiles = useMemo(() => {
    const acc = new Map<string, number>();
    catalog.forEach((t) => t.brandKeys.forEach((k) => acc.set(k, (acc.get(k) ?? 0) + 1)));
    return Array.from(acc.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([key, count]) => {
        const name = toDisplayName(key);
        // Šperkové linky („Fossil Jewelry") mají logo mateřské značky.
        const domain = (getBrandByName(name) ?? getBrandByName(name.replace(/\s+Jewelry$/i, '')))?.domain;
        return { key, name, domain, count };
      });
  }, [catalog]);

  // Do lišty posíláme čitelné názvy, ne slugy a klíče.
  const activeLabels = useMemo(() => {
    const byConcern = new Map(concernTiles.map((t) => [t.key, t.name]));
    const byBrand = new Map(brandTiles.map((t) => [t.key, t.name]));
    return [
      ...filters.concerns.map((s) => byConcern.get(s) ?? s),
      ...filters.brands.map((k) => byBrand.get(k) ?? toDisplayName(k)),
      ...(filters.search.trim() ? [`„${filters.search.trim()}"`] : []),
    ];
  }, [filters, concernTiles, brandTiles]);

  // Do spotlight banneru jde nejnaléhavější dlaždice: běžící dávka, jinak nejbližší start.
  const featured = useMemo(
    () => filtered.find((t) => t.kind === 'live') ?? filtered.find((t) => t.kind === 'upcoming'),
    [filtered],
  );

  /** Teaser i alert vstupy mají stejné hradlo: host → registrace, jinak alerty. */
  const goToAlerts = () => {
    if (!user) { openAuthModal('register'); return; }
    navigate('/#gbd-alerts-concerns');
  };

  /* Ceník na stránce — bez platebního flow (jako homepage): nepřihlášený
     jde do registrace, přihlášený zpět na katalog; Enterprise píše obchodu. */
  const handleTier = (id: GbdPricingTier) => {
    if (id === 'enterprise') { window.location.href = 'mailto:obchod@swelt.cz'; return; }
    if (!user) { openAuthModal('register'); return; }
    scrollTo('catalog');
  };

  const toggleConcern = (slug: string) =>
    setFilters((f) => ({
      ...f,
      concerns: f.concerns.includes(slug) ? f.concerns.filter((s) => s !== slug) : [...f.concerns, slug],
    }));

  const toggleBrand = (key: string) =>
    setFilters((f) => ({
      ...f,
      brands: f.brands.includes(key) ? f.brands.filter((b) => b !== key) : [...f.brands, key],
    }));

  /* Sekce dashboardu — nadpis s počtem, pod ním mřížka DealTile přes celou
     šíři (první sekci vede upsell karta Early Access), nebo hustý seznam
     DealListRow (přepínač v řídicí liště). */
  const renderSection = (
    title: string,
    items: DealTileItem[],
    opts: { liveDot?: boolean; lead?: boolean } = {},
  ) =>
    items.length === 0 ? null : (
      <section className="pt-9">
        <div className="flex items-center gap-2.5">
          {opts.liveDot && <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />}
          <h2 className="font-sans text-lg font-medium tracking-tighter text-zinc-900">{title}</h2>
          <span className="font-mono text-sm text-slate-400">{items.length}</span>
        </div>
        {view === 'grid' ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {opts.lead && <EarlyAccessCard />}
            {items.map((t) => (
              <DealTile key={t.id} item={t} onTeaserClick={goToAlerts} />
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            {opts.lead && <EarlyAccessCard variant="row" />}
            {items.map((t) => (
              <DealListRow key={t.id} item={t} onTeaserClick={goToAlerts} />
            ))}
          </div>
        )}
      </section>
    );

  /* Upsell karta patří do první NEprázdné sekce. */
  const firstSection = sections.live.length ? 'live' : sections.upcoming.length ? 'upcoming' : 'closed';

  /* ── Vysvětlující část pod katalogem ─────────────────────────────────── */
  const allBrands = new Set<string>();
  catalog.forEach((t) => { if (t.kind !== 'teaser') t.brands.forEach((b) => allBrands.add(b)); });
  const liveCount = catalog.filter((t) => t.kind === 'live').length;
  const maxDiscount = catalog.reduce((m, t) => Math.max(m, t.maxDiscount), 0);

  const ladder = useMemo(() => {
    const source = deals.find((x) => x.tiers?.length);
    return sortedTiers(source?.tiers?.length ? source.tiers : DEFAULT_TIERS);
  }, [deals]);

  const stats = [
    { v: String(liveCount), l: d.stats.deals },
    { v: String(allBrands.size), l: d.stats.brands },
    { v: maxDiscount ? `${maxDiscount} %` : '—', l: d.stats.discount },
    { v: d.stats.earlyValue, l: d.stats.early },
  ];

  return (
    /* Kořen v bílé (světlá varianta dashboardu) — tmavé landing sekce níže
       si barvu kreslí samy. */
    <div className="min-h-screen bg-white font-sans selection:bg-zinc-900 selection:text-white">
      <Navbar />
      <BackButton />

      {/* ═══ KATALOG — bílá plocha, karty s hairline rámečky a jemným stínem ═══ */}

      {/* ── 1. Kompaktní command header: logo + marquee v jednom řádku,
             pozicovací věta pod nimi. Dashboard nemá 100vh hero — data
             (KPI, filtry, dávky) začínají hned pod headerem. ── */}
      <header
        id="catalog"
        className="scroll-mt-16 px-5 pt-[calc(var(--ann-offset,0px)+8.5rem)] sm:px-8 lg:px-12"
      >
        {/* hero: VLEVO logo → dvoutónová věta, VPRAVO ústřední výjev —
            střídající se VELKÉ logo značky s plynulým crossfade. Zóna je
            pozicovaná ABSOLUTNĚ (inset-y-0): výšku řádku určuje levý
            sloupec, výjev jeho výšku jen vyplní */}
        <div className="relative">
          <div className="min-w-0 py-2 sm:pr-[46%]">
            {/* mobil: logo na střed; od sm doleva k textu */}
            <h1 className="flex justify-center text-zinc-900 sm:justify-start">
              <GoBigDealLogo className="text-[clamp(2.75rem,6.5vw,4.5rem)]" />
            </h1>
            {/* dvoutónový headline v typografii webu (extralight jako
                headliny homepage): tmavý lead, zbytek tlumeně slate */}
            <h2 className="mt-6 max-w-xl text-balance font-sans font-extralight tracking-tight leading-[1.3] text-[clamp(1.35rem,2.4vw,2rem)]">
              <span className="text-zinc-900">{d.catalog.headingLead}</span>{' '}
              <span className="text-slate-400">{d.catalog.headingMuted}</span>{' '}
              <span className="text-slate-400">{d.catalog.headingAccent}</span>
            </h2>
            {/* stavová CTA dvojice — konverzní řetěz: registrace → alert →
                (FOMO v katalogu) → Early Access. EA tu proto NENÍ primární:
                anonym konvertuje na identitu, přihlášený na alert; EA prodávají
                kontextové momenty níž (upsell karta, teasery, ceník). */}
            {!user ? (
              <>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => openAuthModal('register')} className={CTA_PRIMARY}>
                    {dash.ctaRegister} <ArrowRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={goToAlerts} className={CTA_GHOST}>
                    <Bell className="h-4 w-4" /> {d.early.ctaAlerts}
                  </button>
                </div>
                <p className="mt-3 text-[13px] text-slate-400">{d.hero.note}</p>
              </>
            ) : !hasEarlyAccess ? (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button type="button" onClick={goToAlerts} className={CTA_PRIMARY}>
                  <Bell className="h-4 w-4" /> {d.early.ctaAlerts}
                </button>
                <button type="button" onClick={() => scrollTo('gbd-pricing')} className={CTA_GHOST}>
                  {d.early.ctaPro} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
          {/* výjev od sm výš (posunutý VÍC DOLEVA od pravé hrany);
              na mobilu má vlastní blok pod textem */}
          <div className="absolute inset-y-0 right-[8%] hidden w-[42%] sm:block">
            <BrandSpotlight />
          </div>
        </div>
        <div className="mt-8 h-24 sm:hidden">
          <BrandSpotlight />
        </div>
      </header>

      {/* ── 2. KPI lišta — stav trhu na první pohled ── */}
      <div className="px-5 pt-10 sm:px-8 sm:pt-12 lg:px-12">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[92px] animate-pulse rounded-[1.25rem] bg-slate-100" />
            ))}
          </div>
        ) : (
          <CatalogKpis
            items={[
              {
                label: dash.kpiLive,
                value: String(kpis.liveCount),
                liveDot: kpis.liveCount > 0,
                /* nula živých dávek = nejslabší místo dashboardu → konverzní bod */
                action: kpis.liveCount === 0 ? { label: dash.kpiLiveAlert, onClick: goToAlerts } : undefined,
              },
              { label: dash.kpiModels, value: kpis.models ? String(kpis.models) : '—' },
              {
                label: dash.kpiDiscount,
                value: kpis.maxDiscount ? `−${kpis.maxDiscount} %` : '—',
                gradient: kpis.maxDiscount > 0,
              },
              kpis.nextDeadline
                ? {
                    label: dash.kpiDeadline,
                    value: <CountdownTimer deadline={kpis.nextDeadline} variant="compact" lang={lang} />,
                  }
                : kpis.nextStart
                  ? {
                      label: dash.kpiNextStart,
                      value: <CountdownTimer deadline={kpis.nextStart} variant="compact" lang={lang} />,
                    }
                  : { label: dash.kpiConcerns, value: String(CONCERNS.length) },
            ]}
          />
        )}
      </div>

      {/* ── 3. Filtrační nav lišta s expanzemi — společná pro všechny šířky
             (nahradila sidebar, karty tak jedou přes celou šíři) ── */}
      <div className="px-5 pt-8 sm:px-8 lg:px-12">
        <CatalogFilterNav
          search={filters.search}
          onSearch={(search) => setFilters((f) => ({ ...f, search }))}
          concerns={concernTiles}
          brands={brandTiles}
          selectedConcerns={filters.concerns}
          selectedBrands={filters.brands}
          onToggleConcern={toggleConcern}
          onToggleBrand={toggleBrand}
          onClearConcerns={() => setFilters((f) => ({ ...f, concerns: [] }))}
          onClearBrands={() => setFilters((f) => ({ ...f, brands: [] }))}
        />
      </div>

      {/* ── 4. Obsah přes celou šíři ── */}
      <div className="px-5 pb-10 pt-4 sm:px-8 sm:pb-16 lg:px-12">
        <main className="min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-72 animate-pulse rounded-[1.25rem] bg-slate-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mx-auto mt-12 max-w-xl text-center">
              <SearchX className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-4 text-lg font-medium tracking-tighter text-zinc-900">{d.catalog.noResults}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{d.catalog.noResultsSub}</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
                >
                  {d.catalog.clear}
                </button>
                <button
                  type="button"
                  onClick={goToAlerts}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-slate-50"
                >
                  <Bell className="h-4 w-4" /> {d.active.emptyCta}
                </button>
              </div>
            </div>
          ) : (
            <>
              <CatalogControlBar
                resultCount={filtered.length}
                activeCount={activeLabels.length}
                activeLabels={activeLabels}
                onClear={() => setFilters(EMPTY_FILTERS)}
                sort={sort}
                onSort={setSort}
                view={view}
                onView={setView}
              />

              {/* spotlight — jedna nejnaléhavější dávka místo promo karuselu */}
              {featured && (
                <div className="pt-5">
                  <DealSpotlight item={featured} />
                </div>
              )}

              {renderSection(dash.secLive, sections.live, { liveDot: true, lead: firstSection === 'live' })}
              {renderSection(d.catalog.rows.upcoming, sections.upcoming, { lead: firstSection === 'upcoming' })}
              {renderSection(d.catalog.rows.closed, sections.closed, { lead: firstSection === 'closed' })}
            </>
          )}
        </main>
      </div>

      {/* ══ Pod katalogem: původní vysvětlující část stránky ══ */}

      {/* ── Co je GoBigDeal (tmavá) — katalog nad ní je BÍLÝ; wrapper nese
             bílou a zaoblený roh sekce odkrývá bílé růžky (vzor stránky) ── */}
      <div className="bg-white">
        <section className={SECTION} style={{ backgroundColor: DARK }}>
          <div className="mx-auto max-w-[1400px]">
            <div className="mx-auto max-w-[1000px] text-left">
              <h2 className={H2}>
                <span className="text-white">{d.hero.headingLead}</span>{' '}
                <span className="text-zinc-400">{d.hero.headingMuted}</span>{' '}
                <span className={GRADIENT}>{d.hero.headingAccent}</span>
              </h2>
              <p className="mt-6 max-w-2xl font-sans text-base font-light leading-relaxed text-zinc-400 sm:text-xl">
                {d.hero.sub}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" onClick={() => scrollTo('catalog')} className={PILL_LIGHT}>
                  {d.hero.cta} <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => scrollTo('how-it-works')} className={PILL_OUTLINE_DARK}>
                  {d.hero.ctaSecondary}
                </button>
              </div>
              <p className="mt-4 text-sm text-zinc-500">{d.hero.note}</p>

              <div className="mt-12 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-8 sm:mt-16 sm:grid-cols-4 sm:gap-8">
                {stats.map((s) => (
                  <div key={s.l}>
                    <div className="font-sans font-extralight tracking-tight leading-none text-[clamp(1.75rem,4vw,2.75rem)] text-white">
                      {s.v}
                    </div>
                    <div className="mt-2 text-xs text-zinc-400 sm:text-sm">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Jak to funguje + slevový žebřík (bílá) ── */}
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

      {/* ── Náskok 48 h / PRO (černá) ── */}
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
                  <button type="button" onClick={goToAlerts} className={PILL_LIGHT}>
                    <Bell className="h-4 w-4" /> {d.early.ctaAlerts}
                  </button>
                  <button type="button" onClick={() => scrollTo('gbd-pricing')} className={PILL_OUTLINE_DARK}>
                    {d.early.ctaPro} <ArrowRight className="h-4 w-4" />
                  </button>
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

            {/* ceník — stejný blok jako na homepage (sdílená GbdPricing);
                CTA z katalogu (upsell karta, early sekce) scrollují sem */}
            <GbdPricing onTier={handleTier} />
          </div>
        </section>
      </div>

      {/* ── Obchodní podmínky (bílá) ── */}
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

      {/* ── Závěrečné CTA (černá) ── */}
      <div className="bg-white">
        <section className={`${SECTION} pb-20 sm:pb-28`} style={{ backgroundColor: DARK }}>
          <div className="mx-auto max-w-[1000px] text-center">
            <h2 className={H2}>
              <span className="text-white">{d.closing.headingLead}</span>{' '}
              <span className="text-zinc-400">{d.closing.headingMuted}</span>
            </h2>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => scrollTo('catalog')} className={PILL_LIGHT}>
                {d.closing.cta} <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={goToAlerts} className={PILL_OUTLINE_DARK}>
                <Bell className="h-4 w-4" /> {d.closing.ctaSecondary}
              </button>
            </div>
          </div>
        </section>
      </div>

      <ScrollToTopButton />
    </div>
  );
}
