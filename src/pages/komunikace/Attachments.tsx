import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import {
  FileText, User, StickyNote,
  Download, ExternalLink, Loader2, Play, Mail, Phone,
} from 'lucide-react';
import { useAttachments } from '@/hooks/useComm';
import {
  getSignedUrl, getEmbedUrl, domainOf, normalizeUrl, formatBytes, PARTY_LABELS,
  type CommAttachment,
} from '@/lib/comm';

function whenOf(a: CommAttachment): string {
  return format(new Date(a.created_at), 'd. M. HH:mm', { locale: cs });
}

function useSignedUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (path) getSignedUrl(path).then(u => { if (active) setUrl(u); });
    return () => { active = false; };
  }, [path]);
  return url;
}

export function AttachmentItem({ a, compact = false }: { a: CommAttachment; compact?: boolean }) {
  const signed = useSignedUrl(a.kind === 'image' || a.kind === 'video' ? a.file_path : null);
  const by = PARTY_LABELS[(a.uploaded_label as 'swelt' | 'zago')] ?? a.uploaded_label;
  const meta = `${by} · ${whenOf(a)}`;
  const card = 'rounded-md border p-2 bg-background';
  const maxImg = compact ? 'max-h-32' : 'max-h-40';
  const maxVid = compact ? 'max-h-36' : 'max-h-44';

  // Obrázek — náhled
  if (a.kind === 'image') {
    return (
      <a href={signed ?? '#'} target="_blank" rel="noopener" className={`${card} block hover:bg-muted/50`}>
        {signed
          ? <img src={signed} alt={a.file_name ?? ''} className={`mb-1 ${maxImg} w-full rounded object-cover`} />
          : <div className="mb-1 flex h-24 items-center justify-center rounded bg-muted"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
        <div className="truncate text-xs font-medium">{a.title || a.file_name}</div>
        <div className="text-[10px] text-muted-foreground">{formatBytes(a.size_bytes)} · {meta}</div>
      </a>
    );
  }

  // Video — nahrané
  if (a.kind === 'video' && a.file_path) {
    return (
      <div className={card}>
        {signed
          ? <video src={signed} controls className={`mb-1 ${maxVid} w-full rounded bg-black`} />
          : <div className="mb-1 flex h-24 items-center justify-center rounded bg-muted"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
        <div className="truncate text-xs font-medium">{a.title || a.file_name}</div>
        <div className="text-[10px] text-muted-foreground">{formatBytes(a.size_bytes)} · {meta}</div>
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
        <div className="text-[10px] text-muted-foreground">{domainOf(a.url)} · {meta}</div>
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
          <div className="truncate text-[10px] text-muted-foreground">{domainOf(a.url)} · {meta}</div>
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
            <div className="text-[10px] text-muted-foreground">Kontakt · {meta}</div>
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
        <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground"><StickyNote className="h-3 w-3" /> Poznámka · {meta}</div>
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
        <div className="text-[10px] text-muted-foreground">{formatBytes(a.size_bytes)} · {meta}</div>
      </div>
      <Download className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
    </button>
  );
}

const KIND_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'Vše' },
  { key: 'file', label: 'Soubory' },
  { key: 'image', label: 'Obrázky' },
  { key: 'video', label: 'Videa' },
  { key: 'link', label: 'Odkazy' },
  { key: 'contact', label: 'Kontakty' },
  { key: 'note', label: 'Poznámky' },
];

export function AttachmentList({ topicId }: { topicId: string }) {
  const { data: attachments = [] } = useAttachments(topicId);
  const [filter, setFilter] = useState<string>('all');

  // počty pro každý typ (skryjeme prázdné filtry kromě „Vše")
  const counts = attachments.reduce<Record<string, number>>((acc, a) => {
    acc[a.kind] = (acc[a.kind] ?? 0) + 1;
    return acc;
  }, {});

  const visible = filter === 'all' ? attachments : attachments.filter(a => a.kind === filter);

  return (
    <div className="space-y-2">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {KIND_FILTERS.filter(f => f.key === 'all' || (counts[f.key] ?? 0) > 0).map(f => {
            const n = f.key === 'all' ? attachments.length : (counts[f.key] ?? 0);
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-2 py-0.5 text-[11px] transition ${
                  active ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {f.label} <span className="opacity-60">{n}</span>
              </button>
            );
          })}
        </div>
      )}

      {attachments.length === 0 && (
        <p className="text-xs text-muted-foreground">Zatím nic. Přílohy připojíš ke zprávě v okně chatu níže.</p>
      )}
      {attachments.length > 0 && visible.length === 0 && (
        <p className="text-xs text-muted-foreground">V tomto filtru nic není.</p>
      )}
      {visible.map(a => <AttachmentItem key={a.id} a={a} />)}
    </div>
  );
}
