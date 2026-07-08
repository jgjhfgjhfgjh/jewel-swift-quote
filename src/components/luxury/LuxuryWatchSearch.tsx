import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Plus, Watch, Check } from 'lucide-react';
import { HouseLogo } from '@/components/luxury/HouseLogo';
import { searchLuxuryModels, type LuxuryModel } from '@/data/luxuryCatalog';

const display: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

/** A watch the customer has added to their inquiry. */
export interface SelectedWatch {
  id: string;
  brand: string;
  model: string;
  domain?: string;
  from: number | null;
  /** True when typed as free text rather than picked from the catalog. */
  custom: boolean;
}

interface Props {
  selected: SelectedWatch[];
  onChange: (next: SelectedWatch[]) => void;
  /** 'hero' renders a larger, prominent input for the top-of-page search. */
  variant?: 'default' | 'hero';
  /** Hide the in-component "selected" list (e.g. when the form below shows it). */
  showSelected?: boolean;
  /** Fired after any watch is added — used to guide the customer to the form. */
  onAdd?: (added: SelectedWatch) => void;
  placeholder?: string;
  /** Optional seed query (e.g. clicking a house card pre-fills the brand). */
  initialQuery?: string;
}

/**
 * Chrono24-style luxury watch picker. The customer searches the curated catalog
 * of prestige houses; matches surface as product cards in a našeptávač dropdown.
 * Anything not in the catalog can be added as a free-text "source on request"
 * item, so any reference can be inquired about.
 */
export function LuxuryWatchSearch({
  selected, onChange, variant = 'default', showSelected = true, onAdd, placeholder, initialQuery,
}: Props) {
  const [query, setQuery] = useState(initialQuery ?? '');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchLuxuryModels(query, 8), [query]);
  const trimmed = query.trim();
  // Offer a free-text option whenever the query isn't an exact catalog hit.
  const showCustom =
    trimmed.length >= 2 &&
    !results.some((r) => r.search === trimmed.toLowerCase());

  // Close on outside click.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => { setHighlight(0); }, [query]);

  const has = (id: string) => selected.some((s) => s.id === id);

  function addModel(m: LuxuryModel) {
    const w: SelectedWatch = {
      id: m.id, brand: m.brand, model: m.model,
      domain: m.domain, from: null, custom: false,
    };
    if (!has(m.id)) onChange([...selected, w]);
    onAdd?.(w);
    reset();
  }

  function addCustom(text: string) {
    const label = text.trim();
    if (!label) return;
    const id = `custom-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const w: SelectedWatch = { id, brand: 'Na poptávku', model: label, from: null, custom: true };
    if (!has(id)) onChange([...selected, w]);
    onAdd?.(w);
    reset();
  }

  function reset() {
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  function remove(id: string) {
    onChange(selected.filter((s) => s.id !== id));
  }

  // Total option count for keyboard nav (results + optional custom row).
  const optionCount = results.length + (showCustom ? 1 : 0);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || optionCount === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => (h + 1) % optionCount); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => (h - 1 + optionCount) % optionCount); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlight < results.length) addModel(results[highlight]);
      else addCustom(trimmed);
    } else if (e.key === 'Escape') { setOpen(false); }
  }

  const hero = variant === 'hero';

  return (
    <div ref={wrapRef} className="relative">
      {/* Input */}
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 ${hero ? 'h-5 w-5' : 'h-4 w-4'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? 'Hledejte model — např. Omega Speedmaster, TAG Heuer Carrera…'}
          className={
            hero
              ? 'w-full rounded-2xl border border-zinc-200 bg-white pl-12 pr-4 py-4 text-base shadow-sm outline-none transition focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10 sm:text-lg'
              : 'w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-3 py-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10'
          }
          aria-label="Vyhledat luxusní model"
          autoComplete="off"
        />
      </div>

      {/* Našeptávač dropdown — overlays everything below it */}
      {open && (results.length > 0 || showCustom) && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl">
          <ul className="max-h-[24rem] space-y-1.5 overflow-y-auto p-2">
            {results.map((m, i) => {
              const added = has(m.id);
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => addModel(m)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                      highlight === i ? 'border-zinc-300 bg-zinc-50' : 'border-zinc-100 bg-white hover:border-zinc-200'
                    }`}
                  >
                    {/* Smaller brand logo */}
                    <span className="flex h-8 w-11 shrink-0 items-center justify-center">
                      <HouseLogo
                        name={m.brand}
                        domain={m.domain}
                        width={140}
                        height={70}
                        className="max-h-4 w-auto max-w-full object-contain [mix-blend-mode:multiply]"
                        textClassName="text-[8px] font-medium text-zinc-500 text-center leading-tight"
                      />
                    </span>
                    {/* Bigger model text */}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] uppercase tracking-wider text-zinc-400">
                        {m.brand}
                      </span>
                      <span className="block truncate text-lg font-semibold leading-tight text-zinc-900" style={display}>
                        {m.collection && m.collection !== m.model ? `${m.collection} ` : ''}{m.model}
                      </span>
                    </span>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${added ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-900 text-white'}`}>
                      {added ? <><Check className="h-3 w-3" /> Přidáno</> : <><Plus className="h-3 w-3" /> Poptat</>}
                    </span>
                  </button>
                </li>
              );
            })}

            {showCustom && (
              <li>
                <button
                  type="button"
                  onMouseEnter={() => setHighlight(results.length)}
                  onClick={() => addCustom(trimmed)}
                  className={`flex w-full items-center gap-3 rounded-xl border border-dashed px-3 py-3 text-left transition ${
                    highlight === results.length ? 'border-zinc-400 bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <span className="flex h-8 w-11 shrink-0 items-center justify-center">
                    <Watch className="h-4 w-4 text-zinc-400" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] uppercase tracking-wider text-zinc-400">
                      Vlastní reference
                    </span>
                    <span className="block truncate text-lg font-semibold leading-tight text-zinc-900" style={display}>
                      Poptat „{trimmed}"
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white">
                    <Plus className="h-3 w-3" /> Přidat
                  </span>
                </button>
              </li>
            )}
          </ul>
          <div className="border-t border-zinc-100 bg-zinc-50/60 px-3 py-2 text-[11px] text-zinc-400">
            Nenašli jste konkrétní model? Napište referenci — dohledáme prakticky cokoliv.
          </div>
        </div>
      )}

      {/* Selected watches — product cards */}
      {showSelected && selected.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Vybrané modely k poptávce ({selected.length})
          </p>
          <ul className="space-y-2">
            {selected.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm"
              >
                <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50/70 px-1.5">
                  {s.domain ? (
                    <HouseLogo
                      name={s.brand}
                      domain={s.domain}
                      width={160}
                      height={80}
                      className="max-h-6 w-auto max-w-full object-contain [mix-blend-mode:multiply]"
                      textClassName="text-[9px] font-medium text-zinc-700 text-center leading-tight"
                    />
                  ) : (
                    <Watch className="h-5 w-5 text-zinc-400" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] uppercase tracking-wider text-zinc-400">
                    {s.brand}
                  </span>
                  <span className="block truncate text-sm font-medium text-zinc-900">{s.model}</span>
                </span>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                  aria-label={`Odebrat ${s.brand} ${s.model}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
