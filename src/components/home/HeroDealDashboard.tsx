import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Bell, ChevronDown, Search } from 'lucide-react';
import PerWordCrossfade from '@/components/ui/per-word-crossfade';
import { CreateBigDealButton } from '@/components/deals/CreateBigDealButton';
import { useStore } from '@/lib/store';
import { GoBigDealLogo } from '@/components/GoBigDealLogo';
import { useAuthContext } from '@/contexts/AuthContext';

/* ── GoBigDeal hero — motion karta s mockup dashboardem pod mlhou ──
 *
 * Dashboard je ZÁMĚRNĚ stylizovaný mockup, ne živá data: hodnoty jsou
 * ilustrační a nesou blur, takže stránka nic konkrétního netvrdí (pravidlo
 * poctivých čísel). Karta stojí nahoře v perspektivě, zdola ji přelévá mlha
 * (gradient + backdrop blur) a přes mlhu jde headline s duálním CTA —
 * kupující doleva (Browse deals), prodávající doprava (CreateBigDeal).
 * Nejnižší schod konverze (drop alert zdarma) je mikrolink pod CTA.
 */

/** Ilustrační odpočet — tiká kvůli pohybu v kartě, hodnota je pod blurem. */
function MockCountdown({ from }: { from: number }) {
  const [s, setS] = useState(from);
  useEffect(() => {
    const id = setInterval(() => setS((v) => (v > 0 ? v - 1 : 60 * 60 * 26)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <span className="font-mono text-[11px] font-semibold tabular-nums text-red-400 blur-[3px] select-none">
      {pad(h)} : {pad(m)} : {pad(sec)}
    </span>
  );
}

/** Ilustrační KPI dlaždice — hodnota schválně rozmazaná (mockup, ne tvrzení). */
function MockKpi({ label, value, spark }: { label: string; value: string; spark?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <span className="truncate text-[10px] font-medium uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <div className="flex items-end justify-between gap-2">
        <span className="font-sans text-2xl font-semibold tracking-tight text-white blur-[5px] select-none">
          {value}
        </span>
        {spark && (
          <svg viewBox="0 0 64 24" className="h-6 w-16 shrink-0 overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="gbd-spark" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#3b82f6" />
                <stop offset="0.5" stopColor="#22d3ee" />
                <stop offset="1" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0 20 L10 16 L20 18 L30 10 L40 12 L52 5 L64 2"
              fill="none"
              stroke="url(#gbd-spark)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, delay: 0.7, ease: 'easeOut' }}
            />
          </svg>
        )}
      </div>
    </div>
  );
}

/** Ilustrační karta dealu — skeleton řádky, rozmazaná sleva a odpočet. */
function MockDealCard({ discount, seconds, wide }: { discount: string; seconds: number; wide?: string }) {
  return (
    <div className={`flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 ${wide ?? ''}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="h-3 w-16 rounded-full bg-white/15" />
        <span className="rounded-full bg-red-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-red-400 ring-1 ring-red-500/20 blur-[3px] select-none">
          {discount}
        </span>
      </div>
      <div className="space-y-1.5">
        <span className="block h-2.5 w-4/5 rounded-full bg-white/10" />
        <span className="block h-2.5 w-3/5 rounded-full bg-white/[0.07]" />
      </div>
      <div className="mt-auto flex items-center justify-between pt-1">
        <MockCountdown from={seconds} />
        <span className="h-2.5 w-10 rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export function HeroDealDashboard() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { openAuthModal } = useStore();
  const { user } = useAuthContext();

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#0b0d10]">
      {/* ── Dashboard v perspektivě — nahoře, zdola ho pohltí mlha ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-8 flex justify-center [perspective:1600px] sm:top-10"
      >
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 70, rotateX: 26 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, rotateX: 14 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-[min(1060px,94vw)] [transform-style:preserve-3d]"
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-[#12161b] to-[#0d1014] p-5 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)] sm:p-6"
          >
            {/* horní lišta dashboardu — gradientovou tečku nese samo logo */}
            <div className="flex items-center gap-3">
              <GoBigDealLogo className="text-sm text-white" />
              <div className="ml-3 hidden items-center gap-1 sm:flex">
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-zinc-900">Live</span>
                <span className="rounded-full px-3 py-1 text-[11px] font-medium text-zinc-400">Ending first</span>
                <span className="rounded-full px-3 py-1 text-[11px] font-medium text-zinc-400">Want Deals</span>
                <span className="rounded-full px-3 py-1 text-[11px] font-medium text-zinc-400">Split Deals</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-zinc-500 md:flex">
                  <Search className="h-3 w-3" /> Search deals
                </span>
                <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  <Bell className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span className="h-7 w-7 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700" />
              </div>
            </div>

            {/* KPI řada — hodnoty pod blurem */}
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MockKpi label="Live deals" value="12" spark />
              <MockKpi label="Closing today" value="3" />
              <MockKpi label="Top discount" value="−64 %" />
              <MockKpi label="Buyers watching" value="1 284" spark />
            </div>

            {/* karty dealů — skeletony s tikajícími (rozmazanými) odpočty.
                Na mobilu se nevejdou nad mlhu a prosvítaly by pod headline,
                proto tam karta končí KPI dlaždicemi. */}
            <div className="mt-3 hidden grid-cols-2 gap-3 sm:grid lg:grid-cols-3">
              <MockDealCard discount="−52 %" seconds={60 * 60 * 1 + 60 * 17 + 42} />
              <MockDealCard discount="−48 %" seconds={60 * 60 * 9 + 60 * 3 + 11} />
              <MockDealCard discount="−71 %" seconds={60 * 60 * 22 + 60 * 45 + 8} wide="hidden lg:flex" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Mlha — zdola přelévá dashboard, text jede přes ni ── */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[68%]">
        <div className="absolute inset-0 backdrop-blur-[9px] [mask-image:linear-gradient(to_top,black_58%,transparent)] [-webkit-mask-image:linear-gradient(to_top,black_58%,transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d10] from-32% via-[#0b0d10]/80 via-60% to-transparent" />
      </div>

      {/* ── Copy přes mlhu + duální CTA ── */}
      <div className="relative z-10 mt-auto flex flex-col items-center px-6 pb-[12vh] text-center sm:pb-[10vh]">
        <h2 className="font-sans font-extralight tracking-tight leading-[1.08] text-white text-[clamp(2.4rem,8vw,3.2rem)] sm:text-[clamp(3.2rem,6.5vw,5rem)]">
          <PerWordCrossfade stagger={90}>Catch the deal.</PerWordCrossfade>
          <br />
          <PerWordCrossfade delay={420} stagger={90}>Or drop your own.</PerWordCrossfade>
        </h2>
        <p className="mt-5 max-w-xl text-[15px] font-light leading-relaxed text-zinc-400 sm:text-lg">
          The B2B exchange for closeout batches. One price, one deadline, verified
          traders across Europe — when the timer runs out, the deal is gone.
        </p>

        {/* Primární CTA: host → B2B registrace (navbar ji už nenese, zůstal
            tam jen Přihlásit); caption o verifikaci visí absolutně pod
            pilulkou, ať nesune layout. Přihlášený registraci nepotřebuje —
            dostane Browse deals. Vedle vždy CreateBigDeal. */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <button
              type="button"
              onClick={() => navigate('/deals')}
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-zinc-900 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)] transition-all hover:-translate-y-0.5 hover:bg-zinc-100 hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.65)]"
            >
              Browse deals
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </button>
          ) : (
            <div className="relative flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => openAuthModal('b2b')}
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-zinc-900 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)] transition-all hover:-translate-y-0.5 hover:bg-zinc-100 hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.65)]"
              >
                B2B registration
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </button>
              <span className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-[10px] leading-none tracking-wide text-white/60">
                Verify Account in 24h
              </span>
            </div>
          )}
          {/* stejná komponenta jako v navigaci — tvar, písmo i chování 1:1 */}
          <CreateBigDealButton className="h-11 px-6 text-[15px]" />
        </div>

      </div>

      <ChevronDown
        className="absolute bottom-5 left-1/2 z-10 h-6 w-6 -translate-x-1/2 animate-bounce text-white/60"
        aria-hidden
      />
    </section>
  );
}
