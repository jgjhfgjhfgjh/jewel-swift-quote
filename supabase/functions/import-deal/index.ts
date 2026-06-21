// import-deal — server-side DEAL importer.
//
// Parses .xlsx offer workbooks from the `deal-imports` storage bucket and
// creates DRAFT deals + products. Called by the offer-ingestion agent.
//
// Input (POST JSON):
//   { message_id: "<gmail msg id>", meta?: {...} }   — import every .xlsx
//          stored under deal-imports/<message_id>/ (one deal per file)
//   { xlsx_path: "<path>", meta?: {...} }            — import a single file
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

const CATEGORY_LABEL: Record<DealCategory, string> = {
  watches: 'Hodinky', jewelry: 'Šperky', general: 'Nabídka',
};

interface DealMeta {
  title?: string;
  subtitle?: string;
  supplier?: string;
  deadline?: string;
  deposit_percent?: number;
  delivery_weeks_min?: number;
  delivery_weeks_max?: number;
  payment_terms?: string;
  tiers?: { min_qty: number; discount_percent: number }[];
  /** Overrides the currency auto-detected from the workbook (e.g. 'EUR', 'USD'). */
  currency?: string;
  /** When set to 'active' the deal goes live immediately; defaults to 'draft'. */
  status?: 'draft' | 'active' | 'ended';
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

// deno-lint-ignore no-explicit-any
type Supa = any;

async function importOne(
  supa: Supa,
  xlsxPath: string,
  meta: DealMeta,
  singleFile: boolean,
) {
  // Idempotency — if a deal was already imported from this workbook, return it.
  const { data: existing } = await supa
    .from('deals')
    .select('id, slug, title, category, brands')
    .eq('source_path', xlsxPath)
    .maybeSingle();
  if (existing?.id) {
    const { count } = await supa
      .from('deal_products')
      .select('id', { count: 'exact', head: true })
      .eq('deal_id', existing.id);
    return {
      deal_id: existing.id,
      slug: existing.slug,
      title: existing.title,
      category: existing.category,
      product_count: count ?? 0,
      images_matched: 0,
      brands: existing.brands ?? [],
      warnings: [],
      already_imported: true,
    };
  }

  const { data: file, error: dlErr } = await supa.storage.from('deal-imports').download(xlsxPath);
  if (dlErr || !file) throw new Error('Soubor se nepodařilo načíst: ' + (dlErr?.message ?? xlsxPath));

  // Guard against workbooks too large to process within one Edge run (memory/time).
  const MAX_BYTES = 45 * 1024 * 1024;
  if (typeof file.size === 'number' && file.size > MAX_BYTES) {
    throw new Error(
      `Soubor je příliš velký (${Math.round(file.size / 1048576)} MB, limit ${MAX_BYTES / 1048576} MB) — rozděl nabídku na menší dávky.`,
    );
  }

  const parsed = await parseDealXlsx(await file.arrayBuffer());

  // Embedded images (Czech export) have no CDN host — upload them to the public
  // deal-images bucket and point each product at the resulting public URL.
  // Resumable: images already uploaded by an earlier (possibly timed-out) run are
  // reused, so a large offer finishes across retries instead of redoing every
  // upload — and each run only does the work that remains.
  const baseDir = xlsxPath.replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9_/-]/g, '_');
  const toUpload: { i: number; name: string; bytes: Uint8Array; contentType: string }[] = [];
  for (let i = 0; i < parsed.products.length; i++) {
    const emb = parsed.productImages[i];
    const p = parsed.products[i];
    if (p.image_url || !emb) continue;
    const ext = emb.ext === 'jpeg' ? 'jpg' : emb.ext;
    const safeSku = (p.sku || String(i)).replace(/[^A-Za-z0-9_-]/g, '') || String(i);
    const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    toUpload.push({ i, name: `${safeSku}.${ext}`, bytes: emb.bytes, contentType });
  }
  if (toUpload.length) {
    const { data: already } = await supa.storage.from('deal-images').list(baseDir, { limit: 100000 });
    const have = new Set((already ?? []).map((f: { name: string }) => f.name));
    const publicUrl = (name: string) =>
      supa.storage.from('deal-images').getPublicUrl(`${baseDir}/${name}`).data.publicUrl;
    const pending = toUpload.filter((u) => !have.has(u.name));
    const CHUNK_IMG = 20;
    for (let i = 0; i < pending.length; i += CHUNK_IMG) {
      await Promise.all(pending.slice(i, i + CHUNK_IMG).map(async (u) => {
        const { error } = await supa.storage.from('deal-images')
          .upload(`${baseDir}/${u.name}`, u.bytes, { contentType: u.contentType, upsert: true });
        if (error) throw new Error('Nahrání obrázku selhalo: ' + error.message);
      }));
    }
    // Point every product (freshly uploaded or reused) at its public URL.
    for (const u of toUpload) parsed.products[u.i].image_url = publicUrl(u.name);
  }

  // Guard — never publish a product without a photo. Drop photoless products so
  // the rest of the offer still goes live; block entirely only if NONE have a
  // photo (which signals a real image-extraction failure, not a few gaps).
  if (meta.status === 'active') {
    const withPhoto = parsed.products.filter((p) => p.image_url);
    const dropped = parsed.products.length - withPhoto.length;
    if (withPhoto.length === 0) {
      throw new Error(
        `Žádný z ${parsed.products.length} produktů nemá fotku — import zastaven (pravděpodobně chyba extrakce obrázků).`,
      );
    }
    if (dropped > 0) {
      const skus = parsed.products.filter((p) => !p.image_url).slice(0, 10).map((p) => p.sku || '?');
      parsed.warnings.push(
        `Vynecháno ${dropped} produktů bez fotky (publikují se jen produkty s fotkou): ${skus.join(', ')}${dropped > 10 ? '…' : ''}`,
      );
      parsed.products = withPhoto;
    }
  }

  const supplier = (meta.supplier ?? '').trim();
  const title = singleFile && meta.title
    ? meta.title.trim()
    : `${supplier || 'DEAL nabídka'} — ${CATEGORY_LABEL[parsed.category]}`;

  const tiers = Array.isArray(meta.tiers) && meta.tiers.length ? meta.tiers : DEFAULT_TIERS;
  const deadline = meta.deadline
    ? new Date(meta.deadline).toISOString()
    : new Date(Date.now() + 14 * 86400000).toISOString();

  const dealPayload = {
    title,
    subtitle: meta.subtitle ?? '',
    supplier,
    category: parsed.category,
    description: '',
    brands: parsed.brands,
    currency: (meta.currency ?? parsed.currency ?? 'EUR').toUpperCase(),
    tiers,
    deposit_percent: meta.deposit_percent ?? 30,
    delivery_weeks_min: meta.delivery_weeks_min ?? 4,
    delivery_weeks_max: meta.delivery_weeks_max ?? 6,
    payment_terms: meta.payment_terms ?? '',
    deadline,
    status: meta.status === 'active' || meta.status === 'ended' ? meta.status : 'draft',
    source_path: xlsxPath,
  };

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

  const rows = parsed.products.map((p) => ({ deal_id: dealId, ...p }));
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supa.from('deal_products').insert(rows.slice(i, i + CHUNK));
    if (error) throw new Error('Uložení produktů selhalo: ' + error.message);
  }

  return {
    deal_id: dealId,
    slug,
    title,
    category: parsed.category,
    product_count: rows.length,
    images_matched: parsed.imagesMatched,
    brands: parsed.brands,
    warnings: parsed.warnings,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const serviceKey = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '').trim();
  const importSecret = (Deno.env.get('DEAL_IMPORT_SECRET') ?? '').trim();
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';

  const token = ((req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')).trim();
  let authorized = false;
  if (token) {
    if (serviceKey && token === serviceKey) authorized = true;
    else if (importSecret && token === importSecret) authorized = true;
    else if (token.split('.').length === 3) {
      // Accept any Supabase JWT carrying the service_role claim — robust
      // against legacy vs. new key formats Supabase has shipped.
      try {
        const payload = JSON.parse(
          atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
        );
        if (payload?.role === 'service_role') authorized = true;
      } catch { /* fall through to 401 */ }
    }
  }
  if (!authorized) return json({ error: 'Unauthorized' }, 401);

  try {
    const body = await req.json().catch(() => ({}));
    const meta: DealMeta = body.meta ?? {};

    // Require the fields the agent must extract — silent defaults here would
    // produce drafts with wrong countdowns or empty terms in production.
    if (!meta.deadline) {
      return json({ error: 'meta.deadline je povinný (ISO 8601 timestamp).' }, 400);
    }
    if (!meta.payment_terms || !meta.payment_terms.trim()) {
      return json({ error: 'meta.payment_terms je povinný.' }, 400);
    }

    const supa = createClient(supabaseUrl, serviceKey);

    // resolve the list of workbook paths to import
    let paths: string[] = [];
    if (typeof body.xlsx_path === 'string' && body.xlsx_path) {
      paths = [body.xlsx_path];
    } else if (typeof body.message_id === 'string' && body.message_id) {
      const prefix = body.message_id.replace(/[^A-Za-z0-9_-]/g, '');
      const { data: files, error } = await supa.storage.from('deal-imports').list(prefix);
      if (error) return json({ error: 'Výpis úložiště selhal: ' + error.message }, 400);
      paths = (files ?? [])
        .filter((f: { name: string }) => f.name.toLowerCase().endsWith('.xlsx'))
        .map((f: { name: string }) => `${prefix}/${f.name}`);
    } else {
      return json({ error: 'Zadejte message_id nebo xlsx_path.' }, 400);
    }

    if (!paths.length) return json({ ok: true, deals: [], note: 'Žádný .xlsx soubor nenalezen.' });

    const singleFile = paths.length === 1;
    const deals = [];
    for (const path of paths) {
      deals.push(await importOne(supa, path, meta, singleFile));
    }
    return json({ ok: true, deals });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Import selhal.' }, 500);
  }
});
