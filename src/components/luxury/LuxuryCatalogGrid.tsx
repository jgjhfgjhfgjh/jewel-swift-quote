import { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HouseLogo } from '@/components/luxury/HouseLogo';
import { WatchPhoto } from '@/components/luxury/WatchPhoto';
import { LUXURY_MODELS, type LuxuryModel } from '@/data/luxuryCatalog';
import type { SelectedWatch } from '@/components/luxury/LuxuryWatchSearch';

const display: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

function toWatch(m: LuxuryModel): SelectedWatch {
  return { id: m.id, brand: m.brand, model: m.model, domain: m.domain, from: null, custom: false };
}

/* ── Product image with brand-mark fallback (no photo yet / broken URL).
 * Photos render on pure white via WatchPhoto, which normalises the very
 * different official CDN crops to one look (watch large, no backdrop). ── */
function ProductImage({ m, pad = 'p-3' }: { m: LuxuryModel; pad?: string }) {
  const [err, setErr] = useState(false);
  if (m.image && !err) {
    return (
      <div className={`h-full w-full overflow-hidden bg-white ${pad}`}>
        <WatchPhoto src={m.image} alt={`${m.brand} ${m.model}`} onError={() => setErr(true)} />
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white p-4">
      <HouseLogo
        name={m.brand} domain={m.domain} width={300} height={150}
        className="max-h-12 w-auto max-w-[70%] object-contain opacity-90 [mix-blend-mode:multiply]"
        textClassName="text-base font-medium text-zinc-600 text-center"
      />
      <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">{m.collection ?? m.model}</span>
    </div>
  );
}

/* ── Fullscreen photo lightbox — mirrors ProductImageGallery from the main
 * catalog (white overlay, ESC/arrow keys, swipe, round controls), but since
 * every model has one photo the arrows switch BETWEEN PRODUCTS of the
 * currently filtered list. ── */
const SWIPE_THRESHOLD = 50;

function LuxuryLightbox({ models, index, onNavigate, onClose }: {
  models: LuxuryModel[];
  index: number;
  onNavigate: (i: number) => void;
  onClose: () => void;
}) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const m = models[index];
  const hasMultiple = models.length > 1;
  const next = () => onNavigate((index + 1) % models.length);
  const prev = () => onNavigate((index - 1 + models.length) % models.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (hasMultiple && e.key === 'ArrowRight') next();
      else if (hasMultiple && e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, hasMultiple, models.length]);

  if (!m) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx) && dy > SWIPE_THRESHOLD) onClose();
    else if (hasMultiple && Math.abs(dx) > SWIPE_THRESHOLD) { if (dx < 0) next(); else prev(); }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${m.brand} ${m.model}`}
      onClick={onClose}
      className="fixed inset-0 z-[20000] flex items-center justify-center bg-white/95 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Close */}
      <button
        type="button"
        aria-label="Zavřít galerii"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="fixed right-4 top-4 z-[20002] flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-gray-900 shadow-md transition hover:bg-black/10"
      >
        <X className="h-6 w-6" />
      </button>

      <div
        className="relative z-[20001] flex h-full w-full max-w-5xl flex-col items-center justify-center px-4 py-16 md:px-16"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="h-[70vh] w-full max-w-2xl overflow-hidden">
          {m.image ? (
            <WatchPhoto src={m.image} alt={`${m.brand} ${m.model}`} eager />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <HouseLogo
                name={m.brand} domain={m.domain} width={520} height={220}
                className="max-h-24 w-auto max-w-[240px] object-contain [mix-blend-mode:multiply]"
                textClassName="text-3xl font-medium text-zinc-700"
              />
            </div>
          )}
        </div>

        {/* Caption + counter */}
        <div className="mt-4 text-center" style={display}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-gold">{m.brand}</p>
          <p className="text-base font-semibold text-zinc-900">{m.model}</p>
          {hasMultiple && (
            <p className="mt-1 text-xs tabular-nums text-zinc-400">{index + 1} / {models.length}</p>
          )}
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label="Předchozí model"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/5 text-gray-900 shadow-md transition hover:bg-black/10 md:left-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Další model"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/5 text-gray-900 shadow-md transition hover:bg-black/10 md:right-4"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

/* ── Detail modal — mirrors ProductDetailModal (image left, info + params) ── */
function LuxuryProductModal({ m, open, onClose, onPick, picked }: {
  m: LuxuryModel; open: boolean; onClose: () => void; onPick: (w: SelectedWatch) => void; picked: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;

  const params = Object.entries(m.params ?? {});

  return createPortal(
    <div className="fixed inset-0 z-[15000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button" onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-gray-700 transition hover:bg-black/10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
          {/* Image */}
          <div className="group relative flex min-h-64 items-center justify-center rounded-tl-xl bg-white p-6 md:rounded-bl-xl">
            <div className="h-64 w-full">
              <ProductImage m={m} />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 p-6">
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gold">{m.brand}</p>
              <h2 className="text-lg font-semibold leading-snug" style={display}>{m.model}</h2>
              {m.collection && m.collection !== m.model && (
                <p className="mt-0.5 text-xs text-muted-foreground">Kolekce {m.collection}</p>
              )}
            </div>
            {m.reference && (
              <p className="text-xs text-muted-foreground">Reference: <span className="font-medium text-foreground">{m.reference}</span></p>
            )}
            {m.desc && <p className="text-sm leading-relaxed text-muted-foreground">{m.desc}</p>}

            <div className="mt-auto space-y-2 pt-2">
              <Button
                className="w-full gap-1.5 bg-zinc-900 text-white hover:bg-zinc-800"
                onClick={() => { onPick(toWatch(m)); onClose(); }}
              >
                {picked ? <><Check className="h-4 w-4" /> Přidáno — přejít k poptávce</> : <><Plus className="h-4 w-4" /> Poptat tento model</>}
              </Button>
              <p className="text-center text-[11px] text-zinc-400">Cena na poptávku · závazná nabídka do 48 h</p>
            </div>
          </div>
        </div>

        {/* Parameters */}
        {params.length > 0 && (
          <div className="border-t px-6 py-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parametry</h3>
            <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
              {params.map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-gray-50 py-1 text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="ml-4 text-right font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/* ── Single catalog card — same compact layout as the main catalog card.
 * Photo click opens the fullscreen lightbox (like the main catalog); the
 * name opens the detail modal with parameters. ── */
function LuxuryProductCard({ m, onPick, picked, onOpenPhoto }: {
  m: LuxuryModel; onPick: (w: SelectedWatch) => void; picked: boolean; onOpenPhoto: () => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  // Two headline specs under the name, like the catalog's meta lines.
  const specs = Object.entries(m.params ?? {}).slice(0, 2);

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-lg bg-white transition-shadow hover:shadow-sm">
        <div
          onClick={() => (m.image ? onOpenPhoto() : setDetailOpen(true))}
          className="relative aspect-square cursor-pointer overflow-hidden bg-white"
        >
          <div className="h-full w-full transition-transform duration-300 group-hover:scale-105">
            <ProductImage m={m} />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-3">
          <span className="self-start text-[10px] font-medium uppercase tracking-wider text-gold">{m.brand}</span>
          <h3
            className="mt-1 line-clamp-2 cursor-pointer text-sm font-medium leading-snug hover:underline"
            onClick={() => setDetailOpen(true)}
          >
            {m.model}
          </h3>
          {specs.length > 0 && (
            <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
              {specs.map(([, v]) => v).join(' · ')}
            </p>
          )}
          <div className="mt-auto pt-3">
            <Button
              size="sm"
              className={`h-8 w-full gap-1.5 transition-all duration-200 ${picked ? 'bg-emerald-600 text-white hover:bg-emerald-600' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
              onClick={() => onPick(toWatch(m))}
            >
              {picked ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span className="text-xs">{picked ? 'V poptávce' : 'Poptat'}</span>
            </Button>
          </div>
        </div>
      </div>

      <LuxuryProductModal m={m} open={detailOpen} onClose={() => setDetailOpen(false)} onPick={onPick} picked={picked} />
    </>
  );
}

/* ── Catalog grid — filtered by the houses carousel above (multi-select) ── */
export function LuxuryCatalogGrid({ brands, onToggleBrand, onClearBrands, onPick, pickedIds }: {
  brands: string[];
  onToggleBrand: (brand: string) => void;
  onClearBrands: () => void;
  onPick: (w: SelectedWatch) => void;
  pickedIds: Set<string>;
}) {
  const models = useMemo(
    () => (brands.length > 0 ? LUXURY_MODELS.filter((m) => brands.includes(m.brand)) : LUXURY_MODELS),
    [brands],
  );
  /** Index (within the filtered list) of the model open in the photo lightbox. */
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter change invalidates lightbox indices.
  useEffect(() => { setLightboxIndex(null); }, [brands]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Active brand filters (set via the carousel) */}
      {brands.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          {brands.map((b) => (
            <span key={b} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white py-1 pl-3.5 pr-1.5 text-sm font-medium text-zinc-800">
              {b}
              <button
                type="button"
                onClick={() => onToggleBrand(b)}
                aria-label={`Odebrat filtr ${b}`}
                className="rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <span className="text-xs text-zinc-400">{models.length} modelů</span>
          {brands.length > 1 && (
            <button
              type="button"
              onClick={onClearBrands}
              className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
            >
              Zrušit vše
            </button>
          )}
        </div>
      )}

      {/* Grid — same density as the main catalog */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {models.map((m, i) => (
          <LuxuryProductCard
            key={m.id}
            m={m}
            onPick={onPick}
            picked={pickedIds.has(m.id)}
            onOpenPhoto={() => setLightboxIndex(i)}
          />
        ))}
      </div>

      {/* Fullscreen photo lightbox — arrows switch between models */}
      {lightboxIndex !== null && (
        <LuxuryLightbox
          models={models}
          index={lightboxIndex}
          onNavigate={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
