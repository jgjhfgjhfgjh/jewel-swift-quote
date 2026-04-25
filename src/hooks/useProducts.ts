import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AvailableParam = {
  nazev: string;
  values: string[];
};

export type Aggregation = { name: string; count: number };

interface AggregationsPayload {
  manufacturers: Aggregation[];
  categories: Aggregation[];
}

export function useProducts() {
  const [manufacturers, setManufacturers] = useState<Aggregation[]>([]);
  const [categories, setCategories] = useState<Aggregation[]>([]);
  const [availableParams, setAvailableParams] = useState<AvailableParam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadAggregations = async () => {
      try {
        const { data, error } = await (supabase as any).rpc('get_aggregations');
        if (!active || error || !data) return;
        const payload = data as AggregationsPayload;
        setManufacturers(payload.manufacturers ?? []);
        setCategories(payload.categories ?? []);
      } catch {
        // silently ignore — sidebar just shows empty lists
      }
    };

    const loadParamOptions = async () => {
      try {
        const { data, error } = await (supabase as any).rpc('get_param_options');
        if (!active || error || !data) return;
        const mapped: AvailableParam[] = (data as Array<{ nazev: string; moznosti: string[] }>)
          .map((row) => ({
            nazev: row.nazev,
            values: (row.moznosti ?? []).slice().sort((a, b) => a.localeCompare(b, 'cs')),
          }))
          .sort((a, b) => a.nazev.localeCompare(b.nazev, 'cs'));
        if (active) setAvailableParams(mapped);
      } catch {
        // non-critical
      }
    };

    Promise.all([loadAggregations(), loadParamOptions()]).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, []);

  return { manufacturers, categories, availableParams, loading };
}
