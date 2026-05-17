import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { dealsI18n } from '@/lib/i18n-deals';

/** Catalog filters mapped to deal_products fields. */
export const FILTER_DEFS = [
  { key: 'brand', field: 'brand' },
  { key: 'gender', field: 'gender' },
  { key: 'collection', field: 'collection' },
  { key: 'type', field: 'attr_movement' },
  { key: 'material', field: 'attr_material' },
  { key: 'size', field: 'attr_size' },
] as const;

export type FilterKey = (typeof FILTER_DEFS)[number]['key'];
export type FilterField = (typeof FILTER_DEFS)[number]['field'];

export interface FilterState {
  search: string;
  onSearch: (v: string) => void;
  filters: Record<FilterKey, string>;
  onFilter: (k: FilterKey, v: string) => void;
  options: Record<FilterKey, string[]>;
  resultCount: number;
  activeCount: number;
  onClear: () => void;
}

/**
 * Horizontal filter bar. Two variants:
 *  - "flow": sits in normal document flow, scrolls away naturally;
 *  - "fixed": a pinned clone that slides in on scroll-up.
 * On mobile the dropdowns collapse into a button that opens DealFilterSheet.
 */
export function DealFilterBar({
  state,
  variant,
  pinned = false,
  onOpenMobile,
}: {
  state: FilterState;
  variant: 'flow' | 'fixed';
  pinned?: boolean;
  onOpenMobile: () => void;
}) {
  const lang = useStore((s) => s.lang);
  const d = dealsI18n[lang];
  const { search, onSearch, filters, onFilter, options, resultCount, activeCount, onClear } = state;

  return (
    <div
      className={`border-y border-slate-200 bg-slate-50/95 backdrop-blur
        ${variant === 'fixed'
          ? `fixed left-0 right-0 top-14 z-30 transition-transform duration-300 ease-out sm:top-24
             ${pinned ? 'translate-y-0' : '-translate-y-[calc(100%_+_7rem)]'}`
          : ''}`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-3">
        <div className="relative min-w-[160px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={d.detail.searchPlaceholder}
            className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* desktop — inline dropdowns */}
        <div className="hidden flex-wrap items-center gap-2 lg:flex">
          {FILTER_DEFS.map((def) => {
            const opts = options[def.key];
            if (opts.length < 2) return null;
            return (
              <select
                key={def.key}
                value={filters[def.key]}
                onChange={(e) => onFilter(def.key, e.target.value)}
                className={`h-9 rounded-lg border bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400
                  ${filters[def.key] ? 'border-slate-900 font-semibold' : 'border-slate-300'}`}
              >
                <option value="">{d.filters[def.key]}: {d.filters.all}</option>
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            );
          })}
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" /> {d.detail.clearFilters}
            </button>
          )}
        </div>

        {/* mobile — open the filter sheet */}
        <button
          onClick={onOpenMobile}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {d.filters.title}
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>

        <span className="ml-auto whitespace-nowrap text-xs text-slate-400">
          {resultCount} {d.detail.results}
        </span>
      </div>
    </div>
  );
}

/** Mobile bottom sheet holding the filter dropdowns. */
export function DealFilterSheet({
  state,
  open,
  onClose,
}: {
  state: FilterState;
  open: boolean;
  onClose: () => void;
}) {
  const lang = useStore((s) => s.lang);
  const d = dealsI18n[lang];
  const { filters, onFilter, options, resultCount, activeCount, onClear } = state;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-white animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h3 className="font-display text-base font-black text-slate-900">
            {d.filters.title}
          </h3>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {FILTER_DEFS.map((def) => {
            const opts = options[def.key];
            if (opts.length < 2) return null;
            return (
              <div key={def.key}>
                <label className="mb-1 block text-xs font-semibold text-slate-500">{d.filters[def.key]}</label>
                <select
                  value={filters[def.key]}
                  onChange={(e) => onFilter(def.key, e.target.value)}
                  className={`h-11 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400
                    ${filters[def.key] ? 'border-slate-900 font-semibold' : 'border-slate-300'}`}
                >
                  <option value="">{d.filters.all}</option>
                  {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 border-t border-slate-200 p-4">
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600"
            >
              <X className="h-4 w-4" /> {d.detail.clearFilters}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
          >
            {resultCount} {d.detail.results}
          </button>
        </div>
      </div>
    </div>
  );
}
