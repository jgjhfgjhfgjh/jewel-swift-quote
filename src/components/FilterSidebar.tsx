import { useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import type { AvailableParam } from '@/hooks/useProducts';

const GENDER_PARAM = 'Určení';
const GENDER_LABELS: Record<string, string> = {
  'Pro muže': 'Muži',
  'Pro ženy': 'Ženy',
  'Pro děti': 'Děti',
  'Unisex': 'Unisex',
};
// Preferred display order for genders
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
  /** Render only the mobile overlay (no desktop aside) */
  mobileOnly?: boolean;
  /** Render only the desktop aside (no mobile overlay) */
  desktopOnly?: boolean;
}

const CATEGORY_KEYS = ['Hodinky', 'Šperky', 'Příslušenství'] as const;
const HEADER_HEIGHT = 56;
const TOGGLE_THRESHOLD = 5; // ≤ this many values → use Switch toggles

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

export function FilterSidebar({
  manufacturers, categories, selectedBrands, setSelectedBrands,
  selectedCategory, setSelectedCategory, search, setSearch,
  stockOnly, setStockOnly, minDiscount, setMinDiscount,
  selectedGenders, setSelectedGenders,
  selectedParams, setSelectedParams,
  availableParams,
  mobileOnly, desktopOnly,
}: Props) {
  const { user } = useAuthContext();
  const { lang, sidebarOpen, setSidebarOpen, viewMode } = useStore();
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

  const categoryLabels: Record<string, Record<string, string>> = {
    'Hodinky': { cs: 'Hodinky', en: 'Watches', is: 'Úr' },
    'Šperky': { cs: 'Šperky', en: 'Jewelry', is: 'Skartgripir' },
    'Příslušenství': { cs: 'Příslušenství', en: 'Accessories', is: 'Fylgihlutir' },
  };

  const sortedManufacturers = useMemo(
    () => [...manufacturers].sort((a, b) => a.name.localeCompare(b.name)),
    [manufacturers]
  );

  // Available genders from "Určení" param, in preferred order
  const availableGenders = useMemo(() => {
    const genderParam = availableParams.find((p) => p.nazev === GENDER_PARAM);
    if (!genderParam) return [];
    return GENDER_ORDER.filter((g) => genderParam.values.includes(g));
  }, [availableParams]);

  // Other params (excluding "Určení"), each split into toggle or checkbox variant
  const otherParams = useMemo(
    () => availableParams.filter((p) => p.nazev !== GENDER_PARAM),
    [availableParams]
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

  const homeContent = (
    <div className="flex h-full flex-col">
      <nav className="px-4 py-3 space-y-1">
        <a href="#" className="block px-2 py-2.5 text-sm font-medium rounded-md hover:bg-muted transition-colors">O nás</a>
        <a href="#" className="block px-2 py-2.5 text-sm font-medium rounded-md hover:bg-muted transition-colors">Naše služby</a>
        <a href="#" className="block px-2 py-2.5 text-sm font-medium rounded-md hover:bg-muted transition-colors">Kontakt</a>
      </nav>
    </div>
  );

  const content = (
    <div className="flex h-full flex-col">
      {/* Live Offer toggle */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm font-medium">{t.stockOnly}</span>
        <Switch checked={stockOnly} onCheckedChange={setStockOnly} />
      </div>

      {/* Discount tier filters */}
      {user && (
        <div className="px-4 py-2 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.discountTiers}</h3>
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
      )}

      {/* Category switches */}
      <div className="px-4 py-2 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.categories}</h3>
        <button
          onClick={() => setSelectedCategory(null)}
          className="text-sm text-primary hover:underline font-medium"
        >
          {t.allCategories}
        </button>
        {CATEGORY_KEYS.map((cat) => (
          <div key={cat} className="flex items-center justify-between">
            <span className="text-sm font-medium">{categoryLabels[cat]?.[lang] || cat}</span>
            <Switch
              checked={selectedCategory === cat}
              onCheckedChange={(checked) => setSelectedCategory(checked ? cat : null)}
            />
          </div>
        ))}
      </div>

      {/* Určení — gender filter */}
      {availableGenders.length > 0 && (
        <div className="px-4 py-2 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Určení</h3>
            {selectedGenders.length > 0 && (
              <button
                onClick={() => setSelectedGenders([])}
                className="text-xs text-primary hover:underline"
              >
                Vše
              </button>
            )}
          </div>
          {availableGenders.map((gender) => (
            <div key={gender} className="flex items-center justify-between">
              <span className="text-sm font-medium">{GENDER_LABELS[gender] ?? gender}</span>
              <Switch
                checked={selectedGenders.includes(gender)}
                onCheckedChange={() => toggleGender(gender)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Other parameter filters */}
      {otherParams.map((param) => {
        const selectedValues = selectedParams[param.nazev] ?? [];
        const useToggles = param.values.length <= TOGGLE_THRESHOLD;

        return (
          <div key={param.nazev} className="px-4 py-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {param.nazev}
              </h3>
              {selectedValues.length > 0 && (
                <button
                  onClick={() => setSelectedParams({ ...selectedParams, [param.nazev]: [] })}
                  className="text-xs text-primary hover:underline"
                >
                  Vše
                </button>
              )}
            </div>

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
              <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-muted">
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
          </div>
        );
      })}

      {/* Brands with checkboxes */}
      <div className="p-4 pt-2 pb-24">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.brands}</h3>
        <button
          onClick={() => setSelectedBrands([])}
          className="mb-2 text-sm text-primary hover:underline font-medium"
        >
          {t.allBrands}
        </button>
        <div className="space-y-1.5">
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
      </div>
    </div>
  );

  const activeContent = isHome ? homeContent : content;

  return (
    <>
      {/* Desktop sidebar — only in catalog mode, only when desktopOnly */}
      {!mobileOnly && !isHome && (
        <DesktopSidebar>{content}</DesktopSidebar>
      )}

      {/* Mobile overlay — always available when not desktopOnly */}
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
