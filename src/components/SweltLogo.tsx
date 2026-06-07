import { RotatingSuffix } from '@/components/GatewaySections';

/** Big swelt. wordmark with rotating suffix — sits between the banner and the apps cards. */
export function SweltLogo() {
  return (
    <div className="mt-6 sm:mt-10 mb-1 flex justify-center px-6">
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
    </div>
  );
}
