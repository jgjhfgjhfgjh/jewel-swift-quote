import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStore } from '@/lib/store';

export function useWishlist() {
  const { user, isAdmin } = useAuthContext();
  const { salesCustomer } = useStore();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Determine whose wishlist to show
  const targetUserId = isAdmin && salesCustomer ? salesCustomer.user_id : user?.id;

  const fetchWishlist = useCallback(async () => {
    if (!targetUserId) {
      setWishlistIds(new Set());
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', targetUserId);
    setWishlistIds(new Set((data ?? []).map((r) => r.product_id)));
    setLoading(false);
  }, [targetUserId]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggle = useCallback(async (productId: string) => {
    if (!targetUserId) return;
    if (wishlistIds.has(productId)) {
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      await supabase.from('wishlist').delete().eq('user_id', targetUserId).eq('product_id', productId);
    } else {
      setWishlistIds((prev) => new Set(prev).add(productId));
      await supabase.from('wishlist').insert({ user_id: targetUserId, product_id: productId });
    }
  }, [targetUserId, wishlistIds]);

  return { wishlistIds, toggle, loading, isViewingCustomerWishlist: isAdmin && !!salesCustomer };
}
