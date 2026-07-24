/**
 * Značka swelt — dvojitá šipka (výměna / obousměrný tok).
 *
 * Vektorová rekonstrukce z podkladu „swelt. (Web) v2“ (higgsfield, 3840×2160):
 * novější, čistší varianta s rovnými hranami. Obrys vytrasován z bitmapy
 * (sledování hranice + RDP zjednodušení) při plném rozlišení (šipka ~864 px)
 * a ověřen proti předloze — IoU 0.991, ~0,13 % odchylky (jen antialiasovaná
 * hrana). Poměr stran 1.75 shodný s originálem.
 *
 * Barvu řídí `currentColor`, takže jedna komponenta pokrývá černou i bílou
 * variantu podle kontextu (text-white nad videem, text-foreground na bílé).
 */
export function SweltMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 192 110"
      role="img"
      aria-label="swelt"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M53.86 0.66L54.08 30.68L102.65 30.68L100.22 34.88L83.89 59.82L73.29 77.04L54.3 77.04L53.86 77.48L53.86 108.39L44.81 98.45L0.66 54.3L51.21 3.75Z" />
      <path d="M136.87 0.66L169.98 32.89L191.17 54.08L136.87 108.61L136.64 77.04L87.86 77.04L117.44 30.68L136.87 30.46Z" />
    </svg>
  );
}
