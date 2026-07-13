/**
 * Registr automatizací webu + ruční spouštění. Používá ho command bus
 * (run_automation z chatu/voice) i stránka /admin/automations.
 */
import { supabase } from '@/integrations/supabase/client';
import { triggerOutboxProcessing } from '@/lib/orders';

export interface AutomationDef {
  id: string;
  label: string;
  description: string;
  kind: 'cron' | 'outbox' | 'import';
  /** cron plán z vercel.json (Hobby: max 1×/den) */
  schedule?: string;
  /** ručně spustitelná (má trigger endpoint) */
  runnable: boolean;
}

export const AUTOMATIONS: AutomationDef[] = [
  {
    id: 'supplier-outbox',
    label: 'Dodavatelské objednávky (outbox)',
    description: 'Odešle čekající objednávky dodavateli (EDI/POHODA XML e-mail) a zákaznické e-maily z fronty order_emails.',
    kind: 'cron',
    schedule: '0 6 * * *',
    runnable: true,
  },
  {
    id: 'inquiry-processor',
    label: 'Prestige poptávky (processor)',
    description: 'Potvrzení, mini-kurz, nabídky, faktury a after-sales e-maily z fronty inquiry_emails. Idempotentní sweep.',
    kind: 'cron',
    schedule: '0 7 * * *',
    runnable: true,
  },
  {
    id: 'deal-import',
    label: 'DEAL import (xlsx)',
    description: 'Import nabídek z xlsx (EN/CZ formát) — spouští se ručně nahráním souboru v /admin/deals.',
    kind: 'import',
    runnable: false,
  },
];

/** Ručně spustí automatizaci; vrátí true při úspěšném odpálení. */
export async function runAutomation(id: string): Promise<boolean> {
  switch (id) {
    case 'supplier-outbox':
      await triggerOutboxProcessing();
      return true;
    case 'inquiry-processor': {
      try {
        // Endpoint bere Bearer JWT i anonymní volání (jen vyprazdňuje frontu),
        // token posíláme kvůli konzistenci.
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        const res = await fetch('/api/process-inquiries', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        return res.ok;
      } catch {
        return false;
      }
    }
    default:
      return false;
  }
}
