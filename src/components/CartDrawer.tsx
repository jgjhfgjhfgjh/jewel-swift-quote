import { X, Minus, Plus, Trash2, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { useState } from 'react';

/**
 * Discount hierarchy (replacement, NOT additive):
 * 1. Manual individual discount (highest priority)
 * 2. Admin brand discount
 * 3. Base feed discount (lowest / default)
 */
function getActiveDiscount(
  item: { product: { price: number; wholesale: number; manufacturer: string }; discountPercent: number; manualDiscountPercent?: number },
  brandDiscounts: { brand: string; percent: number }[]
): { percent: number; source: 'manual' | 'brand' | 'feed' } {
  const baseDiscount = item.product.price > 0
    ? ((item.product.price - item.product.wholesale) / item.product.price) * 100
    : 0;

  // Priority 1: Manual individual override
  if (item.manualDiscountPercent !== undefined) {
    return { percent: item.manualDiscountPercent, source: 'manual' };
  }

  // Priority 2: Admin brand discount
  const brandDiscount = brandDiscounts.find((d) => d.brand === item.product.manufacturer);
  if (brandDiscount) {
    return { percent: brandDiscount.percent, source: 'brand' };
  }

  // Priority 3: Base feed discount
  return { percent: baseDiscount, source: 'feed' };
}

export function CartDrawer() {
  const {
    lang, cart, cartOpen, setCartOpen, removeFromCart, updateQuantity,
    clearCart, isAdmin, brandDiscounts, setBrandDiscount, removeBrandDiscount,
    setItemDiscount,
  } = useStore();
  const t = translations[lang];

  const [discountBrand, setDiscountBrand] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');

  const cartBrands = [...new Set(cart.map((i) => i.product.manufacturer))].sort();

  const totalVOC = cart.reduce((sum, item) => {
    const { percent } = getActiveDiscount(item, brandDiscounts);
    const voc = item.product.price * (1 - percent / 100);
    return sum + voc * item.quantity;
  }, 0);

  const totalMargin = cart.reduce((sum, item) => {
    const { percent } = getActiveDiscount(item, brandDiscounts);
    const voc = item.product.price * (1 - percent / 100);
    return sum + (item.product.price - voc) * item.quantity;
  }, 0);

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-display text-lg font-semibold">{t.cart}</h2>
          <div className="flex gap-2">
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-xs text-destructive">
                {t.clearCart}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setCartOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">{t.emptyCart}</div>
        ) : (
          <>
            <ScrollArea className="flex-1 scrollbar-thin">
              <div className="divide-y px-3 sm:px-4 py-2">
                {cart.map((item) => {
                  const baseDiscount = item.product.price > 0
                    ? ((item.product.price - item.product.wholesale) / item.product.price) * 100
                    : 0;
                  const { percent: activePercent, source } = getActiveDiscount(item, brandDiscounts);
                  const vocAfterDiscount = item.product.price * (1 - activePercent / 100);
                  const effectiveMargin = item.product.price - vocAfterDiscount;
                  const rowTotal = vocAfterDiscount * item.quantity;

                  const isOverridden = source === 'manual' || source === 'brand';

                  return (
                    <div key={item.product.id} className="flex flex-wrap gap-2 sm:gap-3 py-3">
                      {/* Image */}
                      <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
                        <img src={item.product.img} alt="" className="h-full w-full object-contain p-1 bg-white" />
                      </div>
                      {/* Info */}
                      <div className="flex flex-1 flex-col min-w-0" style={{ minWidth: '120px' }}>
                        <p className="text-[10px] uppercase tracking-wider text-gold">{item.product.manufacturer}</p>
                        <p className="truncate text-sm font-medium">{item.product.name}</p>
                        <div className="mt-1 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-muted-foreground">{t.moq}: €{item.product.price.toFixed(2)}</span>
                            <span className="text-[10px] text-muted-foreground">{t.voc}: €{item.product.wholesale.toFixed(2)}</span>
                            {baseDiscount > 0 && (
                              <span className="rounded bg-destructive/10 px-1 py-0.5 text-[9px] font-semibold text-destructive">
                                -{Math.round(baseDiscount)}%
                              </span>
                            )}
                          </div>
                          {/* Only show override line if discount differs from feed */}
                          {isOverridden && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground line-through">€{item.product.wholesale.toFixed(2)}</span>
                              <span className={`rounded px-1 py-0.5 text-[9px] font-semibold ${
                                source === 'manual' ? 'bg-blue-500/10 text-blue-600' : 'bg-primary/10 text-primary'
                              }`}>
                                {source === 'manual' ? 'Manual' : 'Admin'} -{Math.round(activePercent)}%
                              </span>
                              <span className="text-[10px] font-medium">→ €{vocAfterDiscount.toFixed(2)}</span>
                            </div>
                          )}
                          <p className={`text-xs font-bold tabular-nums ${source === 'manual' ? 'text-blue-600' : 'text-primary'}`}>
                            {item.quantity > 1 ? t.marginTotal : t.margin}: €{(effectiveMargin * item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-muted-foreground tabular-nums">
                              {t.marginPerPc}: €{effectiveMargin.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Delete + Admin inline discount */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => removeFromCart(item.product.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        {isAdmin && (
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="%"
                            value={item.manualDiscountPercent !== undefined ? item.manualDiscountPercent : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setItemDiscount(item.product.id, undefined);
                              } else {
                                setItemDiscount(item.product.id, Math.min(100, Math.max(0, Number(val))));
                              }
                            }}
                            className={`w-14 h-6 text-[10px] px-1 text-center ${source === 'manual' ? 'border-blue-500 text-blue-600' : ''}`}
                          />
                        )}
                      </div>
                      {/* Quantity + Subtotal row */}
                      <div className="flex w-full items-center justify-between gap-2 pl-0 sm:pl-[calc(3.5rem+0.75rem)]">
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-6 w-6" disabled={item.quantity >= item.product.stock} onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold tabular-nums">€{vocAfterDiscount.toFixed(2)}<span className="text-[10px] font-normal text-muted-foreground">/{t.pcs}</span></p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-muted-foreground tabular-nums">{item.quantity}× = €{rowTotal.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Admin Discount Panel */}
            {isAdmin && cartBrands.length > 0 && (
              <div className="border-t bg-muted/50 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Percent className="h-4 w-4 text-gold" />
                  {t.discountPanel}
                </h3>
                <div className="flex gap-2">
                  <Select value={discountBrand} onValueChange={setDiscountBrand}>
                    <SelectTrigger className="flex-1 h-8 text-xs">
                      <SelectValue placeholder={t.brands} />
                    </SelectTrigger>
                    <SelectContent>
                      {cartBrands.map((b) => (
                        <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="%"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-16 h-8 text-xs"
                  />
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    disabled={!discountBrand || !discountPercent}
                    onClick={() => {
                      if (discountBrand && discountPercent) {
                        setBrandDiscount(discountBrand, Number(discountPercent));
                        setDiscountPercent('');
                      }
                    }}
                  >
                    {t.applyDiscount}
                  </Button>
                </div>
                {brandDiscounts.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {brandDiscounts.map((d) => (
                      <button
                        key={d.brand}
                        onClick={() => removeBrandDiscount(d.brand)}
                        className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors"
                      >
                        {d.brand} -{d.percent}% <X className="h-2.5 w-2.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Total */}
            <div className="border-t p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{t.total} ({t.voc})</span>
                <span className="text-lg font-bold tabular-nums">€{totalVOC.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{t.margin}</span>
                <span className="text-sm font-semibold tabular-nums text-primary">€{totalMargin.toFixed(2)}</span>
              </div>
              <Button className="w-full bg-gold text-accent-foreground hover:bg-gold/90 font-semibold">
                {t.generateQuote}
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
