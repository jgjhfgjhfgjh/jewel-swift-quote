import { X, Minus, Plus, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/lib/store';
import { dealsI18n } from '@/lib/i18n-deals';
import { wholesaleForTierIndex, type Deal, type DealProduct } from '@/lib/deals';

function fmt(currency: string, value: number): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency + ' ';
  return `${symbol}${value.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Interactive order cart for a single deal. */
export function DealCartDrawer({
  deal,
  products,
  open,
  onClose,
  tierIndex,
  onSubmit,
  submitDisabled,
}: {
  deal: Deal;
  products: DealProduct[];
  open: boolean;
  onClose: () => void;
  tierIndex: number;
  onSubmit: () => void;
  submitDisabled: boolean;
}) {
  const lang = useStore((s) => s.lang);
  const { dealCart, setDealItemQty, removeDealItem, clearDealCart } = useStore();
  const t = dealsI18n[lang];

  if (!open) return null;

  const cart = dealCart[deal.id] || {};
  const lines = products
    .filter((p) => cart[p.id] > 0)
    .map((p) => {
      const qty = cart[p.id];
      const unit = wholesaleForTierIndex(p, tierIndex);
      return { p, qty, unit, rowValue: unit * qty, rowMargin: (p.retail_price - unit) * qty };
    });
  const totalQty = lines.reduce((s, l) => s + l.qty, 0);
  const totalValue = lines.reduce((s, l) => s + l.rowValue, 0);
  const totalMargin = lines.reduce((s, l) => s + l.rowMargin, 0);

  return (
    <div className="fixed inset-0 z-[14000]">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="font-display text-lg font-black text-slate-900">{t.cart.title}</h2>
          <div className="flex gap-1">
            {lines.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => clearDealCart(deal.id)}
                className="text-xs text-red-500 hover:text-red-600">
                {t.cart.clear}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-8 text-center text-sm text-slate-400">
            {t.cart.empty}
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="divide-y divide-slate-100 px-3 py-2">
                {lines.map(({ p, qty, unit, rowValue }) => (
                  <div key={p.id} className="flex gap-3 py-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                      {p.image_url
                        ? <img src={p.image_url} alt="" className="h-full w-full object-contain p-1" />
                        : <div className="flex h-full items-center justify-center text-[9px] text-slate-300">{p.brand}</div>}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{p.brand}</span>
                      <span className="truncate text-sm font-semibold text-slate-800">
                        {[p.collection, p.sku].filter(Boolean).join(' · ')}
                      </span>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setDealItemQty(deal.id, p.id, qty - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 hover:bg-slate-900 hover:text-white"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold tabular-nums">{qty}</span>
                          <button
                            onClick={() => setDealItemQty(deal.id, p.id, Math.min(p.available, qty + 1))}
                            disabled={qty >= p.available}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 hover:bg-slate-900 hover:text-white disabled:opacity-40"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black tabular-nums text-slate-900">{fmt(deal.currency, rowValue)}</div>
                          <div className="text-[10px] text-slate-400 tabular-nums">{fmt(deal.currency, unit)} / {t.progress.pcs}</div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeDealItem(deal.id, p.id)}
                      title={t.cart.remove}
                      className="self-start text-slate-300 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-slate-200 p-4">
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-slate-500">{t.orderBar.items}</span>
                <span className="font-semibold tabular-nums">{totalQty} {t.progress.pcs}</span>
              </div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-slate-500">{t.cart.total}</span>
                <span className="font-display text-lg font-black tabular-nums">{fmt(deal.currency, totalValue)}</span>
              </div>
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-slate-500">{t.orderBar.margin}</span>
                <span className="font-semibold tabular-nums text-emerald-600">{fmt(deal.currency, totalMargin)}</span>
              </div>
              <Button
                onClick={onSubmit}
                disabled={submitDisabled}
                className="w-full gap-2 bg-red-600 hover:bg-red-700"
              >
                <Send className="h-4 w-4" /> {t.cart.submit}
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
