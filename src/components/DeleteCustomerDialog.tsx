import { useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, TriangleAlert } from 'lucide-react';

const CONFIRM_WORD = 'SMAZAT';

interface DeleteCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: { user_id: string; company_name: string | null } | null;
  onDeleted: () => void;
}

/**
 * Dvojité potvrzení smazání zákazníka:
 * krok 1 — varování s výčtem mazaných dat, krok 2 — opsání slova SMAZAT.
 * Samotné smazání provádí edge funkce admin-user-credentials (action delete_user),
 * protože auth.users jde mazat jen service rolí.
 */
export function DeleteCustomerDialog({ open, onOpenChange, customer, onDeleted }: DeleteCustomerDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);

  const name = customer?.company_name || '— bez názvu —';

  const reset = () => {
    setStep(1);
    setConfirmText('');
  };

  const handleOpenChange = (o: boolean) => {
    if (busy) return;
    onOpenChange(o);
    if (!o) reset();
  };

  const handleDelete = async () => {
    if (!customer || confirmText !== CONFIRM_WORD) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('admin-user-credentials', {
      body: { action: 'delete_user', user_id: customer.user_id },
    });
    setBusy(false);
    const errMsg = error?.message || (data as { error?: string })?.error;
    if (errMsg) {
      toast.error('Smazání selhalo: ' + errMsg);
      return;
    }
    const warnings = (data as { warnings?: string[] })?.warnings ?? [];
    if (warnings.length > 0) {
      toast.warning('Zákazník smazán, ale část dat se nepodařilo uklidit: ' + warnings.join(', '));
    } else {
      toast.success(`Zákazník ${name} byl trvale smazán`);
    }
    onOpenChange(false);
    reset();
    onDeleted();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <TriangleAlert className="h-5 w-5" />
                Smazat zákazníka?
              </DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-2 pt-2 text-sm">
                  <p>
                    Chystáte se trvale smazat zákazníka{' '}
                    <span className="font-semibold text-foreground">{name}</span>.
                  </p>
                  <p>Smaže se:</p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    <li>přihlašovací účet (email + heslo)</li>
                    <li>profil firmy, role a všechny slevy</li>
                    <li>objednané služby a wishlist</li>
                  </ul>
                  <p className="font-medium text-destructive">Tato akce je nevratná.</p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>Zrušit</Button>
              <Button variant="destructive" onClick={() => setStep(2)}>Pokračovat</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Potvrzení smazání
              </DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-2 pt-2 text-sm">
                  <p>
                    Pro definitivní smazání zákazníka{' '}
                    <span className="font-semibold text-foreground">{name}</span>{' '}
                    napište <span className="font-mono font-semibold text-foreground">{CONFIRM_WORD}</span>:
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={busy}>
                Zrušit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={busy || confirmText !== CONFIRM_WORD}
              >
                {busy ? 'Mažu…' : 'Smazat trvale'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
