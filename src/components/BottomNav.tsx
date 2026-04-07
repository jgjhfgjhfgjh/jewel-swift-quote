import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Menu, ShoppingCart, Heart, User, LogIn, LogOut, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { translations, flags, type Lang } from '@/lib/i18n';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';

interface Props {
  onOpenWishlist: () => void;
}

export function BottomNav({ onOpenWishlist }: Props) {
  const { lang, setLang, cart, setCartOpen, setSidebarOpen } = useStore();
  const { user, profile, signOut, loading } = useAuthContext();
  const t = translations[lang];
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const navigate = useNavigate();

  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const [profileOpen, setProfileOpen] = useState(false);

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
    setProfileOpen(false);
    await signOut();
  };

  return (
    <>
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-card/90 backdrop-blur-md supports-[backdrop-filter]:bg-card/70 transition-transform duration-300 ease-in-out ${
          hidden ? 'translate-y-full' : 'translate-y-0'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex justify-between items-center w-full px-4 py-2">
          {/* Home */}
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors min-w-[48px]"
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px]">Domů</span>
          </button>

          {/* Menu/Filters */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors min-w-[48px]"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px]">Menu</span>
          </button>

          {/* Cart */}
          {user ? (
            <button
              onClick={() => setCartOpen(true)}
              className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors min-w-[48px] relative"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -right-2 -top-2 h-4 min-w-4 justify-center rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground">
                    {totalItems}
                  </Badge>
                )}
              </div>
              <span className="text-[10px]">Košík</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors min-w-[48px]"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-[10px]">Košík</span>
            </button>
          )}

          {/* Wishlist */}
          <button
            onClick={() => {
              if (!user) {
                navigate('/login');
              } else {
                onOpenWishlist();
              }
            }}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors min-w-[48px]"
          >
            <Heart className="h-5 w-5" />
            <span className="text-[10px]">Oblíbené</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors min-w-[48px]"
          >
            <User className="h-5 w-5" />
            <span className="text-[10px]">Profil</span>
          </button>
        </div>
      </nav>

      {/* Profile Bottom Sheet */}
      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}>
          <SheetHeader>
            <SheetTitle>Profil</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            {user && profile ? (
              <>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-semibold">{profile.company_name || 'Zákazník'}</p>
                  {profile.ico && <p className="text-xs text-muted-foreground">IČO: {profile.ico}</p>}
                  {profile.base_discount > 0 && (
                    <p className="text-xs text-primary font-semibold mt-1">Sleva: {profile.base_discount}%</p>
                  )}
                </div>
                <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Odhlásit se
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Button className="w-full gap-2" onClick={() => { setProfileOpen(false); navigate('/login'); }}>
                  <LogIn className="h-4 w-4" /> Přihlásit se
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { setProfileOpen(false); navigate('/register'); }}>
                  Registrace
                </Button>
              </div>
            )}

            {/* Language Switcher */}
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" /> Jazyk
              </p>
              <div className="flex gap-2">
                {(['cs', 'en', 'is'] as Lang[]).map((l) => (
                  <Button
                    key={l}
                    variant={lang === l ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => setLang(l)}
                  >
                    <span>{flags[l]}</span> {l.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
