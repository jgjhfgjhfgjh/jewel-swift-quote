/**
 * Wordmark „BigDealSupplier" — dodavatelská větev GoBigDeal světa.
 *
 * Stejná pravidla jako GoBigDealLogo: velikost řídí font-size z `className`,
 * barvu `currentColor` (pokrývá bílou i tmavou variantu), celé tučně bez
 * mezer a kurzívy. „Supplier" nese jemně tlumený tón, aby bylo poznat, že
 * jde o sesterskou značku, ne o jinou firmu.
 */
export function BigDealSupplierLogo({ className = '' }: { className?: string }) {
  return (
    /* plain inline (ne inline-flex) — ve flexu by se „BigDeal" a „Supplier"
       staly samostatnými položkami a rodičovský gap by je roztrhl mezerou */
    <span
      className={`inline whitespace-nowrap font-sans font-black tracking-tight leading-none ${className}`}
      aria-label="BigDealSupplier"
    >
      BigDeal<span className="opacity-60">Supplier</span>
    </span>
  );
}
