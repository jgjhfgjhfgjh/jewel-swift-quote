import { ArrowRight, BadgeCheck, Plus, RotateCcw, ShieldCheck } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMyDeals, type MyDeal } from '@/hooks/useMyDeals';
import { openCreateDealDialog } from '@/components/deals/CreateDealDialog';
import { GoBigDealLogo } from '@/components/GoBigDealLogo';
import { CountdownTimer } from '@/components/deals/CountdownTimer';

/* Karty panelu — stejný tvar, stín i hover jako v GoBigDeal mega menu. */
const CARD =
  'group/my flex flex-col rounded-[1.25rem] border border-slate-200/70 bg-white p-5 text-left transition-all duration-300 ease-out ' +
  'shadow-[0_12px_32px_-8px_rgba(15,23,42,0.16),0_3px_8px_rgba(15,23,42,0.07)] hover:-translate-y-1.5 hover:border-slate-300 ' +
  'hover:shadow-[0_36px_64px_-18px_rgba(15,23,42,0.32),0_8px_18px_rgba(15,23,42,0.12)]';

/* Osobní zóna partnera — co si objednal, co hlídá, co si uložil. */
const MY_DEAL_ITEMS: { label: string; sub: string; path: string }[] = [
  { label: 'My orders', sub: 'Deals you ordered and where each one stands', path: '/orders' },
  { label: 'Deal alerts', sub: 'Concerns, brands and models you watch', path: '/alerts' },
  { label: 'Saved products', sub: 'Everything you starred in the catalog', path: '/favorites' },
  { label: 'Account settings', sub: 'Company details, delivery and invoicing', path: '/ucet' },
];

/** Popis dávky, který jde do poptávky o zopakování. */
const repeatLabel = (d: MyDeal) => `${d.dealNo ? `nr. ${d.dealNo} — ` : ''}${d.title}`;

/**
 * MyDeal mega menu — vlevo VELKÁ karta stavu vlastních dealů (dodavatelská
 * strana), vpravo 2×2 mřížka osobní zóny (objednávky, alerty, uložené,
 * nastavení). Nepřihlášenému panel nabídne registraci.
 *
 * Karta stavu má tři podoby podle toho, co uživatel doopravdy smí a má:
 *  1. NEOVĚŘENÝ účet → nemůže zadávat dávky, karta vede na ověření
 *     (a když už žádost běží, řekne to místo vybízení),
 *  2. OVĚŘENÝ bez běžící dávky → karta JE tlačítko „zadat nový deal";
 *     pokud má doběhlé dávky, nabídne je k opětovnému nasazení,
 *  3. OVĚŘENÝ s běžícími dávkami → počet, nejbližší uzávěrky a vstup
 *     do správy dealů.
 *
 * Karta nikdy nepředstírá data: počty i termíny jsou z `deals.created_by`
 * přihlášeného uživatele (viz useMyDeals), ne z katalogu.
 */
export function NavMyDealPanel({ go }: { go: (path: string) => void }) {
  const { user, isAdmin, isB2bApproved, profile } = useAuthContext();
  const { active, past, loading } = useMyDeals();

  if (!user) {
    return (
      <div className="flex flex-col items-start">
        <p className="font-sans text-[19px] font-extralight leading-snug tracking-tight">
          <span className="text-zinc-900">Your deals, alerts and orders in one place. </span>
          <span className="text-zinc-500">Sign in to open MyDeal.</span>
        </p>
        <button
          type="button"
          onClick={() => go('auth:b2b')}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          Create a free account <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => go('auth:login')}
          className="mt-2.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
        >
          I already have an account
        </button>
      </div>
    );
  }

  /* Zadávat dávky smí jen ověřený B2B účet (role b2b_approved) — a admin,
     který dávky zakládá v administraci. */
  const canPost = isB2bApproved || isAdmin;
  /* Žádost o ověření už leží u nás — karta pak nevybízí, ale informuje. */
  const verificationPending = !canPost && !!profile?.b2b_requested_at;
  /* Správa dávek zatím žije jen v administraci; dodavatel bez ní chodí na
     veřejnou stránku své dávky (jinam ho pustit nemůžeme). */
  const managePath = isAdmin
    ? '/admin/deals'
    : active[0]?.slug
      ? `/deals/${active[0].slug}`
      : '/deals';

  const dealLine = (d: MyDeal, action: 'open' | 'repeat') => (
    <button
      key={d.id}
      type="button"
      onClick={() => (action === 'open' ? go(`/deals/${d.slug}`) : openCreateDealDialog(repeatLabel(d)))}
      className="group/row flex w-full items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2 text-left transition-colors hover:border-slate-300"
    >
      <span className="flex w-[52px] shrink-0 flex-col items-center leading-none">
        <GoBigDealLogo className="text-[9px] text-zinc-900" />
        <span className="mt-0.5 font-sans text-[9px] font-light tracking-wide text-slate-400">
          nr. {d.dealNo ?? '—'}
        </span>
      </span>
      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-zinc-900">{d.title}</span>
      {action === 'open' && d.deadline ? (
        <CountdownTimer deadline={d.deadline} variant="compact" lang="en" />
      ) : (
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-zinc-500 transition-colors group-hover/row:text-zinc-900">
          <RotateCcw className="h-3 w-3" /> Run again
        </span>
      )}
    </button>
  );

  /* ── 1. Neověřený účet ─────────────────────────────────────────────── */
  const statusCard = !canPost ? (
    <div className={`${CARD} row-span-2 justify-between`}>
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <ShieldCheck className="h-3 w-3" /> BigDealSupplier
        </span>
        <p className="mt-4 font-sans text-[17px] font-semibold leading-snug tracking-tight text-zinc-900">
          {verificationPending
            ? 'Your account is being verified.'
            : 'Verify your account to post BigDeals.'}
        </p>
        <p className="mt-2 text-[13px] leading-snug text-zinc-500">
          {verificationPending
            ? 'We come back within 24 hours. Until then you can browse every open deal.'
            : 'Verification is free. Once approved you can post your own batches to European retailers.'}
        </p>
      </div>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => go('/ucet')}
          className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          {verificationPending ? 'Check your details' : 'Verify account'} <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => go('/suppliers')}
          className="mt-2.5 w-full text-[12px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
        >
          How BigDealSupplier works
        </button>
      </div>
    </div>
  ) : active.length > 0 ? (
    /* ── 2. Běžící dávky ────────────────────────────────────────────── */
    <div className={`${CARD} row-span-2 justify-between`}>
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
        </span>
        <p className="mt-3 flex items-baseline gap-2">
          <span className="font-sans text-4xl font-medium leading-none tracking-tighter text-zinc-900">
            {active.length}
          </span>
          <span className="text-[13px] text-zinc-500">
            {active.length === 1 ? 'active deal' : 'active deals'}
          </span>
        </p>
        <div className="mt-3 flex flex-col gap-1.5">
          {active.slice(0, 2).map((d) => dealLine(d, 'open'))}
        </div>
      </div>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => go(managePath)}
          className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          Manage deals <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => openCreateDealDialog()}
          className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 text-[12px] font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <Plus className="h-3 w-3" /> Post another deal
        </button>
      </div>
    </div>
  ) : past.length > 0 ? (
    /* ── 3a. Ověřený bez běžící dávky, ale s historií ────────────────── */
    <div className={`${CARD} row-span-2 justify-between`}>
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <BadgeCheck className="h-3 w-3" /> Verified supplier
        </span>
        <p className="mt-4 font-sans text-[17px] font-semibold leading-snug tracking-tight text-zinc-900">
          No deal of yours is live.
        </p>
        <p className="mt-2 text-[13px] leading-snug text-zinc-500">
          Post a new batch — or run a finished one again.
        </p>
        <div className="mt-3 flex flex-col gap-1.5">
          {past.slice(0, 2).map((d) => dealLine(d, 'repeat'))}
        </div>
      </div>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => openCreateDealDialog()}
          className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          <Plus className="h-3.5 w-3.5" /> Post a new deal
        </button>
        <button
          type="button"
          onClick={() => go(managePath)}
          className="mt-2.5 w-full text-[12px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
        >
          Deal history · {past.length}
        </button>
      </div>
    </div>
  ) : (
    /* ── 3b. Ověřený, žádná dávka — CELÁ karta je tlačítko ───────────── */
    <button
      type="button"
      onClick={() => openCreateDealDialog()}
      className={`${CARD} row-span-2 justify-between`}
      disabled={loading}
    >
      <span className="block">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <BadgeCheck className="h-3 w-3" /> Verified supplier
        </span>
        <span className="mt-4 block font-sans text-[17px] font-semibold leading-snug tracking-tight text-zinc-900">
          No active deal.
        </span>
        <span className="mt-2 block text-[13px] leading-snug text-zinc-500">
          Post your batch and retailers across Europe see it — one deal number, one deadline, one order.
        </span>
      </span>
      <span className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-5 text-[13px] font-semibold text-white transition-colors group-hover/my:bg-zinc-800">
        <Plus className="h-3.5 w-3.5" /> Post a new deal
      </span>
    </button>
  );

  return (
    <div className="grid grid-cols-3 gap-4">
      {statusCard}
      {MY_DEAL_ITEMS.map((item) => (
        <button key={item.path} type="button" onClick={() => go(item.path)} className={`${CARD} h-[150px]`}>
          <span className="text-[15px] font-semibold tracking-tight text-zinc-900">{item.label}</span>
          <span className="mt-1.5 text-[13px] leading-snug text-zinc-500">{item.sub}</span>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-zinc-900">
            Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/my:translate-x-0.5" />
          </span>
        </button>
      ))}
    </div>
  );
}
