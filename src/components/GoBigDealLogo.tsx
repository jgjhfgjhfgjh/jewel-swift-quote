import { Layers } from 'lucide-react';

/**
 * Wordmark „GoBigdeal" (zkušební logo, bez ikony).
 *
 * Velikost řídí font-size z `className` (text-lg / text-xl …). Barvu řídí
 * `currentColor`, takže jedna komponenta pokrývá bílou i tmavou variantu podle
 * kontextu — stejně jako SweltMark.
 *
 * Typografie dle reference: „Go" a „deal" tenké (deal kurzívou), „Big" tučné.
 */
/**
 * Inline značka „GoBig<deal>" pro použití uvnitř běžného textu (nadpisy,
 * tlačítka, odrážky). „deal" je vždy kurzívou — sjednocuje brand napříč webem.
 * `suffix` pro množné číslo apod. („GoBigdeals").
 */
export function Gbd({ suffix = '' }: { suffix?: string }) {
  // Jeden inline span → ve flex kontejnerech se slovo neroztrhne s mezerou.
  return <span className="whitespace-nowrap font-bold">GoBigDeal{suffix}</span>;
}

/**
 * HLAVNÍ IKONA značky (pokyn) — vrstvy (Layers): dávky naskládané na sobě.
 * Stojí před wordmarkem a později poslouží jako ikona aplikace GoBigDeal
 * na cihličce v menu — proto žije jako samostatný export, aby šla vysadit
 * i bez textu (favicon, app tile, splash).
 *
 * Velikost i barva jedou z `currentColor` a `1em` — ikona se škáluje
 * s font-size wordmarku, se kterým stojí.
 */
export function GoBigDealMark({ className = '' }: { className?: string }) {
  return <Layers className={`inline-block h-[1em] w-[1em] shrink-0 ${className}`} aria-hidden />;
}

export function GoBigDealLogo({
  className = '',
  withMark = true,
}: {
  className?: string;
  /** `false` = jen wordmark (místa, kde ikonu nese už okolí). */
  withMark?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-[0.3em] whitespace-nowrap font-sans font-black tracking-tight leading-none ${className}`}
      aria-label="GoBigDeal"
    >
      {withMark && <GoBigDealMark />}
      <span>GoBigDeal</span>
    </span>
  );
}
