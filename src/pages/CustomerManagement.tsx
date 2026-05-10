import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Save, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile } from '@/hooks/useAuth';

interface CustomerRow extends Profile {
  email?: string;
  role?: string;
}

export default function CustomerManagement() {
  const { isAdmin, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDiscounts, setEditingDiscounts] = useState<Record<string, string>>({});

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
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('company_name');

    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');

    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) ?? []);

    setCustomers(
      (profiles ?? []).map(p => ({
        ...p,
        role: roleMap.get(p.user_id) ?? 'customer',
      }))
    );
    setLoading(false);
  };

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
      <div className="h-14" />
      <div className="mx-auto w-full max-w-4xl p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Users className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-semibold">Správa zákazníků</h1>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Firma</span>
            <span>IČO</span>
            <span>Sleva %</span>
            <span>Role</span>
            <span></span>
          </div>

          {customers.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center border-b last:border-0 p-3 hover:bg-muted/40 transition-colors"
            >
              <button
                onClick={() => navigate(`/customers/${c.user_id}`)}
                className="text-left"
              >
                <p className="text-sm font-medium hover:text-primary transition-colors">{c.company_name || '—'}</p>
                <p className="text-[10px] text-muted-foreground">{c.user_id.slice(0, 8)}...</p>
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
              <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${
                c.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {c.role === 'admin' ? 'ADMIN' : 'CUSTOMER'}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => navigate(`/customers/${c.user_id}`)}
              >
                Detail →
              </Button>
            </div>
          ))}

          {customers.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">Žádní zákazníci</p>
          )}
        </div>
      </div>
    </div>
  );
}
