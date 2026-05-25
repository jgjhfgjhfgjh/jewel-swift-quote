import { useState } from 'react';
import { getBrandLogoUrl } from '@/data/brands';

interface BrandLogoProps {
  name: string;
  domain: string;
  className?: string;
  fallbackClassName?: string;
  width?: number;
  height?: number;
}

export function BrandLogo({
  name,
  domain,
  className = '',
  fallbackClassName = '',
  width = 400,
  height = 200,
}: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return <span className={fallbackClassName || className}>{name}</span>;
  }

  return (
    <img
      src={getBrandLogoUrl(domain, width, height)}
      alt={`${name} logo`}
      className={className}
      loading="lazy"
      draggable={false}
      onError={() => setImgError(true)}
    />
  );
}
