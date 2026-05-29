import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  ArrowLeft, Send, Paperclip, Download, FileText, Loader2,
} from 'lucide-react';
import {
  useTopic, useMessages, useAttachments, usePostMessage,
  useUploadAttachment, useUpdateTopicStatus, useMyLabel, useTopicRealtime,
} from '@/hooks/useComm';
import {
  CATEGORY_LABELS, STATUS_LABELS, PARTY_LABELS, formatBytes, getSignedUrl,
  type TopicStatus, type TopicCategory,
} from '@/lib/comm';

export default function ComTopicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useTopicRealtime(id);
  const { data: myLabel } = useMyLabel();
  const { data: topic, isLoading } = useTopic(id);
  const { data: messages = [] } = useMessages(id);
  const { data: attachments = [] } = useAttachments(id);
  const postMessage = usePostMessage(id!);
  const uploadAttachment = useUploadAttachment(id!);
  const updateStatus = useUpdateTopicStatus();

  const [draft, setDraft] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll na nejnovější zprávu (i při živém příchodu).
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function send() {
    if (!draft.trim()) return;
    try {
      await postMessage.mutateAsync(draft.trim());
      setDraft('');
    } catch (e: any) {
      toast.error(e?.message ?? 'Zprávu se nepodařilo odeslat');
    }
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAttachment.mutateAsync(file);
      toast.success('Příloha nahrána');
    } catch (err: any) {
      toast.error(err?.message ?? 'Nahrání selhalo');
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function download(path: string, name: string) {
    const url = await getSignedUrl(path);
    if (!url) { toast.error('Soubor se nepodařilo otevřít'); return; }
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.download = name;
    a.click();
  }

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Načítám…</div>;
  }
  if (!topic) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">Téma nenalezeno.</p>
        <button onClick={() => navigate('/komunikace')} className="mt-3 text-sm text-primary underline">Zpět na přehled</button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      {/* ── Hlavní sloupec: vlákno ─────────────────────────── */}
      <div className="space-y-4">
        <button onClick={() => navigate('/komunikace')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Přehled
        </button>

        <div className="rounded-xl border bg-background p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold">{topic.title}</h1>
              {topic.description && <p className="mt-1 text-sm text-muted-foreground">{topic.description}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                  {CATEGORY_LABELS[topic.category as TopicCategory] ?? topic.category}
                </span>
                <span className="text-muted-foreground">
                  Založil(a) {PARTY_LABELS[topic.created_label as 'swelt' | 'zago'] ?? topic.created_label}
                </span>
              </div>
            </div>
            <select
              value={topic.status}
              onChange={e => updateStatus.mutate({ id: topic.id, status: e.target.value as TopicStatus })}
              className="rounded-md border bg-background px-3 py-1.5 text-sm"
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* Zprávy */}
        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Zatím žádné zprávy — napiš první níže.</p>
          )}
          {messages.map(m => {
            const mine = m.author_label === myLabel;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  mine ? 'bg-primary text-primary-foreground' : 'border bg-background'
                }`}>
                  <div className={`mb-0.5 flex items-center gap-2 text-[10px] ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    <strong>{PARTY_LABELS[m.author_label as 'swelt' | 'zago'] ?? m.author_label}</strong>
                    <span>{format(new Date(m.created_at), 'd. M. yyyy HH:mm', { locale: cs })}</span>
                  </div>
                  <div className="whitespace-pre-wrap break-words text-sm">{m.body}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div className="sticky bottom-0 rounded-xl border bg-background p-3">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }}
            placeholder="Napiš zprávu… (Ctrl/⌘ + Enter odešle)"
            rows={3}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={() => fileInput.current?.click()}
              disabled={uploadAttachment.isPending}
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50"
            >
              {uploadAttachment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              Příloha
            </button>
            <input ref={fileInput} type="file" className="hidden" onChange={onPickFile} />
            <button
              onClick={send}
              disabled={postMessage.isPending || !draft.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Odeslat
            </button>
          </div>
        </div>
      </div>

      {/* ── Boční panel: přílohy ───────────────────────────── */}
      <aside className="space-y-3">
        <div className="rounded-xl border bg-background p-4">
          <h2 className="mb-3 text-sm font-semibold">Přílohy ({attachments.length})</h2>
          {attachments.length === 0 && (
            <p className="text-xs text-muted-foreground">Žádné přílohy. Připoj soubor (PDF, obrázek, dokument…) tlačítkem „Příloha".</p>
          )}
          <div className="space-y-2">
            {attachments.map(a => (
              <button
                key={a.id}
                onClick={() => download(a.file_path, a.file_name)}
                className="flex w-full items-center gap-2 rounded-md border p-2 text-left hover:bg-muted/50"
              >
                <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{a.file_name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {formatBytes(a.size_bytes)} · {PARTY_LABELS[a.uploaded_label as 'swelt' | 'zago'] ?? a.uploaded_label}
                  </div>
                </div>
                <Download className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
