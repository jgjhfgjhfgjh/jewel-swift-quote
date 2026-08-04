import { Link } from 'react-router-dom';
import { ArrowRight, Bell, Check } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CatalogSearch } from '@/components/deals/catalog/CatalogSearch';
import { dealsI18n, fillTemplate } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

export interface SidebarConcern {
  key: string;
  name: string;
  domain?: string;
  /** Počet reálných dávek (bez teaserů). */
  count: number;
  /** Z toho živých. */
  live: number;
}

export interface SidebarBrand {
  key: string;
  name: string;
  count: number;
}

/**
 * Levý panel dashboardu (desktop) — hledání, filtr koncernů a značek a
 * Early Access karta. Světlá varianta: výběr = plná zinc-900 (chip / check),
 * živé dávky = zelená pulsující tečka + mono počet, loga v plných barvách.
 */
export function CatalogSidebar({
  search,
  onSearch,
  concerns,
  brands,
  selectedConcerns,
  selectedBrands,
  onToggleConcern,
  onToggleBrand,
  onAlerts,
  onHow,
}: {
  search: string;
  onSearch: (next: string) => void;
  concerns: SidebarConcern[];
  brands: SidebarBrand[];
  selectedConcerns: string[];
  selectedBrands: string[];
  onToggleConcern: (key: string) => void;
  onToggleBrand: (key: string) => void;
  onAlerts: () => void;
  onHow: () => void;
}) {
  const lang = useStore((s) => s.lang);
  const d = dealsI18n[lang];
  const dash = d.catalog.dash;

  const label = 'text-[11px] font-medium uppercase tracking-widest text-slate-400';

  return (
    <div className="flex flex-col gap-7">
      <CatalogSearch value={search} onChange={onSearch} compact />

      {/* ── Koncerny ── */}
      <div>
        <span className={label}>{d.catalog.concernsLabel}</span>
        <div className="mt-2 flex flex-col">
          {concerns.map((c) => {
            const active = selectedConcerns.includes(c.key);
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={active}
                onClick={() => onToggleConcern(c.key)}
                className={`-mx-2 flex h-10 items-center gap-3 rounded-lg px-2 text-left transition-colors ${
                  active ? 'bg-slate-100' : 'hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-white p-1.5 ${
                    active ? 'border-slate-300' : 'border-slate-200'
                  }`}
                >
                  <BrandLogo
                    name={c.name}
                    domain={c.domain ?? ''}
                    width={160}
                    height={80}
                    className={`max-h-4 max-w-full object-contain [mix-blend-mode:multiply] ${
                      c.count === 0 ? 'opacity-40' : 'opacity-90'
                    }`}
                    fallbackClassName="text-[9px] font-bold leading-none text-slate-600"
                  />
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-[13px] font-medium ${
                    active ? 'text-zinc-900' : 'text-slate-700'
                  }`}
                >
                  {c.name}
                </span>
                {active ? (
                  <Check className="h-4 w-4 shrink-0 text-zinc-900" strokeWidth={2.5} />
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

      {/* ── Značky — chipy s počtem dávek ── */}
      <div>
        <span className={label}>{d.catalog.brandsLabel}</span>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
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

      {/* ── Early Access — monetizační karta ve světlé variantě: modrý
             eyebrow (identita Early Access), zelené fajfky, tmavé CTA ── */}
      <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-700">
          {dash.eyebrowPro}
        </span>
        <p className="mt-3 font-sans text-[17px] font-medium leading-snug tracking-tighter">
          <span className="text-zinc-900">{d.early.headingLead} </span>
          <span className="text-slate-400">{d.early.headingMuted}</span>
        </p>
        <ul className="mt-3 space-y-1.5">
          {d.early.bullets.slice(0, 3).map((b) => (
            <li key={b} className="flex items-start gap-2 text-[13px] leading-snug text-slate-600">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={2.5} />
              {b}
            </li>
          ))}
        </ul>
        <Link
          to="/#gbd-pricing"
          className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-full bg-zinc-900 px-5 text-[13px] font-medium text-white transition-colors hover:bg-zinc-700"
        >
          {d.early.ctaPro} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* alerty + vysvětlení — sekundární vstupy pod kartou */}
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onAlerts}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-slate-300 px-4 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-slate-50"
        >
          <Bell className="h-3.5 w-3.5" /> {d.early.ctaAlerts}
        </button>
        <button
          type="button"
          onClick={onHow}
          className="inline-flex items-center justify-center gap-1.5 text-[13px] text-slate-500 transition-colors hover:text-zinc-900"
        >
          {d.catalog.promo.howCta} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
