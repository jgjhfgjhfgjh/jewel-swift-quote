import { Fragment, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, ChevronDown, ChevronLeft, ChevronRight, Lock, Zap } from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';
import { dealIsLive, type Deal } from '@/lib/deals';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel';
import { CountdownTimer } from './CountdownTimer';
import { BrandLogo } from '@/components/BrandLogo';
import { getConcernForDeal } from '@/data/concerns';
import { openEarlyAccessUpsell } from './EarlyAccessUpsell';

/**
 * Swipovatelný nekonečný pás GoBigDeal — gateway karta (copy, později video)
 * jede v pásu jako první prvek, za ní sloupce po dvou kartách: nejdřív
 * nejnovější dealy (locked pro ne-odběratele, odemčené s EARLY ACCESS
 * odlišením pro odběratele early accessu), pak dropnuté od nejnovějšího
 * (NEW badge na prvním) a „coming soon" placeholdery do 12 karet.
 *
 * Samostatná komponenta: žije v sekci GoBigDeal na homepage i v mega menu
 * navbaru. Vše anglicky (čte napřímo dealsI18n.en, countdowny lang="en").
 */
const t = dealsI18n.en;

/** Karta ve swipovatelném pásu (sloupce po dvou). */
type StripCard =
  | { kind: 'locked'; deal: Deal }
  | { kind: 'locked-placeholder' }
  | { kind: 'live'; deal: Deal; isNew: boolean }
  | { kind: 'filler' };

/** Celková délka pásu — reálné dealy doplní placeholdery, ať má swipe smysl. */
const STRIP_TOTAL_CARDS = 12;

export function GoBigDealStrip({
  fadeFrom = 'from-zinc-50',
}: {
  /** Tailwind from-* třída okrajových fade přechodů — musí sedět na pozadí
   *  rodiče (sekce zinc-50, mega menu bílá). */
  fadeFrom?: string;
}) {
  const openAuthModal = useStore((s) => s.openAuthModal);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { deals, productCounts, loading } = useDeals();
  const { hasEarlyAccess } = useEarlyAccess();

  // Běžící dealy (odstartované, před uzávěrkou).
  const liveDeals = useMemo(() => {
    const now = Date.now();
    return deals.filter((d) => dealIsLive(d) && new Date(d.starts_at).getTime() <= now);
  }, [deals]);

  // Hero = běžící deal s nejbližší uzávěrkou (největší tlak na rozhodnutí).
  const hero = useMemo(
    () =>
      [...liveDeals].sort(
        (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      )[0] ?? null,
    [liveDeals],
  );

  // Nadcházející dealy (aktivní, ještě neodstartované) → locked karty (2 sloty).
  const upcoming = useMemo(() => {
    const now = Date.now();
    return deals
      .filter((d) => d.status === 'active' && new Date(d.starts_at).getTime() > now)
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .slice(0, 2);
  }, [deals]);

  const stripCards = useMemo<StripCard[]>(() => {
    const cards: StripCard[] = upcoming.map((d) => ({ kind: 'locked' as const, deal: d }));
    while (cards.length < 2) cards.push({ kind: 'locked-placeholder' });
    [...liveDeals]
      .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())
      .forEach((d, i) => cards.push({ kind: 'live', deal: d, isNew: i === 0 }));
    while (cards.length < STRIP_TOTAL_CARDS) cards.push({ kind: 'filler' });
    return cards;
  }, [upcoming, liveDeals]);
  const realDealCount = upcoming.length + liveDeals.length;

  // Klik na locked kartu = konverzní vstup: nepřihlášený → registrace,
  // bez early accessu → upsell, odběratel → deal (nebo /deals u placeholderu).
  const handleLockedClick = (deal?: Deal) => {
    if (!user) {
      openAuthModal('register');
      return;
    }
    if (!hasEarlyAccess) {
      openEarlyAccessUpsell();
      return;
    }
    navigate(deal ? `/deals/${deal.slug}` : '/deals');
  };

  const pairs: StripCard[][] = [];
  for (let i = 0; i < stripCards.length; i += 2) pairs.push(stripCards.slice(i, i + 2));

  // Nekonečný kolotoč: sada = gateway + sloupce, renderovaná 3× (viz
  // useInfiniteCarousel). Po posledních dvojicích se tak znovu vrací velká
  // karta. Scroll-snap tu není — pere se s okamžitými skoky wrapu.
  const itemCount = 1 + pairs.length;
  const { trackRef, go } = useInfiniteCarousel(itemCount);

  const gateway = loading ? (
    <div className="h-full min-h-[360px] animate-pulse rounded-2xl bg-slate-200" />
  ) : hero ? (
    <HeroDealCard deal={hero} count={productCounts[hero.id] ?? 0} />
  ) : (
    <EmptyHeroCard />
  );

  const renderSet = (copy: number) => (
    <Fragment key={copy}>
      {/* gateway karta jede v pásu — není ukotvená; dominantní šířka jako
          na referenčním layoutu (velká ~1,6× šířky sloupce dvojic) */}
      <div data-card className="flex w-[min(90vw,640px)] shrink-0 flex-col">
        {gateway}
      </div>
      {pairs.map((pair, i) => (
        <div key={`${copy}-${i}`} data-card className="flex w-[320px] shrink-0 flex-col gap-4 sm:w-[400px]">
          {pair.map((card, j) => {
            switch (card.kind) {
              case 'locked':
                return (
                  <StripLockedCard
                    key={`${copy}-${card.deal.id}-${j}`}
                    deal={card.deal}
                    unlocked={hasEarlyAccess}
                    onLockedClick={() => handleLockedClick(card.deal)}
                  />
                );
              case 'locked-placeholder':
                return <StripLockedPlaceholder key={`lp-${copy}-${i}-${j}`} onClick={() => handleLockedClick()} />;
              case 'live':
                return <StripLiveCard key={`${copy}-${card.deal.id}`} deal={card.deal} isNew={card.isNew} />;
              default:
                return <StripFillerCard key={`f-${copy}-${i}-${j}`} />;
            }
          })}
        </div>
      ))}
    </Fragment>
  );

  return (
    <div className="min-w-0">
      <div className="group relative">
        <div
          ref={trackRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]
                     [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {[0, 1, 2].map(renderSet)}
        </div>
        {/* fade na obou okrajích — kolotoč pokračuje oběma směry */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r ${fadeFrom} to-transparent`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l ${fadeFrom} to-transparent`}
        />
        {/* šipky (desktop, na hover) */}
        <button
          type="button"
          onClick={() => go(-1)}
          className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur border border-slate-200 text-zinc-700 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur border border-slate-200 text-zinc-700 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      {/* počítadlo — jen reálné dealy, ne placeholdery */}
      {realDealCount > 0 && (
        <p className="mt-3 text-xs font-semibold text-slate-500">
          {realDealCount} GoBigDeal{realDealCount === 1 ? '' : 's'} · swipe for more
        </p>
      )}
    </div>
  );
}

/** Tlačítko pro mega menu — rozbalí nabídku úrovní alertů (koncern / značka /
 *  model) a proklikne na příslušný blok sekce GoBigDeal (#gbd-alerts-*). */
export function GoBigDealAlertButton({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const goTo = (anchor: string) => {
    onNavigate?.();
    navigate(`/#${anchor}`);
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
      >
        <Bell className="h-4 w-4" /> Set a GoBigDeal alert
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open &&
        [
          { label: 'On concerns', anchor: 'gbd-alerts-concerns' },
          { label: 'On brands', anchor: 'gbd-alerts-brands' },
          { label: 'On models', anchor: 'gbd-alerts-models' },
        ].map((o) => (
          <button
            key={o.anchor}
            type="button"
            onClick={() => goTo(o.anchor)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            {o.label} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ))}
    </div>
  );
}

/** Velká bílá karta běžícího dealu — koncern, countdown, čísla, CTA. */
function HeroDealCard({ deal, count }: { deal: Deal; count: number }) {
  const concern = getConcernForDeal(deal);
  const maxDiscount = deal.tiers.reduce((m, x) => Math.max(m, x.discount_percent), 0);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-100">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          {t.home.liveLabel}
        </span>
        <CountdownTimer deadline={deal.deadline} variant="compact" lang="en" />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {concern && (
          <div className="mb-4 flex h-16 items-center">
            <BrandLogo
              name={concern.name}
              domain={concern.domain}
              width={360}
              height={140}
              className="max-h-12 max-w-[200px] object-contain [mix-blend-mode:multiply]"
              fallbackClassName="font-display text-xl font-black tracking-tight text-foreground"
            />
          </div>
        )}
        <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {deal.title}
        </h3>
        {deal.subtitle && (
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{deal.subtitle}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {count > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {count} {t.card.models}
            </span>
          )}
          {deal.brands.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {deal.brands.length} {t.card.brands}
            </span>
          )}
          {maxDiscount > 0 && (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 ring-1 ring-red-100">
              {t.card.discountUpTo} {maxDiscount}%
            </span>
          )}
        </div>
        {/* propojení na obsah o koncernu (data z concerns.ts) */}
        {concern && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <p className="text-xs leading-relaxed text-slate-500 line-clamp-3">
              {t.home.concernFallback}
            </p>
            <Link
              to={`/koncerny/${concern.slug}`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline"
            >
              {t.home.concernStoryCta}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
        <div className="mt-auto pt-5">
          <Link
            to={`/deals/${deal.slug}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:w-auto"
          >
            {t.home.heroCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Fallback gateway, když zrovna neběží žádný deal — pás žije dál. */
function EmptyHeroCard() {
  return (
    <div className="flex h-full min-h-[340px] flex-col justify-center rounded-2xl border border-slate-200 bg-white p-8">
      <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
        {t.home.emptyHeroTitle}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">{t.home.emptyHeroSub}</p>
      <Link
        to="/deals"
        className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-600"
      >
        {t.home.browseCta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/** Malá karta dropnutého (živého) dealu — logo, název, countdown, sleva. */
function StripLiveCard({ deal, isNew }: { deal: Deal; isNew: boolean }) {
  const concern = getConcernForDeal(deal);
  const maxDiscount = deal.tiers.reduce((m, x) => Math.max(m, x.discount_percent), 0);
  return (
    <Link
      to={`/deals/${deal.slug}`}
      className="relative flex min-h-[150px] flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      {isNew && (
        <span className="absolute -top-2.5 left-4 animate-pulse rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          New
        </span>
      )}
      <div className="flex items-center justify-between gap-2">
        {concern ? (
          <BrandLogo
            name={concern.name}
            domain={concern.domain}
            width={200}
            height={80}
            className="max-h-6 max-w-[110px] object-contain [mix-blend-mode:multiply]"
            fallbackClassName="truncate text-xs font-bold text-slate-700"
          />
        ) : (
          <span className="truncate text-xs font-bold text-slate-700">
            {deal.supplier || deal.title}
          </span>
        )}
        <CountdownTimer deadline={deal.deadline} variant="compact" lang="en" />
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
        {deal.title}
      </p>
      <div className="mt-auto flex items-center justify-between gap-2">
        {maxDiscount > 0 ? (
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 ring-1 ring-red-100">
            {t.card.discountUpTo} {maxDiscount}%
          </span>
        ) : (
          <span />
        )}
        <ArrowRight className="h-4 w-4 text-slate-400" />
      </div>
    </Link>
  );
}

/** Nejnovější (ještě neodstartovaný) deal: pro ne-odběratele zamčená karta
 *  s rozmazaným obsahem (klik = upsell), pro odběratele odemčená s výrazným
 *  EARLY ACCESS odlišením (modrý rámeček + badge) — „vidíš něco navíc". */
function StripLockedCard({
  deal,
  unlocked,
  onLockedClick,
}: {
  deal: Deal;
  unlocked: boolean;
  onLockedClick: () => void;
}) {
  const concern = getConcernForDeal(deal);

  if (unlocked) {
    return (
      <Link
        to={`/deals/${deal.slug}`}
        className="relative flex min-h-[150px] flex-1 flex-col rounded-2xl border border-blue-600 bg-white p-4 shadow-sm ring-1 ring-blue-600 transition-shadow hover:shadow-md"
      >
        <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          <Zap className="h-3 w-3" /> Early access
        </span>
        <div className="flex items-center justify-between gap-2">
          {concern ? (
            <BrandLogo
              name={concern.name}
              domain={concern.domain}
              width={200}
              height={80}
              className="max-h-6 max-w-[110px] object-contain [mix-blend-mode:multiply]"
              fallbackClassName="truncate text-xs font-bold text-slate-700"
            />
          ) : (
            <span className="truncate text-xs font-bold text-slate-700">
              {deal.supplier || deal.title}
            </span>
          )}
          <CountdownTimer deadline={deal.starts_at} variant="compact" lang="en" />
        </div>
        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
          {deal.title}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-blue-700">
            Only Insiders see this now
          </span>
          <ArrowRight className="h-4 w-4 text-blue-600" />
        </div>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onLockedClick}
      className="flex min-h-[150px] flex-1 w-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <Lock className="h-3 w-3" />
          {t.home.unlocksIn}
        </span>
        <CountdownTimer deadline={deal.starts_at} variant="compact" lang="en" />
      </div>
      {/* rozmazaný teaser — koncern i název zůstávají skryté do odemčení */}
      <div className="pointer-events-none select-none blur-[7px]" aria-hidden>
        {concern ? (
          <div className="flex h-10 w-fit items-center rounded-lg border border-slate-200 bg-white px-3">
            <BrandLogo
              name={concern.name}
              domain={concern.domain}
              width={200}
              height={80}
              className="max-h-5 max-w-[100px] object-contain"
              fallbackClassName="text-sm font-bold text-slate-800"
            />
          </div>
        ) : (
          <p className="text-sm font-semibold text-slate-900">{deal.title}</p>
        )}
        <div className="mt-2 h-2.5 w-3/4 rounded-full bg-slate-300" />
      </div>
      <p className="text-xs text-slate-500">{t.home.lockedNote}</p>
    </button>
  );
}

/** Zamčený slot bez naplánovaného dropu — FOMO zůstává, klik = upsell. */
function StripLockedPlaceholder({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[150px] flex-1 w-full flex-col justify-between rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-left transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <Lock className="h-3 w-3" />
          {t.home.lockedTitle}
        </span>
        <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-[11px] font-bold text-slate-500">
          {t.home.comingSoon}
        </span>
      </div>
      <div aria-hidden>
        <div className="h-2.5 w-4/5 rounded-full bg-slate-200" />
        <div className="mt-2 h-2.5 w-3/5 rounded-full bg-slate-200" />
      </div>
      <p className="text-xs text-slate-500">{t.home.lockedNote}</p>
    </button>
  );
}

/** Výplňový placeholder na konci pásu — další GoBigDeals na cestě. */
function StripFillerCard() {
  return (
    <div className="flex min-h-[150px] flex-1 flex-col justify-between rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4">
      <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
        {t.home.comingSoon}
      </span>
      <div aria-hidden>
        <div className="h-2.5 w-4/5 rounded-full bg-slate-100" />
        <div className="mt-2 h-2.5 w-3/5 rounded-full bg-slate-100" />
      </div>
      <p className="text-xs text-slate-400">More GoBigDeals on the way.</p>
    </div>
  );
}
