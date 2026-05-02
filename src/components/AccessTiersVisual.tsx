import { Lock, Eye, CheckCircle2, X, Check } from 'lucide-react';

/**
 * Three-tier access visualization showing what users get at each registration level.
 * Used both on the homepage lead-capture banner and inside the AuthModal popup
 * so users know exactly what they unlock by signing in / completing B2B verification.
 */
interface AccessTiersVisualProps {
  /** Compact mode for use inside the auth modal (smaller paddings, tighter type) */
  compact?: boolean;
}

const FEATURES = [
  'Prohlídka sortimentu',
  'Fotky a popis produktů',
  'Doporučené ceny (MOC)',
  'Skladové zásoby',
  'Velkoobchodní ceny',
  'Objednávkový systém',
];

type Tier = {
  key: 'guest' | 'free' | 'b2b';
  icon: typeof Lock;
  title: string;
  badge?: string;
  badgeTone?: 'blue' | 'emerald';
  tone: 'muted' | 'blue' | 'emerald';
  // 'unlocked' | 'locked' | 'pending' (pending = locked but highlighted as next step)
  states: Array<'unlocked' | 'locked' | 'pending'>;
};

const TIERS: Tier[] = [
  {
    key: 'guest',
    icon: Lock,
    title: 'Nepřihlášen',
    tone: 'muted',
    states: ['locked', 'locked', 'locked', 'locked', 'locked', 'locked'],
  },
  {
    key: 'free',
    icon: Eye,
    title: 'Přihlášen zdarma (Google / e-mail)',
    badge: 'Bez čekání',
    badgeTone: 'blue',
    tone: 'blue',
    states: ['unlocked', 'unlocked', 'unlocked', 'unlocked', 'pending', 'pending'],
  },
  {
    key: 'b2b',
    icon: CheckCircle2,
    title: 'Schválený B2B partner',
    badge: 'Plný přístup',
    badgeTone: 'emerald',
    tone: 'emerald',
    states: ['unlocked', 'unlocked', 'unlocked', 'unlocked', 'unlocked', 'unlocked'],
  },
];

export function AccessTiersVisual({ compact = false }: AccessTiersVisualProps) {
  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {TIERS.map((tier) => {
        const Icon = tier.icon;
        const borderClass =
          tier.tone === 'blue'
            ? 'border-blue-200 bg-blue-50/40'
            : tier.tone === 'emerald'
            ? 'border-emerald-200 bg-emerald-50/40'
            : 'border-zinc-200 bg-white';
        const iconColor =
          tier.tone === 'blue' ? 'text-blue-600' : tier.tone === 'emerald' ? 'text-emerald-600' : 'text-zinc-400';
        const titleColor =
          tier.tone === 'blue' ? 'text-blue-700' : tier.tone === 'emerald' ? 'text-emerald-700' : 'text-zinc-500';
        const badgeClass =
          tier.badgeTone === 'blue'
            ? 'bg-blue-100 text-blue-700 border-blue-200'
            : 'bg-emerald-100 text-emerald-700 border-emerald-200';

        return (
          <div
            key={tier.key}
            className={`rounded-2xl border ${borderClass} ${compact ? 'px-3 py-2.5' : 'px-4 py-3'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`flex items-center gap-1.5 font-semibold ${compact ? 'text-xs' : 'text-sm'} ${titleColor}`}>
                <Icon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                <span>{tier.title}</span>
              </div>
              {tier.badge && (
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}
                >
                  {tier.badge}
                </span>
              )}
            </div>
            <div className={`grid grid-cols-2 gap-x-3 ${compact ? 'gap-y-1' : 'gap-y-1.5'}`}>
              {FEATURES.map((feat, i) => {
                const state = tier.states[i];
                const isUnlocked = state === 'unlocked';
                const isPending = state === 'pending';
                const StateIcon = isUnlocked ? Check : isPending ? Lock : X;
                const stateColor = isUnlocked
                  ? 'text-emerald-600'
                  : isPending
                  ? 'text-zinc-400'
                  : 'text-zinc-300';
                const textColor = isUnlocked
                  ? 'text-zinc-700'
                  : isPending
                  ? 'text-zinc-400'
                  : 'text-zinc-400';
                return (
                  <div
                    key={feat}
                    className={`flex items-center gap-1.5 ${compact ? 'text-[11px]' : 'text-xs'} ${textColor}`}
                  >
                    <StateIcon className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} shrink-0 ${stateColor}`} strokeWidth={2.5} />
                    <span className="truncate">{feat}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
