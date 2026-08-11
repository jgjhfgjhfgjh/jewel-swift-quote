import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Users, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { useDeals } from '@/hooks/useDeals';
import { useSplitDeals, type SplitPool } from '@/hooks/useSplitDeals';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
import { DealChannelPills } from '@/components/deals/catalog/DealChannelPills';
import { GoBigDealLogo } from '@/components/GoBigDealLogo';

/* Obsidián — stejná plocha jako /deals, /alerts a /my-deals. */
const DARK = '#0B1215';

/* Mechanika v krocích — tři věty, které musí sedět dřív, než někdo klikne
   na „Join". Pořadí je pořadí, ve kterém se to obchodníkovi děje. */
const STEPS: { title: string; desc: string }[] = [
  {
    title: 'You commit a quantity',
    desc: 'Not an order — a number of units you take if the batch opens. Free to change or drop while the batch runs.',
  },
  {
    title: 'The pool fills the MOQ',
    desc: 'Every commitment counts toward the same minimum. What one retailer cannot reach alone, five reach together.',
  },
  {
    title: 'The batch opens for everyone',
    desc: 'MOQ reached before the deadline: the deal goes live at the unlocked tier and everyone in the pool buys at it.',
  },
  {
    title: 'Nothing fills, nothing happens',
    desc: 'The deadline passes below the MOQ and every commitment expires. No invoice, no obligation, no deposit held.',
  },
];

/**
 * SplitDeal (/splitdeal) — skupinový nákup na MOQ.
 *
 * Jediná kategorie na GoBigDeal, kde vzniká obchod, který by jinak vůbec
 * neexistoval: malý obchodník MOQ dávky sám nedá, ve složeném objemu ano.
 *
 * Stránka je proto celá o jednom čísle — kolik kusů do MOQ chybí. Naplněnost
 * je veřejná (RPC vrací jen součty), cizí závazky nevidí nikdo. Vlastní
 * závazek jde kdykoli přepsat i zrušit, dokud dávka běží — viz useSplitDeals.
 */
export default function SplitDeal() {
  const { user, loading: authLoading } = useAuthContext();
  const openAuthModal = useStore((s) => s.openAuthModal);
  const { deals, loading: dealsLoading } = useDeals();
  const { pools, loading, busyDeal, commit, leave } = useSplitDeals(deals);
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const joined = pools.filter((p) => p.myQty > 0);

  const submit = async (p: SplitPool) => {
    if (!user) { openAuthModal('register'); return; }
    const qty = Number(draft[p.deal.id] ?? '');
    if (!Number.isFinite(qty) || qty <= 0) return;
    await commit(p.deal.id, Math.floor(qty));
    setDraft((d) => ({ ...d, [p.deal.id]: '' }));
  };

  const poolCard = (p: SplitPool) => {
    const pct = Math.round(p.progress * 100);
    const full = p.missing === 0 && p.target > 0;
    return (
      <div
        key={p.deal.id}
        className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-white/20 sm:p-6"
      >
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex w-[86px] shrink-0 flex-col items-center leading-none">
            <GoBigDealLogo className="text-[13px] text-white" />
            <span className="mt-1 font-sans text-[10px] font-light tracking-wide text-zinc-500">
              nr. {p.deal.deal_no ?? '—'}
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <Link
              to={`/deals/${p.deal.slug}`}
              className="block truncate text-[15px] font-medium tracking-tight text-white underline-offset-4 hover:underline"
            >
              {p.deal.title}
            </Link>
            <span className="mt-0.5 block text-[12px] text-zinc-500">
              {p.deal.supplier} · MOQ {p.target} pcs
            </span>
          </span>
          {p.deadline && <CountdownTimer deadline={p.deadline} variant="compact" lang="en" />}
        </div>

        {/* NAPLNĚNOST — hlavní číslo stránky */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-sans text-2xl font-medium leading-none tracking-tighter text-white">
              {p.committed}
              <span className="text-zinc-500"> / {p.target} pcs</span>
            </span>
            <span className={`text-[12px] font-medium ${full ? 'text-emerald-400' : 'text-zinc-400'}`}>
              {full ? 'MOQ reached' : `${p.missing} pcs to go`}
            </span>
          </div>
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${full ? 'bg-emerald-400' : 'bg-white/70'}`}
              style={{ width: `${Math.max(pct, p.committed > 0 ? 4 : 0)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-zinc-500">
            <Users className="h-3 w-3" />
            {p.participants} {p.participants === 1 ? 'retailer in' : 'retailers in'}
            {p.myQty > 0 && <span className="text-emerald-400"> · you hold {p.myQty} pcs</span>}
          </div>
        </div>

        {/* ZÁVAZEK */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={draft[p.deal.id] ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, [p.deal.id]: e.target.value }))}
            placeholder={p.myQty > 0 ? String(p.myQty) : 'pcs'}
            className="h-9 w-24 rounded-full border border-white/15 bg-white/[0.06] px-4 text-[13px] text-white placeholder:text-zinc-600 focus:border-white/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void submit(p)}
            disabled={busyDeal === p.deal.id}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50"
          >
            {p.myQty > 0 ? 'Update commitment' : 'Join the pool'} <ArrowRight className="h-3.5 w-3.5" />
          </button>
          {p.myQty > 0 && (
            <button
              type="button"
              onClick={() => void leave(p.deal.id)}
              disabled={busyDeal === p.deal.id}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 px-4 text-[13px] font-medium text-zinc-400 transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" /> Drop out
            </button>
          )}
        </div>
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
              <Users className="h-6 w-6 text-white" />
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">SplitDeal</span>
          <h1 className="mt-3 font-sans text-3xl font-medium tracking-tighter text-white sm:text-5xl">
            Group buying
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Several small retailers pool volume to reach an MOQ none of them could hit alone — the one place
            where a deal exists that otherwise would not.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pb-24">
        {/* přepínač kanálů — stejný jako na /deals, aby byl trh vidět celý */}
        <div className="flex justify-end pt-8">
          <DealChannelPills active="split" className="w-fit" />
        </div>
        {/* ── Mechanika ── */}
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-5">
              <span className="font-mono text-[11px] font-bold text-zinc-600">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="mt-2 text-[15px] font-medium tracking-tight text-white">{s.title}</p>
              <p className="mt-1.5 text-[13px] leading-snug text-zinc-500">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Moje pooly ── */}
        {joined.length > 0 && (
          <>
            <h2 className="mt-12 flex items-center gap-2.5 text-lg font-medium tracking-tighter text-white">
              <Check className="h-4 w-4 text-emerald-400" /> You are in
              <span className="font-mono text-sm text-zinc-500">{joined.length}</span>
            </h2>
            <div className="mt-4 flex flex-col gap-3">{joined.map(poolCard)}</div>
          </>
        )}

        {/* ── Otevřené pooly ── */}
        <h2 className="mt-12 text-lg font-medium tracking-tighter text-white">
          Open pools <span className="font-mono text-sm text-zinc-500">{pools.length}</span>
        </h2>
        {loading || dealsLoading ? (
          <div className="mt-4 flex flex-col gap-3">
            {[0, 1].map((i) => <div key={i} className="h-44 animate-pulse rounded-[1.25rem] bg-white/[0.06]" />)}
          </div>
        ) : pools.length === 0 ? (
          <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-[15px] font-medium tracking-tight text-white">No batch is open for pooling.</p>
            <p className="mt-1.5 text-[13px] text-zinc-500">
              Pools open with the batches. Set a free deal alert and the next one finds you.
            </p>
            <Link
              to="/alerts"
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              Set a free deal alert <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">{pools.map(poolCard)}</div>
        )}

        {/* Host — závazek potřebuje účet, protože z něj plyne odběr. */}
        {!user && !authLoading && (
          <p className="mt-6 text-[13px] text-zinc-500">
            Joining a pool needs an account — a commitment turns into an order when the MOQ is reached.{' '}
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
