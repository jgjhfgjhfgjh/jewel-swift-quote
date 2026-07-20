import { useCallback, useEffect, useState } from 'react';
import { dealAlertsTable, type AlertLevel, type DealAlert } from '@/lib/alerts';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Alerty přihlášeného uživatele s optimistickým zapínáním/vypínáním.
 * Nepřihlášený uživatel má prázdný seznam — volající řeší výzvu k registraci
 * (add/toggle vrací false, když není koho zapsat).
 */
export function useDealAlerts() {
  const { user } = useAuthContext();
  const [alerts, setAlerts] = useState<DealAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      return;
    }
    setLoading(true);
    const { data, error } = await dealAlertsTable()
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setAlerts(data as DealAlert[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const has = useCallback(
    (level: AlertLevel, target = '') =>
      alerts.some((a) => a.level === level && a.target === target),
    [alerts],
  );

  /** Optimisticky zapne alert; false = žádný přihlášený uživatel. */
  const add = useCallback(
    async (level: AlertLevel, target = '', label = '') => {
      if (!user) return false;
      const optimistic: DealAlert = {
        id: `tmp-${level}-${target}`,
        user_id: user.id,
        level,
        target,
        label,
        created_at: new Date().toISOString(),
      };
      setAlerts((prev) =>
        prev.some((a) => a.level === level && a.target === target)
          ? prev
          : [optimistic, ...prev],
      );
      const { data, error } = await dealAlertsTable()
        .insert({ user_id: user.id, level, target, label })
        .select()
        .single();
      if (error) {
        // 23505 = unique violation → alert už existuje (souběh), stačí refresh;
        // jiná chyba → rollback optimistického řádku.
        if (error.code === '23505') reload();
        else setAlerts((prev) => prev.filter((a) => a.id !== optimistic.id));
        return error.code === '23505';
      }
      setAlerts((prev) => prev.map((a) => (a.id === optimistic.id ? (data as DealAlert) : a)));
      return true;
    },
    [user, reload],
  );

  const remove = useCallback(
    async (level: AlertLevel, target = '') => {
      if (!user) return;
      setAlerts((prev) => prev.filter((a) => !(a.level === level && a.target === target)));
      await dealAlertsTable()
        .delete()
        .eq('user_id', user.id)
        .eq('level', level)
        .eq('target', target);
    },
    [user],
  );

  /** Přepne alert; false = žádný přihlášený uživatel (volající otevře registraci). */
  const toggle = useCallback(
    async (level: AlertLevel, target = '', label = '') => {
      if (!user) return false;
      if (has(level, target)) {
        await remove(level, target);
        return true;
      }
      return add(level, target, label);
    },
    [user, has, add, remove],
  );

  return { alerts, loading, has, add, remove, toggle, reload };
}

/** API hooku pro předávání do podkomponent (sdílená instance stavu). */
export type DealAlertsApi = ReturnType<typeof useDealAlerts>;
