import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.LOVABLE_SUPABASE_URL,
  process.env.LOVABLE_SUPABASE_SERVICE_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const LANGUAGES = [
  { code: 'en', label: 'English', flag: 'preklad_en_hotovy' },
  { code: 'is', label: 'Icelandic', flag: 'preklad_is_hotovy' },
];

const BATCH_SIZE = Number(process.env.TRANSLATE_BATCH_SIZE ?? 50); // products per run (per language)

// ── translation ───────────────────────────────────────────────────────────────

async function translateProduct(product, langCode, langLabel) {
  const prompt = `You are a professional product translator. Translate the following product fields from Czech to ${langLabel}.

Return ONLY a valid JSON object with keys: product_name, short_description, long_description.
Preserve HTML tags if present in the source text.
Keep brand names, model numbers, and technical specifications untranslated.

Source:
product_name: ${product.product_name ?? ''}
short_description: ${product.short_description ?? ''}
long_description: ${product.long_description ?? ''}`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].text.trim();

  // Extract JSON even if model wraps it in markdown code block
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in response: ${raw.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]);
}

// ── database ops ──────────────────────────────────────────────────────────────

async function fetchUntranslated(langFlag) {
  const { data, error } = await supabase
    .from('produkty')
    .select('id, product_name, short_description, long_description')
    .eq(langFlag, false)
    .not('product_name', 'is', null)
    .limit(BATCH_SIZE);
  if (error) throw error;
  return data;
}

async function saveTranslation(produktId, langCode, translation) {
  const row = {
    produkt_id: produktId,
    jazyk: langCode,
    product_name: translation.product_name ?? null,
    short_description: translation.short_description ?? null,
    long_description: translation.long_description ?? null,
  };

  const { error } = await supabase
    .from('produkty_preklady')
    .upsert(row, { onConflict: 'produkt_id,jazyk' });
  if (error) throw error;
}

async function markTranslated(produktId, langFlag) {
  const { error } = await supabase
    .from('produkty')
    .update({ [langFlag]: true })
    .eq('id', produktId);
  if (error) throw error;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  const stats = { translated: 0, errors: 0, remaining: 0 };

  for (const lang of LANGUAGES) {
    console.log(`\n── Translating to ${lang.label} ──────────────────`);

    const products = await fetchUntranslated(lang.flag);
    console.log(`Found ${products.length} products without ${lang.label} translation`);

    for (const product of products) {
      try {
        console.log(`  → ${product.product_name?.slice(0, 60)}`);
        const translation = await translateProduct(product, lang.code, lang.label);
        await saveTranslation(product.id, lang.code, translation);
        await markTranslated(product.id, lang.flag);
        stats.translated++;
      } catch (err) {
        console.error(`  [error] ${product.id}: ${err.message}`);
        stats.errors++;
      }
    }
  }

  // Count remaining untranslated
  const { count: remEn } = await supabase
    .from('produkty')
    .select('id', { count: 'exact', head: true })
    .eq('preklad_en_hotovy', false);

  const { count: remIs } = await supabase
    .from('produkty')
    .select('id', { count: 'exact', head: true })
    .eq('preklad_is_hotovy', false);

  console.log('\n── Summary ──────────────────────────');
  console.log(`Translated this run : ${stats.translated}`);
  console.log(`Errors              : ${stats.errors}`);
  console.log(`Still pending EN    : ${remEn}`);
  console.log(`Still pending IS    : ${remIs}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
