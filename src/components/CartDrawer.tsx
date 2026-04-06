import { X, Minus, Plus, Trash2, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { translations } from '@/lib/i18n';
import { getActiveDiscount, getFinalVoc } from '@/lib/discount';
import { useState } from 'react';

export function CartDrawer() {
  const {
    lang, cart, cartOpen, setCartOpen, removeFromCart, updateQuantity,
    clearCart, brandDiscounts, productDiscounts, setBrandDiscount, removeBrandDiscount,
    setProductDiscount,
  } = useStore();
  const { isAdmin, profile } = useAuthContext();
  const t = translations[lang];
  const customerDiscount = profile?.base_discount ?? 0;

  const [discountBrand, setDiscountBrand] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');

  const cartBrands = [...new Set(cart.map((i) => i.product.manufacturer))].sort();

  const totalVOC = cart.reduce((sum, item) => {
    const { percent } = getActiveDiscount(item.product, productDiscounts, brandDiscounts);
    const voc = getFinalVoc(item.product.price, percent, customerDiscount);
    return sum + voc * item.quantity;
  }, 0);

  const totalMargin = cart.reduce((sum, item) => {
    const { percent } = getActiveDiscount(item.product, productDiscounts, brandDiscounts);
    const voc = getFinalVoc(item.product.price, percent, customerDiscount);
    return sum + (item.product.price - voc) * item.quantity;
  }, 0);

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-xl overflow-x-hidden">
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
              <div className="divide-y py-2" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                {cart.map((item) => {
                  const baseDiscount = item.product.price > 0
                    ? ((item.product.price - item.product.wholesale) / item.product.price) * 100
                    : 0;
                  const { percent: activePercent, source } = getActiveDiscount(item.product, productDiscounts, brandDiscounts);
                  const vocAfterDiscount = getFinalVoc(item.product.price, activePercent, customerDiscount);
                  const effectiveMargin = item.product.price - vocAfterDiscount;
                  const rowTotal = vocAfterDiscount * item.quantity;

                  const isOverridden = source === 'manual' || source === 'brand';

                  return (
                    <div key={item.product.id} className="flex flex-wrap gap-2 sm:gap-3 py-3 w-full">
                      <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
                        <img src={item.product.img} alt="" className="h-full w-full object-contain p-1 bg-white" />
                      </div>
                      <div className="flex flex-1 flex-col min-w-0">
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
                          {isOverridden && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground line-through">€{item.product.wholesale.toFixed(2)}</span>
                              <span className={`rounded px-1 py-0.5 text-[9px] font-semibold ${
                                source === 'manual' ? 'bg-blue-500/10 text-blue-600' : 'bg-blue-400/10 text-blue-500'
                              }`}>
                                {source === 'manual' ? 'Manual' : 'Brand'} -{Math.round(activePercent)}%
                              </span>
                              <span className="text-[10px] font-medium">→ €{vocAfterDiscount.toFixed(2)}</span>
                            </div>
                          )}
                          {customerDiscount > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-semibold text-primary bg-primary/10 rounded px-1 py-0.5">
                                Zákaznická sleva -{customerDiscount}%
                              </span>
                            </div>
                          )}
                          <p className={`text-xs font-bold tabular-nums ${isOverridden ? 'text-blue-600' : 'text-primary'}`}>
                            {item.quantity > 1 ? t.marginTotal : t.margin}: €{(effectiveMargin * item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-muted-foreground tabular-nums">
                              {t.marginPerPc}: €{effectiveMargin.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0 mr-0">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => removeFromCart(item.product.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        {isAdmin && (
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="%"
                            value={item.product.id in productDiscounts ? productDiscounts[item.product.id] : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setProductDiscount(item.product.id, undefined);
                              } else {
                                setProductDiscount(item.product.id, Math.min(100, Math.max(0, Number(val))));
                              }
                            }}
                            className={`w-12 h-6 text-[10px] px-1 text-center ${source === 'manual' ? 'border-blue-500 text-blue-600' : ''}`}
                          />
                        )}
                      </div>
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
                        className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 hover:bg-blue-500/20 transition-colors"
                      >
                        {d.brand} -{d.percent}% <X className="h-2.5 w-2.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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
