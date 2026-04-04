import { X, Minus, Plus, Trash2, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { useState } from 'react';

export function CartDrawer() {
  const {
    lang, cart, cartOpen, setCartOpen, removeFromCart, updateQuantity,
    clearCart, isAdmin, brandDiscounts, setBrandDiscount, removeBrandDiscount,
  } = useStore();
  const t = translations[lang];

  const [discountBrand, setDiscountBrand] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');

  const cartBrands = [...new Set(cart.map((i) => i.product.manufacturer))].sort();

  const subtotal = cart.reduce((sum, item) => {
    const discounted = item.product.price * (1 - item.discountPercent / 100);
    return sum + discounted * item.quantity;
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
              <div className="divide-y p-4">
                {cart.map((item) => {
                  const discounted = item.product.price * (1 - item.discountPercent / 100);
                  return (
                    <div key={item.product.id} className="flex gap-3 py-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
                        <img src={item.product.img} alt="" className="h-full w-full object-contain p-1" />
                      </div>
                      <div className="flex flex-1 flex-col min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-gold">{item.product.manufacturer}</p>
                        <p className="truncate text-sm font-medium">{item.product.name}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            {item.discountPercent > 0 && (
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="text-xs text-muted-foreground line-through tabular-nums">€{item.product.price.toFixed(2)}</span>
                                <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">-{item.discountPercent}%</span>
                              </div>
                            )}
                            <p className="text-sm font-bold tabular-nums">€{discounted.toFixed(2)}<span className="text-[10px] font-normal text-muted-foreground">/ks</span></p>
                            {item.quantity > 1 && (
                              <p className="text-[10px] text-muted-foreground tabular-nums">{item.quantity}× = €{(discounted * item.quantity).toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 self-start text-muted-foreground" onClick={() => removeFromCart(item.product.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
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
                {brandDiscounts.map((d: { brand: string; percent: number }) => (
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
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-lg font-semibold">{t.total}</span>
                <span className="text-xl font-bold tabular-nums">€{subtotal.toFixed(2)}</span>
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
