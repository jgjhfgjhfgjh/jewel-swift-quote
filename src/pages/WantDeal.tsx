import { useEffect, useState } from 'react';
import { ArrowRight, Check, Gavel, Megaphone, Plus, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { useWantDeals, type NewWantDeal } from '@/hooks/useWantDeals';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
import type { WantListing } from '@/lib/wantDeals';

/* Obsidián — stejná plocha jako /deals, /splitdeal a /my-deals. */
const DARK = '#0B1215';
const FIELD =
  'h-10 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3.5 text-[13px] text-white placeholder:text-zinc-600 focus:border-white/40 focus:outline-none';

const fmtMoney = (v: number | null, ccy = 'EUR') =>
  v === null ? '—' : `${v.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} ${ccy}`;

/**
 * WantDeal (/wantdeal) — obrácený tok trhu.
 *
 * Zbytek GoBigDealu je nabídkový: prodávající vystaví dávku a kupující si
 * vybírá. Tady je to naopak — inzerát podává KUPUJÍCÍ a prodávající se
 * ozývají. Dvě podoby téhož:
 *  • Sháním — kupující řekne, co potřebuje, přijdou nabídky,
 *  • Reverzní aukce — kupující zadá objem a cílovou cenu, nabídky jdou dolů.
 *
 * Anonymita je na obou stranách: veřejně se chodí přes RPC, které identitu
 * nevrací (viz lib/wantDeals). Kupující vidí ceny, ne jména; prodávající vidí
 * poptávku, ne kdo ji podal. U aukce je veřejná nejlepší cena — jinak by se
 * nabízející neměl čeho chytit.
 */
export default function WantDeal() {
  const { user, loading: authLoading } = useAuthContext();
  const openAuthModal = useStore((s) => s.openAuthModal);
  const { listings, mine, offers, loading, busy, publish, close, makeOffer, loadOffers, accept } = useWantDeals();

  const [form, setForm] = useState<NewWantDeal>({
    kind: 'wanted', title: '', qty: 0, targetPrice: null, note: '', deadline: null,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [bid, setBid] = useState<Record<string, { price: string; qty: string }>>({});

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const myIds = new Set(mine.map((m) => m.id));

  const submitForm = async () => {
    if (!user) { openAuthModal('register'); return; }
    if (!form.title.trim() || form.qty <= 0) return;
    const ok = await publish(form);
    if (ok) {
      setForm({ kind: 'wanted', title: '', qty: 0, targetPrice: null, note: '', deadline: null });
      setFormOpen(false);
    }
  };

  const submitBid = async (l: WantListing) => {
    if (!user) { openAuthModal('register'); return; }
    const b = bid[l.id];
    const price = Number(b?.price ?? '');
    const qty = Number(b?.qty ?? '') || l.qty;
    if (!Number.isFinite(price) || price <= 0) return;
    const ok = await makeOffer(l.id, price, Math.floor(qty));
    if (ok) setBid((s) => ({ ...s, [l.id]: { price: '', qty: '' } }));
  };

  const listingCard = (l: WantListing) => {
    const auction = l.kind === 'auction';
    const isMine = myIds.has(l.id);
    const rows = offers[l.id];
    return (
      <div
        key={l.id}
        className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-white/20 sm:p-6"
      >
        <div className="flex flex-wrap items-start gap-3">
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              auction ? 'bg-amber-400/10 text-amber-400' : 'bg-white/10 text-zinc-300'
            }`}
          >
            {auction ? <Gavel className="h-3 w-3" /> : <Megaphone className="h-3 w-3" />}
            {auction ? 'Reverse auction' : 'Wanted'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-medium tracking-tight text-white">{l.title}</span>
            <span className="mt-0.5 block text-[12px] text-zinc-500">
              {/* identita kupujícího se nikdy nezveřejňuje — jen země */}
              Verified retailer{l.country ? ` · ${l.country}` : ''} · {l.qty} pcs
              {auction && l.target_price !== null && ` · target ${fmtMoney(l.target_price, l.currency)}`}
            </span>
          </span>
          {l.deadline && <CountdownTimer deadline={l.deadline} variant="compact" lang="en" />}
        </div>

        {l.note && <p className="mt-3 text-[13px] leading-snug text-zinc-400">{l.note}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-zinc-500">
          <span>{l.offers_count} {l.offers_count === 1 ? 'offer' : 'offers'}</span>
          {auction && (
            <span className={l.best_price !== null ? 'text-emerald-400' : ''}>
              Best bid {fmtMoney(l.best_price, l.currency)}
            </span>
          )}
          {l.my_offer !== null && <span className="text-white">Your bid {fmtMoney(l.my_offer, l.currency)}</span>}
        </div>

        {isMine ? (
          /* MOJE poptávka — nabídky bez identity, přijetí uzavře soutěž */
          <div className="mt-4">
            <button
              type="button"
              onClick={() => void loadOffers(l.id)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 px-4 text-[13px] font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10"
            >
              Show offers <ArrowRight className="h-3.5 w-3.5" />
            </button>
            {rows && (
              <div className="mt-3 flex flex-col gap-2">
                {rows.length === 0 && <p className="text-[13px] text-zinc-500">No offers yet.</p>}
                {rows.map((o) => (
                  <div
                    key={o.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5"
                  >
                    <span className="text-[13px] font-medium text-white">{fmtMoney(o.unit_price, l.currency)}</span>
                    <span className="text-[12px] text-zinc-500">/ pc · {o.qty} pcs</span>
                    {o.note && <span className="min-w-0 flex-1 truncate text-[12px] text-zinc-500">{o.note}</span>}
                    {o.status === 'accepted' ? (
                      <span className="ml-auto inline-flex items-center gap-1 text-[12px] font-medium text-emerald-400">
                        <Check className="h-3.5 w-3.5" /> Accepted
                      </span>
                    ) : o.status === 'declined' ? (
                      <span className="ml-auto text-[12px] text-zinc-600">Declined</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void accept(l.id, o.id)}
                        disabled={busy === o.id}
                        className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3.5 text-[12px] font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => void close(l.id)}
              disabled={busy === l.id}
              className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full px-1 text-[12px] font-medium text-zinc-500 transition-colors hover:text-white disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" /> Close this request
            </button>
          </div>
        ) : (
          /* CIZÍ poptávka — nabídka prodávajícího */
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={bid[l.id]?.price ?? ''}
              onChange={(e) => setBid((s) => ({ ...s, [l.id]: { ...s[l.id], price: e.target.value, qty: s[l.id]?.qty ?? '' } }))}
              placeholder={`${l.currency}/pc`}
              className="h-9 w-28 rounded-full border border-white/15 bg-white/[0.06] px-4 text-[13px] text-white placeholder:text-zinc-600 focus:border-white/40 focus:outline-none"
            />
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={bid[l.id]?.qty ?? ''}
              onChange={(e) => setBid((s) => ({ ...s, [l.id]: { ...s[l.id], qty: e.target.value, price: s[l.id]?.price ?? '' } }))}
              placeholder={`${l.qty} pcs`}
              className="h-9 w-24 rounded-full border border-white/15 bg-white/[0.06] px-4 text-[13px] text-white placeholder:text-zinc-600 focus:border-white/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => void submitBid(l)}
              disabled={busy === l.id}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50"
            >
              {l.my_offer !== null ? 'Update offer' : auction ? 'Place a bid' : 'Send an offer'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans text-white" style={{ backgroundColor: DARK }}>
      <Navbar onDark />
      <BackButton />

      {/* ── Hlavička ── */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-5xl px-6 pb-10 pt-24 text-center sm:pb-12 sm:pt-32">
          <div className="mb-5 flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <Megaphone className="h-6 w-6 text-white" />
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">WantDeal</span>
          <h1 className="mt-3 font-sans text-3xl font-medium tracking-tighter text-white sm:text-5xl">
            The flow, reversed
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Everywhere else the seller posts and you pick. Here you post what you need and the sellers come to
            you — anonymous on both sides, until you accept.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pb-24">
        {/* ── Dvě podoby ── */}
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {[
            {
              icon: Megaphone,
              title: 'Wanted',
              desc: 'You post what you are looking for — brands, references, volume. Sellers answer with a price. Nobody sees who asked.',
            },
            {
              icon: Gavel,
              title: 'Reverse auction',
              desc: 'You post volume and a target price. Sellers bid against each other downwards; the best bid is public, the bidders are not.',
            },
          ].map((m) => (
            <div key={m.title} className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-5">
              <m.icon className="h-4 w-4 text-amber-400" />
              <p className="mt-2.5 text-[15px] font-medium tracking-tight text-white">{m.title}</p>
              <p className="mt-1.5 text-[13px] leading-snug text-zinc-500">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Zveřejnění poptávky ── */}
        <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          {!formOpen ? (
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium tracking-tight text-white">
                  Looking for something nobody has listed?
                </span>
                <span className="mt-0.5 block text-[13px] text-zinc-500">
                  Post the request and let the offers come to you.
                </span>
              </span>
              <button
                type="button"
                onClick={() => (user ? setFormOpen(true) : openAuthModal('register'))}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
              >
                <Plus className="h-3.5 w-3.5" /> Post a request
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                {(['wanted', 'auction'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, kind: k }))}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition-colors ${
                      form.kind === k ? 'bg-white text-zinc-900' : 'border border-white/15 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {k === 'wanted' ? <Megaphone className="h-3.5 w-3.5" /> : <Gavel className="h-3.5 w-3.5" />}
                    {k === 'wanted' ? 'Wanted' : 'Reverse auction'}
                  </button>
                ))}
              </div>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="What are you looking for? (brand, references, condition)"
                className={FIELD}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  type="number"
                  min={1}
                  value={form.qty || ''}
                  onChange={(e) => setForm((f) => ({ ...f, qty: Number(e.target.value) }))}
                  placeholder="Quantity (pcs)"
                  className={FIELD}
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  disabled={form.kind !== 'auction'}
                  value={form.targetPrice ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, targetPrice: e.target.value === '' ? null : Number(e.target.value) }))}
                  placeholder={form.kind === 'auction' ? 'Target price (EUR/pc)' : 'Target price — auction only'}
                  className={`${FIELD} disabled:opacity-40`}
                />
                <input
                  type="date"
                  value={form.deadline ? form.deadline.slice(0, 10) : ''}
                  onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                  className={`${FIELD} [color-scheme:dark]`}
                />
              </div>
              <textarea
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Anything a seller needs to know — packaging, delivery window, market."
                rows={2}
                className={`${FIELD} h-auto py-2.5`}
              />
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => void submitForm()}
                  disabled={busy === 'publish' || !form.title.trim() || form.qty <= 0}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-5 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-40"
                >
                  Publish anonymously <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 px-4 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Otevřené poptávky ── */}
        <h2 className="mt-12 text-lg font-medium tracking-tighter text-white">
          Open requests <span className="font-mono text-sm text-zinc-500">{listings.length}</span>
        </h2>
        {loading ? (
          <div className="mt-4 flex flex-col gap-3">
            {[0, 1].map((i) => <div key={i} className="h-36 animate-pulse rounded-[1.25rem] bg-white/[0.06]" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-[15px] font-medium tracking-tight text-white">No open request right now.</p>
            <p className="mt-1.5 text-[13px] text-zinc-500">
              Be the first — a request costs nothing and the sellers read this board.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">{listings.map(listingCard)}</div>
        )}

        {!user && !authLoading && (
          <p className="mt-6 text-[13px] text-zinc-500">
            Posting a request or an offer needs an account — it is what keeps both sides anonymous but
            accountable.{' '}
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="font-medium text-white underline underline-offset-4"
            >
              Create a free account
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
