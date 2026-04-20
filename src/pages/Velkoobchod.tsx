import { useNavigate } from 'react-router-dom';
import { ArrowRight, Handshake, Package, TrendingUp, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStore } from '@/lib/store';
import { useWishlist } from '@/hooks/useWishlist';
import { useState } from 'react';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { LeadUpgradeBadge } from '@/components/LeadUpgradeBadge';

const benefits = [
  { icon: Package, title: 'Aktuální skladové zásoby', desc: 'Reálný přehled o dostupnosti zboží napříč celým katalogem.' },
  { icon: TrendingUp, title: 'Velkoobchodní ceny', desc: 'Po schválení B2B účtu uvidíte plné velkoobchodní ceny a slevy.' },
  { icon: ShieldCheck, title: 'Ověřený servis', desc: 'Přímý přístup k novinkám, kolekcím a individuální cenové politice.' },
  { icon: Handshake, title: 'Rychlé objednávky', desc: 'Expedice a logistika pod naší značkou bez prodlev.' },
];

const Velkoobchod = () => {
  const navigate = useNavigate();
  const { isB2bApproved, isLead } = useAuthContext();
  const { setViewMode } = useStore();
  const { wishlistIds } = useWishlist();
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const goToCatalog = () => {
    setViewMode('catalog');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col pb-16 lg:pb-0">
      <Navbar wishlistCount={wishlistIds.size} onOpenWishlist={() => setWishlistOpen(true)} />

      <main className="flex-1 bg-background">
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
              <Handshake className="h-3.5 w-3.5" />
              Velkoobchod Swelt
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight">
              Vítejte ve velkoobchodě
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              {isB2bApproved
                ? 'Máte plný přístup k velkoobchodním cenám a aktuálním skladovým zásobám.'
                : 'Prohlédněte si náš kompletní katalog. Pro zobrazení velkoobchodních cen je potřeba schválený B2B účet.'}
            </p>

            {isLead && (
              <div className="mt-6 flex justify-center">
                <LeadUpgradeBadge />
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={goToCatalog} className="gap-2">
                Vstoupit do katalogu
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="rounded-2xl border bg-card p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-1.5">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
      <BottomNav onOpenWishlist={() => setWishlistOpen(true)} wishlistCount={wishlistIds.size} />
    </div>
  );
};

export default Velkoobchod;
