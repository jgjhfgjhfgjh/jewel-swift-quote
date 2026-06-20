import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;
export type AppRole = 'admin' | 'customer' | 'lead' | 'b2b_approved';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    role: null,
    loading: true,
  });

  const fetchProfileAndRole = useCallback(async (userId: string) => {
    const [profileRes, roleRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
    ]);
    return {
      profile: profileRes.data as Profile | null,
      // Nový účet zakládá DB trigger handle_new_user s rolí 'lead' — držíme stejný default.
      role: (roleRes.data?.role as AppRole) ?? 'lead',
    };
  }, []);

  useEffect(() => {
    let currentUserId: string | null = null;

    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          currentUserId = session.user.id;
          setState(prev => ({ ...prev, user: session.user, session, loading: true }));
          // Use setTimeout to avoid Supabase auth deadlock
          setTimeout(async () => {
            const { profile, role } = await fetchProfileAndRole(session.user.id);
            setState({ user: session.user, session, profile, role, loading: false });
          }, 0);
        } else {
          currentUserId = null;
          setState({ user: null, session: null, profile: null, role: null, loading: false });
        }
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        currentUserId = session.user.id;
        const { profile, role } = await fetchProfileAndRole(session.user.id);
        setState({ user: session.user, session, profile, role, loading: false });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    // Realtime: re-fetch role whenever user_roles row changes for this user
    const roleChannel = supabase
      .channel('user_roles_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        async (payload) => {
          const changedUserId =
            (payload.new as { user_id?: string } | null)?.user_id ??
            (payload.old as { user_id?: string } | null)?.user_id;
          if (changedUserId && changedUserId === currentUserId) {
            const { profile, role } = await fetchProfileAndRole(changedUserId);
            setState(prev => prev.user ? { ...prev, profile, role } : prev);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(roleChannel);
    };
  }, [fetchProfileAndRole]);

  const signUp = async (email: string, password: string, companyName: string, ico: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Profil (company_name, ico) i roli 'lead' zakládá DB trigger handle_new_user
        // z těchto metadat — žádný klientský profiles.update už není potřeba (a bez
        // session by stejně neprošel přes RLS).
        data: { company_name: companyName, ico },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    // Při zapnutém potvrzování e-mailu vrací Supabase u JIŽ existujícího e-mailu
    // uživatele s prázdným polem identities a BEZ chyby (kvůli ochraně proti
    // zjišťování existence účtů). Tichý průchod odhalíme a dáme srozumitelnou hlášku.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error('Tento e-mail už je zaregistrovaný. Přihlaste se, nebo si nechte poslat odkaz pro obnovu hesla.');
    }
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Supabase z bezpečnostních důvodů nerozlišuje neexistující email vs špatné heslo.
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
        throw new Error('Zadaný email nenalezen nebo je heslo nesprávné');
      }
      if (msg.includes('email not confirmed')) {
        throw new Error('Email zatím nebyl potvrzen. Zkontrolujte schránku.');
      }
      throw error;
    }
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const { profile, role } = await fetchProfileAndRole(state.user.id);
    setState(prev => ({ ...prev, profile, role }));
  }, [state.user, fetchProfileAndRole]);

  return {
    ...state,
    isAdmin: state.role === 'admin',
    isCustomer: state.role === 'customer' || state.role === 'b2b_approved',
    isLead: state.role === 'lead',
    isB2bApproved: state.role === 'b2b_approved',
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshProfile,
  };
}
