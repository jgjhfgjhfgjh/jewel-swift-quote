import { useNavigate } from 'react-router-dom';
import { Layers, Megaphone, Users } from 'lucide-react';

export type DealChannel = 'all' | 'want' | 'split';

/* Tři kanály obchodu — každý má vlastní nástěnku, přepínač je proto
   navigační: aktivní pilulka říká, kde stojím, ostatní tam vedou. */
const CHANNELS: { key: DealChannel; label: string; icon: typeof Layers; path: string }[] = [
  { key: 'all', label: 'AllDeal', icon: Layers, path: '/deals' },
  { key: 'want', label: 'WantDeal', icon: Megaphone, path: '/wantdeal' },
  { key: 'split', label: 'SplitDeal', icon: Users, path: '/splitdeal' },
  /* MyDeal v přepínači není: není to kanál trhu, ale vlastní zóna účtu —
     žije jako CTA vedle CreateBigDeal (pokyn). */
];

/**
 * Přepínač kanálů — AllDeal (nabídka), WantDeal (poptávka) a SplitDeal
 * (skupinový nákup). Na /deals sedí v řídicí liště hned vedle přepínače
 * zobrazení (pokyn), na ostatních nástěnkách v jejich hlavičce.
 *
 * `active` je volitelný: na stránce, která žádným kanálem není (MyDeal),
 * se řada ukáže bez zvýraznění a slouží jako cesta zpátky do trhu.
 *
 * Aktivní pilulka je INVERZNÍ (bílá na černé) — stejný jazyk jako řazení
 * v řídicí liště, jen o patro výš.
 */
export function DealChannelPills({
  active,
  className = '',
}: {
  active?: DealChannel;
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
