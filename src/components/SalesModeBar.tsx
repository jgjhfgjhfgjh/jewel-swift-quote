import { X, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

export function SalesModeBar() {
  const { salesCustomer, clearSalesMode } = useStore();

  if (!salesCustomer) return null;

  return (
    <div className="bg-zinc-900 text-white px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4" />
        <span className="font-semibold">
          Režim nabídky pro: {salesCustomer.company_name || 'Zákazník'}
        </span>
        {salesCustomer.ico && (
          <span className="text-zinc-200 text-xs">(IČO: {salesCustomer.ico})</span>
        )}
        {salesCustomer.base_discount > 0 && (
          <span className="bg-zinc-500 rounded px-1.5 py-0.5 text-[10px] font-bold">
            Zákaznická sleva: {salesCustomer.base_discount}%
          </span>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-white hover:bg-zinc-500 gap-1 text-xs"
        onClick={clearSalesMode}
      >
        <X className="h-3.5 w-3.5" />
        Ukončit režim
      </Button>
    </div>
  );
}
