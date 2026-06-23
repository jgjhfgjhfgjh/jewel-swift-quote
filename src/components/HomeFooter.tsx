import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, ArrowRight, ChevronRight, Sparkles, ShieldCheck, Truck, Award, Package, Star, Check,
} from 'lucide-react';
import { useStore } from '@/lib/store';

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

      {/* ── Newsletter / DEAL alert + AI poradce ── */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-3">DEAL alert</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight mb-3">
              Closeout nabídky uvidíte první.
            </h2>
            <p className="text-[#b3b3b3] text-sm sm:text-base leading-relaxed max-w-md">
              Výprodeje skladových zásob a časově omezené slevy posíláme partnerům dřív, než zmizí. Žádný spam — jen příležitosti.
            </p>
          </div>

          <div>
            {sent ? (
              <div className="flex items-center gap-3 rounded-none border border-emerald-500/40 bg-emerald-500/10 px-5 py-4">
                <Check className="h-5 w-5 text-emerald-400 shrink-0" strokeWidth={3} />
                <p className="text-sm text-white/90">Hotovo — díky! Nejlepší nabídky vám dorazí do schránky.</p>
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
                    placeholder="vas@email.cz"
                    className="w-full h-12 pl-10 pr-4 rounded-none bg-white/5 border border-[#66696e] text-sm text-white placeholder:text-[#777] focus:outline-none focus:border-white/60 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 px-6 rounded-none bg-white text-zinc-900 font-semibold text-sm hover:bg-white/90 transition-colors shrink-0 inline-flex items-center justify-center gap-1.5"
                >
                  Odebírat <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => setGatewayOpen(true)}
              className="mt-4 group inline-flex items-center gap-2 text-sm text-[#b3b3b3] hover:text-white transition-colors"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Raději se zeptat? Spusťte AI poradce
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Sitemap columns ── */}
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10">
        {/* Brand block */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <button onClick={() => navigate('/')} className="font-spartan font-extrabold text-3xl tracking-tighter leading-none select-none" style={{ letterSpacing: '-0.05em' }}>
            swelt.
          </button>
          <p className="text-[#999999] text-sm leading-relaxed mt-3 max-w-xs">
            Velkoobchod prémiových hodinek a šperků. 70+ značek, ceny od 1 kusu, doručení po celé EU.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-white text-zinc-900 px-4 py-2.5 text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            B2B registrace zdarma <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <FooterCol title="Katalog">
          <FLink to="/brands">Všechny značky</FLink>
          <FLink to="/brands?cat=watches">Hodinky</FLink>
          <FLink to="/brands?cat=jewelry">Šperky</FLink>
          <FLink to="/deals">DEAL nabídky</FLink>
        </FooterCol>

        <FooterCol title="Služby">
          <FLink to="/velkoobchod">B2B Velkoobchod</FLink>
          <FLink to="/dropshipping">Dropshipping</FLink>
          <FLink to="/feed">Automatický feed</FLink>
          <FLink to="/shop">E-shop do 48 h</FLink>
          <FLink to="/luxury">Nákup bez registrace</FLink>
        </FooterCol>

        <FooterCol title="Pro partnery">
          <FLink to="/register">Registrace</FLink>
          <FLink to="/login">Přihlášení</FLink>
          <FLink to="/partner">Partner Hub</FLink>
        </FooterCol>

        <FooterCol title="Podpora">
          <li><button onClick={() => setGatewayOpen(true)} className="text-[#b3b3b3] hover:text-white transition-colors">AI poradce 24/7</button></li>
          <li><a href="mailto:info@swelt.cz" className="text-[#b3b3b3] hover:text-white transition-colors">info@swelt.cz</a></li>
          <FLink to="/velkoobchod">Doručení &amp; platby</FLink>
          <FLink to="/partner">Account manager</FLink>
        </FooterCol>
      </div>

      {/* ── Trust strip ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[#999999] text-sm">
          {[
            { icon: ShieldCheck, t: '100% garance pravosti' },
            { icon: Truck, t: 'Doručení do EU 72 h' },
            { icon: Award, t: '15+ let na trhu' },
            { icon: Package, t: '3 000+ produktů' },
            { icon: Star, t: '70+ značek' },
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
          <div>© {year} swelt. — Velkoobchod hodinek a šperků</div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-white transition-colors">Obchodní podmínky</a>
            <a href="#" className="hover:text-white transition-colors">Ochrana údajů</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
