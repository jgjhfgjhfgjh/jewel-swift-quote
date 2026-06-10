import { createContext, useContext, type ReactNode } from 'react';
import { useAuth, type Profile, type AppRole } from '@/hooks/useAuth';
import type { User, Session } from '@supabase/supabase-js';
import { useStore } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  isLead: boolean;
  isB2bApproved: boolean;
  /** True for the actually signed-in admin, regardless of the "view as" preview */
  realIsAdmin: boolean;
  signUp: (email: string, password: string, companyName: string, ico: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const viewAs = useStore((s) => s.adminViewAs);
  const realIsAdmin = auth.role === 'admin';

  let value: AuthContextType = { ...auth, realIsAdmin };

  // Admin-only preview: present the whole app as a chosen customer level.
  // Only the derived auth flags are overridden — the real session stays
  // intact underneath, so the admin can always switch back.
  if (realIsAdmin && viewAs !== 'real') {
    if (viewAs === 'guest') {
      value = {
        ...value,
        user: null,
        session: null,
        profile: null,
        role: null,
        isAdmin: false,
        isCustomer: false,
        isLead: false,
        isB2bApproved: false,
      };
    } else {
      const role: AppRole = viewAs === 'b2b' ? 'b2b_approved' : viewAs;
      value = {
        ...value,
        role,
        isAdmin: false,
        isCustomer: role === 'customer' || role === 'b2b_approved',
        isLead: role === 'lead',
        isB2bApproved: role === 'b2b_approved',
      };
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
