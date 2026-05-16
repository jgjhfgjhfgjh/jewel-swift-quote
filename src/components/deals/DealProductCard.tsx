import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { dealsI18n } from '@/lib/i18n-deals';
import { ProductImageGallery } from '@/components/ProductImageGallery';
import { wholesaleForTierIndex, type DealProduct, type DealTier } from '@/lib/deals';

function fmt(currency: string, value: number): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency + ' ';
  return `${symbol}${value.toFixed(2)}`;
}

/** A product card inside a deal catalog. Pricing follows the order-wide tier. */
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
  onBrandClick,
  onOpenDetail,
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
  onBrandClick: (brand: string) => void;
  onOpenDetail: () => void;
}) {
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang].product;
  const [imgError, setImgError] = useState(false);

  const wholesale = wholesaleForTierIndex(product, tierIndex);
  const discountPercent = tiers[Math.max(tierIndex, 0)]?.discount_percent ?? 0;
  const unitMargin = product.retail_price - wholesale;
  const totalMargin = unitMargin * Math.max(qty, 1);
  const outOfStock = product.available <= 0;
  const atMax = qty >= product.available;
  const title = [product.collection, product.sku].filter(Boolean).join(' · ');
  const selected = qty > 0;
  const images = product.image_url ? [product.image_url] : [];

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-xl border bg-white transition-all
        ${selected ? 'border-emerald-400 bg-emerald-50/40 ring-1 ring-emerald-200' : 'border-slate-200 hover:shadow-md'}
        ${outOfStock ? 'opacity-60' : ''}`}
    >
      {/* image */}
      <ProductImageGallery images={images} alt={title || product.sku}>
        {({ onClick }) => (
          <div
            onClick={images.length ? onClick : undefined}
            className={`relative aspect-square overflow-hidden bg-white ${images.length ? 'cursor-zoom-in' : ''}`}
          >
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
            {selected && (
              <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            )}
            {!outOfStock && !selected && (
              <span className="absolute left-2 top-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {product.available >= 50 ? '50+' : product.available} {t.inStock}
              </span>
            )}
          </div>
        )}
      </ProductImageGallery>

      {/* body */}
      <div className="flex flex-1 flex-col p-3">
        <button
          type="button"
          onClick={() => onBrandClick(product.brand)}
          className="self-start text-[10px] font-bold uppercase tracking-wider text-amber-600 hover:underline"
          title={`Zobrazit jen ${product.brand}`}
        >
          {product.brand}
        </button>
        <h3
          onClick={onOpenDetail}
          className="mt-0.5 line-clamp-2 cursor-pointer text-sm font-semibold leading-snug text-slate-800 hover:underline"
        >
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
              <p className="font-display text-lg font-black leading-none text-emerald-600 tabular-nums">
                {qty > 1 ? t.marginTotal : t.margin}: {fmt(currency, totalMargin)}
              </p>
              {qty > 1 && (
                <p className="mt-0.5 text-[11px] text-slate-400 tabular-nums">
                  {t.margin} {t.perPc}: {fmt(currency, unitMargin)}
                </p>
              )}
              <div className="mb-2 mt-1 flex items-baseline gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-700">{t.voc}: {fmt(currency, wholesale)}</span>
                <span className="line-through">{t.moc}: {fmt(currency, product.retail_price)}</span>
              </div>

              {closed ? (
                <Button size="sm" disabled className="h-8 w-full text-xs">{t.soldOut}</Button>
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
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300 bg-emerald-100 text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="number"
                    value={qty}
                    min={0}
                    max={product.available}
                    onChange={(e) => onSet(Math.max(0, Math.min(product.available, Number(e.target.value) || 0)))}
                    className="h-8 w-14 rounded-md border border-slate-300 text-center text-sm font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    onClick={() => onSet(qty + 1)}
                    disabled={atMax}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors
                      ${atMax
                        ? 'cursor-not-allowed border-slate-200 text-slate-300'
                        : 'border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white'}`}
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
