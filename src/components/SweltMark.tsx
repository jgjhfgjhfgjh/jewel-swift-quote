/**
 * Značka swelt — dvojitá šipka (výměna / obousměrný tok).
 *
 * Vektorová rekonstrukce z podkladu „swelt. (Web).png“: originál je rastr
 * pouhých 190×94 px, takže zvětšování by bylo rozmazané. Obrys byl vytrasován
 * z bitmapy (sledování hranice + RDP zjednodušení) a ověřen proti předloze —
 * 0 strukturálních rozdílů, odchylky jen na hranici (antialiasing).
 *
 * Barvu řídí `currentColor`, takže jedna komponenta pokrývá černou i bílou
 * variantu podle kontextu (text-white nad videem, text-foreground na bílé).
 */
export function SweltMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 190 94"
      role="img"
      aria-label="swelt"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M52 0L56 0L60 5L60 23L61 24L104 24L99 31L99 32L96 35L96 36L94 38L94 39L92 41L88 48L85 51L84 54L82 56L82 57L80 59L80 60L78 62L74 69L72 71L61 71L60 72L60 89L59 90L59 92L57 94L51 94L49 93L34 79L33 79L20 67L19 67L11 59L10 59L5 54L4 54L1 51L1 49L0 48L1 44L7 38L8 38L15 31L16 31L22 25L23 25L45 5L46 5L50 1Z" />
      <path d="M135 0L139 0L141 1L160 18L161 18L168 25L169 25L175 31L176 31L183 38L184 38L190 44L190 51L181 59L180 59L164 74L163 74L159 78L158 78L149 87L148 87L142 93L140 94L134 94L131 90L131 72L130 71L87 71L87 70L92 64L92 63L100 52L101 49L104 46L105 43L107 41L109 37L112 34L116 27L119 24L130 24L131 23L131 5Z" />
    </svg>
  );
}
