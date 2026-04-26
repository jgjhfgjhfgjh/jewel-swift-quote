/**
 * Intelligence (market data / predictive analytics) landing page translations.
 * CS + EN fully translated; other 16 languages reuse EN as fallback.
 */
import type { Lang } from './i18n';

export interface UseCase { tag: string; title: string; text: string; example: string }
export interface Insight { tag: string; title: string; text: string }
export interface IntelStep { title: string; text: string }
export interface IntelTier {
  name: string; subtitle: string; price: string; priceUnit: string; priceNote: string;
  cta: string; features: string[];
}
export interface SimSlider { label: string; weight: string }
export interface SimRecommendation { stockUp: string; stockUpDesc: string; watch: string; watchDesc: string; observe: string; observeDesc: string; reduce: string; reduceDesc: string }

export interface IntelligenceText {
  hero: { badge: string; h1Part1: string; h1Highlight: string; sub: string; statAccuracy: string; statGrowth: string; statForecast: string; ctaProduct: string; ctaSimulator: string };
  liveCard: { eyebrow: string; mom: string; subtitle: string; rowTrend: string; rowPenetration: string; rowStability: string; score: string; stockUp: string };
  insightsSection: { eyebrow: string; heading: string; sub: string };
  insights: Insight[];
  dataFlow: { eyebrow: string; heading: string; sub: string; nodes: string[]; stepLabel: string };
  useCasesSection: { eyebrow: string; heading: string };
  useCases: UseCase[];
  howItWorks: { eyebrow: string; heading: string };
  steps: IntelStep[];
  simulator: { eyebrow: string; heading: string; sub: string; sliders: SimSlider[]; weightLabel: string; scoreLabel: string };
  recommendation: SimRecommendation;
  marketStrip: { eyebrow: string; heading: string; sub: string; statGrowth: string; statSpeed: string };
  pricing: { eyebrow: string; heading: string; recommended: string; allFromPrev: string };
  tiers: IntelTier[];
  finalCta: { heading: string; sub: string; button: string };
}

const cs: IntelligenceText = {
  hero: {
    badge: 'SWELT INTELIGENCE — Tržní data',
    h1Part1: 'Objednávejte s jistotou,',
    h1Highlight: 'náhodou.',
    sub: 'Přestaňte hádat, co se prodá. SWELT INTELIGENCE vám dává přehled o pohybu zboží napříč celou distribucí — takže víte, co objednat dřív, než vám dojdou zásoby nebo uvíznete s přebytkem.',
    statAccuracy: 'přesnost predikce', statGrowth: 'MoM růst signálů', statForecast: 'předstih prognóz',
    ctaProduct: 'Prozkoumat produkt', ctaSimulator: 'Zkusit simulátor',
  },
  liveCard: {
    eyebrow: 'Live signál · SKU-4471', mom: '% MoM',
    subtitle: 'Obrat napříč distribucí · duben 2025',
    rowTrend: 'Trend', rowPenetration: 'Penetrace', rowStability: 'Stabilita',
    score: 'Skóre', stockUp: '↑ Naskladnit',
  },
  insightsSection: {
    eyebrow: 'Logika produktu',
    heading: 'Vidíte svůj sklad. My vidíme celý trh.',
    sub: 'Čtyři pilíře, které proměňují anonymní data v rozhodnutí, jež posilují váš byznys.',
  },
  insights: [
    { tag: 'Viditelnost', title: 'Pohyb zboží napříč trhem', text: 'Nevidíte jen svůj sklad — vidíte, co se reálně prodává v celé distribuci. Silnější signál než jakýkoli průzkum.' },
    { tag: 'Predikce', title: 'Model, který se učí z dat', text: 'Prediktivní skóre pro každý SKU vám říká, jestli poptávka poroste, drží se nebo klesá — dřív než to pocítíte na pokladně.' },
    { tag: 'Benchmark', title: 'Jak si stojíte vůči trhu', text: 'Porovnejte své prodeje s anonymním agregátem trhu. Okamžitě víte, kde vedete a kde ztrácíte pozici.' },
    { tag: 'Akce', title: 'Doporučení, ne jen čísla', text: 'Každý signál je přeložen do jasného kroku: naskladnit, sledovat, nebo redukovat. Žádné interpretování grafů.' },
  ],
  dataFlow: {
    eyebrow: 'Tok dat', heading: 'Od signálu k doporučení',
    sub: 'Jak surová data napříč distribucí dorazí jako jasný krok.',
    nodes: ['Anonymizovaná data', 'Agregace signálů', 'Model & váhy', 'Skóre 0–100', 'Doporučení'],
    stepLabel: 'Krok',
  },
  useCasesSection: { eyebrow: 'Use cases', heading: 'Šest scénářů, kde data mění hru' },
  useCases: [
    { tag: 'Nákup a zásoby', title: 'Objednávejte s čísly, ne s pocitem', text: 'Prediktivní skóre vám říká, které SKU posílit a které zredukovat. Méně přezásobení, méně výpadků, méně vyhozených peněz.', example: '„Skóre 87 pro SKU-4471 → navýším objednávku o 20 %."' },
    { tag: 'Kategoriový rozvoj', title: 'Vstupte do kategorie dřív než ostatní', text: 'Trendy kategorií vidíte dřív, než se dostanou do obecného povědomí. Včasný vstup znamená lepší pozici a vyšší marži.', example: '„Kategorie X roste +41 % MoM — já ji zatím nemám, ale vím o tom jako první."' },
    { tag: 'Sezónní plánování', title: 'Připravte sklad před špičkou, ne během ní', text: 'Prognózy 3 měsíce dopředu vám dají čas. Přestanete panikařit a doobjednávat za příplatek, když je pozdě.', example: '„Model predikuje špičku v týdnu 38 — zásoby připravím v týdnu 35."' },
    { tag: 'Obchodní argumentace', title: 'Jděte za zákazníkem s daty v ruce', text: 'Přestaňte říkat „myslím, že se to prodá". Říkejte „trh to prodává o 34 % víc než loni — a my zatím ne".', example: '„Váš benchmark je 18 % pod průměrem trhu v této kategorii."' },
    { tag: 'Early warning', title: 'Odprodejte dřív, než přijde propad', text: 'Model zachytí slábnutí trendu dřív, než ho pocítíte na prodejích. Zredukujete zásoby v čas a ušetříte na vázaném kapitálu.', example: '„SKU-2208 klesá 2 měsíce v řadě → snižuji zásoby, dokud je čas."' },
    { tag: 'Celkový přehled', title: 'Konečně víte, kde reálně stojíte', text: 'Benchmark vám ukáže, kde vedete trh a kde zaostáváte. Ne jako pocit — jako číslo, s nímž se dá pracovat.', example: '„Ve 3 kategoriích jsem nad průměrem, ve 2 ztrácím — teď vím kde začít."' },
  ],
  howItWorks: { eyebrow: 'Jak model funguje', heading: 'Čtyři kroky od dat k rozhodnutí' },
  steps: [
    { title: 'Vaše data zůstávají vaše', text: 'Do modelu vstupují pouze anonymizované, agregované signály. Nikdo nevidí vaše konkrétní objednávky — jen benchmark, kde se nacházíte vůči trhu.' },
    { title: 'Model hledá vzory za vás', text: 'Sezonní špičky, nárůsty penetrace, stabilní růst bez výkyvů — to jsou signály, které lidsky přehlédnete. Model je vidí automaticky a přiřadí jim váhu.' },
    { title: 'Dostanete číslo i slovní výklad', text: 'Skóre 0–100 doplněné odůvodněním. 80+ znamená jednat. Pod 40 znamená sledovat nebo redukovat. Nemusíte interpretovat grafy.' },
    { title: 'Doporučení tam, kde pracujete', text: 'Dashboard, API nebo push notifikace — skóre přijde tam, kde se rozhodujete. Žádné přihlašování do dalšího systému, pokud nechcete.' },
  ],
  simulator: {
    eyebrow: 'Interaktivní simulátor', heading: 'Vyzkoušejte, jak se počítá skóre',
    sub: 'Posuňte signály a sledujte, jak se mění predikce a doporučená akce.',
    sliders: [
      { label: 'MoM obrat (3M trend)', weight: '35%' },
      { label: 'Nová penetrace odběratelů', weight: '25%' },
      { label: 'Sezonní stabilita', weight: '20%' },
      { label: 'Košíková korelace', weight: '20%' },
    ],
    weightLabel: 'váha', scoreLabel: 'Prediktivní skóre',
  },
  recommendation: {
    stockUp: 'Naskladnit', stockUpDesc: 'Silný signál — navyšte objednávku.',
    watch: 'Sledovat', watchDesc: 'Pozitivní trend, držet pozici.',
    observe: 'Pozorovat', observeDesc: 'Smíšené signály, rozhodujte opatrně.',
    reduce: 'Redukovat', reduceDesc: 'Slábnoucí poptávka, snižte zásoby.',
  },
  marketStrip: {
    eyebrow: 'Trh v číslech', heading: 'Data, která dávají kontext',
    sub: 'Agregované signály z celé distribuční sítě vám ukazují, kde reálně stojíte — bez dohadů, bez nepřesných průzkumů.',
    statGrowth: 'růst rostoucích kategorií MoM',
    statSpeed: 'rychlejší reakce na změnu trendu',
  },
  pricing: {
    eyebrow: 'Pricing', heading: 'Tři úrovně. Vyberte, jak hluboko chcete vidět.',
    recommended: 'Doporučeno', allFromPrev: 'Vše z',
  },
  tiers: [
    {
      name: 'Signal', subtitle: 'Měsíční přehled trendů,\nkterý dostanete automaticky',
      price: 'Součást', priceUnit: 'partnerství', priceNote: 'přidaná hodnota bez příplatku',
      cta: 'Mám zájem',
      features: [
        'Měsíční report trendů dle kategorie',
        'Top 10 rostoucích SKU v segmentu',
        'Top 5 ztrácejících produktů (early warning)',
        'Sezonní vzory — 12měsíční pohled',
        'Export PDF + strojově čitelný JSON',
      ],
    },
    {
      name: 'Compass', subtitle: 'Prediktivní skóre pro každý SKU\nve vašem sortimentu',
      price: '4 900', priceUnit: 'Kč / měsíc', priceNote: 'nebo jako add-on k SWELT.PARTNER',
      cta: 'Vyzkoušet Compass',
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
      name: 'Atlas', subtitle: 'Strategický pohled na byznys i trh\npro dlouhodobé plánování',
      price: 'Na míru', priceUnit: '', priceNote: 'roční smlouva, enterprise pricing',
      cta: 'Kontaktovat sales',
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
  ],
  finalCta: {
    heading: 'Začněte rozhodovat s daty.',
    sub: 'Domluvíme krátkou ukázku na vašich kategoriích — uvidíte, jak skóre sedí na váš sortiment.',
    button: 'Domluvit ukázku',
  },
};

const en: IntelligenceText = {
  hero: {
    badge: 'SWELT INTELLIGENCE — Market data',
    h1Part1: 'Order with confidence,',
    h1Highlight: 'guesswork.',
    sub: 'Stop guessing what will sell. SWELT INTELLIGENCE shows you goods movement across the entire distribution — so you know what to order before you run out or get stuck with a surplus.',
    statAccuracy: 'prediction accuracy', statGrowth: 'MoM signal growth', statForecast: 'forecast lead time',
    ctaProduct: 'Explore the product', ctaSimulator: 'Try the simulator',
  },
  liveCard: {
    eyebrow: 'Live signal · SKU-4471', mom: '% MoM',
    subtitle: 'Distribution-wide turnover · April 2025',
    rowTrend: 'Trend', rowPenetration: 'Penetration', rowStability: 'Stability',
    score: 'Score', stockUp: '↑ Stock up',
  },
  insightsSection: {
    eyebrow: 'Product logic',
    heading: 'You see your stock. We see the whole market.',
    sub: 'Four pillars that turn anonymous data into decisions that strengthen your business.',
  },
  insights: [
    { tag: 'Visibility', title: 'Goods movement across the market', text: 'You see not just your stock — you see what is actually selling across the distribution. A stronger signal than any survey.' },
    { tag: 'Prediction', title: 'A model that learns from data', text: 'A predictive score for every SKU tells you whether demand will rise, hold or fall — before it shows up at the till.' },
    { tag: 'Benchmark', title: 'Where you stand vs the market', text: 'Compare your sales to an anonymous market aggregate. Instantly know where you lead and where you are losing position.' },
    { tag: 'Action', title: 'Recommendations, not just numbers', text: 'Every signal translates into a clear step: stock up, watch or reduce. No graph interpretation.' },
  ],
  dataFlow: {
    eyebrow: 'Data flow', heading: 'From signal to recommendation',
    sub: 'How raw data across distribution arrives as a clear step.',
    nodes: ['Anonymized data', 'Signal aggregation', 'Model & weights', 'Score 0–100', 'Recommendation'],
    stepLabel: 'Step',
  },
  useCasesSection: { eyebrow: 'Use cases', heading: 'Six scenarios where data changes the game' },
  useCases: [
    { tag: 'Buying & stock', title: 'Order with numbers, not gut feel', text: 'A predictive score tells you which SKU to push and which to reduce. Less overstocking, fewer stockouts, less wasted money.', example: '"Score 87 for SKU-4471 → I am increasing the order by 20 %."' },
    { tag: 'Category development', title: 'Enter a category before others', text: 'You see category trends before they hit common knowledge. Early entry means a better position and higher margin.', example: '"Category X is growing +41 % MoM — I do not have it yet, but I am the first to know."' },
    { tag: 'Seasonal planning', title: 'Prepare stock before the peak, not during it', text: 'Forecasts three months ahead give you time. You stop panicking and ordering at premium when it is too late.', example: '"Model predicts a peak in week 38 — I prepare stock by week 35."' },
    { tag: 'Sales argument', title: 'Visit your customer with data in hand', text: 'Stop saying "I think it will sell". Say "the market sells 34 % more of this than last year — and we do not yet".', example: '"Your benchmark is 18 % below the market average in this category."' },
    { tag: 'Early warning', title: 'Sell down before the drop arrives', text: 'The model detects a fading trend before you feel it in sales. You reduce stock in time and free up tied-up capital.', example: '"SKU-2208 has fallen for 2 months in a row → I reduce stock while there is time."' },
    { tag: 'Overall view', title: 'Finally know where you actually stand', text: 'A benchmark shows where you lead the market and where you fall behind. Not as a feeling — as a number you can work with.', example: '"In 3 categories I am above average, in 2 I am losing — now I know where to start."' },
  ],
  howItWorks: { eyebrow: 'How the model works', heading: 'Four steps from data to decision' },
  steps: [
    { title: 'Your data stays yours', text: 'Only anonymized, aggregated signals enter the model. Nobody sees your specific orders — only the benchmark of where you stand vs the market.' },
    { title: 'The model finds patterns for you', text: 'Seasonal peaks, penetration jumps, steady growth without volatility — these are signals humans miss. The model spots them automatically and weights them.' },
    { title: 'You get a number and a verbal interpretation', text: 'A 0–100 score with reasoning. 80+ means act. Below 40 means watch or reduce. No graph interpretation needed.' },
    { title: 'Recommendations where you work', text: 'Dashboard, API or push notifications — the score arrives where you make decisions. No extra system to log into unless you want one.' },
  ],
  simulator: {
    eyebrow: 'Interactive simulator', heading: 'Try how the score is calculated',
    sub: 'Move the signals and watch how the prediction and recommended action change.',
    sliders: [
      { label: 'MoM turnover (3M trend)', weight: '35%' },
      { label: 'New customer penetration', weight: '25%' },
      { label: 'Seasonal stability', weight: '20%' },
      { label: 'Basket correlation', weight: '20%' },
    ],
    weightLabel: 'weight', scoreLabel: 'Predictive score',
  },
  recommendation: {
    stockUp: 'Stock up', stockUpDesc: 'Strong signal — increase the order.',
    watch: 'Watch', watchDesc: 'Positive trend, hold the position.',
    observe: 'Observe', observeDesc: 'Mixed signals, decide carefully.',
    reduce: 'Reduce', reduceDesc: 'Weakening demand, lower stock.',
  },
  marketStrip: {
    eyebrow: 'Market in numbers', heading: 'Data that gives context',
    sub: 'Aggregated signals from across the distribution network show where you actually stand — no guessing, no inaccurate surveys.',
    statGrowth: 'growth of rising categories MoM',
    statSpeed: 'faster reaction to a trend change',
  },
  pricing: {
    eyebrow: 'Pricing', heading: 'Three tiers. Choose how deeply you want to see.',
    recommended: 'Recommended', allFromPrev: 'Everything from',
  },
  tiers: [
    {
      name: 'Signal', subtitle: 'Monthly trend overview\ndelivered automatically',
      price: 'Included', priceUnit: 'in partnership', priceNote: 'added value with no surcharge',
      cta: 'I am interested',
      features: [
        'Monthly trend report by category',
        'Top 10 growing SKUs in your segment',
        'Top 5 declining products (early warning)',
        'Seasonal patterns — 12-month view',
        'PDF export + machine-readable JSON',
      ],
    },
    {
      name: 'Compass', subtitle: 'Predictive score for every SKU\nin your assortment',
      price: '€199', priceUnit: '/ month', priceNote: 'or as an add-on to SWELT.PARTNER',
      cta: 'Try Compass',
      features: [
        'Predictive demand score (0–100) for every SKU',
        'Confidence interval + historical model accuracy',
        'Partner vs anonymous market comparison',
        'Alerts on new trends before broad spread',
        'API access or dashboard integration',
        'Weekly digest — score activity',
      ],
    },
    {
      name: 'Atlas', subtitle: 'Strategic view of business and market\nfor long-term planning',
      price: 'Bespoke', priceUnit: '', priceNote: 'annual contract, enterprise pricing',
      cta: 'Contact sales',
      features: [
        'Everything from Compass',
        'Market segmentation — where you lead, where you lag',
        'Sales correlation analysis',
        'Seasonal forecasts 3 months ahead',
        'White-label data export',
        'Dedicated analyst (quarterly)',
        'Custom alerting on threshold values',
      ],
    },
  ],
  finalCta: {
    heading: 'Start deciding with data.',
    sub: 'Let us arrange a short demo on your categories — you will see how the score fits your assortment.',
    button: 'Book a demo',
  },
};

const sk = en, pl = en, de = en, fr = en, es = en, it = en, nl = en, pt = en;
const hu = en, ro = en, sv = en, da = en, fi = en, no = en, el = en, is = en;

export const intelligence: Record<Lang, IntelligenceText> = {
  cs, sk, pl, de, en, fr, es, it, nl, pt, hu, ro, sv, da, fi, no, el, is,
};
