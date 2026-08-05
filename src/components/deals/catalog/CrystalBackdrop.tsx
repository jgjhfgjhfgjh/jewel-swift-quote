/**
 * Krystalová scéna pod CELOU hero sekcí /deals — černé broušené krystaly na
 * bílé. „Krystalový" dojem nese POZADÍ, ne písmo: wordmark zůstává čistá
 * typografie (varianta 3 z návrhu).
 *
 * Vrstva kryje hlavičku i KPI lištu (logo → headline → CTA → čísla). Pod ní se
 * stránka vrací do čisté bílé, aby katalog a filtry zůstaly klidné čtení.
 *
 * STATICKÁ ILUSTRACE, ne video. Původně tu běžela smyčka `crystals.mp4`; scéna
 * je zaseknutá na jednom snímku (t ≈ 2,35 s — kámen tam sahá k oběma okrajům,
 * což viněta potřebuje) vyexportovaném do `/gbd-crystals.jpg`. Pozadí pod celou
 * hero zónou nemá důvod se hýbat a 42 kB obrázek nahradil 1,5 MB video, které
 * se dekódovalo po celou dobu scrollu. Zdrojové video zůstává v repu
 * (`public/deal-videos/crystals.mp4`) pro případ návratu k pohybu.
 *
 * Kompozice:
 *  · `mix-blend-mode: multiply` — bílé pozadí snímku zmizí, zůstane jen tmavý
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
 *    živým obsahem, ne pod jedním slovem.
 *
 * Bez `motion-reduce:hidden` — vrstva se nehýbe, není co skrývat.
 */
export function CrystalBackdrop({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute overflow-hidden ${className}`}
    >
      <img
        src="/gbd-crystals.jpg"
        alt=""
        draggable={false}
        className="h-full w-full object-cover opacity-[0.82] [mix-blend-mode:multiply]
                   [filter:grayscale(1)_contrast(2.15)_brightness(0.7)]
                   [mask-image:radial-gradient(94%_98%_at_50%_45%,black_0%,transparent_100%)]"
      />
      {/* středový závoj — bílá je nejkrycí tam, kde leží obsah (levý sloupec
          i výjev vpravo), k okrajům se otevírá a pouští kámen ke slovu.
          Střed drží krycí, i když kámen kolem zesílil: pod headlinem a
          BrandSpotlightem se čte text, ne kámen. */}
      <div className="absolute inset-0 [background:radial-gradient(112%_98%_at_50%_52%,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.66)_40%,rgba(255,255,255,0.14)_76%,transparent_100%)]" />
      {/* spodní třetina do čista — přechod hero → bílý katalog bez hrany */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 [background:linear-gradient(to_bottom,transparent,#fff)]" />
    </div>
  );
}
