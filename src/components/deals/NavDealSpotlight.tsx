import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';
import { dealIsLive, type Deal } from '@/lib/deals';
import { dealsI18n } from '@/lib/i18n-deals';
import { getConcernForDeal } from '@/data/concerns';
import { BrandLogo } from '@/components/BrandLogo';
import { getBrandByName } from '@/data/brands';
import { CountdownTimer } from './CountdownTimer';

const t = dealsI18n.en;

/** Max. počet slidů — reálné dealy (končící nejdřív) doplní placeholdery. */
const MAX_SLIDES = 3;
/** Interval automatického posunu na další deal. */
const SLIDE_MS = 3000;

type Slide = { kind: 'deal'; deal: Deal } | { kind: 'placeholder' };

/**
 * Full-width spotlight v GoBigDeal mega menu: karta dealu, který končí
 * nejdřív — loga všech značek v dealu (např. Fossil Group jich má víc),
 * koncern v rohu a odpočet do konce. Každé 3 s přejede na další deal
 * (pauza na hover); bez reálných dealů jedou placeholdery.
 */
export function NavDealSpotlight({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { deals } = useDeals();

  const slides = useMemo<Slide[]>(() => {
    const live = deals
      .filter(dealIsLive)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, MAX_SLIDES)
      .map((deal): Slide => ({ kind: 'deal', deal }));
    while (live.length < MAX_SLIDES) live.push({ kind: 'placeholder' });
    return live;
  }, [deals]);

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const open = (deal: Deal) => {
    onNavigate?.();
    navigate(`/deals/${deal.slug}`);
  };

  return (
    <div
      className="relative h-[224px] overflow-hidden rounded-2xl border border-slate-200 bg-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          aria-hidden={i !== idx}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === idx ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          {s.kind === 'deal' ? <DealSlide deal={s.deal} onOpen={() => open(s.deal)} /> : <PlaceholderSlide />}
        </div>
      ))}

      {/* tečky — pozice slidu */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${i === idx ? 'bg-zinc-900' : 'bg-slate-300'}`}
          />
        ))}
      </div>
    </div>
  );
}

/** Slide reálného dealu — koncern v rohu, odpočet, loga značek dealu, CTA. */
function DealSlide({ deal, onOpen }: { deal: Deal; onOpen: () => void }) {
  const concern = getConcernForDeal(deal);
  const brands = (deal.brands ?? []).slice(0, 6);

  return (
    <button type="button" onClick={onOpen} className="flex h-full w-full flex-col px-6 py-4 text-left">
      {/* horní řádek: koncern v rohu + odpočet do konce dealu */}
      <div className="flex items-start justify-between gap-3">
        {concern ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
            <BrandLogo
              name={concern.name}
              domain={concern.domain}
              width={120}
              height={48}
              className="max-h-4 max-w-[80px] object-contain [mix-blend-mode:multiply]"
              fallbackClassName="text-[11px] font-bold text-slate-700"
            />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Concern</span>
          </span>
        ) : <span />}
        <CountdownTimer deadline={deal.deadline} variant="compact" lang="en" />
      </div>

      {/* loga značek dealu — jedno nebo všechna (Fossil Group jich má víc) */}
      <div className="flex flex-1 items-center justify-center gap-8 px-4">
        {brands.map((b) => {
          const meta = getBrandByName(b);
          return meta ? (
            <BrandLogo
              key={b}
              name={meta.name}
              domain={meta.domain}
              width={240}
              height={100}
              className="max-h-10 max-w-[130px] object-contain [mix-blend-mode:multiply]"
              fallbackClassName="font-display text-lg font-black tracking-tight text-zinc-900"
            />
          ) : (
            <span key={b} className="font-display text-lg font-black tracking-tight text-zinc-900">{b}</span>
          );
        })}
      </div>

      {/* patka: název + CTA */}
      <div className="flex items-center justify-between gap-3 pb-3">
        <p className="truncate text-sm font-semibold text-zinc-900">{deal.title}</p>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-zinc-900">
          Explore deal <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

/** Placeholder — další deal se chystá (stejný slovník jako pás na homepage). */
function PlaceholderSlide() {
  return (
    <div className="flex h-full w-full flex-col px-6 py-4">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <Lock className="h-3 w-3" /> Next deal in the works
        </span>
        <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-[11px] font-bold text-slate-500">
          {t.home.comingSoon}
        </span>
      </div>
      <div aria-hidden className="flex flex-1 flex-col items-center justify-center gap-2.5">
        <div className="h-3 w-2/5 rounded-full bg-slate-100" />
        <div className="h-3 w-1/4 rounded-full bg-slate-100" />
      </div>
      <p className="pb-3 text-center text-xs text-slate-500">{t.home.lockedNote}</p>
    </div>
  );
}
