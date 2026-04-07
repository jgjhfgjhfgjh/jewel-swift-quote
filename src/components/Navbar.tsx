import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Menu, LogIn, LogOut, Users, Search } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { translations, flags, type Lang } from '@/lib/i18n';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { lang, setLang, cart, setCartOpen, setSidebarOpen, search, setSearch } = useStore();
  const { user, profile, isAdmin, signOut, loading } = useAuthContext();
  const t = translations[lang];
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const navigate = useNavigate();

  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

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
    <header className={`fixed top-0 left-0 right-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-transform duration-300 ease-in-out ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="h-14 px-3 sm:px-4 flex items-center justify-between">
        {/* Left group: hamburger + logo */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Hamburger only visible on tablet (md-lg), hidden on mobile (bottom nav) and desktop (sidebar always visible) */}
          <Button variant="ghost" size="icon" className="hidden lg:flex xl:hidden shrink-0" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <Link to="/" className="shrink-0">
            <h1 className="font-display text-xl font-semibold tracking-tight">
              <img src={logo} alt="swelt." className="h-16 sm:h-24 object-contain my-0 px-0 py-0 mx-0" />
            </h1>
          </Link>
        </div>

        {/* Center: Search bar - visible on all sizes now (mobile top header has search) */}
        <div className="flex flex-1 justify-center mx-2 md:mx-4">
          <div className="relative w-full max-w-[500px] lg:max-w-[600px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        {/* Right group: auth, lang, cart — hidden on mobile (moved to bottom nav) */}
        <div className="hidden lg:flex items-center gap-1 sm:gap-2 shrink-0">

        {/* User welcome or discount info */}
        {user && profile && (
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[10px] text-muted-foreground leading-tight">
              Vítejte, <span className="font-semibold text-foreground">{profile.company_name || 'Zákazník'}</span>
            </span>
            {profile.base_discount > 0 && (
              <span className="text-[10px] text-primary font-semibold leading-tight">
                Vaše sleva: {profile.base_discount}%
              </span>
            )}
          </div>
        )}

        {/* Auth buttons */}
        {!loading && (
          user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <LogIn className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{profile?.company_name?.slice(0, 15) || 'Účet'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/customers')} className="gap-2 text-xs">
                      <Users className="h-3.5 w-3.5" /> Správa zákazníků
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="gap-2 text-xs text-destructive">
                  <LogOut className="h-3.5 w-3.5" /> Odhlásit se
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-[11px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3" onClick={() => navigate('/login')}>
                <span className="sm:hidden">Přihlásit</span>
                <span className="hidden sm:inline">{t.login}</span>
              </Button>
              <Button size="sm" className="text-[11px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/register')}>
                {t.register}
              </Button>
            </div>
          )
        )}

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

        {user && (
          <Button variant="ghost" size="icon" className="relative" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </Badge>
            )}
          </Button>
        )}
        </div>
      </div>
    </header>
  );
}
