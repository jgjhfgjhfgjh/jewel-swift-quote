import { create } from 'zustand';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BigDealSupplierLogo } from '@/components/BigDealSupplierLogo';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

/**
 * Brána do dodavatelské sekce. Suppliers je jiný svět než odběratelský web
 * (jiná značka, jiné publikum), takže přechod nesmí být nechtěný — klik na
 * Suppliers v navigaci otevře tenhle dialog a teprve „Continue" pustí dál
 * na /suppliers.
 *
 * Dialog je namountovaný jednou v App.tsx, otevírá se odkudkoli přes
 * openSupplierGate() — stejný vzor jako EarlyAccessUpsell.
 */
interface GateState {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const useGateStore = create<GateState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
}));

export function openSupplierGate() {
  useGateStore.setState({ open: true });
}

export function SupplierGateDialog() {
  const { open, setOpen } = useGateStore();
  const navigate = useNavigate();

  const goToSuppliers = () => {
    setOpen(false);
    navigate('/suppliers');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden border-none bg-[#0d0d10] p-0 text-white sm:max-w-md">
        <div className="px-7 pb-7 pt-9 text-center">
          <BigDealSupplierLogo className="text-2xl text-white" />

          <DialogTitle className="mt-6 font-sans text-xl font-semibold tracking-tight text-white">
            You&rsquo;re entering the supplier area
          </DialogTitle>
          <DialogDescription className="mx-auto mt-2 max-w-[34ch] text-sm leading-relaxed text-zinc-400">
            This part of the platform is for brands and distributors who want to sell stock through
            us — not for buying.
          </DialogDescription>

          <div className="mt-7 grid gap-2.5">
            <button
              type="button"
              onClick={goToSuppliers}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Back
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
