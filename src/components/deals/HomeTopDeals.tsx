import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';
import { dealIsLive, type Deal } from '@/lib/deals';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { CountdownTimer } from './CountdownTimer';
import { BrandLogo } from '@/components/BrandLogo';
import { ConcernCarousel, type ConcernCarouselTexts } from '@/components/ConcernCarousel';
import { getConcernForDeal } from '@/data/concerns';

/**
 * Homepage sekce „Top Deals" — bílá full-width karta se zaobleným horním
 * okrajem, řazena pod kartu „Connect swelt to your AI workflow" (zaoblené
 * rohy odkrývají černý wrapper v Index.tsx).
 * Celá sekce je záměrně anglicky (jako ostatní tmavé homepage sekce),
 * proto vždy čte EN slovník a countdownům vnucuje lang="en".
 *
 * Skladba (schválený návrh): hero deal s nejbližší uzávěrkou + locked/blur
 * karty nadcházejících dealů (Insider vidí každý deal o 48 h dříve — hybridní
 * paywall: registrace zdarma = den startu, Insider = 48 h náskok) + countdown
 * „next drop" + carousel koncernů s watchdog CTA (klik vede na koncern).
 */
const t = dealsI18n.en;

/** EN texty pro koncernový carousel — watchdog CTA, klik vede na koncern. */
const CONCERN_TEXTS: ConcernCarouselTexts = {
  heading: null,
  groupLabel: 'Concern',
  brandsLabel: 'Concern brands',
  cta: 'Set a watchdog',
  brandWord: (n) => (n === 1 ? 'brand' : 'brands'),
  modelsWord: 'models',
  prevAria: 'Previous',
  nextAria: 'Next',
};

export function HomeTopDeals() {
  const openAuthModal = useStore((s) => s.openAuthModal);
  const { user } = useAuthContext();
  const { deals, productCounts, loading } = useDeals();

  // Hero = běžící deal s nejbližší uzávěrkou (největší tlak na rozhodnutí).
  const hero = useMemo(() => {
    const now = Date.now();
    return (
      deals
        .filter((d) => dealIsLive(d) && new Date(d.starts_at).getTime() <= now)
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0] ?? null
    );
  }, [deals]);

  // Nadcházející dealy (aktivní, ještě neodstartované) → locked karty.
  const upcoming = useMemo(() => {
    const now = Date.now();
    return deals
      .filter((d) => d.status === 'active' && new Date(d.starts_at).getTime() > now)
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .slice(0, 2);
  }, [deals]);

  // Vždy dva locked sloty — chybějící reálné dealy doplní placeholder,
  // aby sekce žila i v období bez naplánovaného dropu.
  const lockedSlots: (Deal | null)[] = [...upcoming];
  while (lockedSlots.length < 2) lockedSlots.push(null);

  return (
    // Světle šedá karta na černé zóně — bílé karty uvnitř na ní vyniknou;
    // zaoblené rohy odkrývají černý wrapper v Index.tsx.
    <section className="relative w-full rounded-t-[1.75rem] bg-slate-100 pt-16 pb-16 sm:rounded-t-[2.75rem] sm:pt-24 sm:pb-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-10 lg:px-14">
        {/* headline blok — jediný velký odstavec ve stejné typografii jako
            DropshipHeadline (extralight clamp, tlumená slova + gradientový
            závěr věty), stejné zarovnání jako dropship sekce výše */}
        <div className="mx-auto max-w-[1000px] text-left">
          {/* šedá slova musí být tmavší než slate-100 pozadí → zinc-500;
              Insider paywall s cenou je součástí headline (stejný font) */}
          <h2 className="font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.5rem,calc((100vw-120px)/22),3.5rem)]">
            <span className="text-zinc-900">Catch your deal of the year and earn more. </span>
            <span className="text-zinc-500">
              Closeout collections straight from the concerns you already know{' '}
            </span>
            <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              reserved in the order received.
            </span>
            <span className="text-zinc-500"> Insiders see every deal 48 hours early </span>
            <span className="text-zinc-900">for €18.</span>
          </h2>
        </div>

        {/* hero deal + locked karty */}
        <div className="mx-auto mt-10 grid max-w-[1000px] gap-4 sm:mt-14 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          {loading ? (
            <div className="min-h-[320px] animate-pulse rounded-2xl bg-slate-200" />
          ) : hero ? (
            <HeroDealCard deal={hero} count={productCounts[hero.id] ?? 0} />
          ) : (
            <EmptyHeroCard />
          )}
          <div className="grid gap-4">
            {lockedSlots.map((d, i) =>
              d ? <LockedDealCard key={d.id} deal={d} /> : <LockedPlaceholderCard key={`ph-${i}`} />,
            )}
          </div>
        </div>

        {/* CTA řada */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12">
          <Link
            to="/deals"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-zinc-800"
          >
            {t.home.browseCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {!user && (
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:border-slate-400 hover:bg-white"
            >
              <Lock className="h-3.5 w-3.5" />
              {t.home.earlyAccessCta}
            </button>
          )}
        </div>
      </div>

      {/* carousel koncernů — watchdog CTA, klik vede na /koncerny/:slug;
          full-bleed jako BrandShowcaseCarousel na bílé kartě výše */}
      <div className="mt-12 sm:mt-16">
        <p className="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          {t.home.concernsLabel}
        </p>
        <div className="mx-auto max-w-[1400px] px-1 sm:px-3 lg:px-5">
          <ConcernCarousel texts={CONCERN_TEXTS} appearance="ios" />
        </div>
      </div>
    </section>
  );
}

/** Velká bílá karta běžícího dealu — koncern, countdown, čísla, CTA. */
function HeroDealCard({ deal, count }: { deal: Deal; count: number }) {
  const concern = getConcernForDeal(deal);
  const maxDiscount = deal.tiers.reduce((m, x) => Math.max(m, x.discount_percent), 0);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-100">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          {t.home.liveLabel}
        </span>
        <CountdownTimer deadline={deal.deadline} variant="compact" lang="en" />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {concern && (
          <div className="mb-4 flex h-16 items-center">
            <BrandLogo
              name={concern.name}
              domain={concern.domain}
              width={360}
              height={140}
              className="max-h-12 max-w-[200px] object-contain [mix-blend-mode:multiply]"
              fallbackClassName="font-display text-xl font-black tracking-tight text-foreground"
            />
          </div>
        )}
        <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {deal.title}
        </h3>
        {deal.subtitle && (
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{deal.subtitle}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {count > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {count} {t.card.models}
            </span>
          )}
          {deal.brands.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {deal.brands.length} {t.card.brands}
            </span>
          )}
          {maxDiscount > 0 && (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 ring-1 ring-red-100">
              {t.card.discountUpTo} {maxDiscount}%
            </span>
          )}
        </div>
        {/* propojení na obsah o koncernu (data z concerns.ts) */}
        {concern && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <p className="text-xs leading-relaxed text-slate-500 line-clamp-3">
              {t.home.concernFallback}
            </p>
            <Link
              to={`/koncerny/${concern.slug}`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline"
            >
              {t.home.concernStoryCta}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
        <div className="mt-auto pt-5">
          <Link
            to={`/deals/${deal.slug}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:w-auto"
          >
            {t.home.heroCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Fallback hero, když zrovna neběží žádný deal — sekce žije dál. */
function EmptyHeroCard() {
  return (
    <div className="flex min-h-[280px] flex-col justify-center rounded-2xl border border-slate-200 bg-white p-8">
      <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
        {t.home.emptyHeroTitle}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">{t.home.emptyHeroSub}</p>
      <Link
        to="/deals"
        className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-600"
      >
        {t.home.browseCta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/** Zamčená karta nadcházejícího dealu — obsah rozmazaný, countdown do startu. */
function LockedDealCard({ deal }: { deal: Deal }) {
  const concern = getConcernForDeal(deal);
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <Lock className="h-3 w-3" />
          {t.home.unlocksIn}
        </span>
        <CountdownTimer deadline={deal.starts_at} variant="compact" lang="en" />
      </div>
      {/* rozmazaný teaser — koncern i název zůstávají skryté do odemčení */}
      <div className="pointer-events-none mt-4 select-none blur-[7px]" aria-hidden>
        {concern ? (
          <div className="flex h-12 w-fit items-center rounded-lg border border-slate-200 bg-white px-4">
            <BrandLogo
              name={concern.name}
              domain={concern.domain}
              width={200}
              height={80}
              className="max-h-6 max-w-[120px] object-contain"
              fallbackClassName="text-sm font-bold text-slate-800"
            />
          </div>
        ) : (
          <p className="text-base font-semibold text-slate-900">{deal.title}</p>
        )}
        <div className="mt-3 h-3 w-3/4 rounded-full bg-slate-300" />
        <div className="mt-2 h-3 w-1/2 rounded-full bg-slate-200" />
      </div>
      <p className="mt-4 text-xs text-slate-500">{t.home.lockedNote}</p>
    </div>
  );
}

/** Placeholder locked slot — žádný naplánovaný drop, ale FOMO zůstává. */
function LockedPlaceholderCard() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <Lock className="h-3 w-3" />
          {t.home.lockedTitle}
        </span>
        <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-[11px] font-bold text-slate-500">
          {t.home.comingSoon}
        </span>
      </div>
      <div className="mt-4" aria-hidden>
        <div className="h-3 w-4/5 rounded-full bg-slate-200" />
        <div className="mt-2 h-3 w-3/5 rounded-full bg-slate-200" />
        <div className="mt-2 h-3 w-2/5 rounded-full bg-slate-100" />
      </div>
      <p className="mt-4 text-xs text-slate-500">{t.home.lockedNote}</p>
    </div>
  );
}
