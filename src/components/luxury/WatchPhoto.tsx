/**
 * Unified product-photo rendering for the prestige catalog.
 *
 * The official images come from very different CDNs (soldier cutouts, boxed
 * og-images, cards with a beige backdrop…), so the raw files show the watch at
 * wildly different sizes. Per-CDN corrections below were MEASURED from sample
 * images (non-white/alpha bounding box via System.Drawing) and normalise every
 * photo to roughly the Breitling look: white/transparent background, watch
 * filling ~90 % of the frame.
 */

interface PhotoCfg {
  /** Extra zoom to compensate built-in padding (measured). */
  zoom: number;
  /** object-cover for wide og-images whose sides are pure white. */
  cover?: boolean;
  /** Slight brightness lift to blow out a light-beige backdrop to white. */
  brighten?: boolean;
}

function cfgFor(src: string): PhotoCfg {
  if (src.includes('img.jaeger-lecoultre.com')) return { zoom: 1.3, cover: true }; // wide og-image, watch ~36 % of square
  if (src.includes('cartier.com/dam')) return { zoom: 1.22, brighten: true }; // beige backdrop (~rgb 236) + padding
  if (src.includes('tagheuer.com')) return { zoom: 1.18 }; // soldier with generous margins (fill 0.76)
  if (src.includes('tissotwatches.com')) return { zoom: 1.1 }; // shadow shots, fill 0.82
  if (src.includes('montblanc.com')) return { zoom: 1.05 }; // fill 0.89
  if (src.includes('breitling')) return { zoom: 1.06 }; // soldier thumbnails
  return { zoom: 1 }; // GP / UN / Locman heroes already fill the frame
}

export function WatchPhoto({ src, alt, eager = false, onError }: {
  src: string;
  alt: string;
  eager?: boolean;
  onError?: () => void;
}) {
  const cfg = cfgFor(src);
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      draggable={false}
      onError={onError}
      className={`h-full w-full ${cfg.cover ? 'object-cover' : 'object-contain'}`}
      style={{
        transform: cfg.zoom !== 1 ? `scale(${cfg.zoom})` : undefined,
        filter: cfg.brighten ? 'brightness(1.07)' : undefined,
      }}
    />
  );
}
