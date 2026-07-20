import { useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useStore } from '@/lib/store';
import { dealsI18n } from '@/lib/i18n-deals';
import { dealAlertsTable } from '@/lib/alerts';
import { useAuthContext } from '@/contexts/AuthContext';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import { openEarlyAccessUpsell } from './EarlyAccessUpsell';

/**
 * Zvoneček na produktové kartě — model-level watchdog pro odběratele
 * early accessu; bez něj klik otevře globální upsell dialog.
 *
 * Záměrně jednosměrný („přidat hlídání"): počáteční stav se kvůli výkonu
 * na kartách nenačítá, insert je idempotentní (unique + 23505 = už hlídáno).
 * Rušení alertů žije v chipech sekce Top Deals a v účtu (Deal watchdogy).
 */
export function ProductAlertBell({
  sku,
  label,
  className = '',
}: {
  sku: string;
  label: string;
  className?: string;
}) {
  const { user } = useAuthContext();
  const { hasEarlyAccess } = useEarlyAccess();
  const openAuthModal = useStore((s) => s.openAuthModal);
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang].alertsUi;
  const [on, setOn] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
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
    if (on) return;
    setOn(true);
    const { error } = await dealAlertsTable().insert({
      user_id: user.id,
      level: 'product',
      target: sku,
      label,
    });
    if (error && error.code !== '23505') setOn(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={on ? t.watching : t.watch}
      title={on ? t.watching : t.watch}
      className={`rounded-full p-1.5 shadow-sm backdrop-blur-sm transition-all hover:scale-110 ${
        on ? 'bg-emerald-50 text-emerald-600' : 'bg-white/80 text-muted-foreground'
      } ${className}`}
    >
      {on ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
    </button>
  );
}
