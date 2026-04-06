import { useMemo, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
}

const CATEGORY_KEYS = ['Hodinky', 'Šperky', 'Příslušenství'] as const;

export function FilterSidebar({
  manufacturers, categories, selectedBrands, setSelectedBrands,
  selectedCategory, setSelectedCategory, search, setSearch,
  stockOnly, setStockOnly, minDiscount, setMinDiscount,
}: Props) {
  const { lang, sidebarOpen, setSidebarOpen } = useStore();
  const t = translations[lang];

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

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

  const content = (
    <div className="flex h-full flex-col">
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Live Offer toggle */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm font-medium">{t.stockOnly}</span>
        <Switch checked={stockOnly} onCheckedChange={setStockOnly} />
      </div>

      {/* Discount tier filters */}
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
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <span className="truncate">{m.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r bg-card">
        {content}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" style={{ touchAction: 'none' }}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-card shadow-xl flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between border-b p-4 shrink-0">
              <h2 className="font-display font-semibold">{t.filters}</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              {content}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
