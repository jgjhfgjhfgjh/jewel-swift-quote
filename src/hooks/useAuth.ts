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
    console.log('[useAuth] userId:', userId);
    console.log('[useAuth] profileRes:', { data: profileRes.data, error: profileRes.error });
    console.log('[useAuth] roleRes:', { data: roleRes.data, error: roleRes.error });
    return {
      profile: profileRes.data as Profile | null,
      role: (roleRes.data?.role as AppRole) ?? 'customer',
    };
  }, []);

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setState(prev => ({ ...prev, user: session.user, session, loading: true }));
          // Use setTimeout to avoid Supabase auth deadlock
          setTimeout(async () => {
            const { profile, role } = await fetchProfileAndRole(session.user.id);
            setState({ user: session.user, session, profile, role, loading: false });
          }, 0);
        } else {
          setState({ user: null, session: null, profile: null, role: null, loading: false });
        }
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { profile, role } = await fetchProfileAndRole(session.user.id);
        setState({ user: session.user, session, profile, role, loading: false });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfileAndRole]);

  const signUp = async (email: string, password: string, companyName: string, ico: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { company_name: companyName, ico },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    // Update profile with ICO after signup trigger creates it
    if (data.user) {
      await supabase.from('profiles').update({ ico, company_name: companyName }).eq('user_id', data.user.id);
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
    refreshProfile,
  };
}
