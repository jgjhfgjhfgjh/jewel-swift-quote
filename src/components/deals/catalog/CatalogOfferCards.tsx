import { useNavigate } from 'react-router-dom';
import { Bell, Lock, Megaphone, Users, type LucideIcon } from 'lucide-react';
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
 * Čtyři vstupy do dealů nad KPI lištou — PILULKY, ne karty: alerty zdarma →
 * Early Access (48 h náskok) → Want Deal (obrácený tok) → Split Deal
 * (skupinový nákup). Na pilulce je jen ikona a název; vysvětlení patří na
 * cílovou stránku, tady by z lišty dělalo zeď textu.
 *
 * Materiál je z chromu katalogu (vlasový rámeček na 4% bílé jako KPI
 * dlaždice), jen ve tvaru iOS pilulky s hover zesvětlením.
 *
 * Pilulky jsou ZÁMĚRNĚ bez barev: chrom katalogu je tmavý a jediné, co v něm
 * svítí, je bílá. Barevná výplň by z každé dělala jinou značku, i když jde
 * o čtyři vstupy do jedné věci.
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
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {cards.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={action[c.key]}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5
                     text-[13px] font-semibold tracking-tight text-white transition-colors duration-200
                     hover:border-white/25 hover:bg-white/[0.12] sm:text-sm"
        >
          <c.icon className="h-4 w-4 shrink-0 text-zinc-400" />
          {c.eyebrow}
        </button>
      ))}
    </div>
  );
}
