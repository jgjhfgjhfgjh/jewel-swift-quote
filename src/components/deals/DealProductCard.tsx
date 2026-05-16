import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { dealsI18n } from '@/lib/i18n-deals';
import { wholesaleForTierIndex, type DealProduct, type DealTier } from '@/lib/deals';

function fmt(currency: string, value: number): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency + ' ';
  return `${symbol}${value.toFixed(2)}`;
}

/** A single product card inside a deal catalog. Pricing follows the
 *  order-wide tier (passed in as `tierIndex`). */
export function DealProductCard({
  product,
  tierIndex,
  tiers,
  currency,
  qty,
  canSeePrices,
  closed,
  onAdd,
  onSet,
}: {
  product: DealProduct;
  tierIndex: number;
  tiers: DealTier[];
  currency: string;
  qty: number;
  canSeePrices: boolean;
  closed: boolean;
  onAdd: () => void;
  onSet: (q: number) => void;
}) {
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang].product;
  const [imgError, setImgError] = useState(false);

  const wholesale = wholesaleForTierIndex(product, tierIndex);
  const discountPercent = tiers[Math.max(tierIndex, 0)]?.discount_percent ?? 0;
  const margin = product.retail_price - wholesale;
  const outOfStock = product.available <= 0;
  const atMax = qty >= product.available;
  const title = [product.collection, product.sku].filter(Boolean).join(' · ');

  return (
    <div className={`group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md
      ${outOfStock ? 'opacity-60' : ''}`}>
      {/* image */}
      <div className="relative aspect-square overflow-hidden bg-white">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={title || product.sku}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-300">
            {product.brand}
          </div>
        )}
        {canSeePrices && discountPercent > 0 && (
          <Badge className="absolute right-2 top-2 bg-red-600 text-[11px] font-black text-white hover:bg-red-600">
            −{discountPercent} %
          </Badge>
        )}
        {!outOfStock && (
          <span className="absolute left-2 top-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {product.available >= 50 ? '50+' : product.available} {t.inStock}
          </span>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
          {product.brand}
        </span>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-800">
          {title || product.sku}
        </h3>
        {(product.attr_movement || product.attr_material || product.attr_size || product.gender) && (
          <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
            {[product.gender, product.attr_movement, product.attr_material, product.attr_size]
              .filter(Boolean).join(' · ')}
          </p>
        )}

        <div className="mt-auto pt-3">
          {canSeePrices ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg font-black text-slate-900 tabular-nums">
                  {fmt(currency, wholesale)}
                </span>
                {product.retail_price > 0 && (
                  <span className="text-xs text-slate-400 line-through tabular-nums">
                    {fmt(currency, product.retail_price)}
                  </span>
                )}
              </div>
              <p className="mb-2 text-[11px] font-semibold text-emerald-600 tabular-nums">
                {t.margin}: {fmt(currency, margin)} {t.perPc}
              </p>

              {closed ? (
                <Button size="sm" disabled className="h-8 w-full text-xs">
                  {t.soldOut}
                </Button>
              ) : qty === 0 ? (
                <Button
                  size="sm"
                  disabled={outOfStock}
                  onClick={onAdd}
                  className="h-8 w-full gap-1.5 bg-slate-900 text-xs text-white hover:bg-slate-700"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  {outOfStock ? t.soldOut : t.add}
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onSet(qty - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition-colors hover:bg-slate-900 hover:text-white"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="number"
                    value={qty}
                    min={0}
                    max={product.available}
                    onChange={(e) => onSet(Math.max(0, Math.min(product.available, Number(e.target.value) || 0)))}
                    className="h-8 w-14 rounded-md border border-slate-300 text-center text-sm font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                  <button
                    onClick={() => onSet(qty + 1)}
                    disabled={atMax}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors
                      ${atMax
                        ? 'cursor-not-allowed border-slate-200 text-slate-300'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white'}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center gap-1.5 rounded-md bg-slate-100 py-2 text-xs font-semibold text-slate-500">
              <Lock className="h-3.5 w-3.5" />
              {dealsI18n[lang].detail.loginToOrder}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
