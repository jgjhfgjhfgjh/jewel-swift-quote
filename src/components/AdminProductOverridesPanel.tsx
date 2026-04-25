import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Package, X, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCustomerDiscounts } from '@/hooks/useCustomerDiscounts';
import { getFinalVoc } from '@/lib/discount';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/lib/types';

export function AdminProductOverridesPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const {
    lang, productDiscounts, setProductDiscount, brandDiscounts,
    salesCustomer, salesProductDiscounts, setSalesProductDiscount, salesBrandDiscounts,
  } = useStore();
  const { isAdmin } = useAuthContext();
  const { saveProductDiscount, removeProductDiscount, fetchDiscounts } = useCustomerDiscounts();
  const [open, setOpen] = useState(false);
  // Tracks which products are permanently saved in DB
  const [permanentProducts, setPermanentProducts] = useState<Record<string, boolean>>({});

  // Load permanent state from DB when sales customer changes
  useEffect(() => {
    if (!salesCustomer) {
      setPermanentProducts({});
      return;
    }
    fetchDiscounts(salesCustomer.user_id).then(({ productDiscounts: dbProducts }) => {
      const map: Record<string, boolean> = {};
      for (const id of Object.keys(dbProducts)) map[id] = true;
      setPermanentProducts(map);
    });
  }, [salesCustomer, fetchDiscounts]);

  // Fetch overridden products by ID (lightweight, only when overrides exist)
  const effectiveProductDiscountsForFetch = salesCustomer ? salesProductDiscounts : productDiscounts;
  const overriddenIdsKey = Object.keys(effectiveProductDiscountsForFetch).sort().join(',');
  useEffect(() => {
    const ids = overriddenIdsKey ? overriddenIdsKey.split(',') : [];
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    let active = true;
    (supabase as any)
      .from('produkty')
      .select('id, sku, ean, product_name, manufacturer, category_text, retail_price, wholesale_price, stock, image_url')
      .in('id', ids)
      .then(({ data }: { data: any[] | null }) => {
        if (!active || !data) return;
        setProducts(data.map((row: any) => ({
          id: row.id,
          name: row.product_name || row.sku,
          manufacturer: row.manufacturer || '',
          sku: row.sku,
          ean: row.ean || '',
          description: '',
          category: row.category_text || '',
          img: row.image_url || '',
          image_urls: [],
          price: Number(row.retail_price ?? 0),
          wholesale: Number(row.wholesale_price ?? 0),
          stock: row.stock ?? 0,
          inStock: (row.stock ?? 0) > 0,
        })));
      });
    return () => { active = false; };
  }, [overriddenIdsKey]);

  if (!isAdmin) return null;

  const effectiveProductDiscounts = salesCustomer ? salesProductDiscounts : productDiscounts;
  const customerDiscount = salesCustomer?.base_discount ?? 0;

  const overriddenIds = Object.keys(effectiveProductDiscounts);
  if (overriddenIds.length === 0) return null;

  const overriddenProducts = overriddenIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  const handleRemove = async (productId: string) => {
    const isPermanent = permanentProducts[productId];
    if (isPermanent && salesCustomer) {
      if (!window.confirm('Opravdu chcete smazat tuto trvalou slevu z profilu zákazníka?')) return;
      await removeProductDiscount(salesCustomer.user_id, productId);
      setPermanentProducts((prev) => ({ ...prev, [productId]: false }));
    }
    if (salesCustomer) {
      setSalesProductDiscount(productId, undefined);
    } else {
      setProductDiscount(productId, undefined);
    }
  };

  const handleResetAll = () => {
    if (!window.confirm('Opravdu chcete resetovat všechny ruční úpravy produktů?')) return;
    const hadPermanent = Object.values(permanentProducts).some(Boolean);
    for (const id of overriddenIds) {
      if (permanentProducts[id]) continue; // skip permanent
      if (salesCustomer) {
        setSalesProductDiscount(id, undefined);
      } else {
        setProductDiscount(id, undefined);
      }
    }
    if (hadPermanent) {
      toast('Dočasné úpravy byly resetovány. Trvalé slevy zůstaly zachovány.');
    }
  };

  const handleTogglePermanent = async (productId: string) => {
    if (!salesCustomer) return;
    const isPermanent = permanentProducts[productId];
    if (isPermanent) {
      const ok = await removeProductDiscount(salesCustomer.user_id, productId);
      if (ok) setPermanentProducts((prev) => ({ ...prev, [productId]: false }));
    } else {
      const percent = effectiveProductDiscounts[productId];
      if (percent !== undefined) {
        const ok = await saveProductDiscount(salesCustomer.user_id, productId, percent);
        if (ok) setPermanentProducts((prev) => ({ ...prev, [productId]: true }));
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
              const isPermanent = permanentProducts[product.id];

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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className={`h-6 w-6 p-0 transition-colors ${isPermanent ? 'border-green-500 text-green-600 bg-green-50 hover:bg-green-100' : 'text-blue-600 border-blue-300 hover:bg-blue-50'}`}
                              onClick={() => handleTogglePermanent(product.id)}
                            >
                              <Save className="h-2.5 w-2.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isPermanent ? 'Zrušit trvalé uložení' : 'Uložit trvale'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
