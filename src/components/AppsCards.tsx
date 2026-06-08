import { useNavigate } from 'react-router-dom';
import {
  PackageOpen, Rss, ShoppingCart, HandCoins, Tag, Headset, Handshake, ArrowUpRight,
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
    { icon: Handshake, title: 'B2B Velkoobchod', desc: '3 000+ produktů za velkoobchodní ceny', to: '/velkoobchod' },
    { icon: Rss, title: 'Automatický feed', desc: 'XML/CSV feed 3 000+ produktů do e-shopu', to: '/feed', badge: 'new' },
    { icon: ShoppingCart, title: 'E-shop do 48 h', desc: 'Hotový obchod naplněný produkty', to: '/shop' },
    { icon: HandCoins, title: 'Nákup bez registrace', desc: 'Velkoobchodní ceny, stačí IČO', to: '/luxury' },
    { icon: Tag, title: 'DEAL nabídky', desc: 'Closeout výprodeje za mimořádné ceny', to: '/deals', badge: 'new' },
    { icon: Headset, title: 'Zákaznická podpora', desc: 'Dedikovaní account manageři pro váš úspěch.', action: 'ai' },
  ];

  return (
    <section className="px-3 sm:px-5 lg:px-8 mt-3 sm:mt-4">
      <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">

        {/* ── HERO card ── */}
        <button
          type="button"
          onClick={() => navigate('/dropshipping')}
          className="group relative overflow-hidden rounded-2xl w-full lg:w-[400px] lg:shrink-0 min-h-[200px]
                     bg-[#17191c]/80 backdrop-blur-md border border-[#66696e] p-5 flex flex-col justify-between text-left
                     transition-colors hover:bg-[#0e0f11]/90"
        >
          {/* decorative icon */}
          <PackageOpen className="pointer-events-none absolute -right-6 -bottom-6 h-40 w-40 text-white/[0.04]" strokeWidth={1.25} />
          <div className="relative">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-semibold tracking-[-0.5px] text-white">
                Dropshipping
              </h2>
              <span
                className="font-grotesk text-xs inline-block uppercase px-1.5 rounded-sm font-bold -skew-x-12 text-white"
                style={{ backgroundImage: 'radial-gradient(39.71% 136.54% at 51.64% 117.31%, #F920D1 0%, #ED1572 100%)' }}
              >
                Trending
              </span>
            </div>
            <p className="mt-3 max-w-[280px] text-sm text-[#898a8b] leading-relaxed">
              Prodávejte bez skladu — zákazník objedná u vás, my zabalíme a odešleme pod vaší značkou.
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
                className="group relative overflow-hidden rounded-2xl min-h-[126px] p-5 gap-3
                           bg-[#17191c]/80 backdrop-blur-md border border-[#66696e] flex flex-col items-start justify-between text-left
                           transition-colors hover:bg-[#0e0f11]/90"
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
