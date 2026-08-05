import { useEffect, useRef, useState } from 'react';
import { BrandLogo } from '@/components/BrandLogo';
import type { DealVideo } from '@/data/dealVideos';

/** Okno outra — posledních ~1,3 s smyčky patří logu značky. */
const OUTRO_S = 1.3;

/**
 * Přehrávač reklamního videa karty: autoplay muted loop + OUTRO — na konci
 * každé smyčky se přes celé video prolne VELKÉ bílé průhledné logo značky
 * (a s restartem smyčky zase zmizí). Overlay je sourozenec videa BEZ
 * z-indexu: štítky, scrim i logo koncernu renderované později v DOM
 * zůstávají nad ním.
 */
export function DealVideoMedia({ video, className }: { video: DealVideo; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [outro, setOutro] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // timeupdate stačí (≈4 Hz) — okno outra je 1,3 s, prolnutí kryje zbytek
    const onTime = () => setOutro(v.duration > 0 && v.duration - v.currentTime <= OUTRO_S);
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, []);

  return (
    <>
      <video
        ref={ref}
        src={video.src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={className}
      />
      {/* outro: velké bílé průhledné logo značky přes celé video */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
          outro ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <BrandLogo
          name={video.brandName}
          domain={video.brandDomain ?? ''}
          width={560}
          height={240}
          className="max-h-[55%] w-[68%] object-contain opacity-85 [filter:brightness(0)_invert(1)] drop-shadow-[0_2px_14px_rgba(0,0,0,0.4)]"
          fallbackClassName="text-4xl font-bold text-white/85 drop-shadow-[0_2px_14px_rgba(0,0,0,0.4)]"
        />
      </div>
    </>
  );
}
