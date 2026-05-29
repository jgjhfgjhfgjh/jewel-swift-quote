import { useState } from 'react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { toast } from 'sonner';
import { Plus, Trash2, Check, CalendarClock, ListChecks } from 'lucide-react';
import { useTasks, useCreateTask, useSetTaskDone, useDeleteTask } from '@/hooks/useComm';
import { PARTY_LABELS, type PartyLabel, type CommTask } from '@/lib/comm';

const todayISO = () => new Date().toISOString().slice(0, 10);

function TaskRow({ topicId, t }: { topicId: string; t: CommTask }) {
  const setDone = useSetTaskDone(topicId);
  const del = useDeleteTask(topicId);
  const overdue = !t.done && t.due_date && t.due_date < todayISO();

  return (
    <li className="group flex items-start gap-2 rounded-md border p-2">
      <button
        onClick={() => setDone.mutate({ taskId: t.id, done: !t.done })}
        className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
          t.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-muted-foreground/40 hover:border-primary'
        }`}
        title={t.done ? 'Označit jako nehotové' : 'Označit jako hotové'}
      >
        {t.done && <Check className="h-3 w-3" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className={`text-xs ${t.done ? 'text-muted-foreground line-through' : 'font-medium'}`}>{t.title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="rounded-full border px-1.5 py-0.5 text-muted-foreground">
            {t.assignee_label ? PARTY_LABELS[t.assignee_label as PartyLabel] : 'Kdokoliv'}
          </span>
          {t.due_date && (
            <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 ${
              overdue ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'border text-muted-foreground'
            }`}>
              <CalendarClock className="h-3 w-3" />
              {format(new Date(t.due_date), 'd. M. yyyy', { locale: cs })}{overdue ? ' · po termínu' : ''}
            </span>
          )}
          {t.done && t.done_by_label && (
            <span className="text-emerald-600 dark:text-emerald-400">
              hotovo · {PARTY_LABELS[t.done_by_label as PartyLabel]}
              {t.done_at ? ` · ${format(new Date(t.done_at), 'd. M. HH:mm', { locale: cs })}` : ''}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => del.mutate(t.id)}
        className="flex-shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
        title="Smazat úkol"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

export function TasksPanel({ topicId }: { topicId: string }) {
  const { data: tasks = [] } = useTasks(topicId);
  const create = useCreateTask(topicId);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState<'' | PartyLabel>('');
  const [due, setDue] = useState('');

  const openCount = tasks.filter(t => !t.done).length;

  async function add() {
    if (!title.trim()) { toast.error('Zadej název úkolu'); return; }
    try {
      await create.mutateAsync({ title: title.trim(), assigneeLabel: assignee || null, dueDate: due || null });
      setTitle(''); setAssignee(''); setDue('');
    } catch (e: any) {
      toast.error(e?.message ?? 'Úkol se nepodařilo přidat');
    }
  }

  const inp = 'rounded-md border bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="rounded-xl border bg-background p-4">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        <ListChecks className="h-4 w-4 text-primary" /> Úkoly / další kroky ({openCount})
      </h2>

      {tasks.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {tasks.map(t => <TaskRow key={t.id} topicId={topicId} t={t} />)}
        </ul>
      )}

      {/* přidání */}
      <div className="space-y-1.5">
        <input
          className={`${inp} w-full`}
          placeholder="Nový úkol / další krok…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
        />
        <div className="flex flex-wrap items-center gap-1.5">
          <select className={inp} value={assignee} onChange={e => setAssignee(e.target.value as '' | PartyLabel)} title="Kdo">
            <option value="">Kdokoliv</option>
            <option value="swelt">{PARTY_LABELS.swelt}</option>
            <option value="zago">{PARTY_LABELS.zago}</option>
          </select>
          <input type="date" className={inp} value={due} onChange={e => setDue(e.target.value)} title="Do kdy" />
          <button
            onClick={add}
            disabled={create.isPending}
            className="ml-auto inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" /> Přidat
          </button>
        </div>
      </div>
    </div>
  );
}
