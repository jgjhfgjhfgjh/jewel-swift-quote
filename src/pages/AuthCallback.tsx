import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

/**
 * Cílová stránka odkazu z potvrzovacího / přihlašovacího e-mailu.
 *
 * Klient má `detectSessionInUrl: true` + PKCE, takže Supabase si z URL sám
 * vymění `?code=…` za session. My jen počkáme, až session naběhne, a pošleme
 * uživatele na přihlášenou homepage. Když je odkaz neplatný/expirovaný (nebo
 * byl otevřen na jiném zařízení, kde chybí PKCE verifier), ukážeme hlášku.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Chyba předaná přímo v odkazu (expirováno, už použito, …)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const queryParams = new URLSearchParams(window.location.search);
    const errDesc = hashParams.get('error_description') || queryParams.get('error_description');
    if (errDesc) {
      setError(decodeURIComponent(errDesc));
      return;
    }

    let active = true;

    const goHome = () => {
      if (active) navigate('/', { replace: true });
    };

    // Pokud už session existuje (Supabase ji stihl vyměnit), jdeme rovnou domů.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) goHome();
    });

    // Jinak počkáme na událost přihlášení.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) goHome();
    });

    // Záchranná lhůta — když do pár vteřin nepřijde session, odkaz je neplatný.
    const timeout = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (active && !data.session) {
        setError('Odkaz je neplatný nebo jeho platnost vypršela. Zkuste se přihlásit přímo.');
      }
    }, 5000);

    return () => {
      active = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <Link to="/"><img src={logo} alt="swelt." className="mx-auto h-16 object-contain" /></Link>
        {error ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Link
              to="/login"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
            >
              Přejít na přihlášení
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin" />
            <p className="text-sm">Potvrzujeme tvůj účet a přihlašujeme tě…</p>
          </div>
        )}
      </div>
    </div>
  );
}
