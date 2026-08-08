import { useCallback, useEffect, useRef, useState } from 'react';
import { dealAlertsTable, WILDCARD, type AlertLevel, type DealAlert } from '@/lib/alerts';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  clearPendingAlerts, readPendingAlerts, writePendingAlerts, type PendingAlert,
} from '@/lib/pendingAlerts';

/**
 * Alerty přihlášeného uživatele s optimistickým zapínáním/vypínáním.
 *
 * Nepřihlášený uživatel není odmítnut ani nikam přesměrován: alert se odloží
 * do localStorage (viz pendingAlerts), zvoneček hned svítí a při prvním
 * přihlášení se odložené alerty přepíšou do účtu. `add`/`toggle` proto vrací
 * true i pro hosta — volající nemá důvod otevírat registraci.
 */
export function useDealAlerts() {
  const { user } = useAuthContext();
  const [alerts, setAlerts] = useState<DealAlert[]>([]);
  const [pending, setPending] = useState<PendingAlert[]>(() => readPendingAlerts());
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

  /* Přihlášení splní slib z hostovského kliknutí: odložené alerty se zapíšou
     do účtu a z localStorage zmizí. Ref hlídá, aby se zápis nespustil dvakrát
     (efekt běží znovu při každé změně `pending`). */
  const flushing = useRef(false);
  useEffect(() => {
    if (!user || pending.length === 0 || flushing.current) return;
    flushing.current = true;
    void (async () => {
      for (const p of pending) {
        // duplicitu (23505) ignorujeme — alert už v účtu je
        await dealAlertsTable().insert({ user_id: user.id, level: p.level, target: p.target, label: p.label });
      }
      clearPendingAlerts();
      setPending([]);
      flushing.current = false;
      await reload();
    })();
  }, [user, pending, reload]);

  const has = useCallback(
    (level: AlertLevel, target = '') =>
      alerts.some((a) => a.level === level && a.target === target) ||
      pending.some((p) => p.level === level && p.target === target),
    [alerts, pending],
  );

  /** Optimisticky zapne alert; host ho dostane do odložených (localStorage). */
  const add = useCallback(
    async (level: AlertLevel, target = '', label = '') => {
      if (!user) {
        setPending((prev) => {
          const next = prev.some((p) => p.level === level && p.target === target)
            ? prev
            : [...prev, { level, target, label }];
          writePendingAlerts(next);
          return next;
        });
        return true;
      }
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
      if (!user) {
        setPending((prev) => {
          const next = prev.filter((p) => !(p.level === level && p.target === target));
          writePendingAlerts(next);
          return next;
        });
        return;
      }
      setAlerts((prev) => prev.filter((a) => !(a.level === level && a.target === target)));
      await dealAlertsTable()
        .delete()
        .eq('user_id', user.id)
        .eq('level', level)
        .eq('target', target);
    },
    [user],
  );

  /** Přepne alert. Vrací true i hostovi — jeho alert čeká v odložených. */
  const toggle = useCallback(
    async (level: AlertLevel, target = '', label = '') => {
      if (has(level, target)) {
        await remove(level, target);
        return true;
      }
      return add(level, target, label);
    },
    [user, has, add, remove],
  );

  /** Je na úrovni zapnutý hromadný (wildcard) alert — jeden řádek místo N? */
  const hasWildcard = useCallback((level: AlertLevel) => has(level, WILDCARD), [has]);

  /** Platí alert pro cíl? Buď vlastní řádek, nebo hromadný wildcard. */
  const hasAny = useCallback(
    (level: AlertLevel, target = '') => has(level, target) || has(level, WILDCARD),
    [has],
  );

  /**
   * Odebrání jedné položky z hromadného alertu: wildcard zrušíme a rozpadneme
   * na jednotlivé alerty pro všechny ostatní. Vzácná operace (běžné zapnutí
   * „vše" je jeden zápis), proto si ten průchod můžeme dovolit.
   */
  const expandWildcard = useCallback(
    async (level: AlertLevel, items: { target: string; label: string }[], exceptTarget: string) => {
      if (!user) return false;
      await remove(level, WILDCARD);
      for (const it of items) {
        if (it.target !== exceptTarget && !has(level, it.target)) {
          await add(level, it.target, it.label);
        }
      }
      return true;
    },
    [user, remove, add, has],
  );

  return { alerts, loading, has, hasAny, hasWildcard, add, remove, toggle, expandWildcard, reload };
}

/** API hooku pro předávání do podkomponent (sdílená instance stavu). */
export type DealAlertsApi = ReturnType<typeof useDealAlerts>;
