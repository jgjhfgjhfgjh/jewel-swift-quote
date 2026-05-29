import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  FileText, Image as ImageIcon, Video, Link2, User, StickyNote,
  Download, ExternalLink, Loader2, X, Play, Mail, Phone,
} from 'lucide-react';
import { useAttachments, useUploadAttachment, useAddMetaAttachment } from '@/hooks/useComm';
import {
  getSignedUrl, getEmbedUrl, domainOf, normalizeUrl, formatBytes, PARTY_LABELS,
  type CommAttachment,
} from '@/lib/comm';

// ── Adder: nabídka typů příloh + inline formuláře ──────────
type Mode = null | 'link' | 'video' | 'contact' | 'note';

export function AttachmentAdder({ topicId }: { topicId: string }) {
  const upload = useUploadAttachment(topicId);
  const addMeta = useAddMetaAttachment(topicId);
  const [mode, setMode] = useState<Mode>(null);

  const fileAny = useRef<HTMLInputElement>(null);
  const fileImg = useRef<HTMLInputElement>(null);
  const fileVid = useRef<HTMLInputElement>(null);

  // formulářová pole
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');

  function reset() {
    setMode(null); setUrl(''); setTitle(''); setEmail(''); setPhone(''); setText('');
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      await upload.mutateAsync(file);
      toast.success('Příloha nahrána');
    } catch (err: any) {
      toast.error(err?.message ?? 'Nahrání selhalo');
    }
  }

  async function submitMeta() {
    try {
      if (mode === 'link' || mode === 'video') {
        if (!url.trim()) { toast.error('Zadej odkaz'); return; }
        await addMeta.mutateAsync({ kind: mode, url: normalizeUrl(url), title: title.trim() || undefined });
      } else if (mode === 'contact') {
        if (!title.trim()) { toast.error('Zadej jméno'); return; }
        await addMeta.mutateAsync({ kind: 'contact', title: title.trim(), note: [email.trim(), phone.trim()].filter(Boolean).join('\n') });
      } else if (mode === 'note') {
        if (!text.trim()) { toast.error('Zadej text poznámky'); return; }
        await addMeta.mutateAsync({ kind: 'note', title: title.trim() || undefined, note: text.trim() });
      }
      toast.success('Příloha přidána');
      reset();
    } catch (err: any) {
      toast.error(err?.message ?? 'Přidání selhalo');
    }
  }

  const busy = upload.isPending || addMeta.isPending;

  const typeBtn = 'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50';
  const inp = 'w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <button className={typeBtn} disabled={busy} onClick={() => fileAny.current?.click()}><FileText className="h-3.5 w-3.5" /> Soubor</button>
        <button className={typeBtn} disabled={busy} onClick={() => fileImg.current?.click()}><ImageIcon className="h-3.5 w-3.5" /> Obrázek</button>
        <button className={typeBtn} disabled={busy} onClick={() => fileVid.current?.click()}><Video className="h-3.5 w-3.5" /> Video</button>
        <button className={typeBtn} disabled={busy} onClick={() => setMode(m => m === 'video' ? null : 'video')}><Play className="h-3.5 w-3.5" /> Video odkaz</button>
        <button className={typeBtn} disabled={busy} onClick={() => setMode(m => m === 'link' ? null : 'link')}><Link2 className="h-3.5 w-3.5" /> Odkaz / web</button>
        <button className={typeBtn} disabled={busy} onClick={() => setMode(m => m === 'contact' ? null : 'contact')}><User className="h-3.5 w-3.5" /> Kontakt</button>
        <button className={typeBtn} disabled={busy} onClick={() => setMode(m => m === 'note' ? null : 'note')}><StickyNote className="h-3.5 w-3.5" /> Poznámka</button>
        {busy && <Loader2 className="h-4 w-4 animate-spin self-center text-muted-foreground" />}
      </div>

      <input ref={fileAny} type="file" className="hidden" onChange={onFile} />
      <input ref={fileImg} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <input ref={fileVid} type="file" accept="video/*" className="hidden" onChange={onFile} />

      {mode && (
        <div className="rounded-md border bg-muted/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold">
              {mode === 'video' ? 'Video odkaz (YouTube / Loom / Vimeo)'
                : mode === 'link' ? 'Odkaz / web'
                : mode === 'contact' ? 'Kontakt' : 'Poznámka'}
            </span>
            <button onClick={reset} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
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
                <textarea className={inp} rows={4} placeholder="Text poznámky / úryvek…" value={text} onChange={e => setText(e.target.value)} autoFocus />
              </>
            )}
            <button
              onClick={submitMeta}
              disabled={busy}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Přidat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Položka přílohy (render dle typu) ──────────────────────
function useSignedUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (path) getSignedUrl(path).then(u => { if (active) setUrl(u); });
    return () => { active = false; };
  }, [path]);
  return url;
}

function AttachmentItem({ a }: { a: CommAttachment }) {
  const signed = useSignedUrl(a.kind === 'image' || a.kind === 'video' ? a.file_path : null);
  const by = PARTY_LABELS[(a.uploaded_label as 'swelt' | 'zago')] ?? a.uploaded_label;
  const card = 'rounded-md border p-2';

  // Obrázek — náhled
  if (a.kind === 'image') {
    return (
      <a href={signed ?? '#'} target="_blank" rel="noopener" className={`${card} block hover:bg-muted/50`}>
        {signed
          ? <img src={signed} alt={a.file_name ?? ''} className="mb-1 max-h-40 w-full rounded object-cover" />
          : <div className="mb-1 flex h-24 items-center justify-center rounded bg-muted"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
        <div className="truncate text-xs font-medium">{a.title || a.file_name}</div>
        <div className="text-[10px] text-muted-foreground">{formatBytes(a.size_bytes)} · {by}</div>
      </a>
    );
  }

  // Video — nahrané
  if (a.kind === 'video' && a.file_path) {
    return (
      <div className={card}>
        {signed
          ? <video src={signed} controls className="mb-1 max-h-44 w-full rounded bg-black" />
          : <div className="mb-1 flex h-24 items-center justify-center rounded bg-muted"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
        <div className="truncate text-xs font-medium">{a.title || a.file_name}</div>
        <div className="text-[10px] text-muted-foreground">{formatBytes(a.size_bytes)} · {by}</div>
      </div>
    );
  }

  // Video — odkaz (embed nebo externí)
  if (a.kind === 'video' && a.url) {
    const embed = getEmbedUrl(a.url);
    return (
      <div className={card}>
        {embed
          ? <iframe src={embed} className="mb-1 aspect-video w-full rounded" allow="encrypted-media; picture-in-picture" allowFullScreen title={a.title ?? 'video'} />
          : null}
        <a href={normalizeUrl(a.url)} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
          <Play className="h-3.5 w-3.5" /> {a.title || domainOf(a.url)}
        </a>
        <div className="text-[10px] text-muted-foreground">{domainOf(a.url)} · {by}</div>
      </div>
    );
  }

  // Odkaz / web
  if (a.kind === 'link' && a.url) {
    return (
      <a href={normalizeUrl(a.url)} target="_blank" rel="noopener" className={`${card} flex items-center gap-2 hover:bg-muted/50`}>
        <img src={`https://www.google.com/s2/favicons?domain=${domainOf(a.url)}&sz=32`} alt="" className="h-4 w-4 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium">{a.title || domainOf(a.url)}</div>
          <div className="truncate text-[10px] text-muted-foreground">{domainOf(a.url)} · {by}</div>
        </div>
        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
      </a>
    );
  }

  // Kontakt
  if (a.kind === 'contact') {
    const lines = (a.note ?? '').split('\n').map(s => s.trim()).filter(Boolean);
    const email = lines.find(l => l.includes('@'));
    const phone = lines.find(l => !l.includes('@'));
    return (
      <div className={card}>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-600"><User className="h-3.5 w-3.5" /></span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium">{a.title}</div>
            <div className="text-[10px] text-muted-foreground">Kontakt · {by}</div>
          </div>
        </div>
        {email && <a href={`mailto:${email}`} className="mt-1 flex items-center gap-1.5 text-[11px] text-primary hover:underline"><Mail className="h-3 w-3" /> {email}</a>}
        {phone && <a href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 text-[11px] text-primary hover:underline"><Phone className="h-3 w-3" /> {phone}</a>}
      </div>
    );
  }

  // Poznámka
  if (a.kind === 'note') {
    return (
      <div className={`${card} bg-amber-50/50 dark:bg-amber-950/20`}>
        <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground"><StickyNote className="h-3 w-3" /> Poznámka · {by}</div>
        {a.title && <div className="text-xs font-semibold">{a.title}</div>}
        <div className="whitespace-pre-wrap break-words text-xs text-foreground/90">{a.note}</div>
      </div>
    );
  }

  // Soubor (výchozí) — stažení přes podepsanou URL
  return (
    <button
      onClick={async () => {
        if (!a.file_path) return;
        const u = await getSignedUrl(a.file_path);
        if (!u) { toast.error('Soubor se nepodařilo otevřít'); return; }
        const link = document.createElement('a');
        link.href = u; link.target = '_blank'; link.rel = 'noopener';
        link.download = a.file_name ?? 'soubor';
        link.click();
      }}
      className={`${card} flex w-full items-center gap-2 text-left hover:bg-muted/50`}
    >
      <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium">{a.title || a.file_name}</div>
        <div className="text-[10px] text-muted-foreground">{formatBytes(a.size_bytes)} · {by}</div>
      </div>
      <Download className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
    </button>
  );
}

export function AttachmentList({ topicId }: { topicId: string }) {
  const { data: attachments = [] } = useAttachments(topicId);
  return (
    <div className="space-y-2">
      {attachments.length === 0 && (
        <p className="text-xs text-muted-foreground">Zatím nic. Přidej soubor, obrázek, video, odkaz, kontakt nebo poznámku.</p>
      )}
      {attachments.map(a => <AttachmentItem key={a.id} a={a} />)}
    </div>
  );
}
