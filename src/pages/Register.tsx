import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuthContext } from '@/contexts/AuthContext';
import { translations } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { home } from '@/lib/i18n-homepage';
import { auth as authT } from '@/lib/i18n-auth';
import logo from '@/assets/logo.png';
import { toast } from 'sonner';

export default function Register() {
  const { signUp } = useAuthContext();
  const { lang } = useStore();
  const t = translations[lang];
  const h = home[lang];
  const a = authT[lang];
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [ico, setIco] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError(a.passwordMin);
      return;
    }
    if (!ico.trim()) {
      setError(a.icoRequired);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, companyName, ico);
      toast.success(a.registerSuccess);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || a.registerFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Link to="/" className="absolute left-4 top-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {h.backToHome}
      </Link>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link to="/"><img src={logo} alt="swelt." className="mx-auto h-20 object-contain cursor-pointer" /></Link>
          <h1 className="mt-4 font-display text-2xl font-semibold">{a.registerHeading}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{a.registerSubtitle}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder={a.companyNamePlaceholder}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            autoFocus
          />
          <Input
            placeholder={a.icoPlaceholder}
            value={ico}
            onChange={(e) => setIco(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder={h.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <PasswordInput
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="text-xs text-destructive font-medium">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '...' : a.registerCta}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {a.haveAccount}{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
