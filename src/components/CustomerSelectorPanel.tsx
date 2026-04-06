import { useState, useEffect, useMemo } from 'react';
import { Search, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCustomerDiscounts } from '@/hooks/useCustomerDiscounts';
import type { Profile } from '@/hooks/useAuth';

export function CustomerSelectorPanel() {
  const { isAdmin } = useAuthContext();
  const { salesCustomer, setSalesMode, clearSalesMode } = useStore();
  const { fetchDiscounts } = useCustomerDiscounts();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin || !open) return;
    setLoading(true);
    supabase
      .from('profiles')
      .select('*')
      .order('company_name')
      .then(({ data }) => {
        setCustomers(data ?? []);
        setLoading(false);
      });
  }, [isAdmin, open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.company_name.toLowerCase().includes(q) ||
        (c.ico ?? '').toLowerCase().includes(q)
    );
  }, [customers, search]);

  const handleSelect = async (customer: Profile) => {
    const discounts = await fetchDiscounts(customer.user_id);
    setSalesMode(customer, discounts.brandDiscounts, discounts.productDiscounts);
    setOpen(false);
    setSearch('');
  };

  if (!isAdmin) return null;

  // If already in sales mode, don't show selector
  if (salesCustomer) return null;

  return (
    <div className="border-b bg-blue-50/50 dark:bg-blue-950/20">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2 text-sm font-semibold hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-blue-600" />
          Výběr zákazníka – režim nabídky
        </div>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="px-4 pb-3 max-h-[50vh] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-blue-50/50 dark:bg-blue-950/20 pb-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Hledat zákazníka (firma / IČO)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-7 text-xs"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-xs text-muted-foreground py-2">Načítání...</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Žádní zákazníci</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-md border p-2 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{c.company_name || '—'}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      {c.ico && <span>IČO: {c.ico}</span>}
                      {c.base_discount > 0 && (
                        <span className="text-primary font-semibold">Sleva: {c.base_discount}%</span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-[10px] gap-1"
                    onClick={() => handleSelect(c)}
                  >
                    <UserCheck className="h-3 w-3" />
                    Tvořit nabídku
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
