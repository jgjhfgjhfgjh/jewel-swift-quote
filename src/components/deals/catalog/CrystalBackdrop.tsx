/**
 * Krystalová scéna pod CELOU hero sekcí /deals — broušené krystaly na matně
 * černé ploše. „Krystalový" dojem nese POZADÍ, ne písmo: wordmark zůstává
 * čistá typografie (varianta 3 z návrhu).
 *
 * Vrstva kryje značkovou hlavičku (logo → headline → CTA). Nad ní i pod ní
 * jede stránka na čisté obsidiánové ploše, aby katalog zůstal klidné čtení.
 *
 * STATICKÁ ILUSTRACE, ne video. Původně tu běžela smyčka `crystals.mp4`; scéna
 * je zaseknutá na jednom snímku (t ≈ 2,35 s — kámen tam sahá k oběma okrajům,
 * což viněta potřebuje) vyexportovaném do `/gbd-crystals.jpg`. Pozadí pod celou
 * hero zónou nemá důvod se hýbat a 42 kB obrázek nahradil 1,5 MB video, které
 * se dekódovalo po celou dobu scrollu. Zdrojové video zůstává v repu
 * (`public/deal-videos/crystals.mp4`) pro případ návratu k pohybu.
 *
 * Kompozice (verze pro MATNĚ ČERNOU plochu stránky):
 *  · `invert(1)` + `mix-blend-mode: screen` — snímek je černý kámen na bílé;
 *    inverze z něj udělá stříbrný kámen na černé a `screen` pak nechá projít
 *    jen ten kámen (černá se na černé ploše nijak neprojeví). Multiply, který
 *    tu byl pro bílou variantu, by na černé nezobrazil vůbec nic,
 *  · radiální maska VEN do ztracena (střed viditelný, okraje průhledné) —
 *    jinak by plocha končila tvrdou hranou obdélníku,
 *  · grayscale + brightness — inverze rozsvítí kámen do skoro bílé, filtr ho
 *    stáhne zpět do stříbrné, aby nepřebil obsah,
 *  · dva ČERNÉ závoje (dřív bílé): středový drží kontrast OBOU obsahových zón
 *    naráz — textového sloupce vlevo i BrandSpotlightu vpravo — takže kámen
 *    zůstane jen na okrajích a rámuje kompozici jako viněta; spodní rozpouští
 *    scénu do plochy stránky, aby hero navázalo na landing sekce bez hrany.
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
        className="h-full w-full object-cover opacity-[0.55] [mix-blend-mode:screen]
                   [filter:grayscale(1)_invert(1)_contrast(1.35)_brightness(0.62)]
                   [mask-image:radial-gradient(94%_98%_at_50%_45%,black_0%,transparent_100%)]"
      />
      {/* středový závoj — černá je nejkrycí tam, kde leží obsah (levý sloupec
          i výjev vpravo), k okrajům se otevírá a pouští kámen ke slovu */}
      <div className="absolute inset-0 [background:radial-gradient(112%_98%_at_50%_52%,rgba(11,18,21,0.86)_0%,rgba(11,18,21,0.62)_40%,rgba(11,18,21,0.12)_76%,transparent_100%)]" />
      {/* spodní třetina do plochy stránky — přechod hero → landing sekce bez
          viditelné hrany (obsidián #0B1215) */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 [background:linear-gradient(to_bottom,transparent,#0B1215)]" />
    </div>
  );
}
