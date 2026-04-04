import { ShoppingCart, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { translations, flags, type Lang } from '@/lib/i18n';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { lang, setLang, cart, setCartOpen, setSidebarOpen } = useStore();
  const t = translations[lang];
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-14 items-center gap-3 px-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>

        <h1 className="font-display text-xl font-semibold tracking-tight">
          <span className="text-primary">swelt.</span>
          <span className="ml-2 text-xs font-sans font-medium uppercase tracking-widest text-muted-foreground">
            {t.wholesale}
          </span>
        </h1>

        <div className="flex-1" />

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
  );
}
