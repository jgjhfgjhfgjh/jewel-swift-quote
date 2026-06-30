import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SelectedWatch } from '@/components/luxury/LuxuryWatchSearch';

export interface InquiryForm {
  name: string;
  email: string;
  phone: string;
  note: string;
  budget: string;
}

const EMPTY_FORM: InquiryForm = { name: '', email: '', phone: '', note: '', budget: '' };

interface InquiryStore {
  /** The "cart" — watches the customer wants quoted. */
  watches: SelectedWatch[];
  form: InquiryForm;
  addWatch: (w: SelectedWatch) => void;
  removeWatch: (id: string) => void;
  setWatches: (w: SelectedWatch[]) => void;
  patchForm: (patch: Partial<InquiryForm>) => void;
  reset: () => void;
}

/**
 * Shared inquiry "cart" for the prestige flow. Persisted to localStorage so the
 * selection survives navigation between the landing page and the full-page
 * checkout-style inquiry flow (and a refresh mid-flow).
 */
export const useInquiry = create<InquiryStore>()(
  persist(
    (set) => ({
      watches: [],
      form: EMPTY_FORM,
      addWatch: (w) =>
        set((s) => (s.watches.some((x) => x.id === w.id) ? s : { watches: [...s.watches, w] })),
      removeWatch: (id) => set((s) => ({ watches: s.watches.filter((x) => x.id !== id) })),
      setWatches: (w) => set({ watches: w }),
      patchForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
      reset: () => set({ watches: [], form: EMPTY_FORM }),
    }),
    { name: 'swelt-inquiry' },
  ),
);
