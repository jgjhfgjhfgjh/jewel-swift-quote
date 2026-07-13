import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Jediný guard pro všechny admin routy (nahrazuje inline guardy v jednotlivých
 * stránkách). Rozhoduje podle `realIsAdmin`, takže admin nevypadne ze shellu
 * ani při aktivním „Zobrazit jako" náhledu jiné zákaznické vrstvy.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { realIsAdmin, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (!realIsAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
