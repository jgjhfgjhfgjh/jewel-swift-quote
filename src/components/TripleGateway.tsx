import { useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
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
      'Prodávejte my se postaráme o zbytek. E-shop bez miliónových investic, logistika, balení a odeslání pod vaší značkou přímo ke koncovému zákazníkovi.',
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

  const renderCard = (card: typeof cards[number]) => {
    const Icon = card.icon;
    return (
      <div
        key={card.key}
        className="group relative overflow-hidden rounded-xl sm:rounded-2xl transition-transform duration-300 hover:scale-[1.02] min-h-[220px] sm:min-h-[420px] flex flex-col"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
        <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.08] border border-white/[0.15]" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute -inset-full rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
        </div>
        <div className="absolute inset-[1px] rounded-xl sm:rounded-2xl border border-white/[0.08] pointer-events-none" />
        <img
          src={logo}
          alt=""
          className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 w-10 sm:w-14 opacity-[0.07] pointer-events-none select-none"
          draggable={false}
        />

        <div className="relative z-10 p-3 sm:p-6 lg:p-8 flex flex-col items-center text-center flex-1">
          <div className="relative mb-2 sm:mb-5 mt-0.5 sm:mt-1">
            <Icon className="w-8 h-8 sm:w-14 sm:h-14 text-white/85" strokeWidth={1.25} />
          </div>
          <h3 className="text-white font-bold text-[13px] sm:text-lg lg:text-xl leading-tight sm:leading-snug mb-2 sm:mb-4">
            {card.title}
          </h3>
          <p className="text-white/75 text-[11px] sm:text-sm leading-snug sm:leading-relaxed mb-3 sm:mb-6 text-center mx-auto max-w-[24ch] sm:max-w-[28ch]">
            {card.description}
          </p>
          <Button
            onClick={() => handleClick(card.key)}
            className="mt-auto w-full bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm font-medium text-[11px] sm:text-sm py-2.5 sm:py-5 px-2 rounded-md transition-colors h-auto whitespace-normal leading-tight"
          >
            {card.cta}
          </Button>
        </div>
      </div>
    );
  };

  // Mobile: carousel with 2 cards per slide, infinite loop
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

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

  // Group cards into pairs for mobile slides
  const mobileSlides: typeof cards[] = [];
  for (let i = 0; i < cards.length; i += 2) {
    mobileSlides.push(cards.slice(i, i + 2));
  }

  return (
    <div
      className="w-full px-3 py-5 sm:px-6 sm:py-8 lg:px-8"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Desktop / Tablet: 3-column grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-6 max-w-7xl mx-auto">
        {cards.map(renderCard)}
      </div>

      {/* Mobile: infinite carousel, 2 cards per slide */}
      <div className="md:hidden max-w-7xl mx-auto">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {mobileSlides.map((pair, idx) => (
              <div key={idx} className="flex-[0_0_100%] min-w-0">
                <div className="grid grid-cols-2 gap-2.5">
                  {pair.map(renderCard)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 pt-3">
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
      </div>
    </div>
  );
}
