import { Bell, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import { dealsI18n } from '@/lib/i18n-deals';
import { useAuthContext } from '@/contexts/AuthContext';
import { useDealAlerts } from '@/hooks/useDealAlerts';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import { openEarlyAccessUpsell } from './EarlyAccessUpsell';
import type { AlertLevel } from '@/lib/alerts';

/**
 * „Set a Top Deal alert" pro detail značky (level 'brand', target = brand key)
 * a detail koncernu (level 'concern', target = slug). Odběratel early accessu
 * alert přepíná; bez early accessu klik otevře upsell, nepřihlášený registraci.
 */
export function TopDealAlertButton({
  level,
  target,
  label,
}: {
  level: Extract<AlertLevel, 'brand' | 'concern'>;
  target: string;
  label: string;
}) {
  const { user } = useAuthContext();
  const { hasEarlyAccess } = useEarlyAccess();
  const openAuthModal = useStore((s) => s.openAuthModal);
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang].alertsUi;
  const alertsApi = useDealAlerts();
  // hasAny: platí i hromadný („všechny značky/koncerny") alert
  const on = alertsApi.hasAny(level, target);

  const handleClick = () => {
    if (!user) {
      openAuthModal('register');
      return;
    }
    if (!hasEarlyAccess) {
      openEarlyAccessUpsell();
      return;
    }
    alertsApi.toggle(level, target, label);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${
        on
          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border border-slate-300 text-slate-900 hover:border-slate-400 hover:bg-slate-50'
      }`}
    >
      {on ? (
        <>
          <Check className="h-4 w-4" /> {t.alertOn}
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" /> {t.setAlert}
        </>
      )}
    </button>
  );
}
