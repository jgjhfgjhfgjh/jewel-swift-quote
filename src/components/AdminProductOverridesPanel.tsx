import { useState } from 'react';
import { ChevronDown, ChevronUp, Package, X, RotateCcw, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCustomerDiscounts } from '@/hooks/useCustomerDiscounts';
import { getFinalVoc } from '@/lib/discount';
import type { Product } from '@/lib/types';

interface Props {
  products: Product[];
}

export function AdminProductOverridesPanel({ products }: Props) {
  const {
    lang, productDiscounts, setProductDiscount, brandDiscounts,
    salesCustomer, salesProductDiscounts, setSalesProductDiscount, salesBrandDiscounts,
  } = useStore();
  const { isAdmin } = useAuthContext();
  const { saveProductDiscount } = useCustomerDiscounts();
  const [open, setOpen] = useState(false);
  const [savedProducts, setSavedProducts] = useState<Record<string, boolean>>({});

  if (!isAdmin) return null;

  const effectiveProductDiscounts = salesCustomer ? salesProductDiscounts : productDiscounts;
  const customerDiscount = salesCustomer?.base_discount ?? 0;

  const overriddenIds = Object.keys(effectiveProductDiscounts);
  if (overriddenIds.length === 0) return null;

  const overriddenProducts = overriddenIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  const handleRemove = (productId: string) => {
    if (salesCustomer) {
      setSalesProductDiscount(productId, undefined);
    } else {
      setProductDiscount(productId, undefined);
    }
  };

  const handleResetAll = () => {
    if (!window.confirm('Opravdu chcete resetovat všechny ruční úpravy produktů?')) return;
    for (const id of overriddenIds) {
      if (salesCustomer) {
        setSalesProductDiscount(id, undefined);
      } else {
        setProductDiscount(id, undefined);
      }
    }
  };

  const handleSavePermanent = async (productId: string) => {
    if (!salesCustomer) return;
    const percent = effectiveProductDiscounts[productId];
    if (percent !== undefined) {
      const ok = await saveProductDiscount(salesCustomer.user_id, productId, percent);
      if (ok) {
        setSavedProducts((prev) => ({ ...prev, [productId]: true }));
        setTimeout(() => setSavedProducts((prev) => ({ ...prev, [productId]: false })), 2000);
      }
    }
  };

  return (
    <div className="border-b bg-muted/30">
      <div className="flex w-full items-center justify-between px-4 py-2">
        <button
          onClick={() => setOpen(!open)}
          className="flex flex-1 items-center gap-2 text-sm font-semibold hover:bg-muted/50 transition-colors"
        >
          <Package className="h-4 w-4 text-primary" />
          Seznam upravených produktů
          <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
            {overriddenProducts.length}
          </span>
        </button>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[10px] px-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground max-[767px]:h-5 max-[767px]:text-[8px] max-[767px]:px-1.5 max-[767px]:scale-90"
            onClick={(e) => {
              e.stopPropagation();
              handleResetAll();
            }}
          >
            <RotateCcw className="h-3 w-3 max-[767px]:h-2.5 max-[767px]:w-2.5 mr-1 max-[767px]:mr-0" />
            <span className="hidden md:inline">Resetovat všechny ruční úpravy</span>
            <span className="md:hidden">Reset</span>
          </Button>
          <button onClick={() => setOpen(!open)}>
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-3 max-h-[70vh] overflow-y-auto scroll-smooth">
          <div className="space-y-2 pr-1">
            {overriddenProducts.map((product) => {
              const overridePercent = effectiveProductDiscounts[product.id];
              const effectiveVoc = getFinalVoc(product.price, overridePercent, customerDiscount);
              const marginEur = product.price - effectiveVoc;
              const isSaved = savedProducts[product.id];

              return (
                <div key={product.id} className="flex items-center gap-2 rounded-lg border bg-white p-2">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="h-full w-full object-contain p-0.5"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium leading-tight truncate">{product.name}</p>
                    <p className="text-[9px] text-muted-foreground">{product.manufacturer} · {product.sku || product.id}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] font-semibold text-blue-600">
                        Sleva: -{Math.round(overridePercent)}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        VOC: €{effectiveVoc.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        MOC: €{product.price.toFixed(2)}
                      </span>
                      <span className={`font-bold text-sm text-justify mx-[10px] ${marginEur >= 0 ? 'text-blue-600' : 'text-destructive'}`}>
                        Marže/ks: €{marginEur.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {salesCustomer && (
                      <Button
                        size="sm"
                        variant="outline"
                        className={`h-6 w-6 p-0 transition-colors ${isSaved ? 'border-green-500 text-green-600 bg-green-50' : 'text-blue-600 border-blue-300 hover:bg-blue-50'}`}
                        onClick={() => handleSavePermanent(product.id)}
                        title="Uložit trvale"
                      >
                        {isSaved ? <Check className="h-2.5 w-2.5" /> : <Save className="h-2.5 w-2.5" />}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[9px] px-1.5 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemove(product.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
