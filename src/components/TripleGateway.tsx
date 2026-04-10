import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';

interface Props {
  onOpenCatalog: () => void;
}

const cards = [
  {
    key: 'partner',
    label: 'Swelt.partner',
    title: 'LIVE KATALOG 2026',
    description: 'Přístup k velkoobchodnímu katalogu šperků a hodinek. Aktuální ceny, skladové zásoby a rychlé objednávky.',
    cta: 'Free Katalog',
    gradient: 'from-emerald-700/80 via-emerald-800/90 to-teal-900/95',
  },
  {
    key: 'dropshipping',
    label: 'Swelt.dropshipping',
    title: 'E-SHOP BEZ MILIONOVÝCH INVESTIC?',
    description: 'Ano, jde to. Zjistěte, jak postavit byznys, kde platíte za zboží až poté, co vám zaplatí zákazník.',
    cta: 'Vstoupit',
    gradient: 'from-blue-700/80 via-blue-800/90 to-indigo-900/95',
  },
  {
    key: 'luxury',
    label: 'Swelt.luxury',
    title: 'PRIVÁTNÍ NÁKUPY',
    description: 'Segment vysoké hodinařiny bez nutnosti minimálních odběrů. Máte IČO? Poptávka na jediný kus luxusních značek začíná zde.',
    cta: 'Vstoupit',
    gradient: 'from-amber-800/80 via-yellow-900/90 to-stone-900/95',
  },
];

export function TripleGateway({ onOpenCatalog }: Props) {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleClick = (key: string) => {
    if (key === 'partner') onOpenCatalog();
    else if (key === 'dropshipping') navigate('/dropshipping');
    else if (key === 'luxury') navigate('/luxury');
  };

  return (
    <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 max-w-7xl mx-auto">
        {cards.map((card) => (
          <button
            key={card.key}
            onClick={() => handleClick(card.key)}
            className="group relative overflow-hidden rounded-2xl text-left transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
            <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.08] border border-white/[0.15]" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute -inset-full rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
            </div>
            <div className="absolute inset-[1px] rounded-2xl border border-white/[0.08] pointer-events-none" />
            <img src={logo} alt="" className="absolute right-3 bottom-3 w-14 opacity-[0.07] pointer-events-none select-none" draggable={false} />

            {/* Content */}
            <div className="relative z-10 p-5 lg:p-6 flex flex-col min-h-[220px] sm:min-h-[200px] lg:min-h-[180px] justify-between">
              <div>
                <span className="inline-block text-white/60 text-xs font-medium tracking-[0.2em] uppercase mb-2">{card.label}</span>
                <h3 className="text-white font-bold text-base lg:text-lg tracking-wide leading-tight">{card.title}</h3>
              </div>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed mt-2">
                {card.description}
              </p>
              <div className="mt-3 flex items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors text-sm">
                <span>{card.cta}</span>
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
