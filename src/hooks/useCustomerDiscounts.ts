import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useCustomerDiscounts() {
  const fetchDiscounts = useCallback(async (customerUserId: string) => {
    const { data, error } = await supabase
      .from('customer_discounts')
      .select('*')
      .eq('customer_user_id', customerUserId);
    if (error) {
      console.error('Error fetching customer discounts:', error);
      return { brandDiscounts: [] as { brand: string; percent: number }[], productDiscounts: {} as Record<string, number> };
    }
    const brandDiscounts: { brand: string; percent: number }[] = [];
    const productDiscounts: Record<string, number> = {};
    for (const row of data ?? []) {
      if (row.discount_type === 'brand') {
        brandDiscounts.push({ brand: row.target_key, percent: row.percent });
      } else if (row.discount_type === 'product') {
        productDiscounts[row.target_key] = row.percent;
      }
    }
    return { brandDiscounts, productDiscounts };
  }, []);

  const saveBrandDiscount = useCallback(async (customerUserId: string, brand: string, percent: number) => {
    const { error } = await supabase
      .from('customer_discounts')
      .upsert(
        { customer_user_id: customerUserId, discount_type: 'brand', target_key: brand, percent },
        { onConflict: 'customer_user_id,discount_type,target_key' }
      );
    if (error) {
      toast.error('Chyba při ukládání slevy: ' + error.message);
      return false;
    }
    toast.success(`Sleva ${percent}% pro ${brand} uložena trvale`);
    return true;
  }, []);

  const saveProductDiscount = useCallback(async (customerUserId: string, productId: string, percent: number) => {
    const { error } = await supabase
      .from('customer_discounts')
      .upsert(
        { customer_user_id: customerUserId, discount_type: 'product', target_key: productId, percent },
        { onConflict: 'customer_user_id,discount_type,target_key' }
      );
    if (error) {
      toast.error('Chyba při ukládání slevy: ' + error.message);
      return false;
    }
    toast.success(`Produktová sleva ${percent}% uložena trvale`);
    return true;
  }, []);

  const removeBrandDiscount = useCallback(async (customerUserId: string, brand: string) => {
    const { error } = await supabase
      .from('customer_discounts')
      .delete()
      .eq('customer_user_id', customerUserId)
      .eq('discount_type', 'brand')
      .eq('target_key', brand);
    if (error) {
      toast.error('Chyba: ' + error.message);
      return false;
    }
    return true;
  }, []);

  return { fetchDiscounts, saveBrandDiscount, saveProductDiscount, removeBrandDiscount };
}
