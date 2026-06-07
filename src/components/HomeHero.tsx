import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { RotatingSuffix } from '@/components/GatewaySections';

/** Full homepage hero — logo, tagline, CTAs, bullets. Sits between the banner and the apps cards. */
export function HomeHero() {
  const navigate = useNavigate();

  return (
    <div className="mt-6 sm:mt-10 mb-2 flex flex-col items-center px-6 text-center">
      {/* Big swelt. logo */}
      <div className="relative inline-flex items-baseline justify-center">
        <h1
          className="font-spartan font-extrabold tracking-tighter text-foreground text-5xl sm:text-8xl md:text-9xl leading-none select-none"
          style={{ letterSpacing: '-0.05em' }}
        >
          swelt.
        </h1>
        <span className="relative ml-1 sm:ml-2 inline-block">
          <span aria-hidden className="invisible font-sans font-extrabold text-base sm:text-2xl md:text-3xl lg:text-4xl whitespace-nowrap">PARTNER</span>
          <span className="absolute left-0 top-0 font-sans font-extrabold tracking-tight text-base sm:text-2xl md:text-3xl lg:text-4xl text-foreground">
            <RotatingSuffix words={['PARTNER', 'EU', 'DROPSHIPPING', 'FEED', 'DEAL']} />
          </span>
        </span>
      </div>

      {/* Tagline */}
      <p className="font-sans mt-5 sm:mt-7 text-sm sm:text-lg md:text-xl font-medium text-foreground tracking-tight text-balance max-w-2xl">
        Přístup k 5 000+ produktům za velkoobchodní ceny
      </p>

      {/* CTAs */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button
          onClick={() => navigate('/register')}
          className="px-8 py-3 rounded-md bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 transition min-w-[200px] shadow-lg"
        >
          B2B registrace
        </button>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 rounded-md border border-zinc-300 bg-white text-foreground font-semibold text-sm hover:bg-zinc-50 transition min-w-[200px]"
        >
          Prohlédnout katalog
        </button>
      </div>

      {/* Bullets */}
      <ul className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-foreground/70">
        <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} /> Registrace zdarma</li>
        <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} /> Schválení do 24 hodin</li>
        <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} /> Bez závazků</li>
        <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} /> Bez kreditní karty</li>
      </ul>
    </div>
  );
}
