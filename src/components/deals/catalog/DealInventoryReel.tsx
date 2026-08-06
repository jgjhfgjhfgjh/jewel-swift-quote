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
 * zobrazenému kusu). V pruhu vlevo zůstává koncern, jako když tu hrálo video.
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
  concernName,
  concernDomain,
  className = '',
}: {
  dealId: string;
  concernName?: string;
  concernDomain?: string;
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
      {/* ── plocha produktu ── */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-3">
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
        <div className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-2 py-1 shadow-sm backdrop-blur">
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

      {/* ── pruh značky (jazyk brandshow karuselu): logo značky uprostřed,
             koncern drobně vlevo ── */}
      <div className="relative flex h-[34%] shrink-0 items-center justify-center border-t border-slate-100 bg-slate-50/60 px-3">
        {concernDomain && (
          <BrandLogo
            name={concernName ?? ''}
            domain={concernDomain}
            width={200}
            height={80}
            className="absolute left-3 h-3.5 w-auto max-w-[64px] object-contain opacity-60 [mix-blend-mode:multiply]"
            fallbackClassName="absolute left-3 text-[9px] font-bold uppercase tracking-wider text-slate-400"
          />
        )}
        {brandName && (
          <BrandLogo
            key={brandName}
            name={brandName}
            domain={brandDomain ?? ''}
            width={400}
            height={160}
            /* pevná výška → všechna loga mají stejnou vizuální váhu */
            className="h-7 w-auto max-w-[58%] animate-in fade-in object-contain duration-500 [mix-blend-mode:multiply]"
            fallbackClassName="text-base font-bold uppercase tracking-wide text-zinc-900"
          />
        )}
      </div>
    </div>
  );
}
