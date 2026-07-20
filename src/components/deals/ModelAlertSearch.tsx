import { useEffect, useRef, useState } from 'react';
import { Bell, Loader2, Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { DealAlertsApi } from '@/hooks/useDealAlerts';

interface SuggestRow {
  id: string;
  sku: string;
  product_name: string | null;
  manufacturer: string | null;
  image_url: string | null;
}

/**
 * Watchdog na jednotlivé modely — debounced našeptávač nad RPC
 * search_products (stejný zdroj jako katalog). Výběr modelu zapne
 * product-level alert (SKU), aktivní hlídače se zobrazují jako chipy
 * se zvonečkem a křížkem na zrušení. Texty anglicky jako celá sekce.
 */
export function ModelAlertSearch({
  alertsApi,
  onRequireAuth,
}: {
  alertsApi: DealAlertsApi;
  onRequireAuth: () => void;
}) {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<SuggestRow[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const reqRef = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced dotaz — search_products s malým limitem jako našeptávač.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setRows([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const my = ++reqRef.current;
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc('search_products', {
        p_search: term,
        p_brands: null,
        p_category_keywords: null,
        p_stock_only: false,
        p_min_discount: 0,
        p_genders: null,
        p_params: null,
        p_ids: null,
        p_limit: 8,
        p_offset: 0,
      });
      if (my !== reqRef.current) return;
      setRows(!error && data ? (data as unknown as SuggestRow[]) : []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  // Zavřít dropdown klikem mimo
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const watched = alertsApi.alerts.filter((a) => a.level === 'product');

  const handlePick = async (r: SuggestRow) => {
    const label = [r.manufacturer, r.product_name].filter(Boolean).join(' · ') || r.sku;
    const ok = await alertsApi.add('product', r.sku, label);
    if (!ok) {
      setOpen(false);
      onRequireAuth();
      return;
    }
    setQ('');
    setRows([]);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-2.5 rounded-full border border-slate-300 bg-white px-5 py-3 shadow-sm focus-within:border-slate-400">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={q}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          placeholder="Search a model to watch — name, SKU or EAN"
          className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        {searching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />}
      </div>

      {open && rows.length > 0 && (
        <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
          {rows.map((r) => {
            const on = alertsApi.has('product', r.sku);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handlePick(r)}
                disabled={on}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                {r.image_url ? (
                  <img
                    src={r.image_url}
                    alt=""
                    loading="lazy"
                    className="h-9 w-9 shrink-0 rounded-lg bg-white object-contain ring-1 ring-slate-100"
                  />
                ) : (
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-100" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900">
                    {r.product_name || r.sku}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {[r.manufacturer, r.sku].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    on ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Bell className="h-3 w-3" />
                  {on ? 'Watching' : 'Watch'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* aktivní model watchdogy */}
      {watched.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {watched.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              <Bell className="h-3 w-3 text-emerald-600" />
              {a.label || a.target}
              <button
                type="button"
                onClick={() => alertsApi.remove('product', a.target)}
                aria-label="Remove alert"
                className="ml-0.5 text-slate-400 transition-colors hover:text-slate-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
