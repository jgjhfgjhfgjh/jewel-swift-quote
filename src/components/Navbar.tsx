import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShoppingCart, Menu, LogOut, Users, Search, Heart, User, Globe, Settings, Package, X, Home, Info, Briefcase, Phone, BookOpen, LogIn, UserPlus, Handshake, Rss, PackageOpen, HandCoins } from 'lucide-react';
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

interface NavbarProps {
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  whiteLogo?: boolean;
}

const HOME_NAV_ITEMS = [
  { href: '#velkoobchod', label: 'Velkoobchod', icon: Handshake },
  { href: '#luxury', label: 'Privátní nákupy', icon: HandCoins },
  { href: '#feed', label: 'Feed', icon: Rss },
  { href: '#dropshipping', label: 'Dropshipping', icon: PackageOpen },
  { href: '#shop', label: 'E-shop do 48h', icon: ShoppingCart },
];

export function Navbar({ wishlistCount = 0, onOpenWishlist, whiteLogo = false }: NavbarProps) {
  const { lang, setLang, cart, setCartOpen, setSidebarOpen, search, setSearch, salesCustomer, clearSalesMode, setViewMode, viewMode } = useStore();
  const { user, profile, isAdmin, signOut, loading } = useAuthContext();
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
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const openAuth = (tab: 'login' | 'register') => {
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
  const desktopMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const [navbarHoverCollapsed, setNavbarHoverCollapsed] = useState(false);
  const isHome = viewMode === 'home';
  const isOnHomePage = location.pathname === '/';

  // Expanded = homepage at top AND not collapsed by wheel-over-navbar
  const isExpanded = isHome && isAtTop && isOnHomePage && !navbarHoverCollapsed;

  // Sync isAtTop when switching back to home view
  useEffect(() => {
    if (isHome) setIsAtTop(window.scrollY < 60);
  }, [isHome]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsAtTop(y < 60);
      // When the page is scrolled back to the very top, allow the navbar to
      // re-expand by clearing any wheel-over-navbar collapse override
      if (y === 0) setNavbarHoverCollapsed(false);
      // Only hide navbar in catalog mode; in home mode it just collapses
      if (isHome) {
        setHidden(false);
      } else {
        setHidden(y > lastScrollY.current && y > 50);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  // Wheel over the navbar: don't scroll the page, just drive the navbar
  // collapse/expand. The hero stays exposed so the customer can browse it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el || !isHome || !isOnHomePage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        setNavbarHoverCollapsed(true);
      } else if (e.deltaY < 0 && window.scrollY === 0) {
        setNavbarHoverCollapsed(false);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isHome, isOnHomePage]);

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
        ${isExpanded ? 'border-b-0' : 'border-b border-border'}
      `}
      style={{
        background: isExpanded
          ? 'linear-gradient(to bottom, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.92) 25%, rgba(255,255,255,0.78) 50%, rgba(255,255,255,0.45) 75%, rgba(255,255,255,0.15) 90%, rgba(255,255,255,0) 100%)'
          : 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.95) 100%)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {/* ── Toolbar row — always h-14 ── */}
      <div className="h-14 pl-2 pr-1 sm:px-4 flex items-center justify-between gap-1 sm:gap-2">

        {/* Left: hamburger (always) + logo (always mobile, hidden desktop when expanded) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
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

          {/* Logo in toolbar: always on mobile, fades out on desktop when expanded */}
          <Link
            to="/"
            onClick={() => { setViewMode('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`shrink-0 transition-all duration-500 ease-in-out
              ${isExpanded ? 'lg:opacity-0 lg:pointer-events-none lg:w-0 lg:overflow-hidden' : 'opacity-100'}
            `}
          >
            <img
              src={logo}
              alt="swelt."
              className={`h-20 sm:h-12 lg:h-10 object-contain my-0 px-0 py-0 mx-0 ${whiteLogo ? 'brightness-0 invert' : ''}`}
            />
          </Link>
        </div>

        {/* Center: search (catalog) | nav links (home collapsed) */}
        {showSearch ? (
          <div className="hidden lg:flex flex-1 justify-center mx-2 md:mx-4">
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
          </div>
        ) : isOnHomePage && isHome ? (
          /* Nav links in toolbar — desktop only, fade out when expanded */
          <nav className={`hidden lg:flex flex-1 justify-center items-center gap-1 mx-4 transition-all duration-500 ease-in-out ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {HOME_NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-black hover:text-primary hover:bg-black/5 transition-all"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </a>
            ))}
          </nav>
        ) : null}

        {/* Right: icons + CTA — always visible */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">

          {!loading && user ? (
            <>
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
                <Heart className={`h-5 w-5 ${wishlistCount > 0 ? 'fill-primary text-primary' : ''}`} />
                {wishlistCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>

              <Button variant="ghost" size="icon" className="relative hidden lg:inline-flex" onClick={() => setCartOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {totalItems}
                  </Badge>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1 sm:gap-1.5 text-xs px-1.5 sm:px-2 ${isAdmin && salesCustomer ? 'border border-primary/50 bg-primary/5' : ''}`}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden xl:inline max-w-[120px] truncate">
                      {isAdmin && salesCustomer ? salesCustomer.company_name : (profile?.company_name || 'Účet')}
                    </span>
                    {isAdmin && salesCustomer && (
                      <Badge className="ml-1 h-4 px-1 text-[8px] bg-primary text-primary-foreground">Sales</Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {isAdmin && salesCustomer ? (
                    <>
                      <div className="px-3 py-2 border-b border-primary/20 bg-primary/5">
                        <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">Režim nabídky</p>
                        <p className="text-sm font-semibold">{salesCustomer.company_name}</p>
                        {salesCustomer.ico && <p className="text-xs text-muted-foreground">IČO: {salesCustomer.ico}</p>}
                        {salesCustomer.base_discount > 0 && (
                          <p className="text-xs text-primary font-semibold mt-0.5">Sleva: {salesCustomer.base_discount}%</p>
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
                              {flags[l]} {langNames[l]}
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
                          <p className="text-xs text-primary font-semibold mt-0.5">Sleva: {profile.base_discount}%</p>
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
                              {flags[l]} {langNames[l]}
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0" title={t.login}>
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => openAuth('login')} className="gap-2 text-sm cursor-pointer">
                    <LogIn className="h-4 w-4" /> Přihlášení
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openAuth('register')} className="gap-2 text-sm cursor-pointer">
                    <UserPlus className="h-4 w-4" /> B2B Registrace
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
                          {flags[l]} {langNames[l]}
                        </option>
                      ))}
                    </select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : null}

          {/* KATALOG 2026 — always far right */}
          <Button
            size="sm"
            onClick={handleCatalogCta}
            className="h-8 sm:h-9 px-2 sm:px-4 rounded-lg font-bold tracking-wide text-[11px] sm:text-sm text-white bg-black hover:bg-zinc-800 transition-all hover:-translate-y-0.5 shrink-0"
          >
            <span className="hidden sm:inline">KATALOG 2026</span>
            <span className="sm:hidden">KATALOG 2026</span>
          </Button>
        </div>
      </div>

      {/* Expanded hero section removed — navbar no longer expands over the hero banner */}

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

    {/* Desktop navigation sheet */}
    <Sheet open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
      <SheetContent
        side="left"
        className="w-72 p-0 z-[95]"
        onInteractOutside={(e) => {
          if (desktopMenuButtonRef.current?.contains(e.target as Node)) {
            e.preventDefault();
          }
        }}
      >
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle className="text-left">Nabídka</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col py-2">
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

          {isAdmin && (
            <>
              <div className="border-t my-2" />
              <button onClick={() => { setMenuOpen(false); navigate('/customers'); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
                <Users className="h-4 w-4 text-muted-foreground" /> Správa zákazníků
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
