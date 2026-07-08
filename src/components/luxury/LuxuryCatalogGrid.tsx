import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HouseLogo } from '@/components/luxury/HouseLogo';
import { LUXURY_HOUSES, LUXURY_MODELS, type LuxuryModel } from '@/data/luxuryCatalog';
import type { SelectedWatch } from '@/components/luxury/LuxuryWatchSearch';

const display: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

function toWatch(m: LuxuryModel): SelectedWatch {
  return { id: m.id, brand: m.brand, model: m.model, domain: m.domain, from: null, custom: false };
}

/* ── Product image with brand-mark fallback (no photo yet / broken URL) ── */
function ProductImage({ m, className = '' }: { m: LuxuryModel; className?: string }) {
  const [err, setErr] = useState(false);
  if (m.image && !err) {
    return (
      <img
        src={m.image}
        alt={`${m.brand} ${m.model}`}
        loading="lazy"
        draggable={false}
        onError={() => setErr(true)}
        className={`h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105 ${className}`}
      />
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
      <HouseLogo
        name={m.brand} domain={m.domain} width={300} height={150}
        className="max-h-12 w-auto max-w-[70%] object-contain opacity-90 [mix-blend-mode:multiply]"
        textClassName="text-base font-medium text-zinc-600 text-center"
      />
      <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">{m.collection ?? m.model}</span>
    </div>
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
          <div className="group relative flex min-h-64 items-center justify-center rounded-tl-xl bg-gray-50 p-6 md:rounded-bl-xl">
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

/* ── Single catalog card — same compact layout as the main catalog card ── */
function LuxuryProductCard({ m, onPick, picked }: { m: LuxuryModel; onPick: (w: SelectedWatch) => void; picked: boolean }) {
  const [detailOpen, setDetailOpen] = useState(false);
  // Two headline specs under the name, like the catalog's meta lines.
  const specs = Object.entries(m.params ?? {}).slice(0, 2);

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-lg bg-white transition-shadow hover:shadow-sm">
        <div
          onClick={() => setDetailOpen(true)}
          className="relative aspect-square cursor-pointer overflow-hidden bg-muted/40"
        >
          <ProductImage m={m} />
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

/* ── Catalog grid with brand filter chips ── */
export function LuxuryCatalogGrid({ onPick, pickedIds }: { onPick: (w: SelectedWatch) => void; pickedIds: Set<string> }) {
  const [brand, setBrand] = useState<string | null>(null);
  const models = useMemo(
    () => (brand ? LUXURY_MODELS.filter((m) => m.brand === brand) : LUXURY_MODELS),
    [brand],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Brand filter chips */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setBrand(null)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${brand === null ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400'}`}
        >
          Všechny značky
        </button>
        {LUXURY_HOUSES.map((h) => (
          <button
            key={h.name}
            type="button"
            onClick={() => setBrand(brand === h.name ? null : h.name)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${brand === h.name ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400'}`}
          >
            {h.name}
          </button>
        ))}
      </div>

      {/* Grid — same density as the main catalog */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {models.map((m) => (
          <LuxuryProductCard key={m.id} m={m} onPick={onPick} picked={pickedIds.has(m.id)} />
        ))}
      </div>
    </div>
  );
}
