import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, EyeOff, Megaphone, ShieldCheck, Timer } from 'lucide-react';
import { AgentLogoRow } from '@/components/AgentLogoRow';
import { CreateBigDealButton } from '@/components/deals/CreateBigDealButton';

/* ── Pivotované sekce homepage — GoBigDeal (P2P burza velkoobchodních dealů)
 *
 * Každá sekce si nese vlastní wrapper podle vzoru webu: vnější div drží barvu
 * PŘEDCHOZÍ sekce, vnitřní zaoblená karta (rounded-t 28/44 px) barvu vlastní —
 * zaoblené rohy tak odkrývají správný podklad.
 *
 * Copy drží skill: čtenář hrdina, krátké věty, žádná čísla bez podkladu
 * (počet značek ani rozsahy slev se netvrdí; 48 h Early Access a feed 4× denně
 * jsou zavedené produktové parametry, 0,5 % poplatek je zadání komisionářského
 * modelu).
 */

const H2 = 'font-sans font-extralight tracking-tight leading-[1.12]';
const EYEBROW = 'text-[11px] font-semibold uppercase tracking-[0.2em]';

/* Bílá iOS karta kroku (světlé sekce) */
const STEP_LIGHT =
  'flex flex-col rounded-[1.25rem] border border-slate-200/70 bg-white p-6 text-left ' +
  'shadow-[0_12px_32px_-8px_rgba(15,23,42,0.16),0_3px_8px_rgba(15,23,42,0.07)] transition-all duration-300 ' +
  'hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-[0_36px_64px_-18px_rgba(15,23,42,0.32),0_8px_18px_rgba(15,23,42,0.12)]';
/* Tmavá karta kroku (tmavé sekce) — chrom /deals: vlasový rámeček na 4% bílé */
const STEP_DARK =
  'flex flex-col rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-6 text-left ' +
  'transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.07]';

function StepNo({ n, dark }: { n: string; dark?: boolean }) {
  return (
    <span className={`font-mono text-xs font-semibold ${dark ? 'text-emerald-400' : 'text-emerald-500'}`}>
      {n}
    </span>
  );
}

/* ── 2. FOR BUYERS — tři kroky kupujícího, CTA Browse deals ── */
export function ForBuyersSection() {
  const navigate = useNavigate();
  const steps = [
    {
      n: '01',
      t: 'Watch the market',
      d: 'Alerts for a concern, a brand, or one exact model. One email the moment a deal drops — free forever.',
    },
    {
      n: '02',
      t: 'Catch the drop',
      d: 'Every deal is one price and one deadline. Early Access members see it 48 hours before the public.',
    },
    {
      n: '03',
      t: 'Order in one move',
      d: 'Take the whole batch, or your share of a Split Deal. No haggling threads — the number is the number.',
    },
  ];

  return (
    <div className="bg-[#0b0d10]">
      <section className="w-full rounded-t-[1.75rem] bg-white pb-16 pt-14 sm:rounded-t-[2.75rem] sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-10">
          <p className={`${EYEBROW} text-zinc-400`}>For buyers</p>
          <h2 className={`${H2} mt-3 max-w-2xl text-[clamp(1.75rem,5vw,3.25rem)] text-zinc-900`}>
            Buy closeout batches below wholesale.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-5">
            {steps.map((s) => (
              <div key={s.n} className={STEP_LIGHT}>
                <StepNo n={s.n} />
                <span className="mt-3 text-[17px] font-semibold tracking-tight text-zinc-900">{s.t}</span>
                <span className="mt-2 text-sm leading-relaxed text-zinc-500">{s.d}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/deals')}
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-zinc-900 px-7 text-[15px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5 hover:bg-zinc-800"
            >
              Browse deals
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/alerts')}
              className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              <Bell className="h-3.5 w-3.5" /> Set a free alert first
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── 4. WANT DEALS — poptávková strana: co se právě shání ──
 * Karty jsou ilustrační mockupy (stejný jazyk jako hero dashboard): skeleton
 * řádky a rozmazané hodnoty, žádná tvrzená čísla. */
export function WantDealStrip() {
  const navigate = useNavigate();
  const asks = [
    { qty: '240 pcs', target: 'target −55 %', win: '6 days' },
    { qty: '80 pcs', target: 'target −40 %', win: '48 hours' },
    { qty: '1 200 pcs', target: 'target −70 %', win: '2 weeks' },
  ];

  return (
    <div className="bg-[#0d0d10]">
      <section className="w-full rounded-t-[1.75rem] bg-white pb-16 pt-14 sm:rounded-t-[2.75rem] sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-10">
          <p className={`${EYEBROW} text-zinc-400`}>Want Deals</p>
          <h2 className={`${H2} mt-3 max-w-2xl text-[clamp(1.75rem,5vw,3.25rem)] text-zinc-900`}>
            Buyers post what they're hunting.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] font-light leading-relaxed text-zinc-500 sm:text-lg">
            A Want Deal is a public ask with the buyer's name sealed — quantity,
            target price, deadline. If you can fill it, you've found your next deal.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {asks.map((a) => (
              <div key={a.qty} className={STEP_LIGHT} aria-hidden>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 ring-1 ring-blue-100">
                    WTB
                  </span>
                  <span className="text-[11px] font-medium text-zinc-400 blur-[3px] select-none">
                    closes in {a.win}
                  </span>
                </div>
                <div className="mt-4 space-y-1.5">
                  <span className="block h-2.5 w-4/5 rounded-full bg-zinc-200" />
                  <span className="block h-2.5 w-3/5 rounded-full bg-zinc-100" />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-zinc-900 blur-[4px] select-none">{a.qty}</span>
                  <span className="font-mono text-sm font-semibold text-emerald-600 blur-[4px] select-none">{a.target}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/wantdeal')}
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-zinc-900 px-7 text-[15px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5 hover:bg-zinc-800"
            >
              Browse Want Deals
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/wantdeal')}
              className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              <Megaphone className="h-3.5 w-3.5" /> Post what you're hunting
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── 5. FOR SELLERS — zrcadlové tři kroky, anonymita jako konkrétní krok ── */
export function ForSellersSection() {
  const steps = [
    {
      n: '01',
      t: 'Post anonymously',
      d: 'Your name stays sealed. The market never learns you’re clearing stock — or at what price.',
    },
    {
      n: '02',
      t: 'One number, one deadline',
      d: 'Set the batch price and the timer. No haggling, no drip-feeding discounts channel by channel.',
    },
    {
      n: '03',
      t: 'Ship and get paid',
      d: 'Buyers are verified trade accounts. Posting is free — the platform takes 0.5 % only when the deal closes.',
    },
  ];

  return (
    <div className="bg-white">
      <section className="w-full rounded-t-[1.75rem] bg-[#0d0d10] pb-16 pt-14 sm:rounded-t-[2.75rem] sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-10">
          <p className={`${EYEBROW} text-zinc-500`}>For sellers</p>
          <h2 className={`${H2} mt-3 max-w-2xl text-[clamp(1.75rem,5vw,3.25rem)] text-white`}>
            Sell stock nobody sees you selling.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-5">
            {steps.map((s) => (
              <div key={s.n} className={STEP_DARK}>
                <StepNo n={s.n} dark />
                <span className="mt-3 text-[17px] font-semibold tracking-tight text-white">{s.t}</span>
                <span className="mt-2 text-sm leading-relaxed text-zinc-400">{s.d}</span>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <CreateBigDealButton className="h-11 px-6 text-[15px]" />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── 6. CONNECTIVITY — feed, MCP, AI agenti („žádný další portál") ── */
export function ConnectivitySection() {
  const navigate = useNavigate();
  const items = [
    {
      t: 'Product feed',
      d: 'XML or CSV straight into your shop — prices refreshed 4× a day.',
      path: '/feed',
    },
    {
      t: 'MCP Server',
      d: 'Plug your AI agents into live deals, stock and prices.',
      path: '/feed?to=mcp',
    },
    {
      t: 'Deal alerts',
      d: 'One email the moment a deal drops. Watch a concern, a brand, or one model.',
      path: '/alerts',
    },
  ];

  return (
    <div className="bg-[#0d0d10]">
      <section className="w-full rounded-t-[1.75rem] bg-white pb-16 pt-14 sm:rounded-t-[2.75rem] sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-10">
          <div className="mb-8">
            <AgentLogoRow />
          </div>
          <p className={`${EYEBROW} text-zinc-400`}>Connectivity</p>
          <h2 className={`${H2} mt-3 max-w-2xl text-[clamp(1.75rem,5vw,3.25rem)] text-zinc-900`}>
            Not another portal.
            <br />
            A feed into your tools.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {items.map((i) => (
              <button key={i.t} type="button" onClick={() => navigate(i.path)} className={STEP_LIGHT}>
                <span className="text-[17px] font-semibold tracking-tight text-zinc-900">{i.t}</span>
                <span className="mt-2 text-sm leading-relaxed text-zinc-500">{i.d}</span>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-900">
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── 7. TRUST + ZAKONČENÍ — pravidla platformy a drop-alert finále ── */
export function TrustEndingSection() {
  const navigate = useNavigate();
  const rules = [
    {
      icon: ShieldCheck,
      t: 'Verified trade accounts',
      d: 'Every account passes B2B verification before it can trade. No retail, no tourists.',
    },
    {
      icon: Megaphone,
      t: '0.5 % per deal. Nothing else.',
      d: 'Posting is free. Buying is free. Half a percent when a deal closes — that’s the whole price list.',
    },
    {
      icon: Timer,
      t: 'Honest timers',
      d: 'A countdown runs only on a live deal. Zero means gone — urgency is never faked.',
    },
    {
      icon: EyeOff,
      t: 'Anonymous by design',
      d: 'Buyer and seller stay unidentified to each other. The platform stands in the middle.',
    },
  ];

  return (
    <div className="bg-white">
      <section className="w-full rounded-t-[1.75rem] bg-[#0b0d10] pb-20 pt-14 sm:rounded-t-[2.75rem] sm:pb-28 sm:pt-20">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-10">
          <p className={`${EYEBROW} text-zinc-500`}>The rules</p>
          <h2 className={`${H2} mt-3 max-w-2xl text-[clamp(1.75rem,5vw,3.25rem)] text-white`}>
            Built on rules, not promises.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {rules.map((r) => (
              <div key={r.t} className={STEP_DARK}>
                <r.icon className="h-5 w-5 text-zinc-500" />
                <span className="mt-3 text-[17px] font-semibold tracking-tight text-white">{r.t}</span>
                <span className="mt-2 text-sm leading-relaxed text-zinc-400">{r.d}</span>
              </div>
            ))}
          </div>

          {/* finále — nejnižší schod konverze uzavírá stránku */}
          <div className="mt-20 flex flex-col items-center text-center sm:mt-28">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <Bell className="h-6 w-6 text-white" />
            </span>
            <h2 className={`${H2} mt-6 text-[clamp(2rem,6vw,3.5rem)] text-white`}>Never miss a drop.</h2>
            <p className="mt-4 max-w-md text-[15px] font-light leading-relaxed text-zinc-400 sm:text-lg">
              One email when a deal goes live. Free forever.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/alerts')}
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-zinc-900 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)] transition-all hover:-translate-y-0.5 hover:bg-zinc-100"
              >
                Set your free alert
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/deals')}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-6 text-[15px] font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-zinc-900"
              >
                Browse deals
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
