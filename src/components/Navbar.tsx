import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShoppingCart, Menu, LogOut, Users, Search, Heart, User, Globe, X, Home, Info, Briefcase, Phone, BookOpen, LayoutDashboard, Flame, ChevronDown, ChevronRight, ArrowRight, MessagesSquare, Package, Settings, Bell } from 'lucide-react';
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
import { NavGoBigDealPanel } from '@/components/deals/NavGoBigDealPanel';
import { useDealAlerts } from '@/hooks/useDealAlerts';
import { openSupplierGate } from '@/components/suppliers/SupplierGateDialog';
import { NavShowcaseCarousel } from '@/components/NavShowcaseCarousel';
import { GoBigDealLogo, Gbd } from '@/components/GoBigDealLogo';
import { BrandLogoRow } from '@/components/BrandLogoRow';
import { ConcernLogoRow } from '@/components/ConcernLogoRow';

interface NavbarProps {
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  whiteLogo?: boolean;
  /** Stránka s tmavým pozadím (např. /alerts) — navbar jede v bílé
      (inverzní) variantě, dokud otevřené mega menu nepřepne header na bílou. */
  onDark?: boolean;
}

/* Desktop nav — 5 položek s chevronem, každá otevírá mega menu.
   path = přímá navigace klikem; bez path klik jen přepíná panel.
   Speciální "cesty" v panelech: auth:login / auth:b2b / catalog:open. */
const NAV_ITEMS: { id: string; label: string; path?: string }[] = [
  { id: 'why-swelt',    label: 'Why' },
  { id: 'products',     label: 'Products' },
  { id: 'top-deals',    label: 'GoBigDeal',    path: '/deals' },
  { id: 'katalog',      label: 'Catalog' },
];

/* Mobile sheet — mega menu je desktop-only, mobil si nechává plochý seznam. */
const HOME_NAV_ITEMS = [
  { path: '/deals',        label: 'GoBigDeal' },
  { path: '/velkoobchod',  label: 'Velkoobchod' },
  { path: '/dropshipping', label: 'Dropshipping' },
  { path: '/prestige',     label: 'Luxury' },
  { path: '/luxury',       label: 'Shop Without Registration' },
  { path: '/feed',         label: 'Feed' },
  // NEW — placeholder destination (/feed) until dedicated pages exist
  { path: '/feed?to=product-intelligence', label: 'Product Intelligence' },
  { path: '/feed?to=mcp',                   label: 'MCP Server' },
];

type NavPanelCol = { title: string; links: { label: string; desc: string; path: string }[] };
type NavPanel = { heading: string; desc: string; cols?: NavPanelCol[]; cta: { label: string; path: string } };

/* Products — číslovaný seznam v typografii kroků z DropshipFlowMap
   (pořadí = prodejní argument, ne abeceda). Položek je málo, takže
   jedou velkým extralight písmem přes celou šířku panelu. */
const PRODUCT_ITEMS: { label: string; sub?: string; path: string }[] = [
  { label: 'Sell without spending money on stock', sub: "Pay us from your customer's money", path: '/dropshipping' },
  { label: 'B2B wholesale', path: '/velkoobchod' },
  { label: 'Fill your shop with zero hustle', path: '/feed' },
  { label: 'Luxury big deals', path: '/prestige' },
  { label: 'Connect your AI agents', path: '/feed?to=mcp' },
];

const NAV_PANELS: Record<string, NavPanel> = {
  'why-swelt': {
    heading: 'Why Swelt',
    desc: 'Prodávejte luxusní hodinky a šperky s enterprise technologií — bez skladu, bez rizika, s doručením po celé EU.',
    cols: [
      { title: 'Platforma', links: [
        { label: 'B2B Velkoobchod', desc: '3 000+ produktů za velkoobchodní ceny', path: '/velkoobchod' },
        { label: 'Dropshipping', desc: 'Bez skladu — balíme a odesíláme my', path: '/dropshipping' },
        { label: 'Produktový feed', desc: 'XML/CSV, aktualizace 4× denně', path: '/feed' },
      ]},
      { title: 'Technologie', links: [
        { label: 'Product Intelligence', desc: 'Trendová data a AI doporučení', path: '/feed?to=product-intelligence' },
        { label: 'MCP Server', desc: 'Napojení AI agentů na katalog', path: '/feed?to=mcp' },
        { label: 'Podpora & kontakt', desc: 'Odpověď do 24 h, AI chat 24/7', path: '/support' },
      ]},
    ],
    cta: { label: 'B2B registrace zdarma', path: 'auth:b2b' },
  },
  /* Products = služby platformy (ne kategorie zboží). Copy drží tón homepage:
     anglicky, čtenář hrdina, výsledek místo funkce, tvrzení kryté číslem. */
  'products': {
    heading: 'Products',
    desc: 'Everything you sell with — and everything you plug into. 70+ brands, wholesale prices from 1 unit.',
    cta: { label: 'Browse brands', path: '/brands' },
  },
  /* Obsah panelu žije v NavGoBigDealPanel — tenhle záznam je jen existence
     gate pro render (guard `NAV_PANELS[activeNav]`), pole se nepoužívají. */
  'top-deals': {
    heading: 'GoBigDeal',
    desc: '',
    cta: { label: '', path: '/deals' },
  },
  /* Luxury Deals už nemá vlastní nav položku — žije jako služba pod Products
     (odkaz vede na /prestige, kde je celý obsah). */
  'katalog': {
    heading: 'KATALOG 2026',
    desc: 'Kompletní B2B katalog s živými cenami a skladovou dostupností. Přístup po přihlášení.',
    cols: [
      { title: 'Co je uvnitř', links: [
        { label: 'Hodinky 70+ značek', desc: 'Tommy Hilfiger, Versace, Seiko…', path: '/velkoobchod' },
        { label: 'Šperky & doplňky', desc: 'Swarovski, Pandora, Morellato…', path: '/velkoobchod' },
        { label: 'Slevy 40–65 %', desc: 'Velkoobchodní ceny od 1 kusu', path: '/velkoobchod' },
      ]},
      { title: 'Přístup', links: [
        { label: 'Přihlásit se', desc: 'Pro schválené B2B partnery', path: 'auth:login' },
        { label: 'B2B registrace', desc: 'Zdarma, schválení do 24 hodin', path: 'auth:b2b' },
        { label: 'Nákup bez registrace', desc: 'Vybrané produkty bez B2B účtu', path: '/luxury' },
      ]},
    ],
    cta: { label: 'Otevřít katalog', path: 'catalog:open' },
  },
};

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

export function Navbar({ wishlistCount = 0, onOpenWishlist, whiteLogo = false, onDark = false }: NavbarProps) {
  const { lang, setLang, cart, setCartOpen, setSidebarOpen, search, setSearch, salesCustomer, clearSalesMode, setViewMode, viewMode, setGatewayOpen, authOpen, authTab, openAuthModal, setAuthOpen } = useStore();
  const { user, profile, isAdmin, isB2bApproved, signOut, loading } = useAuthContext();
  const t = translations[lang];
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const navigate = useNavigate();
  const location = useLocation();
  // Badge zvonečku — počet nastavených alertů (wildcard počítá za jeden)
  const alertCount = useDealAlerts().alerts.length;

  const showSearch = location.pathname === '/' && viewMode === 'catalog';

  const [hidden, setHidden] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string | null>(null);

  const openAuth = openAuthModal;

  const handleCatalogCta = () => {
    if (user) {
      setViewMode('catalog');
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      openAuth('login');
    }
  };

  // Mega-menu link resolver — panely můžou vedle rout používat i akce
  // (auth:login / auth:b2b / catalog:open).
  const go = (path: string) => {
    setActiveNav(null);
    if (path === 'auth:login') return openAuth('login');
    if (path === 'auth:b2b') return openAuth('b2b');
    if (path === 'catalog:open') return handleCatalogCta();
    navigate(path);
  };

  const lastScrollY = useRef(0);
  const navCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const menuOpenRef = useRef(false);
  // Actual rendered navbar height — drives where the menu drawer starts.
  const [headerHeight, setHeaderHeight] = useState(0);
  const isHome = viewMode === 'home';
  // Bílé (inverzní) prvky jen tam, kde navbar reálně leží na hero videu:
  // pouze na routě '/' v home viewMode a nahoře. viewMode je globální store
  // hodnota, která přetrvává i po přechodu na jiné stránky — proto MUSÍ být
  // navázáno i na location.pathname, jinak by na bílých stránkách (/brands…)
  // zůstal bílý text na bílém pozadí. Otevřené mega menu (bílý panel od vrchu)
  // taky vypíná bílé prvky → tmavé, čitelné.
  // Tmavá stránka (onDark) drží inverzní variantu trvale — header je nad
  // černým obsahem; otevřené mega menu ji vypíná stejně jako na homepage.
  const overVideo = ((location.pathname === '/' && isHome && isAtTop) || onDark) && !activeNav;

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

  // Zavři mega menu po jakékoli navigaci — pokrývá i odkazy uvnitř panelu
  // (karty značek / „Vidět víc"), které si routují samy.
  useEffect(() => { setActiveNav(null); }, [location.pathname]);

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
      className={`absolute top-0 left-0 right-0 z-[100] ${
        activeNav ? 'bg-white' : ''
      }`}
    >
      {/* ── Single compact row: logo → desktop nav (chevrony) → pravý cluster ── */}
      <div className="relative h-14 pl-3 pr-2 sm:pl-5 sm:pr-3 flex items-center gap-1 sm:gap-2">

        {/* Logo — vlevo, bez sufixu PARTNER */}
        <Link
          to="/"
          onClick={() => { setViewMode('home'); setGatewayOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center select-none shrink-0 relative z-10"
          aria-label="GoBigDeal — domů"
        >
          {/* wordmark GoBigDeal (barva přes currentColor) */}
          <GoBigDealLogo
            className={`text-lg sm:text-xl lg:text-[1.4rem] ${(whiteLogo && !activeNav) || overVideo ? 'text-white' : 'text-foreground'}`}
          />
        </Link>

        {/* Desktop nav — položky s chevronem otevírají mega menu; v katalogu je nahrazuje vyhledávání */}
        {!showSearch && (
          <nav className="hidden lg:flex items-center gap-1 ml-5 relative z-10">
            {NAV_ITEMS.map((item) => {
              const active = activeNav === item.id;
              // GoBigDeal je vlajková položka → nad videem plně bílá (ostatní
              // jsou přitlumené white/80), na bílé o stupeň tučnější
              // (semibold vs medium). Chevron dědí barvu přes currentColor,
              // v tučné variantě dostane i silnější tah.
              const isFlagship = item.id === 'top-deals';
              return (
                <button
                  key={item.id}
                  onMouseEnter={() => handleNavEnter(item.id)}
                  onMouseLeave={handleNavLeave}
                  onClick={() => {
                    if (item.path) { setActiveNav(null); navigate(item.path); }
                    else setActiveNav(active ? null : item.id);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 font-sans text-[17px] transition-colors ${
                    isFlagship && !overVideo ? 'font-semibold' : 'font-medium'
                  } ${
                    overVideo
                      ? active || isFlagship ? 'text-white' : 'text-white/80 hover:text-white'
                      : active ? 'text-zinc-950' : 'text-zinc-700 hover:text-zinc-950'
                  }`}
                >
                  {item.id === 'top-deals' ? <Gbd /> : item.label}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${active ? 'rotate-180' : ''}`}
                    strokeWidth={isFlagship && !overVideo ? 2.75 : 2}
                  />
                </button>
              );
            })}
          </nav>
        )}

        {/* Catalog search moved to the filter bar (next to „Podrobné vyhledávání").
            Desktop search box now lives in FilterSidebar's mega-bar. */}

        <div className="flex-1" />

        {/* Right: icons + CTA — always visible */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 relative z-10">

          {/* Suppliers — jiný svět (BigDealSupplier), proto oddělený od
              odběratelské navigace svislou linkou a za bránou v dialogu */}
          {/* Stejná velikost i řez jako položky hlavní nav, jen šedý tón —
              odlišuje jiný svět, aniž by vypadal jako jiný typ prvku. */}
          <button
            onClick={openSupplierGate}
            title="Suppliers"
            className={`hidden lg:inline-flex shrink-0 items-center px-3.5 py-2 font-sans text-[17px] font-medium transition-colors ${
              overVideo ? 'text-white/60 hover:text-white/90' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Suppliers
          </button>
          <span
            aria-hidden
            className={`hidden lg:block h-4 w-px mx-1.5 ${overVideo ? 'bg-white/25' : 'bg-zinc-200'}`}
          />

          {/* Globe / Language switcher — desktop only */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`hidden lg:inline-flex shrink-0 items-center gap-1.5 h-8 px-2 rounded-lg text-xs font-semibold uppercase tracking-wide ${
                  overVideo ? 'text-white/90 hover:bg-white/10 hover:text-white' : 'text-zinc-600 hover:bg-muted'
                }`}
                title="Jazyk"
              >
                <Globe className="h-4 w-4" />
                <span>{lang}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-44 max-h-[60vh] overflow-y-auto z-[105]">
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

          {!loading && user ? (
            <>
              {/* Partner Hub — for dropshipping partners and admins */}
              {(isB2bApproved || isAdmin) && (
                <button
                  onClick={() => navigate('/partner')}
                  title="Partner Hub"
                  className="dropshipping-hub-btn group inline-flex shrink-0 items-center gap-2 h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold border transition-all duration-200"
                >
                  <LayoutDashboard className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  <span className="hidden md:inline">Partner Hub</span>
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

              {/* Zvoneček — správa deal alertů na /alerts (badge = počet alertů) */}
              <Button
                variant="ghost"
                size="icon"
                className={`relative hidden lg:inline-flex ${overVideo ? 'text-white hover:bg-white/10 hover:text-white' : ''}`}
                onClick={() => navigate('/alerts')}
                title="Deal alerts"
              >
                <Bell className={`h-5 w-5 ${alertCount > 0 ? (overVideo ? 'fill-white text-white' : 'fill-zinc-900 text-zinc-900') : ''}`} />
                {alertCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-none bg-zinc-900 px-1 text-[10px] font-bold text-white">
                    {alertCount}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={`relative hidden lg:inline-flex ${overVideo ? 'text-white hover:bg-white/10 hover:text-white' : ''}`}
                onClick={() => navigate('/favorites')}
                title={isAdmin && salesCustomer ? `Oblíbené zákazníka: ${salesCustomer.company_name}` : 'Oblíbené'}
              >
                <Heart className={`h-5 w-5 ${wishlistCount > 0 ? (overVideo ? 'fill-white text-white' : 'fill-zinc-900 text-zinc-900') : ''}`} />
                {wishlistCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-none bg-zinc-900 px-1 text-[10px] font-bold text-white">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>

              <Button variant="ghost" size="icon" className={`relative hidden lg:inline-flex ${overVideo ? 'text-white hover:bg-white/10 hover:text-white' : ''}`} onClick={() => setCartOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-none bg-zinc-900 px-1 text-[10px] font-bold text-white">
                    {totalItems}
                  </Badge>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1 sm:gap-1.5 text-xs px-1.5 sm:px-2 ${isAdmin && salesCustomer ? 'border border-zinc-300 bg-zinc-50' : ''} ${
                      overVideo && !(isAdmin && salesCustomer) ? 'text-white hover:bg-white/10 hover:text-white' : ''
                    }`}
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
                <DropdownMenuContent align="end" sideOffset={8} className="w-56 z-[120] max-h-[80vh] overflow-y-auto">
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
                      <DropdownMenuItem onClick={() => navigate('/orders')} className="gap-2 text-xs">
                        <Package className="h-3.5 w-3.5" /> Moje objednávky
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/ucet')} className="gap-2 text-xs">
                        <Settings className="h-3.5 w-3.5" /> Nastavení účtu
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuItem onClick={() => navigate('/admin/erp')} className="gap-2 text-xs">
                            <LayoutDashboard className="h-3.5 w-3.5" /> ERP přehled
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/admin/poptavky')} className="gap-2 text-xs">
                            <Package className="h-3.5 w-3.5" /> Poptávky Luxury
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/admin/deals')} className="gap-2 text-xs">
                            <Flame className="h-3.5 w-3.5" /> Správa DEAL nabídek
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/customers')} className="gap-2 text-xs">
                            <Users className="h-3.5 w-3.5" /> Správa zákazníků
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/komunikace')} className="gap-2 text-xs">
                            <MessagesSquare className="h-3.5 w-3.5" /> Komunikace swelt × zago
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/admin/audit')} className="gap-2 text-xs">
                            <LayoutDashboard className="h-3.5 w-3.5" /> Web Cockpit (audit)
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
              {/* Guest CTAs — iOS pilulky: Přihlásit (světlá) + B2B registrace (černá) */}
              <Button
                size="sm"
                onClick={() => openAuth('login')}
                className={`h-8 px-2 sm:h-9 sm:px-5 rounded-full font-semibold text-[11px] sm:text-sm bg-transparent transition-all shrink-0 shadow-none ${
                  overVideo ? 'text-white hover:bg-white/10' : 'text-zinc-900 hover:bg-zinc-900/5'
                }`}
              >
                Přihlásit
              </Button>
              {/* relative + caption absolutně pod tlačítkem → černá CTA se svisle
                  zarovná s Přihlásit (caption ji nesune nahoru); nad videem se
                  pilulka invertuje (bílá s tmavým textem) */}
              <div className="relative flex items-center shrink-0 ml-1">
                <Button
                  size="sm"
                  onClick={() => openAuth('b2b')}
                  className={`h-8 px-3 sm:h-9 sm:px-5 rounded-full font-semibold text-[11px] sm:text-sm transition-all shrink-0 ${
                    overVideo ? 'text-zinc-900 bg-white hover:bg-zinc-200' : 'text-white bg-black hover:bg-zinc-800'
                  }`}
                >
                  B2B registration
                </Button>
                <span className={`hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[9px] leading-none tracking-wide whitespace-nowrap ${
                  overVideo ? 'text-white/70' : 'text-muted-foreground'
                }`}>
                  Verify Account in 24h
                </span>
              </div>
            </>
          ) : null}

          {/* Hamburger — mobil/tablet only; desktop má vše v mega menu / pod panáčkem */}
          <Button
            ref={desktopMenuButtonRef}
            variant="ghost"
            size="icon"
            className={`lg:hidden shrink-0 relative z-[110] cursor-pointer pointer-events-auto ${
              overVideo ? 'text-white hover:bg-white/10 hover:text-white' : ''
            }`}
            onPointerDown={(e) => {
              e.preventDefault();
              setMenuOpen((v) => !v);
            }}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

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
          {/* Panel — jednotná min. výška, aby se každé menu otevřelo do stejné
              vertikální velikosti jako Why Swelt (jehož výšku určuje karusel karet:
              clamp(260,26vw,360) + padding). */}
          <div
            className={`absolute left-0 right-0 z-[95] border-b shadow-2xl hidden lg:block min-h-[clamp(320px,30vw,412px)] ${
              /* GoBigDeal = obsidianová předsíň /deals; ostatní panely bílé */
              activeNav === 'top-deals' ? 'bg-[#0B1215] border-white/10' : 'bg-white border-zinc-200'
            }`}
            style={{ top: headerHeight }}
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
          >
            {activeNav === 'why-swelt' ? (
              /* Why Swelt — jen full-width kolotoč prázdných placeholder karet,
                 bez levého sloupce (heading/desc/CTA) */
              <div className="px-6 py-6">
                <NavShowcaseCarousel />
              </div>
            ) : activeNav === 'katalog' ? (
              /* Katalog — dvě police (koncerny + značky), CTA až pod nimi.
                 -mx-6 vyruší padding panelu (police mají vlastní). Menu se
                 zavírá efektem na změnu routy (ne klikem), aby se nepřebila
                 navigace odkazů uvnitř polic. */
              <div className="px-6 pt-5 pb-5 flex flex-col">
                <div className="-mx-6">
                  <ConcernLogoRow topMargin="mt-0" compact />
                </div>
                <div className="-mx-6">
                  <BrandLogoRow topMargin="mt-5" compact />
                </div>
                <button
                  onClick={() => go(panel.cta.path)}
                  className="mt-5 self-start inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  {panel.cta.label} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : activeNav === 'top-deals' ? (
              /* GoBigDeal — obsidianová předsíň /deals: headline strip se
                 živými čísly, spotlight končícího dealu, Live by concern
                 (poctivé počty), Early Access karta a patička s free drop
                 alertem. Viz NavGoBigDealPanel. */
              <div className="px-6 pt-3 pb-2.5">
                <NavGoBigDealPanel onNavigate={() => setActiveNav(null)} />
              </div>
            ) : activeNav === 'products' ? (
              /* Products — číslovaný seznam v typografii kroků z dropship
                 schématu: emeraldové pořadí, extralight nadpisové písmo,
                 linky mezi řádky, hover přebarví řádek gradientem. */
              <div className="px-6 py-6">
                {PRODUCT_ITEMS.map((item, i) => (
                  <div key={item.label}>
                    <button
                      onClick={() => go(item.path)}
                      className="group flex w-full items-baseline gap-6 py-3.5 text-left"
                    >
                      <span className="text-xs font-semibold tabular-nums text-emerald-500 transition-colors group-hover:text-blue-500">
                        0{i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-sans text-2xl font-extralight leading-tight tracking-tight text-zinc-900 transition-colors duration-300 lg:text-[2rem] group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:via-cyan-500 group-hover:to-emerald-500 group-hover:bg-clip-text group-hover:text-transparent">
                          {item.label}
                        </span>
                        {item.sub && (
                          <span className="mt-0.5 block text-sm font-light leading-tight text-zinc-400">
                            {item.sub}
                          </span>
                        )}
                      </span>
                    </button>
                    {i < PRODUCT_ITEMS.length - 1 && <div aria-hidden className="h-px w-full bg-zinc-200" />}
                  </div>
                ))}
              </div>
            ) : (
            <div className="px-6 py-8">
              <div className="grid grid-cols-[minmax(260px,1fr)_2fr] gap-10 items-start">
                {/* Left: heading + desc + CTA */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">swelt.</p>
                  <h3 className="text-2xl font-semibold text-zinc-900 mb-2">{panel.heading}</h3>
                  <p className="text-sm text-zinc-500 mb-6 max-w-sm leading-relaxed">{panel.desc}</p>
                  <button
                    onClick={() => go(panel.cta.path)}
                    className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    {panel.cta.label} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Right: link columns */}
                <div className="grid grid-cols-2 gap-12">
                  {(panel.cols ?? []).map((col) => (
                    <div key={col.title}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">{col.title}</p>
                      <ul className="space-y-1">
                        {col.links.map((link) => (
                          <li key={link.label}>
                            <button
                              onClick={() => go(link.path)}
                              className="group flex flex-col text-left w-full rounded-lg px-2 py-2.5 hover:bg-zinc-50 transition-colors"
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
            )}
          </div>
        </>
      );
    })()}

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
              {label === 'GoBigDeal' ? <Gbd /> : label}
              <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
            </button>
          ))}

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
              <button onClick={() => { setMenuOpen(false); navigate('/komunikace'); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
                <MessagesSquare className="h-4 w-4 text-muted-foreground" /> Komunikace swelt × zago
              </button>
              <button onClick={() => { setMenuOpen(false); navigate('/admin/audit'); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Web Cockpit (audit)
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
