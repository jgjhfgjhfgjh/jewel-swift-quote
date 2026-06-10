/**
 * Hodinářské koncerny (watch conglomerates) and the catalog brands that fall
 * under them. Purely editorial mapping — `brandKeys` use the canonical brand
 * keys produced by `toBrandKey` (see `@/lib/brandNormalize`). Product counts,
 * logos and featured products are derived at runtime from the live catalog
 * via `useBrandCatalog` (feed-bound; products.json is only a fallback).
 *
 * To add or re-map a koncern, edit this file only.
 */

export interface StoryItem {
  lead: string;
  text: string;
}
export interface StoryEra {
  heading: string;
  items: StoryItem[];
}

export interface Concern {
  /** URL slug, e.g. "swatch-group" → /koncerny/swatch-group */
  slug: string;
  /** Display name, e.g. "Swatch Group" */
  name: string;
  /** Brandfetch domain for the koncern logo (text fallback if unavailable) */
  domain: string;
  country?: string;
  founded?: string;
  /** One–two sentence summary shown on the card and in the hero */
  shortDesc: string;
  /** Optional rich history rendered on the landing page */
  story?: StoryEra[];
  /** Canonical brand keys present in the feed (see toBrandKey) */
  brandKeys: string[];
}

export const CONCERNS: Concern[] = [
  {
    slug: 'swatch-group',
    name: 'Swatch Group',
    domain: 'swatchgroup.com',
    country: 'Švýcarsko',
    founded: '1983',
    shortDesc:
      'Největší světový hodinářský koncern. Pod jeho křídly je přes 15 značek od dostupných hodinek až po haute horlogerie — Swatch, Tissot, Longines, Omega, Hamilton, Certina, Mido či Rado.',
    brandKeys: ['SWATCH', 'TISSOT'],
    story: [
      {
        heading: 'Záchrana švýcarského hodinářství',
        items: [
          {
            lead: '1983 – Zrod Swatch',
            text: 'Nicolas Hayek spojil ohrožené švýcarské manufaktury a uvedl plastové hodinky Swatch, které svou cenou i designem porazily japonskou křemíkovou konkurenci a zachránily „Swiss Made".',
          },
          {
            lead: 'Vznik koncernu',
            text: 'Z holdingu SMH (později Swatch Group) se stal největší výrobce hodinek na světě s vlastní výrobou strojků (ETA) a kompletní vertikální integrací.',
          },
        ],
      },
      {
        heading: 'Portfolio od dostupných po luxusní',
        items: [
          {
            lead: 'Vstupní a střední segment',
            text: 'Swatch a Tissot tvoří dostupnou tvář koncernu — barevný design a švýcarská kvalita za rozumnou cenu.',
          },
          {
            lead: 'Prestižní divize',
            text: 'Longines, Omega, Rado, Hamilton, Certina a Mido posouvají koncern do prémiového a luxusního segmentu se „Swiss Made" preciznosti.',
          },
        ],
      },
    ],
  },
  {
    slug: 'fossil-group',
    name: 'Fossil Group',
    domain: 'fossilgroup.com',
    country: 'USA',
    founded: '1984',
    shortDesc:
      'Americký gigant módních hodinek a šperků. Kromě vlastní značky Fossil drží licence předních módních domů — Emporio Armani, Michael Kors, DKNY, Diesel nebo Armani Exchange.',
    brandKeys: ['FOSSIL', 'EMPORIO ARMANI', 'MICHAEL KORS', 'DKNY'],
    story: [
      {
        heading: 'Od retro hodinek k licenčnímu impériu',
        items: [
          {
            lead: '1984 – Texaský start',
            text: 'Bratři Kosta a Tom Kartsotis založili Fossil s vizí dostupných hodinek v retro stylu padesátých let — s ikonickými plechovými krabičkami.',
          },
          {
            lead: 'Síla licencí',
            text: 'Fossil se stal výrobcem a distributorem hodinek a šperků pro nejprodávanější módní značky světa, kterým dodává hodinářské know‑how.',
          },
        ],
      },
      {
        heading: 'Módní domy pod jednou střechou',
        items: [
          {
            lead: 'Emporio Armani & Michael Kors',
            text: 'Dvě z nejúspěšnějších licencí koncernu — elegantní italský i americký fashion design v hodinkách a špercích.',
          },
          {
            lead: 'DKNY a další',
            text: 'Newyorský minimalismus DKNY doplňuje portfolio o městský, dostupný styl.',
          },
        ],
      },
    ],
  },
  {
    slug: 'movado-group',
    name: 'Movado Group',
    domain: 'movadogroup.com',
    country: 'USA',
    founded: '1881',
    shortDesc:
      'Americký koncern s ikonickou vlastní značkou Movado a silným licenčním portfoliem — Calvin Klein, Hugo Boss, Lacoste, Tommy Hilfiger nebo Coach.',
    brandKeys: ['CALVIN KLEIN', 'HUGO BOSS', 'LACOSTE', 'TOMMY HILFIGER'],
    story: [
      {
        heading: 'Dědictví Movada',
        items: [
          {
            lead: '1881 – Švýcarské kořeny',
            text: 'Movado vzniklo ve švýcarském La Chaux‑de‑Fonds; jeho ikonický ciferník Museum Dial s jediným bodem na pozici 12 se stal symbolem moderního designu.',
          },
          {
            lead: 'Globální koncern',
            text: 'Z Movada vyrostla skupina, která spojuje vlastní hodinářské dědictví s licencemi předních módních domů.',
          },
        ],
      },
      {
        heading: 'Licenční portfolio',
        items: [
          {
            lead: 'Calvin Klein od roku 2020',
            text: 'Po éře pod Swatch Group převzala Movado Group kompletní vývoj a distribuci hodinek i šperků Calvin Klein.',
          },
          {
            lead: 'Hugo Boss, Lacoste, Tommy Hilfiger',
            text: 'Sportovní i elegantní módní značky, které z Movado Group dělají jednoho z lídrů segmentu fashion watches.',
          },
        ],
      },
    ],
  },
  {
    slug: 'timex-group',
    name: 'Timex Group',
    domain: 'timex.com',
    country: 'USA',
    founded: '1854',
    shortDesc:
      'Jeden z nejstarších hodinářských koncernů světa. Vedle dostupné ikony Timex drží i licence luxusních módních domů Versace a Versus Versace a dříve i Nautica.',
    brandKeys: ['TIMEX', 'VERSACE', 'VERSUS VERSACE', 'NAUTICA'],
    story: [
      {
        heading: 'Hodinky pro každého',
        items: [
          {
            lead: '1854 – Waterbury Clock Company',
            text: 'Kořeny Timexu sahají do 19. století; značka proslavila dostupné, nezničitelné hodinky a legendární kampaň „It takes a licking and keeps on ticking".',
          },
          {
            lead: 'Indiglo a inovace',
            text: 'Podsvícení ciferníku Indiglo se stalo jedním z nejznámějších hodinářských vynálezů konce 20. století.',
          },
        ],
      },
      {
        heading: 'Luxusní licence',
        items: [
          {
            lead: 'Versace & Versus Versace',
            text: 'Přes divizi Vertime vyrábí Timex Group hodinky italského módního domu Versace — od haute couture po mladší linii Versus.',
          },
        ],
      },
    ],
  },
  {
    slug: 'morellato-group',
    name: 'Morellato Group',
    domain: 'morellato.com',
    country: 'Itálie',
    founded: '1930',
    shortDesc:
      'Italský koncern šperků a hodinek. Pod ním najdete Morellato, Sector No Limits, Chronostar, Just Cavalli, Police a řemínky Morellato.',
    brandKeys: ['MORELLATO', 'SECTOR', 'CHRONOSTAR', 'JUST CAVALLI', 'POLICE'],
    story: [
      {
        heading: 'Italské řemeslo',
        items: [
          {
            lead: '1930 – Řemínky Morellato',
            text: 'Firma začínala výrobou kožených hodinkových řemínků a vyrostla v jednoho z největších italských výrobců šperků a hodinek.',
          },
          {
            lead: 'Akvizice a růst',
            text: 'Postupně přibrala sportovní Sector, dostupný Chronostar a licence módních značek.',
          },
        ],
      },
      {
        heading: 'Multibrandové portfolio',
        items: [
          {
            lead: 'Just Cavalli & Police',
            text: 'Výrazný italský fashion design Just Cavalli i lifestylová značka Police rozšiřují záběr koncernu napříč generacemi.',
          },
        ],
      },
    ],
  },
  {
    slug: 'citizen-group',
    name: 'Citizen Group',
    domain: 'citizenwatch-global.com',
    country: 'Japonsko',
    founded: '1918',
    shortDesc:
      'Japonský koncern proslulý technologií Eco‑Drive. Vedle Citizenu zahrnuje dostupné Q&Q, americkou Bulovu i švýcarské Frederique Constant a Alpina.',
    brandKeys: ['CITIZEN', 'Q&Q'],
    story: [
      {
        heading: 'Japonská technologie',
        items: [
          {
            lead: '1918 – Tokijské počátky',
            text: 'Citizen vznikl v Tokiu a postupně se stal globálním lídrem v přesných a technologicky pokročilých hodinkách.',
          },
          {
            lead: 'Eco‑Drive',
            text: 'Revoluční pohon světlem (Eco‑Drive) odstranil nutnost výměny baterií a stal se vlajkovou technologií značky.',
          },
        ],
      },
      {
        heading: 'Portfolio skupiny',
        items: [
          {
            lead: 'Q&Q',
            text: 'Dostupná, barevná a odolná řada hodinek pro každý den.',
          },
          {
            lead: 'Švýcarská divize',
            text: 'Akvizice Frederique Constant a Alpina přidaly koncernu prémiové „Swiss Made" hodinky.',
          },
        ],
      },
    ],
  },
  {
    slug: 'binda-group',
    name: 'Binda Group',
    domain: 'bindagroup.com',
    country: 'Itálie',
    founded: '1906',
    shortDesc:
      'Italská rodinná skupina stojící za designovými italskými hodinkami Breil a barevnými silikonovými Hip Hop.',
    brandKeys: ['BREIL', 'HIP HOP'],
  },
  {
    slug: 'seiko-group',
    name: 'Seiko Group',
    domain: 'seiko.co.jp',
    country: 'Japonsko',
    founded: '1881',
    shortDesc:
      'Japonský hodinářský gigant a průkopník křemíkových hodinek. Do skupiny patří i dostupná značka Lorus.',
    brandKeys: ['LORUS'],
  },
  {
    slug: 'casio',
    name: 'Casio',
    domain: 'casio.com',
    country: 'Japonsko',
    founded: '1946',
    shortDesc:
      'Japonská elektronika a hodinky. Casio proslavily nezničitelné G‑SHOCK i kultovní digitální modely.',
    brandKeys: ['CASIO'],
  },
  {
    slug: 'invicta-watch-group',
    name: 'Invicta Watch Group',
    domain: 'invictawatch.com',
    country: 'USA / Švýcarsko',
    founded: '1837',
    shortDesc:
      'Hodinářská skupina s výraznými, masivními modely za dostupné ceny — vlajková značka Invicta.',
    brandKeys: ['INVICTA'],
  },
];

/** Lookup a koncern by its URL slug. */
export function getConcernBySlug(slug: string): Concern | undefined {
  return CONCERNS.find((c) => c.slug === slug);
}

/** Reverse lookup: which koncern owns a given canonical brand key. */
export function getConcernForBrandKey(key: string): Concern | undefined {
  return CONCERNS.find((c) => c.brandKeys.includes(key));
}
