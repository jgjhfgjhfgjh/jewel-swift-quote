import { useMemo } from 'react';
import { Bell, BellRing, Check, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/BrandLogo';
import { ModelAlertSearch } from '@/components/deals/ModelAlertSearch';
import { openEarlyAccessUpsell } from '@/components/deals/EarlyAccessUpsell';
import { tintForKey } from '@/components/deals/catalog/tints';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { useDealAlerts } from '@/hooks/useDealAlerts';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import { useBrandCatalog } from '@/hooks/useBrandCatalog';
import { sortByBrandPriority } from '@/lib/brandOrder';
import { CONCERNS } from '@/data/concerns';
import { WILDCARD, type AlertLevel, type DealAlert } from '@/lib/alerts';

/** Popisek úrovně alertu v chipech — texty EN jako celý GoBigDeal svět. */
const LEVEL_LABEL: Record<AlertLevel, string> = {
  deals: 'Drops',
  concern: 'Concern',
  brand: 'Brand',
  product: 'Model',
};

/**
 * /alerts — správa deal alertů na celé stránce (protějšek /favorites pro
 * watchdogy): přehled aktivních alertů s možností odebrat, pod tím přidávání
 * po úrovních — koncerny, značky (obojí s hromadným wildcard přepínačem)
 * a našeptávač modelů. Stejná hradla jako na homepage: nepřihlášený →
 * registrace, concern/brand bez early accessu → PRO upsell, drop alert free.
 */
export default function Alerts() {
  const openAuthModal = useStore((s) => s.openAuthModal);
  const { user, loading: authLoading } = useAuthContext();
  const alertsApi = useDealAlerts();
  const { hasEarlyAccess } = useEarlyAccess();
  const { data: catalog = [] } = useBrandCatalog();

  // Stejné seznamy jako alert sekce na homepage — koncerny přítomné ve feedu,
  // všechny značky z katalogu v prioritním řazení.
  const feedConcerns = useMemo(
    () => CONCERNS.filter((c) => catalog.some((e) => c.brandKeys.includes(e.key) && e.count > 0)),
    [catalog],
  );
  const feedBrands = useMemo(() => sortByBrandPriority(catalog), [catalog]);

  const requireAuth = () => openAuthModal('register');

  /** Hradlo placených úrovní (concern/brand): registrace → PRO upsell. */
  const gate = () => {
    if (!user) { requireAuth(); return false; }
    if (!hasEarlyAccess) { openEarlyAccessUpsell(); return false; }
    return true;
  };

  const toggleConcern = (slug: string, name: string) => {
    if (!gate()) return;
    if (alertsApi.hasWildcard('concern')) {
      alertsApi.expandWildcard('concern', feedConcerns.map((c) => ({ target: c.slug, label: c.name })), slug);
      return;
    }
    alertsApi.toggle('concern', slug, name);
  };

  const toggleBrand = (key: string, name: string) => {
    if (!gate()) return;
    if (alertsApi.hasWildcard('brand')) {
      alertsApi.expandWildcard('brand', feedBrands.map((b) => ({ target: b.key, label: b.name })), key);
      return;
    }
    alertsApi.toggle('brand', key, name);
  };

  const toggleAll = (level: 'concern' | 'brand') => {
    if (!gate()) return;
    alertsApi.toggle(level, WILDCARD, level === 'concern' ? 'All concerns' : 'All brands');
  };

  /** Drop alert (všechny nové dealy) je free — jen přihlášení. */
  const toggleDrop = async () => {
    const ok = await alertsApi.toggle('deals', '', 'All deal drops');
    if (!ok) requireAuth();
  };

  const dropOn = alertsApi.has('deals');
  // Aktivní watchdogy bez drop alertu — ten má vlastní kartu nahoře.
  const active = alertsApi.alerts.filter((a) => a.level !== 'deals');

  /** Logo/doména pro řádek aktivního alertu podle úrovně a cíle. */
  const alertVisual = (a: DealAlert): { name: string; domain?: string } => {
    if (a.target === WILDCARD) return { name: a.label || 'All' };
    if (a.level === 'concern') {
      const c = CONCERNS.find((x) => x.slug === a.target);
      return { name: c?.name ?? a.label ?? a.target, domain: c?.domain };
    }
    if (a.level === 'brand') {
      const b = feedBrands.find((x) => x.key === a.target);
      return { name: b?.name ?? a.label ?? a.target, domain: b?.domain };
    }
    return { name: a.label || a.target };
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <BackButton />

      {/* ── Hlavička — vzdušná jako detail dealu ── */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-5xl px-6 pb-10 pt-24 text-center sm:pb-12 sm:pt-32">
          <div className="mb-5 flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
              <Bell className="h-6 w-6 text-zinc-900" />
            </span>
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight text-foreground sm:text-5xl">
            Deal alerts
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Know the moment a deal drops — watch concerns, brands, or individual models.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pb-24">
        {!user && !authLoading ? (
          /* ── Nepřihlášený — prázdný stav jako na /favorites ── */
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <h2 className="font-display text-2xl font-black tracking-tight">
              Sign in to manage your alerts
            </h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Alerts are tied to your account, so they follow you on every device.
            </p>
            <Button size="lg" className="mt-6" onClick={() => openAuthModal('register')}>
              Create a free account
            </Button>
          </div>
        ) : (
          <>
            {/* ── Drop alert — free úroveň, jedna karta s přepínačem ── */}
            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-zinc-50 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">Deal drop alerts</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Every GoBigDeal the moment it goes public. Free forever.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleDrop}
                aria-pressed={dropOn}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                  dropOn
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800'
                }`}
              >
                {dropOn ? (<><Check className="h-4 w-4" /> On</>) : (<><Bell className="h-4 w-4" /> Turn on</>)}
              </button>
            </div>

            {/* ── Aktivní alerty ── */}
            <h2 className="mt-12 text-lg font-semibold tracking-tight text-foreground">Your alerts</h2>
            {active.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No alerts yet — pick concerns or brands below.
              </p>
            ) : (
              <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
                {active.map((a) => {
                  const v = alertVisual(a);
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-2.5"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] p-1.5"
                        style={{ backgroundColor: tintForKey(a.target === WILDCARD ? a.level : a.target) }}
                      >
                        {v.domain ? (
                          <BrandLogo
                            name={v.name}
                            domain={v.domain}
                            width={160}
                            height={80}
                            className="max-h-[18px] max-w-full object-contain [mix-blend-mode:multiply]"
                            fallbackClassName="text-[9px] font-bold leading-none text-zinc-700"
                          />
                        ) : (
                          <BellRing className="h-4 w-4 text-zinc-700" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {a.target === WILDCARD ? (a.label || 'All') : v.name}
                        </span>
                        <span className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                          {LEVEL_LABEL[a.level]}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => alertsApi.remove(a.level, a.target)}
                        aria-label={`Remove alert: ${v.name}`}
                        className="shrink-0 rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Přidávání alertů — koncerny a značky vedle sebe ── */}
            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              <AlertPicker
                title="Concerns"
                note="Concerns don't cover every brand — some brands stand alone."
                allOn={alertsApi.hasWildcard('concern')}
                onToggleAll={() => toggleAll('concern')}
                items={feedConcerns.map((c) => ({ key: c.slug, name: c.name, domain: c.domain }))}
                isOn={(key) => alertsApi.hasAny('concern', key)}
                onToggle={(key, name) => toggleConcern(key, name)}
              />
              <AlertPicker
                title="Brands"
                note={`All ${feedBrands.length} brands from the live feed.`}
                allOn={alertsApi.hasWildcard('brand')}
                onToggleAll={() => toggleAll('brand')}
                items={feedBrands.map((b) => ({ key: b.key, name: b.name, domain: b.domain }))}
                isOn={(key) => alertsApi.hasAny('brand', key)}
                onToggle={(key, name) => toggleBrand(key, name)}
              />
            </div>

            {/* ── Modely — našeptávač nad feedem ── */}
            <div className="mt-12 max-w-2xl">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Individual models</h2>
              <p className="mb-4 mt-1 text-sm text-muted-foreground">
                Watch a single model — search by name, SKU or EAN.
              </p>
              <ModelAlertSearch alertsApi={alertsApi} onRequireAuth={requireAuth} />
            </div>
          </>
        )}
      </div>

      <ScrollToTopButton />
    </div>
  );
}

/** Sloupec pro přidávání alertů — řádky se zvonečkem + hromadný přepínač. */
function AlertPicker({
  title, note, allOn, onToggleAll, items, isOn, onToggle,
}: {
  title: string;
  note: string;
  allOn: boolean;
  onToggleAll: () => void;
  items: { key: string; name: string; domain?: string }[];
  isOn: (key: string) => boolean;
  onToggle: (key: string, name: string) => void;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        <button
          type="button"
          onClick={onToggleAll}
          aria-pressed={allOn}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            allOn
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
          }`}
        >
          {allOn ? <BellRing className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
          {allOn ? 'All on' : 'Alert on all'}
        </button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>

      <div className="mt-3 max-h-[420px] overflow-y-auto rounded-xl border border-border">
        {items.map((item) => {
          const on = isOn(item.key);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onToggle(item.key, item.name)}
              aria-pressed={on}
              className="flex w-full items-center gap-3 border-b border-border/60 px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-slate-50"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg p-1.5"
                style={{ backgroundColor: tintForKey(item.key) }}
              >
                <BrandLogo
                  name={item.name}
                  domain={item.domain}
                  width={160}
                  height={80}
                  className="max-h-4 max-w-full object-contain [mix-blend-mode:multiply]"
                  fallbackClassName="text-[9px] font-bold leading-none text-zinc-700"
                />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{item.name}</span>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  on ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                {on ? <BellRing className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                {on ? 'On' : 'Watch'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
