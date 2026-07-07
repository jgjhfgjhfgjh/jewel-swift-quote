import { useNavigate } from 'react-router-dom';
import {
  PackageOpen, HandCoins, Tag, Server, Handshake, BarChart3, BookOpen, ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStockCount } from '@/hooks/useStockCount';

type Badge = 'new' | 'trending' | null;
interface Tool {
  icon: LucideIcon;
  title: string;
  desc: string;
  to?: string;
  action?: 'ai';
  badge?: Badge;
  /** swelt primary-blue accent (icon + title) — echoes the hero H2 */
  accent?: boolean;
}

/* ── Badges ── */
function NewBadge() {
  return (
    <span className="font-display text-[10px] inline-block uppercase tracking-wide px-1.5 py-0.5 rounded-none bg-white/10 text-white/80 border border-white/20">
      New
    </span>
  );
}
function TrendingBadge() {
  return (
    <span className="absolute right-3 top-3 pointer-events-none font-display text-[10px] inline-block uppercase tracking-wide px-1.5 py-0.5 rounded-none bg-white/10 text-white/80 border border-white/20">
      Trending
    </span>
  );
}

/* ── Higgsfield-style apps/tools section ── */
export function AppsCards() {
  const navigate = useNavigate();
  const { setGatewayOpen, setViewMode, openAuthModal } = useStore();
  const { user, isB2bApproved } = useAuthContext();
  // Live in-stock count for the Katalog 2026 hero card (approved B2B partners only)
  const stockCount = useStockCount(!!isB2bApproved);

  // Katalog 2026 — trvale nahrazuje CTA katalogu z HomeHero, včetně chování
  // ve všech režimech: přihlášený → rovnou do katalogu, host → registrační popup
  // (nepřihlášeného by katalog stejně vrátil na login, viz Index.tsx).
  const openCatalog = () => {
    if (user) {
      setViewMode('catalog');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      openAuthModal('register');
    }
  };

  const go = (t: Tool) => {
    if (t.action === 'ai') setGatewayOpen(true);
    else if (t.to) navigate(t.to);
  };

  const tools: Tool[] = [
    // Top row
    { icon: PackageOpen, title: 'Dropshipping', desc: 'Prodávejte bez skladu — zabalíme a odešleme pod vaší značkou', to: '/dropshipping', badge: 'trending' },
    { icon: Handshake, title: 'B2B Velkoobchod', desc: '3 000+ produktů za velkoobchodní ceny', to: '/velkoobchod' },
    { icon: Tag, title: 'DEAL nabídky', desc: 'Closeout výprodeje za mimořádné ceny', to: '/deals' },
    // Bottom row
    { icon: HandCoins, title: 'Nákup bez registrace', desc: 'Velkoobchodní ceny, stačí IČO', to: '/luxury' },
    { icon: BarChart3, title: 'Product Intelligence', desc: 'Feed, trendová data a AI doporučení pro váš sortiment', to: '/feed', accent: true },
    { icon: Server, title: 'MCP server', desc: 'Napojte AI agenty na náš katalog přes MCP.', to: '/feed', badge: 'new' },
  ];

  return (
    <section className="px-3 sm:px-5 lg:px-8 mt-3 sm:mt-4">
      <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">

        {/* ── HERO card — Katalog 2026 ── */}
        <button
          type="button"
          onClick={openCatalog}
          className="group relative overflow-hidden rounded-none w-full lg:w-[400px] lg:shrink-0 min-h-[200px]
                     bg-[#0e0f11]/90 backdrop-blur-md border border-[#66696e] p-5 flex flex-col justify-between text-left
                     transition-colors hover:bg-[#17191c]/80"
        >
          {/* decorative icon */}
          <BookOpen className="pointer-events-none absolute -right-6 -bottom-6 h-40 w-40 text-white/[0.04]" strokeWidth={1.25} />
          <div className="relative">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-semibold tracking-[-0.5px] text-white">
                Katalog 2026
              </h2>
              <span className="font-display text-[10px] inline-block uppercase tracking-wide px-1.5 py-0.5 rounded-none bg-white/10 text-white/80 border border-white/20">
                New
              </span>
            </div>
            <p className="mt-3 max-w-[300px] text-sm text-[#898a8b] leading-relaxed">
              3 000+ prémiových hodinek a šperků od 70+ světových značek. Velkoobchodní ceny až 60 % pod MOC, zásoby aktuální každý den.
            </p>
            {isB2bApproved && stockCount != null && stockCount > 0 ? (
              <p className="mt-2 text-xs text-white/70">
                <span className="tabular-nums font-semibold">{stockCount.toLocaleString('cs-CZ')}</span> produktů skladem právě teď
              </p>
            ) : !user ? (
              <p className="mt-2 text-xs text-white/70">
                Registrace zdarma · přístup ihned · bez závazků
              </p>
            ) : null}
          </div>
          <span className="relative mt-6 inline-flex items-center gap-1.5 self-start rounded-none bg-white px-5 py-3 text-sm font-semibold text-black transition group-hover:bg-white/90">
            {user ? 'Otevřít katalog' : 'Otevřít katalog zdarma'} <ArrowUpRight className="h-4 w-4" />
          </span>
        </button>

        {/* ── GRID of small cards ── */}
        <div className="grid flex-1 min-w-0 auto-rows-fr grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.title}
                type="button"
                onClick={() => go(t)}
                className="group relative overflow-hidden rounded-none min-h-[126px] p-5 gap-3
                           bg-[#0e0f11]/90 backdrop-blur-md border border-[#66696e] flex flex-col items-start justify-between text-left
                           transition-colors hover:bg-[#17191c]/80"
              >
                {t.badge === 'trending' && <TrendingBadge />}
                <div className="flex w-full items-start justify-between">
                  <Icon className={`w-6 h-6 ${t.accent ? 'text-blue-500' : 'text-white/80'}`} strokeWidth={1.75} />
                  {t.badge === 'new' && <NewBadge />}
                </div>
                <div className="min-w-0 w-full">
                  <h3 className={`text-base font-semibold leading-6 tracking-[-0.16px] sm:truncate ${t.accent ? 'text-blue-500' : 'text-white'}`}>
                    {t.title}
                  </h3>
                  {/* Reserve two lines so single-line cards keep their titles aligned across the row */}
                  <p className="text-xs font-normal leading-[18px] text-[#898a8b] sm:line-clamp-2 sm:min-h-[36px]">
                    {t.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
