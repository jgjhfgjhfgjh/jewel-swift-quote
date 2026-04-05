import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { ShoppingCart, Menu, Lock, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { translations, flags, type Lang } from '@/lib/i18n';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

// Hardcoded credentials — ready to swap for Supabase Auth
const ADMIN_USERNAME = 'michal';
const ADMIN_PASSWORD = '1234';

export function Navbar() {
  const { lang, setLang, cart, setCartOpen, setSidebarOpen, isAdmin, setAdmin } = useStore();
  const t = translations[lang];
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

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

  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAdmin(true);
      setLoginOpen(false);
      setUsername('');
      setPassword('');
      setError('');
      toast.success('Admin access granted');
    } else {
      setError('Nesprávné jméno nebo heslo');
    }
  };

  const handleLogout = () => {
    setAdmin(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="h-14 gap-3 px-4 items-center justify-start flex flex-row">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="font-display text-xl font-semibold tracking-tight">
            <img src={logo} alt="swelt." className="h-24 object-contain my-0 px-0 py-0 mx-0" />
          </h1>

          <div className="flex-1" />

          {/* Admin button */}
          {isAdmin ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.adminLogout}</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground"
              onClick={() => setLoginOpen(true)}
            >
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
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

          <Button variant="ghost" size="icon" className="relative" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      {/* Admin Login Modal */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">{t.adminLogin}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t.adminMode}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder={t.username}
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                autoFocus
              />
              <Input
                type="password"
                placeholder={t.password}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
            </div>
            {error && (
              <p className="text-xs text-destructive font-medium">{error}</p>
            )}
            <Button type="submit" className="w-full">
              {t.login}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
