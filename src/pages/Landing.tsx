import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Percent, Truck, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { flags, type Lang } from '@/lib/i18n';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/logo.png';

const Landing = () => {
  const { lang, setLang, setAuthenticated } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setAuthenticated(true);
    navigate('/catalog');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#1a1a1e] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <img src={logo} alt="swelt." className="h-10 object-contain brightness-0 invert" />
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => {
              setAuthenticated(true);
              navigate('/catalog');
            }}
          >
            Přihlásit se
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10">
                <span className="text-base">{flags[lang]}</span>
                <span className="hidden sm:inline">{lang.toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(['cs', 'en', 'is'] as Lang[]).map((l) => (
                <DropdownMenuItem key={l} onClick={() => setLang(l)} className="gap-2">
                  <span>{flags[l]}</span> {l.toUpperCase()}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <img src={logo} alt="swelt." className="mb-4 h-28 object-contain brightness-0 invert sm:h-36 md:h-44" />
        <p className="mb-12 text-lg font-semibold tracking-[0.25em] text-white/80 sm:text-xl">
          WHOLESALE PARTNER
        </p>

        <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          PŘÍSTUP K B2B CENÁM.
        </h2>
        <p className="mx-auto mb-10 max-w-lg text-base text-white/60 sm:text-lg">
          Získejte exkluzivní marže na světové značky hodinek a šperků.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-lg items-center gap-0 overflow-hidden rounded-full border border-white/20 bg-white/5 pl-5"
        >
          <input
            type="email"
            required
            placeholder="Váš firemní e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent py-3.5 text-sm text-white placeholder:text-white/40 outline-none"
          />
          <button
            type="submit"
            className="mr-1.5 my-1.5 rounded-full bg-[#4f5bd5] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5f6be5]"
          >
            VSTOUPIT DO KATALOGU
          </button>
        </form>
      </main>

      {/* Benefits */}
      <section className="border-t border-white/10 px-6 py-16">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-10 sm:grid-cols-3 text-center">
          <div className="flex flex-col items-center gap-3">
            <Percent className="h-8 w-8 text-[#4f5bd5]" />
            <p className="text-lg font-bold">Atraktivní Marže</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Truck className="h-8 w-8 text-[#4f5bd5]" />
            <p className="text-lg font-bold">Rychlé Dodání</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <QrCode className="h-8 w-8 text-[#4f5bd5]" />
            <p className="text-lg font-bold">Okamžité Nacenění</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
