import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Má přihlášený uživatel zaplacený early access (Insider/Flex)?
 * Zdroj pravdy: tabulka customer_services — řádek service_type='early_access'
 * se status='active' (zapíná admin v detailu zákazníka; platební flow později).
 *
 * Modulová cache + sdílený inflight promise: hook se mountuje i na každé
 * produktové kartě katalogu, dotaz ale letí jen jednou na uživatele.
 */
let cached: { userId: string; value: boolean } | null = null;
let inflight: { userId: string; promise: Promise<boolean> } | null = null;

function fetchEarlyAccess(userId: string): Promise<boolean> {
  if (cached?.userId === userId) return Promise.resolve(cached.value);
  if (inflight?.userId === userId) return inflight.promise;
  const promise = supabase
    .from('customer_services')
    .select('id')
    .eq('customer_user_id', userId)
    .eq('service_type', 'early_access')
    .eq('status', 'active')
    .limit(1)
    .then(({ data }) => {
      const value = !!(data && data.length);
      cached = { userId, value };
      inflight = null;
      return value;
    });
  inflight = { userId, promise };
  return promise;
}

export function useEarlyAccess() {
  const { user } = useAuthContext();
  const [hasEarlyAccess, setHasEarlyAccess] = useState(
    () => !!user && cached?.userId === user.id && cached.value,
  );
  const [loading, setLoading] = useState(() => !!user && cached?.userId !== user.id);

  useEffect(() => {
    let alive = true;
    if (!user) {
      setHasEarlyAccess(false);
      setLoading(false);
      return;
    }
    fetchEarlyAccess(user.id).then((value) => {
      if (alive) {
        setHasEarlyAccess(value);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [user]);

  return { hasEarlyAccess, loading };
}
