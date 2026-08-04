import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, BellRing, Check, ChevronDown } from 'lucide-react';
import { useDealAlerts, type DealAlertsApi } from '@/hooks/useDealAlerts';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { ConcernCarousel, type ConcernCarouselTexts } from '@/components/ConcernCarousel';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import { BrandAlertCarousel } from './BrandAlertCarousel';
import { ModelAlertSearch } from './ModelAlertSearch';
import { GoBigDealStrip } from './GoBigDealStrip';
import { Gbd } from '@/components/GoBigDealLogo';
import { CONCERNS } from '@/data/concerns';
import { WILDCARD } from '@/lib/alerts';
import { useBrandCatalog } from '@/hooks/useBrandCatalog';
import { sortByBrandPriority } from '@/lib/brandOrder';
import { openEarlyAccessUpsell } from './EarlyAccessUpsell';
import { GbdPricing } from './GbdPricing';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * Homepage sekce „GoBigDeal" — světle šedá full-width karta se zaobleným
 * horním okrajem, řazena pod kartu „Connect swelt to your AI agents"
 * (zaoblené rohy odkrývají černý wrapper v Index.tsx). Celá sekce je
 * záměrně anglicky, proto čte EN slovník.
 *
 * Skladba: headline → nekonečný pás GoBigDealStrip (gateway + dealy) →
 * watchdog alerty na třech úrovních (koncerny/značky/modely, s kotvami
 * #gbd-alerts-* pro proklik z mega menu) → čtyřúrovňový pricing (Explore
 * free · Insider €49/měs ročně, 50 % z kotvy · Flex €99/měs kotva ·
 * Enterprise na míru). Alerty zapisují do deal_alerts; notifikace později.
 */
const t = dealsI18n.en;

/** EN texty pro koncernový carousel — watchdog CTA, klik vede na koncern. */
const CONCERN_TEXTS: ConcernCarouselTexts = {
  heading: null,
  groupLabel: 'Concern',
  brandsLabel: 'Concern brands',
  cta: 'Set a deal alert',
  brandWord: (n) => (n === 1 ? 'brand' : 'brands'),
  modelsWord: 'models',
  prevAria: 'Previous',
  nextAria: 'Next',
};

/* Ceník (Tier/TIERS/PricingCard) se přestěhoval do sdílené komponenty
   GbdPricing — používá ho homepage i landing /deals. */

export function HomeTopDeals() {
  const openAuthModal = useStore((s) => s.openAuthModal);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const alertsApi = useDealAlerts();
  const { hasEarlyAccess } = useEarlyAccess();
  const [exploreOpen, setExploreOpen] = useState(false);
  /** Alerty (koncerny/značky/modely) jsou složené pod tlačítkem — sekce tak
   *  zůstává krátká; rozbalí je klik nebo proklik z mega menu (#gbd-alerts-*). */
  const [alertsOpen, setAlertsOpen] = useState(false);
  const requireAuth = () => openAuthModal('register');

  // Kotvy #gbd-* — proklik z mega menu (alerty) i z landingu /deals
  // (#gbd-pricing). U alertů je navíc potřeba blok nejdřív rozbalit.
  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (id.startsWith('gbd-')) {
      if (id.startsWith('gbd-alerts')) setAlertsOpen(true);
      // Scroll až po rozbalení; opakujeme, protože karusely dorovnávají výšku
      // po načtení log (jinak by scroll skončil vedle cíle).
      const timers = [80, 400, 900].map((ms) =>
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, ms),
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [location.hash]);

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
    // Je-li zapnutý hromadný alert, odebrání jednoho koncernu ho rozpadne
    // na jednotlivé alerty pro všechny ostatní.
    if (alertsApi.hasWildcard('concern')) {
      alertsApi.expandWildcard(
        'concern',
        feedConcerns.map((c) => ({ target: c.slug, label: c.name })),
        slug,
      );
      return;
    }
    alertsApi.toggle('concern', slug, name);
  };

  /* ── Hromadné alerty ──────────────────────────────────────────────────
     Seznamy musí odpovídat kartám v karuselech: koncerny přítomné ve feedu
     (ConcernCarousel je filtruje stejně) a všechny značky z katalogu.      */
  const { data: catalog = [] } = useBrandCatalog();

  const feedConcerns = useMemo(
    () =>
      CONCERNS.filter((c) =>
        catalog.some((e) => c.brandKeys.includes(e.key) && e.count > 0),
      ),
    [catalog],
  );
  const feedBrands = useMemo(() => sortByBrandPriority(catalog), [catalog]);

  // Hromadný alert = jeden wildcard řádek (level + '*'), ne N jednotlivých.
  const allConcernsOn = alertsApi.hasWildcard('concern');
  const allBrandsOn = alertsApi.hasWildcard('brand');

  /** Zapne/vypne alert na celou úroveň jedním zápisem (stejné hradlo jako zvoneček). */
  const toggleAll = (level: 'concern' | 'brand') => {
    if (!user) {
      requireAuth();
      return;
    }
    if (!hasEarlyAccess) {
      openEarlyAccessUpsell();
      return;
    }
    alertsApi.toggle(level, WILDCARD, level === 'concern' ? 'All concerns' : 'All brands');
  };

  // Placené tarify zatím nemají platební flow — nepřihlášený jde do
  // registrace, přihlášený na /deals; Enterprise píše obchodu.
  const handleTier = (id: 'drop' | 'pro' | 'enterprise' | 'explore') => {
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
    // Černá sekce (stejný odstín jako dropshipping) — bílé karty uvnitř na ní
    // vyniknou; zaoblené rohy odkrývají předchozí bílou sekci.
    <section className="relative w-full rounded-t-[1.75rem] bg-[#0d0d10] pt-16 pb-28 sm:rounded-t-[2.75rem] sm:pt-24 sm:pb-40">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-10 lg:px-14">
        {/* headline blok — jediný velký odstavec ve stejné typografii jako
            DropshipHeadline (extralight clamp, tlumená slova + gradientový
            závěr věty), stejné zarovnání jako dropship sekce výše */}
        <div className="mx-auto max-w-[1000px] text-left">
          <h2 className="font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.5rem,calc((100vw-120px)/22),3.5rem)]">
            <span className="text-white">Deals </span>
            <span className="text-zinc-400">with </span>
            <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              bigger wholesale discount
            </span>
          </h2>
        </div>

        {/* nekonečný swipovatelný pás — gateway karta jede v pásu */}
        <div className="mx-auto mt-10 max-w-[1160px] sm:mt-14">
          {/* sekce je černá → počítadlo v tmavé variantě */}
          <GoBigDealStrip onDark />
        </div>
      </div>

      {/* Alerty pod jedním tlačítkem — sekce zůstává krátká, obsah i funkčnost
          beze změny (rozbalený stav je 1:1 jako dřív). */}
      <div className="mt-12 flex justify-center px-5 sm:mt-16">
        <button
          type="button"
          onClick={() => setAlertsOpen((v) => !v)}
          aria-expanded={alertsOpen}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
        >
          <Bell className="h-4 w-4" /> Set deal alerts
          <ChevronDown className={`h-4 w-4 transition-transform ${alertsOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {alertsOpen && (
      <>
      {/* watchdog úroveň 1: koncerny — klik vede na /koncerny/:slug */}
      <div id="gbd-alerts-concerns" className="mt-12 scroll-mt-24 sm:mt-16">
        {/* jednotný vzor nadpisů — mění se jen koncovka (concerns/brands/models) */}
        <h3 className="mb-3 px-5 text-center font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.35rem,3vw,2.25rem)] text-white">
          Deal alerts on concerns
        </h3>
        {/* hromadné zapnutí + upozornění, že koncerny nepokrývají celý katalog */}
        <div className="mb-6 flex flex-col items-center gap-2 px-5">
          <button
            type="button"
            onClick={() => toggleAll('concern')}
            aria-pressed={allConcernsOn}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              allConcernsOn
                ? 'border border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                : 'bg-white text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {allConcernsOn ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {allConcernsOn ? 'Alerts on all concerns are on' : 'Alert me on all concerns'}
          </button>
          <p className="text-center text-xs text-zinc-500">
            Concerns don&rsquo;t cover every brand — some brands stand alone. Add brand alerts below.
          </p>
        </div>
        <div className="mx-auto max-w-[1400px] px-1 sm:px-3 lg:px-5">
          <ConcernCarousel
            texts={CONCERN_TEXTS}
            appearance="ios"
            alertBell={{
              isOn: (slug) => alertsApi.hasAny('concern', slug),
              onToggle: handleConcernBell,
              onAria: t.alertsUi.alertOn,
              offAria: t.alertsUi.setAlert,
            }}
          />
        </div>
      </div>

      {/* watchdog úroveň 2: značky — toggle alert na každé kartě */}
      <div id="gbd-alerts-brands" className="mt-12 scroll-mt-24 sm:mt-16">
        <h3 className="mb-3 px-5 text-center font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.35rem,3vw,2.25rem)] text-white">
          Deal alerts on brands
        </h3>
        {/* jedním klikem alert na všech {n} značek z katalogu */}
        <div className="mb-6 flex justify-center px-5">
          <button
            type="button"
            onClick={() => toggleAll('brand')}
            aria-pressed={allBrandsOn}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              allBrandsOn
                ? 'border border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                : 'bg-white text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {allBrandsOn ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {allBrandsOn
              ? 'Alerts on all brands are on'
              : `Alert me on all ${feedBrands.length} brands`}
          </button>
        </div>
        <div className="mx-auto max-w-[1400px] px-1 sm:px-3 lg:px-5">
          <BrandAlertCarousel alertsApi={alertsApi} onRequireAuth={requireAuth} />
        </div>
      </div>

      {/* watchdog úroveň 3: jednotlivé modely — našeptávač */}
      <div id="gbd-alerts-models" className="mx-auto mt-12 max-w-[640px] scroll-mt-24 px-5 sm:mt-16 sm:px-0">
        <h3 className="mb-6 text-center font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.35rem,3vw,2.25rem)] text-white">
          Deal alerts on individual models
        </h3>
        <ModelAlertSearch alertsApi={alertsApi} onRequireAuth={requireAuth} />
      </div>
      </>
      )}

      {/* pricing — paywall na konci sekce, pod alerty; sdílený blok
          s landing /deals (GbdPricing) */}
      <GbdPricing id="gbd-pricing" onTier={handleTier} />

      <ExploreDialog
        open={exploreOpen}
        onOpenChange={setExploreOpen}
        alertsApi={alertsApi}
        onRequireAuth={requireAuth}
        onInsider={() => {
          setExploreOpen(false);
          handleTier('pro');
        }}
      />
    </section>
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
            You don&rsquo;t have early access. Other buyers see <Gbd suffix="s" /> 48 hours before you
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
