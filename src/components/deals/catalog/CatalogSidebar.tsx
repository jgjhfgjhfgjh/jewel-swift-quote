import { Link } from 'react-router-dom';
import { ArrowRight, Bell, Check } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CatalogSearch } from '@/components/deals/catalog/CatalogSearch';
import { dealsI18n, fillTemplate } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

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
 * Early Access karta. Hairline monochrom: výběr = plná bílá (chip / check),
 * živé dávky = bílá pulsující tečka + mono počet, klid = neutral.
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

  const label = 'text-[11px] font-medium uppercase tracking-widest text-neutral-500';

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
                  active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border p-1.5 ${
                    active ? 'border-white/[0.25] bg-white/[0.06]' : 'border-white/[0.08] bg-white/[0.02]'
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
                    fallbackClassName="text-[9px] font-bold leading-none text-neutral-300"
                  />
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-[13px] font-medium ${
                    active ? 'text-white' : 'text-neutral-200'
                  }`}
                >
                  {c.name}
                </span>
                {active ? (
                  <Check className="h-4 w-4 shrink-0 text-white" strokeWidth={2.5} />
                ) : c.live > 0 ? (
                  <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    {fillTemplate(dash.live, { n: String(c.live) })}
                  </span>
                ) : c.count > 0 ? (
                  <span className="shrink-0 font-mono text-xs text-neutral-500">{c.count}</span>
                ) : (
                  <span className="shrink-0 text-xs text-neutral-600">{dash.soon}</span>
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
                    ? 'border-white bg-white text-black'
                    : 'border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:border-white/[0.2] hover:text-white'
                }`}
              >
                {b.name}
                {b.count > 0 && (
                  <span className={`font-mono ${active ? 'text-black/60' : 'text-neutral-600'}`}>
                    {b.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Early Access — monetizační karta v hairline stylu: bordered
             eyebrow chip, bílé fajfky, bílé CTA ── */}
      <div className="flex flex-col rounded-xl border border-white/[0.08] bg-[#050505] p-5 transition-colors hover:border-white/[0.15]">
        <span className="inline-flex w-fit items-center rounded-full border border-white/[0.12] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
          {dash.eyebrowPro}
        </span>
        <p className="mt-3 font-sans text-[17px] font-medium leading-snug tracking-tighter">
          <span className="text-white">{d.early.headingLead} </span>
          <span className="text-neutral-600">{d.early.headingMuted}</span>
        </p>
        <ul className="mt-3 space-y-1.5">
          {d.early.bullets.slice(0, 3).map((b) => (
            <li key={b} className="flex items-start gap-2 text-[13px] leading-snug text-neutral-400">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" strokeWidth={2.5} />
              {b}
            </li>
          ))}
        </ul>
        <Link
          to="/#gbd-pricing"
          className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-full bg-white px-5 text-[13px] font-medium text-black transition-colors hover:bg-neutral-200"
        >
          {d.early.ctaPro} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* alerty + vysvětlení — sekundární vstupy pod kartou */}
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onAlerts}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-white/[0.12] px-4 text-[13px] font-medium text-white transition-colors hover:border-white/[0.25] hover:bg-white/[0.04]"
        >
          <Bell className="h-3.5 w-3.5" /> {d.early.ctaAlerts}
        </button>
        <button
          type="button"
          onClick={onHow}
          className="inline-flex items-center justify-center gap-1.5 text-[13px] text-neutral-500 transition-colors hover:text-white"
        >
          {d.catalog.promo.howCta} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
