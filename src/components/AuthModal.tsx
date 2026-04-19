import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Briefcase, Eye, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuthContext } from '@/contexts/AuthContext';
import { lovable } from '@/integrations/lovable/index';
import logo from '@/assets/logo.png';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
  onLoginSuccess?: () => void;
}

export function AuthModal({ open, onOpenChange, defaultTab = 'login', onLoginSuccess }: AuthModalProps) {
  const { signIn } = useAuthContext();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);

  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  const close = () => {
    setError('');
    onOpenChange(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      close();
      onLoginSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Přihlášení selhalo');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setError(result.error instanceof Error ? result.error.message : 'Přihlášení selhalo');
      }
      if (result.redirected) return;
    } catch (err: any) {
      setError(err.message || 'Přihlášení selhalo');
    } finally {
      setSocialLoading(null);
    }
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Přihlášení do katalogu"
      onClick={close}
      className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      {/* Close — same style as ProductImageGallery */}
      <button
        type="button"
        aria-label="Zavřít"
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        className="fixed right-4 top-4 z-[20002] flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition hover:bg-white"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-[20001] w-full max-w-md rounded-2xl bg-card shadow-2xl border border-border/60 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-b from-primary/5 to-transparent">
          <img src={logo} alt="swelt." className="mx-auto h-14 object-contain" />
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
            {tab === 'register' ? 'Registrace' : 'Přihlášení'}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {tab === 'register'
              ? 'Vytvořte si B2B účet pro přístup k velkoobchodním cenám'
              : 'Přihlaste se pro přístup k velkoobchodnímu katalogu'}
          </p>
        </div>

        {/* Tabs */}
        <div className="px-8">
          <div className="flex p-1 bg-muted rounded-lg">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                tab === 'login'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Přihlášení
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                tab === 'register'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Registrace
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-5">
          {tab === 'login' ? (
            <>
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </label>
                  <Input
                    type="email"
                    placeholder="vas@email.cz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Heslo
                  </label>
                  <PasswordInput
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                {error && (
                  <p className="text-xs text-destructive font-medium bg-destructive/10 px-3 py-2 rounded-md">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  {loading ? 'Přihlašování…' : 'Přihlásit jako B2B partner'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground tracking-wider">
                    nebo rychlý přístup
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full h-10 gap-2"
                  onClick={() => handleSocialAuth('google')}
                  disabled={!!socialLoading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {socialLoading === 'google' ? 'Přihlašování…' : 'Pokračovat přes Google'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-10 gap-2"
                  onClick={() => handleSocialAuth('apple')}
                  disabled={!!socialLoading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  {socialLoading === 'apple' ? 'Přihlašování…' : 'Pokračovat přes Apple'}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4 text-center py-2">
              <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display text-lg font-semibold">B2B Registrace</h3>
                <p className="text-sm text-muted-foreground">
                  Pro přístup k velkoobchodním cenám se zaregistrujte jako ověřený B2B partner s platným IČO.
                </p>
              </div>
              <Button asChild className="w-full h-10 font-semibold" onClick={() => onOpenChange(false)}>
                <Link to="/register">
                  Pokračovat na registraci
                </Link>
              </Button>
              <button
                onClick={() => setTab('login')}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Už máte účet? Přihlásit se
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
