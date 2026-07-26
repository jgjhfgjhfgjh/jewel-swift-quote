/**
 * DEAL (closeout offers) translations.
 * CS + EN fully translated; all other languages fall back to EN.
 */
import { ALL_LANGS, type Lang } from './i18n';

export interface DealsText {
  navLabel: string;
  /* ── landing /deals ──────────────────────────────────────────────────────
     Nadpisy jsou rozsekané na trojici lead / muted / accent — stejná
     typografická skladba jako headliny na homepage (tmavé slovo → tlumené
     slovo → gradientový závěr). Sekce landingu proto nemají eyebrow labely. */
  hero: {
    headingLead: string;
    headingMuted: string;
    headingAccent: string;
    sub: string;
    cta: string;
    ctaSecondary: string;
    note: string;
  };
  stats: { deals: string; brands: string; discount: string; early: string; earlyValue: string };
  how: { headingLead: string; headingMuted: string; steps: { title: string; desc: string }[] };
  /** Slevový žebřík — vysvětluje, že hladina platí na celou objednávku. */
  ladder: { headingLead: string; headingMuted: string; note: string };
  active: {
    headingLead: string;
    headingMuted: string;
    sub: string;
    /** Nadpis sekce, když zrovna neběží žádný deal (nahradí headingLead). */
    empty: string;
    emptyHeadingMuted: string;
    emptySub: string;
    emptyCta: string;
    closedLabel: string;
    closedSub: string;
  };
  /** Blok o náskoku 48 h (PRO) — landing verze homepage paywallu. */
  early: {
    headingLead: string;
    headingMuted: string;
    body: string;
    bullets: string[];
    ctaAlerts: string;
    ctaPro: string;
  };
  /** `heading` + `items` sdílí i DealDetail a DealCartDrawer — neměnit tvar. */
  conditions: { heading: string; headingMuted: string; items: { title: string; desc: string }[] };
  closing: { headingLead: string; headingMuted: string; cta: string; ctaSecondary: string };
  /** Katalogová část /deals — dlaždice koncernů, filtry, hero pás, řady karet. */
  catalog: {
    headingLead: string;
    headingMuted: string;
    sub: string;
    searchPlaceholder: string;
    concernsLabel: string;
    brandsLabel: string;
    allConcerns: string;
    clear: string;
    results: string;
    noResults: string;
    noResultsSub: string;
    seeAll: string;
    rows: {
      endingSoon: string;
      fresh: string;
      watches: string;
      jewelry: string;
      upcoming: string;
      closed: string;
      byConcern: string;
    };
    tile: {
      teaserTitle: string;
      teaserNote: string;
      upcoming: string;
      unlocksIn: string;
      closed: string;
      models: string;
    };
    promo: {
      proTitle: string;
      proSub: string;
      proCta: string;
      alertTitle: string;
      alertSub: string;
      alertCta: string;
      howTitle: string;
      howSub: string;
      howCta: string;
    };
  };
  // deal card
  card: { models: string; brands: string; view: string; endsIn: string; discountUpTo: string; ended: string; closed: string };
  // deal detail
  detail: {
    backToDeals: string;
    supplier: string;
    catalogHeading: string;
    searchPlaceholder: string;
    noMatch: string;
    loginToOrder: string;
    closedNotice: string;
    results: string;
    clearFilters: string;
  };
  // filter field labels (catalog filter bar)
  filters: {
    title: string;
    brand: string;
    gender: string;
    collection: string;
    type: string;
    material: string;
    size: string;
    all: string; // "all" prefix shown inside selects
  };
  countdown: { label: string; closed: string; days: string; hours: string; minutes: string; seconds: string };
  progress: {
    title: string;
    minOrder: string;
    pcs: string;
    validUnlocked: string;
    needMoreForValid: string;
    unlockNext: string;
    topReached: string;
    currentDiscount: string;
    tierUnlocked: string;
    tierLocked: string;
  };
  orderBar: {
    items: string;
    value: string;
    margin: string;
    discount: string;
    valueShort: string;
    marginShort: string;
    discountShort: string;
    submitShort: string;
    submit: string;
    submitLocked: string;
    empty: string;
    openCart: string;
  };
  product: { rrp: string; yourPrice: string; inStock: string; soldOut: string; margin: string; marginTotal: string; add: string; perPc: string; voc: string; moc: string; detail: string };
  cart: { title: string; empty: string; clear: string; remove: string; total: string; submit: string };
  modal: { availability: string; sku: string; ean: string; priceTiers: string; tier: string; close: string };
  // homepage sekce „Top Deals" — celá sekce se záměrně renderuje VŽDY anglicky
  // (jako ostatní tmavé homepage sekce); komponenta čte napřímo dealsI18n.en.
  // CS překlady tu zůstávají pro případnou budoucí lokalizaci sekce.
  home: {
    badge: string;
    sub: string;
    insiderLine: string;
    liveLabel: string;
    heroCta: string;
    browseCta: string;
    earlyAccessCta: string;
    earlyAccessOwned: string;
    lockedTitle: string;
    lockedNote: string;
    unlocksIn: string;
    comingSoon: string;
    concernsLabel: string;
    concernStoryCta: string;
    concernFallback: string;
    emptyHeroTitle: string;
    emptyHeroSub: string;
  };
  // watchdog alerty mimo homepage sekci (katalog, detail značky/koncernu)
  alertsUi: {
    watch: string;
    watching: string;
    setAlert: string;
    alertOn: string;
    upsellTitle: string;
    upsellText: string;
    upsellCta: string;
    upsellClose: string;
  };
}

const cs: DealsText = {
  navLabel: 'DEAL nabídky',
  hero: {
    headingLead: 'Closeout kolekce',
    headingMuted: 'od koncernů, které už prodáváte, s',
    headingAccent: 'větší velkoobchodní slevou.',
    sub: 'GoBigDeal je omezená dávka zboží: jeden koncern, reálné kusy, jedna uzávěrka. Čím víc kusů vezmete, tím hlouběji jde sleva — a platí na celou objednávku, ne jen na kusy navíc.',
    cta: 'Prohlédnout dealy',
    ctaSecondary: 'Jak deal funguje',
    note: 'Prohlížení je zdarma. Velkoobchodní ceny a marže se zobrazí po přihlášení.',
  },
  stats: {
    deals: 'Živé dealy',
    brands: 'Značek v dávkách',
    discount: 'Nejvyšší sleva',
    early: 'Náskok pro PRO',
    earlyValue: '48 h',
  },
  how: {
    headingLead: 'Čtyři kroky',
    headingMuted: 'od výběru dávky k nejvyšší slevě.',
    steps: [
      { title: 'Vyberte dávku', desc: 'Otevřete živý deal a projděte jeho katalog: značky, reference, dostupnost i doporučenou koncovou cenu v jednom seznamu.' },
      { title: 'Sestavte objednávku', desc: 'Míchejte reference napříč značkami v jedné objednávce. Počítadlo ukazuje, kolik kusů zbývá do platné objednávky.' },
      { title: 'Odemkněte žebřík', desc: 'Každá překročená hladina zlevní celou objednávku — ne jen kusy nad hranicí. Přepočet vidíte okamžitě.' },
      { title: 'Potvrďte včas', desc: 'Kusy se rezervují dle pořadí přijatých objednávek. Uzávěrka je reálná: jakmile projde, dávka se zavírá.' },
    ],
  },
  ladder: {
    headingLead: 'Jeden žebřík',
    headingMuted: 'pro celou objednávku.',
    note: 'Hladiny i procenta se u každého dealu liší — přesný žebřík je vždy v detailu nabídky.',
  },
  active: {
    headingLead: 'Právě běží.',
    headingMuted: 'Až odpočet dojede na nulu, je dávka pryč.',
    sub: 'Každý deal má vlastní katalog, vlastní uzávěrku a vlastní slevový žebřík. Otevřete ho a skládejte objednávku kus po kuse — sleva se přepočítává, jak přidáváte.',
    empty: 'Právě neběží žádný deal.',
    emptyHeadingMuted: 'Další dávku ale vyjednáváme s koncernem právě teď.',
    emptySub: 'Zapněte si alert a budete u toho, jakmile deal spadne — partneři s PRO ho uvidí o 48 hodin dřív. Zatím se podívejte, jak dopadly předchozí dávky.',
    emptyCta: 'Nastavit alert',
    closedLabel: 'Uzavřené dávky',
    closedSub: 'Rozebráno dle pořadí objednávek. Přesně tohle příště nechcete propásnout.',
  },
  early: {
    headingLead: 'Deal dostane každý.',
    headingMuted: 'PRO ho má o 48 hodin dřív.',
    body: 'Dávka má pevný počet kusů a nejžádanější reference mizí první. PRO otevírá každý deal dva dny před veřejným startem a hlídá koncerny, značky i jednotlivé modely — vybíráte z plného katalogu, ne ze zbytků.',
    bullets: [
      'Každý deal otevřený 48 hodin před veřejným startem',
      'Alerty na koncerny, značky i jednotlivé modely',
      'První výběr, dokud jsou kusy skladem',
      'Vlastní account manager',
    ],
    ctaAlerts: 'Nastavit alert',
    ctaPro: 'Zobrazit tarify PRO',
  },
  conditions: {
    heading: 'Jak nákup z DEAL nabídky probíhá',
    headingMuted: 'Žádná překvapení po odeslání objednávky.',
    items: [
      { title: 'Na objednávku', desc: 'Closeout zboží na objednávku, dodací lhůta cca 4–6 týdnů.' },
      { title: 'Záloha 30 %', desc: 'Po přijetí objednávky vystavíme zálohovou fakturu 30 %. Platba do 3 pracovních dnů, jinak je objednávka zrušena.' },
      { title: 'Platba převodem', desc: 'Platba předem je akceptována pouze bankovním převodem.' },
      { title: 'Finální faktura', desc: 'Po naskladnění vystavíme finální fakturu se započtenou 30% zálohou. Po doplacení zboží ihned expedujeme.' },
      { title: 'Dle pořadí', desc: 'Otevřená offline nabídka — rezervace modelů a kusů probíhá dle pořadí přijatých objednávek.' },
    ],
  },
  closing: {
    headingLead: 'Další dávka je na cestě.',
    headingMuted: 'Otázka je, jestli u toho budete první.',
    cta: 'Prohlédnout dealy',
    ctaSecondary: 'Nastavit alert',
  },
  catalog: {
    headingLead: 'Katalog dávek.',
    headingMuted: 'Vyberte koncern, značku a slevu.',
    sub: 'Nejlepší closeout dávky na jednom místě — jedna objednávka, jedna faktura, žádná registrace u desítek velkoobchodů. Filtrujte podle koncernu nebo značky.',
    searchPlaceholder: 'Hledat koncern, značku nebo dávku…',
    concernsLabel: 'Koncerny',
    brandsLabel: 'Značky',
    allConcerns: 'Vše',
    clear: 'Zrušit filtry',
    results: '{n} · odpovídá filtru',
    noResults: 'Nic neodpovídá filtru.',
    noResultsSub: 'Zkuste jiný koncern nebo značku — nebo si nechte poslat alert, až dávka spadne.',
    seeAll: 'Zobrazit vše',
    rows: {
      endingSoon: 'Končí nejdřív',
      fresh: 'Nově spuštěné',
      watches: 'Hodinky',
      jewelry: 'Šperky',
      upcoming: 'Připravujeme',
      closed: 'Uzavřené dávky',
      byConcern: 'Dávky · {name}',
    },
    tile: {
      teaserTitle: 'Closeout {concern}',
      teaserNote: 'Dávku vyjednáváme',
      upcoming: 'Připravujeme',
      unlocksIn: 'Startuje za',
      closed: 'Uzavřeno',
      models: 'modelů',
    },
    promo: {
      proTitle: 'Vidíte to samé co ostatní. Jen o 48 hodin dřív.',
      proSub: 'PRO otevírá každou dávku dva dny před veřejným startem. Nejlepší reference mizí první.',
      proCta: 'Zobrazit tarify PRO',
      alertTitle: 'Nechte deal, ať si najde vás.',
      alertSub: 'Alert na koncern, značku nebo konkrétní model. Přijde ve chvíli, kdy dávka spadne.',
      alertCta: 'Nastavit alert',
      howTitle: 'Čím víc kusů, tím nižší cena — na celé objednávce.',
      howSub: 'Každá překročená hladina zlevní celou objednávku, ne jen kusy nad hranicí.',
      howCta: 'Jak deal funguje',
    },
  },
  card: {
    models: 'modelů', brands: 'značek', view: 'Zobrazit nabídku',
    endsIn: 'Končí za', discountUpTo: 'Sleva až', ended: 'Ukončeno', closed: 'Uzavřeno',
  },
  detail: {
    backToDeals: 'Zpět na nabídky',
    supplier: 'Dodavatel',
    catalogHeading: 'Katalog nabídky',
    searchPlaceholder: 'Hledat model, SKU, EAN…',
    noMatch: 'Žádný model neodpovídá filtru.',
    loginToOrder: 'Pro objednání a zobrazení cen se přihlaste.',
    closedNotice: 'Tato nabídka je uzavřená — objednávky již nelze zadávat.',
    results: 'modelů',
    clearFilters: 'Zrušit filtry',
  },
  filters: {
    title: 'Filtry',
    brand: 'Značka',
    gender: 'Pohlaví',
    collection: 'Kolekce',
    type: 'Typ',
    material: 'Materiál',
    size: 'Velikost',
    all: 'Vše',
  },
  countdown: {
    label: 'Nabídka končí za', closed: 'Nabídka uzavřena',
    days: 'dní', hours: 'hod', minutes: 'min', seconds: 's',
  },
  progress: {
    title: 'Naplnění minimální objednávky',
    minOrder: 'Minimální odběr',
    pcs: 'ks',
    validUnlocked: 'Platná objednávka odemčena',
    needMoreForValid: 'Pro platnou objednávku přidejte ještě {n} ks',
    unlockNext: 'Do slevy {percent} % zbývá {n} ks',
    topReached: 'Maximální sleva {percent} % odemčena',
    currentDiscount: 'Aktuální sleva',
    tierUnlocked: 'Sleva {percent} %',
    tierLocked: 'od {qty} ks',
  },
  orderBar: {
    items: 'Kusů v objednávce',
    value: 'Hodnota objednávky',
    margin: 'Vaše marže',
    discount: 'Aktuální sleva',
    valueShort: 'Hodnota',
    marginShort: 'Marže',
    discountShort: 'Sleva',
    submitShort: 'Odeslat',
    submit: 'Odeslat poptávku',
    submitLocked: 'Přidejte ještě {n} ks',
    empty: 'Vyberte modely a sestavte objednávku.',
    openCart: 'Zobrazit košík',
  },
  product: {
    rrp: 'RRP', yourPrice: 'Vaše cena', inStock: 'skladem', soldOut: 'Vyprodáno',
    margin: 'Marže', marginTotal: 'Marže celkem', add: 'Přidat', perPc: 'za ks',
    voc: 'VOC', moc: 'MOC', detail: 'Detail produktu',
  },
  cart: {
    title: 'Objednávka nabídky', empty: 'Zatím jste nevybrali žádné modely.',
    clear: 'Vyprázdnit', remove: 'Odebrat', total: 'Celkem', submit: 'Odeslat poptávku',
  },
  modal: {
    availability: 'Dostupnost', sku: 'SKU', ean: 'EAN',
    priceTiers: 'Ceny dle množství', tier: 'od {qty} ks', close: 'Zavřít',
  },
  home: {
    badge: 'GoBigDeal nabídky',
    sub: 'Closeout kolekce přímo od koncernů, které už znáte — Swatch Group, Fossil Group a další. Slevy až 68 %, kusy se rezervují dle pořadí objednávek.',
    insiderLine: 'Insider vidí každý deal o 48 hodin dříve.',
    liveLabel: 'Právě běží',
    heroCta: 'Otevřít deal',
    browseCta: 'Prozkoumat dealy',
    earlyAccessCta: 'Chci přístup o 48 h dříve za měsíční poplatek 18 €',
    earlyAccessOwned: 'Máte přístup o 48 h dříve',
    lockedTitle: 'Připravujeme další deal',
    lockedNote: 'Insider ho uvidí o 48 hodin dříve.',
    unlocksIn: 'Odemkne se za',
    comingSoon: 'Už brzy',
    concernsLabel: 'Nastavte GoBigDeal alerty na koncerny',
    concernStoryCta: 'Příběh koncernu',
    concernFallback: 'Přední světový hodinářský koncern.',
    emptyHeroTitle: 'Deal roku se právě připravuje',
    emptyHeroSub: 'Projděte si, jak DEAL nabídky fungují, a buďte připraveni — kdo objedná dříve, bude dříve obsloužen.',
  },
  alertsUi: {
    watch: 'Hlídat model',
    watching: 'Hlídáno',
    setAlert: 'Nastavit GoBigDeal alert',
    alertOn: 'Alert aktivní',
    upsellTitle: 'Nemáte early access',
    upsellText: 'Insider vidí každý deal o 48 hodin dříve a dostává alerty na koncerny, značky i jednotlivé modely. Nejlepší kusy mohou být pryč dřív, než je vůbec uvidíte.',
    upsellCta: 'Chci Insider za 49 €/měsíc',
    upsellClose: 'Teď ne',
  },
};

const en: DealsText = {
  navLabel: 'DEAL offers',
  hero: {
    headingLead: 'Closeout batches',
    headingMuted: 'from the concerns you already sell, with',
    headingAccent: 'bigger wholesale discount.',
    sub: 'A GoBigDeal is a limited batch: one concern, real units, one deadline. The more units you take, the deeper the discount goes — and it applies to the whole order, not just the units above the line.',
    cta: 'Browse the deals',
    ctaSecondary: 'How a deal works',
    note: 'Browsing is free. Wholesale prices and margins show once you sign in.',
  },
  stats: {
    deals: 'Live deals',
    brands: 'Brands in the batches',
    discount: 'Deepest discount',
    early: 'Head start for PRO',
    earlyValue: '48 h',
  },
  how: {
    headingLead: 'Four steps',
    headingMuted: 'from picking a batch to the deepest discount.',
    steps: [
      { title: 'Pick a batch', desc: 'Open a live deal and go through its catalog: brands, references, availability and RRP in a single list.' },
      { title: 'Build the order', desc: 'Mix references across brands in one order. The counter shows how many units you still need for a valid order.' },
      { title: 'Unlock the ladder', desc: 'Every threshold you cross drops the price of the whole order — not just the units above it. You see the recalculation instantly.' },
      { title: 'Confirm in time', desc: 'Units are reserved in the order received. The deadline is real: once it passes, the batch closes.' },
    ],
  },
  ladder: {
    headingLead: 'One ladder',
    headingMuted: 'for the entire order.',
    note: 'Thresholds and percentages differ per deal — the exact ladder is always on the deal page.',
  },
  active: {
    headingLead: 'Live now.',
    headingMuted: 'When the countdown hits zero, the batch is gone.',
    sub: 'Each deal has its own catalog, its own deadline and its own discount ladder. Open one and build the order piece by piece — the discount recalculates as you add units.',
    empty: 'No deal is live right now.',
    emptyHeadingMuted: 'The next batch is being negotiated with the concern as we speak.',
    emptySub: 'Turn on an alert and you will be there the moment a deal drops — PRO partners see it 48 hours earlier. In the meantime, take a look at how the previous batches went.',
    emptyCta: 'Set a deal alert',
    closedLabel: 'Closed batches',
    closedSub: 'Taken in the order received. Exactly what you do not want to miss next time.',
  },
  early: {
    headingLead: 'Everyone gets the deal.',
    headingMuted: 'PRO gets it 48 hours earlier.',
    body: 'A batch holds a fixed number of units and the most wanted references go first. PRO opens every deal two days before the public start and watches concerns, brands and individual models — so you pick from a full catalog instead of the leftovers.',
    bullets: [
      'Every deal open 48 hours before the public start',
      'Alerts on concerns, brands and individual models',
      'First pick while units are still in stock',
      'Dedicated account manager',
    ],
    ctaAlerts: 'Set a deal alert',
    ctaPro: 'See PRO plans',
  },
  conditions: {
    heading: 'How a DEAL purchase works',
    headingMuted: 'No surprises after you send the order.',
    items: [
      { title: 'Made to order', desc: 'Closeout goods made to order, delivery in approx. 4–6 weeks.' },
      { title: '30 % deposit', desc: 'A 30 % deposit invoice is issued on order. Payment within 3 business days, otherwise the order is cancelled.' },
      { title: 'Bank transfer', desc: 'Advance payment is accepted by bank transfer only.' },
      { title: 'Final invoice', desc: 'After goods arrive a final invoice is issued with the 30 % deposit deducted. Goods ship immediately after settlement.' },
      { title: 'Order received', desc: 'Open offline offer — models and units are reserved in the order received.' },
    ],
  },
  closing: {
    headingLead: 'The next batch is on its way.',
    headingMuted: 'The only question is whether you are first in line.',
    cta: 'Browse the deals',
    ctaSecondary: 'Set a deal alert',
  },
  catalog: {
    headingLead: 'The batch catalog.',
    headingMuted: 'Pick a concern, a brand and your discount.',
    sub: 'The best closeout batches in one place — one order, one invoice, no signing up with dozens of wholesalers. Filter by concern or brand.',
    searchPlaceholder: 'Search a concern, brand or batch…',
    concernsLabel: 'Concerns',
    brandsLabel: 'Brands',
    allConcerns: 'All',
    clear: 'Clear filters',
    results: '{n} · match the filter',
    noResults: 'Nothing matches the filter.',
    noResultsSub: 'Try another concern or brand — or let an alert find the batch for you.',
    seeAll: 'See all',
    rows: {
      endingSoon: 'Closing first',
      fresh: 'Just launched',
      watches: 'Watches',
      jewelry: 'Jewelry',
      upcoming: 'In the works',
      closed: 'Closed batches',
      byConcern: 'Batches · {name}',
    },
    tile: {
      teaserTitle: '{concern} closeout',
      teaserNote: 'Batch in negotiation',
      upcoming: 'In the works',
      unlocksIn: 'Starts in',
      closed: 'Closed',
      models: 'models',
    },
    promo: {
      proTitle: 'You see the same batch as everyone. Just 48 hours earlier.',
      proSub: 'PRO opens every batch two days before the public start. The best references go first.',
      proCta: 'See PRO plans',
      alertTitle: 'Let the deal find you.',
      alertSub: 'An alert on a concern, a brand or one specific model. It fires the moment a batch drops.',
      alertCta: 'Set a deal alert',
      howTitle: 'More units, lower price — across the whole order.',
      howSub: 'Every threshold you cross drops the price of the entire order, not just the units above it.',
      howCta: 'How a deal works',
    },
  },
  card: {
    models: 'models', brands: 'brands', view: 'View offer',
    endsIn: 'Ends in', discountUpTo: 'Up to', ended: 'Ended', closed: 'Closed',
  },
  detail: {
    backToDeals: 'Back to offers',
    supplier: 'Supplier',
    catalogHeading: 'Offer catalog',
    searchPlaceholder: 'Search model, SKU, EAN…',
    noMatch: 'No model matches the filter.',
    loginToOrder: 'Sign in to order and see prices.',
    closedNotice: 'This offer is closed — orders can no longer be placed.',
    results: 'models',
    clearFilters: 'Clear filters',
  },
  filters: {
    title: 'Filters',
    brand: 'Brand',
    gender: 'Gender',
    collection: 'Collection',
    type: 'Type',
    material: 'Material',
    size: 'Size',
    all: 'All',
  },
  countdown: {
    label: 'Offer ends in', closed: 'Offer closed',
    days: 'days', hours: 'hrs', minutes: 'min', seconds: 's',
  },
  progress: {
    title: 'Minimum order progress',
    minOrder: 'Minimum order',
    pcs: 'pcs',
    validUnlocked: 'Valid order unlocked',
    needMoreForValid: 'Add {n} more pcs for a valid order',
    unlockNext: '{n} pcs left to unlock {percent} %',
    topReached: 'Maximum discount {percent} % unlocked',
    currentDiscount: 'Current discount',
    tierUnlocked: '{percent} % off',
    tierLocked: 'from {qty} pcs',
  },
  orderBar: {
    items: 'Items in order',
    value: 'Order value',
    margin: 'Your margin',
    discount: 'Current discount',
    valueShort: 'Value',
    marginShort: 'Margin',
    discountShort: 'Discount',
    submitShort: 'Send',
    submit: 'Send enquiry',
    submitLocked: 'Add {n} more pcs',
    empty: 'Pick models and build your order.',
    openCart: 'View cart',
  },
  product: {
    rrp: 'RRP', yourPrice: 'Your price', inStock: 'in stock', soldOut: 'Sold out',
    margin: 'Margin', marginTotal: 'Total margin', add: 'Add', perPc: 'per pc',
    voc: 'Cost', moc: 'RRP', detail: 'Product detail',
  },
  cart: {
    title: 'Offer order', empty: 'You have not picked any models yet.',
    clear: 'Clear', remove: 'Remove', total: 'Total', submit: 'Send enquiry',
  },
  modal: {
    availability: 'Availability', sku: 'SKU', ean: 'EAN',
    priceTiers: 'Prices by quantity', tier: 'from {qty} pcs', close: 'Close',
  },
  home: {
    badge: 'GoBigDeal offers',
    sub: 'Closeout collections straight from the concerns you already know — Swatch Group, Fossil Group and more. Up to 68% off, reserved in the order received.',
    insiderLine: 'Insiders see every deal 48 hours early.',
    liveLabel: 'Live now',
    heroCta: 'Open the deal',
    browseCta: 'Explore deals',
    earlyAccessCta: 'Get 48h early access for an €18 monthly fee',
    earlyAccessOwned: 'You have 48h early access',
    lockedTitle: 'Next deal in the works',
    lockedNote: 'Insiders see it 48 hours early.',
    unlocksIn: 'Unlocks in',
    comingSoon: 'Coming soon',
    concernsLabel: 'Set GoBigDeal alerts on concerns',
    concernStoryCta: 'Concern story',
    concernFallback: 'One of the world’s leading watch concerns.',
    emptyHeroTitle: 'The deal of the year is in the works',
    emptyHeroSub: 'See how DEAL offers work and be ready — orders are served first come, first served.',
  },
  alertsUi: {
    watch: 'Watch model',
    watching: 'Watching',
    setAlert: 'Set a GoBigDeal alert',
    alertOn: 'Alert on',
    upsellTitle: 'You don’t have early access',
    upsellText: 'Insiders see every deal 48 hours early and get concern, brand and model alerts. The best pieces may be gone before you even see them.',
    upsellCta: 'Get Insider for €49/month',
    upsellClose: 'Not now',
  },
};

export const dealsI18n: Record<Lang, DealsText> = ALL_LANGS.reduce((acc, lang) => {
  acc[lang] = lang === 'cs' ? cs : en;
  return acc;
}, {} as Record<Lang, DealsText>);

/**
 * Počet modelů/značek na kartě dealu se správným tvarem podstatného jména.
 * Čeština má tři tvary (1 / 2–4 / 5+), angličtina dva — pevné tvary tu drží
 * jedno místo místo skládání z `card.models` (to zůstává jen jako holé slovo).
 */
export function countLabel(lang: Lang, n: number, kind: 'models' | 'brands'): string {
  if (lang === 'cs') {
    const forms = kind === 'models'
      ? ['model', 'modely', 'modelů']
      : ['značka', 'značky', 'značek'];
    return `${n} ${forms[n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2]}`;
  }
  const word = kind === 'models' ? 'model' : 'brand';
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** Substitute {key} placeholders in a translation string. */
export function fillTemplate(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
