import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { parseStringPromise } from 'xml2js';
import { createHash } from 'crypto';

const FEED_URL = 'https://b2bzago.com/exchange/B0AF3240-D6D6-45BA-877A-03609E6A1122/xml/feed.xml';

const supabase = createClient(
  process.env.LOVABLE_SUPABASE_URL,
  process.env.LOVABLE_SUPABASE_SERVICE_KEY
);

// ── helpers ──────────────────────────────────────────────────────────────────

function first(val) {
  if (Array.isArray(val)) return val[0] ?? null;
  return val ?? null;
}

function text(val) {
  const v = first(val);
  if (v == null) return null;
  if (typeof v === 'object' && '_' in v) return v._ ?? null;
  return String(v);
}

function num(val) {
  const v = text(val);
  return v == null ? null : Number(v);
}

function md5(...parts) {
  return createHash('md5').update(parts.map(p => p ?? '').join('|')).digest('hex');
}

async function downloadFeed() {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`Feed download failed: ${res.status} ${res.statusText}`);
  return res.text();
}

function parseProducts(parsed) {
  const root = parsed.products ?? parsed.root ?? parsed[Object.keys(parsed)[0]];
  const items = root.product ?? root.item ?? [];
  return Array.isArray(items) ? items : [items];
}

function extractParams(p) {
  if (!p.parameters) return [];
  const parametersNode = Array.isArray(p.parameters) ? p.parameters[0] : p.parameters;
  if (!parametersNode || !parametersNode.param) return [];
  const params = Array.isArray(parametersNode.param) ? parametersNode.param : [parametersNode.param];
  return params
    .map(param => ({
      nazev: text(param.name),
      hodnota: text(param.value),
    }))
    .filter(param => param.nazev && param.hodnota);
}

function extractProduct(p) {
  const imgUrl = text(p.img_url);
  const addImages = p.add_images
    ? (Array.isArray(p.add_images) ? p.add_images : [p.add_images]).map(text).filter(Boolean)
    : [];

  const allImageUrls = [imgUrl, ...addImages].filter(Boolean);
  const params = extractParams(p);

  return {
    sku:               text(p.sku),
    ean:               text(p.ean),
    product_name:      text(p.product_name),
    short_description: text(p.short_description),
    manufacturer:      text(p.manufacturer),
    category_text:     text(p.category_text),
    long_description:  text(p.long_description),
    wholesale_price:   num(p.wholesale_price),
    stock:             num(p.stock),
    img_url:           imgUrl,
    all_image_urls:    allImageUrls,
    params,
  };
}

// ── database ops ──────────────────────────────────────────────────────────────

async function fetchExistingHashes() {
  const { data, error } = await supabase
    .from('produkty')
    .select('sku, content_hash');
  if (error) throw error;
  return new Map(data.map(r => [r.sku, r.content_hash]));
}

async function upsertProduct(product, hash) {
  const now = new Date().toISOString();
  const row = {
    sku:                      product.sku,
    ean:                      product.ean,
    original_name_cz:         product.product_name,
    original_description_cz:  product.long_description,
    short_description:        product.short_description,
    manufacturer:             product.manufacturer,
    category_text:            product.category_text,
    supplier_price:           product.wholesale_price,
    stock_quantity:           product.stock != null ? Math.round(product.stock) : null,
    image_url:                product.img_url,
    image_urls:               product.all_image_urls,
    last_synced_at:           now,
    updated_at:               now,
    content_hash:             hash,
  };

  const { data, error } = await supabase
    .from('produkty')
    .upsert(row, { onConflict: 'sku' })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function saveParams(produktId, params) {
  // Delete old params first
  const { error: delError } = await supabase
    .from('produkty_parametry')
    .delete()
    .eq('produkt_id', produktId);
  if (delError) throw delError;

  if (params.length === 0) return;

  const rows = params.map(p => ({
    produkt_id: produktId,
    nazev: p.nazev,
    hodnota: p.hodnota,
  }));

  const { error } = await supabase.from('produkty_parametry').insert(rows);
  if (error) throw error;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Downloading feed…');
  const xml = await downloadFeed();

  console.log('Parsing XML…');
  const parsed = await parseStringPromise(xml, { explicitArray: true, trim: true });
  const rawProducts = parseProducts(parsed);
  console.log(`Found ${rawProducts.length} products in feed`);

  console.log('Fetching existing hashes from DB…');
  const existing = await fetchExistingHashes();

  const stats = { total: rawProducts.length, new: 0, updated: 0, skipped: 0, errors: 0 };

  for (const raw of rawProducts) {
    const product = extractProduct(raw);

    if (!product.sku) {
      console.warn('[warn] Product without SKU, skipping');
      stats.errors++;
      continue;
    }

    // Include params in hash so changes to params trigger re-sync
    const paramStr = product.params.map(p => `${p.nazev}=${p.hodnota}`).join(';');
    const hash = md5(
      product.product_name,
      product.short_description,
      product.long_description,
      product.wholesale_price != null ? String(product.wholesale_price) : '',
      product.stock           != null ? String(product.stock)           : '',
      paramStr,
    );

    const existingHash = existing.get(product.sku);
    const isNew = existingHash === undefined;

    if (!isNew && existingHash === hash) {
      stats.skipped++;
      continue;
    }

    console.log(`${isNew ? 'NEW' : 'UPD'} ${product.sku} – ${product.product_name}`);

    try {
      const produktId = await upsertProduct(product, hash);
      await saveParams(produktId, product.params);
      if (isNew) stats.new++; else stats.updated++;
    } catch (err) {
      console.error(`  [error] ${product.sku}: ${err.message}`);
      stats.errors++;
    }
  }

  console.log('\n── Summary ──────────────────────────');
  console.log(`Total products : ${stats.total}`);
  console.log(`New            : ${stats.new}`);
  console.log(`Updated        : ${stats.updated}`);
  console.log(`Skipped        : ${stats.skipped}`);
  console.log(`Errors         : ${stats.errors}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
