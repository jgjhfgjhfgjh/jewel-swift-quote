import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
    if (!ico.trim()) {
      setError('IČO je povinné pro B2B registraci');
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
      <Link to="/" className="absolute left-4 top-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Zpět na katalog
      </Link>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link to="/"><img src={logo} alt="swelt." className="mx-auto h-20 object-contain cursor-pointer" /></Link>
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
            placeholder="IČO (povinné pro B2B přístup)"
            value={ico}
            onChange={(e) => setIco(e.target.value)}
            required
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
