import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CatalogSearch } from '@/components/deals/catalog/CatalogSearch';
import { dealsI18n, fillTemplate } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

export interface FilterNavConcern {
  key: string;
  name: string;
  domain?: string;
  /** Počet reálných dávek (bez teaserů). */
  count: number;
  /** Z toho živých. */
  live: number;
}

export interface FilterNavBrand {
  key: string;
  name: string;
  count: number;
}

/**
 * Filtrační nav lišta s expanzemi — nahrazuje sidebar, aby karty katalogu
 * dostaly plnou šířku stránky: hledání + tlačítka Koncerny/Značky, každé
 * rozbalí panel přes celou šíři (otevřená je vždy max jedna sekce).
 * Malá loga koncernů jedou VOLNĚ na bílé v plné barvě — bez rámečků.
 */
export function CatalogFilterNav({
  search,
  onSearch,
  concerns,
  brands,
  selectedConcerns,
  selectedBrands,
  onToggleConcern,
  onToggleBrand,
  onClearConcerns,
  onClearBrands,
}: {
  search: string;
  onSearch: (next: string) => void;
  concerns: FilterNavConcern[];
  brands: FilterNavBrand[];
  selectedConcerns: string[];
  selectedBrands: string[];
  onToggleConcern: (key: string) => void;
  onToggleBrand: (key: string) => void;
  onClearConcerns: () => void;
  onClearBrands: () => void;
}) {
  const lang = useStore((s) => s.lang);
  const d = dealsI18n[lang];
  const dash = d.catalog.dash;
  const [open, setOpen] = useState<null | 'concerns' | 'brands'>(null);

  const sections = [
    { key: 'concerns' as const, label: d.catalog.concernsLabel, selected: selectedConcerns.length },
    { key: 'brands' as const, label: d.catalog.brandsLabel, selected: selectedBrands.length },
  ];

  const clearPill = (activeNone: boolean, onClear: () => void) => (
    <button
      type="button"
      onClick={onClear}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        activeNone ? 'bg-zinc-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-zinc-900'
      }`}
    >
      {d.catalog.allConcerns}
    </button>
  );

  return (
    <div>
      {/* ── lišta: hledání + expanzní tlačítka ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[220px] flex-1 sm:max-w-sm">
          <CatalogSearch value={search} onChange={onSearch} compact />
        </div>
        {sections.map((s) => {
          const isOpen = open === s.key;
          return (
            <button
              key={s.key}
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen((o) => (o === s.key ? null : s.key))}
              className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium text-zinc-900 shadow-sm transition-colors ${
                isOpen || s.selected > 0
                  ? 'border-slate-300 bg-slate-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {s.label}
              {s.selected > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1.5 font-mono text-[11px] font-medium text-white">
                  {s.selected}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
          );
        })}
      </div>

      {/* ── expanze: Koncerny — logo volně na bílé + název + stav ── */}
      {open === 'concerns' && (
        <div className="mt-2 rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-[0_12px_32px_-10px_rgba(15,23,42,0.14)]">
          <div className="flex flex-wrap items-center gap-1.5">
            {clearPill(selectedConcerns.length === 0, onClearConcerns)}
            {concerns.map((c) => {
              const active = selectedConcerns.includes(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggleConcern(c.key)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
                    active ? 'bg-slate-100 ring-1 ring-zinc-900' : 'hover:bg-slate-50'
                  }`}
                >
                  <BrandLogo
                    name={c.name}
                    domain={c.domain ?? ''}
                    width={160}
                    height={80}
                    className={`h-5 w-auto max-w-[76px] object-contain [mix-blend-mode:multiply] ${
                      c.count === 0 ? 'opacity-40' : ''
                    }`}
                    fallbackClassName="text-[11px] font-bold leading-none text-slate-600"
                  />
                  <span className="text-[13px] font-medium text-zinc-900">{c.name}</span>
                  {active ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-zinc-900" strokeWidth={2.5} />
                  ) : c.live > 0 ? (
                    <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-emerald-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      {fillTemplate(dash.live, { n: String(c.live) })}
                    </span>
                  ) : c.count > 0 ? (
                    <span className="shrink-0 font-mono text-xs text-slate-400">{c.count}</span>
                  ) : (
                    <span className="shrink-0 text-xs text-slate-300">{dash.soon}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── expanze: Značky — chipy s počtem ── */}
      {open === 'brands' && (
        <div className="mt-2 rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-[0_12px_32px_-10px_rgba(15,23,42,0.14)]">
          <div className="flex flex-wrap items-center gap-1.5">
            {clearPill(selectedBrands.length === 0, onClearBrands)}
            {brands.map((b) => {
              const active = selectedBrands.includes(b.key);
              return (
                <button
                  key={b.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggleBrand(b.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-zinc-900'
                  }`}
                >
                  {b.name}
                  {b.count > 0 && (
                    <span className={`font-mono ${active ? 'text-white/60' : 'text-slate-400'}`}>
                      {b.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
