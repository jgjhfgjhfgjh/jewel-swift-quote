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
import { sortedTiers, DEFAULT_TIERS } from '@/lib/deals';
import { toDisplayName } from '@/lib/brandNormalize';
import { getBrandByName } from '@/data/brands';
import { CONCERNS } from '@/data/concerns';
import {
  applyFilters, buildCatalog, buildRows, EMPTY_FILTERS,
  type CatalogFilters,
} from '@/lib/dealCatalog';
import { GoBigDealLogo } from '@/components/GoBigDealLogo';
import { BrandMarquee } from '@/components/deals/catalog/BrandMarquee';
import { CatalogSearch } from '@/components/deals/catalog/CatalogSearch';
import { FilterTiles } from '@/components/deals/catalog/FilterTiles';
import { DealFilterBar } from '@/components/deals/catalog/DealFilterBar';
import { DealHeroCarousel } from '@/components/deals/catalog/DealHeroCarousel';
import { DealRow } from '@/components/deals/catalog/DealRow';

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

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function Deals() {
  const lang = useStore((s) => s.lang);
  const openAuthModal = useStore((s) => s.openAuthModal);
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const d = dealsI18n[lang];
  const { deals, productCounts, loading } = useDeals();
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const location = useLocation();

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

  const rows = useMemo(
    () => buildRows(filtered, {
      endingSoon: d.catalog.rows.endingSoon,
      fresh: d.catalog.rows.fresh,
      watches: d.catalog.rows.watches,
      jewelry: d.catalog.rows.jewelry,
      upcoming: d.catalog.rows.upcoming,
      closed: d.catalog.rows.closed,
      byConcern: (name) => fillTemplate(d.catalog.rows.byConcern, { name }),
    }),
    [filtered, d],
  );

  // Dlaždice koncernů — badge nese počet REÁLNÝCH dávek, teaser se nepočítá.
  const concernTiles = useMemo(() => {
    const acc: Record<string, number> = {};
    catalog.forEach((t) => {
      if (t.kind !== 'teaser' && t.concernSlug) acc[t.concernSlug] = (acc[t.concernSlug] ?? 0) + 1;
    });
    return CONCERNS.map((c) => ({
      key: c.slug, name: c.name, domain: c.domain, count: acc[c.slug] ?? 0,
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

  // Řada „Připravujeme" jde před velké karty, ostatní za ně.
  const upcomingRow = useMemo(() => rows.find((r) => r.id === 'upcoming'), [rows]);
  const restRows = useMemo(() => rows.filter((r) => r.id !== 'upcoming'), [rows]);

  // Do hero pásu jde nejnaléhavější dlaždice: běžící dávka, jinak nejbližší start.
  const featured = useMemo(
    () => filtered.find((t) => t.kind === 'live') ?? filtered.find((t) => t.kind === 'upcoming'),
    [filtered],
  );

  /** Teaser i alert vstupy mají stejné hradlo: host → registrace, jinak alerty. */
  const goToAlerts = () => {
    if (!user) { openAuthModal('register'); return; }
    navigate('/#gbd-alerts-concerns');
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
    /* Kořen v obsidianu — horní i dolní overscroll bounce ukazuje tmavou
       (katalog nahoře i závěrečná sekce dole); bílé sekce si barvu kreslí samy. */
    <div className="min-h-screen bg-[#0B1215]">
      {/* navbar leží na tmavém katalogu → trvale inverzní (bílé) prvky */}
      <Navbar onDark />
      <BackButton />

      {/* ═══ KATALOG — obsidian plocha, bílé karty a prvky na ní vyniknou ═══ */}

      {/* ── 1. Header: H1 = logo GoBigDeal (drobná značka nad větou), H2 =
             hlavní pozicovací věta; blok je zarovnaný VLEVO na stejné
             odsazení jako řady katalogu (px-5/8/12), aby logo, věta i karty
             pod nimi stály na jedné svislé lince, a svisle vycentrovaný na
             první obrazovku (odečítá announcement bar jako homepage hero) ── */}
      <header
        id="catalog"
        className="relative flex min-h-[calc(100svh-var(--ann-offset,0px))] scroll-mt-16 flex-col items-start justify-center px-5 text-left sm:px-8 lg:px-12"
      >
        <h1 className="relative text-white">
          <GoBigDealLogo className="text-[clamp(2.5rem,6.5vw,4.25rem)]" />
        </h1>
        <h2 className="relative mt-5 max-w-4xl font-sans font-extralight tracking-tight leading-[1.25] text-[clamp(1.5rem,3.4vw,2.5rem)]">
          <span className="text-white">{d.catalog.headingLead}</span>{' '}
          <span className="text-zinc-400">{d.catalog.headingMuted}</span>
        </h2>
        {/* běžící pás značek — VŠECHNY značky z velkoobchodního katalogu;
            kotvený níž ke spodku hero (chevron zrušen, pás má vzduch),
            ale stále na prvním screenu; blok logo+věta zůstává na středu */}
        <div className="absolute inset-x-0 bottom-8 sm:bottom-10">
          <BrandMarquee />
        </div>
      </header>

      {/* ── 2. Hledání — první prvek pod hero, na střed ── */}
      <div className="pt-10 sm:pt-14">
        <CatalogSearch
          value={filters.search}
          onChange={(search) => setFilters((f) => ({ ...f, search }))}
        />
      </div>

      {/* ── 3. Koncerny jako dlaždice (logo na tónovaném čtverci, popisek pod) ── */}
      <div className="pt-10 sm:pt-14">
        <FilterTiles
          items={concernTiles}
          selected={filters.concerns}
          onToggle={toggleConcern}
          label={d.catalog.concernsLabel}
          allLabel={d.catalog.allConcerns}
          onClearAll={() => setFilters((f) => ({ ...f, concerns: [] }))}
        />
      </div>

      {/* ── 4. Značky — stejné dlaždice jako koncerny, jen jiná data ── */}
      <div className="pt-6 sm:pt-8">
        <FilterTiles
          items={brandTiles}
          selected={filters.brands}
          onToggle={toggleBrand}
          label={d.catalog.brandsLabel}
          allLabel={d.catalog.allConcerns}
          onClearAll={() => setFilters((f) => ({ ...f, brands: [] }))}
        />
      </div>

      {/* ── Lepivá stavová lišta: počet výsledků a běžící filtry ── */}
      <div className="mt-5">
        <DealFilterBar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          activeLabels={activeLabels}
        />
      </div>

      {/* ── Dealy: nejdřív Připravujeme, pak tři velké karty, pak zbytek ── */}
      <div className="pb-10 pt-2 sm:pb-16">
        {loading ? (
          <>
            <div className="flex gap-4 overflow-hidden px-5 pt-6 sm:px-8 lg:px-12">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-64 w-[248px] shrink-0 animate-pulse rounded-2xl bg-white/10 sm:w-[276px]" />
              ))}
            </div>
            <div className="px-5 pt-8 sm:px-8 lg:px-12">
              <div className="h-[240px] animate-pulse rounded-[24px] bg-white/10 sm:h-[300px]" />
            </div>
          </>
        ) : filtered.length === 0 ? (
          <div className="mx-auto mt-10 max-w-xl px-5 text-center">
            <SearchX className="mx-auto h-8 w-8 text-white/30" />
            <p className="mt-4 text-lg font-semibold tracking-tight text-white">{d.catalog.noResults}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{d.catalog.noResultsSub}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className={PILL_LIGHT}>
                {d.catalog.clear}
              </button>
              <button type="button" onClick={goToAlerts} className={PILL_OUTLINE_DARK}>
                <Bell className="h-4 w-4" /> {d.active.emptyCta}
              </button>
            </div>
          </div>
        ) : (
          <>
            {upcomingRow && (
              <DealRow
                title={upcomingRow.title}
                items={upcomingRow.items}
                seeAllLabel={d.catalog.seeAll}
                onTeaserClick={goToAlerts}
              />
            )}

            {/* tři velké karty — hero pás sedí mezi „Připravujeme" a zbytkem řad */}
            <div className="py-4 sm:py-6">
              <DealHeroCarousel
                featured={featured}
                onAlerts={goToAlerts}
                onHow={() => scrollTo('how-it-works')}
              />
            </div>

            {restRows.map((row) => (
              <DealRow
                key={row.id}
                title={row.title}
                items={row.items}
                seeAllLabel={d.catalog.seeAll}
                onTeaserClick={goToAlerts}
              />
            ))}
          </>
        )}
      </div>

      {/* ══ Pod katalogem: původní vysvětlující část stránky ══ */}

      {/* ── Co je GoBigDeal (černá) — katalog nad ní je taky černý, sekce na
             něj navazuje beze švu (zaoblený roh by odkryl bílé růžky) ── */}
      <div style={{ backgroundColor: DARK }}>
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
