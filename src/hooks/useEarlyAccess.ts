import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Má přihlášený uživatel zaplacený early access (Insider/Flex)?
 * Zdroj pravdy: tabulka customer_services — řádek service_type='early_access'
 * se status='active' (zapíná admin v detailu zákazníka; platební flow později).
 * Admin má early access vždy (službu sám spravuje, upsell pro něj nedává smysl).
 *
 * Modulová cache + sdílený inflight promise: hook se mountuje i na každé
 * produktové kartě katalogu, dotaz ale letí jen jednou na uživatele. Cache má
 * TTL, aby se zapnutí služby uprostřed session propsalo i bez reloadu;
 * okamžitou invalidaci po zápisu řeší invalidateEarlyAccessCache().
 */
const CACHE_TTL_MS = 60_000;

let cached: { userId: string; value: boolean; at: number } | null = null;
let inflight: { userId: string; promise: Promise<boolean> } | null = null;

/** Zavolat po insert/update/delete v customer_services (detail zákazníka). */
export function invalidateEarlyAccessCache() {
  cached = null;
  inflight = null;
}

function fetchEarlyAccess(userId: string): Promise<boolean> {
  if (cached?.userId === userId && Date.now() - cached.at < CACHE_TTL_MS) {
    return Promise.resolve(cached.value);
  }
  if (inflight?.userId === userId) return inflight.promise;
  const promise = Promise.resolve(
    supabase
      .from('customer_services')
      .select('id')
      .eq('customer_user_id', userId)
      .eq('service_type', 'early_access')
      .eq('status', 'active')
      .limit(1),
  ).then(({ data }) => {
    const value = !!(data && data.length);
    cached = { userId, value, at: Date.now() };
    inflight = null;
    return value;
  });
  inflight = { userId, promise };
  return promise;
}

export function useEarlyAccess() {
  const { user, isAdmin } = useAuthContext();
  const [hasService, setHasService] = useState(
    () => !!user && cached?.userId === user.id && cached.value,
  );
  const [loading, setLoading] = useState(() => !!user && cached?.userId !== user.id);

  useEffect(() => {
    let alive = true;
    if (!user) {
      setHasService(false);
      setLoading(false);
      return;
    }
    fetchEarlyAccess(user.id).then((value) => {
      if (alive) {
        setHasService(value);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [user]);

  return { hasEarlyAccess: hasService || isAdmin, loading };
}
