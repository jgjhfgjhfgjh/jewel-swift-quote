import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Lock } from 'lucide-react';
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
/** Řádků v každém sloupci — víc by rozbilo výškový rozpočet panelu. */
const MAX_ROWS = 6;

type Slide = { kind: 'deal'; deal: Deal } | { kind: 'placeholder' };

interface ScanEntry {
  key: string;
  name: string;
  domain?: string;
  /** Počet reálných dealů v katalogu (živé + připravované + uzavřené). */
  count: number;
  /** Kolik z nich právě běží — živé řádky se řadí a zvýrazňují první. */
  liveCount: number;
}

/**
 * Obsah GoBigDeal mega menu, stavěný na skenování: vlevo vertikální spotlight
 * dealu, který končí nejdřív (koncern v rohu, odpočet, loga značek; auto-slide
 * po 3 s), vedle dva sloupce řádků Concerns a Brands — logo na tónovaném
 * čtverci, název a počet dealů („3 big deals", u běžícího červeně, bez dealů
 * „deal in the works"). Proklik řádku otevře /deals s filtrem. Jedno načtení
 * dealů pro celý panel.
 */
export function NavGoBigDealPanel({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { deals, productCounts } = useDeals();

  const go = (path: string) => {
    onNavigate?.();
    navigate(path);
  };

  // Stejný katalog jako /deals (reálné dealy + teasery koncernů) — počty
  // v menu tak sedí na to, co zákazník po prokliku skutečně uvidí.
  const catalog = useMemo(() => buildCatalog(deals, productCounts, () => ''), [deals, productCounts]);

  const concernEntries = useMemo<ScanEntry[]>(() => {
    const real = new Map<string, number>();
    const live = new Map<string, number>();
    catalog.forEach((tile) => {
      if (tile.kind === 'teaser' || !tile.concernSlug) return;
      real.set(tile.concernSlug, (real.get(tile.concernSlug) ?? 0) + 1);
      if (tile.kind === 'live') live.set(tile.concernSlug, (live.get(tile.concernSlug) ?? 0) + 1);
    });
    return CONCERNS
      .map((c) => ({
        key: c.slug,
        name: c.name,
        domain: c.domain,
        count: real.get(c.slug) ?? 0,
        liveCount: live.get(c.slug) ?? 0,
      }))
      .sort((a, b) => b.liveCount - a.liveCount || b.count - a.count)
      .slice(0, MAX_ROWS);
  }, [catalog]);

  const brandEntries = useMemo<ScanEntry[]>(() => {
    const real = new Map<string, number>();
    const live = new Map<string, number>();
    const inWorks = new Set<string>();
    catalog.forEach((tile) => {
      tile.brandKeys.forEach((k) => {
        if (tile.kind === 'teaser') { inWorks.add(k); return; }
        real.set(k, (real.get(k) ?? 0) + 1);
        if (tile.kind === 'live') live.set(k, (live.get(k) ?? 0) + 1);
      });
    });
    const resolve = (key: string, count: number): ScanEntry => {
      const name = toDisplayName(key);
      // Šperkové linky („Fossil Jewelry") mají logo mateřské značky.
      const domain = (getBrandByName(name) ?? getBrandByName(name.replace(/\s+Jewelry$/i, '')))?.domain;
      return { key, name, domain, count, liveCount: live.get(key) ?? 0 };
    };
    const entries = Array.from(real.entries())
      .map(([key, count]) => resolve(key, count))
      .sort((a, b) => b.liveCount - a.liveCount || b.count - a.count);
    // Když je reálných dealů málo, doplní sloupec značky s dealem v přípravě.
    for (const k of inWorks) {
      if (entries.length >= MAX_ROWS) break;
      if (!real.has(k)) entries.push(resolve(k, 0));
    }
    return entries.slice(0, MAX_ROWS);
  }, [catalog]);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[minmax(340px,1.1fr)_1fr_1fr] gap-x-8">
        <NavDealSpotlight deals={deals} onOpen={(deal) => go(`/deals/${deal.slug}`)} />
        <ScanColumn
          label={t.catalog.concernsLabel}
          entries={concernEntries}
          onPick={(e) => go(`/deals?concern=${encodeURIComponent(e.key)}`)}
        />
        <ScanColumn
          label={t.catalog.brandsLabel}
          entries={brandEntries}
          onPick={(e) => go(`/deals?brand=${encodeURIComponent(e.key)}`)}
        />
      </div>

      {/* Patička: alerty (retenční smyčka) + úniková cesta „všechny dealy" */}
      <div className="mt-2.5 flex items-center justify-between gap-4 border-t border-slate-100 pt-2">
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

/* ── Skenovací sloupce ──────────────────────────────────────────────────── */

function ScanColumn({
  label, entries, onPick,
}: {
  label: string;
  entries: ScanEntry[];
  onPick: (entry: ScanEntry) => void;
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{label}</h3>
      <div className="flex flex-col gap-0.5">
        {entries.map((entry) => (
          <ScanRow key={entry.key} entry={entry} onPick={() => onPick(entry)} />
        ))}
      </div>
    </div>
  );
}

/** Jeden řádek: logo na tónovaném čtverci, název vlevo, počet dealů vpravo. */
function ScanRow({ entry, onPick }: { entry: ScanEntry; onPick: () => void }) {
  const label = entry.count > 0
    ? `${entry.count} big ${entry.count === 1 ? 'deal' : 'deals'}`
    : 'deal in the works';

  return (
    <button
      type="button"
      onClick={onPick}
      className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-slate-50"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] p-1.5"
        style={{ backgroundColor: tintForKey(entry.key) }}
      >
        {entry.domain ? (
          <BrandLogo
            name={entry.name}
            domain={entry.domain}
            width={160}
            height={80}
            className="max-h-[18px] max-w-full object-contain [mix-blend-mode:multiply]"
            fallbackClassName="text-[9px] font-bold leading-none text-zinc-700"
          />
        ) : (
          <span className="text-[9px] font-bold leading-none text-zinc-700">
            {entry.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-zinc-900">{entry.name}</span>
      <span
        className={`shrink-0 text-xs ${
          entry.liveCount > 0
            ? 'font-semibold text-red-600'
            : entry.count > 0
              ? 'font-medium text-zinc-500'
              : 'font-medium text-zinc-400'
        }`}
      >
        {label}
      </span>
    </button>
  );
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
      className="relative h-full min-h-[264px] overflow-hidden rounded-2xl border border-slate-200 bg-white"
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
      <div className="absolute bottom-1 left-1/2 z-10 flex -translate-x-1/2">
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

/** Slide reálného dealu — koncern v rohu, odpočet, loga značek dealu, CTA.
    S kampaňovou fotkou (hero_image_url) jede fotka na pozadí a loga se
    schovají — branding nese sama; patka dostane bílý scrim kvůli čitelnosti. */
function DealSlide({ deal, onOpen }: { deal: Deal; onOpen: () => void }) {
  const concern = getConcernForDeal(deal);
  const brands = (deal.brands ?? []).slice(0, 6);
  const photo = deal.hero_image_url;

  return (
    <button type="button" onClick={onOpen} className="relative flex h-full w-full flex-col px-5 py-4 text-left">
      {photo && (
        <>
          <img src={photo} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/95 via-white/60 to-transparent"
          />
        </>
      )}
      {/* horní řádek: koncern v rohu + odpočet do konce dealu */}
      <div className="relative flex items-start justify-between gap-3">
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

      {/* loga značek dealu — jen bez fotky (fotka nese branding sama) */}
      {!photo && (
        <div className="flex min-h-0 flex-1 flex-wrap items-center justify-center gap-x-6 gap-y-3 px-2">
          {brands.map((b) => {
            const meta = getBrandByName(b);
            return meta ? (
              <BrandLogo
                key={b}
                name={meta.name}
                domain={meta.domain}
                width={240}
                height={100}
                className="max-h-9 max-w-[120px] object-contain [mix-blend-mode:multiply]"
                fallbackClassName="font-display text-lg font-black tracking-tight text-zinc-900"
              />
            ) : (
              <span key={b} className="font-display text-lg font-black tracking-tight text-zinc-900">{b}</span>
            );
          })}
        </div>
      )}

      {/* patka: název + CTA; tečky jsou pod tím na spodní hraně karty */}
      <div className={`relative pb-4 ${photo ? 'mt-auto' : ''}`}>
        <p className="line-clamp-2 text-sm font-semibold text-zinc-900">{deal.title}</p>
        <span className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-900">
          Explore deal <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

/** Placeholder — další deal se chystá (stejný slovník jako pás na homepage). */
function PlaceholderSlide() {
  return (
    <div className="flex h-full w-full flex-col px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <Lock className="h-3 w-3" /> Next deal in the works
        </span>
        <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
          {t.home.comingSoon}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2">
        <div aria-hidden className="h-2.5 w-3/5 rounded-full bg-slate-100" />
        <div aria-hidden className="h-2.5 w-2/5 rounded-full bg-slate-100" />
        <p className="mt-1 text-center text-[11px] text-slate-500">{t.home.lockedNote}</p>
      </div>
    </div>
  );
}
