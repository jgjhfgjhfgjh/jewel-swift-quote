import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Check, Layers, Lock } from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';
import { dealIsLive, type Deal } from '@/lib/deals';
import { CONCERNS, getConcernForDeal } from '@/data/concerns';
import { buildCatalog } from '@/lib/dealCatalog';
import { BrandLogo } from '@/components/BrandLogo';
import { getBrandByName } from '@/data/brands';
import { CountdownTimer } from './CountdownTimer';

/** Bílá silueta loga — uvnitř tmavých karet (spotlight). */
const SILHOUETTE = '[filter:brightness(0)_invert(1)]';

/* Panel je bílý, ale OBĚ karty zůstávají tmavé se stejným vzhledem jako
   dřív: barvy jsou napevno spočítané z původní skleněné vrstvy nad
   obsidianem (#0B1215 + bílá 4 % = #151B1E, ring bílá 10 % = #2C3235,
   hover 7 % = #1C2325 / ring 20 % = #494F51). Bílá záře na hover by na
   bílém panelu zmizela → tmavý stín. */
const CARD = 'rounded-2xl bg-[#151B1E] ring-1 ring-[#2C3235]';
const CARD_HOVER =
  'hover:bg-[#1C2325] hover:ring-[#494F51] hover:shadow-[0_16px_36px_-14px_rgba(0,0,0,0.35)]';

interface ConcernRow {
  slug: string;
  name: string;
  domain?: string;
  live: number;
  upcoming: number;
}

/**
 * GoBigDeal mega menu — obsidianová předsíň /deals, řazená podle konverzní
 * hodnoty (výstup workflow auditu: funnel / scent / revenue syntéza):
 *
 *   headline strip se živými čísly (co to je + důkaz)
 *   ┌ spotlight končícího dealu (GMV; jediný pohyb = odpočet)
 *   ├ Live by concern (orientace; poctivé počty JEN živých dávek)
 *   └ Early Access karta (jediná monetizace světa → /#gbd-pricing)
 *   patička: free drop alert (/alerts, nejnižší schod) + Browse all deals
 *
 * Žádná auto-rotace, žádné falešné odpočty, červená = monopol deadline.
 */
export function NavGoBigDealPanel({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { deals, productCounts } = useDeals();

  const go = (path: string) => {
    onNavigate?.();
    navigate(path);
  };

  // Stejná data jako /deals — sliby v panelu sedí na výsledek prokliku.
  const catalog = useMemo(() => buildCatalog(deals, productCounts, () => ''), [deals, productCounts]);
  const liveTiles = useMemo(() => catalog.filter((t) => t.kind === 'live'), [catalog]);
  const upcomingTiles = useMemo(() => catalog.filter((t) => t.kind === 'upcoming'), [catalog]);
  const maxDiscount = liveTiles.reduce((m, t) => Math.max(m, t.maxDiscount), 0);

  // Spotlight = živý deal, který končí nejdřív.
  const spotlight = useMemo(
    () =>
      deals
        .filter(dealIsLive)
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0] ?? null,
    [deals],
  );

  // Koncerny řazené podle živých dávek; uzavřené dealy se NIKDY nepočítají.
  const concernRows = useMemo<ConcernRow[]>(() => {
    const live = new Map<string, number>();
    const upcoming = new Map<string, number>();
    liveTiles.forEach((t) => t.concernSlug && live.set(t.concernSlug, (live.get(t.concernSlug) ?? 0) + 1));
    upcomingTiles.forEach((t) => t.concernSlug && upcoming.set(t.concernSlug, (upcoming.get(t.concernSlug) ?? 0) + 1));
    return CONCERNS
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        domain: c.domain,
        live: live.get(c.slug) ?? 0,
        upcoming: upcoming.get(c.slug) ?? 0,
      }))
      .sort((a, b) => b.live - a.live || b.upcoming - a.upcoming)
      // 4 koncerny + pátý řádek „Browse all deals" = stále 5 řádků ve sloupci
      .slice(0, 4);
  }, [liveTiles, upcomingTiles]);

  return (
    <div className="flex flex-col text-zinc-900">
      {/* ── Headline strip: co GoBigDeal je + živá čísla jako důkaz ── */}
      <div className="flex items-center justify-between gap-6">
        <p className="font-sans font-extralight tracking-tight leading-snug text-[19px]">
          <span className="text-zinc-900">Closeout deals, bigger wholesale discounts. </span>
          <span className="text-zinc-500">One order, one invoice — from concerns you already sell.</span>
        </p>
        {liveTiles.length > 0 ? (
          <span className="shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
            {liveTiles.length} live now{maxDiscount > 0 ? ` · up to −${maxDiscount} %` : ''}
          </span>
        ) : upcomingTiles.length > 0 ? (
          <span className="shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
            {upcomingTiles.length} {upcomingTiles.length === 1 ? 'deal' : 'deals'} in the works
          </span>
        ) : null}
      </div>

      {/* ── Grid: spotlight (GMV) · Early Access (revenue, střed panelu) ·
             koncerny (orientace, vpravo) ── */}
      <div className="mt-3 grid grid-cols-[minmax(360px,1.05fr)_minmax(0,1fr)_minmax(0,0.9fr)] gap-x-8">
        {spotlight ? <SpotlightCard deal={spotlight} onOpen={() => go(`/deals/${spotlight.slug}`)} /> : <SpotlightEmpty onAlerts={() => go('/alerts')} />}

        {/* Early Access — jediná monetizace světa; jediné plné bílé CTA panelu */}
        <div className={`flex min-w-0 flex-col p-5 ${CARD}`}>
          <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-[10px] font-bold uppercase tracking-widest text-transparent">
            Early Access
          </span>
          <p className="mt-2 font-sans font-extralight tracking-tight leading-snug text-[17px]">
            <span className="text-white">Everyone gets the alert. </span>
            <span className="text-zinc-400">You get it 48 hours early.</span>
          </p>
          <ul className="mt-3 space-y-1.5">
            {[
              'Every deal opens for you 48 hours early',
              'First pick before top references sell out',
              'Alerts for the concerns and brands you sell',
            ].map((b) => (
              <li key={b} className="flex items-start gap-2 text-[13px] leading-snug text-zinc-300">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={2.5} />
                {b}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => go('/#gbd-pricing')}
            className="mt-auto inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-full bg-white px-5 text-[13px] font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            See Early Access <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {/* Live by concern — řádky v jazyce seznamu dealů na /deals:
            bílá karta se silným vrstveným stínem, logo volně v řádku (bez
            tónovaného čtverce), hover nadzvedne. Sloupec drží výšku karet. */}
        <div className="flex h-[256px] min-w-0 flex-col">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Live by concern</h3>
          <div className="mt-2 flex flex-col gap-1.5">
            {concernRows.map((c) => {
              const dim = c.live === 0 && c.upcoming === 0;
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => go(`/deals?concern=${encodeURIComponent(c.slug)}`)}
                  className="group/row flex h-10 w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 text-left
                             shadow-[0_8px_24px_-6px_rgba(15,23,42,0.10),0_2px_6px_rgba(15,23,42,0.05)]
                             transition-all duration-200 hover:-translate-y-0.5
                             hover:shadow-[0_20px_44px_-12px_rgba(15,23,42,0.18),0_4px_10px_rgba(15,23,42,0.07)]"
                >
                  {/* logo volně na bílé, plná barva, bez rámečku (jako DealListRow) */}
                  <span className="flex h-6 w-11 shrink-0 items-center justify-center">
                    <BrandLogo
                      name={c.name}
                      domain={c.domain ?? ''}
                      width={200}
                      height={80}
                      className={`max-h-5 max-w-full object-contain [mix-blend-mode:multiply] ${dim ? 'opacity-50' : 'opacity-90'}`}
                      fallbackClassName="truncate text-[9px] font-bold leading-none text-zinc-900"
                    />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium tracking-tight text-zinc-900">{c.name}</span>
                  {c.live > 0 ? (
                    <span className="shrink-0 font-mono text-[11px] font-bold text-emerald-600">{c.live} live</span>
                  ) : c.upcoming > 0 ? (
                    <span className="shrink-0 font-mono text-[11px] text-slate-500">opens soon</span>
                  ) : (
                    <span className="shrink-0 font-mono text-[11px] text-slate-400">coming soon</span>
                  )}
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-all duration-200 group-hover/row:translate-x-0.5 group-hover/row:text-zinc-900" />
                </button>
              );
            })}

            {/* Poslední řádek — vstup do celého katalogu. Tmavý jako obě
                velké karty vedle (stejné napevno spočítané barvy). */}
            <button
              type="button"
              onClick={() => go('/deals')}
              className="group/row flex h-10 w-full items-center gap-3 rounded-2xl border border-[#2C3235] bg-[#151B1E] px-3 text-left
                         shadow-[0_8px_24px_-6px_rgba(15,23,42,0.18),0_2px_6px_rgba(15,23,42,0.08)]
                         transition-all duration-200 hover:-translate-y-0.5 hover:border-[#494F51] hover:bg-[#1C2325]
                         hover:shadow-[0_20px_44px_-12px_rgba(15,23,42,0.35),0_4px_10px_rgba(15,23,42,0.12)]"
            >
              <span className="flex h-6 w-11 shrink-0 items-center justify-center">
                <Layers className="h-4 w-4 text-zinc-300 transition-colors group-hover/row:text-white" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-tight text-white">
                Browse all deals
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-500 transition-all duration-200 group-hover/row:translate-x-0.5 group-hover/row:text-white" />
            </button>
          </div>
        </div>

      </div>

      {/* ── Patička: free drop alert = nejnižší schod konverze. Vstup do
             katalogu se přesunul do sloupce jako poslední řádek, aby v
             panelu nebyl dvakrát. ── */}
      <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-200 pt-2.5">
        <button
          type="button"
          onClick={() => go('/alerts')}
          className="group inline-flex items-center gap-1.5 text-[13px] transition-colors"
        >
          <Bell className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-zinc-900" />
          <span className="font-medium text-zinc-700 transition-colors group-hover:text-zinc-900">
            Deal drop alerts — free forever.
          </span>
          <span className="hidden font-normal text-zinc-500 xl:inline">One email when a deal goes live.</span>
        </button>
      </div>
    </div>
  );
}

/* ── Spotlight ──────────────────────────────────────────────────────────── */

/** Živý deal končící nejdřív — jediný pohyb panelu je jeho odpočet. */
function SpotlightCard({ deal, onOpen }: { deal: Deal; onOpen: () => void }) {
  const concern = getConcernForDeal(deal);
  const brands = (deal.brands ?? []).slice(0, 3);
  const photo = deal.hero_image_url;
  const discount = (deal.tiers ?? []).reduce((m, t) => Math.max(m, t.discount_percent), 0);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative flex h-[256px] flex-col overflow-hidden text-left transition-all ${CARD} ${CARD_HOVER}`}
    >
      {photo && (
        <>
          <img src={photo} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1215]/95 via-[#0B1215]/40 to-[#0B1215]/10" />
        </>
      )}

      {/* horní řádek: koncern + odpočet (jediná červená v panelu) */}
      <div className="relative flex items-start justify-between gap-3 p-4 pb-0">
        {concern ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 backdrop-blur">
            <BrandLogo
              name={concern.name}
              domain={concern.domain}
              width={120}
              height={48}
              className={`max-h-3.5 max-w-[70px] object-contain ${SILHOUETTE} opacity-90`}
              fallbackClassName="text-[10px] font-bold text-zinc-200"
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-300">Concern</span>
          </span>
        ) : <span />}
        <CountdownTimer deadline={deal.deadline} variant="compact" lang="en" />
      </div>

      {/* střed: bez fotky max 3 bílé siluety značek (stopa > výčet) */}
      {!photo && (
        <div className="relative flex min-h-0 flex-1 items-center justify-center gap-6 px-6">
          {brands.map((b) => {
            const meta = getBrandByName(b);
            return meta ? (
              <BrandLogo
                key={b}
                name={meta.name}
                domain={meta.domain}
                width={240}
                height={100}
                className={`max-h-9 max-w-[120px] object-contain ${SILHOUETTE} opacity-80`}
                fallbackClassName="font-display text-lg font-black tracking-tight text-white"
              />
            ) : (
              <span key={b} className="font-display text-lg font-black tracking-tight text-white">{b}</span>
            );
          })}
        </div>
      )}
      {photo && <div className="min-h-0 flex-1" />}

      {/* patka: sleva + název + CTA */}
      <div className="relative p-4 pt-0">
        <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-white">{deal.title}</p>
        <div className="mt-2 flex items-center gap-2">
          {discount > 0 && (
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-zinc-900">
              −{discount} % on the whole order
            </span>
          )}
          <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-zinc-300 transition-colors group-hover:text-white">
            View the deal <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </button>
  );
}

/** Bez živého dealu — poctivá karta bez odpočtu, CTA na free alert. */
function SpotlightEmpty({ onAlerts }: { onAlerts: () => void }) {
  return (
    <div className={`flex h-[256px] flex-col p-5 ${CARD}`}>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-200">
        <Lock className="h-3 w-3" /> Coming soon
      </span>
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <p className="font-sans text-xl font-extralight tracking-tight text-white">
          The next deal is being negotiated.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Early Access members see every deal 48 hours before public open.
        </p>
      </div>
      <button
        type="button"
        onClick={onAlerts}
        className="group inline-flex items-center gap-1.5 self-start text-[13px] font-semibold text-white"
      >
        Get the free drop alert
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
