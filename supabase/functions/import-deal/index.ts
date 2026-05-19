// import-deal — server-side DEAL importer.
//
// Downloads an .xlsx (already placed in the `deal-imports` storage bucket),
// parses it and creates a DRAFT deal + its products. Built to be called by
// the offer-ingestion agent; an admin reviews the draft and activates it.
//
// Auth: caller must send the project service-role key as a Bearer token.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { parseDealXlsx, type DealCategory } from './parser.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DEFAULT_TIERS = [
  { min_qty: 50, discount_percent: 66 },
  { min_qty: 100, discount_percent: 67 },
  { min_qty: 200, discount_percent: 68 },
];

interface DealMeta {
  title?: string;
  subtitle?: string;
  supplier?: string;
  category?: DealCategory;
  deadline?: string;
  deposit_percent?: number;
  delivery_weeks_min?: number;
  delivery_weeks_max?: number;
  payment_terms?: string;
  tiers?: { min_qty: number; discount_percent: number }[];
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'deal';
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';

  // Auth — only callers holding the service-role key may import.
  const auth = req.headers.get('Authorization') ?? '';
  if (!serviceKey || auth !== `Bearer ${serviceKey}`) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const xlsxPath: string | undefined = body.xlsx_path;
    const meta: DealMeta = body.meta ?? {};
    if (!xlsxPath) return json({ error: 'xlsx_path je povinný' }, 400);

    const supa = createClient(supabaseUrl, serviceKey);

    // 1) fetch the workbook
    const { data: file, error: dlErr } = await supa.storage.from('deal-imports').download(xlsxPath);
    if (dlErr || !file) {
      return json({ error: 'Soubor se nepodařilo načíst: ' + (dlErr?.message ?? 'not found') }, 400);
    }
    const buffer = await file.arrayBuffer();

    // 2) parse
    const parsed = await parseDealXlsx(buffer);

    // 3) assemble the deal (always created as a draft for admin review)
    const title = (meta.title || 'DEAL nabídka').trim();
    const tiers = Array.isArray(meta.tiers) && meta.tiers.length ? meta.tiers : DEFAULT_TIERS;
    const deadline = meta.deadline
      ? new Date(meta.deadline).toISOString()
      : new Date(Date.now() + 14 * 86400000).toISOString();

    const dealPayload = {
      title,
      subtitle: meta.subtitle ?? '',
      supplier: meta.supplier ?? '',
      category: meta.category || parsed.category,
      description: '',
      brands: parsed.brands,
      currency: 'USD',
      tiers,
      deposit_percent: meta.deposit_percent ?? 30,
      delivery_weeks_min: meta.delivery_weeks_min ?? 4,
      delivery_weeks_max: meta.delivery_weeks_max ?? 6,
      payment_terms: meta.payment_terms ?? '',
      deadline,
      status: 'draft',
    };

    // 4) insert the deal — retry slug on collision
    let dealId = '';
    let slug = slugify(title);
    for (let attempt = 0; attempt < 5 && !dealId; attempt++) {
      const trySlug = attempt === 0 ? slug : `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await supa
        .from('deals')
        .insert({ ...dealPayload, slug: trySlug })
        .select('id, slug')
        .single();
      if (!error && data) { dealId = data.id; slug = data.slug; break; }
      if (error && error.code !== '23505') throw new Error('Vytvoření nabídky selhalo: ' + error.message);
    }
    if (!dealId) throw new Error('Nepodařilo se vytvořit nabídku (slug).');

    // 5) insert products in chunks
    const rows = parsed.products.map((p) => ({ deal_id: dealId, ...p }));
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const { error } = await supa.from('deal_products').insert(rows.slice(i, i + CHUNK));
      if (error) throw new Error('Uložení produktů selhalo: ' + error.message);
    }

    return json({
      ok: true,
      deal_id: dealId,
      slug,
      status: 'draft',
      product_count: rows.length,
      images_matched: parsed.imagesMatched,
      brands: parsed.brands,
      category: dealPayload.category,
      warnings: parsed.warnings,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Import selhal.' }, 500);
  }
});
