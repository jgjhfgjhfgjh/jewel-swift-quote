import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Gem, Watch, Sliders, ShoppingBag, Layers, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useStore } from '@/lib/store';
import { translations, flags, langNames, ALL_LANGS, type Lang } from '@/lib/i18n';
import { tParamName, tGender, tCategory } from '@/lib/i18n-filters';
import type { AvailableParam } from '@/hooks/useProducts';

const GENDER_PARAM = 'Určení';
const GENDER_ORDER = ['Pro muže', 'Pro ženy', 'Pro děti', 'Unisex'];

interface Props {
  manufacturers: { name: string; count: number }[];
  categories: { name: string; count: number }[];
  selectedBrands: string[];
  setSelectedBrands: (v: string[]) => void;
  selectedCategory: string | null;
  setSelectedCategory: (v: string | null) => void;
  search: string;
  setSearch: (v: string) => void;
  stockOnly: boolean;
  setStockOnly: (v: boolean) => void;
  minDiscount: number;
  setMinDiscount: (v: number) => void;
  selectedGenders: string[];
  setSelectedGenders: (v: string[]) => void;
  selectedParams: Record<string, string[]>;
  setSelectedParams: (v: Record<string, string[]>) => void;
  availableParams: AvailableParam[];
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

const CATEGORY_KEYS = ['Hodinky', 'Šperky', 'Příslušenství'] as const;
const HEADER_HEIGHT = 56;
const TOGGLE_THRESHOLD = 5;

function DesktopSidebar({ children }: { children: React.ReactNode }) {
  return (
    <aside
      className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r bg-card sticky self-start overflow-y-auto scrollbar-thin scrollbar-thumb-muted hover:scrollbar-thumb-muted-foreground/30"
      style={{ top: HEADER_HEIGHT, maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)` }}
    >
      {children}
    </aside>
  );
}

/** Pill-style label showing how many values are active in a group, e.g. "2" */
function ActiveBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
      {count}
    </span>
  );
}

export function FilterSidebar({
  manufacturers, categories, selectedBrands, setSelectedBrands,
  selectedCategory, setSelectedCategory,
  stockOnly, setStockOnly, minDiscount, setMinDiscount,
  selectedGenders, setSelectedGenders,
  selectedParams, setSelectedParams,
  availableParams,
  mobileOnly, desktopOnly,
}: Props) {
  const { user } = useAuthContext();
  const { lang, setLang, sidebarOpen, setSidebarOpen, viewMode, setGatewayOpen } = useStore();
  const navigate = useNavigate();
  const t = translations[lang];
  const isHome = viewMode === 'home';

  useEffect(() => {
    if (sidebarOpen && !desktopOnly) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen, desktopOnly]);

  const discountTiers = [
    { label: t.discount70, value: 70 },
    { label: t.discount60, value: 60 },
    { label: t.discount50, value: 50 },
  ];

  // Category labels via i18n-filters.ts (covers all 18 langs)

  const sortedManufacturers = useMemo(
    () => [...manufacturers].sort((a, b) => a.name.localeCompare(b.name)),
    [manufacturers]
  );

  const availableGenders = useMemo(() => {
    const genderParam = availableParams.find((p) => p.nazev === GENDER_PARAM);
    if (!genderParam) return [];
    return GENDER_ORDER.filter((g) => genderParam.values.includes(g));
  }, [availableParams]);

  // Classify "other" parameters into logical groups based on Czech parameter names.
  // We strip diacritics and match against word *stems* (not full forms) so Czech
  // declensions like "typ strojku", "barva pásku", "tvar pouzdra" match correctly.
  // Order of checks: WATCH (most specific) → JEWELRY → COMMON → OTHER.
  // A specific watch/jewelry token in the label always wins over a generic
  // "barva" / "tvar" / "materiál" so "barva řemínku" goes to Hodinky, not Společné.

  const stripDiacritics = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  // Word stems (no full forms — work across all Czech declension endings).
  const WATCH_STEMS = [
    // movement / power
    'strojk', 'strojek', 'mechan', 'kalibr', 'quartz', 'automat',
    'naviject', 'baterie', 'pohon',
    // case / body
    'pouzdr', 'tlousk', 'tloust', 'lunet', 'korunk', 'tlacit',
    // crystal / glass — covers nominative "sklo" and genitive "skla" (typ skla)
    'sklo', 'skla', 'sklem', 'sklick', 'krystal', 'crystal', 'safir', 'mineraln', 'akryl',
    // strap / bracelet
    'pasek', 'pasku', 'remin', 'naramek', 'naramk', 'spony',
    // water resistance — voděodolnost / vodotěsnost
    'vodeod', 'vodotes', 'water', 'atm ', 'atm)', 'bar ', ' wr',
    // dial / display / functions
    'cifern', 'displej', 'osvit', 'lume',
    'chronograf', 'tachymetr', 'datumovk', 'datum',
    'budik', 'gmt', 'mesicni', 'fazi mesic', 'phase',
    'rezerva chod', 'power reserve',
    'funkce',
    // care — princip čištění etc.
    'cisten', 'cleaning',
    // model / collection — modelová řada, kolekce
    'modelov', 'kolekce', 'collection',
    // generic family identifier — covers "typ hodinek", "kategorie hodinek"
    'hodin',
  ];

  const JEWELRY_STEMS = [
    // stones
    'kamen', 'drahokam', 'briliant', 'diamant',
    'perl', 'zirkon', 'safir kamen', 'rubin', 'smaragd',
    // purity / hallmark
    'ryzost', 'puncov', 'karat', 'carat',
    // precious metals — only when standalone (not "kov" which is generic)
    'zlato', 'zlate', 'gold', 'stribro', 'stribr', 'silver', 'platin',
    'palad', 'rhod',
    // jewelry types — covers "typ šperku", "typ prstenu", "prstýnek" (diminutive)
    'sperk', 'prsten', 'prstyn', 'prstynk', 'nausn', 'nahrdel', 'naramk svit',
    'retiz', 'retez', 'privesk', 'manzet knofl', 'broz',
    // jewelry-specific dimensions
    'velikost prstenu', 'velikost prstynku', 'velikost prstynk',
    'cm retiz', 'cm retez',
  ];

  // Sortiment-level params (assortment / merchandising) — origin and packaging
  // belong here, alongside brand/category/gender, not to "Společné".
  const SORTIMENT_STEMS = [
    'zem puvod', 'puvod', 'origin', 'made in',
    'baleni', 'package', 'packaging', 'box',
  ];

  const COMMON_STEMS = [
    'barva', 'farba', 'color', 'odstin',
    'tvar', 'styl', 'design', 'proveden',
    'velikost', 'rozmer', 'delka', 'sirk', 'sirka',
    'prumer',
    'material', 'kov', 'povrch', 'finish',
    'pohlavi', 'urcen',
  ];

  // Order: WATCH → JEWELRY → SORTIMENT → COMMON. Anything unmatched falls
  // through to COMMON (no separate "Ostatní" group anymore).
  const classifyParam = (name: string): 'jewelry' | 'watch' | 'sortiment' | 'common' => {
    const n = stripDiacritics(name);
    if (WATCH_STEMS.some((k) => n.includes(k))) return 'watch';
    if (JEWELRY_STEMS.some((k) => n.includes(k))) return 'jewelry';
    if (SORTIMENT_STEMS.some((k) => n.includes(k))) return 'sortiment';
    if (COMMON_STEMS.some((k) => n.includes(k))) return 'common';
    return 'common';
  };

  // Other params sorted by number of options ascending (fewer options first → easier to scan).
  // Ties broken alphabetically for stable order across renders.
  const otherParams = useMemo(
    () =>
      availableParams
        .filter((p) => p.nazev !== GENDER_PARAM)
        .slice()
        .sort((a, b) => {
          const diff = a.values.length - b.values.length;
          if (diff !== 0) return diff;
          return a.nazev.localeCompare(b.nazev, 'cs');
        }),
    [availableParams]
  );

  const jewelryParams = useMemo(
    () => otherParams.filter((p) => classifyParam(p.nazev) === 'jewelry'),
    [otherParams]
  );
  const watchParams = useMemo(
    () => otherParams.filter((p) => classifyParam(p.nazev) === 'watch'),
    [otherParams]
  );
  // Země původu / balení and similar assortment-level attributes — rendered
  // inside the Sortiment group right after Značky / Kategorie / Určení.
  const sortimentExtraParams = useMemo(
    () => otherParams.filter((p) => classifyParam(p.nazev) === 'sortiment'),
    [otherParams]
  );
  const commonParams = useMemo(
    () => otherParams.filter((p) => classifyParam(p.nazev) === 'common'),
    [otherParams]
  );

  const toggleBrand = (name: string) => {
    setSelectedBrands(
      selectedBrands.includes(name)
        ? selectedBrands.filter((b) => b !== name)
        : [...selectedBrands, name]
    );
  };

  const toggleGender = (gender: string) => {
    setSelectedGenders(
      selectedGenders.includes(gender)
        ? selectedGenders.filter((g) => g !== gender)
        : [...selectedGenders, gender]
    );
  };

  const toggleParam = (nazev: string, value: string) => {
    const current = selectedParams[nazev] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setSelectedParams({ ...selectedParams, [nazev]: next });
  };

  const LanguagePicker = () => (
    <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted">
      {ALL_LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l as Lang)}
          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
            lang === l
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-foreground'
          }`}
        >
          <span className="text-base leading-none">{flags[l as Lang]}</span>
          <span className="truncate">{langNames[l as Lang]}</span>
        </button>
      ))}
    </div>
  );

  const homeContent = (
    <div className="flex h-full flex-col">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="lang-home" className="border-b px-2">
          <AccordionTrigger className="px-2 py-3 hover:no-underline">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="text-base leading-none">{flags[lang as Lang]}</span>
              {t.language}
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-3">
            <LanguagePicker />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <nav className="px-4 py-3 space-y-1">
        <a href="#" className="block px-2 py-2.5 text-sm font-medium rounded-md hover:bg-muted transition-colors">O nás</a>
        <a href="#" className="block px-2 py-2.5 text-sm font-medium rounded-md hover:bg-muted transition-colors">Naše služby</a>
        <a href="#" className="block px-2 py-2.5 text-sm font-medium rounded-md hover:bg-muted transition-colors">Kontakt</a>
      </nav>
    </div>
  );

  // Compute active counts for collapsed-state badges
  const activeCategoryCount = selectedCategory ? 1 : 0;
  const activeGendersCount = selectedGenders.length;
  const activeBrandsCount = selectedBrands.length;
  const activeDiscountCount = minDiscount > 0 ? 1 : 0;

  // Total active filter count (for footer reset button)
  const activeParamCount = useMemo(
    () => Object.values(selectedParams).reduce((n, vs) => n + (vs?.length ?? 0), 0),
    [selectedParams]
  );
  const totalActiveCount =
    activeCategoryCount + activeGendersCount + activeBrandsCount + activeDiscountCount + activeParamCount;

  const resetAllFilters = () => {
    setSelectedBrands([]);
    setSelectedCategory(null);
    setSelectedGenders([]);
    setSelectedParams({});
    setMinDiscount(0);
  };

  // Hi-tech 2026 group header — glassmorphic gradient pill with iconified chip.
  // Variant accents tie the header to the product family it filters.
  type GroupVariant = 'neutral' | 'jewelry' | 'watches' | 'common';

  const GroupHeaderInner = ({
    label,
    icon: Icon,
    variant = 'neutral',
    sub,
    activeCount = 0,
  }: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: GroupVariant;
    sub?: string;
    activeCount?: number;
  }) => (
    <div
      className={`filter-group-header filter-group-${variant}`}
      data-active={activeCount > 0 ? 'true' : 'false'}
    >
      <div className="filter-group-header-inner">
        {Icon && (
          <span className="filter-group-chip">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div className="filter-group-text">
          <span className="filter-group-label">{label}</span>
          {sub && <span className="filter-group-sub">{sub}</span>}
        </div>
        {activeCount > 0 && (
          <span className="filter-group-count">{activeCount}</span>
        )}
      </div>
    </div>
  );

  // Collapsible group: clicking the header expands/collapses the entire section.
  const CollapsibleGroup = ({
    value, label, sub, icon, variant, activeCount, defaultOpen, children,
  }: {
    value: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: GroupVariant;
    sub?: string;
    activeCount?: number;
    defaultOpen?: boolean;
    children: React.ReactNode;
  }) => (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? value : undefined}
      className="filter-group-wrap"
    >
      <AccordionItem value={value} className="filter-group-acc-item">
        <AccordionTrigger className="filter-group-acc-trigger">
          <GroupHeaderInner
            label={label}
            sub={sub}
            icon={icon}
            variant={variant}
            activeCount={activeCount}
          />
        </AccordionTrigger>
        <AccordionContent className="filter-group-acc-content">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  // Helper: renders a single dynamic param accordion item (used in property/technical/misc groups).
  const renderParamItem = (param: AvailableParam) => {
    const selectedValues = selectedParams[param.nazev] ?? [];
    const useToggles = param.values.length <= TOGGLE_THRESHOLD;

    return (
      <AccordionItem key={param.nazev} value={`param-${param.nazev}`} className="border-b px-2">
        <AccordionTrigger className="px-2 py-3 hover:no-underline">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {tParamName(param.nazev, lang)}
            <ActiveBadge count={selectedValues.length} />
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-3">
          {selectedValues.length > 0 && (
            <button
              onClick={() => setSelectedParams({ ...selectedParams, [param.nazev]: [] })}
              className="mb-2 text-xs text-primary hover:underline"
            >
              Vše
            </button>
          )}
          {useToggles ? (
            <div className="space-y-2">
              {param.values.map((value) => (
                <div key={value} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate pr-2">{value}</span>
                  <Switch
                    checked={selectedValues.includes(value)}
                    onCheckedChange={() => toggleParam(param.nazev, value)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-muted">
              {param.values.map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 text-sm hover:bg-muted transition-colors"
                >
                  <Checkbox
                    checked={selectedValues.includes(value)}
                    onCheckedChange={() => toggleParam(param.nazev, value)}
                  />
                  <span className="truncate">{value}</span>
                </label>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    );
  };

  // Group labels (Czech-first; could be moved to i18n later)
  const groupLabels = {
    commerce: 'Obchod',
    commerceSub: 'Slevy a akce',
    sortiment: 'Sortiment',
    sortimentSub: 'Značka · kategorie · určení · původ · balení',
    jewelry: 'Šperky',
    jewelrySub: 'Kámen · ryzost · drahokovy',
    watches: 'Hodinky',
    watchesSub: 'Strojek · sklo · vodotěsnost · funkce',
    common: 'Společné vlastnosti',
    commonSub: 'Barva · velikost · design · materiál',
  };

  const content = (
    <div className="filter-panel flex h-full flex-col">
      {/* Top quick row: stock toggle + language picker (no "Region" label — avoids
          confusion with country of origin) */}
      <div className="filter-quick-row">
        <div className="filter-quick-stock">
          <Sliders className="h-3.5 w-3.5" />
          <span>{t.stockOnly}</span>
          <Switch checked={stockOnly} onCheckedChange={setStockOnly} className="ml-auto" />
        </div>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="lang" className="filter-lang-item">
            <AccordionTrigger className="filter-lang-trigger">
              <span className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-base leading-none">{flags[lang as Lang]}</span>
                <span>{t.language}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 pt-1">
              <LanguagePicker />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* === OBCHOD (slevy a akce) — collapsible === */}
      {user && (
        <CollapsibleGroup
          value="g-obchod"
          label={groupLabels.commerce}
          sub={groupLabels.commerceSub}
          icon={ShoppingBag}
          activeCount={activeDiscountCount}
          defaultOpen={activeDiscountCount > 0}
        >
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="discount" className="border-b px-2">
              <AccordionTrigger className="px-2 py-3 hover:no-underline">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.discountTiers}
                  <ActiveBadge count={activeDiscountCount} />
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-3">
                <div className="space-y-2">
                  {discountTiers.map((tier) => (
                    <div key={tier.value} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{tier.label}</span>
                      <Switch
                        checked={minDiscount === tier.value}
                        onCheckedChange={(checked) => setMinDiscount(checked ? tier.value : 0)}
                      />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CollapsibleGroup>
      )}

      {/* === SORTIMENT (brand / category / gender / origin / packaging) === */}
      <CollapsibleGroup
        value="g-sortiment"
        label={groupLabels.sortiment}
        sub={groupLabels.sortimentSub}
        icon={Layers}
        activeCount={activeBrandsCount + activeCategoryCount + activeGendersCount + sortimentExtraParams.reduce((n, p) => n + (selectedParams[p.nazev]?.length ?? 0), 0)}
      >
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="brands" className="border-b px-2">
            <AccordionTrigger className="px-2 py-3 hover:no-underline">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.brands}
                <ActiveBadge count={activeBrandsCount} />
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-3">
              {activeBrandsCount > 0 && (
                <button
                  onClick={() => setSelectedBrands([])}
                  className="mb-2 text-sm text-primary hover:underline font-medium"
                >
                  {t.allBrands}
                </button>
              )}
              <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-muted">
                {sortedManufacturers.map((m) => (
                  <label
                    key={m.name}
                    className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 text-sm hover:bg-muted transition-colors"
                  >
                    <Checkbox
                      checked={selectedBrands.includes(m.name)}
                      onCheckedChange={() => toggleBrand(m.name)}
                    />
                    <span className="truncate">{m.name}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="categories" className="border-b px-2">
            <AccordionTrigger className="px-2 py-3 hover:no-underline">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.categories}
                <ActiveBadge count={activeCategoryCount} />
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className="mb-2 text-sm text-primary hover:underline font-medium"
              >
                {t.allCategories}
              </button>
              <div className="space-y-2">
                {CATEGORY_KEYS.map((cat) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{tCategory(cat, lang)}</span>
                    <Switch
                      checked={selectedCategory === cat}
                      onCheckedChange={(checked) => setSelectedCategory(checked ? cat : null)}
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {availableGenders.length > 0 && (
            <AccordionItem value="genders" className="border-b px-2">
              <AccordionTrigger className="px-2 py-3 hover:no-underline">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {tParamName('Určení', lang)}
                  <ActiveBadge count={activeGendersCount} />
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-3">
                {activeGendersCount > 0 && (
                  <button
                    onClick={() => setSelectedGenders([])}
                    className="mb-2 text-xs text-primary hover:underline"
                  >
                    Vše
                  </button>
                )}
                <div className="space-y-2">
                  {availableGenders.map((gender) => (
                    <div key={gender} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{tGender(gender, lang)}</span>
                      <Switch
                        checked={selectedGenders.includes(gender)}
                        onCheckedChange={() => toggleGender(gender)}
                      />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Země původu, balení (and similar) — assortment-level extras */}
          {sortimentExtraParams.map(renderParamItem)}
        </Accordion>
      </CollapsibleGroup>

      {/* === ŠPERKY — strict jewelry-only attributes === */}
      {jewelryParams.length > 0 && (
        <CollapsibleGroup
          value="g-jewelry"
          label={groupLabels.jewelry}
          sub={groupLabels.jewelrySub}
          icon={Gem}
          variant="jewelry"
          activeCount={jewelryParams.reduce((n, p) => n + (selectedParams[p.nazev]?.length ?? 0), 0)}
        >
          <Accordion type="multiple" className="w-full">
            {jewelryParams.map(renderParamItem)}
          </Accordion>
        </CollapsibleGroup>
      )}

      {/* === HODINKY — strict watch-only attributes === */}
      {watchParams.length > 0 && (
        <CollapsibleGroup
          value="g-watches"
          label={groupLabels.watches}
          sub={groupLabels.watchesSub}
          icon={Watch}
          variant="watches"
          activeCount={watchParams.reduce((n, p) => n + (selectedParams[p.nazev]?.length ?? 0), 0)}
        >
          <Accordion type="multiple" className="w-full">
            {watchParams.map(renderParamItem)}
          </Accordion>
        </CollapsibleGroup>
      )}

      {/* === SPOLEČNÉ — attributes that apply to both families === */}
      {commonParams.length > 0 && (
        <CollapsibleGroup
          value="g-common"
          label={groupLabels.common}
          sub={groupLabels.commonSub}
          icon={Sliders}
          variant="common"
          activeCount={commonParams.reduce((n, p) => n + (selectedParams[p.nazev]?.length ?? 0), 0)}
        >
          <Accordion type="multiple" className="w-full">
            {commonParams.map(renderParamItem)}
          </Accordion>
        </CollapsibleGroup>
      )}

      {/* === FOOTER — reset + AI help card so the column doesn't end on a filter === */}
      <div className="filter-footer">
        <button
          type="button"
          onClick={resetAllFilters}
          disabled={totalActiveCount === 0}
          className="filter-reset-btn"
          data-active={totalActiveCount > 0 ? 'true' : 'false'}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Resetovat filtry</span>
          {totalActiveCount > 0 && (
            <span className="filter-reset-count">{totalActiveCount}</span>
          )}
        </button>

        <div className="filter-ai-card">
          <div className="filter-ai-card-glow" aria-hidden />
          <div className="filter-ai-card-head">
            <span className="filter-ai-chip">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div className="filter-ai-text">
              <span className="filter-ai-title">AI poradce</span>
              <span className="filter-ai-sub">Hledáte něco konkrétního?</span>
            </div>
          </div>
          <p className="filter-ai-desc">
            Popište co hledáte vlastními slovy — najdeme produkt na míru.
          </p>
          <button
            type="button"
            onClick={() => {
              // GatewayPanel mounts only on homepage, so navigate first
              // and toggle the store flag — homepage will pick it up.
              setGatewayOpen(true);
              setSidebarOpen(false);
              navigate('/');
            }}
            className="filter-ai-cta"
          >
            <span>Zeptat se AI</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="filter-footer-meta">
          <span>partner.</span>
          <span>·</span>
          <span>Premium katalog 2026</span>
        </div>
      </div>

    </div>
  );

  const activeContent = isHome ? homeContent : content;

  return (
    <>
      {!mobileOnly && !isHome && (
        <DesktopSidebar>{content}</DesktopSidebar>
      )}

      {!desktopOnly && sidebarOpen && (
        <div className="fixed inset-0 z-[90]" style={{ touchAction: 'none' }}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-card shadow-xl flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between border-b p-4 shrink-0">
              <h2 className="font-display font-semibold">{isHome ? 'Menu' : t.filters}</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              {activeContent}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
