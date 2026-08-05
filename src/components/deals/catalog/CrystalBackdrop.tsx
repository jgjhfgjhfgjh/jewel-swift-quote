/**
 * Krystalová scéna pod CELOU hero sekcí /deals — pomalu rotující černé broušené
 * krystaly na bílé. „Krystalový" dojem nese POZADÍ, ne písmo: wordmark
 * zůstává čistá typografie (varianta 3 z návrhu).
 *
 * Vrstva kryje hlavičku i KPI lištu (logo → headline → CTA → čísla). Pod ní se
 * stránka vrací do čisté bílé, aby katalog a filtry zůstaly klidné čtení.
 *
 * Kompozice:
 *  · `mix-blend-mode: multiply` — bílé pozadí videa zmizí, zůstane jen tmavý
 *    kámen, takže vrstva splyne s bílou plochou dashboardu bez tvrdých hran,
 *  · radiální maska VEN do ztracena (střed viditelný, okraje průhledné) —
 *    jinak by plocha na bílé ploše končila tvrdou hranou obdélníku,
 *  · grayscale + kontrast — generovaný kámen vyšel světle šedý, filtr ho
 *    stáhne do černého obsidiánu bez další generace,
 *  · dva bílé závoje: středový drží kontrast OBOU obsahových zón naráz —
 *    textového sloupce vlevo i BrandSpotlightu vpravo (ten kreslí velké názvy
 *    značek světle šedou, v kameni by se ztratily) — takže kámen zůstane jen
 *    na okrajích a rámuje kompozici jako viněta; spodní rozpouští scénu do
 *    bílé, aby KPI lišta navázala na katalog bez viditelné hrany,
 *  · nižší opacita než u dřívějšího pásu jen za logem — kámen teď leží pod
 *    živým obsahem, ne pod jedním slovem,
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
        className="h-full w-full object-cover opacity-[0.58] [mix-blend-mode:multiply]
                   [filter:grayscale(1)_contrast(1.9)_brightness(0.8)]
                   [mask-image:radial-gradient(86%_92%_at_50%_45%,black_0%,transparent_100%)]"
      />
      {/* středový závoj — bílá je nejkrycí tam, kde leží obsah (levý sloupec
          i výjev vpravo), k okrajům se otevírá a pouští kámen ke slovu */}
      <div className="absolute inset-0 [background:radial-gradient(115%_100%_at_50%_52%,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.78)_42%,rgba(255,255,255,0.28)_78%,transparent_100%)]" />
      {/* spodní třetina do čista — přechod hero → bílý katalog bez hrany */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 [background:linear-gradient(to_bottom,transparent,#fff)]" />
    </div>
  );
}
