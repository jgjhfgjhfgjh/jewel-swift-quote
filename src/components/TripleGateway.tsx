import { useNavigate } from 'react-router-dom';
import { Handshake, PackageOpen, HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onOpenCatalog?: () => void;
}

const cards = [
  {
    key: 'partner',
    icon: Handshake,
    badge: 'B2B',
    title: 'Prémiový velkoobchod',
    description:
      'Mějte aktuální ceny a skladové zásoby světových značek vždy v kapse. Od zachycení trendů k objednávce za pár vteřin.',
    cta: 'Vstoupit do velkoobchodu',
  },
  {
    key: 'dropshipping',
    icon: PackageOpen,
    title: 'Prodávejte my se postaráme o zbytek.',
    description:
      'E-shop bez miliónových investic, logistika, balení a odeslání pod vaší značkou přímo ke koncovému zákazníkovi.',
    cta: 'Chci dropsipping',
  },
  {
    key: 'luxury',
    icon: HandCoins,
    title: 'Privátní nákupy pro firmy a živnostníky',
    description:
      'Odemykáme vám exkluzivní přístup k velkoobchodním cenám pro vaše soukromé nákupy nebo firemní dary. Už od jednoho kusu a bez registrace.',
    cta: 'Zjistit více',
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
      className="w-full px-4 py-8 sm:px-6 lg:px-8 bg-muted/30"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-7xl mx-auto">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="bg-card rounded-xl border border-border shadow-sm p-6 lg:p-8 flex flex-col items-center text-center min-h-[440px]"
            >
              {/* Icon */}
              <div className="relative mb-6 mt-2">
                <Icon
                  className="w-16 h-16 text-muted-foreground"
                  strokeWidth={1.25}
                />
                {card.badge && (
                  <span className="absolute -bottom-1 right-0 text-primary font-bold text-sm tracking-tight">
                    {card.badge}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-foreground font-bold text-xl lg:text-2xl leading-snug mb-6">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-foreground/80 text-sm lg:text-base leading-relaxed mb-auto">
                {card.description}
              </p>

              {/* CTA */}
              <Button
                onClick={() => handleClick(card.key)}
                className="mt-8 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-6 rounded-md"
              >
                {card.cta}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
