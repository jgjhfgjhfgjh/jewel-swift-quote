import { useEffect, useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useDealReel, type DealReelItem } from '@/hooks/useDealReel';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

/** Kolik dlaždic zboží je v mřížce vidět (3×2). */
const CELLS = 6;
/** Jak často se jedna buňka vymění za další kus z dávky. */
const SWAP_MS = 1500;

/**
 * Médium karty pro OBCHODNÍKA — „inventory reel": mřížka SKUTEČNÝCH produktů
 * z té konkrétní dávky, kde se po sekundách jedna buňka prostřídá za další
 * kus. Místo vygenerované reklamy (jazyk koncového zákazníka) odpovídá na to,
 * co kupec skutečně řeší: co v dávce je, jaká je úroveň zboží a jaká marže.
 *
 * Data jsou po produktech, nic se neprůměruje — pod aktivní buňkou svítí cena
 * PRÁVĚ toho kusu. Velkoobchodní cena je za přihlášením (stejné hradlo jako
 * `hero.note`: „Velkoobchodní ceny a marže se zobrazí po přihlášení"), host
 * vidí RRP a slevu.
 */
export function DealInventoryReel({
  dealId,
  className = '',
}: {
  dealId: string;
  className?: string;
}) {
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang];
  const { user } = useAuthContext();
  const { data: pool = [] } = useDealReel(dealId);

  /* Buňky drží indexy do poolu; každý tik posune JEDNU buňku na další kus,
     takže mřížka žije, ale nepůsobí jako slideshow. */
  const [cells, setCells] = useState<number[]>([]);
  const [cursor, setCursor] = useState(CELLS);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (pool.length) setCells(Array.from({ length: CELLS }, (_, i) => i % pool.length));
  }, [pool.length]);

  useEffect(() => {
    if (pool.length <= CELLS) return;
    const id = setInterval(() => {
      setCells((prev) => {
        if (!prev.length) return prev;
        const slot = cursor % CELLS;
        const next = [...prev];
        next[slot] = cursor % pool.length;
        setActive(slot);
        return next;
      });
      setCursor((c) => c + 1);
    }, SWAP_MS);
    return () => clearInterval(id);
  }, [cursor, pool.length]);

  const shown: (DealReelItem | undefined)[] = useMemo(
    () => cells.map((i) => pool[i]),
    [cells, pool],
  );
  const highlight = shown[active];

  if (!pool.length) return null;

  return (
    <div className={`grid grid-cols-3 grid-rows-2 gap-px bg-slate-100 ${className}`}>
      {shown.map((p, i) => (
        <div key={i} className="relative flex items-center justify-center overflow-hidden bg-white p-2">
          {p && (
            <img
              /* klíč na URL → výměna kusu se prolne, ne přeblikne */
              key={p.img}
              src={p.img}
              alt=""
              loading="lazy"
              className="h-full w-full animate-in fade-in object-contain duration-700 [mix-blend-mode:multiply]"
            />
          )}
          {/* jemný rámeček kolem právě vyměněného kusu — oko ví, ke kterému
              zboží patří cena v pruhu, aniž by na kartě přibyl další chip */}
          {p && i === active && (
            <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-zinc-900/15" />
          )}
        </div>
      ))}

      {/* cenový pruh vždy k PRÁVĚ vyměněnému kusu — RRP a sleva veřejně,
          velkoobchodní cena za přihlášením (hradlo `hero.note`) */}
      {highlight && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-white via-white/95 to-transparent px-3 pb-2 pt-5">
          <span className="font-mono text-[11px] text-slate-500">
            {t.product.rrp} <span className="text-zinc-900">{Math.round(highlight.retail)} €</span>
          </span>
          {user && highlight.wholesale > 0 ? (
            <span className="font-mono text-[11px] text-slate-500">
              → <span className="font-bold text-emerald-600">{Math.round(highlight.wholesale)} €</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-400">
              <Lock className="h-2.5 w-2.5" /> {t.product.yourPrice}
            </span>
          )}
          {highlight.discount > 0 && (
            <span className="ml-auto rounded-full bg-red-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-red-600 ring-1 ring-red-100">
              −{highlight.discount} %
            </span>
          )}
        </div>
      )}
    </div>
  );
}
