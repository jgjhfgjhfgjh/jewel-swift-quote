/**
 * Curated catalog of high-end / prestige watch houses sourced on demand.
 *
 * Swelt's own DB (search_products RPC) only holds the fashion-tier catalog, so
 * the prestige segment can't be searched there. This hand-curated dataset powers
 * the Chrono24-style autocomplete on the /prestige landing page: the customer
 * either picks a signature model from here, or types any reference as free text
 * and we source it on request.
 *
 * Prices are indicative EU retail entry points in EUR (od / "from"). They are
 * orientation only — the binding price is quoted per inquiry. `null` = price on
 * request (rare references / complications).
 */

/**
 * Domains for which the Brandfetch CDN returns its own placeholder wordmark
 * (an identical 8 260-byte image) instead of a real logo. For these houses we
 * render an elegant serif wordmark instead — see HouseLogo.
 */
export const LOGO_UNAVAILABLE = new Set<string>([
  'panerai.com',
  'breguet.com',
  'blancpain.com',
]);

export function houseHasLogo(domain: string): boolean {
  return !LOGO_UNAVAILABLE.has(domain);
}

export interface LuxuryHouse {
  name: string;
  domain: string;
  /** Indicative entry price for the house, in EUR. */
  from: number | null;
  /** Signature collections / models used to seed the autocomplete. */
  models: { model: string; collection?: string; from?: number | null }[];
}

export const LUXURY_HOUSES: LuxuryHouse[] = [
  {
    name: 'Rolex', domain: 'rolex.com', from: 5500,
    models: [
      { model: 'Submariner', from: 9500 },
      { model: 'Datejust', from: 8000 },
      { model: 'Daytona', collection: 'Cosmograph', from: 15000 },
      { model: 'GMT-Master II', from: 11000 },
      { model: 'Oyster Perpetual', from: 5500 },
      { model: 'Explorer', from: 7000 },
      { model: 'Sea-Dweller', from: 12500 },
      { model: 'Yacht-Master', from: 11500 },
      { model: 'Sky-Dweller', from: 15500 },
      { model: 'Day-Date', collection: 'President', from: 38000 },
    ],
  },
  {
    name: 'Patek Philippe', domain: 'patek.com', from: 22000,
    models: [
      { model: 'Nautilus', from: 35000 },
      { model: 'Aquanaut', from: 26000 },
      { model: 'Calatrava', from: 22000 },
      { model: 'Grand Complications', from: null },
      { model: 'Complications', from: 30000 },
    ],
  },
  {
    name: 'Audemars Piguet', domain: 'audemarspiguet.com', from: 25000,
    models: [
      { model: 'Royal Oak', from: 28000 },
      { model: 'Royal Oak Offshore', from: 30000 },
      { model: 'Code 11.59', from: 25000 },
    ],
  },
  {
    name: 'Omega', domain: 'omegawatches.com', from: 4500,
    models: [
      { model: 'Speedmaster Moonwatch', collection: 'Speedmaster', from: 6800 },
      { model: 'Seamaster Diver 300M', collection: 'Seamaster', from: 5600 },
      { model: 'Seamaster Aqua Terra', collection: 'Seamaster', from: 5400 },
      { model: 'Constellation', from: 4900 },
      { model: 'De Ville', from: 4500 },
    ],
  },
  {
    name: 'Cartier', domain: 'cartier.com', from: 3500,
    models: [
      { model: 'Santos', from: 7000 },
      { model: 'Tank', from: 3500 },
      { model: 'Ballon Bleu', from: 6000 },
      { model: 'Panthère', from: 4500 },
    ],
  },
  {
    name: 'IWC Schaffhausen', domain: 'iwc.com', from: 5000,
    models: [
      { model: 'Portugieser', from: 7500 },
      { model: "Pilot's Watch", from: 5000 },
      { model: 'Portofino', from: 5000 },
      { model: 'Aquatimer', from: 6000 },
      { model: 'Ingenieur', from: 12000 },
    ],
  },
  {
    name: 'Jaeger-LeCoultre', domain: 'jaeger-lecoultre.com', from: 7000,
    models: [
      { model: 'Reverso', from: 7000 },
      { model: 'Master Control', from: 7500 },
      { model: 'Polaris', from: 8000 },
    ],
  },
  {
    name: 'Vacheron Constantin', domain: 'vacheron-constantin.com', from: 18000,
    models: [
      { model: 'Overseas', from: 22000 },
      { model: 'Patrimony', from: 18000 },
      { model: 'Traditionnelle', from: 25000 },
    ],
  },
  {
    name: 'A. Lange & Söhne', domain: 'alange-soehne.com', from: 20000,
    models: [
      { model: 'Lange 1', from: 38000 },
      { model: 'Saxonia', from: 20000 },
      { model: 'Odysseus', from: 30000 },
    ],
  },
  {
    name: 'Panerai', domain: 'panerai.com', from: 6500,
    models: [
      { model: 'Luminor', from: 7000 },
      { model: 'Radiomir', from: 7500 },
      { model: 'Submersible', from: 9000 },
    ],
  },
  {
    name: 'Hublot', domain: 'hublot.com', from: 9000,
    models: [
      { model: 'Big Bang', from: 15000 },
      { model: 'Classic Fusion', from: 9000 },
      { model: 'Spirit of Big Bang', from: 18000 },
    ],
  },
  {
    name: 'Breitling', domain: 'breitling.com', from: 4000,
    models: [
      { model: 'Navitimer', from: 5500 },
      { model: 'Superocean', from: 4500 },
      { model: 'Chronomat', from: 6500 },
      { model: 'Avenger', from: 4000 },
      { model: 'Premier', from: 4500 },
    ],
  },
  {
    name: 'TAG Heuer', domain: 'tagheuer.com', from: 1800,
    models: [
      { model: 'Carrera', from: 4500 },
      { model: 'Monaco', from: 6500 },
      { model: 'Aquaracer', from: 3000 },
      { model: 'Formula 1', from: 1800 },
    ],
  },
  {
    name: 'Tudor', domain: 'tudorwatch.com', from: 2500,
    models: [
      { model: 'Black Bay', from: 3500 },
      { model: 'Pelagos', from: 4500 },
      { model: 'Ranger', from: 3000 },
      { model: 'Royal', from: 2500 },
    ],
  },
  {
    name: 'Zenith', domain: 'zenith-watches.com', from: 6500,
    models: [
      { model: 'Chronomaster', collection: 'El Primero', from: 8500 },
      { model: 'Defy', from: 9000 },
      { model: 'Pilot', from: 6500 },
    ],
  },
  {
    name: 'Grand Seiko', domain: 'grand-seiko.com', from: 4500,
    models: [
      { model: 'Snowflake', collection: 'Heritage', from: 6200 },
      { model: 'Heritage', from: 5000 },
      { model: 'Sport', from: 5500 },
      { model: 'Evolution 9', from: 7000 },
    ],
  },
  {
    name: 'Longines', domain: 'longines.com', from: 1100,
    models: [
      { model: 'Master Collection', from: 2000 },
      { model: 'HydroConquest', from: 1200 },
      { model: 'Spirit', from: 2500 },
      { model: 'DolceVita', from: 1500 },
    ],
  },
  {
    name: 'Oris', domain: 'oris.ch', from: 1500,
    models: [
      { model: 'Aquis', from: 2000 },
      { model: 'Big Crown', from: 2500 },
      { model: 'Divers Sixty-Five', from: 2200 },
    ],
  },
  {
    name: 'Chopard', domain: 'chopard.com', from: 6000,
    models: [
      { model: 'Alpine Eagle', from: 13000 },
      { model: 'Happy Sport', from: 6000 },
      { model: 'L.U.C', from: 15000 },
    ],
  },
  {
    name: 'Bvlgari', domain: 'bulgari.com', from: 6000,
    models: [
      { model: 'Octo Finissimo', from: 13000 },
      { model: 'Serpenti', from: 6000 },
    ],
  },
  {
    name: 'Montblanc', domain: 'montblanc.com', from: 3000,
    models: [
      { model: '1858', from: 3000 },
      { model: 'Heritage', from: 3500 },
      { model: 'Star Legacy', from: 3000 },
    ],
  },
  {
    name: 'Breguet', domain: 'breguet.com', from: 15000,
    models: [
      { model: 'Classique', from: 20000 },
      { model: 'Marine', from: 18000 },
      { model: 'Type XX', from: 15000 },
    ],
  },
  {
    name: 'Blancpain', domain: 'blancpain.com', from: 10000,
    models: [
      { model: 'Fifty Fathoms', from: 14000 },
      { model: 'Villeret', from: 10000 },
    ],
  },
  {
    name: 'Girard-Perregaux', domain: 'girard-perregaux.com', from: 12000,
    models: [
      { model: 'Laureato', from: 12000 },
    ],
  },
  {
    name: 'Ulysse Nardin', domain: 'ulysse-nardin.com', from: 8000,
    models: [
      { model: 'Diver', from: 8000 },
      { model: 'Freak', from: 25000 },
    ],
  },
  {
    name: 'Richard Mille', domain: 'richardmille.com', from: null,
    models: [
      { model: 'RM 011', collection: 'RM', from: null },
      { model: 'RM 035', collection: 'RM', from: null },
    ],
  },
];

export interface LuxuryModel {
  /** Stable id, e.g. "rolex-submariner". */
  id: string;
  brand: string;
  domain: string;
  model: string;
  collection?: string;
  from: number | null;
  /** Lowercase haystack for fuzzy matching. */
  search: string;
}

/** Flattened model list for the autocomplete. */
export const LUXURY_MODELS: LuxuryModel[] = LUXURY_HOUSES.flatMap((house) =>
  house.models.map((m) => {
    const id = `${house.name}-${m.model}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return {
      id,
      brand: house.name,
      domain: house.domain,
      model: m.model,
      collection: m.collection,
      from: m.from ?? house.from,
      search: `${house.name} ${m.collection ?? ''} ${m.model}`.toLowerCase().replace(/\s+/g, ' ').trim(),
    };
  }),
);

/** Format an EUR "from" price for display, or a fallback label. */
export function formatFrom(from: number | null): string {
  if (from == null) return 'Cena na poptávku';
  return `od ${from.toLocaleString('cs')} €`;
}

/**
 * Rank curated models against a free-text query. Brand-prefix and word-start
 * matches rank above mid-string matches so "sub" surfaces Submariner first.
 */
export function searchLuxuryModels(query: string, limit = 8): LuxuryModel[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!q) return [];
  const scored = LUXURY_MODELS.map((m) => {
    const hay = m.search;
    let score = -1;
    if (hay.startsWith(q)) score = 0;
    else if (m.brand.toLowerCase().startsWith(q)) score = 1;
    else if (new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(hay)) score = 2;
    else if (hay.includes(q)) score = 3;
    return { m, score };
  }).filter((s) => s.score >= 0);
  scored.sort((a, b) => a.score - b.score || (a.m.from ?? 1e9) - (b.m.from ?? 1e9));
  return scored.slice(0, limit).map((s) => s.m);
}
