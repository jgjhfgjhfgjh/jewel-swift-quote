import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

/**
 * Cílová stránka odkazu „zapomenuté heslo".
 *
 * Recovery odkaz Supabase vymění (PKCE + detectSessionInUrl) za dočasnou
 * recovery session. Jakmile session naběhne, ukážeme formulář pro nové heslo
 * a uložíme ho přes updateUser. Neplatný/expirovaný odkaz → hláška.
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pw, setPw] = useState({ next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const queryParams = new URLSearchParams(window.location.search);
    const errDesc = hashParams.get('error_description') || queryParams.get('error_description');
    if (errDesc) { setError(decodeURIComponent(errDesc)); return; }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) setReady(true);
    });

    const timeout = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (active && !data.session) {
        setError('Odkaz pro obnovu hesla je neplatný nebo vypršel. Vyžádejte si nový.');
      }
    }, 5000);

    return () => { active = false; subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

  const handleSave = async () => {
    if (pw.next.length < 6) { toast.error('Heslo musí mít alespoň 6 znaků'); return; }
    if (pw.next !== pw.confirm) { toast.error('Hesla se neshodují'); return; }
    setSaving(true);
    const { error: updErr } = await supabase.auth.updateUser({ password: pw.next });
    setSaving(false);
    if (updErr) { toast.error('Změna hesla selhala: ' + updErr.message); return; }
    toast.success('Heslo bylo změněno. Jste přihlášeni.');
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link to="/"><img src={logo} alt="swelt." className="mx-auto h-16 object-contain" /></Link>
          <h1 className="mt-4 font-display text-2xl font-black tracking-tight">Nové heslo</h1>
        </div>

        {error ? (
          <div className="space-y-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Link
              to="/login"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
            >
              Zpět na přihlášení
            </Link>
          </div>
        ) : !ready ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin" />
            <p className="text-sm">Ověřujeme odkaz…</p>
          </div>
        ) : (
          <div className="space-y-4">
            <PasswordInput
              placeholder="Nové heslo (alespoň 6 znaků)"
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              minLength={6}
              autoFocus
            />
            <PasswordInput
              placeholder="Zopakujte heslo"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              minLength={6}
            />
            <Button onClick={handleSave} disabled={saving || !pw.next} className="w-full gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Nastavit nové heslo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
