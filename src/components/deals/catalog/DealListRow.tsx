import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, BellRing, Layers, Lock, Tag } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { GoBigDealLogo } from '@/components/GoBigDealLogo';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
import { getBrandByName } from '@/data/brands';
import { toDisplayName } from '@/lib/brandNormalize';
import { countLabel, dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import type { DealTileItem } from '@/lib/dealCatalog';
import type { DealAlertsApi } from '@/hooks/useDealAlerts';

/** EA pill vede na ceník na stránce (#gbd-pricing) — ne do řádku. */
const scrollToPricing = () =>
  document.getElementById('gbd-pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/**
 * Řádek dávky pro seznamové zobrazení dashboardu — hustá, skenovatelná
 * obdoba DealTile ve světlé variantě: bílá karta s hairline rámečkem,
 * logo v plných barvách na slate-50, data v mono písmu, sleva červeně.
 * Připravované řádky nesou stejný interaktivní EA pill jako karty.
 */
export function DealListRow({
  item,
  onTeaserClick,
  alertsApi,
  onRequireAuth,
}: {
  item: DealTileItem;
  onTeaserClick?: () => void;
  /** SDÍLENÁ instance alertů — každý řádek by jinak tahal svůj vlastní dotaz. */
  alertsApi?: DealAlertsApi;
  /** Host nemá kam alert uložit → hradlo registrace. */
  onRequireAuth?: () => void;
}) {
  const lang = useStore((s) => s.lang);
  const d = dealsI18n[lang];
  const c = d.catalog.tile;
  const dash = d.catalog.dash;

  /* Hlídač KONKRÉTNÍ dávky (level 'deal', target = slug). Funguje i u
     uzavřené dávky — tam je to projev zájmu o repete. */
  const watchTarget = item.slug ?? item.id;
  const watching = alertsApi?.has('deal', watchTarget) ?? false;
  const toggleWatch = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!alertsApi) return;
    void alertsApi.toggle('deal', watchTarget, item.title).then((ok) => {
      if (!ok) onRequireAuth?.();
    });
  };

  /* Značky dávky pro řadu log před textem — na mobilu se řádek nesmí ucpat,
     proto jen dvě; od md čtyři. Doména z rejstříku značek, bez ní textový
     fallback (BrandLogo si ho vykreslí sám). */
  const brandLogos = item.brands.slice(0, 4).map((b) => {
    const name = toDisplayName(b);
    return { name, domain: getBrandByName(name)?.domain };
  });

  /* MOBIL: místo řady log jedna pozice, kde se značky střídají. */
  const [brandIdx, setBrandIdx] = useState(0);
  useEffect(() => {
    if (brandLogos.length < 2) return;
    const id = setInterval(() => setBrandIdx((i) => (i + 1) % brandLogos.length), 2200);
    return () => clearInterval(id);
  }, [brandLogos.length]);


  const status =
    item.kind === 'live' && item.deadline ? (
      <CountdownTimer deadline={item.deadline} variant="compact" lang={lang} />
    ) : item.kind === 'upcoming' || item.kind === 'teaser' ? (
      <>
        {/* interaktivní EA upsell pill — shodný s kartou: samostatný cíl,
            klik vede na ceník (ne do řádku), silný hover; nápověda jako
            TOOLTIP pod pillem (nemění šířku pillu → nerozbíjí layout řádku) */}
        <span
          role="button"
          tabIndex={0}
          aria-label={`${d.catalog.dash.earlyBadge} — ${d.catalog.dash.earlyBadgeHint}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollToPricing(); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); scrollToPricing(); }
          }}
          className="group/ea relative inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/95 px-2.5 py-1 text-[11px] font-bold text-blue-700
                     transition-all duration-200 hover:scale-[1.05] hover:border-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-[0_6px_16px_-4px_rgba(37,99,235,0.5)]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <Lock className="h-3 w-3" />
          <span className="sm:hidden">{d.catalog.dash.earlyBadgeShort}</span>
          <span className="hidden sm:inline">{d.catalog.dash.earlyBadge}</span>
          <span className="pointer-events-none absolute left-0 top-full z-20 mt-1.5 whitespace-nowrap rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/ea:opacity-100 group-focus-visible/ea:opacity-100">
            {d.catalog.dash.earlyBadgeHint}
          </span>
        </span>
        {/* stavový chip = HLÍDAČ té dávky: zvoneček vlevo, klik zapne alert
            (na mobilu se chip vynechává, řádek je plný) */}
        <span
          role="button"
          tabIndex={0}
          aria-pressed={watching}
          aria-label={watching ? dash.watchingDeal : dash.watchDeal}
          title={watching ? dash.watchingDeal : dash.watchDeal}
          onClick={toggleWatch}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleWatch(e); }}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium transition-colors md:px-2.5 ${
            watching
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-zinc-900'
          }`}
        >
          {watching ? <BellRing className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
          <span className="hidden md:inline">{item.kind === 'upcoming' ? c.unlocksIn : c.upcoming}</span>
        </span>
      </>
    ) : (
      /* uzavřená dávka — zákazník musí mít možnost projevit zájem o repete */
      <span
        role="button"
        tabIndex={0}
        aria-pressed={watching}
        aria-label={watching ? dash.watchingDeal : dash.watchClosed}
        title={watching ? dash.watchingDeal : dash.watchClosed}
        onClick={toggleWatch}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleWatch(e); }}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
          watching
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-zinc-900'
        }`}
      >
        {watching ? <BellRing className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
        {c.closed}
      </span>
    );

  const inner = (
    <>
      {/* OZNAČENÍ DÁVKY — začátek KAŽDÉHO řádku (i na mobilu): značka
          GoBigDeal a pod ní číslo dávky lehkým fontem. Tohle je identifikátor,
          pod kterým dávka běží interně i vůči zákazníkovi (deals.deal_no).
          Teaser koncernu ještě evidovaná dávka není → nese jen značku, slot
          ale zůstává, aby titulky stály v jedné svislé lince. */}
      <span className="flex h-11 w-[66px] shrink-0 flex-col items-center justify-center leading-none sm:w-[96px]">
        {/* značka nese hlavní váhu — je to obrandování dávky, proto černá
            a výrazně větší než ostatní chrom řádku */}
        <GoBigDealLogo className="text-[11px] text-zinc-900 sm:text-[14px]" />
        {/* číslo je jen evidenční stopa: malé, černé, tenké. Teaser koncernu
            ještě přidělené číslo nemá → pomlčka, aby značka nestála osaměle */}
        <span
          className={`mt-1 font-sans text-[9px] font-light tracking-wide text-zinc-900 sm:text-[10px] ${
            item.dealNo ? '' : 'text-zinc-400'
          }`}
        >
          nr. {item.dealNo ?? '—'}
        </span>
      </span>

      <span className="min-w-0 flex-1">
        {item.supplier && (
          <span className="block truncate text-[10px] font-medium uppercase tracking-widest text-slate-400">
            {item.supplier}
          </span>
        )}
        {/* MOBIL: název se raději zalomí do dvou řádků, než aby se z něj po
            zvětšení značky stalo „Closeout …" — od sm zpět na jeden řádek */}
        <span className="mt-0.5 line-clamp-2 text-sm font-medium tracking-tight text-zinc-900 sm:line-clamp-none sm:block sm:truncate">
          {item.title}
        </span>
      </span>

      {/* LOGA ZNAČEK v dávce — v mezeře ZA textem (dle reference), zarovnaná
          doprava, takže končí těsně před stavovými pilulkami. Platí i pro
          připravované dávky, kde značky nese koncern. */}
      <span className="hidden shrink-0 items-center justify-end gap-3 sm:flex">
        {brandLogos.map((b, i) => (
          <BrandLogo
            key={b.name}
            name={b.name}
            domain={b.domain ?? ''}
            width={200}
            height={80}
            /* pevná výška → značky mají napříč řádky stejnou vizuální váhu;
               od třetí se logo objeví až od lg, aby se řádek neucpal */
            className={`h-4 w-auto max-w-[72px] object-contain [mix-blend-mode:multiply] ${
              i >= 2 ? 'hidden lg:block' : ''
            }`}
            fallbackClassName={`whitespace-nowrap text-[10px] font-bold leading-none text-zinc-900 ${
              i >= 2 ? 'hidden lg:block' : ''
            }`}
          />
        ))}
      </span>

      {/* MOBIL: jedna pozice, značky se v ní střídají (řada by se nevešla) */}
      {brandLogos.length > 0 && (
        <span className="flex w-[46px] shrink-0 items-center justify-end sm:hidden">
          <BrandLogo
            key={brandLogos[brandIdx % brandLogos.length].name}
            name={brandLogos[brandIdx % brandLogos.length].name}
            domain={brandLogos[brandIdx % brandLogos.length].domain ?? ''}
            width={200}
            height={80}
            className="h-4 w-auto max-w-full animate-in fade-in object-contain duration-500 [mix-blend-mode:multiply]"
            fallbackClassName="truncate text-[10px] font-bold leading-none text-zinc-900"
          />
        </span>
      )}

      {/* počty — jen desktop, na mobilu je řádek už tak plný */}
      {item.kind !== 'teaser' && (
        <span className="hidden shrink-0 items-center gap-3 font-mono text-[11px] text-slate-500 md:flex">
          {item.models > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-slate-400" /> {countLabel(lang, item.models, 'models')}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-slate-400" /> {countLabel(lang, item.brands.length, 'brands')}
          </span>
        </span>
      )}

      {item.maxDiscount > 0 && (
        <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 font-mono text-[11px] font-bold text-red-600 ring-1 ring-red-100">
          −{item.maxDiscount} %
        </span>
      )}
      <span className="flex shrink-0 items-center gap-1.5">{status}</span>
      <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-zinc-900 sm:block" />
    </>
  );

  /* Stejná logika jako u dlaždice: na černé ploše dělá hloubku bílé halo
     při hoveru, ne slate stín (ten by nebyl vidět). */
  const shell =
    'group flex w-full items-center gap-3 rounded-[1.25rem] bg-white px-3.5 py-3 text-left ' +
    'shadow-[0_10px_28px_-10px_rgba(0,0,0,0.75)] ' +
    'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-16px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.14),0_0_36px_-12px_rgba(255,255,255,0.22)] sm:gap-4 sm:px-4 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1215]';

  if (item.kind === 'teaser' || !item.slug) {
    return (
      <button type="button" onClick={onTeaserClick} className={shell}>
        {inner}
      </button>
    );
  }
  return (
    <Link
      to={`/deals/${item.slug}`}
      className={`${shell} ${item.kind === 'closed' ? 'opacity-75 hover:opacity-100' : ''}`}
    >
      {inner}
    </Link>
  );
}
