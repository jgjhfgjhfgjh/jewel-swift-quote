import { ArrowRight, BadgeCheck, ShieldCheck } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMyDeals } from '@/hooks/useMyDeals';

/* Karty panelu — stejný tvar, stín i hover jako v GoBigDeal mega menu. */
const CARD =
  'group/my flex h-[150px] flex-col rounded-[1.25rem] border border-slate-200/70 bg-white p-5 text-left transition-all duration-300 ease-out ' +
  'shadow-[0_12px_32px_-8px_rgba(15,23,42,0.16),0_3px_8px_rgba(15,23,42,0.07)] hover:-translate-y-1.5 hover:border-slate-300 ' +
  'hover:shadow-[0_36px_64px_-18px_rgba(15,23,42,0.32),0_8px_18px_rgba(15,23,42,0.12)]';

/* Osobní zóna partnera — co si objednal, co hlídá, co si uložil. */
const MY_DEAL_ITEMS: { label: string; sub: string; path: string }[] = [
  { label: 'My orders', sub: 'Deals you ordered and where each one stands', path: '/orders' },
  { label: 'Deal alerts', sub: 'Concerns, brands and models you watch', path: '/alerts' },
  { label: 'Saved products', sub: 'Everything you starred in the catalog', path: '/favorites' },
  { label: 'Account settings', sub: 'Company details, delivery and invoicing', path: '/ucet' },
];

/**
 * MyDeal mega menu — pět stejně velkých karet v jedné řadě. První je „My
 * deals": dodavatelská strana účtu, zbytek je osobní zóna odběratele
 * (objednávky, alerty, uložené, nastavení). Nepřihlášenému panel nabídne
 * registraci.
 *
 * První karta mění podtitulek i akci podle toho, co uživatel doopravdy smí
 * a má — počty jsou z `deals.created_by` přihlášeného uživatele (useMyDeals),
 * nikdy z katalogu:
 *  1. NEOVĚŘENÝ účet → vede na ověření (a když žádost běží, řekne to),
 *  2. OVĚŘENÝ bez běžící dávky → vede na zadání dávky,
 *  3. OVĚŘENÝ s běžícími dávkami → počet a vstup do dodavatelské správy.
 */
export function NavMyDealPanel({ go }: { go: (path: string) => void }) {
  const { user, isAdmin, isB2bApproved, profile } = useAuthContext();
  const { active } = useMyDeals();

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

  /* Podtitulek i akce se mění se stavem, karta zůstává stejně velká jako
     ostatní — pětice pak čte jako jedna ucelená nabídka. */
  const deals = !canPost
    ? {
        sub: verificationPending
          ? 'Verification is running — we come back within 24 hours.'
          : 'Verify your account and post your own BigDeals. Free, within 24 hours.',
        action: verificationPending ? 'Check details' : 'Verify account',
      }
    : active.length > 0
      ? {
          sub: `${active.length} live now — deadlines, history and repeats in one place`,
          action: 'Manage deals',
        }
      : {
          sub: 'Post a batch and retailers across Europe see it — one number, one deadline',
          action: 'Post a deal',
        };

  return (
    <div className="grid grid-cols-5 gap-4">
      {/* 1. dodavatelská strana účtu */}
      <button type="button" onClick={() => go('/my-deals')} className={CARD}>
        <span className="flex items-center gap-2">
          <span className="text-[15px] font-semibold tracking-tight text-zinc-900">My deals</span>
          {canPost ? (
            /* modrá odznaku ověřených účtů ze sociálních sítí (Facebook
               #1877F2) — čte se okamžitě jako „prověřený účet" */
            <BadgeCheck className="h-4 w-4 shrink-0 text-[#1877F2]" />
          ) : (
            <ShieldCheck className="h-4 w-4 shrink-0 text-slate-300" />
          )}
          {active.length > 0 && (
            <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> {active.length}
            </span>
          )}
        </span>
        <span className="mt-1.5 text-[13px] leading-snug text-zinc-500">{deals.sub}</span>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-zinc-900">
          {deals.action} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/my:translate-x-0.5" />
        </span>
      </button>

      {MY_DEAL_ITEMS.map((item) => (
        <button key={item.path} type="button" onClick={() => go(item.path)} className={CARD}>
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
