import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Menu, LogOut, Users, Search, Heart, User, Globe, Settings, Package, X, Home, Info, Briefcase, Phone, BookOpen, LogIn, UserPlus } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { translations, flags, type Lang } from '@/lib/i18n';
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
}

export function Navbar({ wishlistCount = 0, onOpenWishlist }: NavbarProps) {
  const { lang, setLang, cart, setCartOpen, setSidebarOpen, search, setSearch, salesCustomer, clearSalesMode, setViewMode, viewMode } = useStore();
  const { user, profile, isAdmin, signOut, loading } = useAuthContext();
  const t = translations[lang];
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const navigate = useNavigate();

  const [hidden, setHidden] = useState(false);
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
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      openAuth('login');
    }
  };
  const lastScrollY = useRef(0);
  const desktopMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const isHome = viewMode === 'home';

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastScrollY.current && y > 50);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
    <header className={`fixed top-0 left-0 right-0 z-[100] border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-transform duration-300 ease-in-out ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="h-14 px-2 sm:px-4 flex items-center justify-between gap-1 sm:gap-2">
        {/* Left group: hamburger + logo */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
          {/* Hamburger: mobile opens sidebar (filters in catalog), desktop opens nav menu */}
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

          <Link to="/" onClick={() => { setViewMode('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="shrink-0">
            <h1 className="font-display text-xl font-semibold tracking-tight">
              <img src={logo} alt="swelt." className="h-10 sm:h-16 lg:h-24 object-contain my-0 px-0 py-0 mx-0" />
            </h1>
          </Link>

          {/* KATALOG 2026 — far-left CTA, visible on ALL devices */}
          <Button
            size="sm"
            onClick={handleCatalogCta}
            className="h-8 sm:h-9 px-2 sm:px-4 rounded-lg font-bold tracking-wide text-[11px] sm:text-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-[0_0_18px_hsl(142_76%_36%/0.45)] hover:shadow-[0_0_26px_hsl(142_76%_36%/0.65)] transition-all hover:-translate-y-0.5 ring-1 ring-green-500/30 shrink-0"
          >
            <span className="hidden sm:inline">KATALOG 2026</span>
            <span className="sm:hidden">KATALOG</span>
          </Button>
        </div>

        {/* Center: Search bar — hidden on mobile in home mode, replaced by search icon */}
        <div className={`flex flex-1 justify-center mx-2 md:mx-4 ${isHome ? 'hidden md:flex' : ''}`}>
          <div className="relative w-full max-w-[500px] lg:max-w-[600px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={(e) => { setSearch(e.target.value); if (e.target.value.trim()) setViewMode('catalog'); }}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        {/* Mobile search icon — only in home mode on mobile */}
        {isHome && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={() => setMobileSearchOpen((v) => !v)}
          >
            {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>
        )}

        {/* Right group: wishlist, cart, profile — visible on all devices */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">

          {!loading && user ? (
            <>
              {/* Wishlist icon — desktop only (mobile uses bottom nav) */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden lg:inline-flex"
                onClick={() => { if (!user) { navigate('/login'); } else { navigate('/favorites'); } }}
                title={isAdmin && salesCustomer ? `Oblíbené zákazníka: ${salesCustomer.company_name}` : 'Oblíbené'}
              >
                <Heart className={`h-5 w-5 ${wishlistCount > 0 ? 'fill-primary text-primary' : ''}`} />
                {wishlistCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>

              {/* Cart icon — desktop only */}
              <Button variant="ghost" size="icon" className="relative hidden lg:inline-flex" onClick={() => setCartOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {/* Profile dropdown */}
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
                      {/* Customer info header in sales mode */}
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

                      {/* Language switcher */}
                      <div className="px-2 py-1.5">
                        <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                          <Globe className="h-3 w-3" /> Jazyk
                        </p>
                        <div className="flex gap-1">
                          {(['cs', 'en', 'is'] as Lang[]).map((l) => (
                            <Button key={l} variant={lang === l ? 'default' : 'outline'} size="sm" className="flex-1 gap-1 h-7 text-[11px]" onClick={() => setLang(l)}>
                              <span>{flags[l]}</span> {l.toUpperCase()}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => clearSalesMode()} className="gap-2 text-xs text-destructive font-semibold">
                        <LogOut className="h-3.5 w-3.5" /> Ukončit režim nabídky
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      {/* Admin's own info */}
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

                      {/* Language switcher */}
                      <div className="px-2 py-1.5">
                        <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                          <Globe className="h-3 w-3" /> Jazyk
                        </p>
                        <div className="flex gap-1">
                          {(['cs', 'en', 'is'] as Lang[]).map((l) => (
                            <Button key={l} variant={lang === l ? 'default' : 'outline'} size="sm" className="flex-1 gap-1 h-7 text-[11px]" onClick={() => setLang(l)}>
                              <span>{flags[l]}</span> {l.toUpperCase()}
                            </Button>
                          ))}
                        </div>
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
              {/* High-visibility CTA — placed BEFORE login/register so it never gets pushed out */}
              <Button
                size="sm"
                onClick={handleCatalogCta}
                className="h-8 sm:h-9 px-2.5 sm:px-4 rounded-lg font-bold tracking-wide text-[11px] sm:text-sm text-primary-foreground bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-[0_0_20px_hsl(24_95%_53%/0.45)] hover:shadow-[0_0_28px_hsl(24_95%_53%/0.65)] transition-all hover:-translate-y-0.5 ring-1 ring-orange-400/30 shrink-0"
              >
                <span className="hidden sm:inline">KATALOG 2026</span>
                <span className="sm:hidden">KATALOG</span>
              </Button>

              {/* Login — icon-only on mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-1.5 sm:px-3 shrink-0"
                onClick={() => setAuthOpen(true)}
                title={t.login}
              >
                <LogIn className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">{t.login}</span>
              </Button>

              {/* Register — icon-only on mobile */}
              <Button
                size="sm"
                className="text-xs h-8 px-1.5 sm:px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                onClick={() => navigate('/register')}
                title={t.register}
              >
                <UserPlus className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">{t.register}</span>
              </Button>

              {/* Language switcher — flag always visible */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 text-sm h-8 px-1.5 sm:px-2 shrink-0">
                    <span className="text-base">{flags[lang]}</span>
                    <span className="hidden md:inline text-xs">{lang.toUpperCase()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(['cs', 'en', 'is'] as Lang[]).map((l) => (
                    <DropdownMenuItem key={l} onClick={() => setLang(l)} className="gap-2">
                      <span>{flags[l]}</span> {l.toUpperCase()}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : null}

          {/* High-visibility CTA — visible for logged-in users too */}
          {!loading && user && (
            <Button
              size="sm"
              onClick={handleCatalogCta}
              className="h-8 sm:h-9 px-2.5 sm:px-4 rounded-lg font-bold tracking-wide text-[11px] sm:text-sm text-primary-foreground bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-[0_0_20px_hsl(24_95%_53%/0.45)] hover:shadow-[0_0_28px_hsl(24_95%_53%/0.65)] transition-all hover:-translate-y-0.5 ring-1 ring-orange-400/30 shrink-0"
            >
              <span className="hidden sm:inline">KATALOG 2026</span>
              <span className="sm:hidden">KATALOG</span>
            </Button>
          )}
        </div>
      </div>

      {/* Expandable mobile search bar — drops below header in home mode */}
      {isHome && mobileSearchOpen && (
        <div className="md:hidden px-3 pb-2 pt-1 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 animate-fade-in">
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

    {/* Desktop navigation menu drawer */}
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
