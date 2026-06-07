import { useNavigate } from 'react-router-dom';
import {
  PackageOpen, Rss, ShoppingCart, HandCoins, Tag, Sparkles, Handshake, ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { useStore } from '@/lib/store';

type Badge = 'new' | 'trending' | null;
interface Tool {
  icon: LucideIcon;
  title: string;
  desc: string;
  to?: string;
  action?: 'ai';
  badge?: Badge;
}

/* ── Badges ── */
function NewBadge() {
  return (
    <span className="font-grotesk text-xs inline-block uppercase px-1.5 rounded-sm font-bold -skew-x-12 bg-[#d1fe17] text-[#131517]">
      New
    </span>
  );
}
function TrendingBadge() {
  return (
    <span
      className="absolute right-3 top-3 pointer-events-none font-grotesk text-xs inline-block uppercase px-1.5 rounded-sm font-bold -skew-x-12 text-white"
      style={{ backgroundImage: 'radial-gradient(39.71% 136.54% at 51.64% 117.31%, #F920D1 0%, #ED1572 100%)' }}
    >
      Trending
    </span>
  );
}

/* ── Higgsfield-style apps/tools section ── */
export function AppsCards() {
  const navigate = useNavigate();
  const { setGatewayOpen } = useStore();

  const go = (t: Tool) => {
    if (t.action === 'ai') setGatewayOpen(true);
    else if (t.to) navigate(t.to);
  };

  const tools: Tool[] = [
    { icon: PackageOpen, title: 'Dropshipping', desc: 'Prodávejte bez skladu — balíme pod vaší značkou', to: '/dropshipping', badge: 'trending' },
    { icon: Rss, title: 'Automatický feed', desc: 'XML/CSV feed 3 000+ produktů do e-shopu', to: '/feed', badge: 'new' },
    { icon: ShoppingCart, title: 'E-shop do 48 h', desc: 'Hotový obchod naplněný produkty', to: '/shop' },
    { icon: HandCoins, title: 'Nákup bez registrace', desc: 'Velkoobchodní ceny, stačí IČO', to: '/luxury' },
    { icon: Tag, title: 'DEAL nabídky', desc: 'Closeout výprodeje za mimořádné ceny', to: '/deals', badge: 'new' },
    { icon: Sparkles, title: 'AI poradce', desc: 'Ceny a dostupnost — odpověď do 5 vteřin', action: 'ai' },
  ];

  return (
    <section className="px-3 sm:px-5 lg:px-8 mt-3 sm:mt-4">
      <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">

        {/* ── HERO card ── */}
        <button
          type="button"
          onClick={() => navigate('/velkoobchod')}
          className="group relative overflow-hidden rounded-2xl w-full lg:w-[400px] lg:shrink-0 min-h-[200px]
                     bg-[#1c1e20] border border-white/5 p-5 flex flex-col justify-between text-left
                     transition-colors hover:bg-[#23252a]"
        >
          {/* decorative icon */}
          <Handshake className="pointer-events-none absolute -right-6 -bottom-6 h-40 w-40 text-white/[0.04]" strokeWidth={1.25} />
          <div className="relative">
            <div className="flex items-center gap-2">
              <h2 className="font-grotesk text-3xl font-extrabold uppercase tracking-tight text-white">
                B2B Velkoobchod
              </h2>
              <NewBadge />
            </div>
            <p className="mt-3 max-w-[280px] text-sm text-[#898a8b] leading-relaxed">
              3 000+ produktů a 70+ značek za velkoobchodní ceny. Od jednoho kusu, doručení po celé EU.
            </p>
          </div>
          <span className="relative mt-6 inline-flex items-center gap-1.5 self-start rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition group-hover:bg-white/90">
            Vstoupit <ArrowUpRight className="h-4 w-4" />
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
                className="group relative overflow-hidden rounded-2xl min-h-[180px] sm:min-h-[210px] p-5 gap-3
                           bg-[#1c1e20] border border-white/5 flex flex-col items-start justify-between text-left
                           transition-colors hover:bg-[#23252a]"
              >
                {t.badge === 'trending' && <TrendingBadge />}
                <div className="flex w-full items-start justify-between">
                  <Icon className="w-6 h-6 text-white/80" strokeWidth={1.75} />
                  {t.badge === 'new' && <NewBadge />}
                </div>
                <div className="min-w-0 w-full">
                  <h3 className="text-base font-semibold leading-6 text-white tracking-[-0.16px] truncate">
                    {t.title}
                  </h3>
                  <p className="text-xs font-normal leading-[18px] text-[#898a8b] line-clamp-2">
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
