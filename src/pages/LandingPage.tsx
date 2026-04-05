import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { translations, flags, type Lang } from '@/lib/i18n';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LandingPage() {
  const { lang, setLang, setAuthenticated } = useStore();
  const t = translations[lang];
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError(lang === 'cs' ? 'Zadejte platný firemní e-mail' : 'Enter a valid business email');
      return;
    }
    setAuthenticated(true);
    toast.success(lang === 'cs' ? 'Vítejte v katalogu' : 'Welcome to the catalog');
    navigate('/catalog');
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-foreground">
      {/* Header */}
      <header className="flex h-16 items-center justify-between px-6 border-b border-border/40">
        <img src={logo} alt="swelt." className="h-20 object-contain" />
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
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
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-medium"
            onClick={() => {
              setAuthenticated(true);
              navigate('/catalog');
            }}
          >
            {t.login}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="max-w-xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            B2B platforma
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {lang === 'cs' ? 'PŘÍSTUP K B2B CENÁM' : lang === 'en' ? 'ACCESS B2B PRICING' : 'AÐGANGUR AÐ B2B VERÐUM'}
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            {lang === 'cs'
              ? 'Získejte exkluzivní marže na světové značky hodinek a šperků.'
              : lang === 'en'
              ? 'Get exclusive margins on world-renowned watch and jewelry brands.'
              : 'Fáðu einkarétt á heimsþekktum úra- og skartgripamerkjum.'}
          </p>

          <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              placeholder={lang === 'cs' ? 'Váš firemní e-mail' : lang === 'en' ? 'Your business email' : 'Fyrirtækja netfang'}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="h-12 flex-1 bg-white border-border"
            />
            <Button type="submit" size="lg" className="h-12 px-6 font-semibold uppercase tracking-wide">
              {lang === 'cs' ? 'Vstoupit do katalogu' : lang === 'en' ? 'Enter Catalog' : 'Opna vörulista'}
            </Button>
          </form>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SWELT. All rights reserved.
      </footer>
    </div>
  );
}
