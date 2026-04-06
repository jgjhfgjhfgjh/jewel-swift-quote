import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp, Percent, X, Search, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCustomerDiscounts } from '@/hooks/useCustomerDiscounts';
import { translations } from '@/lib/i18n';

interface Props {
  manufacturers: { name: string; count: number }[];
}

export function AdminBrandPanel({ manufacturers }: Props) {
  const {
    lang, brandDiscounts, setBrandDiscount, removeBrandDiscount, clearAllAdminDiscounts, productDiscounts,
    salesCustomer, salesBrandDiscounts, setSalesBrandDiscount, removeSalesBrandDiscount,
  } = useStore();
  const { isAdmin } = useAuthContext();
  const { saveBrandDiscount, removeBrandDiscount: removeDbBrandDiscount, fetchDiscounts } = useCustomerDiscounts();
  const t = translations[lang];
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [brandSearch, setBrandSearch] = useState('');
  // Tracks which brands are permanently saved in DB
  const [permanentBrands, setPermanentBrands] = useState<Record<string, boolean>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const setInputRef = useCallback((name: string) => (el: HTMLInputElement | null) => { inputRefs.current[name] = el; }, []);

  // Load permanent state from DB when sales customer changes
  useEffect(() => {
    if (!salesCustomer) {
      setPermanentBrands({});
      return;
    }
    fetchDiscounts(salesCustomer.user_id).then(({ brandDiscounts: dbBrands }) => {
      const map: Record<string, boolean> = {};
      for (const d of dbBrands) map[d.brand] = true;
      setPermanentBrands(map);
    });
  }, [salesCustomer, fetchDiscounts]);

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

  const handleSet = async (brand: string) => {
    const val = inputs[brand];
    if (val && !isNaN(Number(val))) {
      const percent = Math.min(100, Math.max(0, Number(val)));
      if (salesCustomer) {
        setSalesBrandDiscount(brand, percent);
      } else {
        setBrandDiscount(brand, percent);
      }
      setInputs((prev) => ({ ...prev, [brand]: '' }));
    }
  };

  const handleTogglePermanent = async (brand: string) => {
    if (!salesCustomer) return;
    const isPermanent = permanentBrands[brand];
    if (isPermanent) {
      // Remove from DB
      const ok = await removeDbBrandDiscount(salesCustomer.user_id, brand);
      if (ok) setPermanentBrands((prev) => ({ ...prev, [brand]: false }));
    } else {
      // Save to DB
      const discount = activeBrandDiscounts.find((d) => d.brand === brand);
      if (!discount) return;
      const ok = await saveBrandDiscount(salesCustomer.user_id, brand, discount.percent);
      if (ok) setPermanentBrands((prev) => ({ ...prev, [brand]: true }));
    }
  };

  const activeBrandDiscounts = salesCustomer ? salesBrandDiscounts : brandDiscounts;

  const getBrandDiscount = (brand: string) =>
    activeBrandDiscounts.find((d) => d.brand === brand)?.percent;

  const handleGlobalReset = () => {
    if (!window.confirm('Opravdu chcete smazat všechny ručně nastavené slevy a vrátit se k cenám z feedu?')) return;

    if (salesCustomer) {
      // Only remove non-permanent brand discounts
      const toRemove = salesBrandDiscounts.filter((d) => !permanentBrands[d.brand]);
      for (const d of toRemove) removeSalesBrandDiscount(d.brand);
    } else {
      clearAllAdminDiscounts();
    }

    const hadPermanent = Object.values(permanentBrands).some(Boolean);
    if (hadPermanent) {
      toast('Dočasné úpravy byly resetovány. Trvalé slevy zůstaly zachovány.');
    }
  };

  return (
    <div className="border-b bg-muted/30">
      <div className="flex w-full items-center justify-between px-4 py-2">
        <button
          onClick={() => setOpen(!open)}
          className="flex flex-1 items-center gap-2 text-sm font-semibold hover:bg-muted/50 transition-colors"
        >
          <Percent className="h-4 w-4 text-primary" />
          {t.brandDiscountPanel}
          {activeBrandDiscounts.length > 0 && (
            <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
              {activeBrandDiscounts.length}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          {(activeBrandDiscounts.length > 0 || Object.keys(salesCustomer ? {} : productDiscounts).length > 0) && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[10px] px-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground md:h-7 md:text-[10px] md:px-2 max-[767px]:h-5 max-[767px]:text-[8px] max-[767px]:px-1.5 max-[767px]:scale-90"
              onClick={(e) => {
                e.stopPropagation();
                handleGlobalReset();
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
          {activeBrandDiscounts.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {activeBrandDiscounts.map((d) => (
                <button
                  key={d.brand}
                  onClick={() => salesCustomer ? removeSalesBrandDiscount(d.brand) : removeBrandDiscount(d.brand)}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 hover:bg-blue-500/20 transition-colors"
                >
                  {d.brand} -{d.percent}% <X className="h-2.5 w-2.5" />
                </button>
              ))}
            </div>
          )}

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
              const isPermanent = permanentBrands[name];
              return (
                <div key={name} className="flex items-center gap-2">
                  <span
                    className="flex-1 truncate text-xs cursor-pointer hover:text-primary transition-colors"
                    onClick={() => inputRefs.current[name]?.focus()}
                  >
                    {name}
                    <span className="text-[10px] text-muted-foreground ml-1">({count})</span>
                  </span>
                  {existing !== undefined && (
                    <span className="text-[10px] font-bold text-blue-600">-{existing}%</span>
                  )}
                  <Input
                    ref={setInputRef(name)}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="%"
                    value={inputs[name] || ''}
                    onChange={(e) => setInputs((prev) => ({ ...prev, [name]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSet(name)}
                    className={`w-14 h-6 text-[10px] px-1 text-center transition-colors focus:border-primary focus:ring-primary ${existing !== undefined ? 'border-blue-500' : ''}`}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] px-2"
                    onClick={() => handleSet(name)}
                  >
                    {t.setDiscount}
                  </Button>
                  {salesCustomer && existing !== undefined && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`h-6 w-6 p-0 transition-colors ${isPermanent ? 'border-green-500 text-green-600 bg-green-50 hover:bg-green-100' : 'text-blue-600 border-blue-300 hover:bg-blue-50'}`}
                            onClick={() => handleTogglePermanent(name)}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isPermanent ? 'Zrušit trvalé uložení' : 'Uložit trvale'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
