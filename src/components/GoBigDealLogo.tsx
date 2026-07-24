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
  // Obal do jednoho inline spanu → ve flex kontejnerech (nav položka s gap,
  // tlačítka) se „GoBig" a „deal" neroztrhnou na dvě položky s mezerou mezi.
  return (
    <span className="whitespace-nowrap">
      GoBig<span className="italic">deal{suffix}</span>
    </span>
  );
}

export function GoBigDealLogo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline whitespace-nowrap font-sans tracking-tight leading-none ${className}`}
      aria-label="GoBigdeal"
    >
      <span className="font-light">Go</span>
      <span className="font-extrabold">Big</span>
      <span className="font-light italic">deal</span>
    </span>
  );
}
