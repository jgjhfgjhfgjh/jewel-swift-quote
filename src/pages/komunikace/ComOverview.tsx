import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cs } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Plus, Search, MessageCircle, Clock, CheckCircle2, Inbox, ChevronRight, X,
} from 'lucide-react';
import { useTopics, useCreateTopic, useMyLabel, useTopicsRealtime } from '@/hooks/useComm';
import {
  CATEGORY_LABELS, STATUS_LABELS, PARTY_LABELS,
  type TopicCategory, type TopicStatus,
} from '@/lib/comm';

const STATUS_STYLE: Record<TopicStatus, string> = {
  open: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
};

function Kpi({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: number; accent: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export default function ComOverview() {
  const navigate = useNavigate();
  useTopicsRealtime();
  const { data: myLabel } = useMyLabel();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TopicStatus | 'all'>('all');
  const [category, setCategory] = useState<TopicCategory | 'all'>('all');
  const { data: topics = [], isLoading } = useTopics({ search, status, category });
  const createTopic = useCreateTopic();

  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'general' as TopicCategory, priority: 'normal',
  });

  // KPI počítáme z nefiltrovaného přehledu by bylo lepší; zde z aktuálního výběru.
  const { data: allTopics = [] } = useTopics({ status: 'all', category: 'all' });
  const kpi = useMemo(() => ({
    open: allTopics.filter(t => t.status === 'open').length,
    awaiting: allTopics.filter(t => t.awaiting_label && t.awaiting_label === myLabel && t.status !== 'resolved').length,
    resolved: allTopics.filter(t => t.status === 'resolved').length,
    total: allTopics.length,
  }), [allTopics, myLabel]);

  async function submitNew() {
    if (!form.title.trim()) { toast.error('Zadej název tématu'); return; }
    try {
      const t = await createTopic.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
      });
      toast.success('Téma vytvořeno');
      setShowNew(false);
      setForm({ title: '', description: '', category: 'general', priority: 'normal' });
      navigate(`/komunikace/t/${t.id}`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Nepodařilo se vytvořit téma');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Přehled</h1>
          <p className="text-sm text-muted-foreground">Témata spolupráce, zprávy a přílohy na jednom místě.</p>
        </div>
        <button
          onClick={() => setShowNew(v => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nové téma
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi icon={Inbox} label="Otevřená témata" value={kpi.open} accent="text-blue-500" />
        <Kpi icon={Clock} label="Čeká na tvou reakci" value={kpi.awaiting} accent="text-amber-500" />
        <Kpi icon={CheckCircle2} label="Vyřešeno" value={kpi.resolved} accent="text-emerald-500" />
        <Kpi icon={MessageCircle} label="Témat celkem" value={kpi.total} accent="text-muted-foreground" />
      </div>

      {/* Nové téma — inline panel */}
      {showNew && (
        <div className="rounded-xl border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Nové téma</h2>
            <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              autoFocus
              placeholder="Název tématu (např. Napojení Pohody)"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <textarea
              placeholder="Krátký popis (volitelné)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex flex-wrap gap-3">
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as TopicCategory }))}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="low">Priorita: Nízká</option>
                <option value="normal">Priorita: Normální</option>
                <option value="high">Priorita: Vysoká</option>
              </select>
              <button
                onClick={submitNew}
                disabled={createTopic.isPending}
                className="ml-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {createTopic.isPending ? 'Vytvářím…' : 'Vytvořit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtry */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Hledat v tématech…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value as any)} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="all">Všechny stavy</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={category} onChange={e => setCategory(e.target.value as any)} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="all">Všechny kategorie</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Seznam témat */}
      <div className="space-y-2">
        {isLoading && <div className="py-10 text-center text-sm text-muted-foreground">Načítám…</div>}
        {!isLoading && topics.length === 0 && (
          <div className="rounded-xl border border-dashed py-12 text-center">
            <Inbox className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Zatím žádná témata. Vytvoř první kliknutím na „Nové téma".</p>
          </div>
        )}
        {topics.map(t => {
          const awaitsMe = t.awaiting_label === myLabel && t.status !== 'resolved';
          return (
            <button
              key={t.id}
              onClick={() => navigate(`/komunikace/t/${t.id}`)}
              className="flex w-full items-center gap-3 rounded-xl border bg-background p-4 text-left transition hover:border-primary/40 hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{t.title}</span>
                  {t.priority === 'high' && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">Vysoká</span>
                  )}
                </div>
                {t.description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{t.description}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                    {CATEGORY_LABELS[t.category as TopicCategory] ?? t.category}
                  </span>
                  <span className={`rounded px-1.5 py-0.5 font-medium ${STATUS_STYLE[t.status as TopicStatus] ?? ''}`}>
                    {STATUS_LABELS[t.status as TopicStatus] ?? t.status}
                  </span>
                  {awaitsMe && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Na tahu jsi ty
                    </span>
                  )}
                  {!awaitsMe && t.awaiting_label && t.status !== 'resolved' && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                      Čeká se na {PARTY_LABELS[t.awaiting_label as 'swelt' | 'zago']}
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    · {formatDistanceToNow(new Date(t.last_activity_at), { addSuffix: true, locale: cs })}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
