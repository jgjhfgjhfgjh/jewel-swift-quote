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
 * HLAVNÍ IKONA značky (pokyn) — gradientový INDIKÁTOR: stejná tečka, jakou
 * nesou řádky dealů, jen ve značkové škále (modrá → tyrkys → smaragd).
 * `tone="red"` je stavová varianta pro připravované dávky (červený gradient).
 *
 * Velikost jede z `em`, takže se tečka škáluje s font-size wordmarku,
 * se kterým stojí. Stejná tečka je i faviconou webu (public/favicon.svg).
 */
export function GoBigDealMark({
  className = '',
  tone = 'brand',
}: {
  className?: string;
  tone?: 'brand' | 'red';
}) {
  return (
    <span
      aria-hidden
      className={`inline-block h-[0.55em] w-[0.55em] shrink-0 rounded-full ${
        tone === 'red'
          ? 'bg-gradient-to-r from-red-500 to-rose-400'
          : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400'
      } ${className}`}
    />
  );
}

export function GoBigDealLogo({
  className = '',
  withMark = true,
  markTone = 'brand',
}: {
  className?: string;
  /** `false` = jen wordmark (místa, kde ikonu nese už okolí). */
  withMark?: boolean;
  /** Barva indikátoru — `red` značí připravovanou dávku na řádcích dealů. */
  markTone?: 'brand' | 'red';
}) {
  return (
    <span
      className={`inline-flex items-center gap-[0.3em] whitespace-nowrap font-sans font-black tracking-tight leading-none ${className}`}
      aria-label="GoBigDeal"
    >
      {withMark && <GoBigDealMark tone={markTone} />}
      <span>GoBigDeal</span>
    </span>
  );
}
