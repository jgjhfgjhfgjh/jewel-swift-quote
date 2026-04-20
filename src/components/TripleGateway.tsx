import { useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Handshake, PackageOpen, HandCoins, BrainCircuit, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import logo from '@/assets/logo.png';
import bgB2b from '@/assets/gateway-b2b.jpg';
import bgDropshipping from '@/assets/gateway-dropshipping.jpg';
import bgLuxury from '@/assets/gateway-luxury.jpg';
import bgIntelligence from '@/assets/gateway-intelligence.jpg';

interface Props {
  onOpenCatalog?: () => void;
}

interface GatewayCard {
  key: 'partner' | 'dropshipping' | 'luxury' | 'intelligence';
  icon: typeof Handshake;
  label: string;
  title: string;
  description: string;
  image: string;
  ctas: { label: string; action: 'login' | 'register' | 'navigate' }[];
  details: {
    heading: string;
    subheading?: string;
    bullets: string[];
  };
}

const cards: GatewayCard[] = [
  {
    key: 'partner',
    icon: Handshake,
    label: 'B2B',
    title: 'Velkoobchod',
    description: 'Získejte aktuální ceny a skladové zásoby.',
    image: bgB2b,
    ctas: [
      { label: 'Vstoupit', action: 'login' },
      { label: 'Registrovat', action: 'register' },
    ],
    details: {
      heading: 'Pro ověřené partnery',
      subheading: 'Velkoobchodní podmínky pro firmy s IČO',
      bullets: [
        'Aktuální velkoobchodní ceny a slevy',
        'Skladové zásoby v reálném čase',
        'Přímý přístup k novinkám a kolekcím',
        'Individuální cenová politika',
        'Rychlé objednávky a expedice',
      ],
    },
  },
  {
    key: 'dropshipping',
    icon: PackageOpen,
    label: 'Swelt.dropshipping',
    title: 'Dropshipping',
    description: 'Prodávejte, my se postaráme o zbytek.',
    image: bgDropshipping,
    ctas: [{ label: 'Chci dropshipping', action: 'navigate' }],
    details: {
      heading: 'E-shop bez investic',
      subheading: 'Kompletní fulfillment pod vaší značkou',
      bullets: [
        'Bez skladových nákladů a investic',
        'Logistika, balení a odeslání pod vaší značkou',
        'Dodání přímo ke koncovému zákazníkovi',
        'Produktový feed pro váš e-shop',
        'Široký katalog světových značek',
      ],
    },
  },
  {
    key: 'luxury',
    icon: HandCoins,
    label: 'Swelt.luxury',
    title: 'Privátní nákupy',
    description: 'Odemykáme vám exkluzivní přístup.',
    image: bgLuxury,
    ctas: [{ label: 'Zjistit více', action: 'navigate' }],
    details: {
      heading: 'Pro firmy a živnostníky',
      subheading: 'Velkoobchodní ceny pro soukromé nákupy',
      bullets: [
        'Exkluzivní přístup k velkoobchodním cenám',
        'Soukromé nákupy nebo firemní dary',
        'Už od jednoho kusu',
        'Bez nutnosti registrace',
        'Diskrétní a profesionální servis',
      ],
    },
  },
  {
    key: 'intelligence',
    icon: BrainCircuit,
    label: 'Swelt.intelligence',
    title: 'Inteligence',
    description: 'Vidíte celý trh, ne jen svůj kousek.',
    image: bgIntelligence,
    ctas: [{ label: 'Zjistit více', action: 'navigate' }],
    details: {
      heading: 'Tržní data pro vaše rozhodování',
      subheading: 'Prediktivní přehledy postavené na pohybu zboží napříč celou distribucí',
      bullets: [
        'Prediktivní skóre poptávky pro každý SKU',
        'Trendy kategorií dřív, než jsou viditelné trhu',
        'Benchmark vašich prodejů vůči anonymnímu trhu',
        'Upozornění na rostoucí i klesající produkty',
        'Doporučení k akci — naskladnit, sledovat, redukovat',
      ],
    },
  },
];

export function TripleGateway({ onOpenCatalog }: Props) {
  const navigate = useNavigate();
  const autoplay = useRef(
    Autoplay({
      delay: 4500,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: false },
    [autoplay.current],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const handleAction = (cardKey: GatewayCard['key'], action: 'login' | 'register' | 'navigate') => {
    if (cardKey === 'partner') {
      if (action === 'login') {
        setAuthTab('login');
        setAuthOpen(true);
      } else if (action === 'register') {
        setAuthTab('register');
        setAuthOpen(true);
      } else navigate('/partner');
    } else if (cardKey === 'dropshipping') {
      navigate('/dropshipping');
    } else if (cardKey === 'luxury') {
      navigate('/luxury');
    } else if (cardKey === 'intelligence') {
      navigate('/intelligence');
    }
  };

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const renderCard = (card: GatewayCard, keyPrefix = '') => {
    const Icon = card.icon;

    return (
      <div
        key={`${keyPrefix}${card.key}`}
        className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-[0_8px_32px_-12px_rgba(0,0,0,0.25)] transition-shadow duration-300 hover:shadow-[0_20px_40px_-18px_rgba(0,0,0,0.28)] h-full flex flex-col"
      >
        {/* Top: themed image with text + CTA */}
        <div className="relative overflow-hidden min-h-[220px] sm:min-h-[320px] flex flex-col">
          <img
            src={card.image}
            alt=""
            loading="lazy"
            width={1024}
            height={768}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-blue-900/65 to-blue-950/85" />
          <img
            src={logo}
            alt=""
            className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 w-10 sm:w-14 opacity-[0.12] pointer-events-none select-none"
            draggable={false}
          />

          <div className="relative z-10 p-3 sm:p-6 lg:p-7 flex flex-col items-center text-center flex-1">
            <div className="relative mb-2 sm:mb-4">
              <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-white/90" strokeWidth={1.25} />
            </div>

            <h3 className="text-white font-bold text-[13px] sm:text-lg lg:text-xl leading-tight sm:leading-snug mb-1.5 sm:mb-3">
              {card.title}
            </h3>

            <p className="text-white/80 text-[11px] sm:text-sm leading-snug sm:leading-relaxed mb-3 sm:mb-5 mx-auto max-w-[26ch]">
              {card.description}
            </p>

            <div className="mt-auto w-full flex flex-col gap-1.5 sm:gap-2">
              {card.ctas.map((cta, idx) => (
                <Button
                  key={`${cta.label}-${idx}`}
                  onClick={() => handleAction(card.key, cta.action)}
                  variant={idx === 0 ? 'default' : 'outline'}
                  className={
                    idx === 0
                      ? 'w-full bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/40 font-medium text-[10px] sm:text-sm py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-md transition-colors h-auto min-h-[40px] sm:min-h-[40px] whitespace-normal break-words leading-[1.15] sm:leading-tight'
                      : 'w-full bg-white/10 hover:bg-white/20 text-white border border-white/40 font-medium text-[10px] sm:text-sm py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-md transition-colors h-auto min-h-[40px] sm:min-h-[40px] whitespace-normal break-words leading-[1.15] sm:leading-tight backdrop-blur-sm'
                  }
                >
                  {cta.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: white description column */}
        <div className="relative bg-white p-3 sm:p-6 lg:p-7 flex-1 flex flex-col shrink-0">
          <h4 className="text-foreground font-bold text-[12px] sm:text-base lg:text-lg leading-tight mb-1">
            {card.details.heading}
          </h4>
          {card.details.subheading && (
            <p className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm mb-2.5 sm:mb-4 leading-snug">
              {card.details.subheading}
            </p>
          )}
          <ul className="space-y-1.5 sm:space-y-2.5">
            {card.details.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-foreground/80 text-[10px] sm:text-sm leading-snug">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 text-primary shrink-0" strokeWidth={2.5} />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative w-full px-3 pt-5 pb-12 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-14 lg:pb-24 backdrop-blur-2xl backdrop-saturate-150 bg-gradient-to-b from-white/20 via-white/40 to-white/95 border-t border-white/30 shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.25)]"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 max-w-7xl mx-auto items-stretch">
        {cards.map((card, index) => renderCard(card, `desktop-${index}-`))}
      </div>

      <div className="md:hidden max-w-7xl mx-auto">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex -mx-[5px]">
            {cards.map((card, index) => (
              <div
                key={`mobile-slide-${card.key}`}
                className="min-w-0 shrink-0 grow-0 basis-1/2 px-[5px] flex"
              >
                {renderCard(card, `mobile-${index}-`)}
              </div>
            ))}
          </div>
        </div>

        {scrollSnaps.length > 1 && (
          <div className="flex justify-center gap-1.5 pt-4">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === selectedIndex ? 'w-5 bg-primary' : 'w-2 bg-muted-foreground/30'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
    </div>
  );
}
