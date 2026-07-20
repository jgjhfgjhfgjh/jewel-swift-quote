import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Building2, Search, Check, Truck, Rss, PackageOpen, HandCoins } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { useStore } from '@/lib/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { BrandLogo } from '@/components/BrandLogo';
import { getBrandByName } from '@/data/brands';
import { getConcernBySlug } from '@/data/concerns';
import { toDisplayName } from '@/lib/brandNormalize';
import { useBrandCatalog, type BrandPreviewProduct } from '@/hooks/useBrandCatalog';
import { TopDealAlertButton } from '@/components/deals/TopDealAlertButton';

/* ─── Reveal on scroll (same pattern as BrandDetail) ─── */
function useReveal(threshold = 0.1): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, revealed];
}
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, revealed] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {children}
    </div>
  );
}

/* ─── Types ─── */
interface BrandInConcern {
  key: string;
  name: string;
  slug: string;
  count: number;
}

interface ConcernData {
  brandCount: number;
  productCount: number;
  inStockCount: number;
  brands: BrandInConcern[];
  topProducts: BrandPreviewProduct[];
  rawManufacturers: string[];
}

/* ─── Component ─── */
export default function ConcernDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { setSelectedBrands, setViewMode } = useStore();
  const { data: catalog = [] } = useBrandCatalog();
  const [authOpen, setAuthOpen] = useState(false);

  const concern = slug ? getConcernBySlug(slug) : undefined;

  // Scroll to top whenever the koncern changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [slug]);

  // Live brand catalog (bound to the feed) restricted to this koncern's brands
  const data = useMemo<ConcernData | null>(() => {
    if (!concern) return null;

    const present = catalog.filter((e) => concern.brandKeys.includes(e.key));

    const topProducts = present
      .flatMap((e) => e.products)
      .filter((p) => p.img)
      .sort((a, b) => {
        if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
        const da = a.price > 0 ? 1 - a.wholesale / a.price : 0;
        const db = b.price > 0 ? 1 - b.wholesale / b.price : 0;
        return db - da;
      })
      .slice(0, 12);

    const brands: BrandInConcern[] = present
      .map((e) => ({ key: e.key, name: e.name, slug: e.slug, count: e.count }))
      .sort((a, b) => b.count - a.count);

    return {
      brandCount: present.length,
      productCount: present.reduce((sum, e) => sum + e.count, 0),
      inStockCount: present.reduce((sum, e) => sum + e.inStockCount, 0),
      brands,
      topProducts,
      rawManufacturers: present.flatMap((e) => e.rawManufacturers),
    };
  }, [catalog, concern]);

  /* ─── Open koncern in catalog: logged-in → activate filter & go to catalog; guest → auth ─── */
  const handleOpenInCatalog = () => {
    if (!data) return;
    if (user) {
      setSelectedBrands(data.rawManufacturers);
      setViewMode('catalog');
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    } else {
      setAuthOpen(true);
    }
  };

  // Unknown slug → 404 section
  if (!concern) {
    return (
      <>
        <Navbar />
        <BackButton to="/" label="Zpět na úvod" />
        <main className="min-h-screen bg-background pt-14 sm:pt-24 flex flex-col items-center justify-center px-6 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Koncern nenalezen</h1>
          <p className="text-muted-foreground mb-6 max-w-md">Tento hodinářský koncern u nás zatím nemáme.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Zpět na úvod
          </Button>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <BackButton to="/" label="Zpět na úvod" />
      <main className="min-h-screen bg-background pt-14 sm:pt-24">

        {/* ── 1) Hero — koncern logo + name + short description ── */}
        <section className="py-12 sm:py-20 bg-white border-b border-border">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
                Hodinářský koncern
              </p>
            </Reveal>
            <Reveal delay={80}>
              <div className="flex items-center justify-center min-h-[72px] sm:min-h-[96px] mb-5">
                <span className="sr-only">{concern.name}</span>
                <BrandLogo
                  name={concern.name}
                  domain={concern.domain}
                  width={600}
                  height={240}
                  className="h-14 sm:h-20 w-auto max-w-[280px] sm:max-w-[420px] object-contain [mix-blend-mode:multiply]"
                  fallbackClassName="font-display text-3xl sm:text-5xl font-black tracking-tight text-foreground"
                />
              </div>
            </Reveal>
            {(concern.country || concern.founded) && (
              <Reveal delay={140}>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-4">
                  {[concern.country, concern.founded && `zal. ${concern.founded}`].filter(Boolean).join(' · ')}
                </p>
              </Reveal>
            )}
            <Reveal delay={200}>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {concern.shortDesc}
              </p>
            </Reveal>
            {data && data.productCount > 0 && (
              <Reveal delay={260}>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Button size="lg" onClick={handleOpenInCatalog} className="gap-2 px-8 font-semibold">
                    <Search className="h-4 w-4" /> Otevřít v katalogu
                  </Button>
                  {/* concern-level watchdog — early access toggle / upsell */}
                  <TopDealAlertButton level="concern" target={concern.slug} label={concern.name} />
                </div>
                {!user && (
                  <p className="text-center text-[11px] text-muted-foreground mt-3">
                    Pro vstup do katalogu se přihlaste nebo vytvořte účet (zdarma).
                  </p>
                )}
              </Reveal>
            )}
          </div>
        </section>

        {/* ── 2) Stats strip ── */}
        {data && (
          <section className="py-10 sm:py-12 bg-zinc-50 border-b border-border">
            <div className="mx-auto max-w-4xl px-6 grid grid-cols-3 gap-4 text-center">
              <Reveal>
                <div className="font-display text-2xl sm:text-4xl font-black text-primary leading-none">{data.brandCount}</div>
                <div className="text-[11px] sm:text-sm text-muted-foreground mt-2">značek v katalogu</div>
              </Reveal>
              <Reveal delay={80}>
                <div className="font-display text-2xl sm:text-4xl font-black text-primary leading-none">{data.productCount}</div>
                <div className="text-[11px] sm:text-sm text-muted-foreground mt-2">modelů celkem</div>
              </Reveal>
              <Reveal delay={160}>
                <div className="font-display text-2xl sm:text-4xl font-black text-primary leading-none">{data.inStockCount}</div>
                <div className="text-[11px] sm:text-sm text-muted-foreground mt-2">skladem v EU</div>
              </Reveal>
            </div>
          </section>
        )}

        {/* ── 3) Story ── */}
        {concern.story && concern.story.length > 0 && (
          <section className="py-14 sm:py-20 bg-white border-b border-border">
            <div className="mx-auto max-w-3xl px-6 text-center">
              <Reveal>
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">O koncernu</p>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground mb-6">
                  Příběh {concern.name}
                </h2>
                <div className="space-y-8 text-left">
                  {concern.story.map((era, i) => (
                    <div key={i}>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4">{era.heading}</h3>
                      <ul className="space-y-3">
                        {era.items.map((item, j) => (
                          <li key={j} className="flex gap-3 text-muted-foreground leading-relaxed">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                            <span>
                              <span className="font-semibold text-foreground">{item.lead}:</span> {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        )}

        {/* ── 4) Brands of the koncern ── */}
        {data && data.brands.length > 0 && (
          <section className="py-14 sm:py-20 bg-zinc-50 border-b border-border">
            <div className="mx-auto max-w-5xl px-6">
              <Reveal>
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 text-center">Značky koncernu</p>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground text-center mb-10">
                  Co od {concern.name} máme
                </h2>
              </Reveal>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {data.brands.map((b, i) => {
                  const meta = getBrandByName(b.name);
                  return (
                    <Reveal key={b.key} delay={Math.min(i, 7) * 50}>
                      <button
                        type="button"
                        onClick={() => navigate(`/brands/${b.slug}`)}
                        className="group w-full h-full rounded-2xl border border-border bg-white p-5 flex flex-col items-center justify-between gap-3 transition-all hover:scale-[1.03] hover:shadow-md hover:border-primary/30"
                      >
                        <div className="h-12 flex items-center justify-center">
                          {meta ? (
                            <BrandLogo
                              name={meta.name}
                              domain={meta.domain}
                              width={320}
                              height={120}
                              className="max-h-10 max-w-[140px] object-contain [mix-blend-mode:multiply]"
                              fallbackClassName="font-display text-base font-black tracking-tight text-foreground"
                            />
                          ) : (
                            <span className="font-display text-base font-black tracking-tight text-foreground">{b.name}</span>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-foreground">{b.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{b.count} modelů</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 -translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                          Zobrazit značku <ArrowRight className="h-3 w-3" />
                        </span>
                      </button>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── 5) Featured products across the koncern ── */}
        {data && data.topProducts.length > 0 && (
          <section className="py-14 sm:py-20 bg-white border-b border-border">
            <div className="mx-auto max-w-6xl px-6">
              <Reveal>
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 text-center">Vybrané modely</p>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground text-center mb-10">
                  Výběr z koncernu
                </h2>
              </Reveal>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {data.topProducts.map((p, i) => {
                  const discount = p.price > 0 ? Math.round((1 - p.wholesale / p.price) * 100) : 0;
                  return (
                    <Reveal key={p.id} delay={Math.min(i, 7) * 50}>
                      <div className="group rounded-xl border border-border bg-white overflow-hidden hover:border-primary/30 hover:shadow-md transition-all h-full flex flex-col">
                        <div className="relative aspect-square bg-white overflow-hidden">
                          <img
                            src={p.img}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-300"
                          />
                          {discount > 0 && (
                            <span className="absolute top-1.5 right-1.5 bg-primary text-white text-[9px] sm:text-[10px] font-bold rounded-full px-1.5 sm:px-2 py-0.5">
                              −{discount}%
                            </span>
                          )}
                          {!p.inStock && (
                            <span className="absolute top-1.5 left-1.5 bg-zinc-900/80 text-white text-[9px] sm:text-[10px] font-semibold rounded-full px-1.5 sm:px-2 py-0.5">
                              Na poptávku
                            </span>
                          )}
                        </div>
                        <div className="p-2 sm:p-3 border-t border-border flex-1">
                          <p className="text-[11px] sm:text-xs font-medium leading-tight text-foreground line-clamp-2">{p.name}</p>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── 6) Why us — benefit cards ── */}
        <section className="py-14 sm:py-20 bg-zinc-50 border-b border-border">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 text-center">Proč {concern.name} u nás</p>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground text-center mb-10">
                Vaše výhody
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Rss, title: 'Automatický feed', text: 'XML/CSV feed produktů celého koncernu přímo do vašeho e‑shopu.', action: () => navigate('/feed') },
                { icon: PackageOpen, title: 'Dropshipping', text: 'Prodávejte značky koncernu bez skladu — balíme a expedujeme pod vaší značkou.', action: () => navigate('/dropshipping') },
                { icon: HandCoins, title: 'Nákup bez registrace', text: 'Soukromý i firemní nákup bez B2B registrace, stačí IČO.', action: () => navigate('/luxury') },
                { icon: Truck, title: 'Skladem v EU', text: 'Expedice do 24–48 h ze středoevropského skladu, doručení do 72 h.', action: handleOpenInCatalog },
              ].map(({ icon: Icon, title, text, action }, i) => (
                <Reveal key={title} delay={Math.min(i, 3) * 70}>
                  <button
                    type="button"
                    onClick={action}
                    className="group text-left w-full h-full rounded-2xl border border-border bg-white p-6 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-md hover:border-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 transition-colors group-hover:bg-primary/15">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display font-black text-lg mb-1.5 text-foreground flex items-center gap-1.5">
                      {title}
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7) Final CTA ── */}
        <section className="py-16 sm:py-24 bg-primary text-primary-foreground">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-4">
                Chcete prodávat značky {concern.name}?
              </h2>
              <p className="text-base sm:text-lg opacity-90 mb-8 max-w-xl mx-auto leading-relaxed">
                Zaregistrujte se zdarma jako B2B partner a získejte přístup k velkoobchodním cenám, kompletnímu katalogu a dropshippingu.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="gap-2 px-8 bg-white text-primary hover:bg-white/90" onClick={handleOpenInCatalog}>
                  <Search className="h-4 w-4" /> Otevřít v katalogu
                </Button>
                <Button size="lg" variant="secondary" className="gap-2 px-8" onClick={() => navigate('/brands')}>
                  <ArrowLeft className="h-4 w-4" /> Procházet všechny značky
                </Button>
              </div>
              <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm opacity-80">
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" strokeWidth={3} /> Registrace zdarma</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" strokeWidth={3} /> Schválení do 24 h</li>
                <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5" strokeWidth={3} /> Bez závazků</li>
              </ul>
            </Reveal>
          </div>
        </section>

      </main>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab="login"
        tip={`Pro vstup do katalogu ${concern.name} se nejprve přihlaste.`}
        onLoginSuccess={() => {
          if (data) {
            setSelectedBrands(data.rawManufacturers);
            setViewMode('catalog');
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
          }
        }}
      />
      <ScrollToTopButton />
    </>
  );
}
