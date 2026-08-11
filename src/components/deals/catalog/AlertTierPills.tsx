import { Bell, Lock } from 'lucide-react';

/** Ceník Early Access je přímo na stránce — pilulka na něj odroluje. */
const scrollToPricing = () =>
  document.getElementById('gbd-pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/**
 * Přepínač úrovní alertu — zdarma pro každého vs. 48h náskok pro Early
 * Access. Stojí v řídicí liště VLEVO, na stejné úrovni a ve stejné velikosti
 * jako přepínač kanálů vpravo: dvě dvojice ovladačů, jedna lišta.
 *
 * Aktivní pilulka říká, na které úrovni uživatel STOJÍ (Early Access jen
 * tomu, kdo ho má), druhá je vstup — free vede na alerty, EA na ceník.
 * Stejná logika jako u kanálů: zvýraznění = kde jsem, klik = kam jdu.
 */
export function AlertTierPills({
  hasEarlyAccess,
  onFreeAlert,
  className = '',
}: {
  hasEarlyAccess: boolean;
  onFreeAlert: () => void;
  className?: string;
}) {
  const tiers = [
    { key: 'free' as const, label: 'Free public alert', icon: Bell, onClick: onFreeAlert },
    { key: 'ea' as const, label: '48 h Early Access', icon: Lock, onClick: scrollToPricing },
  ];
  const active = hasEarlyAccess ? 'ea' : 'free';

  return (
    <div
      role="tablist"
      aria-label="Alert tiers"
      /* rozměry 1:1 s DealChannelPills — obě řady musí sedět na jedné lince */
      className={`flex items-center gap-0.5 overflow-x-auto rounded-full border border-white/10 bg-white/[0.04] p-0.5
                  [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {tiers.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          onClick={t.onClick}
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-medium transition-colors ${
            active === t.key
              ? 'bg-white text-zinc-900'
              : 'text-zinc-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <t.icon className="h-2.5 w-2.5 shrink-0" />
          {t.label}
        </button>
      ))}
    </div>
  );
}
