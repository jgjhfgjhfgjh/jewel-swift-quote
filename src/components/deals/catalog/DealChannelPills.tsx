import { useNavigate } from 'react-router-dom';
import { Briefcase, Layers, Megaphone, Users } from 'lucide-react';

export type DealChannel = 'all' | 'want' | 'split' | 'my';

/* Tři kanály obchodu — každý má vlastní nástěnku, přepínač je proto
   navigační: aktivní pilulka říká, kde stojím, ostatní tam vedou. */
const CHANNELS: { key: DealChannel; label: string; icon: typeof Layers; path: string }[] = [
  { key: 'all', label: 'AllDeal', icon: Layers, path: '/deals' },
  { key: 'want', label: 'WantDeal', icon: Megaphone, path: '/wantdeal' },
  { key: 'split', label: 'SplitDeal', icon: Users, path: '/splitdeal' },
  /* MyDeal je vlastní zóna účtu (moje dávky), ne kanál trhu — v přepínači
     ale patří k ostatním: je to čtvrtá nástěnka, mezi kterými se chodí. */
  { key: 'my', label: 'MyDeal', icon: Briefcase, path: '/my-deals' },
];

/**
 * Přepínač kanálů — AllDeal (nabídka), WantDeal (poptávka), SplitDeal
 * (skupinový nákup) a MyDeal (moje dávky). Stojí na začátku tmavé plochy
 * /deals a stejně tak v hlavičce ostatních nástěnek, takže je z každé
 * vidět na zbylé tři.
 *
 * Aktivní pilulka je INVERZNÍ (bílá na černé) — stejný jazyk jako řazení
 * v řídicí liště, jen o patro výš.
 */
export function DealChannelPills({
  active,
  className = '',
}: {
  active: DealChannel;
  className?: string;
}) {
  const navigate = useNavigate();

  return (
    <div
      role="tablist"
      aria-label="Deal channels"
      /* o 30 % menší než původní řada (pokyn) — pilulka 36 → 25 px */
      className={`flex items-center gap-0.5 overflow-x-auto rounded-full border border-white/10 bg-white/[0.04] p-0.5
                  [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {CHANNELS.map((c) => (
        <button
          key={c.key}
          type="button"
          role="tab"
          aria-selected={active === c.key}
          onClick={() => active !== c.key && navigate(c.path)}
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-medium transition-colors ${
            active === c.key
              ? 'bg-white text-zinc-900'
              : 'text-zinc-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <c.icon className="h-2.5 w-2.5 shrink-0" />
          {c.label}
        </button>
      ))}
    </div>
  );
}
