import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Check } from 'lucide-react';
import { useDealAlerts, type DealAlertsApi } from '@/hooks/useDealAlerts';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { ConcernCarousel, type ConcernCarouselTexts } from '@/components/ConcernCarousel';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import { BrandAlertCarousel } from './BrandAlertCarousel';
import { ModelAlertSearch } from './ModelAlertSearch';
import { GoBigDealStrip } from './GoBigDealStrip';
import { openEarlyAccessUpsell } from './EarlyAccessUpsell';
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

export function HomeTopDeals() {
  const openAuthModal = useStore((s) => s.openAuthModal);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const alertsApi = useDealAlerts();
  const { hasEarlyAccess } = useEarlyAccess();
  const [exploreOpen, setExploreOpen] = useState(false);

  const requireAuth = () => openAuthModal('register');

  // Kotvy #gbd-alerts-* — proklik z tlačítka „Set a GoBigDeal alert"
  // v mega menu doscrolluje na příslušnou úroveň alertů.
  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (id.startsWith('gbd-alerts')) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    alertsApi.toggle('concern', slug, name);
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
          <h2 className="font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.5rem,calc((100vw-120px)/22),3.5rem)]">
            <span className="text-zinc-900">Go Big Deal </span>
            <span className="text-zinc-600">with </span>
            <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              bigger wholesale discount
            </span>
          </h2>
        </div>

        {/* nekonečný swipovatelný pás — gateway karta jede v pásu */}
        <div className="mx-auto mt-10 max-w-[1160px] sm:mt-14">
          <GoBigDealStrip />
        </div>
      </div>

      {/* watchdog úroveň 1: koncerny — klik vede na /koncerny/:slug */}
      <div id="gbd-alerts-concerns" className="mt-12 scroll-mt-24 sm:mt-16">
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
      <div id="gbd-alerts-brands" className="mt-12 scroll-mt-24 sm:mt-16">
        <h3 className="mb-6 px-5 text-center font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.35rem,3vw,2.25rem)] text-zinc-900">
          Set GoBigDeal alerts on brands
        </h3>
        <div className="mx-auto max-w-[1400px] px-1 sm:px-3 lg:px-5">
          <BrandAlertCarousel alertsApi={alertsApi} onRequireAuth={requireAuth} />
        </div>
      </div>

      {/* watchdog úroveň 3: jednotlivé modely — našeptávač */}
      <div id="gbd-alerts-models" className="mx-auto mt-12 max-w-[640px] scroll-mt-24 px-5 sm:mt-16 sm:px-0">
        <h3 className="mb-6 text-center font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.35rem,3vw,2.25rem)] text-zinc-900">
          Set GoBigDeal alerts on individual models
        </h3>
        <ModelAlertSearch alertsApi={alertsApi} onRequireAuth={requireAuth} />
      </div>

      {/* pricing — čtyřúrovňový paywall na konci sekce, pod alerty */}
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
