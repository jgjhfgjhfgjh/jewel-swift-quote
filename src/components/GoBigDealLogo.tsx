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

export function GoBigDealLogo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline whitespace-nowrap font-sans font-bold tracking-tight leading-none ${className}`}
      aria-label="GoBigDeal"
    >
      GoBigDeal
    </span>
  );
}
