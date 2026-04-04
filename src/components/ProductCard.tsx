import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import type { Product } from '@/lib/types';
import { useState } from 'react';

export function ProductCard({ product }: { product: Product }) {
  const { lang, addToCart } = useStore();
  const t = translations[lang];
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {!imgError ? (
          <img
            src={product.img}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            {product.manufacturer}
          </div>
        )}
        {product.inStock && (
          <Badge className="absolute left-2 top-2 bg-emerald-500/90 text-white text-[10px] font-medium">
            {t.inStock}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gold">{product.manufacturer}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug">{product.name}</h3>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-lg font-semibold tabular-nums">€{product.price.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground">{t.moq}</p>
          </div>
          <Button
            size="sm"
            className="h-8 gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => addToCart(product)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">{t.addToCart}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
