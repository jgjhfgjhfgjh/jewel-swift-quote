// MCP server řídicího centra — vystavuje context bundle a datové dotazy
// externím AI klientům (Claude Desktop / Claude Code / jiné) přes Model
// Context Protocol, transport „streamable HTTP" ve stateless JSON režimu
// (Vercel Hobby neudrží dlouhé SSE spojení).
//
// Auth: Authorization: Bearer <MCP_TOKEN> (Vercel env). Bez nastaveného
// MCP_TOKEN je endpoint vypnutý (503) — bezpečné výchozí chování.
//
// Klient (příklad, Claude Code):
//   claude mcp add swelt --transport http https://<doména>/api/mcp \
//     --header "Authorization: Bearer <MCP_TOKEN>"

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildContextBundle, bundleToMarkdown } from '../src/lib/context/bundle';
import { fetchLiveSnapshot } from './_lib/liveSnapshot.js';

const PROTOCOL_VERSION = '2025-03-26';

function serviceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_KEY ?? '';
  return createClient(url, key, { auth: { persistSession: false } });
}

async function contextMarkdown(): Promise<string> {
  const bundle = buildContextBundle('api');
  try {
    bundle.live = await fetchLiveSnapshot(serviceClient());
  } catch { /* best-effort */ }
  return bundleToMarkdown(bundle);
}

// Podmnožina query_data z api/ai/chat.ts — jen bezpečná čtení.
async function queryData(input: { source?: string; term?: string; limit?: number }): Promise<string> {
  const supabase = serviceClient();
  const limit = Math.min(Math.max(Number(input.limit) || 10, 1), 25);
  switch (input.source) {
    case 'orders': {
      const { data, error } = await supabase
        .from('orders')
        .select('order_number, order_type, status, total, margin_total, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      return error ? `Chyba: ${error.message}` : JSON.stringify(data);
    }
    case 'inquiries': {
      const { data, error } = await supabase
        .from('prestige_inquiries')
        .select('name, status, purchase_type, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      return error ? `Chyba: ${error.message}` : JSON.stringify(data);
    }
    case 'products': {
      const term = String(input.term ?? '').trim();
      if (!term) return 'Chyba: pro products je potřeba term.';
      const { data, error } = await supabase
        .from('produkty')
        .select('sku, product_name, manufacturer, category_text, stock, wholesale_price')
        .or(`product_name.ilike.%${term}%,sku.ilike.%${term}%,manufacturer.ilike.%${term}%`)
        .limit(limit);
      return error ? `Chyba: ${error.message}` : JSON.stringify(data);
    }
    case 'deals': {
      const { data, error } = await supabase
        .from('deals')
        .select('title, slug, status, supplier, deadline')
        .order('created_at', { ascending: false })
        .limit(limit);
      return error ? `Chyba: ${error.message}` : JSON.stringify(data);
    }
    default:
      return 'Chyba: source musí být orders | inquiries | products | deals.';
  }
}

const TOOLS = [
  {
    name: 'get_context',
    description: 'Vrátí kompletní context bundle webu swelt.partner (mapa stránek, copy souhrn, tech fakta, živá KPI) jako Markdown.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'query_data',
    description: 'Živá data z DB: orders | inquiries | products (vyžaduje term) | deals.',
    inputSchema: {
      type: 'object',
      properties: {
        source: { type: 'string', enum: ['orders', 'inquiries', 'products', 'deals'] },
        term: { type: 'string' },
        limit: { type: 'number' },
      },
      required: ['source'],
    },
  },
];

const RESOURCES = [
  {
    uri: 'swelt://context',
    name: 'swelt.partner context bundle',
    description: 'Kompletní kontext webu (Markdown) — mapa, copy, tech, živá KPI.',
    mimeType: 'text/markdown',
  },
];

type JsonRpcRequest = { jsonrpc?: string; id?: number | string | null; method?: string; params?: Record<string, unknown> };

async function handleRpc(msg: JsonRpcRequest): Promise<object | null> {
  const id = msg.id ?? null;
  const ok = (result: object) => ({ jsonrpc: '2.0', id, result });
  const err = (code: number, message: string) => ({ jsonrpc: '2.0', id, error: { code, message } });

  switch (msg.method) {
    case 'initialize':
      return ok({
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: 'swelt-admin-context', version: '1.0.0' },
      });
    case 'notifications/initialized':
    case 'notifications/cancelled':
      return null; // notifikace — bez odpovědi
    case 'ping':
      return ok({});
    case 'tools/list':
      return ok({ tools: TOOLS });
    case 'tools/call': {
      const name = String(msg.params?.name ?? '');
      const args = (msg.params?.arguments ?? {}) as { source?: string; term?: string; limit?: number };
      if (name === 'get_context') {
        return ok({ content: [{ type: 'text', text: await contextMarkdown() }] });
      }
      if (name === 'query_data') {
        return ok({ content: [{ type: 'text', text: await queryData(args) }] });
      }
      return err(-32602, `Neznámý tool: ${name}`);
    }
    case 'resources/list':
      return ok({ resources: RESOURCES });
    case 'resources/read': {
      const uri = String(msg.params?.uri ?? '');
      if (uri !== 'swelt://context') return err(-32602, `Neznámý resource: ${uri}`);
      return ok({
        contents: [{ uri, mimeType: 'text/markdown', text: await contextMarkdown() }],
      });
    }
    default:
      return err(-32601, `Nepodporovaná metoda: ${msg.method}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.MCP_TOKEN ?? '';
  if (!token) {
    res.status(503).json({ error: 'MCP endpoint není aktivní — nastav MCP_TOKEN ve Vercel env.' });
    return;
  }
  const provided = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '').trim();
  if (provided !== token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (req.method === 'GET') {
    // Stateless JSON režim — server-initiated SSE stream nenabízíme.
    res.status(405).json({ error: 'Použij POST (streamable HTTP, JSON mode)' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) ?? {};
  try {
    if (Array.isArray(body)) {
      const responses = (await Promise.all(body.map((m: JsonRpcRequest) => handleRpc(m))))
        .filter((r): r is object => r !== null);
      if (responses.length === 0) { res.status(202).end(); return; }
      res.status(200).json(responses);
      return;
    }
    const response = await handleRpc(body as JsonRpcRequest);
    if (response === null) { res.status(202).end(); return; }
    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32603, message: e instanceof Error ? e.message : 'Internal error' },
    });
  }
}
