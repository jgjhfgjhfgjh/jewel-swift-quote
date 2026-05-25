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

  const src1x = getBrandLogoUrl(domain, width, height);
  const src2x = getBrandLogoUrl(domain, width * 2, height * 2);

  return (
    <img
      src={src1x}
      srcSet={`${src1x} 1x, ${src2x} 2x`}
      alt={`${name} logo`}
      className={className}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setImgError(true)}
    />
  );
}
