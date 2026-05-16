import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search, Send, AlertCircle, Truck, CreditCard, ListOrdered, Loader2,
  ShoppingCart, X,
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
  activeTierIndex, wholesaleForTierIndex, dealProgress, dealIsLive, type DealProduct,
} from '@/lib/deals';
import { DealProductCard } from '@/components/deals/DealProductCard';
import { DealProductModal } from '@/components/deals/DealProductModal';
import { DealCartDrawer } from '@/components/deals/DealCartDrawer';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
import { MinOrderProgress } from '@/components/deals/MinOrderProgress';

function money(currency: string, value: number): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency + ' ';
  return `${symbol}${value.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Catalog filters mapped to deal_products fields.
const FILTER_DEFS = [
  { key: 'brand', field: 'brand' },
  { key: 'gender', field: 'gender' },
  { key: 'collection', field: 'collection' },
  { key: 'type', field: 'attr_movement' },
  { key: 'material', field: 'attr_material' },
  { key: 'size', field: 'attr_size' },
] as const;

type FilterKey = (typeof FILTER_DEFS)[number]['key'];

export default function DealDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const lang = useStore((s) => s.lang);
  const d = dealsI18n[lang];
  const { deal, products, loading, error } = useDeal(slug);
  const { user, isLead } = useAuthContext();
  const { dealCart, setDealItemQty, addDealItem, clearDealCart } = useStore();

  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    brand: '', gender: '', collection: '', type: '', material: '', size: '',
  });
  const [search, setSearch] = useState('');
  const [detailProduct, setDetailProduct] = useState<DealProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [barHidden, setBarHidden] = useState(false);
  const lastScrollRef = useRef(0);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  // Hide the filter bar on scroll-down, reveal on scroll-up — like the navbar.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setBarHidden(y > lastScrollRef.current && y > 140);
      lastScrollRef.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cart = (deal && dealCart[deal.id]) || {};
  const totalQty = useMemo(() => Object.values(cart).reduce((s, q) => s + q, 0), [cart]);

  const tierIndex = deal ? activeTierIndex(totalQty, deal.tiers) : -1;
  const prog = deal ? dealProgress(totalQty, deal.tiers) : null;
  const canSeePrices = !!user && !isLead;
  const closed = deal ? !dealIsLive(deal) : false;

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

  // available options per filter (only fields that actually vary)
  const filterOptions = useMemo(() => {
    const out = {} as Record<FilterKey, string[]>;
    for (const def of FILTER_DEFS) {
      out[def.key] = [...new Set(products.map((p) => p[def.field]).filter(Boolean))].sort();
    }
    return out;
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      for (const def of FILTER_DEFS) {
        const v = filters[def.key];
        if (v && p[def.field] !== v) return false;
      }
      if (!q) return true;
      return [p.sku, p.ean, p.collection, p.brand, p.attr_movement]
        .some((f) => f && f.toLowerCase().includes(q));
    });
  }, [products, filters, search]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (search.trim() ? 1 : 0);

  const setFilter = (key: FilterKey, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));
  const clearFilters = () => {
    setFilters({ brand: '', gender: '', collection: '', type: '', material: '', size: '' });
    setSearch('');
  };
  const handleBrandClick = (brand: string) => {
    setFilters((f) => ({ ...f, brand }));
    document.getElementById('deal-catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = () => {
    if (!deal || totalQty === 0) return;
    const lines = products.filter((p) => cart[p.id]).map((p) => `${cart[p.id]}× ${p.brand} ${p.sku}`);
    console.log('[deal enquiry]', deal.slug, { totalQty, totals, lines });
    toast.success(d.orderBar.submit, {
      description: `${deal.title} — ${totalQty} ${d.progress.pcs}, ${money(deal.currency, totals.value)}`,
    });
    clearDealCart(deal.id);
    setCartOpen(false);
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
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-24 sm:pb-12 sm:pt-32">
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

      {/* ── FOMO block ── */}
      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-4 lg:grid-cols-2">
          {closed ? (
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-500">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {d.detail.closedNotice}
            </div>
          ) : (
            <CountdownTimer deadline={deal.deadline} variant="full" />
          )}
          <MinOrderProgress tiers={deal.tiers} qty={totalQty} />
        </div>
        {!user && (
          <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
            {d.detail.loginToOrder}
          </div>
        )}
      </section>

      {/* ── Conditions (right under the FOMO elements) ── */}
      <section className="mx-auto max-w-7xl px-6 pb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-display text-lg font-black text-slate-900">{d.conditions.heading}</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Condition icon={Truck} text={`${deal.delivery_weeks_min}–${deal.delivery_weeks_max} ${lang === 'cs' ? 'týdnů na dodání' : 'weeks delivery'}`} />
            <Condition icon={CreditCard} text={lang === 'cs'
              ? `Záloha ${deal.deposit_percent} % bankovním převodem`
              : `${deal.deposit_percent} % deposit by bank transfer`} />
            <Condition icon={ListOrdered} text={d.conditions.items[4].desc} />
          </div>
          {deal.payment_terms && (
            <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
              {deal.payment_terms}
            </p>
          )}
        </div>
      </section>

      {/* ── Sticky filter bar ── */}
      <div
        className={`sticky top-14 z-30 border-y border-slate-200 bg-slate-50/95 backdrop-blur transition-transform duration-300 sm:top-24
          ${barHidden ? '-translate-y-[140%]' : 'translate-y-0'}`}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-3">
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={d.detail.searchPlaceholder}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          {FILTER_DEFS.map((def) => {
            const opts = filterOptions[def.key];
            if (opts.length < 2) return null;
            return (
              <select
                key={def.key}
                value={filters[def.key]}
                onChange={(e) => setFilter(def.key, e.target.value)}
                className={`h-9 rounded-lg border bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400
                  ${filters[def.key] ? 'border-slate-900 font-semibold' : 'border-slate-300'}`}
              >
                <option value="">{d.filters[def.key]}: {d.filters.all}</option>
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            );
          })}
          <span className="ml-auto whitespace-nowrap text-xs text-slate-400">
            {filtered.length} {d.detail.results}
          </span>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" /> {d.detail.clearFilters}
            </button>
          )}
        </div>
      </div>

      {/* ── Catalog ── */}
      <section id="deal-catalog" className="mx-auto max-w-7xl px-6 py-8">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-400">
            {d.detail.noMatch}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                onBrandClick={handleBrandClick}
                onOpenDetail={() => setDetailProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Sticky order bar ── */}
      {canSeePrices && !closed && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="tabular-nums">{totalQty}</span>
            </button>
            <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-1">
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

      <DealCartDrawer
        deal={deal}
        products={products}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        tierIndex={tierIndex}
        onSubmit={handleSubmit}
        submitDisabled={!prog?.minimumReached}
      />

      <DealProductModal
        product={detailProduct}
        tiers={deal.tiers}
        currency={deal.currency}
        canSeePrices={canSeePrices}
        onClose={() => setDetailProduct(null)}
      />

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

function Condition({ icon: Icon, text }: { icon: typeof Truck; text: string }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-slate-600">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900">
        <Icon className="h-4 w-4 text-white" />
      </span>
      <span className="pt-1.5 leading-snug">{text}</span>
    </div>
  );
}
