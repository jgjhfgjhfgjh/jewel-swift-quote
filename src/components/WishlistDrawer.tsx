import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { useStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/lib/types';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function WishlistDrawer({ open, onOpenChange }: Props) {
  const { wishlistIds, toggle, isViewingCustomerWishlist } = useWishlist();
  const { salesCustomer } = useStore();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  // Fetch product details for the wishlist IDs
  const idsKey = Array.from(wishlistIds).sort().join(',');
  useEffect(() => {
    const ids = idsKey ? idsKey.split(',') : [];
    if (ids.length === 0 || !open) {
      setWishlistProducts([]);
      return;
    }
    let active = true;
    (supabase as any)
      .from('produkty')
      .select('id, sku, product_name, manufacturer, image_url')
      .in('id', ids)
      .then(({ data }: { data: any[] | null }) => {
        if (!active || !data) return;
        setWishlistProducts(data.map((row: any) => ({
          id: row.id,
          name: row.product_name || row.sku,
          manufacturer: row.manufacturer || '',
          sku: row.sku,
          ean: '',
          description: '',
          category: '',
          img: row.image_url || '',
          image_urls: [],
          price: 0,
          wholesale: 0,
          stock: 0,
          inStock: false,
        })));
      });
    return () => { active = false; };
  }, [idsKey, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Oblíbené
            {isViewingCustomerWishlist && salesCustomer && (
              <span className="text-xs text-muted-foreground ml-1">
                ({salesCustomer.company_name})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-3">
          {wishlistProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Heart className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">Žádné oblíbené produkty</p>
            </div>
          ) : (
            wishlistProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3 rounded-lg border p-2">
                <img
                  src={product.img}
                  alt={product.name}
                  className="h-14 w-14 rounded object-contain bg-muted p-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">{product.manufacturer}</p>
                  <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => toggle(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
