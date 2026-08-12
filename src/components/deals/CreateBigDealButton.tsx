import { openCreateDealDialog } from '@/components/deals/CreateDealDialog';

/* Obrys ani plus nemají vlastní barvu — berou ji z textu tlačítka
   (currentColor). Nad videem a na obsidiánu jsou tedy bílé, na bílé
   navigaci tmavé; žádný gradient. */
/* Barvy jdou TŘÍDAMI, ne inline stylem: inline styl by přebil hover
   variantu a plus by na bílém tlačítku zůstal světlý. */
const PLUS_V = 'bg-current group-hover/cbd:bg-zinc-900';
const PLUS_H = 'bg-current group-hover/cbd:bg-zinc-900';

/* Prstenec s PRŮHLEDNÝM vnitřkem: plocha v barvě textu, z níž maska
   vyřízne vnitřek (content-box). Dvouvrstvé pozadí s background-clip
   by nestačilo — vnitřní vrstva by musela být neprůhledná a tlačítko by
   přestalo fungovat na bílé navigaci i na obsidiánu zároveň. */
const RING_STYLE: React.CSSProperties = {
  background: 'currentColor',
  padding: 1,
  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
  WebkitMaskComposite: 'xor',
  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
  maskComposite: 'exclude',
};

/**
 * CTA CreateBigDeal — JEDNO tlačítko pro navigaci i pro /deals (dřív dvě
 * kopie, které se rozcházely), takže jsou tvarem, písmem i chováním 1:1.
 *
 * V klidu je průhledné a bílé: obrys, plus i popisek berou barvu z textu
 * tlačítka (nad videem a na obsidiánu bílá, na bílé navigaci tmavá).
 * Hover je beze změny — plná bílá pilulka s tmavým textem, prstenec se
 * přitom vytratí a plus zčerná.
 *
 * Plus je schválně ze dvou proužků, ne z lucide ikony — drží tak přesně
 * tloušťku i barvu obrysu.
 */
export function CreateBigDealButton({
  className = '',
  labelClassName = '',
  tone = 'text-white',
}: {
  /** Doplňkové třídy obalu (viditelnost v breakpointech apod.). */
  className?: string;
  /** Doplňkové třídy popisku — navigace ho pod xl schovává. */
  labelClassName?: string;
  /** Barva textu v KLIDU; na hover ji vždy přebije tmavá na bílé. */
  tone?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => openCreateDealDialog()}
      title="CreateBigDeal"
      /* border-transparent drží stejný box model jako dřívější tlačítko
         s rámečkem — prstenec kreslí span uvnitř */
      className={`group/cbd relative inline-flex shrink-0 items-center gap-1.5 rounded-full border border-transparent
                  px-4 py-1.5 font-sans text-[15px] font-semibold transition-all duration-200
                  hover:border-white hover:bg-white hover:text-zinc-900
                  hover:shadow-[0_10px_24px_-8px_rgba(15,23,42,0.35)]
                  ${tone} ${className}`}
    >
      <span
        aria-hidden
        style={RING_STYLE}
        className="pointer-events-none absolute inset-0 rounded-full opacity-40 transition-opacity duration-200 group-hover/cbd:opacity-0"
      />
      <span className="relative h-4 w-4 shrink-0">
        <span className={`absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full transition-colors ${PLUS_H}`} />
        <span className={`absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 rounded-full transition-colors ${PLUS_V}`} />
      </span>
      <span className={`relative ${labelClassName}`}>CreateBigDeal</span>
    </button>
  );
}
