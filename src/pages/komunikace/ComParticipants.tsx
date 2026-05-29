import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus, Trash2, ShieldAlert } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useParticipants, useAddParticipant, useRemoveParticipant } from '@/hooks/useComm';
import { PARTY_LABELS, type PartyLabel } from '@/lib/comm';

export default function ComParticipants() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();
  const { data: participants = [], isLoading } = useParticipants();
  const addParticipant = useAddParticipant();
  const removeParticipant = useRemoveParticipant();

  const [email, setEmail] = useState('');
  const [label, setLabel] = useState<PartyLabel>('zago');
  const [displayName, setDisplayName] = useState('');

  async function add() {
    if (!email.trim()) { toast.error('Zadej e-mail'); return; }
    try {
      await addParticipant.mutateAsync({ email: email.trim(), label, displayName: displayName.trim() });
      toast.success('Účastník přidán');
      setEmail(''); setDisplayName('');
    } catch (e: any) {
      toast.error(e?.message ?? 'Přidání selhalo');
    }
  }

  async function remove(userId: string, name: string) {
    if (!confirm(`Odebrat účastníka ${name}?`)) return;
    try {
      await removeParticipant.mutateAsync(userId);
      toast.success('Účastník odebrán');
    } catch (e: any) {
      toast.error(e?.message ?? 'Odebrání selhalo');
    }
  }

  if (!isAdmin) {
    return (
      <div className="py-16 text-center">
        <ShieldAlert className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Správa účastníků je dostupná jen adminovi.</p>
        <button onClick={() => navigate('/komunikace')} className="mt-3 text-sm text-primary underline">Zpět na přehled</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/komunikace')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Přehled
      </button>

      <div>
        <h1 className="text-xl font-semibold">Účastníci</h1>
        <p className="text-sm text-muted-foreground">
          Přidej Zago (nebo dalšího člena swelt) podle e-mailu. Uživatel se musí nejdřív zaregistrovat na webu.
        </p>
      </div>

      {/* Přidání */}
      <div className="rounded-xl border bg-background p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <UserPlus className="h-4 w-4" /> Přidat účastníka
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_140px_1fr_auto]">
          <input
            placeholder="E-mail účastníka"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <select
            value={label}
            onChange={e => setLabel(e.target.value as PartyLabel)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="zago">Zago</option>
            <option value="swelt">swelt</option>
          </select>
          <input
            placeholder="Jméno (volitelné)"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={add}
            disabled={addParticipant.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {addParticipant.isPending ? 'Přidávám…' : 'Přidat'}
          </button>
        </div>
      </div>

      {/* Seznam */}
      <div className="rounded-xl border bg-background">
        <div className="border-b px-4 py-2.5 text-sm font-semibold">Aktuální účastníci ({participants.length})</div>
        {isLoading && <div className="px-4 py-6 text-sm text-muted-foreground">Načítám…</div>}
        {!isLoading && participants.length === 0 && (
          <div className="px-4 py-6 text-sm text-muted-foreground">Zatím žádní explicitní účastníci. Adminové mají přístup automaticky.</div>
        )}
        <ul className="divide-y">
          {participants.map(p => (
            <li key={p.user_id} className="flex items-center gap-3 px-4 py-3">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white ${
                p.label === 'swelt' ? 'bg-primary' : 'bg-amber-500'
              }`}>
                {(p.display_name || p.email).slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{p.display_name || p.email}</div>
                <div className="truncate text-xs text-muted-foreground">{p.email}</div>
              </div>
              <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                {PARTY_LABELS[p.label]}
              </span>
              <button
                onClick={() => remove(p.user_id, p.display_name || p.email)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Odebrat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
