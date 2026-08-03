import { Link } from 'react-router-dom';
import { ArrowRight, Bell, Check } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CatalogSearch } from '@/components/deals/catalog/CatalogSearch';
import { dealsI18n, fillTemplate } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

/** Kanonický gradient webu (eyebrow Early Access karty). */
const GRADIENT = 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent';
/** Loga jako bílé siluety — stejná technika jako marquee a dlaždice. */
const SILHOUETTE = '[filter:brightness(0)_invert(1)]';

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
 * Early Access karta. Řádky koncernů přebírají vzor z mega menu GoBigDeal:
 * logo silueta + název + zelený počet živých dávek. Modrá značí výběr,
 * stejně jako dlaždice FilterTiles na mobilu.
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

  const label = 'text-[11px] font-bold uppercase tracking-wider text-zinc-500';

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
                className={`-mx-2 flex h-10 items-center gap-3 rounded-xl px-2 text-left transition-colors ${
                  active ? 'bg-blue-500/[0.12]' : 'hover:bg-white/[0.06]'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] p-1.5 ring-1 ${
                    active ? 'bg-blue-500/15 ring-blue-400/40' : 'bg-white/[0.06] ring-white/10'
                  }`}
                >
                  <BrandLogo
                    name={c.name}
                    domain={c.domain ?? ''}
                    width={160}
                    height={80}
                    className={`max-h-4 max-w-full object-contain ${SILHOUETTE} ${
                      c.count === 0 ? 'opacity-40' : 'opacity-90'
                    }`}
                    fallbackClassName="text-[9px] font-bold leading-none text-zinc-300"
                  />
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-[13px] font-medium ${
                    active ? 'text-white' : 'text-zinc-100'
                  }`}
                >
                  {c.name}
                </span>
                {active ? (
                  <Check className="h-4 w-4 shrink-0 text-blue-400" strokeWidth={2.5} />
                ) : c.live > 0 ? (
                  <span className="shrink-0 text-xs font-semibold text-emerald-400">
                    {fillTemplate(dash.live, { n: String(c.live) })}
                  </span>
                ) : c.count > 0 ? (
                  <span className="shrink-0 text-xs tabular-nums text-zinc-500">{c.count}</span>
                ) : (
                  <span className="shrink-0 text-xs text-zinc-600">{dash.soon}</span>
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
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/[0.06] text-zinc-300 ring-1 ring-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {b.name}
                {b.count > 0 && (
                  <span className={`tabular-nums ${active ? 'text-white/70' : 'text-zinc-500'}`}>
                    {b.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Early Access — referenční PRO karta (gradient eyebrow + zelené
             fajfky), stejná jako v mega menu GoBigDeal ── */}
      <div className="flex flex-col rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${GRADIENT}`}>
          {dash.eyebrowPro}
        </span>
        <p className="mt-2 font-sans text-[17px] font-extralight leading-snug tracking-tight">
          <span className="text-white">{d.early.headingLead} </span>
          <span className="text-zinc-400">{d.early.headingMuted}</span>
        </p>
        <ul className="mt-3 space-y-1.5">
          {d.early.bullets.slice(0, 3).map((b) => (
            <li key={b} className="flex items-start gap-2 text-[13px] leading-snug text-zinc-300">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={2.5} />
              {b}
            </li>
          ))}
        </ul>
        <Link
          to="/#gbd-pricing"
          className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-full bg-white px-5 text-[13px] font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
        >
          {d.early.ctaPro} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* alerty + vysvětlení — sekundární vstupy pod kartou */}
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onAlerts}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-white/15 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
        >
          <Bell className="h-3.5 w-3.5" /> {d.early.ctaAlerts}
        </button>
        <button
          type="button"
          onClick={onHow}
          className="inline-flex items-center justify-center gap-1.5 text-[13px] text-zinc-400 transition-colors hover:text-white"
        >
          {d.catalog.promo.howCta} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
