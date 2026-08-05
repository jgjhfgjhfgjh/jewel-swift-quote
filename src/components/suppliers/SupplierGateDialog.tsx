import { create } from 'zustand';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
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
    /* Vzhled dle reference: tmavá zaoblená karta, kruhové X vpravo nahoře,
       kruhová ikona s fajfkou, tučný titulek, šedý subtext a jediné velké
       bílé pilulkové „Continue" (zpět = X / klik mimo). Výchozí zavírací
       křížek shadcn dialogu skrývá [&>button]:hidden — nahrazuje ho vlastní
       kruhové tlačítko. */
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden rounded-[28px] border-none bg-[#1b1b1e] p-0 text-white sm:max-w-lg sm:rounded-[28px] [&>button]:hidden">
        <div className="px-7 pb-7 pt-12 text-center sm:px-10">
          {/* vlastní kruhové X — uvnitř wrapperu, aby ho neschoval
              [&>button]:hidden určený výchozímu křížku (absolute se stejně
              kotví k DialogContent, wrapper není pozicovaný) */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] text-white transition-colors hover:bg-white/[0.16]"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white/10 bg-gradient-to-b from-white/[0.16] to-white/[0.04]">
            <Check className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>

          <DialogTitle className="mt-7 font-sans text-2xl font-bold tracking-tight text-white">
            You&rsquo;re entering the supplier area
          </DialogTitle>
          <DialogDescription className="mx-auto mt-3 max-w-[38ch] text-base leading-relaxed text-zinc-400">
            This part of the platform is for brands and distributors who want to sell stock through
            us — not for buying.
          </DialogDescription>

          <button
            type="button"
            onClick={goToSuppliers}
            className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-full bg-white text-base font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
