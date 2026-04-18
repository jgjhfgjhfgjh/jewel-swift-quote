import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from 'https://esm.sh/@supabase/supabase-js@2.57.4/cors';

// Fields that are manually managed in the admin and must NEVER be overwritten
// by an automated feed sync. Add new "locked" fields here as needed.
const PROTECTED_FIELDS = new Set<string>([
  'admin_custom_margin',
  'is_featured',
  'admin_notes',
  'manual_price_override',
]);

interface FeedProduct {
  sku: string;
  [key: string]: unknown;
}

/** Strip protected fields from a payload before upsert. */
function stripProtected<T extends Record<string, unknown>>(row: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (!PROTECTED_FIELDS.has(k)) out[k] = v;
  }
  return out as Partial<T>;
}

/**
 * Placeholder parser. Replace with real XML/CSV parsing once the feed
 * format is finalized. For now it accepts JSON arrays as a stand-in so
 * the pipeline is testable end-to-end.
 */
async function fetchAndParseFeed(url: string): Promise<FeedProduct[]> {
  if (!url) return [];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status} ${res.statusText}`);
  const contentType = res.headers.get('content-type') ?? '';
  const body = await res.text();

  if (contentType.includes('json') || body.trim().startsWith('[')) {
    const parsed = JSON.parse(body);
    if (!Array.isArray(parsed)) throw new Error('Expected JSON array of products');
    return parsed as FeedProduct[];
  }

  // TODO: implement real XML/CSV parsing (DOMParser / csv-parse)
  console.warn('[sync-product-feed] XML/CSV parsing not yet implemented');
  return [];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  // Auth: only admins can trigger
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const userId = claimsData.claims.sub;
  const { data: isAdmin } = await userClient.rpc('has_role', {
    _user_id: userId,
    _role: 'admin',
  });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'Forbidden — admin only' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Service-role client for the actual sync work
  const admin = createClient(supabaseUrl, serviceKey);

  // Insert a "running" log row up-front so we can update it with the result
  const { data: logRow, error: logErr } = await admin
    .from('feed_sync_logs')
    .insert({ status: 'running', message: 'Sync started', items_processed_count: 0 })
    .select('id')
    .single();
  if (logErr) {
    return new Response(JSON.stringify({ error: logErr.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let processed = 0;
  try {
    const { data: config, error: cfgErr } = await admin
      .from('feed_config')
      .select('id, feed_url, mapping_rules')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    if (cfgErr) throw new Error(`Config load failed: ${cfgErr.message}`);
    if (!config?.feed_url) throw new Error('Feed URL is not configured');

    const products = await fetchAndParseFeed(config.feed_url);

    // Iterate and upsert (placeholder — wire to your products table once it exists)
    for (const product of products) {
      if (!product.sku) continue;
      const safe = stripProtected(product);
      // TODO: replace 'products' with the real catalog table when added
      // await admin.from('products').upsert(safe, { onConflict: 'sku', ignoreDuplicates: false });
      void safe;
      processed += 1;
    }

    await admin
      .from('feed_config')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', config.id);

    await admin
      .from('feed_sync_logs')
      .update({
        status: 'success',
        message: `Processed ${processed} products`,
        items_processed_count: processed,
      })
      .eq('id', logRow.id);

    return new Response(
      JSON.stringify({ success: true, items_processed_count: processed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await admin
      .from('feed_sync_logs')
      .update({
        status: 'failure',
        message,
        items_processed_count: processed,
      })
      .eq('id', logRow.id);

    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
