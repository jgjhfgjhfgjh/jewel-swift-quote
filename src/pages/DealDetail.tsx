import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search, Send, AlertCircle, Truck, CreditCard, ListOrdered, Loader2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { dealsI18n, fillTemplate } from '@/lib/i18n-deals';
import { useDeal } from '@/hooks/useDeals';
import {
  activeTierIndex, wholesaleForTierIndex, dealProgress, dealIsLive,
} from '@/lib/deals';
import { DealProductCard } from '@/components/deals/DealProductCard';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
import { MinOrderProgress } from '@/components/deals/MinOrderProgress';

function money(currency: string, value: number): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency + ' ';
  return `${symbol}${value.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DealDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const lang = useStore((s) => s.lang);
  const d = dealsI18n[lang];
  const { deal, products, loading, error } = useDeal(slug);
  const { user, isLead } = useAuthContext();
  const { dealCart, setDealItemQty, addDealItem, clearDealCart } = useStore();

  const [brandFilter, setBrandFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  const cart = (deal && dealCart[deal.id]) || {};
  const totalQty = useMemo(
    () => Object.values(cart).reduce((s, q) => s + q, 0),
    [cart],
  );

  const tierIndex = deal ? activeTierIndex(totalQty, deal.tiers) : -1;
  const prog = deal ? dealProgress(totalQty, deal.tiers) : null;
  const canSeePrices = !!user && !isLead;
  const closed = deal ? !dealIsLive(deal) : false;

  // order totals
  const totals = useMemo(() => {
    let value = 0, retail = 0;
    for (const p of products) {
      const q = cart[p.id] ?? 0;
      if (!q) continue;
      value += q * wholesaleForTierIndex(p, tierIndex);
      retail += q * p.retail_price;
    }
    return { value, retail, margin: retail - value };
  }, [products, cart, tierIndex]);

  // filtering
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (brandFilter && p.brand !== brandFilter) return false;
      if (!q) return true;
      return [p.sku, p.ean, p.collection, p.brand, p.attr_movement]
        .some((f) => f && f.toLowerCase().includes(q));
    });
  }, [products, brandFilter, search]);

  const handleSubmit = () => {
    if (!deal || totalQty === 0) return;
    const lines = products
      .filter((p) => cart[p.id])
      .map((p) => `${cart[p.id]}× ${p.brand} ${p.sku}`);
    console.log('[deal enquiry]', deal.slug, { totalQty, totals, lines });
    toast.success(d.orderBar.submit, {
      description: `${deal.title} — ${totalQty} ${d.progress.pcs}, ${money(deal.currency, totals.value)}`,
    });
    clearDealCart(deal.id);
  };

  // ── loading / error ─────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-40 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }
  if (error || !deal) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <BackButton />
        <div className="mx-auto max-w-md px-6 py-40 text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-slate-300" />
          <p className="text-slate-500">{error ?? 'Nabídka nenalezena.'}</p>
          <Button className="mt-6" onClick={() => navigate('/deals')}>{d.detail.backToDeals}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans">
      <Navbar />
      <BackButton />

      {/* ── Hero ── */}
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
          {deal.supplier && (
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {d.detail.supplier}: {deal.supplier}
            </div>
          )}
          <h1 className="mt-2 font-display text-3xl font-black text-white sm:text-5xl">{deal.title}</h1>
          {deal.subtitle && <p className="mt-3 max-w-2xl text-slate-300">{deal.subtitle}</p>}
          {deal.brands.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {deal.brands.map((b) => (
                <span key={b} className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* ── Catalog column ── */}
          <div className="order-2 lg:order-1">
            {/* filter bar */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={d.detail.searchPlaceholder}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="">{d.detail.filterAll}</option>
                {deal.brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="mb-3 text-xs text-slate-400">
              {filtered.length} / {products.length}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-400">
                {d.detail.noMatch}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {filtered.map((p) => (
                  <DealProductCard
                    key={p.id}
                    product={p}
                    tierIndex={tierIndex}
                    tiers={deal.tiers}
                    currency={deal.currency}
                    qty={cart[p.id] ?? 0}
                    canSeePrices={canSeePrices}
                    closed={closed}
                    onAdd={() => addDealItem(deal.id, p.id)}
                    onSet={(q) => setDealItemQty(deal.id, p.id, Math.min(q, p.available))}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── FOMO sidebar ── */}
          <aside className="order-1 lg:order-2">
            <div className="space-y-4 lg:sticky lg:top-28">
              {closed ? (
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-500">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {d.detail.closedNotice}
                </div>
              ) : (
                <CountdownTimer deadline={deal.deadline} variant="full" />
              )}

              <MinOrderProgress tiers={deal.tiers} qty={totalQty} />

              {/* deal conditions recap */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-slate-800">{d.conditions.heading}</h3>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex gap-2">
                    <Truck className="h-4 w-4 shrink-0 text-slate-400" />
                    {deal.delivery_weeks_min}–{deal.delivery_weeks_max} {lang === 'cs' ? 'týdnů na dodání' : 'weeks delivery'}
                  </li>
                  <li className="flex gap-2">
                    <CreditCard className="h-4 w-4 shrink-0 text-slate-400" />
                    {lang === 'cs'
                      ? `Záloha ${deal.deposit_percent} % bankovním převodem`
                      : `${deal.deposit_percent} % deposit by bank transfer`}
                  </li>
                  <li className="flex gap-2">
                    <ListOrdered className="h-4 w-4 shrink-0 text-slate-400" />
                    {d.conditions.items[4].desc}
                  </li>
                </ul>
                {deal.payment_terms && (
                  <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
                    {deal.payment_terms}
                  </p>
                )}
              </div>

              {!user && (
                <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
                  {d.detail.loginToOrder}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ── Sticky order bar ── */}
      {canSeePrices && !closed && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
            <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-1">
              <Stat label={d.orderBar.items} value={`${totalQty} ${d.progress.pcs}`} />
              <Stat label={d.orderBar.value} value={money(deal.currency, totals.value)} />
              <Stat label={d.orderBar.margin} value={money(deal.currency, totals.margin)} accent />
              <Stat
                label={d.orderBar.discount}
                value={prog?.minimumReached ? `${prog.effectiveTier.discount_percent} %` : '—'}
              />
            </div>
            <Button
              size="lg"
              disabled={!prog?.minimumReached}
              onClick={handleSubmit}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">
                {prog?.minimumReached
                  ? d.orderBar.submit
                  : fillTemplate(d.orderBar.submitLocked, { n: prog?.remainingToNext ?? 0 })}
              </span>
              <span className="sm:hidden">{d.orderBar.submit}</span>
            </Button>
          </div>
        </div>
      )}

      <ScrollToTopButton />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`font-display text-base font-black tabular-nums ${accent ? 'text-emerald-600' : 'text-slate-900'}`}>
        {value}
      </div>
    </div>
  );
}
