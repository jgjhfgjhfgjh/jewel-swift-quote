import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, Layers, Plus, RotateCcw, ShieldCheck,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStore } from '@/lib/store';
import { useMyDeals, type MyDeal } from '@/hooks/useMyDeals';
import { openCreateDealDialog } from '@/components/deals/CreateDealDialog';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
import { DealChannelPills } from '@/components/deals/catalog/DealChannelPills';
import { GoBigDealLogo } from '@/components/GoBigDealLogo';

/* Obsidián — stejná plocha jako /deals a /alerts. */
const DARK = '#0B1215';

/** Popis dávky, který jde do poptávky o zopakování. */
const repeatLabel = (d: MyDeal) => `${d.dealNo ? `nr. ${d.dealNo} — ` : ''}${d.title}`;

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '—';

/**
 * Dodavatelská správa dealů (/my-deals) — co po sobě dodavatel má: běžící
 * dávky s odpočtem a historii s možností nasadit dávku znovu.
 *
 * Vlastnictví drží `deals.created_by`, takže stránka nikdy neukáže cizí
 * dávku. Zakládání dávky zůstává na poptávce (CreateBigDeal) — RLS pouští
 * zápis do `deals` jen adminovi, samoobslužný sestavovač zatím neexistuje.
 * Stránka to říká otevřeně místo tlačítka, které by spadlo na oprávnění.
 */
export default function MyDeals() {
  const { user, isAdmin, isB2bApproved, profile, loading: authLoading } = useAuthContext();
  const openAuthModal = useStore((s) => s.openAuthModal);
  const { active, past, loading } = useMyDeals();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const canPost = isB2bApproved || isAdmin;
  const verificationPending = !canPost && !!profile?.b2b_requested_at;

  const row = (d: MyDeal, mode: 'live' | 'past') => (
    <div
      key={d.id}
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 transition-colors hover:border-white/25 sm:gap-4 sm:px-5"
    >
      {/* označení dávky — stejná značka jako v katalogu */}
      <span className="flex w-[86px] shrink-0 flex-col items-center leading-none">
        <GoBigDealLogo className="text-[13px] text-white" />
        <span className="mt-1 font-sans text-[10px] font-light tracking-wide text-zinc-500">
          nr. {d.dealNo ?? '—'}
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium tracking-tight text-white">{d.title}</span>
        <span className="mt-0.5 block text-[12px] text-zinc-500">
          {mode === 'live' ? `Deadline ${fmtDate(d.deadline)}` : `Ended ${fmtDate(d.deadline)}`}
        </span>
      </span>

      {mode === 'live' && d.deadline && (
        <CountdownTimer deadline={d.deadline} variant="compact" lang="en" />
      )}

      {d.slug && (
        <Link
          to={`/deals/${d.slug}`}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/20 px-4 text-[13px] font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10"
        >
          Open <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}

      {mode === 'past' && (
        <button
          type="button"
          onClick={() => openCreateDealDialog(repeatLabel(d))}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Run again
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen font-sans text-white" style={{ backgroundColor: DARK }}>
      <Navbar onDark />
      <BackButton />

      {/* ── Hlavička ── */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-5xl px-6 pb-10 pt-24 text-center sm:pb-12 sm:pt-32">
          <div className="mb-5 flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <Layers className="h-6 w-6 text-white" />
            </span>
          </div>
          <h1 className="font-sans text-3xl font-medium tracking-tighter text-white sm:text-5xl">
            My deals
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Batches you put on GoBigDeal — what is live, what has ended and what is worth running again.
          </p>
          {canPost && (
            <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#1877F2]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1877F2]">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified supplier
            </span>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pb-24">
        {/* přepínač nástěnek — stejný jako na ostatních třech */}
        <div className="flex justify-end pt-8">
          {/* MyDeal není kanál trhu — řada tu stojí bez zvýraznění, jako
              cesta zpátky mezi dealy */}
          <DealChannelPills className="w-fit" />
        </div>
        {!user && !authLoading ? (
          /* ── Nepřihlášený ── */
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <h2 className="font-sans text-2xl font-medium tracking-tighter text-white">
              Sign in to see your deals
            </h2>
            <p className="mt-2 max-w-md text-zinc-400">
              Deals are tied to your account, together with their numbers and deadlines.
            </p>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              Create a free account <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : !canPost ? (
          /* ── Neověřený účet — dávky zadávat nemůže ── */
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
              <ShieldCheck className="h-3 w-3" /> BigDealSupplier
            </span>
            <h2 className="mt-4 font-sans text-2xl font-medium tracking-tighter text-white">
              {verificationPending ? 'Your account is being verified.' : 'Verify your account to post BigDeals.'}
            </h2>
            <p className="mt-2 max-w-xl text-zinc-400">
              {verificationPending
                ? 'We come back within 24 hours. Until then you can browse every open deal.'
                : 'Verification is free. Once approved you can post your own batches to retailers across Europe.'}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/ucet"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
              >
                {verificationPending ? 'Check your details' : 'Verify account'} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/suppliers"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/10"
              >
                How BigDealSupplier works
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── Přehled ── */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {[
                { label: 'Live now', value: String(active.length) },
                { label: 'Finished', value: String(past.length) },
                { label: 'Deals in total', value: String(active.length + past.length) },
              ].map((k) => (
                <div key={k.label} className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                  <span className="block text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                    {k.label}
                  </span>
                  <span className="mt-2.5 block font-sans text-[1.6rem] font-medium leading-none tracking-tighter text-white sm:text-3xl">
                    {k.value}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Zadání nové dávky ── */}
            <div className="mt-4 flex flex-col items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
              <span className="w-full min-w-0 sm:flex-1">
                <span className="block text-[15px] font-medium tracking-tighter text-white">
                  Have another batch to move?
                </span>
                <span className="mt-0.5 block text-[13px] text-zinc-500">
                  We check availability with the concern and open it under a new deal number.
                </span>
              </span>
              <button
                type="button"
                onClick={() => openCreateDealDialog()}
                className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-zinc-200 sm:w-[13.5rem]"
              >
                <Plus className="h-3.5 w-3.5" /> Post a new deal
              </button>
            </div>

            {/* ── Běžící dávky ── */}
            <h2 className="mt-12 flex items-center gap-2.5 text-lg font-medium tracking-tighter text-white">
              {active.length > 0 && <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />}
              Live deals <span className="font-mono text-sm text-zinc-500">{active.length}</span>
            </h2>
            {loading ? (
              <div className="mt-4 h-20 animate-pulse rounded-2xl bg-white/[0.06]" />
            ) : active.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                No deal of yours is live right now.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-2.5">{active.map((d) => row(d, 'live'))}</div>
            )}

            {/* ── Historie ── */}
            <h2 className="mt-12 text-lg font-medium tracking-tighter text-white">
              Deal history <span className="font-mono text-sm text-zinc-500">{past.length}</span>
            </h2>
            {past.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                Nothing has finished yet — your history shows up here.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-2.5">{past.map((d) => row(d, 'past'))}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
