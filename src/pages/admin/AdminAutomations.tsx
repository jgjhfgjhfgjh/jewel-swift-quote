import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Play, RefreshCw, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AUTOMATIONS, runAutomation } from '@/lib/admin/automations';

interface QueueStats {
  pending: number;
  sent: number;
  errors: number;
  lastActivity: string | null;
}

const EMPTY: QueueStats = { pending: 0, sent: 0, errors: 0, lastActivity: null };

async function fetchQueue(
  table: 'order_emails' | 'inquiry_emails' | 'supplier_orders',
): Promise<QueueStats> {
  const { data, error } = await supabase
    .from(table)
    .select('status, created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error || !data) return EMPTY;
  const rows = data as { status: string; created_at: string }[];
  return {
    pending: rows.filter((r) => r.status === 'pending').length,
    sent: rows.filter((r) => r.status === 'sent').length,
    errors: rows.filter((r) => r.status === 'error' || r.status === 'failed').length,
    lastActivity: rows[0]?.created_at ?? null,
  };
}

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString('cs-CZ', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

/** Fronty, ze kterých automatizace čtou — mapování na registr AUTOMATIONS. */
const QUEUES: Record<string, ('order_emails' | 'inquiry_emails' | 'supplier_orders')[]> = {
  'supplier-outbox': ['supplier_orders', 'order_emails'],
  'inquiry-processor': ['inquiry_emails'],
};

const QUEUE_LABEL: Record<string, string> = {
  supplier_orders: 'Dodavatelské objednávky',
  order_emails: 'Zákaznické e-maily',
  inquiry_emails: 'Poptávkové e-maily',
};

/**
 * Automation hub — přehled všech automatizací (crony, outboxy, importy),
 * živý stav front z DB a ruční spuštění. Hobby plán = crony max 1×/den,
 * ruční trigger je tedy hlavní cesta „chci to hned".
 */
export default function AdminAutomations() {
  const [stats, setStats] = useState<Record<string, QueueStats>>({});
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const tables = ['order_emails', 'inquiry_emails', 'supplier_orders'] as const;
    const results = await Promise.all(tables.map((t) => fetchQueue(t)));
    setStats(Object.fromEntries(tables.map((t, i) => [t, results[i]])));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const run = async (id: string) => {
    setRunning(id);
    const ok = await runAutomation(id);
    setRunning(null);
    if (ok) {
      toast.success('Automatizace spuštěna — fronta se zpracovává');
      setTimeout(() => void load(), 2500);
    } else {
      toast.error('Spuštění selhalo (endpoint běží jen na Vercelu)');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Automatizace
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">Automation hub</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Všechny automatizace webu na jednom místě — stav front, plány cronů
              a ruční spuštění. Jarvis i chat je spouští příkazem přes command bus.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Obnovit
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {AUTOMATIONS.map((a) => (
            <div key={a.id} className="flex flex-col rounded-xl border bg-card p-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold">{a.label}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.description}</p>
                </div>
                {a.runnable ? (
                  <Button size="sm" disabled={running === a.id} onClick={() => void run(a.id)}>
                    <Play className="mr-1 h-3.5 w-3.5" />
                    {running === a.id ? 'Spouštím…' : 'Spustit'}
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/admin/deals"><Upload className="mr-1 h-3.5 w-3.5" /> Import</Link>
                  </Button>
                )}
              </div>

              {a.schedule && (
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  cron <code className="rounded bg-muted px-1">{a.schedule}</code>
                  <span className="text-muted-foreground/70">(Hobby plán: max 1×/den)</span>
                </p>
              )}

              {(QUEUES[a.id] ?? []).map((table) => {
                const s = stats[table] ?? EMPTY;
                return (
                  <div key={table} className="mt-3 rounded-lg border bg-background px-3 py-2">
                    <p className="text-[11px] font-semibold text-muted-foreground">{QUEUE_LABEL[table]}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums">
                      <span>čeká: <b className={s.pending > 0 ? 'text-amber-600' : ''}>{s.pending}</b></span>
                      <span>odesláno: <b className="text-emerald-600">{s.sent}</b></span>
                      <span>chyby: <b className={s.errors > 0 ? 'text-rose-600' : ''}>{s.errors}</b></span>
                      <span className="text-muted-foreground">poslední aktivita: {fmt(s.lastActivity)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Statistiky počítané z posledních 500 záznamů každé fronty. Nové automatizace
          registruj v <code className="rounded bg-muted px-1">src/lib/admin/automations.ts</code> —
          objeví se tady i v command busu pro chat a Jarvise.
        </p>
      </main>
    </div>
  );
}
