import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Handshake, Package, Watch } from 'lucide-react';

interface Props {
  onOpenCatalog: () => void;
}

const cards = [
  {
    key: 'partner',
    icon: Handshake,
    title: 'Prémiový velkoobchod',
    description: 'Mějte aktuální ceny a skladové zásoby světových značek vždy v kapse. Od zachycení trendů k objednávce za pár vteřin.',
    cta: 'Vstoupit do velkoobchodu',
    iconColor: 'text-indigo-500',
  },
  {
    key: 'dropshipping',
    icon: Package,
    title: 'E-shop bez milionových investic',
    description: 'Prodávejte my se postaráme o zbytek. Logistika, balení a odeslání pod vaší značkou přímo ke koncovému zákazníkovi.',
    cta: 'Chci vlastní e-shop',
    iconColor: 'text-indigo-500',
  },
  {
    key: 'luxury',
    icon: Watch,
    title: 'Breitling, Omega, TAG Heuer a další',
    description: 'Odemykáme vám exkluzivní přístup k velkoobchodním cenám pro vaše soukromé nákupy nebo firemní dary. Už od jednoho kusu a bez registrace.',
    cta: 'Zjistit více',
    iconColor: 'text-indigo-500',
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
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center p-8 lg:p-10"
            >
              <div className={`mb-5 ${card.iconColor}`}>
                <Icon className="w-12 h-12" strokeWidth={1.5} />
              </div>

              <h3 className="text-gray-900 font-bold text-lg lg:text-xl leading-tight mb-3">
                {card.title}
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                {card.description}
              </p>

              <button
                onClick={() => handleClick(card.key)}
                className="mt-auto px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                {card.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
