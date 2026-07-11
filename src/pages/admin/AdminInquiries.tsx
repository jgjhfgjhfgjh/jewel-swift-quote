import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, RefreshCw, Inbox, Sparkles, CalendarDays, CheckCircle2, ChevronDown,
  Building2, User as UserIcon, Mail, Phone, Package, Coins,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Status = 'new' | 'in_progress' | 'quoted' | 'closed';

interface InquiryWatch { id?: string; brand: string; model: string; custom?: boolean }

interface Inquiry {
  id: string;
  created_at: string;
  status: Status;
  purchase_type: 'personal' | 'company';
  company: string | null;
  ico: string | null;
  name: string;
  email: string;
  phone_code: string | null;
  phone: string | null;
  quantity: string | null;
  budget: string | null;
  note: string | null;
  watches: InquiryWatch[];
  admin_note: string | null;
}

const STATUS: { key: Status; label: string; cls: string }[] = [
  { key: 'new', label: 'Nová', cls: 'bg-blue-500/15 text-blue-600' },
  { key: 'in_progress', label: 'V řešení', cls: 'bg-amber-500/15 text-amber-600' },
  { key: 'quoted', label: 'Naceněno', cls: 'bg-violet-500/15 text-violet-600' },
  { key: 'closed', label: 'Uzavřeno', cls: 'bg-emerald-500/15 text-emerald-600' },
];
const statusMeta = (s: string) => STATUS.find((x) => x.key === s) ?? STATUS[0];

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export default function AdminInquiries() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuthContext();
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('prestige_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    setRows((data ?? []) as unknown as Inquiry[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) { navigate('/'); return; }
    if (isAdmin) void load();
  }, [isAdmin, authLoading, navigate, load]);

  const kpi = useMemo(() => {
    const weekAgo = Date.now() - 7 * 864e5;
    return {
      total: rows.length,
      neu: rows.filter((r) => r.status === 'new').length,
      week: rows.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length,
      closed: rows.filter((r) => r.status === 'closed').length,
    };
  }, [rows]);

  const shown = useMemo(
    () => (filter === 'all' ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  async function setStatus(id: string, status: Status) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    const { error } = await supabase.from('prestige_inquiries').update({ status }).eq('id', id);
    if (error) { toast.error('Změna stavu selhala'); void load(); }
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Poptávky — prémiový segment</h1>
            <p className="text-xs text-muted-foreground">Nezávazné poptávky z /prestige (Luxury na poptávku).</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void load()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Kpi icon={<Inbox className="h-3.5 w-3.5" />} label="Celkem" value={String(kpi.total)} />
              <Kpi icon={<Sparkles className="h-3.5 w-3.5" />} label="Nové" value={String(kpi.neu)} />
              <Kpi icon={<CalendarDays className="h-3.5 w-3.5" />} label="Tento týden" value={String(kpi.week)} />
              <Kpi icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Uzavřené" value={String(kpi.closed)} />
            </div>

            {/* Status filter */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFilter('all')}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filter === 'all' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-border bg-card text-muted-foreground hover:border-zinc-400'}`}>
                Vše ({rows.length})
              </button>
              {STATUS.map((s) => (
                <button key={s.key} onClick={() => setFilter(s.key)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filter === s.key ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-border bg-card text-muted-foreground hover:border-zinc-400'}`}>
                  {s.label} ({rows.filter((r) => r.status === s.key).length})
                </button>
              ))}
            </div>

            {/* List */}
            <div className="overflow-hidden rounded-lg border bg-card">
              {shown.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">Žádné poptávky.</p>
              ) : (
                <div className="divide-y">
                  {shown.map((r) => {
                    const meta = statusMeta(r.status);
                    const open = openId === r.id;
                    return (
                      <div key={r.id}>
                        {/* Row header */}
                        <button
                          type="button"
                          onClick={() => setOpenId(open ? null : r.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                        >
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${meta.cls}`}>{meta.label}</span>
                          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                            {r.purchase_type === 'company' ? <Building2 className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {r.purchase_type === 'company' && r.company ? `${r.company} — ` : ''}{r.name}
                          </span>
                          <span className="hidden shrink-0 truncate text-xs text-muted-foreground sm:block">
                            {r.watches?.length ? `${r.watches.length} ${r.watches.length === 1 ? 'model' : 'modely'}` : '—'}
                          </span>
                          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: '2-digit' })}
                          </span>
                          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Detail */}
                        {open && (
                          <div className="grid gap-4 border-t bg-muted/20 px-4 py-4 md:grid-cols-2">
                            <div className="space-y-2 text-sm">
                              <p className="flex items-center gap-2"><UserIcon className="h-3.5 w-3.5 text-muted-foreground" /> {r.name}</p>
                              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> <a href={`mailto:${r.email}`} className="text-primary hover:underline">{r.email}</a></p>
                              {r.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {r.phone_code} {r.phone}</p>}
                              <p className="flex items-center gap-2">
                                {r.purchase_type === 'company' ? <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> : <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />}
                                {r.purchase_type === 'company'
                                  ? <>Na firmu{r.company ? ` · ${r.company}` : ''}{r.ico ? ` · IČO ${r.ico}` : ''}</>
                                  : 'Osobní nákup'}
                              </p>
                              <p className="flex items-center gap-2"><Package className="h-3.5 w-3.5 text-muted-foreground" /> {r.quantity ?? '1 kus'}</p>
                              {r.budget && <p className="flex items-center gap-2"><Coins className="h-3.5 w-3.5 text-muted-foreground" /> {r.budget}</p>}
                              {r.note && <p className="rounded-md bg-card p-2 text-xs text-muted-foreground">{r.note}</p>}
                            </div>

                            <div className="space-y-3">
                              <div>
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Poptávané modely</p>
                                {r.watches?.length ? (
                                  <ul className="space-y-0.5 text-sm">
                                    {r.watches.map((w, i) => (
                                      <li key={i}><span className="font-medium">{w.brand}</span> {w.model}</li>
                                    ))}
                                  </ul>
                                ) : <p className="text-sm text-muted-foreground">Neuvedeno</p>}
                              </div>
                              <div>
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stav</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {STATUS.map((s) => (
                                    <button
                                      key={s.key} type="button"
                                      onClick={() => setStatus(r.id, s.key)}
                                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${r.status === s.key ? s.cls + ' ring-1 ring-inset ring-current' : 'bg-card text-muted-foreground hover:bg-muted'}`}
                                    >
                                      {s.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
