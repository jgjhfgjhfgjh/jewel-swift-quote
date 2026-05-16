import { useEffect, useMemo, useState } from 'react';
import { Clock, AlarmClock } from 'lucide-react';
import { useStore } from '@/lib/store';
import { dealsI18n } from '@/lib/i18n-deals';

interface Remaining { total: number; days: number; hours: number; minutes: number; seconds: number }

function diff(target: number): Remaining {
  const total = Math.max(0, target - Date.now());
  return {
    total,
    days: Math.floor(total / 86400000),
    hours: Math.floor((total / 3600000) % 24),
    minutes: Math.floor((total / 60000) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

/**
 * FOMO countdown to a deal's deadline.
 * `variant="compact"` is a single inline pill for deal cards;
 * `variant="full"` is the prominent panel on the deal detail page.
 */
export function CountdownTimer({
  deadline,
  variant = 'full',
}: {
  deadline: string | number | Date;
  variant?: 'full' | 'compact';
}) {
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang].countdown;
  const target = useMemo(() => new Date(deadline).getTime(), [deadline]);
  const [remaining, setRemaining] = useState<Remaining>(() => diff(target));

  useEffect(() => {
    setRemaining(diff(target));
    const id = setInterval(() => setRemaining(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const expired = remaining.total <= 0;
  const urgent = !expired && remaining.total < 24 * 3600000;
  const critical = !expired && remaining.total < 3600000;

  // ── compact pill (deal cards) ───────────────────────────
  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums
          ${expired
            ? 'bg-slate-100 text-slate-500'
            : urgent
              ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
              : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}
      >
        <Clock className={`h-3 w-3 ${urgent && !expired ? 'animate-pulse' : ''}`} />
        {expired
          ? t.closed
          : remaining.days > 0
            ? `${remaining.days} ${t.days} ${remaining.hours} ${t.hours}`
            : `${String(remaining.hours).padStart(2, '0')}:${String(remaining.minutes).padStart(2, '0')}:${String(remaining.seconds).padStart(2, '0')}`}
      </span>
    );
  }

  // ── full panel (deal detail) ────────────────────────────
  if (expired) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-500">
        <AlarmClock className="h-5 w-5" />
        <span className="text-base font-bold">{t.closed}</span>
      </div>
    );
  }

  const segments = [
    { value: remaining.days, label: t.days },
    { value: remaining.hours, label: t.hours },
    { value: remaining.minutes, label: t.minutes },
    { value: remaining.seconds, label: t.seconds },
  ];

  return (
    <div
      className={`rounded-2xl border px-5 py-4 transition-colors
        ${urgent
          ? 'border-red-200 bg-gradient-to-br from-red-50 to-white'
          : 'border-amber-200 bg-gradient-to-br from-amber-50 to-white'}`}
    >
      <div className={`mb-3 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider
        ${urgent ? 'text-red-600' : 'text-amber-700'}`}>
        <AlarmClock className={`h-3.5 w-3.5 ${critical ? 'animate-bounce' : urgent ? 'animate-pulse' : ''}`} />
        {t.label}
      </div>
      <div className="flex items-stretch justify-center gap-2 sm:gap-3">
        {segments.map((seg, i) => (
          <div key={seg.label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center">
              <div
                key={`${seg.label}-${seg.value}`}
                className={`min-w-[3rem] sm:min-w-[3.75rem] rounded-xl px-2 py-2 text-center tabular-nums
                  animate-in zoom-in-95 duration-300
                  ${urgent ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}
              >
                <span className="font-display text-2xl sm:text-3xl font-black leading-none">
                  {String(seg.value).padStart(2, '0')}
                </span>
              </div>
              <span className={`mt-1.5 text-[10px] font-semibold uppercase tracking-wide
                ${urgent ? 'text-red-500' : 'text-slate-500'}`}>
                {seg.label}
              </span>
            </div>
            {i < segments.length - 1 && (
              <span className={`pb-5 font-display text-2xl font-black ${urgent ? 'text-red-300' : 'text-slate-300'}`}>:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
