import { Bell, BellRing } from 'lucide-react';
import { useStore } from '@/lib/store';
import { dealsI18n } from '@/lib/i18n-deals';
import { useAuthContext } from '@/contexts/AuthContext';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import { openEarlyAccessUpsell } from './EarlyAccessUpsell';
import type { AlertLevel } from '@/lib/alerts';
import type { DealAlertsApi } from '@/hooks/useDealAlerts';

/**
 * Kompaktní zvoneček pro karty ve filtrech (brand / koncern carousel).
 * Stejné gatování jako ostatní alerty: nepřihlášený → registrace, bez early
 * accessu → upsell, jinak toggle alertu. Stav sdílí přes DealAlertsApi
 * instancovanou jednou v rodičovském carouselu (žádný fetch per karta).
 */
export function CardAlertBell({
  level,
  target,
  label,
  api,
  className = '',
  size = 'md',
}: {
  level: Extract<AlertLevel, 'brand' | 'concern'>;
  target: string;
  label: string;
  api: DealAlertsApi;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const { user } = useAuthContext();
  const { hasEarlyAccess } = useEarlyAccess();
  const openAuthModal = useStore((s) => s.openAuthModal);
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang].alertsUi;
  const on = api.has(level, target);

  const handleClick = (e: React.MouseEvent) => {
    // Karta pod zvonečkem je sama klikací (toggle filtru) — nesmí se propsat
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal('register');
      return;
    }
    if (!hasEarlyAccess) {
      openEarlyAccessUpsell();
      return;
    }
    api.toggle(level, target, label);
  };

  const pad = size === 'sm' ? 'p-1' : 'p-1.5';
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={on ? t.watching : t.watch}
      title={on ? t.watching : t.watch}
      className={`rounded-full shadow-sm backdrop-blur-sm transition-all hover:scale-110 ${pad} ${
        on ? 'bg-emerald-50 text-emerald-600' : 'bg-white/80 text-muted-foreground'
      } ${className}`}
    >
      {on ? <BellRing className={icon} /> : <Bell className={icon} />}
    </button>
  );
}
