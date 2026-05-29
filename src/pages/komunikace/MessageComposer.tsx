import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Send, FileText, Image as ImageIcon, Video, Play, Link2, User, StickyNote,
  X, Loader2, Bell, Paperclip, CornerUpLeft, Mic,
} from 'lucide-react';
import { useSendMessage, type StagedAttachment } from '@/hooks/useComm';
import { domainOf, PARTY_LABELS, type PartyLabel } from '@/lib/comm';
import { Recorder } from './Recorder';

export interface ReplyTarget {
  id: string;
  body: string;
  author_label: string;
}

type Mode = null | 'link' | 'video' | 'contact' | 'note';

const KIND_ICON: Record<string, React.ElementType> = {
  file: FileText, image: ImageIcon, video: Video, audio: Mic, link: Link2, contact: User, note: StickyNote,
};

function stagedLabel(s: StagedAttachment): string {
  if (s.file) return s.file.name;
  if (s.kind === 'note') return s.title || 'Poznámka';
  if (s.kind === 'contact') return s.title || 'Kontakt';
  return s.title || (s.url ? domainOf(s.url) : s.kind);
}

export function MessageComposer({ topicId, replyTo, onClearReply }: {
  topicId: string;
  replyTo?: ReplyTarget | null;
  onClearReply?: () => void;
}) {
  const send = useSendMessage(topicId);
  const [body, setBody] = useState('');
  const [requiresReply, setRequiresReply] = useState(false);
  const [staged, setStaged] = useState<StagedAttachment[]>([]);
  const [showTypes, setShowTypes] = useState(false);
  const [mode, setMode] = useState<Mode>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Když vyberu otázku k odpovědi, zaměř psaní.
  useEffect(() => {
    if (replyTo) taRef.current?.focus();
  }, [replyTo]);

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');

  const fileAny = useRef<HTMLInputElement>(null);
  const fileImg = useRef<HTMLInputElement>(null);
  const fileVid = useRef<HTMLInputElement>(null);

  function resetForm() {
    setMode(null); setUrl(''); setTitle(''); setEmail(''); setPhone(''); setText('');
  }

  function onFile(kind: 'file' | 'image' | 'video') {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setStaged(s => [...s, { kind, file }]);
    };
  }

  function addMeta() {
    if (mode === 'link' || mode === 'video') {
      if (!url.trim()) { toast.error('Zadej odkaz'); return; }
      setStaged(s => [...s, { kind: mode, url: url.trim(), title: title.trim() || undefined }]);
    } else if (mode === 'contact') {
      if (!title.trim()) { toast.error('Zadej jméno'); return; }
      setStaged(s => [...s, { kind: 'contact', title: title.trim(), note: [email.trim(), phone.trim()].filter(Boolean).join('\n') }]);
    } else if (mode === 'note') {
      if (!text.trim()) { toast.error('Zadej text poznámky'); return; }
      setStaged(s => [...s, { kind: 'note', title: title.trim() || undefined, note: text.trim() }]);
    }
    resetForm();
  }

  async function submit() {
    if (!body.trim() && staged.length === 0) return;
    try {
      await send.mutateAsync({ body: body.trim(), requiresReply, staged, replyToId: replyTo?.id ?? null });
      setBody(''); setRequiresReply(false); setStaged([]); setShowTypes(false); resetForm();
      onClearReply?.();
    } catch (e: any) {
      toast.error(e?.message ?? 'Zprávu se nepodařilo odeslat');
    }
  }

  const typeBtn = 'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50';
  const inp = 'w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30';
  const busy = send.isPending;

  return (
    <div className={`rounded-xl border bg-background p-3 ${replyTo ? 'ring-2 ring-amber-300' : ''}`}>
      {/* odpověď na otázku */}
      {replyTo && (
        <div className="mb-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/60 p-2 dark:border-amber-900 dark:bg-amber-950/30">
          <CornerUpLeft className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
              Odpovídáš na otázku od {PARTY_LABELS[(replyTo.author_label as PartyLabel)] ?? replyTo.author_label}
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">{replyTo.body || '(příloha)'}</div>
          </div>
          <button onClick={() => onClearReply?.()} className="text-muted-foreground hover:text-foreground" title="Zrušit odpověď">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* připravené přílohy */}
      {staged.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {staged.map((s, i) => {
            const Icon = KIND_ICON[s.kind] ?? FileText;
            return (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 py-1 pl-2.5 pr-1.5 text-xs">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="max-w-[160px] truncate">{stagedLabel(s)}</span>
                <button onClick={() => setStaged(arr => arr.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <textarea
        ref={taRef}
        value={body}
        onChange={e => setBody(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
        placeholder={replyTo ? 'Napiš odpověď… (Ctrl/⌘ + Enter odešle)' : 'Napiš zprávu… (Ctrl/⌘ + Enter odešle)'}
        rows={2}
        className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />

      {/* typy příloh — jen po rozbalení, aby composer nepřekážel */}
      {showTypes && (
        <div className="mt-2 flex flex-wrap gap-1.5 rounded-md border bg-muted/20 p-2">
          <button className={typeBtn} disabled={busy} onClick={() => fileAny.current?.click()}><FileText className="h-3.5 w-3.5" /> Soubor</button>
          <button className={typeBtn} disabled={busy} onClick={() => fileImg.current?.click()}><ImageIcon className="h-3.5 w-3.5" /> Obrázek</button>
          <button className={typeBtn} disabled={busy} onClick={() => fileVid.current?.click()}><Video className="h-3.5 w-3.5" /> Video</button>
          <button className={typeBtn} disabled={busy} onClick={() => setMode(m => m === 'video' ? null : 'video')}><Play className="h-3.5 w-3.5" /> Video odkaz</button>
          <button className={typeBtn} disabled={busy} onClick={() => setMode(m => m === 'link' ? null : 'link')}><Link2 className="h-3.5 w-3.5" /> Odkaz / web</button>
          <button className={typeBtn} disabled={busy} onClick={() => setMode(m => m === 'contact' ? null : 'contact')}><User className="h-3.5 w-3.5" /> Kontakt</button>
          <button className={typeBtn} disabled={busy} onClick={() => setMode(m => m === 'note' ? null : 'note')}><StickyNote className="h-3.5 w-3.5" /> Poznámka</button>
          <Recorder disabled={busy} onComplete={(file, kind) => setStaged(s => [...s, { kind, file }])} />
        </div>
      )}

      <input ref={fileAny} type="file" className="hidden" onChange={onFile('file')} />
      <input ref={fileImg} type="file" accept="image/*" className="hidden" onChange={onFile('image')} />
      <input ref={fileVid} type="file" accept="video/*" className="hidden" onChange={onFile('video')} />

      {/* inline formulář pro odkaz / kontakt / poznámku */}
      {mode && (
        <div className="mt-2 rounded-md border bg-muted/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold">
              {mode === 'video' ? 'Video odkaz (YouTube / Loom / Vimeo)'
                : mode === 'link' ? 'Odkaz / web'
                : mode === 'contact' ? 'Kontakt' : 'Poznámka'}
            </span>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
          </div>
          <div className="space-y-2">
            {(mode === 'link' || mode === 'video') && (
              <>
                <input className={inp} placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)} autoFocus />
                <input className={inp} placeholder="Popisek (volitelné)" value={title} onChange={e => setTitle(e.target.value)} />
              </>
            )}
            {mode === 'contact' && (
              <>
                <input className={inp} placeholder="Jméno" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
                <input className={inp} placeholder="E-mail (volitelné)" value={email} onChange={e => setEmail(e.target.value)} />
                <input className={inp} placeholder="Telefon (volitelné)" value={phone} onChange={e => setPhone(e.target.value)} />
              </>
            )}
            {mode === 'note' && (
              <>
                <input className={inp} placeholder="Nadpis (volitelné)" value={title} onChange={e => setTitle(e.target.value)} />
                <textarea className={inp} rows={3} placeholder="Text poznámky / úryvek…" value={text} onChange={e => setText(e.target.value)} autoFocus />
              </>
            )}
            <button onClick={addMeta} className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted">
              Připojit ke zprávě
            </button>
          </div>
        </div>
      )}

      {/* spodní lišta */}
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={() => setShowTypes(v => !v)}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition ${
            showTypes ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
          }`}
          title="Připojit přílohu"
        >
          <Paperclip className="h-3.5 w-3.5" /> Příloha
          {staged.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{staged.length}</span>}
        </button>
        <button
          onClick={() => setRequiresReply(v => !v)}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition ${
            requiresReply ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : 'text-muted-foreground hover:bg-muted'
          }`}
          title="Označit, že tato zpráva vyžaduje odpověď druhé strany"
        >
          <Bell className="h-3.5 w-3.5" /> Vyžaduje odpověď
        </button>
        <button
          onClick={submit}
          disabled={busy || (!body.trim() && staged.length === 0)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Odeslat
        </button>
      </div>
    </div>
  );
}
