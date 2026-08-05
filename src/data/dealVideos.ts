/**
 * Krátká reklamní videa pro velké karty katalogu /deals.
 *
 * Generovaná Higgsfieldem (Seedance 2.0) z PRODUKTOVÝCH FOTEK hlavního
 * velkoobchodního katalogu (produkty.image_urls) — vždy osoba s viditelným
 * obličejem i celou postavou a produktem značky v reálném životě. Soubory
 * leží v public/deal-videos/.
 *
 * PRÁVNÍ MANTINEL (platí pro každé nové video): originální spoty značek
 * (Pinterest, YouTube, sociální sítě) NELZE použít ani zrekonstruovat —
 * scénář, kompozice a sled záběrů jsou autorské dílo, přehrání „jen s jiným
 * člověkem" je odvozené dílo. Nepoužívat ani podobu ambasadorů (osobnostní
 * práva). Čerpat lze POUZE obecný styl: paleta, světlo, tempo, typ prostředí.
 * Scénář vždy vlastní, produkt vždy ten, který reálně prodáváme.
 *
 * Style descriptory odvozené z veřejných kampaní značek (jen estetika):
 *  · Swarovski (SS25 „high-fashion fantasy"): pastelový lilac/blush snový
 *    studiový void, poletující průsvitné okvětní lístky a krystalové střepy,
 *    krystalová mesh textura šatů, high-key světlo, beauty detail, jemné
 *    lomy světla.
 *  · Emporio Armani: italská sartoriální elegance, kamenná architektura,
 *    zlaté podvečerní světlo.
 *  · Tommy Hilfiger: preppy americká klasika, navy/červená, ostré denní
 *    světlo, energický pohyb.
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
  // Emporio Armani Sportivo (AR5889) — vlajková licence Fossil Group;
  // scénář z příběhu koncernu (italská sartoriální elegance)
  'fossil-group': { src: '/deal-videos/fossil-group.mp4', brandName: 'Emporio Armani', brandDomain: 'armani.com' },
  // Tommy Hilfiger Layla (1782457) — licence Movado Group; scénář z příběhu
  // (preppy americká klasika)
  'movado-group': { src: '/deal-videos/movado-group.mp4', brandName: 'Tommy Hilfiger', brandDomain: 'tommy.com' },
};

export function getDealVideo(concernSlug?: string, supplier?: string): DealVideo | undefined {
  if (concernSlug && DEAL_VIDEOS[concernSlug]) return DEAL_VIDEOS[concernSlug];
  const key = supplier?.trim().toLowerCase();
  return key ? DEAL_VIDEOS[key] : undefined;
}
