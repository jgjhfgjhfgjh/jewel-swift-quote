import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

interface GatewayCard {
  id: string;
  logo: string;
  headline: string;
  copy: string;
  bg: string;
  action: () => void;
}

interface Props {
  onOpenCatalog: () => void;
}

export function TripleGateway({ onOpenCatalog }: Props) {
  const navigate = useNavigate();

  const cards: GatewayCard[] = [
    {
      id: 'partner',
      logo: 'Swelt.partner',
      headline: 'KOMPLETNÍ KATALOG',
      copy: 'Vstupte do světa tisíců prémiových produktů připravených pro váš byznys. Vše na jednom místě s okamžitou dostupností.',
      bg: 'from-slate-700/80 via-slate-800/90 to-slate-900/95',
      action: onOpenCatalog,
    },
    {
      id: 'dropshipping',
      logo: 'Swelt.dropshipping',
      headline: 'EXPEDICE BEZ STAROSTÍ',
      copy: 'Prodávejte, my se postaráme o zbytek. Logistika, balení a odesílání pod vaší značkou přímo ke koncovému zákazníkovi.',
      bg: 'from-blue-700/80 via-blue-800/90 to-indigo-900/95',
      action: () => navigate('/dropshipping'),
    },
    {
      id: 'luxury',
      logo: 'Swelt.luxury',
      headline: 'PRIVÁTNÍ NÁKUPY',
      copy: 'Segment vysoké hodinařiny bez nutnosti minimálních odběrů. Máte IČO? Poptávka na jediný kus luxusních značek začíná zde.',
      bg: 'from-amber-800/80 via-yellow-900/90 to-stone-900/95',
      action: () => navigate('/luxury'),
    },
  ];

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-7xl mx-auto">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={card.action}
            className="group relative overflow-hidden rounded-2xl text-left transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bg}`} />

            {/* Frosted glass overlay */}
            <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.08] border border-white/[0.15]" />

            {/* Glass reflection sweep */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute -inset-full rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
            </div>

            {/* Inner glow border */}
            <div className="absolute inset-[1px] rounded-2xl border border-white/[0.08] pointer-events-none" />

            {/* Logo watermark */}
            <img
              src={logo}
              alt=""
              className="absolute right-4 bottom-4 w-16 sm:w-20 opacity-[0.07] pointer-events-none select-none"
              draggable={false}
            />

            {/* Content */}
            <div className="relative z-10 p-6 sm:p-8 flex flex-col min-h-[200px] sm:min-h-[240px] lg:min-h-[280px] justify-between">
              <div>
                <span className="inline-block text-white/60 text-xs font-medium tracking-[0.2em] uppercase mb-3">
                  {card.logo}
                </span>
                <h3 className="text-white font-bold text-lg sm:text-xl lg:text-2xl tracking-wide leading-tight">
                  {card.headline}
                </h3>
              </div>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed mt-4">
                {card.copy}
              </p>
              <div className="mt-4 flex items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors text-sm">
                <span>Vstoupit</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
