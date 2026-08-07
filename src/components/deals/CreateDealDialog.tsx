import { create } from 'zustand';
import { ArrowRight, Plus, X } from 'lucide-react';
import { openSupplierGate } from '@/components/suppliers/SupplierGateDialog';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

/**
 * CreateBigDeal — poptávka dealu na míru. Otevírá se z CTA v navigaci
 * (openCreateDealDialog), dialog je namountovaný jednou v App.tsx.
 *
 * Bílá iOS varianta protějšku SupplierGateDialog: zaoblená karta, kruhové X
 * vpravo nahoře, kroky v šedých pilulkách a jedno velké tmavé pilulkové CTA.
 * Samoobslužný sestavovač zatím neexistuje, takže CTA vede na poptávku
 * obchodu — jediný kanál, který dnes reálně funguje.
 */
interface CreateDealState {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const useCreateDealStore = create<CreateDealState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
}));

export function openCreateDealDialog() {
  useCreateDealStore.setState({ open: true });
}

const STEPS: [string, string, string][] = [
  ['01', 'Send us the wish list', 'Brands, references and how many units you can take.'],
  ['02', 'We check availability', 'We go to the concern and come back with a price.'],
  ['03', 'It opens as a GoBigDeal', 'You get first pick before it goes public.'],
];

export function CreateDealDialog() {
  const { open, setOpen } = useCreateDealStore();

  const goToSuppliers = () => {
    setOpen(false);
    openSupplierGate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* [&>button]:hidden schová výchozí křížek shadcn dialogu — nahrazuje
          ho vlastní kruhové tlačítko ve stejném duchu jako supplier brána */}
      <DialogContent className="overflow-hidden rounded-[28px] border-none bg-white p-0 text-zinc-900 sm:max-w-lg sm:rounded-[28px] [&>button]:hidden">
        <div className="px-7 pb-7 pt-9 sm:px-9">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-zinc-600 transition-colors hover:bg-slate-200 hover:text-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Plus className="h-3 w-3" /> Deal on request
          </span>

          <DialogTitle className="mt-5 font-sans text-2xl font-bold tracking-tight text-zinc-900">
            Missing a deal you would buy?
          </DialogTitle>
          <DialogDescription className="mt-2 text-base leading-relaxed text-zinc-500">
            Tell us the brands and volumes and we go source it.
          </DialogDescription>

          <div className="mt-6 grid gap-2.5">
            {STEPS.map(([n, title, desc]) => (
              <div
                key={n}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3
                           shadow-[0_8px_24px_-6px_rgba(15,23,42,0.10),0_2px_6px_rgba(15,23,42,0.05)]"
              >
                <span className="font-mono text-[11px] font-bold text-slate-300">{n}</span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-zinc-900">{title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-zinc-500">{desc}</span>
                </span>
              </div>
            ))}
          </div>

          <a
            href="mailto:obchod@swelt.cz?subject=CreateBigDeal"
            onClick={() => setOpen(false)}
            className="mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 text-base font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            Request a deal <ArrowRight className="h-4 w-4" />
          </a>

          {/* Dodavatelský svět — pro toho, kdo naopak zboží nabízí */}
          <button
            type="button"
            onClick={goToSuppliers}
            className="group/sup mt-5 flex w-full items-center gap-3 border-t border-slate-100 pt-5 text-left"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-zinc-900">Have stock to move instead?</span>
              <span className="mt-0.5 block text-xs text-zinc-500">
                BigDealSupplier — bring closeouts and overstock to European retailers.
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 transition-all group-hover/sup:translate-x-0.5 group-hover/sup:text-zinc-900" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
