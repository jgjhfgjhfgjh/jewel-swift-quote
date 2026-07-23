import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Check, ChevronLeft, ChevronRight, Lock, Zap } from 'lucide-react';
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
  cta: 'Set a GoBigDeal alert',
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
      'Browse and shop all GoBigDeals when they drop',
      'New GoBigDeal drop alerts',
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

/** Karta ve swipovatelném pásu Big deals (sloupce po dvou). */
type StripCard =
  | { kind: 'locked'; deal: Deal }
  | { kind: 'locked-placeholder' }
  | { kind: 'live'; deal: Deal; isNew: boolean }
  | { kind: 'filler' };

/** Celková délka pásu — reálné dealy doplní placeholdery, ať má swipe smysl. */
const STRIP_TOTAL_CARDS = 12;

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

  // Běžící dealy (odstartované, před uzávěrkou).
  const liveDeals = useMemo(() => {
    const now = Date.now();
    return deals.filter((d) => dealIsLive(d) && new Date(d.starts_at).getTime() <= now);
  }, [deals]);

  // Hero = běžící deal s nejbližší uzávěrkou (největší tlak na rozhodnutí).
  const hero = useMemo(
    () =>
      [...liveDeals].sort(
        (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      )[0] ?? null,
    [liveDeals],
  );

  // Nadcházející dealy (aktivní, ještě neodstartované) → locked karty (2 sloty).
  const upcoming = useMemo(() => {
    const now = Date.now();
    return deals
      .filter((d) => d.status === 'active' && new Date(d.starts_at).getTime() > now)
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .slice(0, 2);
  }, [deals]);

  // Swipovatelný pás Big deals: nejdřív nejnovější (locked pro ne-odběratele,
  // odemčené s EARLY ACCESS odlišením pro odběratele), pak dropnuté od
  // nejnovějšího, zbytek doplní „coming soon" placeholdery do 12 karet.
  const stripCards = useMemo<StripCard[]>(() => {
    const cards: StripCard[] = upcoming.map((d) => ({ kind: 'locked' as const, deal: d }));
    while (cards.length < 2) cards.push({ kind: 'locked-placeholder' });
    [...liveDeals]
      .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())
      .forEach((d, i) => cards.push({ kind: 'live', deal: d, isNew: i === 0 }));
    while (cards.length < STRIP_TOTAL_CARDS) cards.push({ kind: 'filler' });
    return cards;
  }, [upcoming, liveDeals]);
  const realDealCount = upcoming.length + liveDeals.length;

  // Klik na locked kartu = konverzní vstup: nepřihlášený → registrace,
  // bez early accessu → upsell, odběratel → deal (nebo /deals u placeholderu).
  const handleLockedClick = (deal?: Deal) => {
    if (!user) {
      requireAuth();
      return;
    }
    if (!hasEarlyAccess) {
      openEarlyAccessUpsell();
      return;
    }
    navigate(deal ? `/deals/${deal.slug}` : '/deals');
  };

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
    <section className="relative w-full rounded-t-[1.75rem] bg-zinc-50 pt-16 pb-28 sm:rounded-t-[2.75rem] sm:pt-24 sm:pb-40">
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

        {/* gateway karta (copy, později video) + swipovatelný pás Big deals —
            sloupce po dvou kartách, dvě řady i na mobilu */}
        <div className="mx-auto mt-10 grid max-w-[1160px] gap-4 sm:mt-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          {loading ? (
            <div className="min-h-[360px] animate-pulse rounded-2xl bg-slate-200" />
          ) : hero ? (
            <HeroDealCard deal={hero} count={productCounts[hero.id] ?? 0} />
          ) : (
            <EmptyHeroCard />
          )}
          <DealStrip
            cards={stripCards}
            realCount={realDealCount}
            hasEarlyAccess={hasEarlyAccess}
            onLockedClick={handleLockedClick}
          />
        </div>
      </div>

      {/* watchdog úroveň 1: koncerny — klik vede na /koncerny/:slug */}
      <div className="mt-12 sm:mt-16">
        {/* jednotný vzor nadpisů — mění se jen koncovka (concerns/brands/models) */}
        <h3 className="mb-6 px-5 text-center font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.35rem,3vw,2.25rem)] text-zinc-900">
          Set GoBigDeal alerts on concerns
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
          Set GoBigDeal alerts on brands
        </h3>
        <div className="mx-auto max-w-[1400px] px-1 sm:px-3 lg:px-5">
          <BrandAlertCarousel alertsApi={alertsApi} onRequireAuth={requireAuth} />
        </div>
      </div>

      {/* watchdog úroveň 3: jednotlivé modely — našeptávač */}
      <div className="mx-auto mt-12 max-w-[640px] px-5 sm:mt-16 sm:px-0">
        <h3 className="mb-6 text-center font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.35rem,3vw,2.25rem)] text-zinc-900">
          Set GoBigDeal alerts on individual models
        </h3>
        <ModelAlertSearch alertsApi={alertsApi} onRequireAuth={requireAuth} />
      </div>

      {/* pricing — čtyřúrovňový paywall na konci sekce, pod alerty; lead věta
          nad ceníkem (přesunuto z headline i z pozice pod hero kartami) */}
      <div className="mx-auto mt-16 max-w-[1160px] px-5 sm:mt-24 sm:px-10 lg:px-14">
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
            You don&rsquo;t have early access. Other buyers see GoBigDeals 48 hours before you
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

/** Swipovatelný pás Big deals — sloupce po dvou kartách, scroll-snap,
 *  desktopové šipky na hoveru, fade na pravém okraji a počítadlo dealů. */
function DealStrip({
  cards,
  realCount,
  hasEarlyAccess,
  onLockedClick,
}: {
  cards: StripCard[];
  realCount: number;
  hasEarlyAccess: boolean;
  onLockedClick: (deal?: Deal) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const pairs: StripCard[][] = [];
  for (let i = 0; i < cards.length; i += 2) pairs.push(cards.slice(i, i + 2));

  return (
    <div className="min-w-0">
      <div className="group relative">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]
                     [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {pairs.map((pair, i) => (
            <div key={i} className="flex w-[270px] shrink-0 snap-start flex-col gap-4 sm:w-[300px]">
              {pair.map((card, j) => {
                switch (card.kind) {
                  case 'locked':
                    return (
                      <StripLockedCard
                        key={`${card.deal.id}-${j}`}
                        deal={card.deal}
                        unlocked={hasEarlyAccess}
                        onLockedClick={() => onLockedClick(card.deal)}
                      />
                    );
                  case 'locked-placeholder':
                    return <StripLockedPlaceholder key={`lp-${i}-${j}`} onClick={() => onLockedClick()} />;
                  case 'live':
                    return <StripLiveCard key={card.deal.id} deal={card.deal} isNew={card.isNew} />;
                  default:
                    return <StripFillerCard key={`f-${i}-${j}`} />;
                }
              })}
            </div>
          ))}
        </div>
        {/* fade na pravém okraji — signál, že pás pokračuje */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-zinc-50 to-transparent"
        />
        {/* šipky (desktop, na hover) */}
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur border border-slate-200 text-zinc-700 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur border border-slate-200 text-zinc-700 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      {/* počítadlo — jen reálné dealy, ne placeholdery */}
      {realCount > 0 && (
        <p className="mt-3 text-xs font-semibold text-slate-500">
          {realCount} GoBigDeal{realCount === 1 ? '' : 's'} · swipe for more
        </p>
      )}
    </div>
  );
}

/** Malá karta dropnutého (živého) dealu — logo, název, countdown, sleva. */
function StripLiveCard({ deal, isNew }: { deal: Deal; isNew: boolean }) {
  const concern = getConcernForDeal(deal);
  const maxDiscount = deal.tiers.reduce((m, x) => Math.max(m, x.discount_percent), 0);
  return (
    <Link
      to={`/deals/${deal.slug}`}
      className="relative flex h-[172px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      {isNew && (
        <span className="absolute -top-2.5 left-4 animate-pulse rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          New
        </span>
      )}
      <div className="flex items-center justify-between gap-2">
        {concern ? (
          <BrandLogo
            name={concern.name}
            domain={concern.domain}
            width={200}
            height={80}
            className="max-h-6 max-w-[110px] object-contain [mix-blend-mode:multiply]"
            fallbackClassName="truncate text-xs font-bold text-slate-700"
          />
        ) : (
          <span className="truncate text-xs font-bold text-slate-700">
            {deal.supplier || deal.title}
          </span>
        )}
        <CountdownTimer deadline={deal.deadline} variant="compact" lang="en" />
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
        {deal.title}
      </p>
      <div className="mt-auto flex items-center justify-between gap-2">
        {maxDiscount > 0 ? (
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 ring-1 ring-red-100">
            {t.card.discountUpTo} {maxDiscount}%
          </span>
        ) : (
          <span />
        )}
        <ArrowRight className="h-4 w-4 text-slate-400" />
      </div>
    </Link>
  );
}

/** Nejnovější (ještě neodstartovaný) deal: pro ne-odběratele zamčená karta
 *  s rozmazaným obsahem (klik = upsell), pro odběratele odemčená s výrazným
 *  EARLY ACCESS odlišením (modrý rámeček + badge) — „vidíš něco navíc". */
function StripLockedCard({
  deal,
  unlocked,
  onLockedClick,
}: {
  deal: Deal;
  unlocked: boolean;
  onLockedClick: () => void;
}) {
  const concern = getConcernForDeal(deal);

  if (unlocked) {
    return (
      <Link
        to={`/deals/${deal.slug}`}
        className="relative flex h-[172px] flex-col rounded-2xl border border-blue-600 bg-white p-4 shadow-sm ring-1 ring-blue-600 transition-shadow hover:shadow-md"
      >
        <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          <Zap className="h-3 w-3" /> Early access
        </span>
        <div className="flex items-center justify-between gap-2">
          {concern ? (
            <BrandLogo
              name={concern.name}
              domain={concern.domain}
              width={200}
              height={80}
              className="max-h-6 max-w-[110px] object-contain [mix-blend-mode:multiply]"
              fallbackClassName="truncate text-xs font-bold text-slate-700"
            />
          ) : (
            <span className="truncate text-xs font-bold text-slate-700">
              {deal.supplier || deal.title}
            </span>
          )}
          <CountdownTimer deadline={deal.starts_at} variant="compact" lang="en" />
        </div>
        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
          {deal.title}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-blue-700">
            Only Insiders see this now
          </span>
          <ArrowRight className="h-4 w-4 text-blue-600" />
        </div>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onLockedClick}
      className="flex h-[172px] w-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <Lock className="h-3 w-3" />
          {t.home.unlocksIn}
        </span>
        <CountdownTimer deadline={deal.starts_at} variant="compact" lang="en" />
      </div>
      {/* rozmazaný teaser — koncern i název zůstávají skryté do odemčení */}
      <div className="pointer-events-none select-none blur-[7px]" aria-hidden>
        {concern ? (
          <div className="flex h-10 w-fit items-center rounded-lg border border-slate-200 bg-white px-3">
            <BrandLogo
              name={concern.name}
              domain={concern.domain}
              width={200}
              height={80}
              className="max-h-5 max-w-[100px] object-contain"
              fallbackClassName="text-sm font-bold text-slate-800"
            />
          </div>
        ) : (
          <p className="text-sm font-semibold text-slate-900">{deal.title}</p>
        )}
        <div className="mt-2 h-2.5 w-3/4 rounded-full bg-slate-300" />
      </div>
      <p className="text-xs text-slate-500">{t.home.lockedNote}</p>
    </button>
  );
}

/** Zamčený slot bez naplánovaného dropu — FOMO zůstává, klik = upsell. */
function StripLockedPlaceholder({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[172px] w-full flex-col justify-between rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-left transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <Lock className="h-3 w-3" />
          {t.home.lockedTitle}
        </span>
        <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-[11px] font-bold text-slate-500">
          {t.home.comingSoon}
        </span>
      </div>
      <div aria-hidden>
        <div className="h-2.5 w-4/5 rounded-full bg-slate-200" />
        <div className="mt-2 h-2.5 w-3/5 rounded-full bg-slate-200" />
      </div>
      <p className="text-xs text-slate-500">{t.home.lockedNote}</p>
    </button>
  );
}

/** Výplňový placeholder na konci pásu — další Big deals na cestě. */
function StripFillerCard() {
  return (
    <div className="flex h-[172px] flex-col justify-between rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4">
      <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
        {t.home.comingSoon}
      </span>
      <div aria-hidden>
        <div className="h-2.5 w-4/5 rounded-full bg-slate-100" />
        <div className="mt-2 h-2.5 w-3/5 rounded-full bg-slate-100" />
      </div>
      <p className="text-xs text-slate-400">More GoBigDeals on the way.</p>
    </div>
  );
}
