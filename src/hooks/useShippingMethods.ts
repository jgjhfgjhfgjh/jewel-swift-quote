import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ShippingMethod {
  id: string;
  code: string;
  name: string;
  carrier: string;
  price_eur: number;
  cod_supported: boolean;
  sort_order: number;
}

export function useShippingMethods() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from('shipping_methods')
      .select('id, code, name, carrier, price_eur, cod_supported, sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) setMethods(data);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return { methods, loading };
}
