import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Check, Lock } from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';
import { useDealAlerts, type DealAlertsApi } from '@/hooks/useDealAlerts';
import { dealIsLive, type Deal } from '@/lib/deals';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { CountdownTimer } from './CountdownTimer';
import { BrandLogo } from '@/components/BrandLogo';
import { ConcernCarousel, type ConcernCarouselTexts } from '@/components/ConcernCarousel';
import { getConcernForDeal } from '@/data/concerns';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import { BrandAlertCarousel } from './BrandAlertCarousel';
import { ModelAlertSearch } from './ModelAlertSearch';
import { openEarlyAccessUpsell } from './EarlyAccessUpsell';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * Homepage sekce „Top Deals" — světle šedá full-width karta se zaobleným
 * horním okrajem, řazena pod kartu „Connect swelt to your AI agents"
 * (zaoblené rohy odkrývají černý wrapper v Index.tsx). Celá sekce je
 * záměrně anglicky, proto čte EN slovník a countdownům vnucuje lang="en".
 *
 * Logika sekce (schváleno): hero deal + locked karty → čtyřúrovňový pricing
 * (Explore free · Insider €49/měs ročně, 50 % z kotvy · Flex €99/měs kotva ·
 * Enterprise na míru) → watchdog alerty na třech úrovních: koncerny
 * (ConcernCarousel), značky (BrandAlertCarousel) a jednotlivé modely
 * (ModelAlertSearch). Alerty zapisují do deal_alerts; notifikace později.
 */
const t = dealsI18n.en;

/** EN texty pro koncernový carousel — watchdog CTA, klik vede na koncern. */
const CONCERN_TEXTS: ConcernCarouselTexts = {
  heading: null,
  groupLabel: 'Concern',
  brandsLabel: 'Concern brands',
  cta: 'Set a Top Deal alert',
  brandWord: (n) => (n === 1 ? 'brand' : 'brands'),
  modelsWord: 'models',
  prevAria: 'Previous',
  nextAria: 'Next',
};

interface Tier {
  id: 'explore' | 'insider' | 'flex' | 'enterprise';
  name: string;
  /** Enterprise cenu nemá — jen note a features */
  price?: string;
  period?: string;
  /** přeškrtnutá kotva vedle ceny */
  was?: string;
  note?: string;
  badge?: string;
  features: string[];
  cta: string;
}

/** Čtyřúrovňový paywall — Flex 99 €/měs je záměrná cenová kotva pro Insider. */
const TIERS: Tier[] = [
  {
    id: 'explore',
    name: 'Explore',
    price: 'Free',
    note: 'no card needed',
    features: [
      'Browse and shop all top deals when they drop',
      'New top deal drop alerts',
      'Order at better wholesale prices',
    ],
    cta: 'Explore deals free',
  },
  {
    id: 'insider',
    name: 'Insider',
    price: '€49',
    period: '/month',
    was: '€99',
    note: 'billed annually',
    badge: 'Most popular · 50% off',
    features: ['48h early access to every deal', 'Concern alerts', 'Brand alerts', 'Model alerts'],
    cta: 'Get Insider',
  },
  {
    id: 'flex',
    name: 'Flex',
    price: '€99',
    period: '/month',
    note: 'cancel anytime',
    features: ['48h early access to every deal', 'Concern alerts', 'Brand alerts', 'Model alerts'],
    cta: 'Get Flex',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    note: 'for high-volume buyers',
    features: ['Higher quantities', 'Tailored deals & terms', 'Dedicated account manager'],
    cta: 'Contact us',
  },
];

export function HomeTopDeals() {
  const openAuthModal = useStore((s) => s.openAuthModal);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { deals, productCounts, loading } = useDeals();
  const alertsApi = useDealAlerts();
  const { hasEarlyAccess } = useEarlyAccess();
  const [exploreOpen, setExploreOpen] = useState(false);

  const requireAuth = () => openAuthModal('register');

  // Zvoneček na kartě koncernu — stejné hradlo jako všechny alert vstupy:
  // nepřihlášený → registrace, bez early accessu → upsell, jinak toggle.
  const handleConcernBell = (slug: string, name: string) => {
    if (!user) {
      requireAuth();
      return;
    }
    if (!hasEarlyAccess) {
      openEarlyAccessUpsell();
      return;
    }
    alertsApi.toggle('concern', slug, name);
  };

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

  // Placené tarify zatím nemají platební flow — nepřihlášený jde do
  // registrace, přihlášený na /deals; Enterprise píše obchodu.
  const handleTier = (id: Tier['id']) => {
    if (id === 'explore') {
      setExploreOpen(true);
    } else if (id === 'enterprise') {
      window.location.href = 'mailto:obchod@swelt.cz';
    } else {
      if (user) navigate('/deals');
      else requireAuth();
    }
  };

  return (
    // Šedá karta na černé zóně (neutrální zinc, žádný modrý nádech) — bílé
    // karty uvnitř na ní vyniknou; zaoblené rohy odkrývají černý wrapper.
    <section className="relative w-full rounded-t-[1.75rem] bg-zinc-100 pt-16 pb-28 sm:rounded-t-[2.75rem] sm:pt-24 sm:pb-40">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-10 lg:px-14">
        {/* headline blok — jediný velký odstavec ve stejné typografii jako
            DropshipHeadline (extralight clamp, tlumená slova + gradientový
            závěr věty), stejné zarovnání jako dropship sekce výše */}
        <div className="mx-auto max-w-[1000px] text-left">
          {/* šedá slova musí být tmavší než zinc-200 pozadí → zinc-600 */}
          <h2 className="font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.5rem,calc((100vw-120px)/22),3.5rem)]">
            <span className="text-zinc-600">
              Buy goods at an even bigger wholesale discount{' '}
            </span>
            <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              reserved in the order received.
            </span>
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

        {/* pricing — čtyřúrovňový paywall; lead věta přesunuta z headline sem */}
        <div className="mx-auto mt-12 max-w-[1160px] sm:mt-16">
          <h3 className="text-center font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.5rem,3.5vw,2.75rem)] text-zinc-900">
            Catch your deal of the year earlier and earn more.
          </h3>
          <p className="mt-3 text-center font-sans font-extralight tracking-tight text-xl sm:text-2xl">
            <span className="text-zinc-600">Insiders see every deal </span>
            <span className="text-zinc-900">48 hours early.</span>
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 pt-3 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <PricingCard key={tier.id} tier={tier} onSelect={() => handleTier(tier.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* watchdog úroveň 1: koncerny — klik vede na /koncerny/:slug */}
      <div className="mt-12 sm:mt-16">
        {/* jednotný vzor nadpisů — mění se jen koncovka (concerns/brands/models) */}
        <h3 className="mb-6 px-5 text-center font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.35rem,3vw,2.25rem)] text-zinc-900">
          Set Top Deal alerts on concerns
        </h3>
        <div className="mx-auto max-w-[1400px] px-1 sm:px-3 lg:px-5">
          <ConcernCarousel
            texts={CONCERN_TEXTS}
            appearance="ios"
            alertBell={{
              isOn: (slug) => alertsApi.has('concern', slug),
              onToggle: handleConcernBell,
              onAria: t.alertsUi.alertOn,
              offAria: t.alertsUi.setAlert,
            }}
          />
        </div>
      </div>

      {/* watchdog úroveň 2: značky — toggle alert na každé kartě */}
      <div className="mt-12 sm:mt-16">
        <h3 className="mb-6 px-5 text-center font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.35rem,3vw,2.25rem)] text-zinc-900">
          Set Top Deal alerts on brands
        </h3>
        <div className="mx-auto max-w-[1400px] px-1 sm:px-3 lg:px-5">
          <BrandAlertCarousel alertsApi={alertsApi} onRequireAuth={requireAuth} />
        </div>
      </div>

      {/* watchdog úroveň 3: jednotlivé modely — našeptávač */}
      <div className="mx-auto mt-12 max-w-[640px] px-5 sm:mt-16 sm:px-0">
        <h3 className="mb-6 text-center font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.35rem,3vw,2.25rem)] text-zinc-900">
          Set Top Deal alerts on individual models
        </h3>
        <ModelAlertSearch alertsApi={alertsApi} onRequireAuth={requireAuth} />
      </div>

      <ExploreDialog
        open={exploreOpen}
        onOpenChange={setExploreOpen}
        alertsApi={alertsApi}
        onRequireAuth={requireAuth}
        onInsider={() => {
          setExploreOpen(false);
          handleTier('insider');
        }}
      />
    </section>
  );
}

/** Jedna pricing karta — Insider je zvýrazněný modrým rámečkem (Most popular).
 *  Hierarchie: největší je NÁZEV tarifu, cena je menší pod ním. */
function PricingCard({ tier, onSelect }: { tier: Tier; onSelect: () => void }) {
  const featured = tier.id === 'insider';
  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-5 ${
        featured ? 'border-blue-600 ring-1 ring-blue-600 shadow-lg' : 'border-slate-200 shadow-sm'
      }`}
    >
      {tier.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          {tier.badge}
        </span>
      )}
      <p className="text-2xl font-semibold tracking-tight text-zinc-900">{tier.name}</p>
      {tier.price && (
        <p className="mt-2 flex items-baseline gap-1.5">
          {tier.was && (
            <span className="text-sm font-medium text-slate-400 line-through">{tier.was}</span>
          )}
          <span className="text-lg font-semibold tracking-tight text-zinc-900">{tier.price}</span>
          {tier.period && <span className="text-sm text-slate-500">{tier.period}</span>}
        </p>
      )}
      {tier.note && <p className="mt-1 text-xs text-slate-500">{tier.note}</p>}
      <ul className="mt-4 flex-1 space-y-2">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onSelect}
        className={`mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
          featured
            ? 'bg-zinc-900 text-white hover:bg-zinc-800'
            : 'border border-slate-300 text-slate-900 hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        {tier.cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** Free tier dialog — zapnout drop alert, projít dealy + FOMO upsell. */
function ExploreDialog({
  open,
  onOpenChange,
  alertsApi,
  onRequireAuth,
  onInsider,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  alertsApi: DealAlertsApi;
  onRequireAuth: () => void;
  onInsider: () => void;
}) {
  const dropOn = alertsApi.has('deals');

  const handleDrop = async () => {
    const ok = await alertsApi.toggle('deals', '', 'All deal drops');
    if (!ok) {
      onOpenChange(false);
      onRequireAuth();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start exploring deals</DialogTitle>
          <DialogDescription>
            Free forever. Turn on drop alerts so no deal slips past you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2.5">
          <button
            type="button"
            onClick={handleDrop}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              dropOn
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border border-slate-300 text-slate-900 hover:bg-slate-50'
            }`}
          >
            {dropOn ? (
              <>
                <Check className="h-4 w-4" /> Deal drop alerts on
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" /> Turn on deal drop alerts
              </>
            )}
          </button>
          <Link
            to="/deals"
            onClick={() => onOpenChange(false)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            Browse deals <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {/* FOMO upsell na Insider */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm leading-relaxed text-amber-900">
            You don&rsquo;t have early access. Other buyers see top deals 48 hours before you
            &mdash; the best pieces may be gone.
          </p>
          <button
            type="button"
            onClick={onInsider}
            className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-amber-900 underline underline-offset-2 transition-colors hover:text-amber-950"
          >
            Get Insider &mdash; &euro;49/month <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
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
    <div className="flex flex-col justify-between rounded-2xl border border-dashed border-slate-300 bg-white p-5">
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
