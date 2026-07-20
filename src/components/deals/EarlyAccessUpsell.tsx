import { create } from 'zustand';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { dealsI18n } from '@/lib/i18n-deals';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * Globální upsell „Nemáte early access" — otevírá se ze zvonečků v katalogu
 * a z alert tlačítek v detailu značky/koncernu, když uživatel nemá zaplacený
 * early access. Dialog je namountovaný jednou v App.tsx; odkudkoli se otevře
 * přes openEarlyAccessUpsell().
 */
interface UpsellState {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const useUpsellStore = create<UpsellState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
}));

export function openEarlyAccessUpsell() {
  useUpsellStore.setState({ open: true });
}

export function EarlyAccessUpsellDialog() {
  const { open, setOpen } = useUpsellStore();
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang].alertsUi;
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.upsellTitle}</DialogTitle>
          <DialogDescription>{t.upsellText}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2.5">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              // pricing žije v sekci Top Deals na homepage
              navigate('/');
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {t.upsellCta}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            {t.upsellClose}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
