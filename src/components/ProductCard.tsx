import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { translations } from '@/lib/i18n';
import { getActiveDiscount, getFinalVoc } from '@/lib/discount';
import type { Product } from '@/lib/types';
import { useState } from 'react';

export function ProductCard({ product }: { product: Product }) {
  const { lang, cart, brandDiscounts, productDiscounts, addToCart, updateQuantity, removeFromCart, setProductDiscount } = useStore();
  const { isAdmin, profile } = useAuthContext();
  const t = translations[lang];
  const [imgError, setImgError] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState('');

  const cartItem = cart.find((i) => i.product.id === product.id);
  const qty = cartItem?.quantity ?? 0;
  const isOutOfStock = product.stock <= 0;
  const atMax = qty >= product.stock;

  const { percent: activeDiscount, source } = getActiveDiscount(product, productDiscounts, brandDiscounts);
  const customerDiscount = profile?.base_discount ?? 0;

  const effectiveVoc = getFinalVoc(product.price, activeDiscount, customerDiscount);
  const unitMargin = product.price - effectiveVoc;
  const totalMargin = unitMargin * Math.max(qty, 1);
  const isOverridden = source === 'manual' || source === 'brand';

  const handleAdd = () => {
    if (!isOutOfStock) addToCart(product);
  };

  const handleIncrement = () => {
    if (!atMax) updateQuantity(product.id, qty + 1);
  };

  const handleDecrement = () => {
    if (qty <= 1) {
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, qty - 1);
    }
  };

  const handleDiscountSubmit = () => {
    if (discountInput === '') {
      setProductDiscount(product.id, undefined);
    } else {
      const val = Math.min(100, Math.max(0, Number(discountInput)));
      setProductDiscount(product.id, val);
    }
    setEditingDiscount(false);
  };

  const handleBadgeClick = () => {
    if (!isAdmin) return;
    setDiscountInput(source === 'manual' ? String(Math.round(activeDiscount)) : '');
    setEditingDiscount(true);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg bg-white transition-shadow hover:shadow-sm">
      <div className={`relative aspect-square overflow-hidden bg-muted ${isOutOfStock ? 'grayscale opacity-50' : ''}`}>
        {!imgError ? (
          <img
            src={product.img}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105 font-mono border-0 border-slate-50 border-none bg-white"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            {product.manufacturer}
          </div>
        )}
        {product.inStock && !isOutOfStock && (
          <div className="absolute left-2 top-2 flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-foreground drop-shadow-sm">
              {t.inStock}
            </span>
          </div>
        )}
        {activeDiscount > 0 && (
          editingDiscount && isAdmin ? (
            <div className="absolute right-1 top-1 flex items-center gap-0.5">
              <Input
                type="number"
                min="0"
                max="100"
                autoFocus
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                onBlur={handleDiscountSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleDiscountSubmit()}
                className="w-14 h-6 text-[10px] px-1 text-center border-blue-500 bg-white"
              />
            </div>
          ) : (
            <Badge
              onClick={handleBadgeClick}
              className={`absolute right-2 top-2 text-[10px] font-bold ${
                isAdmin ? 'cursor-pointer hover:scale-110 transition-transform' : ''
              } ${
                isOverridden
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-primary text-destructive-foreground hover:bg-primary'
              }`}
            >
              -{Math.round(activeDiscount)}%
              {customerDiscount > 0 && ` -${customerDiscount}%`}
            </Badge>
          )
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gold">{product.manufacturer}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug">{product.name}</h3>

        <p className={`mt-1 text-[10px] font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-destructive'}`}>
          {product.stock > 0 ? `${t.stockCount}: ${product.stock} ${t.pcs}` : t.outOfStock}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-3">
          <div>
            <p className={`text-lg font-bold tabular-nums ${isOverridden ? 'text-blue-600' : 'text-primary'}`}>
              {qty > 1 ? t.marginTotal : t.margin}: €{totalMargin.toFixed(2)}
            </p>
            {qty > 1 && (
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {t.marginPerPc}: €{unitMargin.toFixed(2)}
              </p>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground">
                {t.voc}: €{effectiveVoc.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t.moq}: €{product.price.toFixed(2)}
              </span>
            </div>
          </div>

          {qty === 0 ? (
            <Button
              size="sm"
              className="h-8 w-full gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
              onClick={handleAdd}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span className="text-xs">{isOutOfStock ? t.soldOut : t.addToCart}</span>
            </Button>
          ) : (
            <div className="flex w-full items-center justify-center gap-2 transition-all duration-200 animate-in fade-in">
              <button
                onClick={handleDecrement}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums">
                {qty}
              </span>
              <button
                onClick={handleIncrement}
                disabled={atMax}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                  atMax
                    ? 'border-muted bg-muted text-muted-foreground cursor-not-allowed'
                    : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
