import { useState } from 'react';
import { ChevronDown, ChevronUp, Package, X, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCustomerDiscounts } from '@/hooks/useCustomerDiscounts';
import { getActiveDiscount, getFinalVoc } from '@/lib/discount';
import type { Product } from '@/lib/types';

interface Props {
  products: Product[];
}

export function AdminProductOverridesPanel({ products }: Props) {
  const {
    lang, productDiscounts, setProductDiscount, brandDiscounts,
    salesCustomer, salesProductDiscounts, setSalesProductDiscount, salesBrandDiscounts,
    savePermanentProduct, setSavePermanentProduct,
  } = useStore();
  const { isAdmin } = useAuthContext();
  const { saveProductDiscount } = useCustomerDiscounts();
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  const effectiveProductDiscounts = salesCustomer ? salesProductDiscounts : productDiscounts;
  const effectiveBrandDiscounts = salesCustomer ? salesBrandDiscounts : brandDiscounts;
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
      await saveProductDiscount(salesCustomer.user_id, productId, percent);
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
          {salesCustomer && (
            <div className="mb-2 flex items-center gap-2">
              <Checkbox
                id="save-permanent-product"
                checked={savePermanentProduct}
                onCheckedChange={(v) => setSavePermanentProduct(!!v)}
              />
              <label htmlFor="save-permanent-product" className="text-[11px] font-medium text-blue-600 cursor-pointer flex items-center gap-1">
                <Save className="h-3 w-3" />
                Uložit trvale do profilu zákazníka
              </label>
            </div>
          )}

          <div className="space-y-2 pr-1">
            {overriddenProducts.map((product) => {
              const overridePercent = effectiveProductDiscounts[product.id];
              const baseDiscount = product.price > 0
                ? ((product.price - product.wholesale) / product.price) * 100
                : 0;
              const effectiveVoc = getFinalVoc(product.price, overridePercent, customerDiscount);
              const feedVoc = getFinalVoc(product.price, baseDiscount, customerDiscount);
              const margin = product.price - effectiveVoc;
              const marginPercent = product.price > 0 ? (margin / product.price) * 100 : 0;

              return (
                <div key={product.id} className="rounded-lg border bg-card p-3 space-y-2">
                  {/* Row 1: Photo + Name/SKU */}
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <img
                        src={product.img}
                        alt={product.name}
                        className="h-full w-full object-contain p-1"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-tight truncate">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{product.manufacturer} · {product.sku || product.id}</p>
                    </div>
                  </div>

                  {/* Row 2: Pricing grid — matches Cart style */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">MOC:</span>
                      <span className="font-medium">€{product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">MARŽE:</span>
                      <span className="font-bold text-primary text-sm">{marginPercent.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">VOC (feed):</span>
                      <span className="text-muted-foreground line-through">€{feedVoc.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Marže €:</span>
                      <span className="font-medium">€{margin.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-semibold">VOC (nová):</span>
                      <span className="text-blue-600 font-bold">€{effectiveVoc.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-semibold">SLEVA:</span>
                      <span className="text-blue-600 font-bold">-{Math.round(overridePercent)}%</span>
                    </div>
                  </div>

                  {/* Row 3: Actions */}
                  <div className="flex items-center justify-between pt-1 border-t">
                    {salesCustomer && savePermanentProduct ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px] px-2 gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                        onClick={() => handleSavePermanent(product.id)}
                      >
                        <Save className="h-3 w-3" />
                        Uložit trvale
                      </Button>
                    ) : (
                      <div />
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] px-2 gap-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemove(product.id)}
                    >
                      <X className="h-3 w-3" />
                      Odebrat
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
