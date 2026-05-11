import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShoppingCart, Menu, LogOut, Users, Search, Heart, User, Globe, Settings, Package, X, Home, Info, Briefcase, Phone, BookOpen, LogIn, UserPlus, Handshake, Rss, PackageOpen, HandCoins, LayoutDashboard } from 'lucide-react';
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
  { path: '/velkoobchod', label: 'Velkoobchod', icon: Handshake },
  { path: '/luxury', label: 'Nákup bez registrace', icon: HandCoins },
  { path: '/feed', label: 'Feed', icon: Rss },
  { path: '/dropshipping', label: 'Dropshipping', icon: PackageOpen },
  { path: '/shop', label: 'E-shop do 48h', icon: ShoppingCart },
];

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
        border-b border-border
      `}
      style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.95) 100%)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {/* ── Row 1: hamburger | logo (absolute center, bottom-aligned with space above) | icons + CTA ── */}
      <div className="relative h-24 pl-2 pr-1 sm:px-4 flex items-center justify-between gap-1 sm:gap-2">

        {/* Logo absolutely positioned — centered horizontally, bottom-aligned with space above */}
        <Link
          to="/"
          onClick={() => { setViewMode('home'); setGatewayOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="absolute left-1/2 bottom-3 -translate-x-1/2 flex items-baseline gap-1.5 select-none pointer-events-auto"
          aria-label="swelt.PARTNER — domů"
        >
          <span
            className={`font-spartan font-extrabold text-5xl sm:text-6xl leading-none tracking-tighter ${whiteLogo ? 'text-white' : 'text-foreground'}`}
            style={{ letterSpacing: '-0.05em' }}
          >swelt.</span>
          <span className={`font-sans font-extrabold text-base sm:text-lg leading-none tracking-tight ${whiteLogo ? 'text-white' : 'text-foreground'}`}>PARTNER</span>
        </Link>

        {/* Left: hamburger */}
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

          {/* Dropshipping Hub — for dropshipping partners and admins */}
          {!loading && user && (isB2bApproved || isAdmin) && (
            <button
              onClick={() => navigate('/partner')}
              title="Dropshipping Hub"
              className="dropshipping-hub-btn group hidden sm:inline-flex shrink-0 items-center gap-2 ml-2 h-9 px-3.5 rounded-lg text-xs font-semibold border transition-all duration-200"
            >
              <LayoutDashboard className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="hidden md:inline">Dropshipping Hub</span>
            </button>
          )}
        </div>

        {/* Right: icons + CTA — always visible */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 relative z-10">

          {!loading && user ? (
            <>
              {/* Dropshipping Hub icon — mobile only (left-side button is hidden below sm) */}
              {(isB2bApproved || isAdmin) && (
                <button
                  onClick={() => navigate('/partner')}
                  title="Dropshipping Hub"
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
              onClick={user ? handleCatalogCta : () => openAuth('register')}
              className="h-8 sm:h-9 px-2 sm:px-4 rounded-lg font-bold tracking-wide text-[11px] sm:text-sm text-white bg-black hover:bg-zinc-800 transition-all hover:-translate-y-0.5 shrink-0"
            >
              {user ? 'KATALOG 2026' : 'Vytvořit účet'}
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
            <nav className="flex items-center gap-1">
              {HOME_NAV_ITEMS.map(({ path, label, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-black hover:text-primary hover:bg-black/5 transition-all"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
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

          {(isB2bApproved || isAdmin) && (
            <>
              <div className="border-t my-2" />
              <button onClick={() => { setMenuOpen(false); navigate('/partner'); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors" style={{ color: '#1D4ED8' }}>
                <LayoutDashboard className="h-4 w-4" style={{ color: '#1D4ED8' }} /> Partner Hub
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
