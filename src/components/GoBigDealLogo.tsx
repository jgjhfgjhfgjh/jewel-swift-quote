import { PackageOpen } from 'lucide-react';

/**
 * Wordmark „GoBigdeal" + ikona otevřené krabice (zkušební logo).
 *
 * Velikost řídí font-size z `className` (text-lg / text-xl …), ikona se škáluje
 * v em. Barvu řídí `currentColor` (stroke ikony i text), takže jedna komponenta
 * pokrývá bílou i tmavou variantu podle kontextu — stejně jako SweltMark.
 *
 * Typografie dle reference: „Go" a „deal" tenké (deal kurzívou), „Big" tučné.
 */
export function GoBigDealLogo({
  className = '',
  hideTextOnMobile = false,
}: {
  className?: string;
  /** V navbaru: na úzkém mobilu jen ikona (wordmark by přetekl vedle CTA) */
  hideTextOnMobile?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap leading-none ${className}`}
      aria-label="GoBigdeal"
    >
      <PackageOpen className="h-[1.35em] w-auto shrink-0" strokeWidth={1.6} aria-hidden />
      <span className={`font-sans tracking-tight ${hideTextOnMobile ? 'hidden sm:inline' : ''}`}>
        <span className="font-light">Go</span>
        <span className="font-extrabold">Big</span>
        <span className="font-light italic">deal</span>
      </span>
    </span>
  );
}
