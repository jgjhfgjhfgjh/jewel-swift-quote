import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Percent, X, Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';

interface Props {
  manufacturers: { name: string; count: number }[];
}

export function AdminBrandPanel({ manufacturers }: Props) {
  const { lang, isAdmin, brandDiscounts, setBrandDiscount, removeBrandDiscount, clearAllAdminDiscounts, productDiscounts } = useStore();
  const t = translations[lang];
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [brandSearch, setBrandSearch] = useState('');

  const sortedBrands = useMemo(() =>
    [...manufacturers].sort((a, b) => a.name.localeCompare(b.name)),
    [manufacturers]
  );

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return sortedBrands;
    const q = brandSearch.toLowerCase();
    return sortedBrands.filter(({ name }) => name.toLowerCase().includes(q));
  }, [sortedBrands, brandSearch]);


  if (!isAdmin) return null;

  const handleSet = (brand: string) => {
    const val = inputs[brand];
    if (val && !isNaN(Number(val))) {
      setBrandDiscount(brand, Math.min(100, Math.max(0, Number(val))));
      setInputs((prev) => ({ ...prev, [brand]: '' }));
    }
  };

  const getBrandDiscount = (brand: string) =>
    brandDiscounts.find((d) => d.brand === brand)?.percent;

  return (
    <div className="border-b bg-muted/30">
      <div className="flex w-full items-center justify-between px-4 py-2">
        <button
          onClick={() => setOpen(!open)}
          className="flex flex-1 items-center gap-2 text-sm font-semibold hover:bg-muted/50 transition-colors"
        >
          <Percent className="h-4 w-4 text-primary" />
          {t.brandDiscountPanel}
          {brandDiscounts.length > 0 && (
            <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
              {brandDiscounts.length}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          {(brandDiscounts.length > 0 || Object.keys(productDiscounts).length > 0) && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[10px] px-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground md:h-7 md:text-[10px] md:px-2 max-[767px]:h-5 max-[767px]:text-[8px] max-[767px]:px-1.5 max-[767px]:scale-90"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Opravdu chcete smazat všechny ručně nastavené slevy a vrátit se k cenám z feedu?')) {
                  clearAllAdminDiscounts();
                }
              }}
            >
              <RotateCcw className="h-3 w-3 max-[767px]:h-2.5 max-[767px]:w-2.5 max-[767px]:mr-0 mr-1" />
              <span className="hidden md:inline">Resetovat všechny slevy</span>
              <span className="md:hidden">Reset</span>
            </Button>
          )}
          <button onClick={() => setOpen(!open)}>
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-3 max-h-[70vh] overflow-y-auto scroll-smooth">
          {/* Active brand discounts summary */}
          {brandDiscounts.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {brandDiscounts.map((d) => (
                <button
                  key={d.brand}
                  onClick={() => removeBrandDiscount(d.brand)}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 hover:bg-blue-500/20 transition-colors"
                >
                  {d.brand} -{d.percent}% <X className="h-2.5 w-2.5" />
                </button>
              ))}
            </div>
          )}

          {/* Search filter for brands - sticky */}
          <div className="sticky top-0 z-10 bg-muted/30 pb-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.search}
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="h-7 pl-7 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1 pr-1">
            {filteredBrands.map(({ name, count }) => {
              const existing = getBrandDiscount(name);
              return (
                <div key={name} className="flex items-center gap-2">
                  <span className="flex-1 truncate text-xs">
                    {name}
                    <span className="text-[10px] text-muted-foreground ml-1">({count})</span>
                  </span>
                  {existing !== undefined && (
                    <span className="text-[10px] font-bold text-blue-600">-{existing}%</span>
                  )}
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="%"
                    value={inputs[name] || ''}
                    onChange={(e) => setInputs((prev) => ({ ...prev, [name]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSet(name)}
                    className={`w-14 h-6 text-[10px] px-1 text-center ${existing !== undefined ? 'border-blue-500' : ''}`}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] px-2"
                    onClick={() => handleSet(name)}
                  >
                    {t.setDiscount}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
