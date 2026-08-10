import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Eye, Mail, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/lib/store';
import { home } from '@/lib/i18n-homepage';
import { auth as authT } from '@/lib/i18n-auth';
import { AccessTiersVisual } from '@/components/AccessTiersVisual';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register' | 'b2b';
  onLoginSuccess?: () => void;
  tip?: string;
}

export function AuthModal({ open, onOpenChange, defaultTab = 'login', onLoginSuccess, tip }: AuthModalProps) {
  const { signIn, signUp, resetPassword, user } = useAuthContext();
  const { lang } = useStore();
  const navigate = useNavigate();
  const h = home[lang];
  const a = authT[lang];
  // LinkedIn label odvozený z lokalizovaného „… Google" (brand se jen vymění),
  // ať nemusíme přidávat klíč do všech 18 jazyků.
  const continueWithLinkedin = h.continueWithGoogle.replace('Google', 'LinkedIn');
  const [tab, setTab] = useState<'login' | 'register' | 'b2b'>(defaultTab);

  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [ico, setIco] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  // E-mail, na který jsme odeslali potvrzovací odkaz (po registraci / B2B registraci).
  const [sentTo, setSentTo] = useState<string | null>(null);
  // Zapomenuté heslo: režim zadání e-mailu + příznak odeslání odkazu.
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Už přihlášený uživatel nemá v modalu co dělat na registračních záložkách —
  // „dokončení registrace" patří do nastavení účtu (doplnění IČO + odeslání žádosti).
  // Toto je pojistka pro všechny vstupní body, které modal otevřou s tabem register/b2b.
  useEffect(() => {
    if (open && user && (tab === 'register' || tab === 'b2b')) {
      onOpenChange(false);
      navigate('/ucet');
    }
  }, [open, user, tab, onOpenChange, navigate]);

  // Reset pomocných obrazovek při zavření modalu.
  useEffect(() => {
    if (!open) { setSentTo(null); setResetMode(false); setResetSent(false); }
  }, [open]);

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
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : h.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Zadejte e-mail'); return; }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Odeslání odkazu selhalo. Zkuste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      return;
    }
    if (password !== confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }
    setLoading(true);
    try {
      // Quick free account — without IČO/company name; B2B status can be filled later.
      await signUp(email, password, '', '');
      // Potvrzování e-mailu je zapnuté → není session. Ukážeme „potvrď e-mail".
      setSentTo(email);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Registrace se nezdařila. Zkuste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  };

  const handleB2BRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!companyName.trim()) {
      setError('Vyplňte název firmy');
      return;
    }
    if (!/^\d{6,8}$/.test(ico.trim())) {
      setError('IČO musí obsahovat 6–8 číslic');
      return;
    }
    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      return;
    }
    if (password !== confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, companyName.trim(), ico.trim());
      // Potvrzování e-mailu je zapnuté → není session. Ukážeme „potvrď e-mail".
      setSentTo(email);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'B2B registrace se nezdařila. Zkuste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'apple' | 'linkedin_oidc') => {
    setSocialLoading(provider);
    setError('');
    try {
      // Direct Supabase OAuth — redirects to provider, then back to the app
      // with tokens in the URL fragment which Supabase auto-parses.
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.href,
          queryParams: provider === 'google'
            ? { access_type: 'offline', prompt: 'select_account' }
            : undefined,
        },
      });
      if (oauthError) {
        setError(oauthError.message || h.loginFailed);
        setSocialLoading(null);
      }
      // If no error, the browser redirects to the provider — no further code runs here.
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : h.loginFailed);
      setSocialLoading(null);
    }
  };

  if (!open || typeof document === 'undefined') return null;

  // ── Potvrzovací obrazovka po (B2B) registraci ──
  if (sentTo) {
    return createPortal(
      <div
        role="dialog"
        aria-modal="true"
        onClick={close}
        className="fixed inset-0 z-[20000] overflow-y-auto overscroll-contain bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div className="flex min-h-full items-start sm:items-center justify-center p-4 py-10">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-[20001] w-full max-w-md overflow-hidden rounded-[1.75rem] bg-white shadow-[0_32px_80px_-20px_rgba(15,23,42,0.35),0_8px_20px_rgba(15,23,42,0.10)] ring-1 ring-zinc-900/[0.06] animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              aria-label={a.closeLabel}
              onClick={(e) => { e.stopPropagation(); close(); }}
              className="absolute right-4 top-4 z-[20002] flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-4 px-7 py-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="h-7 w-7 text-primary" />
              </span>
              <h2 className="font-sans text-[22px] font-semibold tracking-tight text-zinc-900">Potvrďte svůj e-mail</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Poslali jsme potvrzovací odkaz na <strong className="text-foreground">{sentTo}</strong>.
                Klikněte na něj a budete rovnou přihlášeni. Pokud e-mail nevidíte, zkontrolujte i složku spam.
              </p>
              <Button onClick={close} className="h-11 w-full rounded-full text-[15px] font-semibold shadow-[0_10px_24px_-8px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5">Rozumím</Button>
              <button
                type="button"
                onClick={() => { setSentTo(null); setTab('login'); }}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Už jsem potvrdil — přihlásit se
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={h.catalogAccess}
      onClick={close}
      className="fixed inset-0 z-[20000] overflow-y-auto overscroll-contain bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Centering container — allows card to scroll within viewport when too tall */}
      <div className="flex min-h-full items-start sm:items-center justify-center p-4 py-10">
      {/* Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-[20001] w-full max-w-md overflow-hidden rounded-[1.75rem] bg-white shadow-[0_32px_80px_-20px_rgba(15,23,42,0.35),0_8px_20px_rgba(15,23,42,0.10)] ring-1 ring-zinc-900/[0.06] animate-in zoom-in-95 duration-200"
      >
        {/* Close — anchored to card top-right so it always scrolls with content */}
        <button
          type="button"
          aria-label={a.closeLabel}
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          className="absolute right-4 top-4 z-[20002] flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header — title + subtitle adapt to current tab */}
        <div className="px-7 pb-5 pt-8">
          <h2 className="pr-10 font-sans text-[22px] font-semibold tracking-tight text-zinc-900">
            {tab === 'b2b' ? 'B2B registrace partnera' : tab === 'register' ? 'Vytvořit účet' : 'Přihlášení'}
          </h2>
          <p className="mt-1.5 text-[13px] leading-snug text-zinc-500">
            {tab === 'b2b'
              ? 'Plný přístup k velkoobchodním cenám. Schválení do 24 hodin.'
              : tab === 'register'
              ? 'Zdarma, bez závazku — okamžitý přístup k prohlížení katalogu.'
              : 'Vítejte zpět. Přihlaste se ke svému účtu.'}
          </p>
        </div>

        {/* Tabs — 3 levels: Přihlášení | Vytvořit účet | B2B */}
        <div className="px-7">
          <div className="flex gap-1 rounded-full bg-zinc-100 p-1">
            <button
              onClick={() => { setError(''); setTab('login'); }}
              className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all sm:text-[13px] ${
                tab === 'login'
                  ? 'bg-white text-zinc-900 shadow-[0_1px_3px_rgba(15,23,42,0.12)]'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Přihlášení
            </button>
            <button
              onClick={() => { setError(''); setTab('register'); }}
              className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all sm:text-[13px] ${
                tab === 'register'
                  ? 'bg-white text-zinc-900 shadow-[0_1px_3px_rgba(15,23,42,0.12)]'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Vytvořit účet
            </button>
            <button
              onClick={() => { setError(''); setTab('b2b'); }}
              className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all sm:text-[13px] ${
                tab === 'b2b'
                  ? 'bg-white text-zinc-900 shadow-[0_1px_3px_rgba(15,23,42,0.12)]'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              B2B registrace
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-5 px-7 py-6">
          {tab === 'login' ? (
            resetMode ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-sans text-[17px] font-semibold text-zinc-900">Obnova hesla</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Zadejte e-mail a pošleme vám odkaz pro nastavení nového hesla.
                  </p>
                </div>
                {resetSent ? (
                  <>
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-[13px] leading-relaxed text-emerald-800 ring-1 ring-emerald-100">
                      Pokud účet s tímto e-mailem existuje, poslali jsme na <strong>{email}</strong> odkaz pro obnovu hesla. Zkontrolujte i složku spam.
                    </div>
                    <Button type="button" onClick={() => { setResetMode(false); setResetSent(false); }} className="h-11 w-full rounded-full text-[15px] font-semibold shadow-[0_10px_24px_-8px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5">
                      Zpět na přihlášení
                    </Button>
                  </>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
                        <Mail className="h-3.5 w-3.5" /> {a.emailLabel}
                      </label>
                      <Input
                        type="email"
                        placeholder="vas@email.cz"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 rounded-xl border-transparent bg-zinc-100 text-[15px] placeholder:text-zinc-400 focus-visible:bg-white focus-visible:ring-zinc-900/15 focus-visible:ring-offset-0"
                      />
                    </div>
                    {error && (
                      <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-600 ring-1 ring-red-100">
                        {error}
                      </p>
                    )}
                    <Button type="submit" className="h-11 w-full rounded-full text-[15px] font-semibold shadow-[0_10px_24px_-8px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5" disabled={loading}>
                      {loading ? 'Odesílám…' : 'Poslat odkaz pro obnovu'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setError(''); setResetMode(false); }}
                      className="w-full text-center text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      Zpět na přihlášení
                    </button>
                  </form>
                )}
              </div>
            ) : (
            <>
              {tip && (
                <div className="flex items-start gap-3 rounded-2xl bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
                  <Eye className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 leading-relaxed">
                    <span>{tip}</span>
                    {' '}
                    <button
                      type="button"
                      onClick={() => setTab('register')}
                      className="font-semibold underline underline-offset-2 hover:text-blue-900 transition-colors"
                    >
                      {a.registerLinkArrow}
                    </button>
                  </div>
                </div>
              )}

              {/* Access tiers — show what unlocks at each step */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Co získáte po přihlášení
                </p>
                <AccessTiersVisual compact />
              </div>

              {/* Quick access first — one-click social login (less friction than email) */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="h-11 w-full gap-2 rounded-full border-zinc-200 bg-white text-[15px] font-medium text-zinc-900 hover:bg-zinc-50"
                  onClick={() => handleSocialAuth('google')}
                  disabled={!!socialLoading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {socialLoading === 'google' ? h.signingIn : h.continueWithGoogle}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 w-full gap-2 rounded-full border-zinc-200 bg-white text-[15px] font-medium text-zinc-900 hover:bg-zinc-50"
                  onClick={() => handleSocialAuth('apple')}
                  disabled={!!socialLoading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  {socialLoading === 'apple' ? h.signingIn : h.continueWithApple}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 w-full gap-2 rounded-full border-zinc-200 bg-white text-[15px] font-medium text-zinc-900 hover:bg-zinc-50"
                  onClick={() => handleSocialAuth('linkedin_oidc')}
                  disabled={!!socialLoading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                  </svg>
                  {socialLoading === 'linkedin_oidc' ? h.signingIn : continueWithLinkedin}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 tracking-wider text-zinc-400">
                    {a.separatorText}
                  </span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
                    <Mail className="h-3.5 w-3.5" /> {a.emailLabel}
                  </label>
                  <Input
                    type="email"
                    placeholder="vas@email.cz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl border-transparent bg-zinc-100 text-[15px] placeholder:text-zinc-400 focus-visible:bg-white focus-visible:ring-zinc-900/15 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
                    <Lock className="h-3.5 w-3.5" /> {a.passwordLabel}
                  </label>
                  <PasswordInput
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl border-transparent bg-zinc-100 text-[15px] placeholder:text-zinc-400 focus-visible:bg-white focus-visible:ring-zinc-900/15 focus-visible:ring-offset-0"
                  />
                </div>
                {error && (
                  <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-600 ring-1 ring-red-100">
                    {error}
                  </p>
                )}
                <Button type="submit" className="h-11 w-full rounded-full text-[15px] font-semibold shadow-[0_10px_24px_-8px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5" disabled={loading}>
                  {loading ? h.signingIn : 'Přihlásit'}
                </Button>
                <button
                  type="button"
                  onClick={() => { setError(''); setResetMode(true); }}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  Zapomenuté heslo?
                </button>
              </form>

              {/* Switch links */}
              <div className="text-center text-xs text-muted-foreground -mt-1 space-y-1">
                <p>
                  Ještě nemáte účet?{' '}
                  <button
                    type="button"
                    onClick={() => { setError(''); setTab('register'); }}
                    className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                  >
                    Vytvořit účet
                  </button>
                </p>
                <p>
                  Jste firma s IČO?{' '}
                  <button
                    type="button"
                    onClick={() => { setError(''); setTab('b2b'); }}
                    className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                  >
                    B2B registrace partnera
                  </button>
                </p>
              </div>
            </>
            )
          ) : tab === 'register' ? (
            <>
              {/* Access tiers — show what unlocks at each step */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Co získáte po vytvoření účtu
                </p>
                <AccessTiersVisual compact />
              </div>

              {/* Quick access first — one-click social signup (less friction than email) */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="h-11 w-full gap-2 rounded-full border-zinc-200 bg-white text-[15px] font-medium text-zinc-900 hover:bg-zinc-50"
                  onClick={() => handleSocialAuth('google')}
                  disabled={!!socialLoading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {socialLoading === 'google' ? h.signingIn : h.continueWithGoogle}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 w-full gap-2 rounded-full border-zinc-200 bg-white text-[15px] font-medium text-zinc-900 hover:bg-zinc-50"
                  onClick={() => handleSocialAuth('apple')}
                  disabled={!!socialLoading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  {socialLoading === 'apple' ? h.signingIn : h.continueWithApple}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 w-full gap-2 rounded-full border-zinc-200 bg-white text-[15px] font-medium text-zinc-900 hover:bg-zinc-50"
                  onClick={() => handleSocialAuth('linkedin_oidc')}
                  disabled={!!socialLoading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                  </svg>
                  {socialLoading === 'linkedin_oidc' ? h.signingIn : continueWithLinkedin}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 tracking-wider text-zinc-400">
                    {a.separatorText}
                  </span>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
                    <Mail className="h-3.5 w-3.5" /> {a.emailLabel}
                  </label>
                  <Input
                    type="email"
                    placeholder="vas@email.cz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl border-transparent bg-zinc-100 text-[15px] placeholder:text-zinc-400 focus-visible:bg-white focus-visible:ring-zinc-900/15 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
                    <Lock className="h-3.5 w-3.5" /> Heslo
                  </label>
                  <PasswordInput
                    placeholder="alespoň 6 znaků"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11 rounded-xl border-transparent bg-zinc-100 text-[15px] placeholder:text-zinc-400 focus-visible:bg-white focus-visible:ring-zinc-900/15 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
                    <Lock className="h-3.5 w-3.5" /> Heslo znovu
                  </label>
                  <PasswordInput
                    placeholder="zopakujte heslo"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11 rounded-xl border-transparent bg-zinc-100 text-[15px] placeholder:text-zinc-400 focus-visible:bg-white focus-visible:ring-zinc-900/15 focus-visible:ring-offset-0"
                  />
                </div>
                {error && (
                  <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-600 ring-1 ring-red-100">
                    {error}
                  </p>
                )}
                <Button type="submit" className="h-11 w-full rounded-full text-[15px] font-semibold shadow-[0_10px_24px_-8px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5" disabled={loading}>
                  {loading ? 'Vytvářím účet…' : 'Vytvořit účet'}
                </Button>
              </form>

              {/* B2B note */}
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed -mt-1">
                Účet je <strong className="text-foreground">zdarma</strong> a bez závazku. Velkoobchodní ceny odemknete doplněním IČO v nastavení účtu — schválení do 24 h.
              </p>

              {/* Switch links */}
              <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>
                  Už máte účet?{' '}
                  <button
                    type="button"
                    onClick={() => { setError(''); setTab('login'); }}
                    className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                  >
                    Přihlásit
                  </button>
                </p>
                <p>
                  Jste firma s IČO?{' '}
                  <button
                    type="button"
                    onClick={() => { setError(''); setTab('b2b'); }}
                    className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                  >
                    B2B registrace partnera
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* B2B registration — full form with company name + IČO */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Co získáte jako B2B partner
                </p>
                <AccessTiersVisual compact />
              </div>

              <form onSubmit={handleB2BRegister} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
                    Název firmy *
                  </label>
                  <Input
                    type="text"
                    placeholder="Vaše firma s.r.o."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="h-11 rounded-xl border-transparent bg-zinc-100 text-[15px] placeholder:text-zinc-400 focus-visible:bg-white focus-visible:ring-zinc-900/15 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
                    IČO *
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6,8}"
                    placeholder="12345678"
                    value={ico}
                    onChange={(e) => setIco(e.target.value.replace(/\D/g, ''))}
                    required
                    maxLength={8}
                    className="h-11 rounded-xl border-transparent bg-zinc-100 text-[15px] placeholder:text-zinc-400 focus-visible:bg-white focus-visible:ring-zinc-900/15 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
                    <Mail className="h-3.5 w-3.5" /> {a.emailLabel}
                  </label>
                  <Input
                    type="email"
                    placeholder="vas@firma.cz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl border-transparent bg-zinc-100 text-[15px] placeholder:text-zinc-400 focus-visible:bg-white focus-visible:ring-zinc-900/15 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
                    <Lock className="h-3.5 w-3.5" /> Heslo
                  </label>
                  <PasswordInput
                    placeholder="alespoň 6 znaků"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11 rounded-xl border-transparent bg-zinc-100 text-[15px] placeholder:text-zinc-400 focus-visible:bg-white focus-visible:ring-zinc-900/15 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
                    <Lock className="h-3.5 w-3.5" /> Heslo znovu
                  </label>
                  <PasswordInput
                    placeholder="zopakujte heslo"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11 rounded-xl border-transparent bg-zinc-100 text-[15px] placeholder:text-zinc-400 focus-visible:bg-white focus-visible:ring-zinc-900/15 focus-visible:ring-offset-0"
                  />
                </div>
                {error && (
                  <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-600 ring-1 ring-red-100">
                    {error}
                  </p>
                )}
                <Button type="submit" className="h-11 w-full rounded-full text-[15px] font-semibold shadow-[0_10px_24px_-8px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5" disabled={loading}>
                  {loading ? 'Odesílám…' : 'Registrovat se jako B2B partner'}
                </Button>
              </form>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed -mt-1">
                Žádost o B2B schválení odesíláme okamžitě. <strong className="text-foreground">Schválení do 24 hodin</strong> v pracovní dny. Až do schválení máte přístup ke katalogu jako běžný účet.
              </p>

              {/* Switch links */}
              <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>
                  Už máte účet?{' '}
                  <button
                    type="button"
                    onClick={() => { setError(''); setTab('login'); }}
                    className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                  >
                    Přihlásit
                  </button>
                </p>
                <p>
                  Jen nakouknout do katalogu?{' '}
                  <button
                    type="button"
                    onClick={() => { setError(''); setTab('register'); }}
                    className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                  >
                    Vytvořit účet zdarma
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </div>,
    document.body,
  );
}
