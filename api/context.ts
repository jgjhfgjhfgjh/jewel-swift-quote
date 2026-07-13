// Context Hub — vrací kompletní context bundle (statická mapa webu + živá KPI)
// pro admin UI, centrální chat (Fáze 2) i externí nástroje. `?format=md` vrátí
// Markdown, jinak JSON.
//
// Auth: Supabase JWT (Authorization: Bearer <token>) admina — ověřeno přes
// public.is_admin() SECURITY DEFINER RPC (stejný vzor jako generate-offer.ts).

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildContextBundle, bundleToMarkdown } from '../src/lib/context/bundle';
import { fetchLiveSnapshot } from './_lib/liveSnapshot.js';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token || !(await isAdmin(token))) {
    res.status(403).json({ error: 'Forbidden — admin only' });
    return;
  }

  const bundle = buildContextBundle('api');
  try {
    bundle.live = await fetchLiveSnapshot(serviceClient());
  } catch {
    // Živý snapshot je best-effort — statická část bundlu má hodnotu i bez něj.
  }

  if (String(req.query.format ?? '').toLowerCase() === 'md') {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.status(200).send(bundleToMarkdown(bundle));
    return;
  }
  res.status(200).json(bundle);
}
