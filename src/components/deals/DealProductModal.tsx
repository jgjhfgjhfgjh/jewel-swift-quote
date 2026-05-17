import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { dealsI18n, fillTemplate } from '@/lib/i18n-deals';
import { sortedTiers, wholesaleForTierIndex, type DealProduct, type DealTier } from '@/lib/deals';

function fmt(currency: string, value: number): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency + ' ';
  return `${symbol}${value.toFixed(2)}`;
}

/** Full detail of a single deal product. */
export function DealProductModal({
  product,
  tiers,
  currency,
  canSeePrices,
  onClose,
}: {
  product: DealProduct | null;
  tiers: DealTier[];
  currency: string;
  canSeePrices: boolean;
  onClose: () => void;
}) {
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang];

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [product, onClose]);

  if (!product || typeof document === 'undefined') return null;

  const title = [product.collection, product.sku].filter(Boolean).join(' · ');
  const st = sortedTiers(tiers);
  const attrs = [
    [t.filters.gender, product.gender],
    [t.filters.type, product.attr_movement],
    [t.filters.material, product.attr_material],
    [t.filters.size, product.attr_size],
    [t.modal.ean, product.ean],
  ].filter(([, v]) => v);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[15000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label={t.modal.close}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-0 overflow-y-auto sm:grid-cols-2">
          {/* image */}
          <div className="flex aspect-square items-center justify-center bg-slate-50 p-6">
            {product.image_url ? (
              <img src={product.image_url} alt={title} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-sm font-semibold text-slate-300">{product.brand}</span>
            )}
          </div>

          {/* info */}
          <div className="flex flex-col p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{product.brand}</span>
            <h2 className="mt-1 font-sans text-xl font-bold text-slate-900">{title || product.sku}</h2>

            <dl className="mt-4 space-y-1.5 text-sm">
              {attrs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-slate-400">{k}</dt>
                  <dd className="text-right font-medium text-slate-700">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">{t.modal.availability}</dt>
                <dd className={`text-right font-semibold ${product.available > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {product.available > 0 ? `${product.available} ${t.progress.pcs}` : t.product.soldOut}
                </dd>
              </div>
            </dl>

            {canSeePrices && (
              <div className="mt-5 rounded-xl border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{t.modal.priceTiers}</span>
                  <span className="text-xs text-slate-400 line-through">
                    {t.product.moc} {fmt(currency, product.retail_price)}
                  </span>
                </div>
                <div className="space-y-1">
                  {st.map((tier, i) => (
                    <div key={tier.min_qty} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        {fillTemplate(t.modal.tier, { qty: tier.min_qty })}
                        <span className="ml-1 text-[11px] font-semibold text-red-500">−{tier.discount_percent}%</span>
                      </span>
                      <span className="font-sans font-bold tabular-nums text-slate-900">
                        {fmt(currency, wholesaleForTierIndex(product, i))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
