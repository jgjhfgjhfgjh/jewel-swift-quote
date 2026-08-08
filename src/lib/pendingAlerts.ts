import type { AlertLevel } from '@/lib/alerts';

/**
 * Alerty zapnuté BEZ přihlášení. Klik na zvoneček nesmí nikoho vyhodit
 * z katalogu do registrace — alert se odloží sem do localStorage, zvoneček
 * hned svítí a při prvním přihlášení se odložené alerty zapíšou do účtu
 * (viz useDealAlerts → flush).
 *
 * Není to náhrada účtu: bez e-mailu nemá kam přijít upozornění. Je to slib,
 * který se splní ve chvíli, kdy uživatel účet má.
 */
export interface PendingAlert {
  level: AlertLevel;
  target: string;
  label: string;
}

const KEY = 'gbd-pending-alerts';

export function readPendingAlerts(): PendingAlert[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as PendingAlert[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function writePendingAlerts(list: PendingAlert[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* privátní režim / plné úložiště — alert prostě nepřežije reload */
  }
}

export function clearPendingAlerts() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* viz výše */
  }
}
