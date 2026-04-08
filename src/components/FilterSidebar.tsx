import { useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';

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
  /** Render only the mobile overlay (no desktop aside) */
  mobileOnly?: boolean;
  /** Render only the desktop aside (no mobile overlay) */
  desktopOnly?: boolean;
}

const CATEGORY_KEYS = ['Hodinky', 'Šperky', 'Příslušenství'] as const;

export function FilterSidebar({
  manufacturers, categories, selectedBrands, setSelectedBrands,
  selectedCategory, setSelectedCategory, search, setSearch,
  stockOnly, setStockOnly, minDiscount, setMinDiscount,
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

  const toggleBrand = (name: string) => {
    if (selectedBrands.includes(name)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== name));
    } else {
      setSelectedBrands([...selectedBrands, name]);
    }
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
                className=""
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
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r bg-card sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto z-[90]">
          {content}
        </aside>
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
