import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Lock, Megaphone, Users, type LucideIcon } from 'lucide-react';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';

/** Ceník Early Access je přímo na stránce — CTA na něj odroluje. */
const scrollToPricing = () =>
  document.getElementById('gbd-pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export type OfferCardContent = {
  key: 'alerts' | 'ea' | 'want' | 'split';
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
};

/**
 * Obsah čtyř vstupů do dealů — sdílí ho lišta nad KPI na /deals i GoBigDeal
 * mega menu. Akce si dodává každé místo samo (na stránce se roluje k ceníku,
 * v menu se naviguje), copy ale musí zůstat jedna.
 *
 * Pořadí je podle ceny vstupu: alerty zdarma → Early Access (48 h náskok) →
 * WantDeal (obrácený tok) → SplitDeal (skupinový nákup).
 */
export function useOfferCardsContent(): OfferCardContent[] {
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang];
  const promo = t.catalog.promo;
  const d = t.catalog.dash;

  return [
    { key: 'alerts', icon: Bell, eyebrow: d.alertRowEyebrow, title: promo.alertTitle, sub: promo.alertSub, cta: d.offerAlertCta },
    { key: 'ea', icon: Lock, eyebrow: d.eyebrowPro, title: t.early.headingLead, sub: t.early.headingMuted, cta: d.offerEaCta },
    { key: 'want', icon: Megaphone, eyebrow: d.wantEyebrow, title: d.wantTitle, sub: d.wantSub, cta: d.wantCta },
    { key: 'split', icon: Users, eyebrow: d.splitEyebrow, title: d.splitTitle, sub: d.splitSub, cta: d.splitCta },
  ];
}

/**
 * Čtveřice nabídkových karet nad KPI lištou — čtyři vstupy do dealů,
 * seřazené podle ceny vstupu: alerty zdarma → Early Access (48 h náskok) →
 * WantDeal (obrácený tok) → SplitDeal (skupinový nákup).
 *
 * Anatomie i materiál jsou SHODNÉ s KPI dlaždicí pod nimi (vlasový rámeček
 * na 4% bílé, eyebrow místo labelu, headline místo hodnoty, akce u pravé
 * hrany) — čtyři karty stojí přesně nad čtyřmi dlaždicemi a pás nad
 * katalogem čte jako jedna lišta o dvou řadách.
 *
 * Karty jsou ZÁMĚRNĚ bez barev: chrom katalogu je tmavý a jediné, co v něm
 * svítí, je bílá. Barevný eyebrow by z každé karty dělal jinou značku, i když
 * jde o čtyři vstupy do jedné věci.
 */
export function CatalogOfferCards({ onAlerts }: { onAlerts: () => void }) {
  const navigate = useNavigate();
  const cards = useOfferCardsContent();

  const action: Record<OfferCardContent['key'], () => void> = {
    alerts: onAlerts,
    ea: scrollToPricing,
    want: () => navigate('/wantdeal'),
    split: () => navigate('/splitdeal'),
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {cards.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={action[c.key]}
          className="group/offer flex w-full flex-col items-stretch rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4 text-left transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.07] sm:p-5"
        >
          {/* eyebrow a akce sdílí první řádek (jako label a GoDeal v KPI),
              pod ním dvouřádkový text — karta se tím vejde do výšky KPI */}
          <span className="flex items-center gap-3">
            <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-[11px] font-medium uppercase tracking-widest text-zinc-500">
              <c.icon className="h-3 w-3 shrink-0" /> {c.eyebrow}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-zinc-300 underline-offset-2 transition-colors group-hover/offer:text-white group-hover/offer:underline">
              {c.cta}
              <ArrowRight className="h-3 w-3 transition-transform group-hover/offer:translate-x-0.5" />
            </span>
          </span>
          <span className="mt-2.5 block truncate font-sans text-[15px] font-medium tracking-tighter text-white">
            {c.title}
          </span>
          <span className="mt-0.5 block truncate text-[12px] leading-snug text-zinc-500">{c.sub}</span>
        </button>
      ))}
    </div>
  );
}
