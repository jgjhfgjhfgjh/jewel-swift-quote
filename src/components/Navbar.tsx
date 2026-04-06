import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Menu, LogIn, LogOut, Users } from 'lucide-react';
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
  const { lang, setLang, cart, setCartOpen, setSidebarOpen } = useStore();
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
      <div className="h-14 gap-3 px-4 items-center justify-start flex flex-row">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>

        <Link to="/">
          <h1 className="font-display text-xl font-semibold tracking-tight">
            <img src={logo} alt="swelt." className="h-24 object-contain my-0 px-0 py-0 mx-0" />
          </h1>
        </Link>

        <div className="flex-1" />

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
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 px-2 sm:px-3" onClick={() => navigate('/login')}>
                <LogIn className="h-3.5 w-3.5" />
                <span className="text-xs">{t.login}</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 px-2 sm:px-3 rounded-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => navigate('/register')}>
                <span className="text-xs">{t.register}</span>
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
    </header>
  );
}
