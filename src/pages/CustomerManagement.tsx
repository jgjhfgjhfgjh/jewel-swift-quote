import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/Navbar';
import { DeleteCustomerDialog } from '@/components/DeleteCustomerDialog';
import { ArrowLeft, Save, Trash2, Users, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile } from '@/hooks/useAuth';

interface CustomerRow extends Profile {
  email?: string;
  role?: string;
}

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  admin: { label: 'ADMIN', cls: 'bg-primary/10 text-primary' },
  b2b_approved: { label: 'B2B', cls: 'bg-emerald-500/10 text-emerald-600' },
  lead: { label: 'LEAD — ke schválení', cls: 'bg-amber-500/10 text-amber-600' },
  customer: { label: 'CUSTOMER', cls: 'bg-muted text-muted-foreground' },
};

/** B2B lead (submitted B2B registration, waiting ≤24 h for approval) vs plain lead */
const isB2bLead = (c: CustomerRow) => c.role === 'lead' && !!c.ico?.trim();

const badgeFor = (c: CustomerRow): { label: string; cls: string } => {
  if (c.role === 'lead') {
    return isB2bLead(c)
      ? { label: 'B2B LEAD — ke schválení', cls: 'bg-amber-500/10 text-amber-600' }
      : { label: 'LEAD', cls: 'bg-sky-500/10 text-sky-600' };
  }
  return ROLE_BADGE[c.role ?? 'customer'] ?? ROLE_BADGE.customer;
};

export default function CustomerManagement() {
  const { isAdmin, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDiscounts, setEditingDiscounts] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<CustomerRow | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchCustomers();
  }, [isAdmin]);

  const fetchCustomers = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }, { data: emails }] = await Promise.all([
      supabase.from('profiles').select('*').order('company_name'),
      supabase.from('user_roles').select('user_id, role'),
      // E-maily z auth.users (jen pro admina) — abychom u leadů bez názvu firmy
      // měli co zobrazit a šlo podle e-mailu vyhledávat.
      supabase.rpc('admin_list_customer_emails'),
    ]);

    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) ?? []);
    const emailMap = new Map((emails ?? []).map(e => [e.user_id, e.email]));

    setCustomers(
      (profiles ?? [])
        .map(p => ({
          ...p,
          role: roleMap.get(p.user_id) ?? 'lead',
          email: emailMap.get(p.user_id),
        }))
        // Jen B2B leady (čekají na schválení do 24 h) nahoru — obyčejný lead je
        // běžný účet bez priority, řadí se normálně mezi ostatní
        .sort((a, b) => Number(isB2bLead(b)) - Number(isB2bLead(a)))
    );
    setLoading(false);
  };

  // Filtr podle názvu firmy, e-mailu nebo IČO.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      (c.company_name ?? '').toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.ico ?? '').toLowerCase().includes(q)
    );
  }, [customers, query]);

  const handleSaveDiscount = async (userId: string) => {
    const val = editingDiscounts[userId];
    if (val === undefined) return;
    const discount = Math.min(100, Math.max(0, Number(val) || 0));

    const { error } = await supabase
      .from('profiles')
      .update({ base_discount: discount })
      .eq('user_id', userId);

    if (error) {
      toast.error('Chyba při ukládání: ' + error.message);
    } else {
      toast.success('Sleva uložena');
      setEditingDiscounts(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      fetchCustomers();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Načítání...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="h-14 sm:h-24" />
      <div className="mx-auto w-full max-w-4xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Users className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-semibold">Správa zákazníků</h1>
        </div>

        {/* Hledání podle firmy / e-mailu / IČO */}
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledat podle firmy, e-mailu nebo IČO…"
            className="pl-9"
          />
        </div>

        <div className="rounded-lg border bg-card">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Firma</span>
            <span>IČO</span>
            <span>Sleva %</span>
            <span>Role</span>
            <span></span>
          </div>

          {filtered.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center border-b last:border-0 p-3 hover:bg-muted/40 transition-colors"
            >
              <button
                onClick={() => navigate(`/customers/${c.user_id}`)}
                className="text-left min-w-0"
              >
                {/* Lead bez názvu firmy → ukážeme e-mail, ať admin pozná, o koho jde */}
                <p className="truncate text-sm font-medium hover:text-primary transition-colors">
                  {c.company_name?.trim() || c.email || '—'}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {c.company_name?.trim() && c.email ? c.email : `${c.user_id.slice(0, 8)}...`}
                </p>
              </button>
              <span className="text-xs text-muted-foreground">{c.ico || '—'}</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  className="w-16 h-7 text-xs text-center"
                  value={editingDiscounts[c.user_id] ?? String(c.base_discount)}
                  onChange={(e) =>
                    setEditingDiscounts(prev => ({ ...prev, [c.user_id]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveDiscount(c.user_id)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0"
                  onClick={() => handleSaveDiscount(c.user_id)}
                >
                  <Save className="h-3 w-3" />
                </Button>
              </div>
              <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 whitespace-nowrap ${badgeFor(c).cls}`}>
                {badgeFor(c).label}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => navigate(`/customers/${c.user_id}`)}
                >
                  Detail →
                </Button>
                {c.role !== 'admin' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    title="Smazat zákazníka"
                    onClick={() => setDeleteTarget(c)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              {customers.length === 0 ? 'Žádní zákazníci' : 'Nic neodpovídá hledání'}
            </p>
          )}
        </div>
      </div>

      <DeleteCustomerDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        customer={deleteTarget ? { user_id: deleteTarget.user_id, company_name: deleteTarget.company_name } : null}
        onDeleted={fetchCustomers}
      />
    </div>
  );
}
