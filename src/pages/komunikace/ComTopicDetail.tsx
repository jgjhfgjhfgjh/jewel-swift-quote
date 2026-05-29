import { useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { ArrowLeft, Bell, CheckCircle2, Clock } from 'lucide-react';
import {
  useTopic, useMessages, useAttachments,
  useUpdateTopicStatus, useMyLabel, useTopicRealtime,
} from '@/hooks/useComm';
import { AttachmentItem, AttachmentList } from './Attachments';
import { MessageComposer } from './MessageComposer';
import {
  CATEGORY_LABELS, STATUS_LABELS, PARTY_LABELS,
  type CommAttachment, type CommMessage, type TopicStatus, type TopicCategory,
} from '@/lib/comm';

const other = (l: string) => (l === 'swelt' ? 'zago' : 'swelt') as 'swelt' | 'zago';

export default function ComTopicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useTopicRealtime(id);
  const { data: myLabel } = useMyLabel();
  const { data: topic, isLoading } = useTopic(id);
  const { data: messages = [] } = useMessages(id);
  const { data: attachments = [] } = useAttachments(id);
  const updateStatus = useUpdateTopicStatus();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, attachments.length]);

  // přílohy seskupené podle zprávy (pro zobrazení v chatu)
  const attByMsg = useMemo(() => {
    const map = new Map<string, CommAttachment[]>();
    for (const a of attachments) {
      if (!a.message_id) continue;
      const arr = map.get(a.message_id) ?? [];
      arr.push(a);
      map.set(a.message_id, arr);
    }
    return map;
  }, [attachments]);

  // otevřené otázky (vyžadují odpověď a ještě nezodpovězené)
  const openQuestions = useMemo(
    () => messages.filter(m => m.requires_reply && !m.replied),
    [messages]
  );

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

  const awaiting = topic.awaiting_label as 'swelt' | 'zago' | null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
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

          {/* stav odpovědí */}
          <div className="mt-3 border-t pt-2">
            {awaiting ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                <Clock className="h-3.5 w-3.5" />
                Na tahu: {PARTY_LABELS[awaiting]}{awaiting === myLabel ? ' (ty)' : ''} · {openQuestions.length} otevřená otázka(y)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> Nic nečeká na odpověď
              </span>
            )}
          </div>
        </div>

        {/* Zprávy */}
        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Zatím žádné zprávy — napiš první níže.</p>
          )}
          {messages.map((m: CommMessage) => {
            const mine = m.author_label === myLabel;
            const atts = attByMsg.get(m.id) ?? [];
            return (
              <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${mine ? 'bg-primary text-primary-foreground' : 'border bg-background'}`}>
                  <div className={`mb-0.5 flex items-center gap-2 text-[10px] ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    <strong>{PARTY_LABELS[m.author_label as 'swelt' | 'zago'] ?? m.author_label}</strong>
                    <span>{format(new Date(m.created_at), 'd. M. yyyy HH:mm', { locale: cs })}</span>
                  </div>
                  {m.body && <div className="whitespace-pre-wrap break-words text-sm">{m.body}</div>}
                </div>

                {/* přílohy zprávy — pod bublinou, stejné zarovnání */}
                {atts.length > 0 && (
                  <div className={`mt-1 w-full max-w-[85%] space-y-1.5 ${mine ? 'ml-auto' : ''}`}>
                    {atts.map(a => <AttachmentItem key={a.id} a={a} compact />)}
                  </div>
                )}

                {/* stav „vyžaduje odpověď" */}
                {m.requires_reply && !m.replied && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    <Bell className="h-3 w-3" /> Čeká na odpověď od {PARTY_LABELS[other(m.author_label)]}
                  </span>
                )}
                {m.requires_reply && m.replied && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    Odpověděl(a) {m.replied_by_label ? PARTY_LABELS[m.replied_by_label as 'swelt' | 'zago'] : ''}
                    {m.replied_at ? ` · ${format(new Date(m.replied_at), 'd. M. HH:mm', { locale: cs })}` : ''}
                  </span>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Composer s přílohami */}
        <MessageComposer topicId={id!} />
      </div>

      {/* ── Boční panel ────────────────────────────────────── */}
      <aside className="space-y-4">
        {/* Otevřené otázky */}
        <div className="rounded-xl border bg-background p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Bell className="h-4 w-4 text-amber-500" /> Otevřené otázky ({openQuestions.length})
          </h2>
          {openQuestions.length === 0 ? (
            <p className="text-xs text-muted-foreground">Žádná otázka nečeká na odpověď.</p>
          ) : (
            <ul className="space-y-2">
              {openQuestions.map(q => (
                <li key={q.id} className="rounded-md border border-amber-200 bg-amber-50/50 p-2 dark:border-amber-900 dark:bg-amber-950/20">
                  <div className="text-[10px] text-muted-foreground">
                    {PARTY_LABELS[q.author_label as 'swelt' | 'zago']} se ptá · čeká {PARTY_LABELS[other(q.author_label)]}
                  </div>
                  <div className="line-clamp-2 text-xs">{q.body || '(příloha)'}</div>
                  <div className="text-[10px] text-muted-foreground">{format(new Date(q.created_at), 'd. M. HH:mm', { locale: cs })}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Přílohy (vše v tématu) */}
        <div className="rounded-xl border bg-background p-4">
          <h2 className="mb-3 text-sm font-semibold">Přílohy ({attachments.length})</h2>
          <AttachmentList topicId={id!} />
        </div>
      </aside>
    </div>
  );
}
