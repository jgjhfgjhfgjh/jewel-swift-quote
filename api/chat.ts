import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
  return createClient(url, key);
}

const VERA_SYSTEM_CZ = `Jsi Vera, obchodní zástupkyně swelt.partner.

swelt.partner je B2B platforma pro dropshipping a velkoobchodní prodej šperků. Partneři (dropshippeři a velkoobchodníci) přes platformu přistupují ke katalogu 11 000+ produktů, spravují objednávky a sledují zásilky.

Tvoje role:
- Pomáháš partnerům s katalogem, objednávkami, podmínkami a navigací po platformě
- Jsi přímá, konkrétní a profesionální — žádné plané fráze
- Odpovídáš v jazyce, ve kterém tě osloví (česky nebo anglicky)
- Pokud se tě ptají na technické problémy se stránkou nebo na fakturaci, řekni že předáš dotaz týmu a aby napsali na support@swelt.partner
- Nikdy nevymýšlíš informace, které nemáš — přiznáš to a nabídneš alternativu

Dropshipping na swelt.partner:
- Partner prodává produkty pod vlastní značkou, swelt zajišťuje sklad a expedici
- Dokumenty (faktury, dodací listy) jsou brandované pod partnerovou značkou
- Partner vidí velkoobchodní ceny a nastavuje vlastní marži

Tón: profesionální, přátelský, věcný. Jak by mluvila zkušená obchodní zástupkyně, ne zákaznická linka.`;

const VERA_SYSTEM_EN = `You are Vera, a sales representative at swelt.partner.

swelt.partner is a B2B platform for dropshipping and wholesale jewelry. Partners (dropshippers and wholesalers) access a catalog of 11,000+ products, manage orders, and track shipments through the platform.

Your role:
- Help partners with catalog, orders, platform conditions, and navigation
- Be direct, specific, and professional — no filler phrases
- Respond in the language the user addresses you in (Czech or English)
- If asked about technical issues or invoicing, say you'll forward the inquiry to the team and they should write to support@swelt.partner
- Never make up information you don't have — acknowledge it and offer an alternative

Dropshipping at swelt.partner:
- Partners sell products under their own brand; swelt handles warehousing and fulfillment
- Documents (invoices, packing slips) are branded with the partner's identity
- Partners see wholesale prices and set their own margins

Tone: professional, friendly, factual — how an experienced sales rep talks, not a customer service hotline.`;

const PRODUCT_KEYWORDS_CZ = /produkt|zboží|položk|kategori|hledat|najít|sklad|dostupn|cena|SKU|výrobce|kolekcí|šperky|náhrdelník|náušnic|prsten|náramek|brož|přívěs/i;
const PRODUCT_KEYWORDS_EN = /product|item|find|search|stock|available|price|SKU|category|collection|jewelry|necklace|earring|ring|bracelet|pendant/i;

function isProductQuery(text: string): boolean {
  return PRODUCT_KEYWORDS_CZ.test(text) || PRODUCT_KEYWORDS_EN.test(text);
}

function extractKeyword(text: string): string {
  // Strip common question words and return the most meaningful term
  return text
    .replace(/máte|hledam|najdi|ukažte|existuje|máš|jsou|have|find|show|search|do you|is there/gi, '')
    .replace(/[?!.,]/g, '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 3)
    .join(' ');
}

type ProductRow = {
  sku: string;
  original_name_cz: string | null;
  category_text: string | null;
  stock_quantity: number;
  supplier_price: number | null;
  manufacturer: string | null;
};

async function searchProducts(query: string): Promise<string | null> {
  try {
    const supabase = getSupabase();
    const keyword = extractKeyword(query);
    if (!keyword) return null;

    // Search by name OR category OR SKU — take first meaningful keyword
    const term = keyword.split(' ')[0];
    const { data, error } = await supabase
      .from('products')
      .select('sku, original_name_cz, category_text, stock_quantity, supplier_price, manufacturer')
      .or(`original_name_cz.ilike.%${term}%,category_text.ilike.%${term}%,sku.ilike.%${term}%,manufacturer.ilike.%${term}%`)
      .gt('stock_quantity', 0)
      .limit(6)
      .returns<ProductRow[]>();

    if (error || !data?.length) return null;

    const lines = data.map(p =>
      `- ${p.original_name_cz ?? p.sku} | SKU: ${p.sku} | Kategorie: ${p.category_text ?? '—'} | Sklad: ${p.stock_quantity} ks | Cena: ${p.supplier_price != null ? `${p.supplier_price} Kč` : '—'} | Výrobce: ${p.manufacturer ?? '—'}`
    );

    return `Výsledky hledání v katalogu (${data.length} produktů):\n${lines.join('\n')}`;
  } catch {
    return null;
  }
}

function buildSystemPrompt(lang: 'cs' | 'en', partnerContext?: string, catalogResults?: string | null): string {
  const base = lang === 'cs' ? VERA_SYSTEM_CZ : VERA_SYSTEM_EN;
  const parts = [base];
  if (partnerContext) parts.push(`---\nKontext přihlášeného partnera:\n${partnerContext}`);
  if (catalogResults) parts.push(`---\nAktuální data z katalogu (použij při odpovědi):\n${catalogResults}`);
  return parts.join('\n\n');
}

function detectLang(messages: { role: string; content: string }[]): 'cs' | 'en' {
  const last = messages.findLast(m => m.role === 'user')?.content ?? '';
  const czChars = (last.match(/[áčďéěíňóřšťúůýž]/gi) ?? []).length;
  return czChars > 0 || /\b(jak|kde|co|pro|jsem|mám|chci|moje|vaše)\b/i.test(last) ? 'cs' : 'en';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Access-Control-Allow-Origin', '*');

  const { messages, partnerContext } = req.body as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    partnerContext?: string;
  };

  if (!messages?.length) return res.status(400).json({ error: 'messages required' });

  const lang = detectLang(messages);
  const lastUserMsg = messages.findLast(m => m.role === 'user')?.content ?? '';

  // Pre-fetch catalog results if the message is product-related
  const catalogResults = isProductQuery(lastUserMsg)
    ? await searchProducts(lastUserMsg)
    : null;

  const system = buildSystemPrompt(lang, partnerContext, catalogResults);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system,
    messages: messages.slice(-20),
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
    }
  }

  res.write('data: [DONE]\n\n');
  res.end();
}
