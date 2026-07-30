import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';
import { dealIsLive, type Deal } from '@/lib/deals';
import { dealsI18n } from '@/lib/i18n-deals';
import { CONCERNS, getConcernForDeal } from '@/data/concerns';
import { buildCatalog } from '@/lib/dealCatalog';
import { toDisplayName } from '@/lib/brandNormalize';
import { BrandLogo } from '@/components/BrandLogo';
import { getBrandByName } from '@/data/brands';
import { tintForKey } from './catalog/tints';
import { CountdownTimer } from './CountdownTimer';

const t = dealsI18n.en;

/** Max. počet slidů — reálné dealy (končící nejdřív) doplní placeholdery. */
const MAX_SLIDES = 3;
/** Interval automatického posunu na další deal. */
const SLIDE_MS = 3000;

type Slide = { kind: 'deal'; deal: Deal } | { kind: 'placeholder' };

interface Tile {
  key: string;
  name: string;
  domain?: string;
}

/**
 * Obsah GoBigDeal mega menu: full-width spotlight dealu, který končí nejdřív
 * (loga značek dealu, koncern v rohu, odpočet; auto-slide po 3 s, bez dealů
 * placeholdery), pod ním karusely koncernů a značek z landing dealů —
 * zmenšené dlaždice FilterTiles, proklik otevře /deals s filtrem. Vše sdílí
 * jedno načtení dealů, aby se menu nedotazovalo třikrát.
 */
export function NavGoBigDealPanel({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { deals, productCounts } = useDeals();

  const go = (path: string) => {
    onNavigate?.();
    navigate(path);
  };

  // Stejná stavba dlaždic jako na /deals — koncerny v pořadí rejstříku,
  // značky z katalogu (dealy + teasery) řazené podle počtu dávek.
  const catalog = useMemo(() => buildCatalog(deals, productCounts, () => ''), [deals, productCounts]);
  const concernTiles = useMemo<Tile[]>(
    () => CONCERNS.map((c) => ({ key: c.slug, name: c.name, domain: c.domain })),
    [],
  );
  const brandTiles = useMemo<Tile[]>(() => {
    const acc = new Map<string, number>();
    catalog.forEach((tile) => tile.brandKeys.forEach((k) => acc.set(k, (acc.get(k) ?? 0) + 1)));
    return Array.from(acc.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([key]) => {
        const name = toDisplayName(key);
        // Šperkové linky („Fossil Jewelry") mají logo mateřské značky.
        const domain = (getBrandByName(name) ?? getBrandByName(name.replace(/\s+Jewelry$/i, '')))?.domain;
        return { key, name, domain };
      });
  }, [catalog]);

  return (
    <div className="flex flex-col">
      <NavDealSpotlight deals={deals} onOpen={(deal) => go(`/deals/${deal.slug}`)} />
      <TileRow
        className="mt-3"
        label={t.catalog.concernsLabel}
        items={concernTiles}
        onPick={(tile) => go(`/deals?concern=${encodeURIComponent(tile.key)}`)}
      />
      <TileRow
        className="mt-2"
        label={t.catalog.brandsLabel}
        items={brandTiles}
        onPick={(tile) => go(`/deals?brand=${encodeURIComponent(tile.key)}`)}
      />

      {/* Patička: alerty (retenční smyčka) + úniková cesta „všechny dealy" */}
      <div className="mt-1.5 flex items-center justify-between gap-4 border-t border-slate-100 pt-1.5">
        <button
          type="button"
          onClick={() => go('/#gbd-alerts-concerns')}
          className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-900 transition-colors hover:text-zinc-600"
        >
          <Bell className="h-3.5 w-3.5" />
          Set deal alerts
          <span className="hidden font-normal text-zinc-400 xl:inline">· know the moment a deal drops</span>
        </button>
        <button
          type="button"
          onClick={() => go('/deals')}
          className="group inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-zinc-900 transition-colors hover:text-zinc-600"
        >
          Browse all deals
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

/** Auto-slide respektuje systémovou redukci pohybu. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/* ── Spotlight ──────────────────────────────────────────────────────────── */

function NavDealSpotlight({ deals, onOpen }: { deals: Deal[]; onOpen: (deal: Deal) => void }) {
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
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (paused || reducedMotion || slides.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [paused, reducedMotion, slides.length]);

  return (
    <div
      className="relative h-[104px] overflow-hidden rounded-2xl border border-slate-200 bg-white"
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
          {s.kind === 'deal' ? <DealSlide deal={s.deal} onOpen={() => onOpen(s.deal)} /> : <PlaceholderSlide />}
        </div>
      ))}

      {/* tečky — pozice slidu, klikací (jediné ovládání při reduced motion) */}
      <div className="absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            aria-current={i === idx}
            onClick={() => setIdx(i)}
            className="group/dot p-1.5"
          >
            <span
              className={`block h-1.5 w-1.5 rounded-full transition-colors ${
                i === idx ? 'bg-zinc-900' : 'bg-slate-300 group-hover/dot:bg-slate-400'
              }`}
            />
          </button>
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
    <button type="button" onClick={onOpen} className="flex h-full w-full flex-col px-4 py-2.5 text-left">
      {/* horní řádek: koncern v rohu + odpočet do konce dealu */}
      <div className="flex items-start justify-between gap-3">
        {concern ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5">
            <BrandLogo
              name={concern.name}
              domain={concern.domain}
              width={120}
              height={48}
              className="max-h-3.5 max-w-[70px] object-contain [mix-blend-mode:multiply]"
              fallbackClassName="text-[10px] font-bold text-slate-700"
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Concern</span>
          </span>
        ) : <span />}
        <CountdownTimer deadline={deal.deadline} variant="compact" lang="en" />
      </div>

      {/* loga značek dealu — jedno nebo všechna (Fossil Group jich má víc) */}
      <div className="flex min-h-0 flex-1 items-center justify-center gap-6 px-4">
        {brands.map((b) => {
          const meta = getBrandByName(b);
          return meta ? (
            <BrandLogo
              key={b}
              name={meta.name}
              domain={meta.domain}
              width={240}
              height={100}
              className="max-h-8 max-w-[110px] object-contain [mix-blend-mode:multiply]"
              fallbackClassName="font-display text-base font-black tracking-tight text-zinc-900"
            />
          ) : (
            <span key={b} className="font-display text-base font-black tracking-tight text-zinc-900">{b}</span>
          );
        })}
      </div>

      {/* patka: název + CTA (tečky jsou centrované, truncate jim uhne) */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <p className="truncate text-[13px] font-semibold text-zinc-900">{deal.title}</p>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-zinc-900">
          Explore deal <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

/** Placeholder — další deal se chystá (stejný slovník jako pás na homepage). */
function PlaceholderSlide() {
  return (
    <div className="flex h-full w-full flex-col px-4 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <Lock className="h-3 w-3" /> Next deal in the works
        </span>
        <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
          {t.home.comingSoon}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5">
        <div aria-hidden className="h-2.5 w-2/5 rounded-full bg-slate-100" />
        <p className="text-[11px] text-slate-500">{t.home.lockedNote}</p>
      </div>
    </div>
  );
}

/* ── Karusely dlaždic (zmenšené FilterTiles z /deals) ───────────────────── */

function TileRow({
  label, items, onPick, className = '',
}: {
  label: string;
  items: Tile[];
  onPick: (tile: Tile) => void;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * Math.max(280, track.current.clientWidth * 0.8), behavior: 'smooth' });

  if (items.length === 0) return null;

  return (
    <div className={`min-w-0 ${className}`}>
      <div className="mb-1 flex items-center justify-between gap-4">
        <h3 className="text-xs font-semibold tracking-tight text-zinc-900">{label}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Předchozí"
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Další"
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div
        ref={track}
        className="flex snap-x gap-2.5 overflow-x-auto pb-0.5
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onPick(item)}
            className="group flex w-16 shrink-0 snap-start flex-col items-center gap-1 focus:outline-none"
          >
            <span
              className="flex aspect-square w-full items-center justify-center rounded-2xl p-2.5
                         transition-all duration-200 group-hover:-translate-y-0.5
                         group-hover:shadow-[0_8px_18px_-10px_rgba(0,0,0,0.35)]
                         group-focus-visible:ring-2 group-focus-visible:ring-zinc-900 group-focus-visible:ring-offset-2"
              style={{ backgroundColor: tintForKey(item.key) }}
            >
              {item.domain ? (
                <BrandLogo
                  name={item.name}
                  domain={item.domain}
                  width={280}
                  height={120}
                  className="max-h-6 max-w-[85%] object-contain [mix-blend-mode:multiply] transition-transform duration-300 group-hover:scale-[1.06]"
                  fallbackClassName="line-clamp-2 text-center text-[9px] font-semibold leading-tight text-zinc-700"
                />
              ) : (
                <span className="line-clamp-2 text-center text-[9px] font-semibold leading-tight text-zinc-700">
                  {item.name}
                </span>
              )}
            </span>
            <span className="w-full truncate text-center text-[11px] font-medium leading-tight text-zinc-800">
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
