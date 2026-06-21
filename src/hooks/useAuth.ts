import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { siteUrl } from '@/lib/siteUrl';

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

    // Po smazání účtu adminem zůstává access token chvíli technicky platný
    // (JWT platí do expirace), takže getSession po refreshi vrátí "přihlášeno".
    // getUser() ho ověří proti serveru — 401/403 = účet už neexistuje.
    const accountDeleted = async () => {
      const { error } = await supabase.auth.getUser();
      const status = (error as { status?: number } | null)?.status;
      return status === 401 || status === 403;
    };
    const forceSignOut = async () => {
      await supabase.auth.signOut();
      toast.error('Váš účet byl odstraněn. Byli jste odhlášeni.');
    };

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

    // THEN check existing session — a po refreshi ověř, že účet pořád existuje.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        if (await accountDeleted()) { await forceSignOut(); return; }
        currentUserId = session.user.id;
        const { profile, role } = await fetchProfileAndRole(session.user.id);
        setState({ user: session.user, session, profile, role, loading: false });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    // Návrat na záložku → znovu ověř existenci účtu (zachytí smazání bez refreshe).
    const onVisible = async () => {
      if (document.visibilityState === 'visible' && currentUserId && await accountDeleted()) {
        await forceSignOut();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

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

    // Realtime: OKAMŽITÉ odhlášení, když admin smaže profil přihlášeného uživatele.
    // Vyžaduje profiles v publikaci supabase_realtime + REPLICA IDENTITY FULL,
    // aby DELETE payload obsahoval user_id (pro RLS i porovnání). Bez toho je to
    // neškodný no-op a pojistku tvoří getUser() výše.
    const profileChannel = supabase
      .channel('profiles_self_delete')
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'profiles' },
        async (payload) => {
          const deletedUserId = (payload.old as { user_id?: string } | null)?.user_id;
          if (deletedUserId && deletedUserId === currentUserId) {
            await forceSignOut();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(roleChannel);
      supabase.removeChannel(profileChannel);
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
        emailRedirectTo: `${siteUrl()}/auth/callback`,
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
      redirectTo: `${siteUrl()}/auth/reset-password`,
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
