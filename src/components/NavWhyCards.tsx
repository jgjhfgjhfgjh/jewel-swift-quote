/* Karty panelu — stejný tvar, stín i hover jako v GoBigDeal a MyDeal mega menu. */
const CARD =
  'flex flex-col rounded-[1.25rem] border border-slate-200/70 bg-white p-6 text-left transition-all duration-300 ease-out ' +
  'h-[clamp(260px,26vw,360px)] ' +
  'shadow-[0_12px_32px_-8px_rgba(15,23,42,0.16),0_3px_8px_rgba(15,23,42,0.07)] hover:-translate-y-1.5 hover:border-slate-300 ' +
  'hover:shadow-[0_36px_64px_-18px_rgba(15,23,42,0.32),0_8px_18px_rgba(15,23,42,0.12)]';

/* Dvě strany trhu — obsah karet se doplní později, teď nesou jen titulek. */
const CARDS = ['Buyers', 'Sellers'];

/**
 * „Why" mega menu — dvě karty přes celou šířku panelu, jedna pro kupující,
 * druhá pro prodávající.
 *
 * Nahradily nekonečný kolotoč osmi šedých karet: každá karta má teď šířku,
 * kterou v kolotoči měla jen ta rozšířená při hoveru. Výška zůstala stejná
 * (clamp(260,26vw,360)), takže se panel otevírá do stejné velikosti jako
 * ostatní mega menu.
 */
export function NavWhyCards() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CARDS.map((label) => (
        <div key={label} className={CARD}>
          <p className="font-sans text-3xl font-extralight tracking-tight text-zinc-900">{label}</p>
        </div>
      ))}
    </div>
  );
}
