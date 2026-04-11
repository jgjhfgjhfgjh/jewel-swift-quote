import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { lovable } from '@/integrations/lovable/index';
import heroBg from '@/assets/katalog-hero-bg.jpg';

interface Props {
  onOpenCatalog: () => void;
}

export function KatalogGateway({ onOpenCatalog }: Props) {
  const { signIn, user } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      onOpenCatalog();
    } catch (err: any) {
      setError(err.message || 'Chyba přihlášení');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setError('Chyba přihlášení přes Google');
      }
    } catch {
      setError('Chyba přihlášení přes Google');
    }
  };

  const handleAppleLogin = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setError('Chyba přihlášení přes Apple');
      }
    } catch {
      setError('Chyba přihlášení přes Apple');
    }
  };

  return (
    <div className="w-full" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Hero Section with background image */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: 420 }}>
        <img
          src={heroBg}
          alt="Professional working on laptop"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* Title overlay */}
        <div className="relative z-10 flex flex-col items-start justify-center px-8 sm:px-12 lg:px-16 py-12 sm:py-16" style={{ minHeight: 380 }}>
          <div className="flex items-center gap-2 mb-0">
            <span className="inline-block w-4 h-4 rounded-full bg-green-500" />
            <span className="text-green-400 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none">LIVE</span>
          </div>
          <h1 className="text-white font-extrabold text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.95] mt-1">
            KATALOG
          </h1>
          <h1 className="text-white font-extrabold text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.95] mt-1">
            2<span className="inline-block" style={{ position: 'relative' }}>0<span className="absolute inset-0 flex items-center justify-center text-white/90" style={{ fontSize: '0.45em' }}></span></span>26
          </h1>
        </div>
      </div>

      {/* Contextual text below hero */}
      <div className="bg-white px-6 py-8 text-center">
        <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-widest font-medium max-w-2xl mx-auto">
          OD TRENDŮ K OBJEDNÁVCE BĚHEM VTEŘIN.
          <br />
          Sledujte novinky pro rok 2026 a objednávejte dřív než konkurence.
        </p>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-6 max-w-xl mx-auto leading-tight">
          Mějte aktuální ceny a skladové zásoby vždy v kapse.
        </h2>

        <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-[0.2em] font-semibold mt-5">
          VSTUPTE DO SVĚTA PRÉMIOVÉHO VELKOOBCHODU
        </p>

        <p className="text-[11px] text-gray-400 mt-2 tracking-wide">
          přímo, rychle a s plnou podporou
        </p>
      </div>

      {/* Two-card action section */}
      <div className="bg-white px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {/* Left Card - Catalog Access */}
          <div className="border border-gray-200 rounded-xl p-6 sm:p-7">
            <h3 className="text-lg font-bold text-gray-900 tracking-wide">PROHLÍŽENÍ KATALOGU</h3>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em] mt-2">
              ZAJÍMÁ VÁS NÁŠ SORTIMENT?
            </p>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              Přihlaste se jedním klikem a nahlédněte do našeho katalogu. Z důvodu ochrany marží našich obchodních partnerů se vám po rychlém přihlášení zobrazí komplexní nabídka produktů a značek, avšak bez velkoobchodních cen.
            </p>

            <form onSubmit={handleLogin} className="mt-5 space-y-3">
              <input
                type="email"
                placeholder="E-mail adresa..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Heslo..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm py-2.5 transition-colors disabled:opacity-60"
              >
                {loading ? '...' : 'Přihlásit se'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 space-y-2">
              <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm py-2.5 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
              <button
                onClick={handleAppleLogin}
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm py-2.5 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continue with Apple
              </button>
            </div>
          </div>

          {/* Right Card - B2B Registration */}
          <div className="border border-gray-200 rounded-xl p-6 sm:p-7 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 tracking-wide">PLNÁ B2B REGISTRACE</h3>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em] mt-2">
              JSTE FIRMA A CHCETE NAKUPOVAT ZA VELKOOBCHODNÍ CENY?
            </p>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed flex-1">
              Staňte se naším ověřeným B2B partnerem. Zaregistrujte své IČO a po krátkém schvalovacím procesu vám odemkneme kompletní velkoobchodní ceník, marže a možnost okamžitých objednávek.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-semibold text-sm transition-colors"
              >
                Vstoupit
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
