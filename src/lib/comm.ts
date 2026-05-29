import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// ── Typy ───────────────────────────────────────────────────
export type CommTopic = Tables<'comm_topics'>;
export type CommMessage = Tables<'comm_messages'>;
export type CommAttachment = Tables<'comm_attachments'>;
export type CommParticipant = Tables<'comm_participants'>;

export type PartyLabel = 'swelt' | 'zago';
export type AttachmentKind = 'file' | 'image' | 'video' | 'link' | 'contact' | 'note';
export type TopicStatus = 'open' | 'in_progress' | 'resolved';
export type TopicCategory =
  | 'general' | 'pohoda' | 'edi' | 'launch' | 'planning' | 'finance' | 'other';

export const STORAGE_BUCKET = 'comm-files';

// ── Číselníky pro UI ───────────────────────────────────────
export const CATEGORY_LABELS: Record<TopicCategory, string> = {
  general: 'Obecné',
  pohoda: 'Pohoda',
  edi: 'EDI / objednávky',
  launch: 'Spuštění',
  planning: 'Plánování',
  finance: 'Finance / fakturace',
  other: 'Ostatní',
};

export const STATUS_LABELS: Record<TopicStatus, string> = {
  open: 'Otevřené',
  in_progress: 'Řeší se',
  resolved: 'Vyřešené',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Nízká',
  normal: 'Normální',
  high: 'Vysoká',
};

export const PARTY_LABELS: Record<PartyLabel, string> = {
  swelt: 'swelt',
  zago: 'Zago',
};

// ── Pomocné ────────────────────────────────────────────────
export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'kB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

export function normalizeUrl(url: string): string {
  const u = url.trim();
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

export function domainOf(url: string): string {
  try { return new URL(normalizeUrl(url)).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

/** YouTube / Vimeo / Loom → embed URL (jinak null). */
export function getEmbedUrl(url: string): string | null {
  const u = normalizeUrl(url);
  const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/i);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = u.match(/vimeo\.com\/(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  const loom = u.match(/loom\.com\/share\/([\w-]+)/i);
  if (loom) return `https://www.loom.com/embed/${loom[1]}`;
  return null;
}

/** Vrátí label aktuálně přihlášeného uživatele ('swelt' default pro adminy). */
export async function getMyLabel(): Promise<PartyLabel> {
  const { data, error } = await supabase.rpc('comm_my_label');
  if (error || !data) return 'swelt';
  return (data as PartyLabel) ?? 'swelt';
}

// ── Témata ─────────────────────────────────────────────────
export interface TopicFilter {
  status?: TopicStatus | 'all';
  category?: TopicCategory | 'all';
  search?: string;
}

export async function listTopics(filter: TopicFilter = {}): Promise<CommTopic[]> {
  let q = supabase.from('comm_topics').select('*').order('last_activity_at', { ascending: false });
  if (filter.status && filter.status !== 'all') q = q.eq('status', filter.status);
  if (filter.category && filter.category !== 'all') q = q.eq('category', filter.category);
  if (filter.search?.trim()) {
    const s = `%${filter.search.trim()}%`;
    q = q.or(`title.ilike.${s},description.ilike.${s}`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getTopic(id: string): Promise<CommTopic | null> {
  const { data, error } = await supabase.from('comm_topics').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createTopic(input: {
  title: string;
  description?: string;
  category?: TopicCategory;
  priority?: string;
}): Promise<CommTopic> {
  const { data: { user } } = await supabase.auth.getUser();
  const label = await getMyLabel();
  const { data, error } = await supabase
    .from('comm_topics')
    .insert({
      title: input.title,
      description: input.description ?? '',
      category: input.category ?? 'general',
      priority: input.priority ?? 'normal',
      created_by: user?.id ?? null,
      created_label: label,
      awaiting_label: label === 'swelt' ? 'zago' : 'swelt',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateTopicStatus(id: string, status: TopicStatus): Promise<void> {
  const { error } = await supabase.from('comm_topics').update({ status }).eq('id', id);
  if (error) throw error;
}

// ── Zprávy ─────────────────────────────────────────────────
export async function listMessages(topicId: string): Promise<CommMessage[]> {
  const { data, error } = await supabase
    .from('comm_messages')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function postMessage(input: {
  topicId: string;
  body: string;
  format?: 'text' | 'markdown';
  requiresReply?: boolean;
  replyToId?: string | null;
}): Promise<CommMessage> {
  const { data: { user } } = await supabase.auth.getUser();
  const label = await getMyLabel();
  const { data, error } = await supabase
    .from('comm_messages')
    .insert({
      topic_id: input.topicId,
      author_user_id: user?.id ?? null,
      author_label: label,
      body: input.body,
      format: input.format ?? 'text',
      requires_reply: input.requiresReply ?? false,
      reply_to_id: input.replyToId ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

// ── Přílohy ────────────────────────────────────────────────
export async function listAttachments(topicId: string): Promise<CommAttachment[]> {
  const { data, error } = await supabase
    .from('comm_attachments')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

function kindFromMime(mime: string): AttachmentKind {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  return 'file';
}

export async function uploadAttachment(topicId: string, file: File, messageId?: string): Promise<CommAttachment> {
  const { data: { user } } = await supabase.auth.getUser();
  const label = await getMyLabel();
  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const path = `${topicId}/${Date.now()}_${safeName}`;

  const up = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (up.error) throw up.error;

  const { data, error } = await supabase
    .from('comm_attachments')
    .insert({
      topic_id: topicId,
      message_id: messageId ?? null,
      kind: kindFromMime(file.type || ''),
      file_name: file.name,
      file_path: path,
      title: file.name,
      mime_type: file.type || '',
      size_bytes: file.size,
      uploaded_by: user?.id ?? null,
      uploaded_label: label,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/** Přidá nesouborovou přílohu: odkaz, video-odkaz, kontakt nebo poznámku. */
export async function addMetaAttachment(input: {
  topicId: string;
  messageId?: string;
  kind: 'link' | 'video' | 'contact' | 'note';
  title?: string;
  url?: string;
  note?: string;
}): Promise<CommAttachment> {
  const { data: { user } } = await supabase.auth.getUser();
  const label = await getMyLabel();
  const { data, error } = await supabase
    .from('comm_attachments')
    .insert({
      topic_id: input.topicId,
      message_id: input.messageId ?? null,
      kind: input.kind,
      title: input.title ?? null,
      url: input.url ?? null,
      note: input.note ?? null,
      file_name: input.title ?? null,
      uploaded_by: user?.id ?? null,
      uploaded_label: label,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/** Vytvoří dočasnou podepsanou URL pro stažení/náhled přílohy (privátní bucket). */
export async function getSignedUrl(path: string, expiresInSec = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, expiresInSec);
  if (error) return null;
  return data?.signedUrl ?? null;
}

// ── Účastníci ──────────────────────────────────────────────
export interface ParticipantWithEmail {
  user_id: string;
  label: PartyLabel;
  display_name: string;
  email: string;
  created_at: string;
}

export async function listParticipants(): Promise<ParticipantWithEmail[]> {
  const { data, error } = await supabase.rpc('comm_list_participants');
  if (error) throw error;
  return (data ?? []) as ParticipantWithEmail[];
}

export async function addParticipantByEmail(input: {
  email: string;
  label: PartyLabel;
  displayName?: string;
}): Promise<void> {
  const { error } = await supabase.rpc('comm_add_participant_by_email', {
    p_email: input.email,
    p_label: input.label,
    p_display_name: input.displayName ?? '',
  });
  if (error) throw error;
}

export async function removeParticipant(userId: string): Promise<void> {
  const { error } = await supabase.rpc('comm_remove_participant', { p_user_id: userId });
  if (error) throw error;
}

// ── Otázky ─────────────────────────────────────────────────
export async function resolveQuestion(messageId: string, resolved = true): Promise<void> {
  const { error } = await supabase.rpc('comm_resolve_question', { p_message: messageId, p_resolved: resolved });
  if (error) throw error;
}
