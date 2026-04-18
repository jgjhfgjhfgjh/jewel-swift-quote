// Supplier feed sync: XML -> parse -> translate (cached) -> safe upsert
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── Configuration ──────────────────────────────────────────────────────────
// Placeholder multiplier for currency conversion (e.g. EUR -> ISK).
// Adjust here or move to feed_config.mapping_rules later.
const CURRENCY_MULTIPLIER = 1; // supplier_price stays in source currency for now

// Fields managed manually in the admin — NEVER overwrite on sync.
const PROTECTED_FIELDS = new Set<string>([
  'custom_margin',
  'manual_price_isk',
  'is_featured',
  'admin_manual_override',
  'admin_notes',
]);

// ─── Types ──────────────────────────────────────────────────────────────────
interface RawFeedProduct {
  product_id?: string | number;
  product_name?: string;
  manufacturer?: string;
  sku?: string;
  ean?: string | number;
  long_description?: string;
  short_description?: string;
  category_text?: string;
  img_url?: string;
  add_images?: string | string[] | { '#text'?: string } | Array<string | { '#text'?: string }>;
  wholesale_price?: string | number;
  retail_price?: string | number;
  stock?: string | number;
}

interface NormalizedProduct {
  sku: string;
  original_name_cz: string | null;
  original_description_cz: string | null;
  supplier_price: number | null;
  stock_quantity: number;
  image_url: string | null;
  image_urls: string[];
  manufacturer: string | null;
  ean: string | null;
  category_text: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function toInt(v: unknown): number {
  const n = toNumber(v);
  return n === null ? 0 : Math.max(0, Math.trunc(n));
}

function strOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function extractAddImages(v: RawFeedProduct['add_images']): string[] {
  if (v === null || v === undefined) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr
    .map((item) => {
      if (item === null || item === undefined) return null;
      if (typeof item === 'string' || typeof item === 'number') return strOrNull(item);
      if (typeof item === 'object' && '#text' in item) return strOrNull((item as { '#text'?: string })['#text']);
      return strOrNull(item);
    })
    .filter((s): s is string => !!s);
}

function normalize(p: RawFeedProduct): NormalizedProduct | null {
  const sku = strOrNull(p.sku);
  if (!sku) return null;
  const price = toNumber(p.wholesale_price) ?? toNumber(p.retail_price);
  const mainImg = strOrNull(p.img_url);
  const addImgs = extractAddImages(p.add_images);
  const image_urls = [mainImg, ...addImgs].filter((s): s is string => !!s);
  return {
    sku,
    original_name_cz: strOrNull(p.product_name),
    original_description_cz:
      strOrNull(p.short_description) ?? strOrNull(p.long_description),
    supplier_price: price === null ? null : Number((price * CURRENCY_MULTIPLIER).toFixed(4)),
    stock_quantity: toInt(p.stock),
    image_url: mainImg,
    image_urls,
    manufacturer: strOrNull(p.manufacturer),
    ean: strOrNull(p.ean),
    category_text: strOrNull(p.category_text),
  };
}

async function fetchAndParseFeed(url: string): Promise<RawFeedProduct[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status} ${res.statusText}`);
  const xml = await res.text();
  const parser = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: true,
    trimValues: true,
  });
  const parsed = parser.parse(xml);
  const list = parsed?.products?.product;
  if (!list) return [];
  return Array.isArray(list) ? (list as RawFeedProduct[]) : [list as RawFeedProduct];
}

// ─── Translation (cache + Lovable AI) ───────────────────────────────────────
interface TranslateResult {
  text: string;
  cached: boolean;
}

async function translateCZtoIS(
  admin: ReturnType<typeof createClient>,
  text: string,
  apiKey: string,
): Promise<TranslateResult> {
  const trimmed = text.trim();
  if (!trimmed) return { text: '', cached: true };

  const hash = await sha256(`cs|is|${trimmed}`);

  // 1) Cache lookup
  const { data: cached } = await admin
    .from('translation_cache')
    .select('translated_text')
    .eq('source_hash', hash)
    .maybeSingle();
  if (cached?.translated_text) {
    return { text: cached.translated_text as string, cached: true };
  }

  // 2) AI call via Lovable AI Gateway
  const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional jewelry marketing translator. Translate the user text from Czech to natural, marketing-friendly Icelandic. Keep brand names, SKUs and measurements as-is. Return ONLY the translated text — no quotes, no explanations.',
        },
        { role: 'user', content: trimmed },
      ],
    }),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`AI translate failed (${resp.status}): ${body.slice(0, 200)}`);
  }
  const json = await resp.json();
  const translated = String(json?.choices?.[0]?.message?.content ?? '').trim();
  if (!translated) throw new Error('AI returned empty translation');

  // 3) Cache write (best-effort)
  await admin
    .from('translation_cache')
    .insert({
      source_hash: hash,
      source_lang: 'cs',
      target_lang: 'is',
      source_text: trimmed,
      translated_text: translated,
    });

  return { text: translated, cached: false };
}

// ─── Main handler ───────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

  // Auth: admin only
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

  const admin = createClient(supabaseUrl, serviceKey);

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

  let parsedCount = 0;
  let upsertedCount = 0;
  let newlyTranslated = 0;
  const errors: string[] = [];

  try {
    const { data: config, error: cfgErr } = await admin
      .from('feed_config')
      .select('id, feed_url')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    if (cfgErr) throw new Error(`Config load failed: ${cfgErr.message}`);
    if (!config?.feed_url) throw new Error('Feed URL is not configured');

    const raw = await fetchAndParseFeed(config.feed_url);
    parsedCount = raw.length;

    for (const r of raw) {
      try {
        const norm = normalize(r);
        if (!norm) continue;

        // Translate name + description (cached)
        const nameRes = norm.original_name_cz
          ? await translateCZtoIS(admin, norm.original_name_cz, lovableApiKey)
          : { text: '', cached: true };
        const descRes = norm.original_description_cz
          ? await translateCZtoIS(admin, norm.original_description_cz, lovableApiKey)
          : { text: '', cached: true };
        if (!nameRes.cached) newlyTranslated += 1;
        if (!descRes.cached) newlyTranslated += 1;

        // Build the safe payload — NEVER include PROTECTED_FIELDS
        const payload: Record<string, unknown> = {
          sku: norm.sku,
          original_name_cz: norm.original_name_cz,
          original_description_cz: norm.original_description_cz,
          product_name_is: nameRes.text || null,
          description_is: descRes.text || null,
          supplier_price: norm.supplier_price,
          stock_quantity: norm.stock_quantity,
          image_url: norm.image_url,
          image_urls: norm.image_urls,
          manufacturer: norm.manufacturer,
          ean: norm.ean,
          category_text: norm.category_text,
          last_synced_at: new Date().toISOString(),
        };
        for (const k of Object.keys(payload)) {
          if (PROTECTED_FIELDS.has(k)) delete payload[k];
        }

        const { error: upErr } = await admin
          .from('products')
          .upsert(payload, { onConflict: 'sku', ignoreDuplicates: false });
        if (upErr) throw new Error(`Upsert ${norm.sku}: ${upErr.message}`);
        upsertedCount += 1;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(msg);
        if (errors.length >= 25) break; // avoid runaway
      }
    }

    await admin
      .from('feed_config')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', config.id);

    const summary =
      `Parsed: ${parsedCount} · Upserted: ${upsertedCount} · ` +
      `Newly translated: ${newlyTranslated} · Errors: ${errors.length}` +
      (errors.length ? ` — first: ${errors[0]}` : '');

    await admin
      .from('feed_sync_logs')
      .update({
        status: errors.length && upsertedCount === 0 ? 'failure' : 'success',
        message: summary,
        items_processed_count: upsertedCount,
      })
      .eq('id', logRow.id);

    return new Response(
      JSON.stringify({
        success: true,
        parsed: parsedCount,
        upserted: upsertedCount,
        newly_translated: newlyTranslated,
        errors_count: errors.length,
        sample_errors: errors.slice(0, 5),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await admin
      .from('feed_sync_logs')
      .update({
        status: 'failure',
        message: `${message} (parsed=${parsedCount}, upserted=${upsertedCount})`,
        items_processed_count: upsertedCount,
      })
      .eq('id', logRow.id);

    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
