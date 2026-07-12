// Admin-only: generate the luxury-tone copy for a priced offer. The admin enters
// only the price; Claude drafts the persuasive body (heritage, investment angle,
// maintenance, why-buy-from-us). The draft is stored on the inquiry for the admin
// to review/edit in the ERP before sending as a rich HTML offer e-mail.
//
// Auth: requires a Supabase JWT (Authorization: Bearer <token>) belonging to an
// admin — verified via the public.is_admin() SECURITY DEFINER function.

import Anthropic from '@anthropic-ai/sdk';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { enrichWatches } from './_lib/offerEmail.js';

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

interface InquiryRow {
  id: string;
  name: string;
  purchase_type: string;
  quantity: string | null;
  note: string | null;
  watches: { brand: string; model: string; custom?: boolean }[];
}

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
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) ?? {};
  const inquiryId: string = body.inquiryId;
  const price: string = String(body.price ?? '').trim();
  const currency: string = String(body.currency ?? 'CZK').trim() || 'CZK';
  if (!inquiryId || !price) {
    res.status(400).json({ error: 'inquiryId and price are required' });
    return;
  }

  const supabase = serviceClient();
  const { data: inquiry, error } = await supabase
    .from('prestige_inquiries')
    .select('id, name, purchase_type, quantity, note, watches')
    .eq('id', inquiryId)
    .single<InquiryRow>();
  if (error || !inquiry) {
    res.status(404).json({ error: 'Inquiry not found' });
    return;
  }

  const watches = await enrichWatches(inquiry.watches);
  const modelsCtx = watches.length
    ? watches
        .map((w) => `- ${w.brand} ${w.model}${w.collection ? ` (kolekce ${w.collection})` : ''}${w.desc ? `: ${w.desc}` : ''}`)
        .join('\n')
    : '(bez konkrétního modelu — dle konzultace)';

  const prompt = `Napiš tělo osobního nabídkového e-mailu pro klienta v segmentu luxusních hodinek. Tón: prémiový, vřelý, sebejistý, ale nikoliv nafoukaný. Česky, vykej.

KLIENT
Jméno: ${inquiry.name}
Typ nákupu: ${inquiry.purchase_type === 'company' ? 'na firmu (velkoobchodní cena)' : 'osobní'}
Počet kusů: ${inquiry.quantity ?? '1 kus'}
Poznámka klienta: ${inquiry.note ?? '(žádná)'}

NABÍZENÉ MODELY
${modelsCtx}

CENA (nepiš ji do textu — doplní ji šablona): ${price} ${currency}

STRUKTURA (3–5 odstavců, oddělené prázdným řádkem, BEZ nadpisů, BEZ ceny, BEZ pozdravu a podpisu):
1. Osobní úvod — poděkuj za zájem a naznač, že jsi pro klienta nabídku připravil na míru.
2. Pro každý model 2–3 věty: proč je to skvělá volba — dědictví/příběh značky, nadčasovost, a jemně investiční hodnota (drží cenu).
3. Krátce ujisti o pravosti a plné dokumentaci a o tom, že se postaráme i po nákupu (servis, údržba).
4. Zakonči vřelou pobídkou k dalšímu kroku (potvrzení nabídky), bez tlaku.

Piš plynulý text, žádné odrážky. Maximálně ~320 slov.`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let draft = '';
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1100,
      messages: [{ role: 'user', content: prompt }],
    });
    draft = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
  } catch (e) {
    res.status(502).json({ error: `AI generation failed: ${e instanceof Error ? e.message : String(e)}` });
    return;
  }
  if (!draft) {
    res.status(502).json({ error: 'AI returned empty draft' });
    return;
  }

  await supabase
    .from('prestige_inquiries')
    .update({ offer_price: price, offer_currency: currency, offer_draft: draft })
    .eq('id', inquiryId);

  res.status(200).json({ ok: true, draft });
}
