/**
 * Registr integrací řídicího centra — co je napojené, kudy a jestli to běží.
 *
 * Persistence: localStorage (zustand persist). Tabulka `app_settings` z migrací
 * na živé DB neexistuje (generované typy ji nemají) a admin_integrations čeká
 * na ověření živé DB — viz docs/admin-workspace-plan.md, Fáze 6. Secrets
 * (API klíče, MCP_TOKEN) žijí výhradně ve Vercel env, nikdy tady.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type IntegrationType = 'ai-provider' | 'internal-api' | 'mcp' | 'webhook' | 'edi';

export interface IntegrationDef {
  id: string;
  label: string;
  description: string;
  type: IntegrationType;
  /** kde se konfiguruje (env klíč, endpoint…) — jen informativně */
  configHint?: string;
  /** výchozí stav zapnutí */
  defaultEnabled: boolean;
}

export const INTEGRATIONS: IntegrationDef[] = [
  {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    description: 'Centrální chat + Jarvis, AI nabídky pro prestige poptávky, Vera widget.',
    type: 'ai-provider',
    configHint: 'Vercel env: ANTHROPIC_API_KEY',
    defaultEnabled: true,
  },
  {
    id: 'openai',
    label: 'OpenAI',
    description: 'Alternativní provider centrálního chatu (přepínač ve Workspace).',
    type: 'ai-provider',
    configHint: 'Vercel env: OPENAI_API_KEY',
    defaultEnabled: false,
  },
  {
    id: 'resend',
    label: 'Resend (e-maily)',
    description: 'Transakční e-maily — objednávky, poptávky, mini-kurz, after-sales.',
    type: 'internal-api',
    configHint: 'Vercel env: RESEND_API_KEY, EMAIL_FROM',
    defaultEnabled: true,
  },
  {
    id: 'supabase',
    label: 'Supabase',
    description: 'DB + auth + storage (projekt ktkzibhlzkoklwglkunw). Jádro webu.',
    type: 'internal-api',
    configHint: 'Vercel env: SUPABASE_URL, SUPABASE_SERVICE_KEY',
    defaultEnabled: true,
  },
  {
    id: 'edi-pohoda',
    label: 'EDI — POHODA XML (Zago)',
    description: 'Dodavatelské objednávky e-mailem s POHODA dataPack XML přílohou.',
    type: 'edi',
    configHint: 'Přepínatelný kanál dodavatelských objednávek',
    defaultEnabled: true,
  },
  {
    id: 'mcp-endpoint',
    label: 'MCP server (/api/mcp)',
    description: 'Vystavuje context bundle a datové dotazy externím AI (Claude Desktop/Code aj.) přes Model Context Protocol.',
    type: 'mcp',
    configHint: 'Vercel env: MCP_TOKEN (Bearer auth)',
    defaultEnabled: false,
  },
];

interface IntegrationsState {
  /** id → zapnuto (fallback: defaultEnabled) */
  enabled: Record<string, boolean>;
  setEnabled: (id: string, on: boolean) => void;
}

export const useIntegrationsStore = create<IntegrationsState>()(
  persist(
    (set) => ({
      enabled: {},
      setEnabled: (id, on) =>
        set((s) => ({ enabled: { ...s.enabled, [id]: on } })),
    }),
    { name: 'swelt-admin-integrations' },
  ),
);

export function isIntegrationEnabled(
  enabled: Record<string, boolean>,
  def: IntegrationDef,
): boolean {
  return enabled[def.id] ?? def.defaultEnabled;
}
