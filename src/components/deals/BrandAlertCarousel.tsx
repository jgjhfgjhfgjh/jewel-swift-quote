import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellRing, ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useBrandCatalog } from '@/hooks/useBrandCatalog';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import { useAuthContext } from '@/contexts/AuthContext';
import { sortByBrandPriority } from '@/lib/brandOrder';
import { dealsI18n } from '@/lib/i18n-deals';
import type { DealAlertsApi } from '@/hooks/useDealAlerts';
import { openEarlyAccessUpsell } from './EarlyAccessUpsell';

/**
 * Carousel všech značek z katalogu pro sekci Top Deals — každá karta má
 * zvoneček (brand-level watchdog). Klik na kartu vede na detail značky,
 * zvoneček přepíná alert: bez early accessu otevře upsell, nepřihlášený
 * jde do registrace. iOS vzhled, texty anglicky jako celá sekce.
 */
export function BrandAlertCarousel({
  alertsApi,
  onRequireAuth,
}: {
  alertsApi: DealAlertsApi;
  onRequireAuth: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { hasEarlyAccess } = useEarlyAccess();
  const { data: catalog = [] } = useBrandCatalog();
  const brands = sortByBrandPriority(catalog);
  const trackRef = useRef<HTMLDivElement>(null);
  const t = dealsI18n.en.alertsUi;

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const handleToggle = (key: string, name: string) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!hasEarlyAccess) {
      openEarlyAccessUpsell();
      return;
    }
    // Zapnutý hromadný alert („všechny značky") se odebráním jedné značky
    // rozpadne na jednotlivé alerty pro všechny ostatní.
    if (alertsApi.hasWildcard('brand')) {
      alertsApi.expandWildcard(
        'brand',
        brands.map((b) => ({ target: b.key, label: b.name })),
        key,
      );
      return;
    }
    alertsApi.toggle('brand', key, name);
  };

  if (brands.length === 0) return null;

  return (
    <div className="relative group">
      <div
        ref={trackRef}
        className="flex flex-nowrap overflow-x-auto [-webkit-overflow-scrolling:touch] pb-2
                   gap-3 min-[480px]:gap-4 md:gap-5 min-[1200px]:gap-6
                   px-4 min-[480px]:px-5 md:px-8 min-[1200px]:px-11
                   scroll-pl-4 min-[480px]:scroll-pl-5 md:scroll-pl-8 min-[1200px]:scroll-pl-11
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {brands.map((b) => {
          const on = alertsApi.hasAny('brand', b.key);
          return (
            <div
              key={b.key}
              data-card
              onClick={() => navigate(`/brands/${b.slug}`)}
              className="shrink-0 w-[clamp(200px,55vw,240px)] md:w-[240px] min-[1200px]:w-[280px]
                         flex cursor-pointer flex-col items-center gap-3 rounded-[1.25rem]
                         border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-16 w-full items-center justify-center">
                {b.domain ? (
                  <BrandLogo
                    name={b.name}
                    domain={b.domain}
                    width={360}
                    height={160}
                    className="max-h-[44px] max-w-[80%] object-contain [mix-blend-mode:multiply]"
                    fallbackClassName="font-display font-black text-foreground text-base text-center"
                  />
                ) : (
                  <span className="font-display font-black text-foreground text-base text-center">
                    {b.name}
                  </span>
                )}
              </div>
              {/* CTA v původní velikosti (full-width pill), uvnitř jen zvoneček */}
              <button
                type="button"
                aria-label={on ? t.alertOn : t.setAlert}
                title={on ? t.alertOn : t.setAlert}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(b.key, b.name);
                }}
                className={`inline-flex w-full items-center justify-center rounded-full px-4 py-2 transition-colors ${
                  on
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-600'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800'
                }`}
              >
                {on ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Arrows (desktop, on hover) */}
      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/85 backdrop-blur border border-border text-zinc-700 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/85 backdrop-blur border border-border text-zinc-700 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
