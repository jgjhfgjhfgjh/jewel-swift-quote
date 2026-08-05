/**
 * Krystalová scéna za logem v hero /deals — pomalu rotující černé broušené
 * krystaly na bílé. „Krystalový" dojem nese POZADÍ, ne písmo: wordmark
 * zůstává čistá typografie (varianta 3 z návrhu).
 *
 * Kompozice:
 *  · `mix-blend-mode: multiply` — bílé pozadí videa zmizí, zůstane jen tmavý
 *    kámen, takže vrstva splyne s bílou plochou dashboardu bez tvrdých hran,
 *  · radiální maska VEN do ztracena (střed viditelný, okraje průhledné) —
 *    jinak by pás na bílé ploše končil tvrdou hranou obdélníku,
 *  · grayscale + kontrast — generovaný kámen vyšel světle šedý, filtr ho
 *    stáhne do černého obsidiánu bez další generace,
 *  · `motion-reduce:hidden` — kdo má vypnuté animace, vrstvu nedostane.
 */
export function CrystalBackdrop({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute overflow-hidden motion-reduce:hidden ${className}`}
    >
      <video
        src="/deal-videos/crystals.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover opacity-[0.62] [mix-blend-mode:multiply]
                   [filter:grayscale(1)_contrast(1.75)_brightness(0.85)]
                   [mask-image:radial-gradient(52%_62%_at_50%_50%,black_0%,transparent_100%)]"
      />
      {/* bílý závoj přesně pod wordmarkem — drží kontrast tmavého písma nad
          kamenem, aniž by scéna ztratila hloubku */}
      <div className="absolute inset-0 [background:radial-gradient(38%_46%_at_50%_50%,rgba(255,255,255,0.92),transparent_75%)]" />
    </div>
  );
}
