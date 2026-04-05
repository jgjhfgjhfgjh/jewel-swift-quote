import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';

interface Props {
  manufacturers: { name: string; count: number }[];
  categories: { name: string; count: number }[];
  selectedBrand: string;
  setSelectedBrand: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  stockOnly: boolean;
  setStockOnly: (v: boolean) => void;
}

export function FilterSidebar({
  manufacturers, categories, selectedBrand, setSelectedBrand,
  selectedCategory, setSelectedCategory, search, setSearch,
  stockOnly, setStockOnly,
}: Props) {
  const { lang, sidebarOpen, setSidebarOpen } = useStore();
  const t = translations[lang];

  const content = (
    <div className="flex h-full flex-col">
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm font-medium">{t.stockOnly}</span>
        <Switch checked={stockOnly} onCheckedChange={setStockOnly} />
      </div>

      <ScrollArea className="flex-1 scrollbar-thin">
        <div className="p-4 pt-2">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.brands}</h3>
          <div className="space-y-0.5">
            <button
              onClick={() => setSelectedBrand('')}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${!selectedBrand ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-muted'}`}
            >
              {t.allBrands}
            </button>
            {manufacturers.map((m) => (
              <button
                key={m.name}
                onClick={() => setSelectedBrand(m.name === selectedBrand ? '' : m.name)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${selectedBrand === m.name ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-muted'}`}
              >
                <span className="truncate">{m.name}</span>
              </button>
            ))}
          </div>

          <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.categories}</h3>
          <div className="space-y-0.5">
            <button
              onClick={() => setSelectedCategory('')}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${!selectedCategory ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-muted'}`}
            >
              {t.allCategories}
            </button>
            {categories.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedCategory(c.name === selectedCategory ? '' : c.name)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${selectedCategory === c.name ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-muted'}`}
              >
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r bg-card">
        {content}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-card shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-display font-semibold">{t.filters}</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
