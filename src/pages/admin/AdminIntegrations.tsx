import { Bot, Cable, Copy, Mail, Plug, Server, Workflow } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import {
  INTEGRATIONS, isIntegrationEnabled, useIntegrationsStore, type IntegrationType,
} from '@/lib/admin/integrations';

const TYPE_META: Record<IntegrationType, { label: string; icon: typeof Plug }> = {
  'ai-provider': { label: 'AI provideři', icon: Bot },
  'internal-api': { label: 'Interní služby', icon: Server },
  mcp: { label: 'MCP', icon: Cable },
  webhook: { label: 'Webhooky', icon: Workflow },
  edi: { label: 'EDI', icon: Mail },
};

const MCP_SNIPPET = `claude mcp add swelt --transport http https://swelt.partner/api/mcp --header "Authorization: Bearer <MCP_TOKEN>"`;

/**
 * Registr integrací — co je napojené a kudy. Toggle se persistuje lokálně;
 * secrets žijí ve Vercel env (odsud se jen odkazují, nikdy nezadávají).
 */
export default function AdminIntegrations() {
  const enabled = useIntegrationsStore((s) => s.enabled);
  const setEnabled = useIntegrationsStore((s) => s.setEnabled);

  const groups = (Object.keys(TYPE_META) as IntegrationType[])
    .map((type) => ({ type, items: INTEGRATIONS.filter((i) => i.type === type) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Integrace
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">Napojené nástroje</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Přehled všeho, co je na web napojené — interně přes API i externě přes
            MCP. API klíče se spravují ve Vercel env, tady se jen přepíná a odkazuje.
          </p>
        </header>

        {groups.map((g) => {
          const Meta = TYPE_META[g.type];
          const Icon = Meta.icon;
          return (
            <section key={g.type} className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <Icon className="h-3.5 w-3.5" /> {Meta.label}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((def) => {
                  const on = isIntegrationEnabled(enabled, def);
                  return (
                    <div key={def.id} className={`flex flex-col rounded-xl border bg-card p-5 ${on ? '' : 'opacity-60'}`}>
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="text-sm font-bold">{def.label}</h3>
                        <Switch checked={on} onCheckedChange={(v) => setEnabled(def.id, v)} />
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">{def.description}</p>
                      <div className="mt-auto pt-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          on ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-muted text-muted-foreground'
                        }`}>
                          {on ? 'connected' : 'disabled'}
                        </span>
                        {def.configHint && (
                          <p className="mt-2 font-mono text-[10px] text-muted-foreground">{def.configHint}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section className="rounded-xl border bg-card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Napojení externí AI přes MCP
          </h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>Ve Vercelu nastav env <code className="rounded bg-muted px-1 text-xs">MCP_TOKEN</code> (libovolný silný token) a redeployni.</li>
            <li>Zapni integraci „MCP server" výše.</li>
            <li>V klientovi (Claude Code / Desktop) přidej server:</li>
          </ol>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg bg-[#131517] px-3 py-2 text-[11px] text-[#d7d7d7]">
              {MCP_SNIPPET}
            </code>
            <button
              className="rounded-lg border p-2 hover:bg-muted"
              onClick={() => { void navigator.clipboard.writeText(MCP_SNIPPET); toast.success('Zkopírováno'); }}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Server vystavuje resource <code className="rounded bg-muted px-1">swelt://context</code> a
            tools <code className="rounded bg-muted px-1">get_context</code> / <code className="rounded bg-muted px-1">query_data</code>.
            Bez MCP_TOKEN je endpoint vypnutý.
          </p>
        </section>
      </main>
    </div>
  );
}
