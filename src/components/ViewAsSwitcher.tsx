import { Eye } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStore, type AdminViewAs } from '@/lib/store';

const LEVELS: { value: AdminViewAs; label: string }[] = [
  { value: 'real', label: 'Admin' },
  { value: 'guest', label: 'Host' },
  { value: 'lead', label: 'Lead' },
  { value: 'customer', label: 'Zákazník' },
  { value: 'b2b', label: 'B2B partner' },
];

/**
 * Admin-only floating pill: preview the site as each customer level.
 * Visible only to the real admin (the override never hides it). Resets to
 * the real view on reload — the preview is not persisted.
 */
export function ViewAsSwitcher() {
  const { realIsAdmin } = useAuthContext();
  const viewAs = useStore((s) => s.adminViewAs);
  const setAdminViewAs = useStore((s) => s.setAdminViewAs);

  if (!realIsAdmin) return null;

  return (
    <div
      className={`fixed bottom-[76px] lg:bottom-4 left-1/2 -translate-x-1/2 z-[70]
        flex items-center gap-0.5 rounded-full bg-[#17191c]/90 backdrop-blur-md
        border px-2 py-1.5 shadow-xl
        ${viewAs !== 'real' ? 'border-[#d1fe17]' : 'border-[#66696e]'}`}
    >
      <Eye className={`ml-1 h-3.5 w-3.5 shrink-0 ${viewAs !== 'real' ? 'text-[#d1fe17]' : 'text-[#b3b3b3]'}`} />
      <span className="hidden sm:block whitespace-nowrap px-1.5 text-[11px] text-[#b3b3b3]">
        Zobrazit jako
      </span>
      {LEVELS.map((l) => (
        <button
          key={l.value}
          type="button"
          onClick={() => setAdminViewAs(l.value)}
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            viewAs === l.value
              ? 'bg-white text-[#131517]'
              : 'text-[#b3b3b3] hover:bg-[#33373d] hover:text-white'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
