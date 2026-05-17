import { useEffect } from 'react';
import { X, Send, ShoppingBag, Truck, CreditCard, ListOrdered, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { dealsI18n, fillTemplate } from '@/lib/i18n-deals';
import { dealProgress, wholesaleForTierIndex, type Deal, type DealProduct } from '@/lib/deals';
import { DealProductCard } from './DealProductCard';
import { MinOrderProgress } from './MinOrderProgress';

function money(currency: string, value: number): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency + ' ';
  return `${symbol}${value.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Full-page order cart for a deal — slides up from the bottom.
 * Shows the picked products as full catalog-style cards, the live discount
 * panel, the purchase terms and the order totals.
 */
export function DealCartDrawer({
  deal,
  products,
  open,
  onClose,
  tierIndex,
  canSeePrices,
  onSubmit,
  submitDisabled,
  onSet,
  onBrandClick,
  onOpenDetail,
}: {
  deal: Deal;
  products: DealProduct[];
  open: boolean;
  onClose: () => void;
  tierIndex: number;
  canSeePrices: boolean;
  onSubmit: () => void;
  submitDisabled: boolean;
  onSet: (productId: string, qty: number) => void;
  onBrandClick: (brand: string) => void;
  onOpenDetail: (p: DealProduct) => void;
}) {
  const lang = useStore((s) => s.lang);
  const { dealCart, clearDealCart } = useStore();
  const t = dealsI18n[lang];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const cart = dealCart[deal.id] || {};
  const lines = products.filter((p) => cart[p.id] > 0);
  const totalQty = lines.reduce((s, p) => s + cart[p.id], 0);
  const prog = dealProgress(totalQty, deal.tiers);

  let value = 0, retail = 0;
  for (const p of lines) {
    const q = cart[p.id];
    value += q * wholesaleForTierIndex(p, tierIndex);
    retail += q * p.retail_price;
  }
  const margin = retail - value;

  return (
    <div className="fixed inset-0 z-[14000] flex flex-col">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col bg-slate-50 animate-in slide-in-from-bottom duration-300">
        {/* header */}
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
          <ShoppingBag className="h-5 w-5 text-slate-700" />
          <h2 className="font-display text-lg font-black text-slate-900">{t.cart.title}</h2>
          {totalQty > 0 && (
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-bold text-white tabular-nums">
              {totalQty} {t.progress.pcs}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {lines.length > 0 && (
              <button
                onClick={() => clearDealCart(deal.id)}
                className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" /> {t.cart.clear}
              </button>
            )}
            <button
              onClick={onClose}
              aria-label={t.modal.close}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* body */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-5 py-6">
            {/* live discount panel */}
            <MinOrderProgress tiers={deal.tiers} qty={totalQty} className="mb-6" />

            {lines.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-24 text-center text-slate-400">
                {t.cart.empty}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {lines.map((p) => (
                  <DealProductCard
                    key={p.id}
                    product={p}
                    tierIndex={tierIndex}
                    tiers={deal.tiers}
                    currency={deal.currency}
                    qty={cart[p.id]}
                    canSeePrices={canSeePrices}
                    closed={false}
                    onAdd={() => onSet(p.id, cart[p.id] + 1)}
                    onSet={(q) => onSet(p.id, q)}
                    onBrandClick={(b) => { onClose(); onBrandClick(b); }}
                    onOpenDetail={() => onOpenDetail(p)}
                  />
                ))}
              </div>
            )}

            {/* purchase terms */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 font-display text-base font-black text-slate-900">{t.conditions.heading}</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Truck, text: `${deal.delivery_weeks_min}–${deal.delivery_weeks_max} ${lang === 'cs' ? 'týdnů na dodání' : 'weeks delivery'}` },
                  { icon: CreditCard, text: lang === 'cs' ? `Záloha ${deal.deposit_percent} % bankovním převodem` : `${deal.deposit_percent} % deposit by bank transfer` },
                  { icon: ListOrdered, text: t.conditions.items[4].desc },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-2 text-xs text-slate-600">
                    <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              {deal.payment_terms && (
                <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500">
                  {deal.payment_terms}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* footer totals */}
        <footer className="shrink-0 border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-5 py-3">
            <Total label={t.orderBar.items} value={`${totalQty} ${t.progress.pcs}`} />
            <Total label={t.cart.total} value={canSeePrices ? money(deal.currency, value) : '—'} />
            <Total label={t.orderBar.margin} value={canSeePrices ? money(deal.currency, margin) : '—'} accent />
            <Total
              label={t.orderBar.discount}
              value={prog.minimumReached ? `${prog.effectiveTier.discount_percent} %` : '—'}
            />
            <Button
              size="lg"
              disabled={submitDisabled}
              onClick={onSubmit}
              className="ml-auto gap-2 bg-red-600 hover:bg-red-700"
            >
              <Send className="h-4 w-4" />
              {prog.minimumReached
                ? t.cart.submit
                : fillTemplate(t.orderBar.submitLocked, { n: prog.remainingToNext })}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Total({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`font-display text-base font-black tabular-nums ${accent ? 'text-emerald-600' : 'text-slate-900'}`}>
        {value}
      </div>
    </div>
  );
}
