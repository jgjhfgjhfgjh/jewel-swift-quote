import { useNavigate } from 'react-router-dom';
import { Handshake, PackageOpen, HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface Props {
  onOpenCatalog?: () => void;
}

const cards = [
  {
    key: 'partner',
    icon: Handshake,
    label: 'B2B',
    title: 'Prémiový velkoobchod',
    description:
      'Mějte aktuální ceny a skladové zásoby světových značek vždy v kapse. Od zachycení trendů k objednávce za pár vteřin.',
    cta: 'Vstoupit do velkoobchodu',
    gradient: 'from-blue-700/80 via-blue-800/90 to-indigo-900/95',
  },
  {
    key: 'dropshipping',
    icon: PackageOpen,
    label: 'Swelt.dropshipping',
    title: 'Dropsipping',
    description:
      'E-shop bez miliónových investic, logistika, balení a odeslání pod vaší značkou přímo ke koncovému zákazníkovi.',
    cta: 'Chci dropsipping',
    gradient: 'from-blue-700/80 via-blue-800/90 to-indigo-900/95',
  },
  {
    key: 'luxury',
    icon: HandCoins,
    label: 'Swelt.luxury',
    title: 'Privátní nákupy pro firmy a živnostníky',
    description:
      'Odemykáme vám exkluzivní přístup k velkoobchodním cenám pro vaše soukromé nákupy nebo firemní dary. Už od jednoho kusu a bez registrace.',
    cta: 'Zjistit více',
    gradient: 'from-blue-700/80 via-blue-800/90 to-indigo-900/95',
  },
];

export function TripleGateway({ onOpenCatalog }: Props) {
  const navigate = useNavigate();

  const handleClick = (key: string) => {
    if (key === 'partner') navigate('/partner');
    else if (key === 'dropshipping') navigate('/dropshipping');
    else if (key === 'luxury') navigate('/luxury');
  };

  return (
    <div
      className="w-full px-4 py-8 sm:px-6 lg:px-8"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-7xl mx-auto">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="group relative overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-[1.02] min-h-[420px] flex flex-col"
            >
              {/* Layered background (kept from original glass design) */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
              <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.08] border border-white/[0.15]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute -inset-full rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
              </div>
              <div className="absolute inset-[1px] rounded-2xl border border-white/[0.08] pointer-events-none" />
              <img
                src={logo}
                alt=""
                className="absolute right-3 bottom-3 w-14 opacity-[0.07] pointer-events-none select-none"
                draggable={false}
              />

              {/* Content */}
              <div className="relative z-10 p-6 lg:p-8 flex flex-col items-center text-center flex-1">
                {/* Icon with optional badge */}
                <div className="relative mb-5 mt-1">
                  <Icon className="w-14 h-14 text-white/85" strokeWidth={1.25} />
                </div>

                {/* Label (kept from original) */}
                <span className="text-white/60 text-[10px] font-medium tracking-[0.2em] uppercase mb-3">
                  {card.label}
                </span>

                {/* Title */}
                <h3 className="text-white font-bold text-lg lg:text-xl leading-snug mb-4">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-white/75 text-sm leading-relaxed mb-6 text-center mx-auto max-w-[28ch]">
                  {card.description}
                </p>

                {/* CTA Button */}
                <Button
                  onClick={() => handleClick(card.key)}
                  className="mt-auto w-full bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm font-medium py-5 rounded-md transition-colors"
                >
                  {card.cta}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
