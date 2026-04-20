import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Eye, TrendingUp, BarChart3, Target, Database, Brain, Gauge, Bell,
  Package, Layers, CalendarRange, MessageSquareQuote, AlertTriangle, Activity,
  Check, Sparkles, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { useWishlist } from '@/hooks/useWishlist';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import bgIntelligence from '@/assets/gateway-intelligence.jpg';
import warehouseImg from '@/assets/intel-warehouse.jpg';
import chartImg from '@/assets/intel-chart.jpg';


/* Reveal hook */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function CountUp({ to, duration = 1400, suffix = '' }: { to: number; duration?: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useReveal<HTMLSpanElement>();
  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      {children}
    </div>
  );
}

const useCases = [
  { tag: 'Nákup a zásoby', icon: Package, title: 'Objednávejte s čísly, ne s pocitem', text: 'Prediktivní skóre vám říká, které SKU posílit a které zredukovat. Méně přezásobení, méně výpadků, méně vyhozených peněz.', example: '„Skóre 87 pro SKU-4471 → navýším objednávku o 20 %."' },
  { tag: 'Kategoriový rozvoj', icon: Layers, title: 'Vstupte do kategorie dřív než ostatní', text: 'Trendy kategorií vidíte dřív, než se dostanou do obecného povědomí. Včasný vstup znamená lepší pozici a vyšší marži.', example: '„Kategorie X roste +41 % MoM — já ji zatím nemám, ale vím o tom jako první."' },
  { tag: 'Sezónní plánování', icon: CalendarRange, title: 'Připravte sklad před špičkou, ne během ní', text: 'Prognózy 3 měsíce dopředu vám dají čas. Přestanete panikařit a doobjednávat za příplatek, když je pozdě.', example: '„Model predikuje špičku v týdnu 38 — zásoby připravím v týdnu 35."' },
  { tag: 'Obchodní argumentace', icon: MessageSquareQuote, title: 'Jděte za zákazníkem s daty v ruce', text: 'Přestaňte říkat „myslím, že se to prodá". Říkejte „trh to prodává o 34 % víc než loni — a vy zatím ne".', example: '„Váš benchmark je 18 % pod průměrem trhu v této kategorii."' },
  { tag: 'Early warning', icon: AlertTriangle, title: 'Odprodejte dřív, než přijde propad', text: 'Model zachytí slábnutí trendu dřív, než ho pocítíte na prodejích. Zredukujete zásoby v čas a ušetříte na vázaném kapitálu.', example: '„SKU-2208 klesá 2 měsíce v řadě → snižuji zásoby, dokud je čas."' },
  { tag: 'Celkový přehled', icon: Activity, title: 'Konečně víte, kde reálně stojíte', text: 'Benchmark vám ukáže, kde vedete trh a kde zaostáváte. Ne jako pocit — jako číslo, s nímž se dá pracovat.', example: '„Ve 3 kategoriích jsem nad průměrem, ve 2 ztrácím — teď vím kde začít."' },
];

const insights = [
  { icon: Eye, tag: 'Viditelnost', title: 'Pohyb zboží napříč trhem', text: 'Nevidíte jen svůj sklad — vidíte, co se reálně prodává v celé distribuci. Silnější signál než jakýkoli průzkum.' },
  { icon: TrendingUp, tag: 'Predikce', title: 'Model, který se učí z dat', text: 'Prediktivní skóre pro každý SKU vám říká, jestli poptávka poroste, drží se nebo klesá — dřív než to pocítíte na pokladně.' },
  { icon: BarChart3, tag: 'Benchmark', title: 'Jak si stojíte vůči trhu', text: 'Porovnejte své prodeje s anonymním agregátem trhu. Okamžitě víte, kde vedete a kde ztrácíte pozici.' },
  { icon: Target, tag: 'Akce', title: 'Doporučení, ne jen čísla', text: 'Každý signál je přeložen do jasného kroku: naskladnit, sledovat, nebo redukovat. Žádné interpretování grafů.' },
];

const steps = [
  { icon: Database, title: 'Vaše data zůstávají vaše', text: 'Do modelu vstupují pouze anonymizované, agregované signály. Nikdo nevidí vaše konkrétní objednávky — jen benchmark, kde se nacházíte vůči trhu.' },
  { icon: Brain, title: 'Model hledá vzory za vás', text: 'Sezonní špičky, nárůsty penetrace, stabilní růst bez výkyvů — to jsou signály, které lidsky přehlédnete. Model je vidí automaticky a přiřadí jim váhu.' },
  { icon: Gauge, title: 'Dostanete číslo i slovní výklad', text: 'Skóre 0–100 doplněné odůvodněním. 80+ znamená jednat. Pod 40 znamená sledovat nebo redukovat. Nemusíte interpretovat grafy.' },
  { icon: Bell, title: 'Doporučení tam, kde pracujete', text: 'Dashboard, API nebo push notifikace — skóre přijde tam, kde se rozhodujete. Žádné přihlašování do dalšího systému, pokud nechcete.' },
];

const tiers = [
  {
    name: 'Signal',
    subtitle: 'Měsíční přehled trendů,\nkterý dostanete automaticky',
    price: 'Součást',
    priceUnit: 'partnerství',
    priceNote: 'přidaná hodnota bez příplatku',
    cta: 'Mám zájem',
    ctaVariant: 'outline' as const,
    featured: false,
    features: [
      'Měsíční report trendů dle kategorie',
      'Top 10 rostoucích SKU v segmentu',
      'Top 5 ztrácejících produktů (early warning)',
      'Sezonní vzory — 12měsíční pohled',
      'Export PDF + strojově čitelný JSON',
    ],
  },
  {
    name: 'Compass',
    subtitle: 'Prediktivní skóre pro každý SKU\nve vašem sortimentu',
    price: '4 900',
    priceUnit: 'Kč / měsíc',
    priceNote: 'nebo jako add-on k SWELT.PARTNER',
    cta: 'Vyzkoušet Compass',
    ctaVariant: 'default' as const,
    featured: true,
    features: [
      'Prediktivní skóre poptávky (0–100) pro každý SKU',
      'Konfidencní interval + historická přesnost modelu',
      'Porovnání partnera vůči anonymnímu trhu',
      'Upozornění na nové trendy před hromadným šířením',
      'API přístup nebo dashboard integrace',
      'Týdenní digest — aktivity skóre',
    ],
  },
  {
    name: 'Atlas',
    subtitle: 'Strategický pohled na byznys i trh\npro dlouhodobé plánování',
    price: 'Na míru',
    priceUnit: '',
    priceNote: 'roční smlouva, enterprise pricing',
    cta: 'Kontaktovat sales',
    ctaVariant: 'outline' as const,
    featured: false,
    features: [
      'Vše z Compass',
      'Segmentace trhu — kde vedete, kde zaostáváte',
      'Korelační analýza prodejů',
      'Sezónní prognózy 3 měsíce dopředu',
      'White-label export dat',
      'Dedikovaný analytik (1× čtvrtletně)',
      'Custom alerting na prahové hodnoty',
    ],
  },
];

/* ───────── Score simulator ───────── */
function ScoreSimulator() {
  const [trend, setTrend] = useState([72]);
  const [penetration, setPenetration] = useState([55]);
  const [seasonality, setSeasonality] = useState([80]);
  const [correlation, setCorrelation] = useState([45]);

  const score = Math.round(
    trend[0] * 0.35 + penetration[0] * 0.25 + seasonality[0] * 0.2 + correlation[0] * 0.2
  );

  const recommendation =
    score >= 80 ? { label: 'Naskladnit', tone: 'success', desc: 'Silný signál — navyšte objednávku.' } :
    score >= 60 ? { label: 'Sledovat', tone: 'accent', desc: 'Pozitivní trend, držet pozici.' } :
    score >= 40 ? { label: 'Pozorovat', tone: 'muted', desc: 'Smíšené signály, rozhodujte opatrně.' } :
                  { label: 'Redukovat', tone: 'destructive', desc: 'Slábnoucí poptávka, snižte zásoby.' };

  const sliders = [
    { label: 'MoM obrat (3M trend)', value: trend, set: setTrend, weight: '35%' },
    { label: 'Nová penetrace odběratelů', value: penetration, set: setPenetration, weight: '25%' },
    { label: 'Sezonní stabilita', value: seasonality, set: setSeasonality, weight: '20%' },
    { label: 'Košíková korelace', value: correlation, set: setCorrelation, weight: '20%' },
  ];

  const ringColor =
    score >= 80 ? 'hsl(142 76% 36%)' :
    score >= 60 ? 'hsl(var(--accent))' :
    score >= 40 ? 'hsl(var(--muted-foreground))' :
                  'hsl(var(--destructive))';

  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
      <div className="space-y-6">
        {sliders.map((s) => (
          <div key={s.label}>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-sm font-medium">{s.label}</label>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground">váha {s.weight}</span>
                <span className="font-display text-lg font-semibold tabular-nums">{s.value[0]}</span>
              </div>
            </div>
            <Slider value={s.value} onValueChange={s.set} min={0} max={100} step={1} />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-6 text-center">
        <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Prediktivní skóre</div>
        <div className="relative mx-auto w-[180px] h-[180px]">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
            <circle
              cx="80" cy="80" r="70" fill="none"
              stroke={ringColor} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display text-5xl font-semibold tabular-nums">{score}</div>
            <div className="text-[10px] tracking-wider uppercase text-muted-foreground">/ 100</div>
          </div>
        </div>
        <div className="mt-5">
          <Badge
            className="text-xs"
            style={{ background: ringColor, color: 'white' }}
          >
            {recommendation.label}
          </Badge>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{recommendation.desc}</p>
        </div>
      </div>
    </div>
  );
}

const Intelligence = () => {
  const navigate = useNavigate();
  const { wishlistIds } = useWishlist();
  const [wishlistOpen, setWishlistOpen] = useState(false);

  return (
    <div
      className="dark relative flex min-h-screen flex-col pb-16 lg:pb-0 text-foreground"
      style={{
        // Scoped tmavě modrá paleta jen pro tuto stránku
        ['--background' as any]: '220 50% 8%',
        ['--foreground' as any]: '220 15% 92%',
        ['--card' as any]: '220 45% 12%',
        ['--card-foreground' as any]: '220 15% 95%',
        ['--popover' as any]: '220 45% 12%',
        ['--popover-foreground' as any]: '220 15% 95%',
        ['--muted' as any]: '220 35% 18%',
        ['--muted-foreground' as any]: '220 15% 70%',
        ['--border' as any]: '220 30% 22%',
        ['--input' as any]: '220 30% 22%',
        ['--accent' as any]: '215 90% 65%',
        ['--accent-foreground' as any]: '220 50% 8%',
        ['--primary' as any]: '215 90% 60%',
        ['--primary-foreground' as any]: '0 0% 100%',
      }}
    >
      {/* Globální tmavě modré pozadí s neuronovou sítí */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[hsl(220_55%_7%)]" />
        <img src={bgIntelligence} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220_60%_8%)]/70 via-[hsl(220_60%_8%)]/40 to-[hsl(220_60%_8%)]/90" />
      </div>
      <Navbar wishlistCount={wishlistIds.size} onOpenWishlist={() => setWishlistOpen(true)} />

      <main className="flex-1 pt-14 text-foreground">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                SWELT INTELIGENCE — Tržní data
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
                Objednávejte s jistotou,<br />
                ne <span className="italic text-accent">náhodou.</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Přestaňte hádat, co se prodá. SWELT INTELIGENCE vám dává přehled o pohybu zboží napříč celou distribucí —
                takže víte, co objednat dřív, než vám dojdou zásoby nebo uvíznete s přebytkem.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <div>
                  <div className="font-display text-3xl font-semibold text-accent"><CountUp to={89} />%</div>
                  <div className="text-[11px] text-muted-foreground mt-1">přesnost predikce</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-semibold text-accent">+<CountUp to={34} />%</div>
                  <div className="text-[11px] text-muted-foreground mt-1">MoM růst signálů</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-semibold text-accent"><CountUp to={3} />M</div>
                  <div className="text-[11px] text-muted-foreground mt-1">předstih prognóz</div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <a href="#pricing">Prozkoumat produkt <ArrowRight className="h-4 w-4" /></a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#simulator">Zkusit simulátor</a>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="relative rounded-2xl border bg-card/90 backdrop-blur p-6 shadow-xl max-w-md ml-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] tracking-[0.2em] uppercase text-accent font-semibold">Live signál · SKU-4471</div>
                  <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display text-5xl font-semibold">+<CountUp to={34} /></span>
                  <span className="text-sm text-accent font-medium">% MoM</span>
                </div>
                <div className="text-xs text-muted-foreground mb-5">Obrat napříč distribucí · duben 2025</div>

                {[87, 72, 91].map((w, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                      <span>{['Trend', 'Penetrace', 'Stabilita'][i]}</span><span className="tabular-nums">{w}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-accent/60 to-accent rounded-full"
                           style={{ width: `${w}%`, transition: 'width 1.2s ease', transitionDelay: `${i * 200}ms` }} />
                    </div>
                  </div>
                ))}

                <div className="mt-5 pt-4 border-t flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Skóre</div>
                    <div className="font-display text-3xl font-semibold text-accent"><CountUp to={89} /></div>
                  </div>
                  <Badge className="bg-green-600 text-white hover:bg-green-700">↑ Naskladnit</Badge>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* INSIGHTS / PRODUCT */}
        <section id="produkt" className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-[11px] tracking-[0.25em] uppercase text-accent font-semibold mb-3">Logika produktu</div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">Vidíte svůj sklad. My vidíme celý trh.</h2>
            <p className="mt-4 text-muted-foreground">
              Čtyři pilíře, které proměňují anonymní data v rozhodnutí, jež posilují váš byznys.
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {insights.map((it, i) => {
              const Icon = it.icon;
              return (
                <Reveal key={it.title} delay={i * 80}>
                  <div className="group h-full rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-accent/40">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5">{it.tag}</div>
                    <h3 className="font-semibold mb-2">{it.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{it.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* DATA FLOW DIAGRAM */}
        <section className="border-y bg-card/30 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="text-center max-w-2xl mx-auto mb-14">
              <div className="text-[11px] tracking-[0.25em] uppercase text-accent font-semibold mb-3">Tok dat</div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">Od signálu k doporučení</h2>
              <p className="mt-4 text-muted-foreground">Jak surová data napříč distribucí dorazí jako jasný krok.</p>
            </Reveal>

            <div className="grid lg:grid-cols-5 gap-4 items-stretch">
              {[
                { icon: Database, label: 'Anonymizovaná data' },
                { icon: Layers, label: 'Agregace signálů' },
                { icon: Brain, label: 'Model & váhy' },
                { icon: Gauge, label: 'Skóre 0–100' },
                { icon: Bell, label: 'Doporučení' },
              ].map((s, i, arr) => {
                const Icon = s.icon;
                return (
                  <Reveal key={s.label} delay={i * 100} className="contents">
                    <div className="flex lg:flex-col items-center gap-3">
                      <div className="flex-1 rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 text-center w-full">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent mb-3">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-medium">{s.label}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Krok {i + 1}</div>
                      </div>
                      {i < arr.length - 1 && (
                        <ChevronRight className="h-5 w-5 text-accent shrink-0 lg:hidden rotate-90" />
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-[11px] tracking-[0.25em] uppercase text-accent font-semibold mb-3">Use cases</div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">Šest scénářů, kde data mění hru</h2>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((uc, i) => {
              const Icon = uc.icon;
              return (
                <Reveal key={uc.title} delay={(i % 3) * 80}>
                  <div className="group h-full rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-accent/40">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{uc.tag}</div>
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2 leading-snug">{uc.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{uc.text}</p>
                    <p className="text-xs italic text-accent/90 border-l-2 border-accent/40 pl-3">{uc.example}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* HOW IT WORKS — timeline with image */}
        <section id="logika" className="border-y bg-card/30 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6 py-20 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
            <Reveal>
              <img
                src={warehouseImg}
                alt="Sklady a distribuce"
                loading="lazy"
                className="rounded-2xl shadow-xl w-full aspect-[4/3] object-cover"
              />
            </Reveal>
            <div>
              <Reveal>
                <div className="text-[11px] tracking-[0.25em] uppercase text-accent font-semibold mb-3">Jak model funguje</div>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-10">Čtyři kroky od dat k rozhodnutí</h2>
              </Reveal>
              <ol className="space-y-6">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <Reveal key={s.title} delay={i * 100}>
                      <li className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-display font-semibold text-sm shrink-0 group-hover:scale-110 transition-transform">
                            {i + 1}
                          </div>
                          {i < steps.length - 1 && <div className="w-px flex-1 bg-border mt-2 min-h-8" />}
                        </div>
                        <div className="pb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4 text-accent" />
                            <h3 className="font-semibold">{s.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                        </div>
                      </li>
                    </Reveal>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* SCORE SIMULATOR */}
        <section id="simulator" className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-[11px] tracking-[0.25em] uppercase text-accent font-semibold mb-3">Interaktivní simulátor</div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">Vyzkoušejte, jak se počítá skóre</h2>
            <p className="mt-4 text-muted-foreground">
              Posuňte signály a sledujte, jak se mění predikce a doporučená akce.
            </p>
          </Reveal>
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-6 sm:p-10 shadow-xl">
              <ScoreSimulator />
            </div>
          </Reveal>
        </section>

        {/* MARKET IMAGE STRIP */}
        <section className="relative overflow-hidden border-y">
          <img src={chartImg} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
            <Reveal>
              <div className="text-[11px] tracking-[0.25em] uppercase text-accent font-semibold mb-3">Trh v číslech</div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-6">Data, která dávají kontext</h2>
              <p className="text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
                Agregované signály z celé distribuční sítě vám ukazují, kde reálně stojíte — bez dohadů, bez nepřesných průzkumů.
              </p>
              <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                <div>
                  <div className="font-display text-4xl font-semibold text-accent">+<CountUp to={41} />%</div>
                  <div className="text-xs text-muted-foreground mt-1">růst rostoucích kategorií MoM</div>
                </div>
                <div>
                  <div className="font-display text-4xl font-semibold text-accent"><CountUp to={12} />×</div>
                  <div className="text-xs text-muted-foreground mt-1">rychlejší reakce na změnu trendu</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-[11px] tracking-[0.25em] uppercase text-accent font-semibold mb-3">Pricing</div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">Tři úrovně. Vyberte, jak hluboko chcete vidět.</h2>
          </Reveal>

          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            {tiers.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div
                  className={`relative h-full rounded-2xl border bg-card flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl
                    ${t.featured ? 'border-accent border-2 shadow-lg' : ''}`}
                >
                  {t.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-accent text-accent-foreground hover:bg-accent">Doporučeno</Badge>
                    </div>
                  )}

                  {/* Header */}
                  <div className="p-8 pb-6 text-center border-b">
                    <h3 className="font-display text-3xl font-semibold mb-2">{t.name}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line min-h-[3rem]">{t.subtitle}</p>

                    <div className="mt-6 mb-6">
                      <div className="flex items-baseline justify-center gap-1.5">
                        {t.price !== 'Součást' && t.price !== 'Na míru' && (
                          <span className="text-2xl text-muted-foreground">$</span>
                        )}
                        <span className="font-display text-5xl font-semibold">{t.price}</span>
                        {t.priceUnit && (
                          <span className="text-sm text-muted-foreground ml-1">{t.priceUnit}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{t.priceNote}</p>
                    </div>

                    <Button
                      variant={t.ctaVariant}
                      className="w-full"
                      size="lg"
                      onClick={() => navigate('/velkoobchod')}
                    >
                      {t.cta}
                    </Button>
                  </div>

                  {/* Features */}
                  <div className="p-8 pt-6 flex-1 bg-muted/20 rounded-b-2xl">
                    {i > 0 && (
                      <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                        <ArrowRight className="h-3 w-3" />
                        Vše z {tiers[i - 1].name}, plus…
                      </div>
                    )}
                    <ul className="space-y-3">
                      {t.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-card/30 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center">
            <Reveal>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">
                Začněte rozhodovat s daty.
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Domluvíme krátkou ukázku na vašich kategoriích — uvidíte, jak skóre sedí na váš sortiment.
              </p>
              <Button size="lg" onClick={() => navigate('/velkoobchod')}>
                Domluvit ukázku <ArrowRight className="h-4 w-4" />
              </Button>
            </Reveal>
          </div>
        </section>
      </main>

      <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
      <BottomNav onOpenWishlist={() => setWishlistOpen(true)} wishlistCount={wishlistIds.size} />
    </div>
  );
};

export default Intelligence;
