import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { toast } from 'sonner';
import { ArrowLeft, Bell, CheckCircle2, Clock, Check, RotateCcw, Eye, CornerUpLeft, Trash2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  useTopic, useMessages, useAttachments,
  useUpdateTopicStatus, useMyLabel, useTopicRealtime, useResolveQuestion,
  useDeleteMessage, useDeleteTopic,
} from '@/hooks/useComm';
import { AttachmentItem, AttachmentList } from './Attachments';
import { MessageComposer, type ReplyTarget } from './MessageComposer';
import { TasksPanel } from './TasksPanel';
import { LightboxProvider } from './Lightbox';
import {
  CATEGORY_LABELS, STATUS_LABELS, PARTY_LABELS,
  type CommAttachment, type CommMessage, type TopicStatus, type TopicCategory, type PartyLabel,
} from '@/lib/comm';

const other = (l: string) => (l === 'swelt' ? 'zago' : 'swelt') as PartyLabel;
const snippet = (s: string, n = 80) => (s.length > n ? s.slice(0, n) + '…' : s);

function scrollToMsg(id: string) {
  const el = document.getElementById(`msg-${id}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('comm-flash');
    setTimeout(() => el.classList.remove('comm-flash'), 1500);
  }
}

export default function ComTopicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();
  useTopicRealtime(id);
  const { data: myLabel } = useMyLabel();
  const { data: topic, isLoading } = useTopic(id);
  const { data: messages = [] } = useMessages(id);
  const { data: attachments = [] } = useAttachments(id);
  const updateStatus = useUpdateTopicStatus();
  const resolve = useResolveQuestion(id!);
  const delMsg = useDeleteMessage(id!);
  const delTopic = useDeleteTopic();
  const bottomRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const [previewLabel, setPreviewLabel] = useState<PartyLabel | null>(null);
  const viewLabel: PartyLabel = previewLabel ?? (myLabel ?? 'swelt');
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, attachments.length]);

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

  const byId = useMemo(() => new Map(messages.map(m => [m.id, m])), [messages]);
  const answerByQuestion = useMemo(() => {
    const map = new Map<string, CommMessage>();
    for (const m of messages) {
      if (m.reply_to_id && !map.has(m.reply_to_id)) map.set(m.reply_to_id, m);
    }
    return map;
  }, [messages]);

  const openQuestions = useMemo(() => messages.filter(m => m.requires_reply && !m.replied), [messages]);
  const answeredQuestions = useMemo(
    () => messages.filter(m => m.requires_reply && m.replied)
      .sort((a, b) => new Date(b.replied_at ?? b.created_at).getTime() - new Date(a.replied_at ?? a.created_at).getTime()),
    [messages]
  );

  function startReply(m: CommMessage) {
    setReplyTo({ id: m.id, body: m.body, author_label: m.author_label });
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  async function setResolved(messageId: string, resolved: boolean) {
    try { await resolve.mutateAsync({ messageId, resolved }); }
    catch (e: any) { toast.error(e?.message ?? 'Akce se nezdařila'); }
  }

  if (isLoading) return <div className="py-16 text-center text-sm text-muted-foreground">Načítám…</div>;
  if (!topic) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">Téma nenalezeno.</p>
        <button onClick={() => navigate('/komunikace')} className="mt-3 text-sm text-primary underline">Zpět na přehled</button>
      </div>
    );
  }

  const awaiting = topic.awaiting_label as PartyLabel | null;

  return (
    <LightboxProvider>
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <style>{`.comm-flash{animation:commflash 1.5s ease-out;}@keyframes commflash{0%{box-shadow:0 0 0 3px rgba(245,158,11,.5);border-radius:1rem;}100%{box-shadow:0 0 0 0 rgba(245,158,11,0);}}`}</style>

      {/* ── Hlavní sloupec ─────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => navigate('/komunikace')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Přehled
          </button>
          {isAdmin && (
            <div className="inline-flex items-center gap-1 rounded-full border bg-background px-1 py-0.5 text-[11px]">
              <Eye className="ml-1 h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Náhled:</span>
              {(['swelt', 'zago'] as PartyLabel[]).map(l => (
                <button
                  key={l}
                  onClick={() => setPreviewLabel(l === (myLabel ?? 'swelt') ? null : l)}
                  className={`rounded-full px-2 py-0.5 transition ${viewLabel === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  {PARTY_LABELS[l]}
                </button>
              ))}
            </div>
          )}
        </div>

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
                  Založil(a) {PARTY_LABELS[topic.created_label as PartyLabel] ?? topic.created_label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={topic.status}
                onChange={e => updateStatus.mutate({ id: topic.id, status: e.target.value as TopicStatus })}
                className="rounded-md border bg-background px-3 py-1.5 text-sm"
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {isAdmin && (
                <button
                  onClick={() => {
                    if (confirm('Smazat celé téma i s celou historií, přílohami a úkoly?')) {
                      delTopic.mutate(topic.id, { onSuccess: () => navigate('/komunikace') });
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                  title="Smazat téma (admin)"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Smazat
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 border-t pt-2">
            {awaiting ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                <Clock className="h-3.5 w-3.5" />
                Na tahu: {PARTY_LABELS[awaiting]}{awaiting === viewLabel ? ' (ty)' : ''} · {openQuestions.length} otevřená otázka(y)
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
            const mine = m.author_label === viewLabel;
            const atts = attByMsg.get(m.id) ?? [];
            const quoted = m.reply_to_id ? byId.get(m.reply_to_id) : undefined;
            const answer = m.requires_reply && m.replied ? answerByQuestion.get(m.id) : undefined;
            return (
              <div key={m.id} id={`msg-${m.id}`} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${mine ? 'bg-primary text-primary-foreground' : 'border bg-background'}`}>
                  {/* citace otázky, na kterou tato zpráva odpovídá */}
                  {quoted && (
                    <button
                      onClick={() => scrollToMsg(quoted.id)}
                      className={`mb-1.5 flex w-full items-start gap-1.5 rounded border-l-2 px-2 py-1 text-left text-[10px] ${
                        mine ? 'border-white/40 bg-white/10 text-primary-foreground/80' : 'border-amber-400 bg-amber-50 text-muted-foreground dark:bg-amber-950/30'
                      }`}
                    >
                      <CornerUpLeft className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      <span className="line-clamp-2">Odpověď na {PARTY_LABELS[quoted.author_label as PartyLabel]}: {snippet(quoted.body || '(příloha)')}</span>
                    </button>
                  )}
                  <div className={`mb-0.5 flex items-center gap-2 text-[10px] ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    <strong>
                      {PARTY_LABELS[m.author_label as PartyLabel] ?? m.author_label}
                      {m.author_name ? ` · ${m.author_name}` : ''}
                    </strong>
                    <span>{format(new Date(m.created_at), 'd. M. yyyy HH:mm', { locale: cs })}</span>
                  </div>
                  {m.body && <div className="whitespace-pre-wrap break-words text-sm">{m.body}</div>}
                </div>

                {atts.length > 0 && (
                  <div className={`mt-1 w-full max-w-[85%] space-y-1.5 ${mine ? 'ml-auto' : ''}`}>
                    {atts.map(a => <AttachmentItem key={a.id} a={a} compact />)}
                  </div>
                )}

                {/* otevřená otázka — akce */}
                {m.requires_reply && !m.replied && (
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      <Bell className="h-3 w-3" /> Čeká na odpověď od {PARTY_LABELS[other(m.author_label)]}
                    </span>
                    <button
                      onClick={() => startReply(m)}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10"
                    >
                      <CornerUpLeft className="h-3 w-3" /> Odpovědět
                    </button>
                    <button
                      onClick={() => setResolved(m.id, true)}
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                    >
                      <Check className="h-3 w-3" /> Označit zodpovězené
                    </button>
                  </div>
                )}

                {/* zodpovězená otázka — stav + odkaz na odpověď */}
                {m.requires_reply && m.replied && (
                  <div className="mt-1 flex flex-col items-start gap-1" style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Zodpovězeno{m.replied_by_label ? ` (${PARTY_LABELS[m.replied_by_label as PartyLabel]})` : ''}
                        {m.replied_at ? ` · ${format(new Date(m.replied_at), 'd. M. HH:mm', { locale: cs })}` : ''}
                      </span>
                      <button
                        onClick={() => setResolved(m.id, false)}
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted"
                      >
                        <RotateCcw className="h-3 w-3" /> Znovu otevřít
                      </button>
                    </div>
                    {answer && (
                      <button onClick={() => scrollToMsg(answer.id)} className="max-w-[85%] text-left text-[10px] text-muted-foreground hover:text-foreground">
                        ↳ Odpověď ({PARTY_LABELS[answer.author_label as PartyLabel]}): {snippet(answer.body || '(příloha)')}
                      </button>
                    )}
                  </div>
                )}

                {/* admin smazání zprávy */}
                {isAdmin && (
                  <button
                    onClick={() => { if (confirm('Smazat tuto zprávu?')) delMsg.mutate(m.id); }}
                    className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 hover:text-destructive"
                    title="Smazat zprávu (admin)"
                  >
                    <Trash2 className="h-3 w-3" /> Smazat
                  </button>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div ref={composerRef}>
          <MessageComposer topicId={id!} replyTo={replyTo} onClearReply={() => setReplyTo(null)} />
        </div>
      </div>

      {/* ── Boční panel ────────────────────────────────────── */}
      <aside className="space-y-4">
        {/* Úkoly / další kroky */}
        <TasksPanel topicId={id!} />

        {/* Otevřené otázky */}
        <div className="rounded-xl border bg-background p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Bell className="h-4 w-4 text-amber-500" /> Nezodpovězené ({openQuestions.length})
          </h2>
          {openQuestions.length === 0 ? (
            <p className="text-xs text-muted-foreground">Žádná otázka nečeká na odpověď.</p>
          ) : (
            <ul className="space-y-2">
              {openQuestions.map(q => (
                <li key={q.id} className="rounded-md border border-amber-200 bg-amber-50/50 p-2 dark:border-amber-900 dark:bg-amber-950/20">
                  <button onClick={() => scrollToMsg(q.id)} className="block w-full text-left">
                    <div className="text-[10px] text-muted-foreground">
                      {PARTY_LABELS[q.author_label as PartyLabel]} se ptá · čeká {PARTY_LABELS[other(q.author_label)]}
                    </div>
                    <div className="line-clamp-2 text-xs">{q.body || '(příloha)'}</div>
                    <div className="text-[10px] text-muted-foreground">{format(new Date(q.created_at), 'd. M. HH:mm', { locale: cs })}</div>
                  </button>
                  <div className="mt-1 flex items-center gap-1.5">
                    <button onClick={() => startReply(q)} className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10">
                      <CornerUpLeft className="h-3 w-3" /> Odpovědět
                    </button>
                    <button onClick={() => setResolved(q.id, true)} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40">
                      <Check className="h-3 w-3" /> Zodpovězeno
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Zodpovězené otázky */}
        <div className="rounded-xl border bg-background p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Zodpovězené ({answeredQuestions.length})
          </h2>
          {answeredQuestions.length === 0 ? (
            <p className="text-xs text-muted-foreground">Zatím nic zodpovězeného.</p>
          ) : (
            <ul className="space-y-2">
              {answeredQuestions.map(q => {
                const ans = answerByQuestion.get(q.id);
                return (
                  <li key={q.id} className="rounded-md border border-emerald-200 bg-emerald-50/40 p-2 dark:border-emerald-900 dark:bg-emerald-950/20">
                    <button onClick={() => scrollToMsg(q.id)} className="block w-full text-left">
                      <div className="text-[10px] text-muted-foreground">
                        {PARTY_LABELS[q.author_label as PartyLabel]} se ptal(a) · odpověděl(a) {q.replied_by_label ? PARTY_LABELS[q.replied_by_label as PartyLabel] : '—'}
                        {q.replied_at ? ` · ${format(new Date(q.replied_at), 'd. M. HH:mm', { locale: cs })}` : ''}
                      </div>
                      <div className="line-clamp-2 text-xs font-medium">{q.body || '(příloha)'}</div>
                    </button>
                    {ans && (
                      <button onClick={() => scrollToMsg(ans.id)} className="mt-0.5 block w-full text-left text-[11px] text-emerald-700 hover:underline dark:text-emerald-300">
                        ↳ {snippet(ans.body || '(příloha)', 70)}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Přílohy */}
        <div className="rounded-xl border bg-background p-4">
          <h2 className="mb-3 text-sm font-semibold">Přílohy ({attachments.length})</h2>
          <AttachmentList topicId={id!} />
        </div>
      </aside>
    </div>
    </LightboxProvider>
  );
}
