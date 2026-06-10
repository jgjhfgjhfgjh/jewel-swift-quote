import { Check, ArrowRight } from 'lucide-react';
import { RotatingSuffix } from '@/components/GatewaySections';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';

/** Full homepage hero — logo, tagline, CTAs, bullets. Sits between the banner and the apps cards. */
export function HomeHero() {
  const openAuthModal = useStore((s) => s.openAuthModal);
  const setViewMode = useStore((s) => s.setViewMode);
  const { user, isB2bApproved } = useAuthContext();

  // Logged in → straight into the catalog; logged out → create-account modal
  const openCatalog = () => {
    if (user) {
      setViewMode('catalog');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      openAuthModal('register');
    }
  };

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
      <div className="mt-6 sm:mt-8 flex flex-col gap-3 justify-center items-center">
        {/* B2B CTA — hidden for approved partners; logged-in users get a
            "finish your registration" nudge instead of the generic label */}
        {!isB2bApproved && (
          <button
            onClick={() => openAuthModal('b2b')}
            className="relative px-8 py-3 rounded-md bg-[#17191c]/80 backdrop-blur-md text-white font-semibold text-sm hover:bg-[#0e0f11]/90 transition min-w-[200px] shadow-lg"
          >
            {user ? 'Dokonči B2B registraci' : 'B2B registrace'}
            {/* lime "24h" badge — sticks out across the top-right corner, slightly crooked */}
            <span className="font-grotesk pointer-events-none absolute -top-2.5 -right-3.5 z-10 rotate-[8deg] -skew-x-12 rounded-sm bg-[#d1fe17] px-1.5 py-0.5 text-[11px] font-bold uppercase leading-none text-[#131517] shadow-sm">
              24h
            </span>
          </button>
        )}
        <button
          onClick={openCatalog}
          className="group inline-flex items-center justify-center gap-1.5 px-2 py-1 text-foreground font-semibold text-sm transition-all duration-200 hover:gap-3"
        >
          Prohlédnout katalog
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Bullets — approved partners get next-step nudges instead of signup reassurances */}
      {isB2bApproved ? (
        <ul className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-foreground/70">
          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Využij DEAL nabídky</li>
          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Napoj se na feed</li>
          <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Spusť e-shop do 48 h</li>
          <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Prodávej bez skladu</li>
        </ul>
      ) : (
        <ul className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-foreground/70">
          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Registrace zdarma</li>
          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Schválení do 24 hodin</li>
          <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Bez závazků</li>
          <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Bez kreditní karty</li>
        </ul>
      )}
    </div>
  );
}
