import { Link } from 'react-router-dom';
import { ArrowRight, Bell, BellRing, Layers, Lock, Tag } from 'lucide-react';
import { GoBigDealLogo } from '@/components/GoBigDealLogo';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
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

  /* Běžící dávka nese značku a číslo; ostatní stavy místo nich ukazují,
     v jakém stavu dávka je (viz slot na začátku řádku). */
  const isLive = item.kind === 'live';

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
          className="group/ea relative inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/15 px-2.5 py-1 text-[11px] font-bold text-blue-300
                     transition-all duration-200 hover:scale-[1.05] hover:border-blue-400 hover:bg-blue-500 hover:text-white hover:shadow-[0_6px_16px_-4px_rgba(37,99,235,0.55)]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1215]"
        >
          <Lock className="h-3 w-3" />
          <span className="sm:hidden">{d.catalog.dash.earlyBadgeShort}</span>
          <span className="hidden sm:inline">{d.catalog.dash.earlyBadge}</span>
          <span className="pointer-events-none absolute left-0 top-full z-20 mt-1.5 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-900 opacity-0 shadow-lg transition-opacity duration-200 group-hover/ea:opacity-100 group-focus-visible/ea:opacity-100">
            {d.catalog.dash.earlyBadgeHint}
          </span>
        </span>
        {/* HLÍDAČ dávky — zvoneček s popiskem „alert zdarma". Klik NIKAM
            nenaviguje: alert se uloží (hostovi do odložených, viz
            useDealAlerts) a řádek zůstane, kde byl. */}
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
              ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300'
              : 'border-white/15 bg-white/[0.06] text-zinc-400 hover:border-white/30 hover:text-white'
          }`}
        >
          {watching ? <BellRing className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
          <span className="hidden md:inline">{watching ? dash.alertOn : dash.alertFree}</span>
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
            ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300'
            : 'border-white/15 text-zinc-500 hover:border-white/30 hover:text-white'
        }`}
      >
        {watching ? <BellRing className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
        {/* stav („Uzavřeno") říká slot na začátku řádku, tady tedy stojí
            AKCE — stejný popisek jako u připravovaných dávek */}
        {watching ? dash.alertOn : dash.alertFree}
      </span>
    );

  const inner = (
    <>
      {/* OZNAČENÍ DÁVKY — začátek řádku: značka GoBigDeal a pod ní číslo dávky
          lehkým fontem. Tohle je identifikátor, pod kterým dávka běží interně
          i vůči zákazníkovi (deals.deal_no). Teaser koncernu ještě evidovaná
          dávka není → nese pomlčku, slot ale zůstává, aby titulky stály
          v jedné svislé lince.
          Na MOBILU se blok vynechává (pokyn) — řádek je tam plný a název dávky
          potřebuje šířku víc než evidenční značka. */}
      <span className="relative hidden h-11 w-[116px] shrink-0 flex-col items-center justify-center leading-none sm:flex">
        {isLive ? (
          <>
            {/* značka nese hlavní váhu — je to obrandování dávky, proto černá
                a výrazně větší než ostatní chrom řádku, pod ní evidenční
                číslo dávky malým tenkým písmem */}
            <GoBigDealLogo className="text-[14px] text-white" />
            <span className="mt-1 font-sans text-[10px] font-light tracking-wide text-zinc-400">
              nr. {item.dealNo ?? '—'}
            </span>
          </>
        ) : item.kind === 'closed' ? (
          /* UZAVŘENÁ dávka: stav prostým šedým textem — pozná se dřív,
             než ji člověk začne číst. Číslo pod ním zůstává, pokud je. */
          <>
            <span className="text-center text-[12px] font-bold leading-tight tracking-tight text-zinc-500">
              {c.closed}
            </span>
            {item.dealNo && (
              <span className="mt-1 font-sans text-[10px] font-light tracking-wide text-zinc-500">
                nr. {item.dealNo}
              </span>
            )}
          </>
        ) : (
          /* PŘIPRAVOVANÁ dávka: místo textu „In the works" značka s ČERVENÝM
             gradientovým indikátorem (pokyn) — tečka před wordmarkem nese
             stav, evidenční číslo zůstává pod ní. */
          <>
            <GoBigDealLogo className="text-[14px] text-white" markTone="red" />
            <span className="mt-1 font-sans text-[10px] font-light tracking-wide text-zinc-400">
              nr. {item.dealNo ?? '—'}
            </span>
          </>
        )}
      </span>

      <span className="min-w-0 flex-1">
        {item.supplier && (
          <span className="block truncate text-[10px] font-medium uppercase tracking-widest text-zinc-500">
            {item.supplier}
          </span>
        )}
        <span className="mt-0.5 block truncate text-sm font-medium tracking-tight text-white">
          {item.title}
        </span>
      </span>

      {/* Loga značek z řádku odešla (pokyn) — počet značek nese mono údaj
          níž, takže se informace neztratila. */}

      {/* MOBIL nemá loga značek vůbec (pokyn): střídačka log ukrajovala
          z názvu dávky tolik, že celý řádek byl nečitelný. Značky drží
          desktop, na mobilu zůstává název, sleva a stav. */}

      {/* počty — jen desktop, na mobilu je řádek už tak plný */}
      {item.kind !== 'teaser' && (
        <span className="hidden shrink-0 items-center gap-3 font-mono text-[11px] text-zinc-500 md:flex">
          {item.models > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-zinc-600" /> {countLabel(lang, item.models, 'models')}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-zinc-600" /> {countLabel(lang, item.brands.length, 'brands')}
          </span>
        </span>
      )}

      {item.maxDiscount > 0 && (
        <span className="shrink-0 rounded-full bg-red-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-red-400 ring-1 ring-red-500/25">
          −{item.maxDiscount} %
        </span>
      )}
      <span className="flex shrink-0 items-center gap-1.5">{status}</span>
      <ArrowRight className="hidden h-4 w-4 shrink-0 text-zinc-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white sm:block" />
    </>
  );

  /* Řádek je TMAVÝ (pokyn) — stejný materiál jako chrom stránky: vlasový
     bílý rámeček na 4% bílé ploše. Hloubku nedělá stín (na obsidiánu není
     vidět), ale zesvětlení rámečku a plochy při hoveru. */
  const shell =
    'group flex w-full items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-3.5 py-3 text-left ' +
    'transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.07] sm:gap-4 sm:px-4 ' +
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
