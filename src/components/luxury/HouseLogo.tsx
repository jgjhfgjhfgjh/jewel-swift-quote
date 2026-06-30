import { BrandLogo } from '@/components/BrandLogo';
import { houseHasLogo } from '@/data/luxuryCatalog';

interface Props {
  name: string;
  domain?: string;
  width?: number;
  height?: number;
  className?: string;
  /** Class for the serif-wordmark fallback (logo unavailable on CDN). */
  textClassName?: string;
}

/**
 * Renders a prestige house's logo, falling back to an elegant serif wordmark
 * for domains the Brandfetch CDN can't serve (it returns a placeholder image
 * rather than 404, so BrandLogo's onError fallback never fires for them).
 */
export function HouseLogo({ name, domain, width = 200, height = 100, className = '', textClassName = '' }: Props) {
  if (!domain || !houseHasLogo(domain)) {
    return (
      <span className={textClassName} style={{ fontFamily: "'Montserrat', sans-serif" }}>
        {name}
      </span>
    );
  }
  return (
    <BrandLogo
      name={name}
      domain={domain}
      width={width}
      height={height}
      className={className}
      fallbackClassName={textClassName}
    />
  );
}
