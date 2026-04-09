import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthContext } from '@/contexts/AuthContext';
import { translations } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import logo from '@/assets/logo.png';

export default function Login() {
  const { signIn } = useAuthContext();
  const { lang } = useStore();
  const t = translations[lang];
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || t.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Link to="/" className="absolute left-4 top-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Zpět na úvodní stránku
      </Link>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link to="/"><img src={logo} alt="swelt." className="mx-auto h-20 object-contain cursor-pointer" /></Link>
          <h1 className="mt-4 font-display text-2xl font-semibold">{t.login}</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-xs text-destructive font-medium">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '...' : t.login}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Nemáte účet?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Registrace
          </Link>
        </p>
      </div>
    </div>
  );
}
