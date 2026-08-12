import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, ArrowRight, ChevronRight, Sparkles, ShieldCheck, Timer, EyeOff, Percent, Check,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { GoBigDealLogo } from '@/components/GoBigDealLogo';
import { openCreateDealDialog } from '@/components/deals/CreateDealDialog';

/* Reusable footer link column */
function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#999999] mb-4">{title}</p>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}
function FLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-[#b3b3b3] hover:text-white transition-colors">{children}</Link>
    </li>
  );
}

/**
 * Patička homepage — pivotovaná na GoBigDeal (P2P burza velkoobchodních
 * dealů). Anglicky jako zbytek stránky; sloupce vedou jen na živé části
 * platformy (dealy, prodej, MyDeal, podpora). Trust pás opakuje čtyři
 * pravidla ze sekce The rules — žádné počty značek ani staré B2B claimy.
 */
export function HomeFooter() {
  const navigate = useNavigate();
  const { setGatewayOpen } = useStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    setSent(true);
  };

  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[#00050d] text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* ── Deal drop alert — nejnižší schod konverze i v patičce ── */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-3">Deal drop alerts</p>
            <h2 className="font-sans font-extralight tracking-tight leading-tight text-2xl sm:text-3xl md:text-4xl mb-3">
              One email when a deal drops.
            </h2>
            <p className="text-[#b3b3b3] text-sm sm:text-base leading-relaxed max-w-md">
              Free forever. No spam, no newsletter — a deal goes live and you know about it.
            </p>
          </div>

          <div>
            {sent ? (
              <div className="flex items-center gap-3 rounded-none border border-emerald-500/40 bg-emerald-500/10 px-5 py-4">
                <Check className="h-5 w-5 text-emerald-400 shrink-0" strokeWidth={3} />
                <p className="text-sm text-white/90">Done — the next drop lands in your inbox.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full h-12 pl-10 pr-4 rounded-none bg-white/5 border border-[#66696e] text-sm text-white placeholder:text-[#777] focus:outline-none focus:border-white/60 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 px-6 rounded-none bg-white text-zinc-900 font-semibold text-sm hover:bg-white/90 transition-colors shrink-0 inline-flex items-center justify-center gap-1.5"
                >
                  Get alerts <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => setGatewayOpen(true)}
              className="mt-4 group inline-flex items-center gap-2 text-sm text-[#b3b3b3] hover:text-white transition-colors"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Rather ask first? Talk to the AI advisor
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Sitemap columns ── */}
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10">
        {/* Brand block */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <button onClick={() => navigate('/')} className="select-none" aria-label="GoBigDeal — home">
            <GoBigDealLogo className="text-2xl text-white" />
          </button>
          <p className="text-[#999999] text-sm leading-relaxed mt-3 max-w-xs">
            The peer-to-peer exchange for wholesale closeout deals. Verified traders,
            sealed identities, one deadline per deal.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-white text-zinc-900 px-4 py-2.5 text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Get B2B access <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <FooterCol title="Deals">
          <FLink to="/deals">Browse deals</FLink>
          <FLink to="/wantdeal">Want Deals</FLink>
          <FLink to="/splitdeal">Split Deals</FLink>
          <FLink to="/#gbd-pricing">Early Access</FLink>
        </FooterCol>

        <FooterCol title="Sell">
          <li>
            <button
              type="button"
              onClick={() => openCreateDealDialog()}
              className="text-[#b3b3b3] hover:text-white transition-colors"
            >
              Post a BigDeal
            </button>
          </li>
          <FLink to="/my-deals">My deals</FLink>
          <FLink to="/register">B2B registration</FLink>
          <FLink to="/login">Sign in</FLink>
        </FooterCol>

        <FooterCol title="MyDeal">
          <FLink to="/orders">My orders</FLink>
          <FLink to="/alerts">Deal alerts</FLink>
          <FLink to="/favorites">Saved products</FLink>
          <FLink to="/ucet">Account settings</FLink>
        </FooterCol>

        <FooterCol title="Connect">
          <FLink to="/feed">Product feed</FLink>
          <FLink to="/feed?to=mcp">MCP Server</FLink>
          <li><button onClick={() => setGatewayOpen(true)} className="text-[#b3b3b3] hover:text-white transition-colors">AI advisor 24/7</button></li>
          <li><a href="mailto:info@swelt.cz" className="text-[#b3b3b3] hover:text-white transition-colors">info@swelt.cz</a></li>
        </FooterCol>
      </div>

      {/* ── Trust strip — stejná čtyři pravidla jako sekce The rules ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[#999999] text-sm">
          {[
            { icon: ShieldCheck, t: 'Verified trade accounts' },
            { icon: Percent, t: '0.5 % per deal. Nothing else.' },
            { icon: Timer, t: 'Honest timers' },
            { icon: EyeOff, t: 'Anonymous by design' },
          ].map(({ icon: Icon, t }) => (
            <span key={t} className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4 text-[#66696e]" /> {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#777]">
          <div>© {year} GoBigDeal — the B2B deal exchange</div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
