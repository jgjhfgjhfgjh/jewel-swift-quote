import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, ChevronDown, ShieldCheck, Lock, Gem,
  FileSearch, BadgeCheck, Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { LuxuryShowcaseCarousel } from '@/components/luxury/LuxuryShowcaseCarousel';
import { BrandShowcaseCarousel } from '@/components/BrandShowcaseCarousel';
import { LuxuryInquiryCard, type LuxuryInquiryCardHandle } from '@/components/luxury/LuxuryInquiryCard';
import { useInquiry } from '@/lib/useInquiry';
import type { SelectedWatch } from '@/components/luxury/LuxuryWatchSearch';

/* Display headings use Montserrat (matches the rest of swelt). */
const display: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

/* ─── Reveal on scroll ─── */
function useReveal(threshold = 0.15): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, revealed];
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, revealed] = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-zinc-950"
      >
        <span className="text-sm font-medium sm:text-base">{q}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm leading-relaxed text-zinc-500">{a}</p>
      </div>
    </div>
  );
}

const BENEFITS = [
  { icon: BadgeCheck, title: 'Originál s doklady', text: 'Pouze pravé kusy od autorizovaných zdrojů — s plnou dokumentací, krabičkou a kartou, kde to dům umožňuje.' },
  { icon: Lock, title: 'Diskrétní doručení', text: 'Pojištěná zásilka v neutrálním balení bez označení odesílatele. Soukromí klienta je samozřejmost.' },
  { icon: Gem, title: 'Na poptávku, od 1 kusu', text: 'Konkrétní referenci dohledáme a zajistíme i jednotlivě — pro soukromé sběratele i firemní dary.' },
  { icon: ShieldCheck, title: 'Garantovaná cena', text: 'Po zadání poptávky obdržíte závaznou nabídku s pevnou cenou. Žádné skryté poplatky, jasné podmínky.' },
];

const STEPS = [
  { icon: FileSearch, title: 'Sestavte poptávku', text: 'Vyberte modely z katalogu prémiových domů, nebo napište vlastní referenci. Bez závazku.' },
  { icon: BadgeCheck, title: 'Ověříme a naceníme', text: 'Prověříme dostupnost u prověřených zdrojů a do 48 h vám zašleme závaznou nabídku.' },
  { icon: Truck, title: 'Diskrétní doručení', text: 'Po potvrzení zajistíme pojištěné a diskrétní doručení po celé EU.' },
];

const FAQS = [
  { q: 'Jak probíhá nákup prémiové značky na poptávku?', a: 'Sestavíte nezávaznou poptávku — vyberete modely z katalogu nebo napíšete konkrétní referenci. Ověříme dostupnost a do 48 hodin vám zašleme závaznou nabídku s pevnou cenou. Po jejím potvrzení zajistíme doručení.' },
  { q: 'Jsou hodinky originální a s dokumentací?', a: 'Ano. Dodáváme výhradně pravé kusy z prověřených zdrojů, standardně s krabičkou, kartou a dostupnou dokumentací výrobce. Pravost garantujeme.' },
  { q: 'Můžu poptat i model, který není v katalogu?', a: 'Samozřejmě. Katalog slouží jako orientace — do pole vyhledávání napište jakoukoliv referenci a my ji dohledáme. Zajistíme prakticky cokoliv napříč prémiovým segmentem.' },
  { q: 'Jsou ceny konečné?', a: 'Ceny v katalogu jsou orientační vstupní (od) hodnoty v EUR. Závaznou cenu konkrétního kusu vždy potvrdíme v individuální nabídce po zadání poptávky.' },
  { q: 'Kam doručujete?', a: 'Doručujeme do 15+ zemí Evropy. Zásilka je vždy pojištěná a v neutrálním, diskrétním balení.' },
  { q: 'Musím být firma nebo mít IČO?', a: 'Prémiový segment na poptávku je dostupný soukromým osobám i firmám. Podmínky upřesníme v rámci nezávazné nabídky.' },
];

export default function Prestige() {
  const { addWatch } = useInquiry();
  const cardRef = useRef<LuxuryInquiryCardHandle>(null);
  const inquiryRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  /* JSON-LD — Service + FAQ + breadcrumb */
  useEffect(() => {
    const schemas = [
      {
        '@context': 'https://schema.org', '@type': 'Service',
        name: 'swelt — Prémiový segment na poptávku',
        description: 'Hodinky vyššího segmentu (Rolex, Omega, Patek Philippe, Audemars Piguet a další) zajištěné na poptávku. Originál s dokumentací, diskrétní doručení po EU.',
        provider: { '@type': 'Organization', name: 'swelt', url: 'https://swelt.partner' },
        areaServed: [{ '@type': 'Place', name: 'EU' }],
      },
      {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ];
    schemas.forEach((schema, i) => {
      const id = `ld-prestige-${i}`;
      let el = document.getElementById(id) as HTMLScriptElement | null;
      if (!el) { el = document.createElement('script'); el.id = id; el.type = 'application/ld+json'; document.head.appendChild(el); }
      el.textContent = JSON.stringify(schema);
    });
    return () => { schemas.forEach((_, i) => document.getElementById(`ld-prestige-${i}`)?.remove()); };
  }, []);

  /** Bring the inquiry card into view (reset to the model step). */
  function goToInquiry() {
    cardRef.current?.focusModels();
    inquiryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Carousel "Poptat" → add to the cart and bring the inquiry card into view. */
  function pickWatch(w: SelectedWatch) {
    addWatch(w);
    cardRef.current?.focusModels();
    inquiryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] text-zinc-900">
      <Navbar />
      <BackButton />

      {/* ── Prestige houses carousel — first on the page ── */}
      <section className="bg-white pt-24 pb-12 sm:pt-28 sm:pb-16">
        <div className="mx-auto mb-7 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary sm:text-xs">Prémiové domy</p>
            <h2 className="text-2xl font-medium tracking-tight sm:text-3xl" style={display}>Domy zajišťované na poptávku</h2>
          </Reveal>
        </div>
        <LuxuryShowcaseCarousel onPick={pickWatch} />
      </section>

      {/* ── Inquiry card — search + steps in one expanding card (no page change) ── */}
      <section ref={inquiryRef} id="poptavka" className="scroll-mt-24 pb-12 sm:pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <Reveal>
            <LuxuryInquiryCard ref={cardRef} />
          </Reveal>
        </div>
      </section>

      {/* ── How it works (three steps) — right after the search ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12 text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Jak to funguje</p>
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl" style={display}>Tři kroky k vašemu kousku</h2>
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 110}>
                  <div className="relative text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-md">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="absolute left-1/2 top-0 flex h-5 w-5 -translate-x-1/2 -translate-y-1 items-center justify-center rounded-full border-2 border-primary bg-white text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <h3 className="mb-2 text-base font-semibold">{s.title}</h3>
                    <p className="mx-auto max-w-xs text-sm leading-relaxed text-zinc-500">{s.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── All-brands showcase (homepage Netflix carousel) ── */}
      <section className="border-y border-zinc-200 bg-white py-12 sm:py-14">
        <div className="mx-auto mb-6 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Celý katalog swelt</p>
            <h2 className="text-2xl font-medium tracking-tight sm:text-3xl" style={display}>Prozkoumejte naše značky</h2>
          </Reveal>
        </div>
        <BrandShowcaseCarousel />
      </section>

      {/* ── Benefits ── */}
      <section className="border-y border-zinc-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12 text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Proč přes swelt</p>
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl" style={display}>Prémiový nákup bez kompromisů</h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <Reveal key={b.title} delay={i * 90}>
                  <div className="h-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold">{b.title}</h3>
                    <p className="text-sm leading-relaxed text-zinc-500">{b.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-zinc-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12 text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Časté dotazy</p>
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl" style={display}>Vše, co potřebujete vědět</h2>
          </Reveal>
          <div className="rounded-2xl border border-zinc-200 px-6 sm:px-8">
            {FAQS.map((f, i) => <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />)}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="bg-zinc-950 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <Gem className="mx-auto mb-5 h-9 w-9 text-white/70" />
            <h2 className="mb-3 text-3xl font-medium tracking-tight sm:text-4xl" style={display}>
              Váš příští kousek na dosah
            </h2>
            <p className="mb-8 text-base text-white/70">
              Řekněte nám, co hledáte. Zbytek — dostupnost, cenu i diskrétní doručení — vyřešíme za vás.
            </p>
            <Button size="lg" className="gap-2 bg-white text-base font-medium text-zinc-900 shadow-lg hover:bg-zinc-100" onClick={goToInquiry}>
              Sestavit poptávku <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ── Trust footer strip ── */}
      <section className="border-t border-zinc-200 bg-[#fafaf8] py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500 sm:gap-8">
            {[[BadgeCheck, 'Garance pravosti'], [Lock, 'Diskrétní balení'], [ShieldCheck, 'Závazná cena'], [Truck, 'Doručení po EU']].map(([Icon, label]) => {
              const I = Icon as typeof BadgeCheck;
              return (
                <span key={label as string} className="flex items-center gap-1.5 font-medium">
                  <I className="h-4 w-4 text-primary" /> {label as string}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <ScrollToTopButton />
    </div>
  );
}
