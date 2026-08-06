import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuthContext } from '@/contexts/AuthContext';
import { getBrandByName } from '@/data/brands';
import { useDealReel } from '@/hooks/useDealReel';
import { toDisplayName } from '@/lib/brandNormalize';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

/** Jak dlouho zůstane jeden kus v záběru. */
const HOLD_MS = 2600;
/** Pod touto šířkou je fotka miniatura — nesmí se roztáhnout přes celé médium. */
const SMALL_PX = 260;

/**
 * Médium karty pro OBCHODNÍKA — SKUTEČNÉ zboží z dávky, kus po kuse.
 *
 * Skladba podle brandshow karuselu: produkt v horní části, POD ním pruh
 * s logem značky (u dávek s více značkami se logo střídá spolu s produktem,
 * u jednoznačkových stojí — plyne to samo z toho, že logo patří k právě
 * zobrazenému kusu). Levý roh média drží číslo dávky (kreslí DealTile).
 *
 * Cena patří vždy k právě zobrazenému kusu — data po produktech, nic se
 * neprůměruje. Velkoobchodní cena je za přihlášením (hradlo `hero.note`).
 *
 * Miniatury (Swarovski 100 px, Versace 125 px — viz useDealReel) se
 * NEROZTAHUJÍ: fotka se vykreslí v nativní velikosti doprostřed plochy, takže
 * působí jako drobný snímek, ne jako rozmazaná vada.
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
  const [idx, setIdx] = useState(0);
  /** Nativní šířka právě načtené fotky — rozhoduje, jestli ji smíme roztáhnout. */
  const [natural, setNatural] = useState<number | null>(null);

  useEffect(() => {
    if (pool.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % pool.length), HOLD_MS);
    return () => clearInterval(id);
  }, [pool.length]);

  if (!pool.length) return null;

  const item = pool[idx % pool.length];
  const brandName = item.brand ? toDisplayName(item.brand) : undefined;
  const brandDomain = brandName ? getBrandByName(brandName)?.domain : undefined;
  const isSmall = natural !== null && natural < SMALL_PX;

  return (
    <div data-reel className={`flex flex-col bg-white ${className}`}>
      {/* ── plocha produktu — odsazení jako v brandshow karuselu
             (mx-4 mt-3 mb-4 kolem produktu) ── */}
      <div className="relative mx-4 mb-4 mt-3 flex min-h-0 flex-1 items-center justify-center">
        <img
          key={item.img}
          src={item.img}
          alt=""
          loading="lazy"
          onLoad={(e) => setNatural(e.currentTarget.naturalWidth)}
          className={`animate-in fade-in object-contain duration-700 [mix-blend-mode:multiply] ${
            isSmall ? 'max-h-[74%] w-auto' : 'h-full w-full'
          }`}
        />

        {/* cena PRÁVĚ zobrazeného kusu */}
        <div className="absolute -right-2 -top-1 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-2 py-1 shadow-sm backdrop-blur">
          <span className="font-mono text-[10px] text-slate-500">
            {t.product.rrp} <span className="text-zinc-900">{Math.round(item.retail)} €</span>
          </span>
          {user && item.wholesale > 0 ? (
            <span className="font-mono text-[10px] font-bold text-emerald-600">
              → {Math.round(item.wholesale)} €
            </span>
          ) : (
            <Lock className="h-2.5 w-2.5 text-slate-400" />
          )}
          {item.discount > 0 && (
            <span className="rounded-full bg-red-50 px-1.5 font-mono text-[10px] font-bold text-red-600">
              −{item.discount} %
            </span>
          )}
        </div>
      </div>

      {/* ── řádek značky — 1:1 s karuselem: pevných h-10, logo uprostřed,
             žádný tónovaný pruh; koncern drobně vlevo ── */}
      <div className="relative flex h-10 shrink-0 items-center justify-center px-3">
        {brandName && (
          <BrandLogo
            key={brandName}
            name={brandName}
            domain={brandDomain ?? ''}
            width={400}
            height={160}
            /* jako v karuselu logo vyplní řádek na výšku; h-full (ne max-h-full)
               drží místo i dokud se obrázek nenačte — s max-h by měl nulovou
               výšku a řádek by zůstal prázdný */
            className="h-full w-auto max-w-[62%] animate-in fade-in object-contain py-0.5 duration-500 [mix-blend-mode:multiply]"
            fallbackClassName="whitespace-nowrap text-sm font-black tracking-tight text-zinc-900"
          />
        )}
      </div>
      {/* spodní mezera karuselu (p-1.5) — logo nesedí na hraně média */}
      <div className="h-1.5 shrink-0" />
    </div>
  );
}
