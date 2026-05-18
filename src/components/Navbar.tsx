import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShoppingCart, Menu, LogOut, Users, Search, Heart, User, Globe, X, Home, Info, Briefcase, Phone, BookOpen, LayoutDashboard, Flame, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { translations, flags, langNames, ALL_LANGS, type Lang } from '@/lib/i18n';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { AuthModal } from '@/components/AuthModal';
import { RotatingSuffix } from '@/components/GatewaySections';

const SUFFIX_WORDS = ['PARTNER', 'EU', 'DROPSHIPPING', 'FEED', 'DEAL'];

interface NavbarProps {
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  whiteLogo?: boolean;
}

const HOME_NAV_ITEMS = [
  { path: '/deals',        label: 'DEAL nabídky' },
  { path: '/velkoobchod', label: 'Velkoobchod' },
  { path: '/luxury',      label: 'Nákup bez registrace' },
  { path: '/feed',        label: 'Feed' },
  { path: '/dropshipping',label: 'Dropshipping' },
  { path: '/shop',        label: 'E-shop do 48h' },
  { path: '/support',     label: 'Support' },
];

type NavPanelCol = { title: string; links: { label: string; desc: string; path: string }[] };
type NavPanel = { heading: string; desc: string; cols: NavPanelCol[]; cta: { label: string; path: string } };

const NAV_PANELS: Record<string, NavPanel> = {
  '/deals': {
    heading: 'DEAL nabídky',
    desc: 'Časově omezené akce na prémiové hodinky a šperky za výjimečné ceny.',
    cols: [
      { title: 'Kategorie', links: [
        { label: 'Hodinky', desc: 'Luxusní a sportovní hodinky ve slevě', path: '/deals' },
        { label: 'Šperky', desc: 'Náhrdelníky, náramky, prsteny', path: '/deals' },
        { label: 'Dárkové sady', desc: 'Kompletní sety za speciální cenu', path: '/deals' },
      ]},
      { title: 'Aktuální akce', links: [
        { label: 'Tommy Hilfiger', desc: 'DEAL: −60 % z MOC', path: '/deals' },
        { label: 'Versace', desc: 'DEAL: −55 % z MOC', path: '/deals' },
        { label: 'Hugo Boss', desc: 'DEAL: −58 % z MOC', path: '/deals' },
      ]},
    ],
    cta: { label: 'Zobrazit všechny DEAL nabídky', path: '/deals' },
  },
  '/velkoobchod': {
    heading: 'B2B Velkoobchod',
    desc: '3 000+ produktů prémiových značek za velkoobchodní ceny. Přístup po schválení.',
    cols: [
      { title: 'Katalog', links: [
        { label: 'Hodinky 70+ značek', desc: 'Tommy Hilfiger, Versace, Seiko…', path: '/velkoobchod' },
        { label: 'Šperky & doplňky', desc: 'Swarovski, Pandora, Morellato…', path: '/velkoobchod' },
        { label: 'Slevy 40–65 %', desc: 'Velkoobchodní ceny od 1 kusu', path: '/velkoobchod' },
      ]},
      { title: 'Pro firmy', links: [
        { label: 'B2B registrace', desc: 'Schválení do 24 hodin, zdarma', path: '/register' },
        { label: 'Firemní dárky', desc: 'Zakázkové sestavy pro celé týmy', path: '/luxury' },
        { label: 'Individuální ceny', desc: 'Pro větší odběry kontaktujte nás', path: '/support' },
      ]},
    ],
    cta: { label: 'Vstoupit do velkoobchodu', path: '/velkoobchod' },
  },
  '/luxury': {
    heading: 'Nákup bez registrace',
    desc: 'Velkoobchodní ceny pro soukromé osoby i firmy. Bez B2B účtu, od 1 kusu.',
    cols: [
      { title: 'Výhody', links: [
        { label: 'Bez registrace', desc: 'Stačí IČO nebo soukromá osoba', path: '/luxury' },
        { label: 'Diskrétní balení', desc: 'Zásilka bez označení odesílatele', path: '/luxury' },
        { label: 'EU doručení', desc: 'Doručení do 15+ zemí Evropy', path: '/luxury' },
      ]},
      { title: 'Oblíbené značky', links: [
        { label: 'Tommy Hilfiger', desc: 'od 1 790 Kč', path: '/luxury' },
        { label: 'Versace', desc: 'od 2 890 Kč', path: '/luxury' },
        { label: 'Swarovski', desc: 'od 990 Kč', path: '/luxury' },
      ]},
    ],
    cta: { label: 'Prohlédnout nabídku', path: '/luxury' },
  },
  '/feed': {
    heading: 'Produktový Feed',
    desc: 'Automatický XML/CSV feed s 3 000+ produkty. 4× denně aktualizace cen a dostupnosti.',
    cols: [
      { title: 'Formáty', links: [
        { label: 'XML / Heureka', desc: 'Přímá integrace s Heureka.cz', path: '/feed' },
        { label: 'Zbozi.cz', desc: 'Kompatibilní formát pro Zbozi.cz', path: '/feed' },
        { label: 'Google Shopping', desc: 'Google Merchant Center feed', path: '/feed' },
        { label: 'CSV / vlastní', desc: 'Flexibilní formát na míru', path: '/feed' },
      ]},
      { title: 'Vlastnosti', links: [
        { label: '4× denně aktualizace', desc: 'Ceny a dostupnost v reálném čase', path: '/feed' },
        { label: 'Automatická sync', desc: 'Bez manuálního zásahu', path: '/feed' },
        { label: 'API přístup', desc: 'Přímé napojení na váš systém', path: '/feed' },
      ]},
    ],
    cta: { label: 'Zjistit více o feedu', path: '/feed' },
  },
  '/dropshipping': {
    heading: 'Dropshipping',
    desc: 'Prodávejte bez skladu. Zákazník objedná u vás — my zabalíme a odešleme.',
    cols: [
      { title: 'Jak to funguje', links: [
        { label: 'Zákazník objedná', desc: 'Na vašem e-shopu nebo platformě', path: '/dropshipping' },
        { label: 'Swelt zabalí', desc: 'Pod vaší značkou, s vaší fakturou', path: '/dropshipping' },
        { label: 'Doručení 24–48 h', desc: 'Do celé EU, bez výjimky', path: '/dropshipping' },
      ]},
      { title: 'Výhody', links: [
        { label: '0 Kč do skladu', desc: 'Platíte až po prodeji', path: '/dropshipping' },
        { label: '60 % průměrná marže', desc: 'Přímé velkoobchodní ceny', path: '/dropshipping' },
        { label: 'EU expanze', desc: 'Prodávejte do 15+ zemí bez poboček', path: '/dropshipping' },
      ]},
    ],
    cta: { label: 'Chci dropshipping', path: '/dropshipping' },
  },
  '/shop': {
    heading: 'E-shop do 48 hodin',
    desc: 'Hotový e-shop naplněný 3 000+ produkty. Spuštění do 48 hodin, žádné zkušenosti nepotřebujete.',
    cols: [
      { title: 'Co dostanete', links: [
        { label: 'Hotový e-shop', desc: 'Design, hosting, produkty — vše v jednom', path: '/shop' },
        { label: 'Automatický feed', desc: 'Produkty se synchronizují samy', path: '/shop' },
        { label: 'Platební brána', desc: 'Integrace s oblíbenými systémy', path: '/shop' },
      ]},
      { title: 'Technologie', links: [
        { label: 'Shopify / WooCommerce', desc: 'Váš výběr platformy', path: '/shop' },
        { label: 'SEO optimalizace', desc: 'Připraveno pro vyhledávače', path: '/shop' },
        { label: 'Mobilní design', desc: 'Responzivní na všech zařízeních', path: '/shop' },
      ]},
    ],
    cta: { label: 'Chci svůj e-shop', path: '/shop' },
  },
  '/support': {
    heading: 'Podpora & Kontakt',
    desc: 'Jsme tu pro vás. Odpovíme do 24 hodin v pracovní dny. AI asistent dostupný 24/7.',
    cols: [
      { title: 'Kontakt', links: [
        { label: 'E-mail podpora', desc: 'info@swelt.cz', path: '/support' },
        { label: 'Živý AI chat', desc: 'Odpověď do 5 vteřin, 24/7', path: '/support' },
        { label: 'Account manager', desc: 'Osobní péče, telefonická konzultace', path: '/support' },
      ]},
      { title: 'Zdroje', links: [
        { label: 'Časté dotazy (FAQ)', desc: 'Odpovědi na nejčastější otázky', path: '/support' },
        { label: 'Technická dokumentace', desc: 'Feed API a integrace', path: '/support' },
        { label: 'Obchodní podmínky', desc: 'GDPR a podmínky spolupráce', path: '/support' },
      ]},
    ],
    cta: { label: 'Kontaktovat podporu', path: '/support' },
  },
};

// ── AI tools for the "Zeptej se AI" mega panel ───────────────────────────
const SWELT_QUERY = encodeURIComponent(
  'Co je SWELT.PARTNER? Jak funguje dropshipping a B2B velkoobchod s hodinkami a šperky v EU?'
);
const AI_TOOLS = [
  {
    name: 'ChatGPT',
    favicon: 'chatgpt.com',
    url: `https://chatgpt.com/?q=${SWELT_QUERY}`,
    hint: 'Připravený dotaz',
  },
  {
    name: 'Claude',
    favicon: 'claude.ai',
    url: `https://claude.ai/new?q=${SWELT_QUERY}`,
    hint: 'Připravený dotaz',
  },
  {
    name: 'Perplexity',
    favicon: 'perplexity.ai',
    url: `https://www.perplexity.ai/search?q=${SWELT_QUERY}`,
    hint: 'Prohledá web',
  },
  {
    name: 'Gemini',
    favicon: 'gemini.google.com',
    url: 'https://gemini.google.com/app',
    hint: 'Google AI',
  },
  {
    name: 'DeepSeek',
    favicon: 'deepseek.com',
    url: 'https://chat.deepseek.com',
    hint: 'Čínský model',
  },
];

// Map Lang code -> ISO 3166-1 alpha-2 country code for flagcdn.com
// (emoji 🇨🇿 etc. don't render on Windows — use bitmap fallback)
const LANG_TO_COUNTRY: Record<string, string> = {
  cs: 'cz', sk: 'sk', pl: 'pl', de: 'de', en: 'gb', fr: 'fr',
  es: 'es', it: 'it', nl: 'nl', pt: 'pt', hu: 'hu', ro: 'ro',
  sv: 'se', da: 'dk', fi: 'fi', no: 'no', el: 'gr', is: 'is',
};

function FlagImg({ lang, className = '' }: { lang: string; className?: string }) {
  const code = LANG_TO_COUNTRY[lang] || lang;
  return (
    <img
      src={`https://flagcdn.com/24x18/${code}.png`}
      srcSet={`https://flagcdn.com/48x36/${code}.png 2x`}
      width={20}
      height={15}
      alt=""
      className={`inline-block rounded-[2px] shrink-0 object-cover ${className}`}
    />
  );
}

export function Navbar({ wishlistCount = 0, onOpenWishlist, whiteLogo = false }: NavbarProps) {
  const { lang, setLang, cart, setCartOpen, setSidebarOpen, search, setSearch, salesCustomer, clearSalesMode, setViewMode, viewMode, setGatewayOpen } = useStore();
  const { user, profile, isAdmin, isB2bApproved, signOut, loading } = useAuthContext();
  const t = translations[lang];
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const navigate = useNavigate();
  const location = useLocation();

  const showSearch = location.pathname === '/' && viewMode === 'catalog';

  const [hidden, setHidden] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'b2b'>('login');
  const [activeNav, setActiveNav] = useState<string | null>(null);

  const openAuth = (tab: 'login' | 'register' | 'b2b') => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  const handleCatalogCta = () => {
    if (user) {
      setViewMode('catalog');
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      openAuth('login');
    }
  };

  const lastScrollY = useRef(0);
  const navCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const menuOpenRef = useRef(false);
  // Actual rendered navbar height — drives where the menu drawer starts.
  const [headerHeight, setHeaderHeight] = useState(0);
  const isHome = viewMode === 'home';
  const isOnHomePage = location.pathname === '/';

  // Sync isAtTop when switching back to home view
  useEffect(() => {
    if (isHome) setIsAtTop(window.scrollY < 60);
  }, [isHome]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsAtTop(y < 60);
      // Hide on scroll down, show on scroll up — but never while the menu is
      // open, so the drawer keeps starting flush against the navbar.
      setHidden(!menuOpenRef.current && y > lastScrollY.current && y > 50);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Track the real navbar height so the menu drawer can start exactly below it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => setHeaderHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep the navbar pinned (visible) the whole time the menu is open.
  useEffect(() => {
    menuOpenRef.current = menuOpen;
    if (menuOpen) {
      setHidden(false);
      setHeaderHeight(headerRef.current?.offsetHeight ?? 0);
    }
  }, [menuOpen]);

  // Close mega-menu on Escape or when navbar hides on scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveNav(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { if (hidden) setActiveNav(null); }, [hidden]);

  const handleNavEnter = (path: string) => {
    if (navCloseTimer.current) clearTimeout(navCloseTimer.current);
    setActiveNav(path);
  };

  const handleNavLeave = () => {
    navCloseTimer.current = setTimeout(() => setActiveNav(null), 120);
  };

  const handlePanelEnter = () => {
    if (navCloseTimer.current) clearTimeout(navCloseTimer.current);
  };

  const handlePanelLeave = () => {
    navCloseTimer.current = setTimeout(() => setActiveNav(null), 120);
  };

  const handleLogout = async () => {
    await signOut();
    setViewMode('home');
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <>
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out
        ${hidden ? '-translate-y-full' : 'translate-y-0'}
        border-b border-white/25
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.38) 50%, rgba(255,255,255,0.46) 100%)',
        backdropFilter: 'blur(32px) saturate(190%)',
        WebkitBackdropFilter: 'blur(32px) saturate(190%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), 0 4px 28px rgba(0,0,0,0.07)',
      }}
    >
      {/* ── Row 1: mobile = h-14, hamburger + small left logo; desktop = h-24, hamburger + centered big logo ── */}
      <div className="relative h-14 sm:h-24 pl-2 pr-1 sm:px-4 flex items-center justify-between gap-1 sm:gap-2">

        {/* Desktop logo — absolute centered, bottom-aligned with space above */}
        <Link
          to="/"
          onClick={() => { setViewMode('home'); setGatewayOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="hidden sm:flex absolute left-1/2 bottom-3 -translate-x-1/2 items-baseline gap-1.5 select-none pointer-events-auto"
          aria-label="swelt.PARTNER — domů"
        >
          <span
            className={`font-spartan font-extrabold text-5xl sm:text-6xl leading-none tracking-tighter ${whiteLogo ? 'text-white' : 'text-foreground'}`}
            style={{ letterSpacing: '-0.05em' }}
          >swelt.</span>
          <span className="relative inline-block">
            {/* Width placeholder = PARTNER for stable layout */}
            <span aria-hidden className={`invisible font-sans font-extrabold text-base sm:text-lg leading-none tracking-tight whitespace-nowrap ${whiteLogo ? 'text-white' : 'text-foreground'}`}>PARTNER</span>
            <span className={`absolute left-0 top-0 font-sans font-extrabold text-base sm:text-lg leading-none tracking-tight ${whiteLogo ? 'text-white' : 'text-foreground'}`}>
              <RotatingSuffix words={SUFFIX_WORDS} />
            </span>
          </span>
        </Link>

        {/* Left: hamburger + (mobile-only inline logo) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0 relative z-10">
          <Button
            ref={desktopMenuButtonRef}
            variant="ghost"
            size="icon"
            className="shrink-0 relative z-[110] cursor-pointer pointer-events-auto"
            onPointerDown={(e) => {
              e.preventDefault();
              setMenuOpen((v) => !v);
            }}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Globe / Language switcher — desktop only, next to hamburger */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex shrink-0 items-center gap-1.5 h-9 px-2.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold uppercase tracking-wide"
                title="Jazyk"
              >
                <Globe className="h-4 w-4" />
                <span>{lang}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="w-44 max-h-[60vh] overflow-y-auto z-[105]">
              {ALL_LANGS.map((l) => (
                <DropdownMenuItem
                  key={l}
                  onClick={() => setLang(l)}
                  className={`gap-2 text-sm cursor-pointer ${l === lang ? 'bg-accent/40 font-semibold' : ''}`}
                >
                  <FlagImg lang={l} />
                  <span>{langNames[l]}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile logo — small, inline left, hidden on sm+ */}
          <Link
            to="/"
            onClick={() => { setViewMode('home'); setGatewayOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="sm:hidden flex items-baseline select-none ml-0.5"
            aria-label="swelt.PARTNER — domů"
          >
            <span
              className={`font-spartan font-extrabold text-2xl leading-none tracking-tighter ${whiteLogo ? 'text-white' : 'text-foreground'}`}
              style={{ letterSpacing: '-0.05em' }}
            >swelt.</span>
            {/* Suffix — inline, 3.0× ratio (24/8), items-baseline aligns its baseline with swelt's dot */}
            <span className={`font-sans font-extrabold text-[8px] tracking-tight ml-0.5 ${whiteLogo ? 'text-white' : 'text-foreground'}`}>
              <RotatingSuffix words={SUFFIX_WORDS} />
            </span>
          </Link>

          {/* Partner Hub — for dropshipping partners and admins */}
          {!loading && user && (isB2bApproved || isAdmin) && (
            <button
              onClick={() => navigate('/partner')}
              title="Partner Hub"
              className="dropshipping-hub-btn group hidden sm:inline-flex shrink-0 items-center gap-2 ml-2 h-9 px-3.5 rounded-lg text-xs font-semibold border transition-all duration-200"
            >
              <LayoutDashboard className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="hidden md:inline">Partner Hub</span>
            </button>
          )}
        </div>

        {/* Right: icons + CTA — always visible */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 relative z-10">

          {!loading && user ? (
            <>
              {/* Partner Hub icon — mobile only (left-side button is hidden below sm) */}
              {(isB2bApproved || isAdmin) && (
                <button
                  onClick={() => navigate('/partner')}
                  title="Partner Hub"
                  className="dropshipping-hub-btn sm:hidden inline-flex shrink-0 items-center justify-center h-9 w-9 rounded-lg border transition-all duration-200"
                >
                  <LayoutDashboard className="h-4 w-4" />
                </button>
              )}

              {showSearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden shrink-0"
                  onClick={() => setMobileSearchOpen((v) => !v)}
                  title={t.search}
                >
                  {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="relative hidden lg:inline-flex"
                onClick={() => navigate('/favorites')}
                title={isAdmin && salesCustomer ? `Oblíbené zákazníka: ${salesCustomer.company_name}` : 'Oblíbené'}
              >
                <Heart className={`h-5 w-5 ${wishlistCount > 0 ? 'fill-zinc-900 text-zinc-900' : ''}`} />
                {wishlistCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>

              <Button variant="ghost" size="icon" className="relative hidden lg:inline-flex" onClick={() => setCartOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white">
                    {totalItems}
                  </Badge>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1 sm:gap-1.5 text-xs px-1.5 sm:px-2 ${isAdmin && salesCustomer ? 'border border-zinc-300 bg-zinc-50' : ''}`}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden xl:inline max-w-[120px] truncate">
                      {isAdmin && salesCustomer ? salesCustomer.company_name : (profile?.company_name || 'Účet')}
                    </span>
                    {isAdmin && salesCustomer && (
                      <Badge className="ml-1 h-4 px-1 text-[8px] bg-zinc-900 text-white">Sales</Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {isAdmin && salesCustomer ? (
                    <>
                      <div className="px-3 py-2 border-b border-zinc-200 bg-zinc-50">
                        <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Režim nabídky</p>
                        <p className="text-sm font-semibold">{salesCustomer.company_name}</p>
                        {salesCustomer.ico && <p className="text-xs text-muted-foreground">IČO: {salesCustomer.ico}</p>}
                        {salesCustomer.base_discount > 0 && (
                          <p className="text-xs text-zinc-700 font-semibold mt-0.5">Sleva: {salesCustomer.base_discount}%</p>
                        )}
                      </div>
                      <DropdownMenuItem onClick={() => navigate('/customers')} className="gap-2 text-xs">
                        <Users className="h-3.5 w-3.5" /> Správa zákazníků
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                          <Globe className="h-3 w-3" /> Jazyk
                        </p>
                        <select
                          value={lang}
                          onChange={(e) => setLang(e.target.value as Lang)}
                          className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {ALL_LANGS.map((l) => (
                            <option key={l} value={l}>
                              {langNames[l]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => clearSalesMode()} className="gap-2 text-xs text-destructive font-semibold">
                        <LogOut className="h-3.5 w-3.5" /> Ukončit režim nabídky
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2 border-b">
                        <p className="text-sm font-semibold">{profile?.company_name || 'Zákazník'}</p>
                        {profile?.ico && <p className="text-xs text-muted-foreground">IČO: {profile.ico}</p>}
                        {profile && profile.base_discount > 0 && (
                          <p className="text-xs text-zinc-700 font-semibold mt-0.5">Sleva: {profile.base_discount}%</p>
                        )}
                      </div>
                      {isAdmin && (
                        <>
                          <DropdownMenuItem onClick={() => navigate('/customers')} className="gap-2 text-xs">
                            <Users className="h-3.5 w-3.5" /> Správa zákazníků
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <div className="px-2 py-1.5">
                        <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                          <Globe className="h-3 w-3" /> Jazyk
                        </p>
                        <select
                          value={lang}
                          onChange={(e) => setLang(e.target.value as Lang)}
                          className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {ALL_LANGS.map((l) => (
                            <option key={l} value={l}>
                              {langNames[l]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="gap-2 text-xs text-destructive">
                        <LogOut className="h-3.5 w-3.5" /> Odhlásit se
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : !loading ? (
            <>
              {/* White CTA — Přihlásit (guests) */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => openAuth('login')}
                className="h-8 sm:h-9 px-2 sm:px-4 rounded-lg font-bold tracking-wide text-[11px] sm:text-sm text-foreground bg-white hover:bg-zinc-100 border border-border transition-all hover:-translate-y-0.5 shrink-0"
              >
                Přihlásit
              </Button>
            </>
          ) : null}

          {/* CTA — KATALOG 2026 (logged in) / Vytvořit účet (guests) — always far right.
              Skryjeme když už uživatel je v katalogu (na homepage v catalog módu). */}
          {!(user && viewMode === 'catalog' && isOnHomePage) && (
            <Button
              size="sm"
              onClick={user ? handleCatalogCta : () => openAuth('b2b')}
              className="h-8 sm:h-9 px-2 sm:px-4 rounded-lg font-semibold tracking-wide text-[11px] sm:text-sm text-white bg-zinc-900 hover:bg-zinc-800 transition-all hover:-translate-y-0.5 shrink-0"
            >
              {user ? 'KATALOG 2026' : 'B2B registrace'}
            </Button>
          )}
        </div>
      </div>

      {/* ── Row 2: nav links (home) OR search (catalog) — desktop only ── */}
      {(showSearch || (isOnHomePage && isHome)) && (
        <div className="hidden lg:flex h-10 px-4 items-center justify-center">
          {showSearch ? (
            <div className="relative w-full max-w-[500px] lg:max-w-[600px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t.search}
                value={search}
                onChange={(e) => { setSearch(e.target.value); }}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          ) : (
            <nav className="flex items-center gap-0.5">
              {HOME_NAV_ITEMS.map(({ path, label }) => (
                <button
                  key={path}
                  onMouseEnter={() => handleNavEnter(path)}
                  onMouseLeave={handleNavLeave}
                  className={`flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    activeNav === path
                      ? 'text-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {label}
                  <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-200 ${activeNav === path ? 'rotate-180' : ''}`} />
                </button>
              ))}

              {/* ── AI panel trigger ── */}
              <button
                onMouseEnter={() => handleNavEnter('/ai')}
                onMouseLeave={handleNavLeave}
                className={`flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium transition-colors ml-1 ${
                  activeNav === '/ai'
                    ? 'text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Zeptej se AI
                <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-200 ${activeNav === '/ai' ? 'rotate-180' : ''}`} />
              </button>
            </nav>
          )}
        </div>
      )}

      {/* Mobile search expansion — catalog mode only */}
      {showSearch && mobileSearchOpen && (
        <div className="lg:hidden px-3 pb-2 pt-1 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 animate-fade-in">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t.search}
              value={search}
              autoFocus
              onChange={(e) => { setSearch(e.target.value); if (e.target.value.trim()) { setViewMode('catalog'); setMobileSearchOpen(false); } }}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>
      )}
    </header>

    {/* ── Mega-menu panel — overlaps hero, desktop only ── */}
    {activeNav && NAV_PANELS[activeNav] && (() => {
      const panel = NAV_PANELS[activeNav];
      return (
        <>
          {/* Panel */}
          <div
            className="fixed left-0 right-0 z-[95] bg-white border-b border-zinc-200 shadow-2xl hidden lg:block"
            style={{ top: headerHeight }}
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
          >
            <div className="mx-auto max-w-5xl px-6 py-8">
              <div className="grid grid-cols-[1fr_auto] gap-8 items-start">
                {/* Left: heading + desc + CTA */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">swelt.PARTNER</p>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-1.5">{panel.heading}</h3>
                  <p className="text-sm text-zinc-500 mb-5 max-w-xs leading-relaxed">{panel.desc}</p>
                  <button
                    onClick={() => { setActiveNav(null); navigate(panel.cta.path); }}
                    className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    {panel.cta.label} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Right: columns of links */}
                <div className="flex gap-10">
                  {panel.cols.map((col) => (
                    <div key={col.title} className="min-w-[180px]">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">{col.title}</p>
                      <ul className="space-y-1">
                        {col.links.map((link) => (
                          <li key={link.label}>
                            <button
                              onClick={() => { setActiveNav(null); navigate(link.path); }}
                              className="group flex flex-col text-left w-full rounded-lg px-2 py-2 hover:bg-zinc-50 transition-colors"
                            >
                              <span className="text-sm font-medium text-zinc-800 group-hover:text-zinc-900">{link.label}</span>
                              <span className="text-[11px] text-zinc-400 leading-tight">{link.desc}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      );
    })()}

    {/* ── AI panel ── */}
    {activeNav === '/ai' && (
      <div
        className="fixed left-0 right-0 z-[95] bg-white border-b border-zinc-200 shadow-2xl hidden lg:block"
        style={{ top: headerHeight }}
        onMouseEnter={handlePanelEnter}
        onMouseLeave={handlePanelLeave}
      >
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="grid grid-cols-[1fr_auto] gap-8 items-start">
            {/* Left: heading + desc + CTA */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">swelt.PARTNER</p>
              <h3 className="text-xl font-semibold text-zinc-900 mb-1.5">Zeptej se AI na SWELT.PARTNER</h3>
              <p className="text-sm text-zinc-500 mb-5 max-w-xs leading-relaxed">
                Jedním klikem otevřete váš oblíbený AI nástroj s připraveným dotazem o nabídce, dropshippingu nebo doručování.
              </p>
              <a
                href={AI_TOOLS[0].url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActiveNav(null)}
                className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Otevřít ChatGPT <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Right: AI tool list — same compact style as nav link columns */}
            <div className="min-w-[200px]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">AI nástroje</p>
              <ul className="space-y-0.5">
                {AI_TOOLS.map((tool) => (
                  <li key={tool.name}>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setActiveNav(null)}
                      className="group flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-zinc-50 transition-colors"
                    >
                      <img
                        src={`https://www.google.com/s2/favicons?sz=32&domain=${tool.favicon}`}
                        alt={tool.name}
                        width={16}
                        height={16}
                        className="w-4 h-4 rounded shrink-0"
                      />
                      <span className="text-sm font-medium text-zinc-800 group-hover:text-zinc-900 w-24">{tool.name}</span>
                      <span className="text-[11px] text-zinc-400 leading-tight">{tool.hint}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Desktop navigation sheet */}
    <Sheet open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
      <SheetContent
        side="left"
        className="flex flex-col w-72 p-0 z-[95]"
        style={{ top: headerHeight, height: `calc(100dvh - ${headerHeight}px)` }}
        onInteractOutside={(e) => {
          if (desktopMenuButtonRef.current?.contains(e.target as Node)) {
            e.preventDefault();
          }
        }}
      >
        <SheetHeader className="px-4 py-4 border-b shrink-0">
          <SheetTitle className="text-left">Nabídka</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-1 min-h-0 flex-col overflow-y-auto py-2">
          {/* Primary services */}
          {HOME_NAV_ITEMS.map(({ path, label }) => (
            <button
              key={path}
              onClick={() => { setMenuOpen(false); navigate(path); }}
              className="flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-zinc-50 transition-colors"
            >
              {label}
              <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
            </button>
          ))}

          {/* AI — external links, listed inline */}
          <div className="px-4 py-3 border-t border-zinc-100 mt-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2.5">Zeptej se AI na swelt</p>
            <div className="flex flex-wrap gap-2">
              {AI_TOOLS.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors"
                >
                  <img
                    src={`https://www.google.com/s2/favicons?sz=32&domain=${tool.favicon}`}
                    alt=""
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 rounded"
                  />
                  {tool.name}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t my-2" />

          {isHome ? (
            <>
              <button onClick={() => { setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
                <Info className="h-4 w-4 text-muted-foreground" /> O nás
              </button>
              <button onClick={() => { setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
                <Briefcase className="h-4 w-4 text-muted-foreground" /> Naše služby
              </button>
              <button onClick={() => { setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
                <Phone className="h-4 w-4 text-muted-foreground" /> Kontakt
              </button>
              <button onClick={() => { setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
                <BookOpen className="h-4 w-4 text-muted-foreground" /> Blog
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setViewMode('home'); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
                <Home className="h-4 w-4 text-muted-foreground" /> Domů
              </button>
              <button onClick={() => { setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
                <Info className="h-4 w-4 text-muted-foreground" /> O nás
              </button>
              <button onClick={() => { setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
                <Briefcase className="h-4 w-4 text-muted-foreground" /> Naše služby
              </button>
              <button onClick={() => { setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
                <Phone className="h-4 w-4 text-muted-foreground" /> Kontakt
              </button>
            </>
          )}

          {(isB2bApproved || isAdmin) && (
            <>
              <div className="border-t my-2" />
              <button onClick={() => { setMenuOpen(false); navigate('/partner'); }} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-muted/50 transition-colors">
                <LayoutDashboard className="h-4 w-4 text-zinc-500" /> Partner Hub
              </button>
            </>
          )}
          {isAdmin && (
            <>
              <div className="border-t my-2" />
              <button onClick={() => { setMenuOpen(false); navigate('/customers'); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
                <Users className="h-4 w-4 text-muted-foreground" /> Správa zákazníků
              </button>
              <button onClick={() => { setMenuOpen(false); navigate('/admin/deals'); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
                <Flame className="h-4 w-4 text-muted-foreground" /> Správa DEAL nabídek
              </button>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>

    <AuthModal
      open={authOpen}
      onOpenChange={setAuthOpen}
      defaultTab={authTab}
      onLoginSuccess={() => { setViewMode('home'); navigate('/'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
    />
    </>
  );
}
