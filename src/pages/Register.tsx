import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthContext } from '@/contexts/AuthContext';
import { translations } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import logo from '@/assets/logo.png';
import { toast } from 'sonner';

export default function Register() {
  const { signUp } = useAuthContext();
  const { lang } = useStore();
  const t = translations[lang];
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
      setError('Heslo musí mít alespoň 6 znaků');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, companyName, ico);
      toast.success('Registrace úspěšná! Zkontrolujte svůj email pro potvrzení.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Registrace selhala');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src={logo} alt="swelt." className="mx-auto h-20 object-contain" />
          <h1 className="mt-4 font-display text-2xl font-semibold">B2B Registrace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vytvořte si firemní účet
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Název firmy"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            autoFocus
          />
          <Input
            placeholder="IČO"
            value={ico}
            onChange={(e) => setIco(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="text-xs text-destructive font-medium">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '...' : 'Registrovat'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Už máte účet?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
