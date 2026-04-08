import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Menu, LogOut, Users, Search, Heart, User, Globe, Settings, Package, X, Home, Info, Briefcase, Phone, BookOpen } from 'lucide-react';
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
  const lastScrollY = useRef(0);
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
    <header className={`fixed top-0 left-0 right-0 z-[100] border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-transform duration-300 ease-in-out ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="h-14 px-3 sm:px-4 flex items-center justify-between">
        {/* Left group: hamburger + logo */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Hamburger: always visible on mobile/tablet in home mode, catalog mode uses lg breakpoint */}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to="/" onClick={() => { setViewMode('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="shrink-0">
            <h1 className="font-display text-xl font-semibold tracking-tight">
              <img src={logo} alt="swelt." className="h-16 sm:h-24 object-contain my-0 px-0 py-0 mx-0" />
            </h1>
          </Link>
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

        {/* Right group: wishlist, cart, profile — hidden on mobile/tablet (bottom nav) */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">

          {!loading && user ? (
            <>
              {/* Wishlist icon */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => onOpenWishlist?.()}
                title={isAdmin && salesCustomer ? `Oblíbené zákazníka: ${salesCustomer.company_name}` : 'Oblíbené'}
              >
                <Heart className={`h-5 w-5 ${wishlistCount > 0 ? 'fill-primary text-primary' : ''}`} />
                {wishlistCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>

              {/* Cart icon */}
              <Button variant="ghost" size="icon" className="relative" onClick={() => setCartOpen(true)}>
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
                    className={`gap-1.5 text-xs ml-1 ${isAdmin && salesCustomer ? 'border border-primary/50 bg-primary/5' : ''}`}
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
              {/* Language switcher for non-logged in */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
                    <span className="text-base">{flags[lang]}</span>
                    <span className="hidden sm:inline">{lang.toUpperCase()}</span>
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

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-xs h-8 px-3" onClick={() => navigate('/login')}>
                  {t.login}
                </Button>
                <Button size="sm" className="text-xs h-8 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/register')}>
                  {t.register}
                </Button>
              </div>
            </>
          ) : null}
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
  );
}
