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

/**
 * Médium karty pro OBCHODNÍKA — SKUTEČNÉ zboží z té konkrétní dávky, kus po
 * kuse. Místo vygenerované reklamy (jazyk koncového zákazníka) odpovídá na to,
 * co kupec řeší: co v dávce je, jaká je úroveň zboží a jaká marže.
 *
 * Skladba drží jazyk dřívějšího videa: produkt plní médium, PŘES něj leží
 * vodoznak značky daného kusu a v rohu logo koncernu. Cena patří vždy k právě
 * zobrazenému kusu — data po produktech, nic se neprůměruje. Velkoobchodní
 * cena je za přihlášením (hradlo `hero.note`), host vidí RRP, slevu a zámek.
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

  useEffect(() => {
    if (pool.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % pool.length), HOLD_MS);
    return () => clearInterval(id);
  }, [pool.length]);

  if (!pool.length) return null;

  const item = pool[idx % pool.length];
  const brandName = item.brand ? toDisplayName(item.brand) : undefined;
  const brandDomain = brandName ? getBrandByName(brandName)?.domain : undefined;

  return (
    <div data-reel className={`overflow-hidden bg-white ${className}`}>
      {/* vodoznak značky PŘES produkt — tichá obdoba outra z videa */}
      {brandName && (
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <BrandLogo
            key={brandName}
            name={brandName}
            domain={brandDomain ?? ''}
            width={400}
            height={160}
            className="h-auto w-[62%] object-contain opacity-[0.13] [mix-blend-mode:multiply]"
            fallbackClassName="text-2xl font-bold uppercase tracking-widest text-zinc-900/10"
          />
        </div>
      )}

      {/* produkt — jeden kus přes celé médium, výměna prolnutím */}
      <img
        key={item.img}
        src={item.img}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full animate-in fade-in object-contain p-5 duration-700 [mix-blend-mode:multiply]"
      />

      {/* koncern v rohu — stejně jako když v médiu běželo video */}
      {concernDomain && (
        <BrandLogo
          name={concernName ?? ''}
          domain={concernDomain}
          width={200}
          height={80}
          className="absolute bottom-2.5 left-3 h-4 w-auto max-w-[92px] object-contain opacity-80 [mix-blend-mode:multiply]"
          fallbackClassName="absolute bottom-2.5 left-3 text-[10px] font-bold text-zinc-500"
        />
      )}

      {/* cena PRÁVĚ zobrazeného kusu — RRP a sleva veřejně, VO za přihlášením */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-2 py-1 shadow-sm backdrop-blur">
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
  );
}
