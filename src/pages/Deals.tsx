import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Bell, Briefcase, Check, MousePointerClick, Layers, Plus, TrendingUp,
  Clock, Package, CreditCard, Banknote, FileText, ListOrdered, SearchX,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { dealsI18n, fillTemplate } from '@/lib/i18n-deals';
import { useDeals } from '@/hooks/useDeals';
import { useDealAlerts } from '@/hooks/useDealAlerts';
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
import { CrystalBackdrop } from '@/components/deals/catalog/CrystalBackdrop';
import { CatalogDashboardHead } from '@/components/deals/catalog/CatalogDashboardHead';
import { CatalogFilterNav } from '@/components/deals/catalog/CatalogFilterNav';
import { EarlyAccessCard } from '@/components/deals/catalog/EarlyAccessCard';
import { CatalogPromoBanners } from '@/components/deals/catalog/CatalogPromoBanners';
import { CreateBigDealButton } from '@/components/deals/CreateBigDealButton';
import { DealChannelPills } from '@/components/deals/catalog/DealChannelPills';
import { AlertTierPills } from '@/components/deals/catalog/AlertTierPills';
import { GbdPricing, type GbdPricingTier } from '@/components/deals/GbdPricing';
import {
  CatalogControlBar, SortPills, type CatalogSortKey, type CatalogView,
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
/* CTA dvojice v hero (matně černá plocha dashboardu) — primární je BÍLÁ
   pilulka, sekundární hairline outline; stejný jazyk jako landing sekce. */
const CTA_PRIMARY = 'inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200';
const CTA_GHOST = 'inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/10';

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
  /* JEDNA sdílená instance alertů pro všechny karty i řádky — každá karta
     by jinak tahala vlastní dotaz na deal_alerts. */
  const alertsApi = useDealAlerts();
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<CatalogSortKey>('ending');
  /* Výchozí je ŘÁDKOVÉ zobrazení (pokyn) — obchodník skenuje dávky jako
     seznam zboží; mřížka je přepínač v řídicí liště. */
  const [view, setView] = useState<CatalogView>('list');
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
      /* uzávěrka DNES (lokální kalendářní den) — „stihni to do večera" */
      closingToday: live.filter(
        (t) => t.deadline && new Date(t.deadline).toDateString() === new Date().toDateString(),
      ).length,
      /* modely POUZE z živých dávek — KPI má říkat, co je teď k mání */
      models: live.reduce((n, t) => n + t.models, 0),
      maxDiscount: catalog.reduce((m, t) => Math.max(m, t.maxDiscount), 0),
      /* „live top discount" je z BĚŽÍCÍCH dávek — sleva z uzavřené dávky
         už si nikdo nekoupí, takže do zásadního KPI nepatří. */
      liveMaxDiscount: live.reduce((m, t) => Math.max(m, t.maxDiscount), 0),
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

  /* „GoDeal" v KPI dlaždici — vždy odroluje na dávky. Když zrovna nic neběží,
     spadne na nejbližší další sekci, aby tlačítko nikdy nekliklo naprázdno. */
  /* Iniciály do kolečka v dashboardové hlavě — z e-mailu (jmeno.prijmeni@…
     → JP), jinak první dvě písmena. Host nemá nic → ikonka + přihlášení. */
  const initials = useMemo(() => {
    const e = user?.email;
    if (!e) return null;
    const parts = e.split('@')[0].split(/[._-]+/).filter(Boolean);
    const raw = parts.length >= 2 ? parts[0][0] + parts[1][0] : e.slice(0, 2);
    return raw.toUpperCase();
  }, [user]);

  const goLiveDeals = () =>
    scrollTo(
      sections.live.length ? 'deals-live'
        : sections.upcoming.length ? 'deals-upcoming'
          : 'deals-closed',
    );


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
    opts: { liveDot?: boolean; lead?: boolean; id?: string } = {},
  ) =>
    items.length === 0 ? null : (
      <section id={opts.id} className="scroll-mt-24 pt-4">
        <div className="flex items-center gap-2.5">
          {opts.liveDot && <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />}
          <h2 className="font-sans text-lg font-medium tracking-tighter text-white">{title}</h2>
          <span className="font-mono text-sm text-zinc-500">{items.length}</span>
        </div>
        {view === 'grid' ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {opts.lead && <EarlyAccessCard />}
            {items.map((t) => (
              <DealTile
                key={t.id}
                item={t}
                onTeaserClick={goToAlerts}
                alertsApi={alertsApi}
                onRequireAuth={() => openAuthModal('register')}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            {opts.lead && <EarlyAccessCard variant="row" />}
            {items.map((t) => (
              <DealListRow
                key={t.id}
                item={t}
                onTeaserClick={goToAlerts}
                alertsApi={alertsApi}
                onRequireAuth={() => openAuthModal('register')}
              />
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
    /* Plocha CELÉ stránky je matně černá (obsidián #0B1215) — chrom (KPI,
       filtry, řídicí lišta) je tmavý hairline, ZBOŽÍ je bílé: karty a řádky
       dávek zůstávají bílé a na černé ploše vystoupí nejvíc. Landing sekce
       níž si barvu kreslí samy a na tuhle plochu plynule navazují. */
    <div className="min-h-screen bg-white font-sans selection:bg-zinc-900 selection:text-white">
      {/* Stránka začíná TMAVOU dashboardovou hlavou (mockup z homepage
          hera) → navigace jede v inverzní bílé variantě. */}
      <Navbar onDark />
      <BackButton />

      {/* ═══ BÍLÁ HLAVA — první screen: zásadní KPI, dva bannery a řazení
             (značkový carousel odsud vypadl, pokyn). Bílou plochu střídá
             tmavá zóna se zaobleným nájezdem. ═══ */}
      {/* Na mobilu spacing beze změny (CTA se tam na první screen vejde),
          od sm výš těsně pod navbar (h-14) — na širokých, ale nízkých
          oknech se jinak CTA karet i řazení propadnou pod ohyb */}
      {/* ═══ DASHBOARDOVÁ HLAVA — tmavá, 1:1 s mockup kartou z homepage
             hera (pokyn): gradientový indikátor + logo, taby, malé hledání,
             zvoneček, iniciály; pod tím čtyři reálná KPI. ═══ */}
      <section className="bg-[#0B1215] pb-6 pt-[calc(var(--ann-offset,0px)+4.75rem)] sm:pb-8">
        <div id="catalog" className="scroll-mt-16 px-5 sm:px-8 lg:px-12">
          <CatalogDashboardHead
            tabs={[
              { key: 'live', label: dash.tabLive, active: true, onClick: goLiveDeals },
              { key: 'ending', label: dash.sortEnding, onClick: () => { setSort('ending'); goLiveDeals(); } },
              { key: 'want', label: 'Want Deals', onClick: () => navigate('/wantdeal') },
              { key: 'split', label: 'Split Deals', onClick: () => navigate('/splitdeal') },
            ]}
            search={filters.search}
            onSearch={(search) => setFilters((f) => ({ ...f, search }))}
            searchPlaceholder={d.catalog.searchPlaceholder}
            onBell={() => navigate('/alerts')}
            bellActive={alertsApi.alerts.length > 0}
            initials={initials}
            onAvatar={() => (user ? navigate('/ucet') : openAuthModal('login'))}
            loading={loading}
            kpis={[
              {
                label: dash.kpiLive,
                value: String(kpis.liveCount),
                liveDot: kpis.liveCount > 0,
                action: { label: dash.kpiLiveGo, onClick: goLiveDeals, icon: 'arrow' },
              },
              { label: dash.kpiClosingToday, value: String(kpis.closingToday) },
              {
                label: dash.kpiDiscount,
                value: kpis.liveMaxDiscount ? `−${kpis.liveMaxDiscount} %` : '—',
              },
              { label: dash.kpiModels, value: String(kpis.models) },
            ]}
          />
        </div>
      </section>

      {/* ═══ BÍLÁ SEKCE — bannery a řazení; zaoblený nájezd na tmavé hlavě ═══ */}
      <div className="bg-[#0B1215]">
      <section className="w-full rounded-t-[1.75rem] bg-white pt-8 sm:rounded-t-[2.75rem] sm:pt-10">
        {/* dva bannery vedle sebe (pokyn): alerty zdarma a Early Access —
            dva schody téhož, proto stojí v jedné řadě */}
        <div className="px-5 sm:px-8 lg:px-12">
          <CatalogPromoBanners onAlerts={goToAlerts} />
        </div>

        {/* řazení je NALEPENÉ na dashboard pod sebou (pokyn): patří k dávkám,
            které řadí, ne ke kartám nad sebou — proto velký odstup nahoru
            a jen minimální dolů k tmavé ploše */}
        <div className="px-5 pt-10 sm:px-8 sm:pt-12 lg:px-12">
          <SortPills variant="light" sort={sort} onSort={setSort} />
        </div>
      </section>
      </div>

      {/* ═══ TMAVÁ ZÓNA — zaoblený nájezd na bílé hlavě; odsud dolů si sekce
             kreslí barvu samy (střídání bílá ↔ obsidián). ═══ */}
      <div className="mt-3 rounded-t-[1.75rem] bg-[#0B1215] pt-4 sm:mt-4 sm:rounded-t-[2.75rem] sm:pt-6">

      {/* ═══ DASHBOARD — stránka ZAČÍNÁ stavem trhu a seznamem dávek (pokyn):
             obchodník přichází pro zboží, ne pro headline. Hero se značkou
             leží AŽ POD katalogem, vysvětlující sekce pod ním.
             `id="catalog"` sedí TADY (ne na hero) — CTA „otevřít katalog"
             z landing sekcí musí vést na dávky, ne na logo. ═══ */}

      {/* ── 1. Filtrační nav lišta s expanzemi — společná pro všechny šířky
             (nahradila sidebar, karty tak jedou přes celou šíři) ── */}
      <div className="px-5 pt-5 sm:px-8 lg:px-12">
        <CatalogFilterNav
          /* CTA u PRAVÉ hrany lišty (pokyn) — v jedné řadě s hledáním
             a filtry, výška h-11 sedí se zbytkem řady. */
          trailing={
            <>
              {/* 1:1 s CTA v navigaci — stejná komponenta, tedy i stejné
                  písmo, velikost a chování (pokyn) */}
              <CreateBigDealButton />
              <button
                type="button"
                onClick={() => navigate('/my-deals')}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/20 px-4 text-[13px] font-semibold text-white
                           transition-colors duration-200 hover:border-white/40 hover:bg-white/10"
              >
                <Briefcase className="h-4 w-4" /> MyDeal
              </button>
            </>
          }
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

      {/* ── 2. Obsah přes celou šíři ── */}
      <div className="px-5 pb-10 pt-4 sm:px-8 sm:pb-16 lg:px-12">
        <main className="min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-72 animate-pulse rounded-[1.25rem] bg-white/[0.06]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mx-auto mt-12 max-w-xl text-center">
              <SearchX className="mx-auto h-8 w-8 text-zinc-600" />
              <p className="mt-4 text-lg font-medium tracking-tighter text-white">{d.catalog.noResults}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{d.catalog.noResultsSub}</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
                >
                  {d.catalog.clear}
                </button>
                <button
                  type="button"
                  onClick={goToAlerts}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/10"
                >
                  <Bell className="h-4 w-4" /> {d.active.emptyCta}
                </button>
              </div>
            </div>
          ) : (
            <>
              <CatalogControlBar
              tiers={<AlertTierPills hasEarlyAccess={hasEarlyAccess} onFreeAlert={goToAlerts} />}
              channels={<DealChannelPills active="all" />}
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

              {/* Early Access pruh tu už nestojí — přesunul se nahoru mezi
                  nabídkové karty nad KPI (alerty / EA / SplitDeal). V mřížce
                  zůstává EA první dlaždicí sekce. */}

              {renderSection(dash.secLive, sections.live, { liveDot: true, lead: view === 'grid' && firstSection === 'live', id: 'deals-live' })}
              {renderSection(d.catalog.rows.upcoming, sections.upcoming, { lead: view === 'grid' && firstSection === 'upcoming', id: 'deals-upcoming' })}
              {renderSection(d.catalog.rows.closed, sections.closed, { lead: view === 'grid' && firstSection === 'closed', id: 'deals-closed' })}
            </>
          )}
        </main>
      </div>

      {/* ═══ HERO ZÓNA — značka na krystalové ploše. CrystalBackdrop je první
             v DOM (z-0), obsah nad ním přes relative z-10. Vrstva NESMÍ mít
             -z-10 — spadla by za pozadí stránky a zmizela. KPI lišta odtud
             odešla nahoru nad katalog (pokyn), zóna je čistě značková. ═══ */}
      <div className="relative pb-16 sm:pb-20">
        <CrystalBackdrop className="inset-0" />

        {/* ── Kompaktní command header: logo + střídající se výjev značky,
               pozicovací věta pod nimi. Leží POD katalogem — kdo doscrolluje,
               dostane značku a příběh. ── */}
        <header className="relative z-10 px-5 pt-14 sm:px-8 lg:px-12">
          {/* hero: VLEVO logo → dvoutónová věta, VPRAVO ústřední výjev —
              střídající se VELKÉ logo značky s plynulým crossfade. Zóna je
              pozicovaná ABSOLUTNĚ (inset-y-0): výšku řádku určuje levý
              sloupec, výjev jeho výšku jen vyplní */}
          <div className="relative">
            <div className="min-w-0 py-2 sm:pr-[46%]">
              {/* mobil: logo na střed; od sm doleva k textu. Krystalová scéna
                  leží pod celou hero zónou (viz CrystalBackdrop výše), logo na ní
                  jen sedí; písmo zůstává čistá typografie. */}
              <h1 className="flex justify-center text-white sm:justify-start">
                <GoBigDealLogo className="text-[clamp(2.75rem,6.5vw,4.5rem)]" />
              </h1>
              {/* dvoutónový headline v typografii webu (extralight jako
                  headliny homepage): bílý lead, zbytek tlumeně zinc */}
              <h2 className="mt-6 max-w-xl text-balance font-sans font-extralight tracking-tight leading-[1.3] text-[clamp(1.35rem,2.4vw,2rem)]">
                <span className="text-white">{d.catalog.headingLead}</span>{' '}
                <span className="text-zinc-500">{d.catalog.headingMuted}</span>{' '}
                <span className="text-zinc-500">{d.catalog.headingAccent}</span>
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
                  <p className="mt-3 text-[13px] text-zinc-500">{d.hero.note}</p>
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
      </div>
      {/* ═══ konec hero zóny s krystaly ═══ */}

      {/* ══ Pod hero: původní vysvětlující část stránky ══ */}

      {/* ── Co je GoBigDeal (tmavá) — plocha nad ní je taky matně černá,
             wrapper ji nese dál, takže zaoblený roh sekce splyne beze švu ── */}
      <div className="bg-[#0B1215]">
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

      {/* ── Náskok 48 h / Early Access (černá) ── */}
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
      {/* ↑ konec tmavé zóny (zaoblený nájezd otevřený pod bílou hlavou) */}
      </div>

      <ScrollToTopButton />
    </div>
  );
}
