import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMyLabel } from '@/hooks/useComm';
import { PARTY_LABELS } from '@/lib/comm';
import { MessagesSquare, LogOut, Users } from 'lucide-react';

export default function ComLayout() {
  const { user, loading, signOut, isAdmin } = useAuthContext();
  const navigate = useNavigate();
  const { data: myLabel } = useMyLabel();

  const { data: isParticipant, isLoading: checking } = useQuery({
    queryKey: ['comm', 'is-participant', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('comm_is_participant');
      if (error) return false;
      return !!data;
    },
    enabled: !!user,
  });

  if (loading || (user && checking)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isParticipant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <MessagesSquare className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Komunikace swelt × zago</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Tento prostor je soukromý a přístupný jen účastníkům spolupráce.
          Pokud sem máš mít přístup, požádej o přidání mezi účastníky.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Zpět na úvod
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <button
            onClick={() => navigate('/komunikace')}
            className="flex items-center gap-2 font-semibold"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-amber-500 text-white">
              <MessagesSquare className="h-4 w-4" />
            </span>
            <span className="text-sm">
              Komunikace <span className="text-muted-foreground">swelt × zago</span>
            </span>
          </button>
          <div className="ml-auto flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => navigate('/komunikace/ucastnici')}
                className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
                title="Správa účastníků"
              >
                <Users className="h-3.5 w-3.5" /> Účastníci
              </button>
            )}
            {myLabel && (
              <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                Jsi přihlášen jako <strong className="text-foreground">{PARTY_LABELS[myLabel]}</strong>
              </span>
            )}
            <button
              onClick={() => signOut()}
              title="Odhlásit"
              className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
