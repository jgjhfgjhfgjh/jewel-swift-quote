import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Store, CheckCircle2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { useShippingMethods } from '@/hooks/useShippingMethods';
import { getActiveDiscount, getFinalVoc } from '@/lib/discount';
import { checkoutText, EU_COUNTRIES } from '@/lib/i18n-checkout';
import { placeOrder, type OrderType, type Branding, type PlaceOrderResult } from '@/lib/orders';
import { toast } from 'sonner';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'type' | 'details' | 'summary' | 'done';

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const navigate = useNavigate();
  const { profile } = useAuthContext();
  const {
    lang, cart, clearCart,
    productDiscounts, brandDiscounts,
    salesCustomer, salesBrandDiscounts, salesProductDiscounts,
  } = useStore();
  const t = checkoutText[lang];
  const { methods } = useShippingMethods();

  const [step, setStep] = useState<Step>('type');
  const [orderType, setOrderType] = useState<OrderType>('dropship');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PlaceOrderResult | null>(null);

  // ship-to form
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('CZ');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [shippingMethodId, setShippingMethodId] = useState('');
  const [codEnabled, setCodEnabled] = useState(false);
  const [codAmount, setCodAmount] = useState('');
  const [externalRef, setExternalRef] = useState('');
  const [note, setNote] = useState('');
  const [branding, setBranding] = useState<Branding>('partner');

  const method = methods.find((m) => m.id === shippingMethodId);

  // Same pricing the CartDrawer shows — final prices are recomputed
  // server-side in place_order; this is display only.
  const effectiveProductDiscounts = salesCustomer ? salesProductDiscounts : productDiscounts;
  const effectiveBrandDiscounts = salesCustomer ? salesBrandDiscounts : brandDiscounts;
  const customerDiscount = salesCustomer ? salesCustomer.base_discount : (profile?.base_discount ?? 0);

  const itemsSubtotal = useMemo(() => cart.reduce((sum, item) => {
    const { percent } = getActiveDiscount(item.product, effectiveProductDiscounts, effectiveBrandDiscounts);
    return sum + getFinalVoc(item.product.price, percent, customerDiscount) * item.quantity;
  }, 0), [cart, effectiveProductDiscounts, effectiveBrandDiscounts, customerDiscount]);

  const resetAndClose = (openState: boolean) => {
    onOpenChange(openState);
    if (!openState) {
      setStep('type');
      setResult(null);
      setSubmitting(false);
    }
  };

  const detailsValid =
    name.trim() && street.trim() && city.trim() && zip.trim() && country &&
    shippingMethodId &&
    (orderType !== 'dropship' || phone.trim() || email.trim()) &&
    (!codEnabled || (Number(codAmount) > 0 && method?.cod_supported));

  const handleSubmit = async () => {
    if (cart.length === 0 || !detailsValid) return;
    setSubmitting(true);
    try {
      const res = await placeOrder({
        order_type: orderType,
        items: cart.map((i) => ({ produkt_id: i.product.id, quantity: i.quantity })),
        shipping_method_id: shippingMethodId,
        ship_to: {
          name: name.trim(),
          company: company.trim() || undefined,
          street: street.trim(),
          city: city.trim(),
          zip: zip.trim(),
          country,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
        },
        cod_amount: codEnabled && orderType === 'dropship' ? Number(codAmount) : undefined,
        external_ref: externalRef.trim() || undefined,
        branding: orderType === 'dropship' ? 'partner' : branding,
        note: note.trim() || undefined,
      });
      setResult(res);
      setStep('done');
      clearCart();
    } catch (e) {
      toast.error(`${t.errorGeneric}: ${e instanceof Error ? e.message : e}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{step === 'done' ? t.successHeading : t.title}</DialogTitle>
        </DialogHeader>

        {step === 'type' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t.typeHeading}</p>
            <button
              onClick={() => { setOrderType('dropship'); setStep('details'); }}
              className="flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:border-gold hover:bg-gold/5"
            >
              <Package className="mt-0.5 h-5 w-5 text-gold" />
              <span>
                <span className="block font-semibold">{t.typeDropship}</span>
                <span className="block text-xs text-muted-foreground">{t.typeDropshipDesc}</span>
              </span>
            </button>
            <button
              onClick={() => { setOrderType('wholesale'); setStep('details'); }}
              className="flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:border-gold hover:bg-gold/5"
            >
              <Store className="mt-0.5 h-5 w-5 text-gold" />
              <span>
                <span className="block font-semibold">{t.typeWholesale}</span>
                <span className="block text-xs text-muted-foreground">{t.typeWholesaleDesc}</span>
              </span>
            </button>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold">
                {orderType === 'dropship' ? t.endCustomerHeading : t.shipToHeading}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <Label className="text-xs">{t.name} *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">{t.company}</Label>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} className="h-8" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">{t.street} *</Label>
                  <Input value={street} onChange={(e) => setStreet(e.target.value)} className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">{t.city} *</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">{t.zip} *</Label>
                  <Input value={zip} onChange={(e) => setZip(e.target.value)} className="h-8" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">{t.country} *</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EU_COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code} className="text-sm">{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{t.phone}{orderType === 'dropship' ? ' *' : ''}</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">{t.email}{orderType === 'dropship' ? ' *' : ''}</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-8" />
                </div>
              </div>
              {orderType === 'dropship' && (
                <p className="mt-1 text-[11px] text-muted-foreground">{t.contactHint}</p>
              )}
            </div>

            <div>
              <Label className="text-xs">{t.shippingMethod} *</Label>
              <Select value={shippingMethodId} onValueChange={(v) => { setShippingMethodId(v); setCodEnabled(false); }}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {methods.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-sm">
                      {m.name} — €{Number(m.price_eur).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {orderType === 'dropship' && (
              <>
                <div className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{t.codLabel}</Label>
                    <Switch
                      checked={codEnabled}
                      disabled={!method?.cod_supported}
                      onCheckedChange={setCodEnabled}
                    />
                  </div>
                  {method && !method.cod_supported && (
                    <p className="mt-1 text-[11px] text-muted-foreground">{t.codNotSupported}</p>
                  )}
                  {codEnabled && (
                    <div className="mt-2">
                      <Label className="text-xs">{t.codAmount} *</Label>
                      <Input
                        type="number" min="0" step="0.01"
                        value={codAmount}
                        onChange={(e) => setCodAmount(e.target.value)}
                        className="h-8"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs">{t.externalRef}</Label>
                  <Input value={externalRef} onChange={(e) => setExternalRef(e.target.value)} className="h-8" placeholder="ESHOP-1234" />
                  <p className="mt-1 text-[11px] text-muted-foreground">{t.externalRefHint}</p>
                </div>
              </>
            )}

            {orderType === 'wholesale' && (
              <div>
                <Label className="text-xs">{t.brandingLabel}</Label>
                <Select value={branding} onValueChange={(v) => setBranding(v as Branding)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neutral" className="text-sm">{t.brandingNeutral}</SelectItem>
                    <SelectItem value="swelt" className="text-sm">{t.brandingSwelt}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-xs">{t.note}</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="text-sm" />
            </div>

            <div className="flex justify-between pt-1">
              <Button variant="ghost" size="sm" onClick={() => setStep('type')}>{t.back}</Button>
              <Button
                size="sm"
                disabled={!detailsValid}
                onClick={() => setStep('summary')}
                className="bg-gold text-accent-foreground hover:bg-gold/90"
              >
                {t.next}
              </Button>
            </div>
          </div>
        )}

        {step === 'summary' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t.summaryHeading}</h3>
            <div className="rounded-md border divide-y">
              {cart.map((item) => {
                const { percent } = getActiveDiscount(item.product, effectiveProductDiscounts, effectiveBrandDiscounts);
                const unit = getFinalVoc(item.product.price, percent, customerDiscount);
                return (
                  <div key={item.product.id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="truncate pr-2">{item.quantity}× {item.product.name}</span>
                    <span className="tabular-nums font-medium">€{(unit * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between px-3 py-2 text-sm">
                <span>{t.shipping} — {method?.name}</span>
                <span className="tabular-nums">€{Number(method?.price_eur ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 font-semibold">
                <span>{t.subtotal}</span>
                <span className="tabular-nums">€{(itemsSubtotal + Number(method?.price_eur ?? 0)).toFixed(2)}</span>
              </div>
            </div>
            {codEnabled && Number(codAmount) > 0 && (
              <p className="text-xs text-muted-foreground">{t.codLabel}: €{Number(codAmount).toFixed(2)}</p>
            )}
            <p className="text-[11px] text-muted-foreground">{t.vatNote}</p>
            <div className="flex justify-between pt-1">
              <Button variant="ghost" size="sm" onClick={() => setStep('details')} disabled={submitting}>{t.back}</Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
                className="bg-gold text-accent-foreground hover:bg-gold/90 font-semibold"
              >
                {submitting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                {t.submit}
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && result && (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">{t.successOrderNumber}</p>
              <p className="font-display text-2xl font-bold">{result.order_number}</p>
            </div>
            <p className="text-sm">
              {result.status === 'awaiting_payment' ? t.awaitingPaymentInfo : t.forwardedInfo}
            </p>
            <p className="text-sm font-semibold">
              {t.totalInclVat}: €{Number(result.total).toFixed(2)}
              {result.vat_rate > 0 && (
                <span className="font-normal text-muted-foreground"> (DPH {result.vat_rate} %: €{Number(result.vat_amount).toFixed(2)})</span>
              )}
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => resetAndClose(false)}>{t.close}</Button>
              <Button
                size="sm"
                className="bg-gold text-accent-foreground hover:bg-gold/90"
                onClick={() => { resetAndClose(false); navigate('/orders'); }}
              >
                {t.viewOrders}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
