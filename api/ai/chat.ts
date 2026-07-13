// Centrální admin chat — mozek řídicího centra. Injektuje context bundle
// (mapa webu + živá KPI) do system promptu a přes tools ovládá command bus:
// UI příkazy (navigate, preview, layout, automatizace) streamuje klientovi
// jako `command` eventy, datové dotazy vykonává sám service klientem.
//
// NENÍ to Vera (api/chat.ts — veřejný zákaznický widget); tento endpoint je
// výhradně admin: Bearer JWT + public.is_admin() RPC.
//
// SSE eventy: {type:'text',text} | {type:'command',command} | {type:'error',message}, pak [DONE].

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildContextBundle, bundleToMarkdown } from '../../src/lib/context/bundle';
import { fetchLiveSnapshot } from '../_lib/liveSnapshot.js';
import {
  runProvider,
  type ProviderId,
  type ChatTurn,
  type ToolDef,
} from '../_lib/aiProviders.js';

function serviceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_KEY ?? '';
  return createClient(url, key, { auth: { persistSession: false } });
}

async function isAdmin(token: string): Promise<boolean> {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
  const anon = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
  if (!url || !anon || !token) return false;
  const client = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data, error } = await client.rpc('is_admin');
  return !error && data === true;
}

// ── tools ───────────────────────────────────────────────────────────────────

/** UI příkazy — vykonává je klient (command bus); server je jen přepošle. */
const UI_TOOLS: ToolDef[] = [
  {
    name: 'navigate',
    description: 'Přejde v admin okně na danou routu webu (např. /admin/erp, /admin/poptavky, /customers).',
    schema: {
      type: 'object',
      properties: { route: { type: 'string', description: 'Cílová routa začínající /' } },
      required: ['route'],
    },
  },
  {
    name: 'set_preview_audience',
    description: 'Přepne preview webu na zákaznickou vrstvu (guest/lead/customer/b2b/real) a volitelně na stránku.',
    schema: {
      type: 'object',
      properties: {
        audience: { type: 'string', enum: ['real', 'guest', 'lead', 'customer', 'b2b'] },
        page: { type: 'string', description: 'Volitelná routa stránky pro preview (např. /)' },
      },
      required: ['audience'],
    },
  },
  {
    name: 'set_layout',
    description: 'Přepne layout workspace: chat | voice | preview | split.',
    schema: {
      type: 'object',
      properties: { mode: { type: 'string', enum: ['chat', 'voice', 'preview', 'split'] } },
      required: ['mode'],
    },
  },
  {
    name: 'run_automation',
    description: 'Spustí automatizaci: "supplier-outbox" (dodavatelské objednávky + e-maily) nebo "inquiry-processor" (prestige poptávky).',
    schema: {
      type: 'object',
      properties: { id: { type: 'string', enum: ['supplier-outbox', 'inquiry-processor'] } },
      required: ['id'],
    },
  },
];

const QUERY_TOOL: ToolDef = {
  name: 'query_data',
  description: 'Načte živá data z DB webu: orders (objednávky), inquiries (prestige poptávky), products (katalog, vyžaduje term), customers (profily), deals.',
  schema: {
    type: 'object',
    properties: {
      source: { type: 'string', enum: ['orders', 'inquiries', 'products', 'customers', 'deals'] },
      term: { type: 'string', description: 'Hledaný výraz (jen pro products)' },
      limit: { type: 'number', description: 'Max řádků (default 10, max 25)' },
    },
    required: ['source'],
  },
};

async function queryData(
  supabase: SupabaseClient,
  input: { source?: string; term?: string; limit?: number },
): Promise<string> {
  const limit = Math.min(Math.max(Number(input.limit) || 10, 1), 25);
  switch (input.source) {
    case 'orders': {
      const { data, error } = await supabase
        .from('orders')
        .select('order_number, order_type, status, total, margin_total, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) return `Chyba: ${error.message}`;
      return JSON.stringify(data);
    }
    case 'inquiries': {
      const { data, error } = await supabase
        .from('prestige_inquiries')
        .select('name, status, purchase_type, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) return `Chyba: ${error.message}`;
      return JSON.stringify(data);
    }
    case 'products': {
      const term = String(input.term ?? '').trim();
      if (!term) return 'Chyba: pro products je potřeba term.';
      const { data, error } = await supabase
        .from('produkty')
        .select('sku, product_name, manufacturer, category_text, stock, wholesale_price, retail_price')
        .or(`product_name.ilike.%${term}%,sku.ilike.%${term}%,manufacturer.ilike.%${term}%,category_text.ilike.%${term}%`)
        .limit(limit);
      if (error) return `Chyba: ${error.message}`;
      return JSON.stringify(data);
    }
    case 'customers': {
      const { data, error } = await supabase
        .from('profiles')
        .select('company_name, ico, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) return `Chyba: ${error.message}`;
      return JSON.stringify(data);
    }
    case 'deals': {
      const { data, error } = await supabase
        .from('deals')
        .select('title, slug, status, supplier, deadline, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) return `Chyba: ${error.message}`;
      return JSON.stringify(data);
    }
    default:
      return 'Chyba: neznámý source.';
  }
}

// ── system prompt ───────────────────────────────────────────────────────────

function buildSystem(contextMd: string): string {
  return `Jsi řídicí centrum platformy swelt.partner — AI kopilot admina.

Pravidla:
- Odpovídáš česky, věcně a stručně; čísla vždy z nástrojů, nikdy odhadem.
- Na dotazy o datech (objednávky, poptávky, produkty, zákazníci, dealy) použij query_data.
- Když admin chce někam přejít / něco zobrazit / přepnout preview či layout, použij UI nástroje.
- Nevymýšlej si stránky ani tabulky — kontext webu máš níže. Když něco nevíš, řekni to.

=== KONTEXT WEBU ===
${contextMd}`;
}

// ── handler ─────────────────────────────────────────────────────────────────

const DEFAULT_MODELS: Record<ProviderId, string> = {
  anthropic: 'claude-sonnet-5',
  openai: 'gpt-4o-mini',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token || !(await isAdmin(token))) {
    res.status(403).json({ error: 'Forbidden — admin only' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) ?? {};
  const rawMessages: { role?: string; content?: string }[] = Array.isArray(body.messages) ? body.messages : [];
  const messages: ChatTurn[] = rawMessages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: String(m.content) }))
    .slice(-30);
  if (messages.length === 0) {
    res.status(400).json({ error: 'messages required' });
    return;
  }
  const provider: ProviderId = body.provider === 'openai' ? 'openai' : 'anthropic';
  const model = typeof body.model === 'string' && body.model.trim()
    ? body.model.trim()
    : DEFAULT_MODELS[provider];

  const supabase = serviceClient();
  const bundle = buildContextBundle('api');
  try {
    bundle.live = await fetchLiveSnapshot(supabase);
  } catch { /* best-effort */ }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const emit = (event: object) => res.write(`data: ${JSON.stringify(event)}\n\n`);

  const executor = async (name: string, input: unknown): Promise<string> => {
    if (name === 'query_data') {
      return queryData(supabase, (input ?? {}) as { source?: string; term?: string; limit?: number });
    }
    // UI příkaz — přepošli klientovi a potvrď modelu.
    emit({ type: 'command', command: { name, input } });
    return 'Provedeno (příkaz odeslán do admin UI).';
  };

  try {
    await runProvider(
      provider,
      {
        model,
        system: buildSystem(bundleToMarkdown(bundle)),
        messages,
        tools: [...UI_TOOLS, QUERY_TOOL],
        maxTokens: 1500,
      },
      executor,
      { onText: (t) => emit({ type: 'text', text: t }) },
    );
  } catch (e) {
    emit({ type: 'error', message: e instanceof Error ? e.message : 'Neznámá chyba' });
  }

  res.write('data: [DONE]\n\n');
  res.end();
}
