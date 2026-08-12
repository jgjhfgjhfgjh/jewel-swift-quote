import { Bell, Search, User as UserIcon } from 'lucide-react';
import { GoBigDealLogo } from '@/components/GoBigDealLogo';
import { CatalogKpis, type CatalogKpi } from './CatalogKpis';

/**
 * Dashboardová hlava /deals — reálná verze mockup karty z homepage hera
 * (stejný materiál: rámeček na gradientu #12161b → #0d1014, zaoblení 28 px).
 *
 * Horní lišta: gradientový indikátor + wordmark (nese ho samo logo), taby
 * Live / Ending first / Want Deals / Split Deals, vpravo malé hledání (píše
 * rovnou do filtru katalogu), zvoneček a kolečko s iniciálami přihlášeného.
 * Pod lištou čtyři KPI dlaždice s reálnými čísly (CatalogKpis, tmavá
 * varianta) — na rozdíl od hera tu nic není rozmazané, tohle je živý trh.
 */
export function CatalogDashboardHead({
  tabs,
  search,
  onSearch,
  searchPlaceholder,
  onBell,
  bellActive,
  initials,
  onAvatar,
  kpis,
  loading,
}: {
  tabs: { key: string; label: string; active?: boolean; onClick: () => void }[];
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder: string;
  onBell: () => void;
  /** Zelená tečka na zvonečku — uživatel už nějaký alert má. */
  bellActive?: boolean;
  /** Iniciály přihlášeného; `null` = host (ikonka, klik otevře přihlášení). */
  initials: string | null;
  onAvatar: () => void;
  kpis: CatalogKpi[];
  loading?: boolean;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-[#12161b] to-[#0d1014] p-4 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] sm:p-6">
      {/* ── horní lišta ── */}
      <div className="flex items-center gap-3">
        <GoBigDealLogo className="text-[15px] text-white" />

        <div className="ml-2 hidden items-center gap-1 md:flex">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={t.onClick}
              aria-pressed={t.active}
              className={
                t.active
                  ? 'rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-zinc-900'
                  : 'rounded-full px-3.5 py-1.5 text-[12px] font-medium text-zinc-400 transition-colors hover:text-white'
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* výrazně menší hledání (pokyn) — na fokus se pohodlně roztáhne */}
          <label className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 w-36 rounded-full border border-white/10 bg-white/[0.04] pl-8 pr-3 text-[12px] text-white
                         outline-none transition-all placeholder:text-zinc-500 focus:w-56 focus:border-white/25 focus:bg-white/[0.07]
                         [&::-webkit-search-cancel-button]:hidden"
            />
          </label>

          <button
            type="button"
            onClick={onBell}
            aria-label="Deal alerts"
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]
                       text-zinc-400 transition-colors hover:border-white/25 hover:text-white"
          >
            <Bell className="h-3.5 w-3.5" />
            {bellActive && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={onAvatar}
            aria-label={initials ? 'MyDeal account' : 'Sign in'}
            title={initials ? undefined : 'Sign in'}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700
                       text-[11px] font-bold leading-none text-white transition-transform hover:scale-105"
          >
            {initials ?? <UserIcon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* ── KPI řada ── */}
      <div className="mt-4 sm:mt-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[92px] animate-pulse rounded-[1.25rem] bg-white/5" />
            ))}
          </div>
        ) : (
          <CatalogKpis items={kpis} />
        )}
      </div>
    </div>
  );
}
