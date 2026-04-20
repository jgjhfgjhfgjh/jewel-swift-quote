import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  TrendingUp,
  BarChart3,
  Target,
  Database,
  Brain,
  Gauge,
  Bell,
  Package,
  Layers,
  CalendarRange,
  MessageSquareQuote,
  AlertTriangle,
  Activity,
  Check,
  Sparkles,
} from 'lucide-react';
import heroImg from '@/assets/intel-hero.jpg';
import flowImg from '@/assets/intel-flow.jpg';
import marketImg from '@/assets/intel-market.jpg';

/* ─────────────── Reveal hook ─────────────── */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

/* ─────────────── Counter ─────────────── */
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
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

/* ─────────────── Use cases data ─────────────── */
const useCases = [
  {
    tag: '◈ Nákup a zásoby',
    icon: Package,
    title: 'Objednávejte s čísly, ne s pocitem',
    text: 'Prediktivní skóre vám říká, které SKU posílit a které zredukovat. Méně přezásobení, méně výpadků, méně vyhozených peněz.',
    example: '„Skóre 87 pro SKU-4471 → navýším objednávku o 20 %."',
  },
  {
    tag: '◈ Kategoriový rozvoj',
    icon: Layers,
    title: 'Vstupte do kategorie dřív než ostatní',
    text: 'Trendy kategorií vidíte dřív, než se dostanou do obecného povědomí. Včasný vstup znamená lepší pozici a vyšší marži.',
    example: '„Kategorie X roste +41 % MoM — já ji zatím nemám, ale vím o tom jako první."',
  },
  {
    tag: '◈ Sezónní plánování',
    icon: CalendarRange,
    title: 'Připravte sklad před špičkou, ne během ní',
    text: 'Prognózy 3 měsíce dopředu vám dají čas. Přestanete panikařit a doobjednávat za příplatek, když je pozdě.',
    example: '„Model predikuje špičku v týdnu 38 — zásoby připravím v týdnu 35."',
  },
  {
    tag: '◈ Obchodní argumentace',
    icon: MessageSquareQuote,
    title: 'Jděte za zákazníkem s daty v ruce',
    text: 'Přestaňte říkat „myslím, že se to prodá". Říkejte „trh to prodává o 34 % víc než loni — a vy zatím ne".',
    example: '„Váš benchmark je 18 % pod průměrem trhu v této kategorii."',
  },
  {
    tag: '◈ Early warning',
    icon: AlertTriangle,
    title: 'Odprodejte dřív, než přijde propad',
    text: 'Model zachytí slábnutí trendu dřív, než ho pocítíte na prodejích. Zredukujete zásoby v čas a ušetříte na vázaném kapitálu.',
    example: '„SKU-2208 klesá 2 měsíce v řadě → snižuji zásoby, dokud je čas."',
  },
  {
    tag: '◈ Celkový přehled',
    icon: Activity,
    title: 'Konečně víte, kde reálně stojíte',
    text: 'Benchmark vám ukáže, kde vedete trh a kde zaostáváte. Ne jako pocit — jako číslo, s nímž se dá pracovat.',
    example: '„Ve 3 kategoriích jsem nad průměrem, ve 2 ztrácím — teď vím kde začít."',
  },
];

/* ─────────────── Insight cells ─────────────── */
const insights = [
  {
    icon: Eye,
    tag: '◈ VIDITELNOST',
    title: 'Pohyb zboží napříč trhem',
    text: 'Nevidíte jen svůj sklad — vidíte, co se reálně prodává v celé distribuci. Silnější signál než jakýkoli průzkum.',
  },
  {
    icon: TrendingUp,
    tag: '◈ PREDIKCE',
    title: 'Model, který se učí z dat',
    text: 'Prediktivní skóre pro každý SKU vám říká, jestli poptávka poroste, drží se nebo klesá — dřív než to pocítíte na pokladně.',
  },
  {
    icon: BarChart3,
    tag: '◈ BENCHMARK',
    title: 'Jak si stojíte vůči trhu',
    text: 'Porovnejte své prodeje s anonymním agregátem trhu. Okamžitě víte, kde vedete a kde ztrácíte pozici.',
  },
  {
    icon: Target,
    tag: '◈ AKCE',
    title: 'Doporučení, ne jen čísla',
    text: 'Každý signál je přeložen do jasného kroku: naskladnit, sledovat, nebo redukovat. Žádné interpretování grafů.',
  },
];

/* ─────────────── Steps ─────────────── */
const steps = [
  {
    icon: Database,
    title: 'Vaše data zůstávají vaše',
    text: 'Do modelu vstupují pouze anonymizované, agregované signály. Nikdo nevidí vaše konkrétní objednávky — jen benchmark, kde se nacházíte vůči trhu.',
  },
  {
    icon: Brain,
    title: 'Model hledá vzory za vás',
    text: 'Sezonní špičky, nárůsty penetrace, stabilní růst bez výkyvů — to jsou signály, které lidsky přehlédnete. Model je vidí automaticky a přiřadí jim váhu.',
  },
  {
    icon: Gauge,
    title: 'Dostanete číslo i slovní výklad',
    text: 'Skóre 0–100 doplněné odůvodněním. 80+ znamená jednat. Pod 40 znamená sledovat nebo redukovat. Nemusíte interpretovat grafy.',
  },
  {
    icon: Bell,
    title: 'Doporučení tam, kde pracujete',
    text: 'Dashboard, API nebo push notifikace — skóre přijde tam, kde se rozhodujete. Žádné přihlašování do dalšího systému, pokud nechcete.',
  },
];

/* ─────────────── Tiers (pricing) ─────────────── */
const tiers = [
  {
    level: 'Úroveň 01',
    name: 'Signal',
    tagline: 'Měsíční přehled trendů, které ovlivní váš sortiment. Dostanete ho automaticky jako součást partnerství.',
    features: [
      'Měsíční report trendů dle kategorie',
      'Top 10 rostoucích SKU v segmentu',
      'Top 5 ztrácejících produktů (early warning)',
      'Sezonní vzory — 12měsíční pohled',
      'Export PDF + strojově čitelný JSON',
    ],
    priceTitle: 'Součást partnerství',
    priceSub: 'přidaná hodnota bez příplatku',
    cta: 'Mám zájem',
    featured: false,
  },
  {
    level: 'Úroveň 02',
    name: 'Compass',
    tagline: 'Prediktivní skóre pro každý SKU ve vašem sortimentu. Rozhodujete se s čísly, ne s intuicí.',
    features: [
      'Prediktivní skóre poptávky (0–100) pro každý SKU',
      'Konfidencní interval + historická přesnost modelu',
      'Porovnání partnera vůči anonymnímu trhu',
      'Upozornění na nové trendy před hromadným šířením',
      'API přístup nebo dashboard integrace',
      'Týdenní digest — aktivity skóre',
    ],
    priceTitle: 'Od 4 900 Kč / měsíc',
    priceSub: 'nebo jako add-on k SWELT.PARTNER',
    cta: 'Vyzkoušet Compass',
    featured: true,
  },
  {
    level: 'Úroveň 03',
    name: 'Atlas',
    tagline: 'Strategický pohled na váš byznys i trh. Pro rozhodování na úrovni nákupu, rozvoje kategorií a dlouhodobého plánování.',
    features: [
      'Vše z Compass',
      'Segmentace trhu — kde partner vede, kde zaostává',
      'Korelační analýza: které produkty se prodávají společně',
      'Sezónní prognózy 3 měsíce dopředu',
      'White-label export dat pod brandingem partnera',
      'Dedikovaný analytik (1× čtvrtletně)',
      'Custom alerting na definované prahové hodnoty',
    ],
    priceTitle: 'Na míru',
    priceSub: 'roční smlouva, enterprise pricing',
    cta: 'Kontaktovat sales',
    featured: false,
  },
];

const signalRows = [
  { label: 'MoM obrat (3M trend)', pct: 87 },
  { label: 'Nová penetrace odběratelů', pct: 73 },
  { label: 'Sezonní stabilita', pct: 91 },
  { label: 'Výpadky u konkurenčního SKU', pct: 55 },
  { label: 'Košíková korelace', pct: 68 },
];

/* ─────────────── Section wrapper ─────────────── */
function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }: any) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {children}
    </Tag>
  );
}

const Intelligence = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] text-[#E8E4DC]"
      style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontWeight: 300 }}
    >
      {/* Local font + noise overlay */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        .font-display-intel { font-family: 'Cormorant Garamond', serif; }
        .intel-noise::before {
          content: '';
          position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: .35;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        @keyframes intel-pulse {
          0%,100% { opacity:1; transform: scale(1); }
          50% { opacity:.4; transform: scale(.7); }
        }
        @keyframes intel-fill { from { width: 0; } }
        .signal-fill-anim { animation: intel-fill 1.6s cubic-bezier(.2,.8,.2,1) forwards; }
      `}</style>

      <div className="intel-noise relative">
        {/* HEADER */}
        <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-12 py-4 sm:py-5 border-b border-[rgba(201,168,76,0.15)] backdrop-blur-md bg-[rgba(10,10,10,0.85)]">
          <button
            onClick={() => navigate('/')}
            className="font-display-intel text-[0.95rem] sm:text-[1.1rem] tracking-[0.3em] text-[#C9A84C] uppercase hover:opacity-80 transition"
          >
            SWELT<span className="text-[#B0ACA4] font-light">.PARTNER</span>
          </button>
          <div className="hidden sm:block text-[0.6rem] tracking-[0.25em] text-[#787470] uppercase">
            Datový produkt / B2B Intelligence
          </div>
        </header>

        {/* HERO */}
        <section className="relative min-h-screen grid lg:grid-cols-2 gap-12 lg:gap-20 items-center px-6 sm:px-12 pt-32 pb-20 overflow-hidden">
          <div
            className="absolute right-[-200px] top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }}
          />
          <img
            src={heroImg}
            alt=""
            width={1280}
            height={896}
            className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-7">
            <Reveal>
              <div className="flex items-center gap-3 text-[0.62rem] tracking-[0.3em] text-[#C9A84C] uppercase">
                <span className="block w-8 h-px bg-[#C9A84C]" />
                SWELT INTEL — Tržní zpravodajství
              </div>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="font-display-intel font-light leading-[1.05] tracking-tight text-[3rem] sm:text-[4rem] lg:text-[5.5rem]">
                Objednávejte<br />
                s jistotou,<br />
                ne <em className="italic text-[#C9A84C]">náhodou.</em>
              </h1>
            </Reveal>
            <Reveal delay={260}>
              <p className="text-[0.82rem] leading-[1.8] text-[#B0ACA4] max-w-[420px]">
                Přestaňte hádat, co se prodá. SWELT INTEL vám dává přehled o pohybu zboží napříč celou distribucí — takže
                víte, co objednat dřív, než vám dojdou zásoby nebo uvíznete s přebytkem.
              </p>
            </Reveal>
            <Reveal delay={380}>
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <a
                  href="#produkt"
                  className="bg-[#C9A84C] hover:bg-[#E8C96B] text-[#0A0A0A] px-8 py-3.5 text-[0.65rem] tracking-[0.2em] uppercase font-medium transition-colors"
                >
                  Prozkoumat produkt
                </a>
                <a
                  href="#logika"
                  className="text-[0.65rem] tracking-[0.2em] uppercase text-[#B0ACA4] hover:text-[#C9A84C] border-b border-[rgba(201,168,76,0.35)] pb-0.5 transition-colors"
                >
                  Jak funguje model
                </a>
              </div>
            </Reveal>
          </div>

          {/* HERO data card */}
          <Reveal delay={300} className="relative z-10">
            <div className="relative bg-[#161616] border border-[rgba(201,168,76,0.15)] p-7 max-w-md mx-auto">
              <div className="absolute -top-px left-6 -translate-y-1/2 bg-[#0A0A0A] px-2 text-[0.55rem] tracking-[0.3em] text-[#C9A84C] uppercase">
                Live signál · SKU-4471
              </div>

              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="font-display-intel font-light text-[2.8rem] leading-none">
                  +<CountUp to={34} />
                </span>
                <span className="text-[0.6rem] text-[#C9A84C] tracking-[0.15em]">% MoM</span>
              </div>
              <div className="text-[0.6rem] text-[#787470] tracking-wide mb-5">
                Obrat napříč distribucí · duben 2025
              </div>

              {[87, 72, 91].map((w, i) => (
                <div key={i} className="h-[2px] bg-[#1E1E1E] mb-2.5 overflow-hidden">
                  <div
                    className="h-full signal-fill-anim"
                    style={{
                      width: `${w}%`,
                      background: 'linear-gradient(90deg, #7A6330, #C9A84C)',
                      animationDelay: `${i * 0.25}s`,
                    }}
                  />
                </div>
              ))}

              <ul className="text-[0.62rem] text-[#B0ACA4] leading-[2] mt-2">
                <li>
                  <span className="text-[#C9A84C]">↑ </span>Konzistentní růst 3 měsíce v řadě
                </li>
                <li>
                  <span className="text-[#C9A84C]">↑ </span>Penetrace nových odběratelů +18 %
                </li>
                <li>
                  <span className="text-[#C9A84C]">↑ </span>Nízká sezonalita — stabilní signál
                </li>
              </ul>

              <div className="inline-flex items-center gap-2 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.35)] px-4 py-2.5 mt-5 text-[0.58rem] tracking-[0.15em] uppercase text-[#C9A84C]">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]"
                  style={{ animation: 'intel-pulse 1.5s ease-in-out infinite' }}
                />
                Predikce: poptávka udrží trend → <CountUp to={89} />% konf.
              </div>

              {/* floating */}
              <div className="absolute -bottom-8 -right-4 sm:-right-8 bg-[#1E1E1E] border border-[rgba(201,168,76,0.35)] px-5 py-4 w-[200px]">
                <div className="text-[0.55rem] text-[#787470] tracking-[0.2em] uppercase mb-2">Prediktivní skóre</div>
                <div className="font-display-intel text-[1.8rem] text-[#C9A84C]">
                  <CountUp to={89} />
                  <span className="text-base text-[#B0ACA4]">%</span>
                </div>
                <div className="text-[0.58rem] text-[#B0ACA4] mt-1">↑ Doporučeno: naskladnit</div>
              </div>
            </div>
          </Reveal>
        </section>

        <Divider>Logika produktu</Divider>

        {/* PROBLEM SECTION */}
        <section className="px-6 sm:px-12 py-20 grid lg:grid-cols-[280px_1fr] gap-12 lg:gap-20">
          <Reveal>
            <div className="font-display-intel text-[6rem] leading-none text-[rgba(201,168,76,0.08)] select-none">
              01
            </div>
          </Reveal>
          <div>
            <Reveal>
              <div className="text-[0.6rem] tracking-[0.3em] text-[#C9A84C] uppercase mb-5">
                Proč rozhodovat naslepo?
              </div>
              <h2 className="font-display-intel font-light text-[2rem] sm:text-[3.2rem] leading-[1.1] mb-7">
                Vidíte svůj sklad.<br />
                My vidíme<br />
                celý trh.
              </h2>
              <p className="text-[0.78rem] leading-[1.9] text-[#B8B4AC] max-w-[580px]">
                Každý měsíc se rozhodujete co objednat — a většinou to děláte na základě loňských čísel a pocitu. Přitom
                odpověď existuje: stovky odběratelů napříč distribucí generují každý den data, která přesně ukazují, co
                poroste, co vypadne a kde se otevírá příležitost.
                <br />
                <br />
                SWELT INTEL tato data agreguje, anonymizuje a přetváří v konkrétní doporučení přímo pro váš sortiment.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-[2px] mt-12 bg-[rgba(201,168,76,0.15)]">
              {insights.map((c, i) => {
                const Icon = c.icon;
                return (
                  <Reveal key={c.title} delay={i * 80}>
                    <div className="group bg-[#161616] p-7 border-t-2 border-transparent hover:border-[#C9A84C] transition-colors h-full">
                      <div className="flex items-center gap-2 text-[0.6rem] tracking-[0.2em] text-[#C9A84C] mb-3">
                        <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {c.tag.replace('◈ ', '')}
                      </div>
                      <div className="font-display-intel text-[1.2rem] mb-2.5">{c.title}</div>
                      <div className="text-[0.65rem] text-[#B0ACA4] leading-[1.7]">{c.text}</div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <Divider>Jak model funguje</Divider>

        {/* DATA FLOW DIAGRAM */}
        <section className="px-6 sm:px-12 py-20 relative overflow-hidden">
          <img
            src={flowImg}
            alt=""
            loading="lazy"
            width={1280}
            height={720}
            className="absolute inset-0 w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/70 to-[#0A0A0A]" />
          <div className="relative max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center mb-14">
                <div className="text-[0.6rem] tracking-[0.3em] text-[#C9A84C] uppercase mb-4">Tok dat</div>
                <h2 className="font-display-intel font-light text-[2rem] sm:text-[3rem] leading-tight">
                  Od signálu k <em className="italic text-[#C9A84C]">doporučení.</em>
                </h2>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-7 gap-4 items-stretch">
              {[
                { icon: Database, label: 'Data' },
                { icon: Activity, label: 'Signály' },
                { icon: Brain, label: 'Model' },
                { icon: Gauge, label: 'Skóre' },
                { icon: Sparkles, label: 'Doporučení' },
              ].map((node, idx, arr) => {
                const Icon = node.icon;
                return (
                  <Reveal
                    key={node.label}
                    delay={idx * 150}
                    className={`md:col-span-${idx === arr.length - 1 ? 1 : 1} relative`}
                  >
                    <div className="bg-[#161616] border border-[rgba(201,168,76,0.2)] p-5 text-center h-full flex flex-col items-center justify-center hover:border-[#C9A84C] transition">
                      <Icon className="w-6 h-6 text-[#C9A84C] mb-3" strokeWidth={1.25} />
                      <div className="font-display-intel text-[1.1rem]">{node.label}</div>
                      <div className="text-[0.5rem] tracking-[0.25em] uppercase text-[#787470] mt-1">
                        Krok {idx + 1}
                      </div>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="hidden md:flex absolute right-[-26px] top-1/2 -translate-y-1/2 z-10 items-center">
                        <ArrowRight className="w-5 h-5 text-[#C9A84C]" strokeWidth={1.25} />
                      </div>
                    )}
                    {idx === 0 && <div className="md:col-span-1" />}
                  </Reveal>
                );
              })}
              {/* spacer columns to push to 7 cols on md */}
              <div className="hidden md:block" />
              <div className="hidden md:block" />
            </div>
          </div>
        </section>

        <Divider>Aplikace v praxi</Divider>

        {/* USE CASES */}
        <section className="px-6 sm:px-12 py-20 bg-[#111111] relative">
          <img
            src={marketImg}
            alt=""
            loading="lazy"
            width={1280}
            height={720}
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <div className="relative">
            <Reveal>
              <div className="max-w-2xl mb-12">
                <div className="text-[0.6rem] tracking-[0.3em] text-[#C9A84C] uppercase mb-5">Co s tím uděláte</div>
                <h2 className="font-display-intel font-light text-[2rem] sm:text-[3rem] leading-[1.1]">
                  Méně přemýšlení.<br />
                  Lepší rozhodnutí.
                </h2>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[2px] bg-[rgba(201,168,76,0.15)]">
              {useCases.map((u, i) => {
                const Icon = u.icon;
                return (
                  <Reveal key={u.title} delay={i * 80}>
                    <div className="group relative bg-[#161616] p-9 overflow-hidden h-full hover:bg-[#1a1a1a] transition-colors">
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#7A6330] to-[#C9A84C] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500" />
                      <div className="flex items-center gap-2 text-[0.55rem] tracking-[0.25em] text-[#C9A84C] uppercase mb-4">
                        <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {u.tag.replace('◈ ', '')}
                      </div>
                      <h3 className="font-display-intel text-[1.35rem] leading-[1.2] mb-3.5">{u.title}</h3>
                      <p className="text-[0.63rem] text-[#B0ACA4] leading-[1.8]">{u.text}</p>
                      <div className="mt-5 px-4 py-3.5 bg-[rgba(201,168,76,0.04)] border-l-2 border-[#7A6330] text-[0.6rem] text-[#B0ACA4] italic leading-[1.7]">
                        {u.example}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <Divider>Prediktivní model</Divider>

        {/* MODEL LOGIC + STEPPER */}
        <section id="logika" className="px-6 sm:px-12 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start max-w-7xl mx-auto">
            <div>
              <Reveal>
                <div className="text-[0.6rem] tracking-[0.3em] text-[#C9A84C] uppercase mb-5">Jak funguje predikce</div>
                <h2 className="font-display-intel font-light text-[1.8rem] sm:text-[2.8rem] leading-[1.1] mb-7">
                  Skóre, které<br />
                  vám řekne co<br />
                  objednat příště.
                </h2>
                <p className="text-[0.78rem] leading-[1.9] text-[#B8B4AC] mb-10">
                  Model nekombinuje cizí data ani obecné trendy z internetu. Učí se výhradně na skutečném pohybu zboží v
                  distribuci, jejíž součástí jste. Proto je přesnější než jakýkoli generický nástroj — mluví o vašem
                  trhu, ne o abstraktním průměru.
                </p>
              </Reveal>

              {/* Animated stepper / timeline */}
              <ol className="relative">
                <span className="absolute left-[18px] top-2 bottom-2 w-px bg-[rgba(201,168,76,0.2)]" />
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <Reveal key={s.title} delay={i * 120}>
                      <li className="relative grid grid-cols-[40px_1fr] gap-5 pb-8 last:pb-0">
                        <div className="relative z-10 w-9 h-9 rounded-full border border-[#C9A84C] bg-[#0A0A0A] flex items-center justify-center text-[#C9A84C]">
                          <Icon className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="flex items-baseline gap-3 mb-2">
                            <span className="font-display-intel text-[1.5rem] text-[#C9A84C] opacity-60 leading-none">
                              {i + 1}
                            </span>
                            <h3 className="font-display-intel text-[1.15rem]">{s.title}</h3>
                          </div>
                          <p className="text-[0.65rem] text-[#B0ACA4] leading-[1.8]">{s.text}</p>
                        </div>
                      </li>
                    </Reveal>
                  );
                })}
              </ol>
            </div>

            {/* Model visual */}
            <Reveal delay={200}>
              <div className="bg-[#161616] border border-[rgba(201,168,76,0.15)] p-9 sticky top-28">
                <div className="text-[0.6rem] tracking-[0.3em] text-[#C9A84C] uppercase mb-7 pb-4 border-b border-[rgba(201,168,76,0.15)]">
                  Váhování signálů — příklad SKU
                </div>

                {signalRows.map((s) => (
                  <SignalRow key={s.label} label={s.label} pct={s.pct} />
                ))}

                <div className="mt-7 p-5 bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.35)]">
                  <div className="text-[0.55rem] tracking-[0.3em] text-[#C9A84C] uppercase mb-2.5">Výstup modelu</div>
                  <div className="font-display-intel italic text-[1.1rem] leading-[1.5]">
                    „Poptávka po tomto SKU pravděpodobně poroste nebo se udrží v příštích 6–8 týdnech. Doporučujeme
                    navýšit zásoby o 15–20 %."
                  </div>
                  <div className="flex items-center gap-3 mt-3.5">
                    <span className="text-[0.58rem] text-[#787470] tracking-wide">Konf.</span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((d) => (
                        <span key={d} className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                      ))}
                      <span className="w-2 h-2 rounded-full border border-[rgba(201,168,76,0.35)] bg-[#1E1E1E]" />
                    </div>
                    <span className="text-[0.58rem] tracking-wide text-[#C9A84C]">89 %</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Divider>Produktové úrovně</Divider>

        {/* PRICING */}
        <section id="produkt" className="px-6 sm:px-12 py-20 bg-[#111111]">
          <Reveal>
            <div className="text-center mb-16">
              <div className="text-[0.6rem] tracking-[0.3em] text-[#C9A84C] uppercase mb-4">Tři úrovně přístupu</div>
              <h2 className="font-display-intel font-light text-[2.4rem] sm:text-[4rem] mb-4">SWELT INTEL</h2>
              <p className="text-[0.72rem] text-[#B0ACA4] max-w-[520px] mx-auto leading-[1.7]">
                Vyberte úroveň podle toho, jak hluboko chcete jít. Začněte zdarma jako součást partnerství — přidejte
                hloubku kdykoliv.
              </p>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-3 gap-[2px] bg-[rgba(201,168,76,0.15)] max-w-6xl mx-auto">
            {tiers.map((t, i) => (
              <Reveal key={t.name} delay={i * 120}>
                <div
                  className={`relative p-10 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                    t.featured
                      ? 'bg-[#1E1E1E] border border-[rgba(201,168,76,0.45)] ring-1 ring-[#C9A84C]/40'
                      : 'bg-[#161616] hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[0.55rem] tracking-[0.3em] text-[#C9A84C] uppercase pb-4 mb-7 border-b border-[rgba(201,168,76,0.15)]">
                    <span>{t.level}</span>
                    {t.featured && (
                      <span className="bg-[#C9A84C] text-[#0A0A0A] px-2 py-1 text-[0.5rem] tracking-[0.2em]">
                        Doporučeno
                      </span>
                    )}
                  </div>

                  <h3 className="font-display-intel font-light text-[2rem] mb-2">{t.name}</h3>
                  <p className="text-[0.65rem] text-[#B0ACA4] mb-8 leading-[1.6]">{t.tagline}</p>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[0.63rem] text-[#B0ACA4] leading-[1.6]">
                        <Check
                          className="w-3.5 h-3.5 mt-0.5 text-[#C9A84C] shrink-0"
                          strokeWidth={2}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6 mt-auto border-t border-[rgba(201,168,76,0.15)]">
                    <div className="font-display-intel font-light text-[1.6rem] mb-1">{t.priceTitle}</div>
                    <div className="text-[0.6rem] text-[#787470] tracking-wide mb-5">{t.priceSub}</div>
                    <button
                      className={`w-full py-3.5 text-[0.65rem] tracking-[0.2em] uppercase transition-colors ${
                        t.featured
                          ? 'bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#E8C96B]'
                          : 'border border-[rgba(201,168,76,0.35)] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A0A0A]'
                      }`}
                    >
                      {t.cta}
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* MANIFESTO */}
        <section className="relative px-6 sm:px-12 py-28 text-center overflow-hidden">
          <span
            className="absolute inset-0 flex items-center justify-center font-display-intel pointer-events-none select-none"
            style={{
              fontWeight: 600,
              fontSize: 'clamp(8rem, 20vw, 18rem)',
              color: 'rgba(201,168,76,0.025)',
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
            }}
          >
            INTEL
          </span>
          <Reveal>
            <p className="relative font-display-intel font-light text-[1.6rem] sm:text-[2.8rem] leading-[1.4] max-w-3xl mx-auto mb-10">
              Nejlepší nákupní rozhodnutí není to nejlevnější.<br />
              Je to to, které jste udělali <em className="italic text-[#C9A84C]">s celým obrazem.</em>
            </p>
            <p className="relative text-[0.72rem] text-[#B0ACA4] max-w-lg mx-auto leading-[1.8] mb-12">
              SWELT INTEL vám dává přístup k pohybu trhu, který vidí jen málokdo. Objednávejte s jistotou, plánujte
              napřed a přestaňte být překvapováni.
            </p>
            <a
              href="#produkt"
              className="relative inline-block bg-[#C9A84C] hover:bg-[#E8C96B] text-[#0A0A0A] px-10 py-4 text-[0.65rem] tracking-[0.2em] uppercase font-medium transition-colors"
            >
              Začít teď
            </a>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer className="px-6 sm:px-12 py-10 border-t border-[rgba(201,168,76,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="font-display-intel text-[0.9rem] tracking-[0.3em] text-[#C9A84C]">SWELT · INTEL</div>
          <div className="text-[0.58rem] text-[#787470] tracking-wide">
            Datový produkt · SWELT.PARTNER · B2B Intelligence Layer
          </div>
        </footer>
      </div>
    </div>
  );
};

/* ─────────────── Helpers ─────────────── */
function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-6 px-6 sm:px-12 my-14">
      <span className="flex-1 h-px bg-[rgba(201,168,76,0.15)]" />
      <span className="text-[0.55rem] tracking-[0.35em] text-[#787470] uppercase whitespace-nowrap">{children}</span>
      <span className="flex-1 h-px bg-[rgba(201,168,76,0.15)]" />
    </div>
  );
}

function SignalRow({ label, pct }: { label: string; pct: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="flex items-center gap-4 mb-5">
      <div className="text-[0.6rem] text-[#B0ACA4] w-40 shrink-0">{label}</div>
      <div className="flex-1 h-1 bg-[#1E1E1E] rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-all duration-[1400ms] ease-out"
          style={{
            width: visible ? `${pct}%` : '0%',
            background: 'linear-gradient(90deg, #7A6330, #C9A84C)',
          }}
        />
      </div>
      <div className="text-[0.6rem] text-[#C9A84C] w-8 text-right">{pct}</div>
    </div>
  );
}

export default Intelligence;
