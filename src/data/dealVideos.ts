/**
 * Krátká reklamní videa pro velké karty katalogu /deals.
 *
 * Generovaná Higgsfieldem (Seedance 2.0) z PRODUKTOVÝCH FOTEK hlavního
 * velkoobchodního katalogu (produkty.image_urls) — vždy osoba s viditelným
 * obličejem i celou postavou a produktem značky v reálném životě. Soubory
 * leží v public/deal-videos/.
 *
 * Klíč = slug koncernu (data/concerns.ts), NEBO lowercase dodavatel pro
 * dealy bez koncernu v rejstříku (Swarovski). Priorita média na kartě:
 * VIDEO > kampaňová fotka dealu > logo koncernu. Outro: poslední ~1,3 s
 * smyčky se přes celé video prolne velké bílé logo značky (DealVideoMedia).
 *
 * Nové video = vygenerovat z fotek produktu značky, uložit mp4 a přidat
 * řádek sem (brandName/brandDomain řídí outro logo).
 */
export interface DealVideo {
  src: string;
  /** Značka produktu ve videu — nese outro logo. */
  brandName: string;
  brandDomain?: string;
}

export const DEAL_VIDEOS: Record<string, DealVideo> = {
  // Versace Virtus 36mm (VEHC00519) — Versace hodinky vyrábí Timex Group
  'timex-group': { src: '/deal-videos/timex-group.mp4', brandName: 'Versace', brandDomain: 'versace.com' },
  // Swarovski Infinity Heart (5518865) — deal bez koncernu, klíč = dodavatel
  swarovski: { src: '/deal-videos/swarovski.mp4', brandName: 'Swarovski', brandDomain: 'swarovski.com' },
};

export function getDealVideo(concernSlug?: string, supplier?: string): DealVideo | undefined {
  if (concernSlug && DEAL_VIDEOS[concernSlug]) return DEAL_VIDEOS[concernSlug];
  const key = supplier?.trim().toLowerCase();
  return key ? DEAL_VIDEOS[key] : undefined;
}
