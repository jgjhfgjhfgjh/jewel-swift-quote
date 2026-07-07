/**
 * Real brand histories rendered on /brands/:slug detail pages, in the same
 * StoryEra format as the koncern landing pages (see `@/data/concerns`).
 *
 * Keyed by canonical brand key (see `toBrandKey` in `@/lib/brandNormalize`).
 * Brands without a documented public history (private/wholesale labels like
 * HACKER, LEVIEN, MANA) are intentionally omitted — the detail page falls
 * back to the editorial placeholder rather than an invented story.
 */

import type { StoryEra } from './concerns';

export const BRAND_STORIES: Record<string, StoryEra[]> = {
  'CALVIN KLEIN': [
    {
      heading: 'Švýcarská éra a zrod fashion watches',
      items: [
        {
          lead: '1997 – Spojení se Swatch Group',
          text: 'Newyorský módní minimalismus se spojil s největším švýcarským hodinářským koncernem — vznikla divize cK Watch Co. Ltd. s prestižním označením „Swiss Made".',
        },
        {
          lead: 'Nový segment módních hodinek',
          text: 'Spojení čistého designu a švýcarské kvality definovalo zcela nový segment cenově dostupných, ale vysoce kvalitních fashion watches.',
        },
        {
          lead: '2004 – Rozšíření o šperky',
          text: 'Na celosvětový úspěch hodinek navázaly kolekce minimalistických šperků z čistých linií a chirurgické oceli.',
        },
      ],
    },
    {
      heading: 'Nová éra pod křídly Movado Group',
      items: [
        {
          lead: '2019 – Konec jedné kapitoly',
          text: 'Po více než 20 letech úspěšné spolupráce skončilo licenční partnerství se Swatch Group kvůli odlišným vizím budoucnosti.',
        },
        {
          lead: '2020 – Strategický restart',
          text: 'Calvin Klein podepsal exkluzivní smlouvu s globálním hodinářským gigantem Movado Group; od roku 2022 Movado řídí kompletní vývoj a distribuci.',
        },
        {
          lead: 'Původní DNA zůstává',
          text: 'Hodinky a šperky si striktně zachovávají moderní estetiku, čisté linie a nadčasovou eleganci, která doplňuje identitu módního impéria.',
        },
      ],
    },
  ],

  'TISSOT': [
    {
      heading: '1853: Průkopník z Le Locle',
      items: [
        {
          lead: '1853 – Otec a syn Tissotovi',
          text: 'Charles-Félicien Tissot založil se synem Charlesem-Émilem manufakturu ve švýcarském Le Locle, kde značka sídlí dodnes.',
        },
        {
          lead: '1930 – Antimagnetická revoluce',
          text: 'Tissot představil první antimagnetické náramkové hodinky na světě a potvrdil pověst technického inovátora.',
        },
      ],
    },
    {
      heading: 'Inovace a velký sport',
      items: [
        {
          lead: '1999 – Dotykové T-Touch',
          text: 'Hodinky s dotykovým sklíčkem a funkcemi jako výškoměr, kompas či barometr — průlom, který předběhl éru smartwatch.',
        },
        {
          lead: 'Oficiální časomíra',
          text: 'Tissot měří čas NBA, MotoGP či Tour de France. Jako součást Swatch Group nabízí „Swiss Made" kvalitu za dostupnou cenu.',
        },
      ],
    },
  ],

  'CASIO': [
    {
      heading: '1946: Od kalkulaček k hodinkám',
      items: [
        {
          lead: '1946 – Tokijská dílna',
          text: 'Tadao Kashio založil v Tokiu dílnu Kashio Seisakujo; firma proslula nejprve elektronickými kalkulačkami.',
        },
        {
          lead: '1974 – Casiotron',
          text: 'Vstup do hodinářství: první náramkové hodinky s plně automatickým kalendářem, který sám rozeznal délku měsíce.',
        },
      ],
    },
    {
      heading: '1983: Fenomén G-SHOCK',
      items: [
        {
          lead: 'Koncept „trojité desítky"',
          text: 'Inženýr Kikuo Ibe vyvinul nerozbitné G-SHOCK: přežít pád z 10 metrů, tlak 10 barů a 10 let na jednu baterii.',
        },
        {
          lead: 'Kultovní digitálky',
          text: 'Modely jako F-91W patří k nejprodávanějším hodinkám všech dob — symbol spolehlivé a dostupné japonské techniky.',
        },
      ],
    },
  ],

  'SWAROVSKI': [
    {
      heading: '1895: Křišťálová vize',
      items: [
        {
          lead: '1895 – Wattens, Tyrolsko',
          text: 'Daniel Swarovski přesídlil do rakouského Wattensu se svým patentovaným elektrickým strojem na přesné broušení křišťálu.',
        },
        {
          lead: 'Rodinná firma dodnes',
          text: 'Společnost zůstává v rukou rodiny Swarovski už pátou generaci — unikát mezi globálními značkami.',
        },
      ],
    },
    {
      heading: 'Křišťál, který dobyl svět',
      items: [
        {
          lead: 'Móda i film',
          text: 'Swarovski křišťály zářily na módních molech i v Hollywoodu a staly se synonymem dostupného lesku.',
        },
        {
          lead: 'Vlastní šperky a hodinky',
          text: 'Vedle dodávek módním domům buduje značka vlastní kolekce šperků a hodinek s precizně broušenými krystaly.',
        },
      ],
    },
  ],

  'PANDORA': [
    {
      heading: '1982: Z kodaňského klenotnictví',
      items: [
        {
          lead: '1982 – Per a Winnie Enevoldsenovi',
          text: 'Manželé otevřeli malé klenotnictví v Kodani; postupně přešli k vlastnímu designu a výrobě šperků.',
        },
        {
          lead: 'Vlastní výroba',
          text: 'Pandora vybudovala vlastní šperkařskou výrobu v Thajsku, díky níž drží kvalitu i dostupné ceny.',
        },
      ],
    },
    {
      heading: '2000: Náramek, který dobyl svět',
      items: [
        {
          lead: 'Koncept charm náramku',
          text: 'V roce 2000 uvedla Pandora náramek s vyměnitelnými přívěsky (charms) — každý šperk vypráví osobní příběh nositelky.',
        },
        {
          lead: 'Světová jednička',
          text: 'Dnes je Pandora největší šperkařskou značkou světa podle počtu vyrobených šperků, se spolupracemi jako Disney či Marvel.',
        },
      ],
    },
  ],

  'GUESS': [
    {
      heading: '1981: Sen bratrů Marcianových',
      items: [
        {
          lead: '1981 – Los Angeles',
          text: 'Bratři Marcianové přenesli evropský šarm do kalifornského denimu; jejich džíny se staly okamžitým hitem.',
        },
        {
          lead: 'Ikonické kampaně',
          text: 'Černobílé fotografie Guess odstartovaly kariéry supermodelek jako Claudia Schiffer a definovaly glamour 90. let.',
        },
      ],
    },
    {
      heading: 'Hodinky a šperky',
      items: [
        {
          lead: 'Od 80. let na zápěstí',
          text: 'Hodinky Guess vznikají ve spolupráci s Timex Group už od poloviny 80. let — patří k průkopníkům fashion watches.',
        },
        {
          lead: 'Glamour s otazníkem',
          text: 'Třpytivé lunety, krystaly a nezaměnitelné logo: Guess přenáší sebevědomý kalifornský styl do hodinek i šperků.',
        },
      ],
    },
  ],

  'TOMMY HILFIGER': [
    {
      heading: '1985: Classic American Cool',
      items: [
        {
          lead: '1985 – New York',
          text: 'Tommy Hilfiger založil značku postavenou na uvolněném preppy stylu a červeno-modro-bílém vlajkovém logu.',
        },
        {
          lead: 'Popkulturní fenomén',
          text: 'V 90. letech si značku osvojila hudební scéna od popu po hip-hop a Hilfiger se stal symbolem americké módy.',
        },
      ],
    },
    {
      heading: 'Hodinky s Movado Group',
      items: [
        {
          lead: '2001 – Licenční partnerství',
          text: 'Vývoj a výrobu hodinek převzala americká Movado Group; spojení módního designu a hodinářského know-how trvá dodnes.',
        },
        {
          lead: 'Námořnická DNA',
          text: 'Modro-bílo-červená barevnost, ocelové tahy a sportovní elegance dělají z hodinek Tommy Hilfiger dostupnou klasiku.',
        },
      ],
    },
  ],

  'HUGO BOSS': [
    {
      heading: '1924: Z Metzingenu do světa',
      items: [
        {
          lead: '1924 – Hugo Ferdinand Boss',
          text: 'V německém Metzingenu vznikla oděvní dílna, z níž po válce vyrostl symbol prémiové pánské módy — dokonale padnoucí oblek.',
        },
        {
          lead: 'Dvě tváře značky',
          text: 'Elegantní BOSS a mladší rebelská linie HUGO oslovují dvě generace zákazníků po celém světě.',
        },
      ],
    },
    {
      heading: 'BOSS na zápěstí',
      items: [
        {
          lead: '2005 – Movado Group',
          text: 'Hodinky Hugo Boss vyrábí pod licencí americká Movado Group — business elegance v oceli a minimalistických linkách.',
        },
        {
          lead: 'Šperky pro muže i ženy',
          text: 'Kolekce ocelových šperků přenášejí přesný německý střih do náramků, řetízků a manžetových knoflíčků.',
        },
      ],
    },
  ],

  'LACOSTE': [
    {
      heading: '1933: Legenda jménem Krokodýl',
      items: [
        {
          lead: 'René Lacoste',
          text: 'Tenisový šampion přezdívaný „Krokodýl" založil s André Gillierem značku a uvedl polokošili L.12.12 — jeden z prvních oděvů s viditelným logem v historii.',
        },
        {
          lead: 'Sportovní elegance',
          text: 'Lacoste definoval styl, kterému se dnes říká sportovní šik: pohodlí sportu povýšené na eleganci.',
        },
      ],
    },
    {
      heading: 'Hodinky pod Movado Group',
      items: [
        {
          lead: '2007 – Licenční smlouva',
          text: 'Hodinky Lacoste vyvíjí a distribuuje Movado Group; čistý francouzský design doplňuje ikonický krokodýl.',
        },
        {
          lead: 'Pro celou rodinu',
          text: 'Od sportovních chronografů po barevné dětské modely — Lacoste zůstává věrný své tenisové DNA.',
        },
      ],
    },
  ],

  'EMPORIO ARMANI': [
    {
      heading: '1975–1981: Impérium Giorgia Armaniho',
      items: [
        {
          lead: '1975 – Milán',
          text: 'Giorgio Armani založil módní dům, který změnil pánskou siluetu a stal se synonymem italské elegance.',
        },
        {
          lead: '1981 – Zrod Emporia',
          text: 'Mladší linie Emporio Armani s logem orla přinesla Armaniho styl městské generaci.',
        },
      ],
    },
    {
      heading: 'Hodinky a šperky od roku 1997',
      items: [
        {
          lead: 'Licence Fossil Group',
          text: 'Od roku 1997 vyrábí hodinky Emporio Armani americká Fossil Group — vznikla tak jedna z nejúspěšnějších fashion-watch značek světa.',
        },
        {
          lead: 'Milánská elegance',
          text: 'Tenké profily, ušlechtilé materiály a nezaměnitelný orel: doplňky, které dotvářejí celý outfit.',
        },
      ],
    },
  ],

  'MICHAEL KORS': [
    {
      heading: '1981: Jet-set z New Yorku',
      items: [
        {
          lead: '1981 – Vlastní značka',
          text: 'Michael Kors založil módní dům postavený na americkém sportswearu a luxusu ve stylu jet-set.',
        },
        {
          lead: 'Hollywoodská klientela',
          text: 'Jeho návrhy oblékaly první dámy i filmové hvězdy a značka vyrostla v globální módní impérium.',
        },
      ],
    },
    {
      heading: 'Fenomén fashion hodinek',
      items: [
        {
          lead: '2004 – Spolupráce s Fossil Group',
          text: 'Hodinky Michael Kors se staly jedním z největších úspěchů segmentu — zlaté tóny a glamour chronografy ovládly desáté roky.',
        },
        {
          lead: 'Šperky jako doplněk stylu',
          text: 'Ocelové šperky s krystaly přenášejí newyorský glamour do každodenního nošení.',
        },
      ],
    },
  ],

  'DKNY': [
    {
      heading: '1984–1989: Energie New Yorku',
      items: [
        {
          lead: 'Donna Karan',
          text: 'Návrhářka proslula systémem „sedmi snadných kusů", které zjednodušily šatník moderní ženy.',
        },
        {
          lead: '1989 – Zrod DKNY',
          text: 'Donna Karan New York vznikla jako mladší, městská linie inspirovaná pulzem Manhattanu.',
        },
      ],
    },
    {
      heading: 'Městský minimalismus',
      items: [
        {
          lead: 'Hodinky pod Fossil Group',
          text: 'Hodinky a šperky DKNY vyrábí Fossil Group; čisté linie a dostupná cena z nich dělají vstupní bránu do světa newyorské módy.',
        },
      ],
    },
  ],

  'FOSSIL': [
    {
      heading: '1984: Retro Amerika z Texasu',
      items: [
        {
          lead: '1984 – Tom Kartsotis',
          text: 'Fossil vznikl v Texasu s vizí dostupných hodinek v duchu americké estetiky 50. let — včetně kultovních plechových krabiček.',
        },
        {
          lead: 'Vintage jako program',
          text: 'Kožené řemínky, patina a nostalgický design udělaly z Fossilu synonymum retro stylu.',
        },
      ],
    },
    {
      heading: 'Z retro značky globální skupina',
      items: [
        {
          lead: 'Licenční velmoc',
          text: 'Fossil Group dnes vyrábí hodinky a šperky pro přední módní domy — Emporio Armani, Michael Kors či DKNY.',
        },
        {
          lead: 'Vlastní tvář',
          text: 'Značka Fossil zůstává jádrem skupiny: poctivé hodinky a kožené doplňky s americkým rukopisem.',
        },
      ],
    },
  ],

  'TIMEX': [
    {
      heading: '1854: Hodinky pro každého',
      items: [
        {
          lead: '1854 – Waterbury Clock Company',
          text: 'V Connecticutu vznikla firma, která zpřístupnila hodinky širokým vrstvám — kořeny dnešního Timexu.',
        },
        {
          lead: '1933 – Mickey Mouse',
          text: 'Hodinky s Mickey Mousem se staly prodejním fenoménem velké hospodářské krize a zachránily firmu před úpadkem.',
        },
      ],
    },
    {
      heading: 'Nezničitelná ikona',
      items: [
        {
          lead: '„It takes a licking…"',
          text: 'Legendární televizní „mučicí testy" ukázaly, že Timex „dostane zabrat a tiká dál" — jedna z nejslavnějších kampaní historie.',
        },
        {
          lead: '1992 – Indiglo',
          text: 'Elektroluminiscenční podsvícení ciferníku se stalo jedním z nejznámějších hodinářských vynálezů konce 20. století.',
        },
      ],
    },
  ],

  'CITIZEN': [
    {
      heading: '1918: Hodinky pro každého občana',
      items: [
        {
          lead: '1918 – Tokio',
          text: 'Výzkumný ústav Shokosha položil základy firmy; jméno CITIZEN dostaly první kapesní hodinky z roku 1924 — hodinky „pro každého občana".',
        },
        {
          lead: 'Technologický lídr',
          text: 'Citizen se vypracoval mezi světovou špičku v přesných a technologicky pokročilých hodinkách.',
        },
      ],
    },
    {
      heading: 'Eco-Drive a globální skupina',
      items: [
        {
          lead: 'Pohon světlem',
          text: 'Technologie Eco-Drive odstranila nutnost výměny baterií — hodinky dobíjí jakékoli světlo.',
        },
        {
          lead: 'Akvizice',
          text: 'Do skupiny patří americká Bulova (2008) i švýcarské značky Frederique Constant a Alpina (2016).',
        },
      ],
    },
  ],

  'Q&Q': [
    {
      heading: '1976: Dostupná značka Citizenu',
      items: [
        {
          lead: 'Japonská kvalita pro každý den',
          text: 'Q&Q vzniklo v rámci skupiny Citizen jako značka odolných a voděodolných hodinek za přátelské ceny.',
        },
      ],
    },
    {
      heading: 'SmileSolar',
      items: [
        {
          lead: 'Solární pohon',
          text: 'Řada SmileSolar nabíjí hodinky světlem a využívá částečně recyklované materiály — bez výměny baterie.',
        },
        {
          lead: 'Barevný design',
          text: 'Veselé barvy a nízká hmotnost dělají z Q&Q ideální hodinky pro děti, sport i volný čas.',
        },
      ],
    },
  ],

  'LORUS': [
    {
      heading: '1982: Mladší značka Seiko',
      items: [
        {
          lead: 'Dostupná tvář japonského giganta',
          text: 'Lorus vznikl v rámci skupiny Seiko, aby nabídl spolehlivou japonskou quartzovou techniku za přátelské ceny.',
        },
      ],
    },
    {
      heading: 'Hodinky pro celou rodinu',
      items: [
        {
          lead: 'Široký záběr',
          text: 'Sportovní chronografy, klasické pánské i dámské modely a oblíbené dětské řady — vše s kvalitou zázemí Seiko.',
        },
      ],
    },
  ],

  'SWATCH': [
    {
      heading: '1983: Hodinky, které zachránily Švýcarsko',
      items: [
        {
          lead: 'Nicolas Hayek',
          text: 'Odpověď na japonskou quartzovou krizi: plastové švýcarské hodinky, které porazily konkurenci cenou i designem a zachránily „Swiss Made".',
        },
        {
          lead: 'Hodinky jako móda',
          text: 'Swatch jako první udělal z hodinek módní doplněk, který se mění podle nálady a outfitu.',
        },
      ],
    },
    {
      heading: 'Popkultura na zápěstí',
      items: [
        {
          lead: 'Umělecké edice',
          text: 'Spolupráce s umělci jako Keith Haring udělaly ze Swatch sběratelský fenomén.',
        },
        {
          lead: 'Swatch Bijoux',
          text: 'Šperková linie přenesla hravý design značky i do náramků, přívěsků a prstenů.',
        },
      ],
    },
  ],

  'INVICTA': [
    {
      heading: '1837: Neporazitelná',
      items: [
        {
          lead: 'La Chaux-de-Fonds',
          text: 'Raphael Picard založil značku ve švýcarské kolébce hodinářství; jméno Invicta znamená latinsky „neporazitelná".',
        },
      ],
    },
    {
      heading: '1991: Americké znovuzrození',
      items: [
        {
          lead: 'Eyal Lalo',
          text: 'Hodinář ve třetí generaci oživil značku na Floridě s misí nabídnout masivní, výrazné hodinky za dostupné ceny.',
        },
        {
          lead: 'Pro Diver a sběratelský kult',
          text: 'Robustní potápěčské modely a odvážné designy si získaly celosvětovou komunitu fanoušků.',
        },
      ],
    },
  ],

  'VERSACE': [
    {
      heading: '1978: Pod znamením Medusy',
      items: [
        {
          lead: 'Gianni Versace',
          text: 'V Miláně vznikl módní dům, který spojil vysokou módu s popkulturou a stvořil éru supermodelek.',
        },
        {
          lead: '1997 – Donatella',
          text: 'Po tragické smrti Gianniho převzala kreativní vedení jeho sestra Donatella a dovedla značku do nového tisíciletí.',
        },
      ],
    },
    {
      heading: 'Swiss made glamour',
      items: [
        {
          lead: 'Výroba ve Švýcarsku',
          text: 'Hodinky Versace vznikají v divizi Vertime pod Timex Group — italský design se švýcarskou precizností.',
        },
        {
          lead: 'Medusa a Greca',
          text: 'Hlava Medusy a řecký klíč zdobí ciferníky i šperky jako nezaměnitelný podpis domu.',
        },
      ],
    },
  ],

  'VERSUS VERSACE': [
    {
      heading: '1989: Dárek od Gianniho',
      items: [
        {
          lead: 'Mladší linie Versace',
          text: 'Gianni Versace svěřil novou značku Versus své sestře Donatelle — vznikl mladý, rebelský protějšek hlavního domu se lvem ve znaku.',
        },
      ],
    },
    {
      heading: 'Návrat rebela',
      items: [
        {
          lead: 'Znovuzrození po roce 2009',
          text: 'Versus se vrátil ve spolupráci s mladými návrháři a stal se street-stylovou tváří rodiny Versace.',
        },
        {
          lead: 'Výrazné hodinky',
          text: 'Odvážné tvary a dostupné ceny dělají z Versus vstupní bránu do světa Versace.',
        },
      ],
    },
  ],

  'BREIL': [
    {
      heading: '1906–1942: Milánské kořeny',
      items: [
        {
          lead: '1906 – Innocente Binda',
          text: 'V Miláně vznikla hodinářská firma Binda; v roce 1942 z ní vzešla značka Breil.',
        },
        {
          lead: 'Italský průmyslový design',
          text: 'Breil si vybudoval pověst značky spojující ocel, technický vzhled a milánskou eleganci.',
        },
      ],
    },
    {
      heading: 'Ikona 90. let a ocelové šperky',
      items: [
        {
          lead: '„Don\'t touch my Breil"',
          text: 'Slavný slogan z 90. let patří k nejúspěšnějším italským reklamním kampaním všech dob.',
        },
        {
          lead: 'Šperky z oceli',
          text: 'Breil patřil k průkopníkům ocelových šperků a dodnes je jednou z vlajkových značek rodinné Binda Group.',
        },
      ],
    },
  ],

  'HIP HOP': [
    {
      heading: '1985: Barevná revoluce',
      items: [
        {
          lead: 'Fenomén italských 80. let',
          text: 'Binda Group uvedla Hip Hop — barevné hodinky s vyměnitelnými řemínky, které se staly generačním symbolem Itálie.',
        },
        {
          lead: 'Hodinky jako hra',
          text: 'Vyměň si barvu podle nálady: koncept, který předběhl dobu a prodal miliony kusů.',
        },
      ],
    },
    {
      heading: 'Návrat ikony',
      items: [
        {
          lead: 'Měkký silikon a nové kolekce',
          text: 'Moderní Hip Hop sází na příjemný silikon, zářivé barvy a hravé edice — nostalgie pro rodiče, zábava pro děti.',
        },
      ],
    },
  ],

  'MORELLATO': [
    {
      heading: '1930: Od řemínků ke šperkům',
      items: [
        {
          lead: '1930 – Giulio Morellato',
          text: 'Firma začínala výrobou kožených řemínků k hodinkám, v nichž se stala evropským pojmem.',
        },
        {
          lead: 'Přerod ve šperkařskou značku',
          text: 'Z řemeslné dílny vyrostla značka šperků a hodinek dostupného luxusu s italským designem.',
        },
      ],
    },
    {
      heading: 'Srdce velké skupiny',
      items: [
        {
          lead: 'Morellato Group',
          text: 'Kolem značky vznikla jedna z největších evropských skupin v oboru — patří do ní Sector, Chronostar, La Petite Story či licence Just Cavalli.',
        },
      ],
    },
  ],

  'SECTOR': [
    {
      heading: '1973: No Limits',
      items: [
        {
          lead: 'Italská sportovní značka',
          text: 'Sector vznikl v roce 1973 a proslul filozofií „No Limits" — hodinky pro ty, kdo posouvají hranice.',
        },
        {
          lead: 'Tým extrémních sportovců',
          text: 'V 90. letech značku proslavily kampaně se šampiony extrémních sportů od volného lezení po hloubkové potápění.',
        },
      ],
    },
    {
      heading: '2006: Pod křídly Morellato Group',
      items: [
        {
          lead: 'Nová kapitola',
          text: 'Po akvizici skupinou Morellato pokračuje Sector jako přední italská sportovní hodinková značka — chronografy, ocel a odolnost.',
        },
      ],
    },
  ],

  'CHRONOSTAR': [
    {
      heading: 'Mladší sestra Sectoru',
      items: [
        {
          lead: 'Fashion řada skupiny Sector',
          text: 'Chronostar vznikl v rámci italské skupiny Sector jako dostupná módní linie hodinek — odtud i označení „Chronostar by Sector".',
        },
      ],
    },
    {
      heading: 'Dnes pod Morellato Group',
      items: [
        {
          lead: 'Italský design pro mladé',
          text: 'Po převzetí Sectoru skupinou Morellato pokračuje Chronostar jako fashion značka s výrazným designem a příznivou cenou.',
        },
      ],
    },
  ],

  'JUST CAVALLI': [
    {
      heading: '1998: Mladá krev Roberta Cavalliho',
      items: [
        {
          lead: 'Druhá linie slavného domu',
          text: 'Roberto Cavalli založil Just Cavalli jako mladší a odvážnější tvář své značky — zvířecí potisky a nespoutaný glamour.',
        },
      ],
    },
    {
      heading: 'Italské fashion hodinky a šperky',
      items: [
        {
          lead: 'Licence Morellato Group',
          text: 'Hodinky a šperky Just Cavalli vyrábí italská Morellato Group; poznávacím znamením je motiv hada a výrazný design.',
        },
      ],
    },
  ],

  'ROBERTO CAVALLI': [
    {
      heading: 'Počátek 70. let: Florentský vizionář',
      items: [
        {
          lead: 'Patent na potisk kůže',
          text: 'Roberto Cavalli si nechal patentovat vlastní techniku tisku na kůži a proslul zvířecími potisky a glamour stylem jet-setu.',
        },
        {
          lead: 'Symbol italské smyslnosti',
          text: 'Jeho návrhy oblékaly hvězdy červených koberců po celém světě.',
        },
      ],
    },
    {
      heading: '2014: Roberto Cavalli by Franck Muller',
      items: [
        {
          lead: 'Spojení se švýcarskou manufakturou',
          text: 'Hodinky vznikly ve spolupráci se slavnou švýcarskou manufakturou Franck Muller — italský glamour se švýcarskou výrobou.',
        },
      ],
    },
  ],

  'POLICE': [
    {
      heading: '1983: Zrod rebela',
      items: [
        {
          lead: 'Značka skupiny De Rigo',
          text: 'Police vznikla v Itálii jako značka slunečních brýlí s rockovou, městskou estetikou — pojmenovaná podle policejních „aviatorek".',
        },
      ],
    },
    {
      heading: 'Lifestylové impérium',
      items: [
        {
          lead: 'Od brýlí k hodinkám a šperkům',
          text: 'Police se rozrostla v kompletní lifestylovou značku pro muže, kteří se nebojí výrazného stylu.',
        },
        {
          lead: 'Slavné tváře',
          text: 'Kampaně značky vedli mimo jiné Bruce Willis, David Beckham či Neymar Jr.',
        },
      ],
    },
  ],

  'ESPRIT': [
    {
      heading: '1968: Z dodávky v San Francisku',
      items: [
        {
          lead: 'Susie a Doug Tompkinsovi',
          text: 'Zakladatelé začali prodávat oblečení doslova z dodávky VW; z „esprit de corp" vyrostla globální značka.',
        },
        {
          lead: 'Kalifornský duch',
          text: 'Uvolněný, pozitivní styl udělal z Espritu jednu z nejznámějších módních značek 80. a 90. let.',
        },
      ],
    },
    {
      heading: 'Hodinky a šperky',
      items: [
        {
          lead: 'Dostupná elegance',
          text: 'Licencované kolekce hodinek a šperků přenášejí nadčasový kalifornský minimalismus do každodenního nošení.',
        },
      ],
    },
  ],

  'NAUTICA': [
    {
      heading: '1983: Volání moře',
      items: [
        {
          lead: 'David Chu, New York',
          text: 'Značka pojmenovaná podle latinského „nauticus" vyrostla z jachtařské estetiky; logem je vzdutý spinakr.',
        },
      ],
    },
    {
      heading: 'Námořní styl na zápěstí',
      items: [
        {
          lead: 'Hodinky s DNA jachtingu',
          text: 'Voděodolnost, výrazné lunety a modro-bílo-červená barevnost — hodinky Nautica vznikají pod Timex Group.',
        },
      ],
    },
  ],

  'DISNEY': [
    {
      heading: '1923–1933: Zrod kouzla',
      items: [
        {
          lead: '1923 – Bratři Disneyové',
          text: 'Walt a Roy Disneyovi založili studio, které změnilo dějiny zábavy.',
        },
        {
          lead: '1933 – Hodinky s Mickeym',
          text: 'První hodinky s Mickey Mousem se staly prodejním fenoménem velké hospodářské krize — prodaly se jich statisíce a zachránily svého výrobce.',
        },
      ],
    },
    {
      heading: 'Licencovaná magie dodnes',
      items: [
        {
          lead: 'Hodinky a šperky pro malé i velké',
          text: 'Postavičky Disney provázejí hodinky a šperky už přes 90 let — od dětských modelů po sběratelské edice.',
        },
      ],
    },
  ],

  'VICEROY': [
    {
      heading: '1951: Švýcarské kořeny',
      items: [
        {
          lead: 'Zrod v kolébce hodinářství',
          text: 'Viceroy vznikl v roce 1951 ve švýcarském hodinářském prostředí s cílem nabídnout kvalitní hodinky širokému publiku.',
        },
      ],
    },
    {
      heading: 'Španělská jednička',
      items: [
        {
          lead: 'Vlajková značka skupiny Munreco',
          text: 'Pod madridskou skupinou Munreco se Viceroy stal jednou z nejpopulárnějších hodinkových značek Španělska.',
        },
        {
          lead: 'Pro celou rodinu',
          text: 'Od elegantních a sportovních modelů po oblíbené dětské hodinky a smartwatch.',
        },
      ],
    },
  ],

  'MARK MADDOX': [
    {
      heading: 'Španělská ikona 80. let',
      items: [
        {
          lead: 'Hvězda své doby',
          text: 'Mark Maddox patřil v 80. letech k nejpopulárnějším módním hodinkovým značkám ve Španělsku.',
        },
      ],
    },
    {
      heading: 'Návrat na scénu',
      items: [
        {
          lead: 'Oživení skupinou Munreco',
          text: 'Majitel značky Viceroy vrátil Mark Maddox po roce 2010 na trh jako vintage-fashion řadu — retro estetika pro novou generaci.',
        },
      ],
    },
  ],

  'PIERRE LANNIER': [
    {
      heading: '1977: Rodinná manufaktura v Alsasku',
      items: [
        {
          lead: 'Pierre Burgun',
          text: 'V alsaském Ernolsheim-Bruche vznikla rodinná hodinářská manufaktura, kterou rodina vede dodnes.',
        },
      ],
    },
    {
      heading: 'Made in France',
      items: [
        {
          lead: 'Francouzská výroba',
          text: 'Pierre Lannier patří k posledním francouzským hodinářům, kteří vyrábějí přímo ve Francii — francouzská elegance s poctivým řemeslem.',
        },
      ],
    },
  ],

  'CERRUTI 1881': [
    {
      heading: '1881: Tkalcovna v Bielle',
      items: [
        {
          lead: 'Rodina Cerruti',
          text: 'V italské Bielle vznikla vlnařská manufaktura, jejíž látky dodnes patří ke světové špičce.',
        },
        {
          lead: '1967 – Nino Cerruti v Paříži',
          text: 'Vnuk zakladatele otevřel módní dům Cerruti 1881 a oblékal hollywoodské hvězdy i filmová plátna.',
        },
      ],
    },
    {
      heading: 'Elegance v hodinkách',
      items: [
        {
          lead: 'Italsko-francouzský šarm',
          text: 'Licencované hodinky Cerruti 1881 přenášejí krejčovskou eleganci domu do čistých linií a ušlechtilých materiálů.',
        },
      ],
    },
  ],

  'MOSCHINO': [
    {
      heading: '1983: Móda s ironií',
      items: [
        {
          lead: 'Franco Moschino',
          text: 'Milánský provokatér udělal z módy hru — jeho „Cheap and Chic" parodovalo i oslavovalo svět luxusu.',
        },
        {
          lead: 'Odkaz žije dál',
          text: 'Po Frankově smrti v roce 1994 dům pokračoval v jeho duchu; éra Jeremyho Scotta (2013–2023) jej vrátila do centra popkultury.',
        },
      ],
    },
    {
      heading: 'Hravost na zápěstí',
      items: [
        {
          lead: 'Design plný symbolů',
          text: 'Srdce, medvídci a výrazná loga — hodinky a šperky Moschino jsou módní statement s úsměvem.',
        },
      ],
    },
  ],

  'MISS SIXTY': [
    {
      heading: '1991: Italské denim impérium',
      items: [
        {
          lead: 'Značka skupiny Sixty',
          text: 'Miss Sixty vznikla jako jedna z prvních italských denimových značek určených výhradně ženám.',
        },
        {
          lead: 'Ikona přelomu tisíciletí',
          text: 'Přiléhavé střihy a glam styl udělaly z Miss Sixty symbol módy 90. let a éry Y2K.',
        },
      ],
    },
    {
      heading: 'Doplňky s atitudou',
      items: [
        {
          lead: 'Hodinky a šperky',
          text: 'Licencované kolekce přenášejí odvážný, ženský styl značky do třpytivých doplňků.',
        },
      ],
    },
  ],

  'FILA': [
    {
      heading: '1911: Z italské Bielly',
      items: [
        {
          lead: 'Bratři Filové',
          text: 'Značka začínala jako textilní výroba v podhůří italských Alp; ve sportu prorazila v 70. letech.',
        },
        {
          lead: 'Éra Björna Borga',
          text: 'Tenisová legenda udělala z Fily ikonu sportovní elegance — pruhované logo znal celý svět.',
        },
      ],
    },
    {
      heading: 'Sport jako lifestyle',
      items: [
        {
          lead: 'Globální comeback',
          text: 'Streetwearová vlna vrátila Filu na výsluní; dnes je značka řízena z Jižní Koreje a licencované hodinky nesou její sportovní DNA.',
        },
      ],
    },
  ],

  'BEVERLY HILLS POLO CLUB': [
    {
      heading: '1982: Elegance póla',
      items: [
        {
          lead: 'Zrod v Los Angeles',
          text: 'Značka založená v roce 1982 spojila prestiž pólového sportu s nenuceným životním stylem Beverly Hills.',
        },
      ],
    },
    {
      heading: 'Globální lifestylová značka',
      items: [
        {
          lead: 'Dostupný vstup do světa sportovní elegance',
          text: 'Licenční kolekce oblečení, hodinek a doplňků dnes značku rozšířily do desítek zemí světa.',
        },
      ],
    },
  ],

  'ALVIERO MARTINI': [
    {
      heading: 'Mapa jako módní ikona',
      items: [
        {
          lead: 'Potisk Geo 1ª Classe',
          text: 'Italský návrhář Alviero Martini proslul na přelomu 80. a 90. let potiskem starodávné zeměpisné mapy, který se stal okamžitě rozpoznatelným symbolem cestovatelské elegance.',
        },
      ],
    },
    {
      heading: 'Od kabelek ke šperkům',
      items: [
        {
          lead: 'Cestovatelská DNA',
          text: 'Licencované šperky a doplňky rozvíjejí mapový motiv značky — pro ty, kdo nosí touhu po cestování s sebou.',
        },
      ],
    },
  ],

  'ZOPPINI': [
    {
      heading: '1925: Florentské kořeny',
      items: [
        {
          lead: 'Klenotnictví Serafina Zoppiniho',
          text: 'Kořeny značky sahají do florentského klenotnictví z roku 1925 — řemeslo se v rodině dědí po generace.',
        },
      ],
    },
    {
      heading: 'Průkopník ocelových šperků',
      items: [
        {
          lead: 'Fenomén 90. let',
          text: 'Zoppini patřil k prvním italským značkám ocelových šperků; modulární náramky „Feeling" se staly prodejním fenoménem.',
        },
        {
          lead: 'Kampaň s Helmutem Newtonem',
          text: 'Slavný fotograf nasnímal kampaň se sloganem „Chi si ama, osa" — kdo se miluje, ten se odváží.',
        },
      ],
    },
  ],

  'MANUEL ZED': [
    {
      heading: 'Florentské řemeslo',
      items: [
        {
          lead: 'Značka skupiny MPF',
          text: 'Manuel Zed patří florentské skupině MPF, jejíž kořeny sahají ke klenotnictví Serafina Zoppiniho z roku 1925.',
        },
      ],
    },
    {
      heading: 'Moderní bižuterie Made in Italy',
      items: [
        {
          lead: 'Extravagantní glamour',
          text: 'Nejmodernější značka skupiny tvoří módní šperky s výstředním, hravým stylem — vyráběné v Itálii a distribuované do celého světa.',
        },
      ],
    },
  ],

  'LA PETITE STORY': [
    {
      heading: 'Mladá značka Morellato Group',
      items: [
        {
          lead: 'Šperky, které vyprávějí příběhy',
          text: 'La Petite Story vznikla v rámci italské Morellato Group s myšlenkou vyprávět šperky malé i velké příběhy našich životů.',
        },
      ],
    },
    {
      heading: 'Pro nejmladší a milovníky zvířat',
      items: [
        {
          lead: 'Ocel a stříbro 925',
          text: 'Kolekce na témata přátelství, rodiny, lásky a zvířat — včetně řady Save The Planet věnované ohroženým druhům.',
        },
      ],
    },
  ],

  'FESTINA': [
    {
      heading: '1902: Švýcarské kořeny, španělské srdce',
      items: [
        {
          lead: '1902 – La Chaux-de-Fonds',
          text: 'Značka Festina vznikla ve švýcarské kolébce hodinářství; jméno pochází z latinského „festina lente" — spěchej pomalu.',
        },
        {
          lead: '1984 – Miguel Rodríguez',
          text: 'Španělský podnikatel značku koupil a vybudoval kolem ní Festina Group, do níž dnes patří i Lotus, Candino, Calypso či Jaguar.',
        },
      ],
    },
    {
      heading: 'Hodinky velkého sportu',
      items: [
        {
          lead: 'Ikona cyklistiky',
          text: 'Festina se proslavila jako dlouholetá oficiální časomíra Tour de France a sponzor profesionální cyklistiky.',
        },
        {
          lead: 'Dostupná kvalita',
          text: 'Chronografy, potápěčské modely i elegantní řady dělají z Festiny jednu z nejprodávanějších hodinkových značek Evropy.',
        },
      ],
    },
  ],

  'GANT': [
    {
      heading: '1949: Z New Havenu do celého světa',
      items: [
        {
          lead: 'Bernard Gantmacher',
          text: 'Značka GANT vznikla v univerzitním New Havenu jako košilářská manufaktura — její button-down košile se staly symbolem stylu amerických kampusů.',
        },
        {
          lead: 'American sportswear',
          text: 'GANT definoval „preppy" styl východního pobřeží: ležérní elegance inspirovaná univerzitním prostředím Ivy League.',
        },
      ],
    },
    {
      heading: 'Hodinky s východním pobřežím v DNA',
      items: [
        {
          lead: 'Licencované kolekce',
          text: 'Hodinky GANT přenášejí americkou sportovní eleganci na zápěstí — čistý design, ocel a kůže v duchu klasického sportswearu.',
        },
      ],
    },
  ],

  'DANIEL WELLINGTON': [
    {
      heading: '2011: Minimalistický fenomén ze Stockholmu',
      items: [
        {
          lead: 'Filip Tysander',
          text: 'Švédský podnikatel založil značku inspirovanou stylem britského gentlemana, který nosil hodinky na textilním NATO řemínku.',
        },
        {
          lead: 'Hodinky pro éru Instagramu',
          text: 'Daniel Wellington jako jedna z prvních hodinkových značek vyrostla téměř výhradně díky sociálním sítím a influencer marketingu.',
        },
      ],
    },
    {
      heading: 'Skandinávský minimalismus',
      items: [
        {
          lead: 'Tenké pouzdro, čistý ciferník',
          text: 'Ultratenké hodinky s vyměnitelnými řemínky se staly globálním bestsellerem a vstupní bránou do světa klasické elegance pro mladou generaci.',
        },
      ],
    },
  ],

  'MASERATI': [
    {
      heading: '1914: Trojzubec z Boloně',
      items: [
        {
          lead: 'Bratři Maseratiové',
          text: 'V Boloni vznikla automobilka, jejíž znak — Neptunův trojzubec z fontány na Piazza Maggiore — patří k nejslavnějším logům světa.',
        },
        {
          lead: 'Závodní legenda',
          text: 'Maserati psalo dějiny Grand Prix i luxusních gran turismo vozů a stalo se synonymem italské rychlosti a stylu.',
        },
      ],
    },
    {
      heading: 'Hodinky pod Morellato Group',
      items: [
        {
          lead: 'Italský design na zápěstí',
          text: 'Licencované hodinky Maserati vyrábí italská Morellato Group — výrazné chronografy s trojzubcem přenášejí automobilové DNA do hodinářství.',
        },
      ],
    },
  ],

  'SWISS ALPINE MILITARY': [
    {
      heading: 'Švýcarská odolnost by Grovana',
      items: [
        {
          lead: 'Zázemí manufaktury Grovana',
          text: 'Značku Swiss Alpine Military vyvíjí rodinná švýcarská hodinářka Grovana s kořeny sahajícími do roku 1924.',
        },
        {
          lead: 'Inspirace armádou a horami',
          text: 'Robustní pouzdra, vysoká voděodolnost a čitelné ciferníky vycházejí z požadavků na vojenské a outdoorové hodinky.',
        },
      ],
    },
    {
      heading: 'Swiss Made do terénu',
      items: [
        {
          lead: 'Hodinky do extrémních podmínek',
          text: 'Od pilotních chronografů po potápěčské modely — vše s certifikací Swiss Made a poctivou švýcarskou mechanikou za dostupnou cenu.',
        },
      ],
    },
  ],

  'ZEPPELIN': [
    {
      heading: 'Odkaz vzducholodí hraběte Zeppelina',
      items: [
        {
          lead: 'Legenda vzduchoplavby',
          text: 'Značka nese jméno hraběte Ferdinanda von Zeppelina, jehož doutníkové vzducholodě na počátku 20. století fascinovaly celý svět.',
        },
        {
          lead: 'Mnichovská PointTec',
          text: 'Hodinky Zeppelin vyrábí od 80. let německá rodinná firma PointTec — licence je poctou zlaté éře vzducholodí.',
        },
      ],
    },
    {
      heading: 'Retro elegance Made in Germany',
      items: [
        {
          lead: 'Styl 30. let',
          text: 'Klenuté sklíčko, art-deco číslice a jemné barvy ciferníků evokují palubní přístroje slavné LZ 127 Graf Zeppelin.',
        },
      ],
    },
  ],

  'BERING': [
    {
      heading: '2010: Inspirace arktickou krásou',
      items: [
        {
          lead: 'Dánský design',
          text: 'Značka BERING vznikla v Dánsku a jméno převzala od mořeplavce Vituse Beringa, který jako první proplul úžinou mezi Asií a Amerikou.',
        },
        {
          lead: '„Inspired by arctic beauty"',
          text: 'Čisté linie, chladné tóny a minimalismus inspirovaný nekonečným ledem Arktidy definují celou kolekci.',
        },
      ],
    },
    {
      heading: 'High-tech materiály',
      items: [
        {
          lead: 'Keramika a safírové sklo',
          text: 'BERING proslul ultratenkými hodinkami z high-tech keramiky a oceli se safírovým sklem — odolné materiály v severském designu.',
        },
      ],
    },
  ],

  'PHILIPP PLEIN': [
    {
      heading: '1998: Provokatér evropské módy',
      items: [
        {
          lead: 'Německý návrhář',
          text: 'Philipp Plein vybudoval z vlastního jména globální značku luxusní módy známou odvážným glamour stylem, lebkami a krystaly.',
        },
        {
          lead: 'Celebrity a velkolepé show',
          text: 'Přehlídky Philipp Plein patří k nejvýstřednějším událostem módního kalendáře a značku oblékají hvězdy hudby i sportu.',
        },
      ],
    },
    {
      heading: 'Hodinky pod Timex Group',
      items: [
        {
          lead: 'Licence od roku 2019',
          text: 'Hodinky Philipp Plein vyvíjí Timex Group — masivní pouzdra, výrazné logo a rebelský luxus pro ty, kdo se nebojí být vidět.',
        },
      ],
    },
  ],

  'MILLNER': [
    {
      heading: '2017: Barcelona',
      items: [
        {
          lead: 'Mladá značka minimalismu',
          text: 'Millner vznikl v Barceloně v roce 2017 a rychle si získal publikum minimalistickými hodinkami a šperky.',
        },
      ],
    },
    {
      heading: 'Styl pro novou generaci',
      items: [
        {
          lead: 'Čistý design',
          text: 'Jemné linie, mesh řemínky a dostupná elegance — značka vyrostlá na sociálních sítích.',
        },
      ],
    },
  ],

  'BULOVA': [
    {
      heading: '1875: Americká ikona s českými kořeny',
      items: [
        {
          lead: '1875 – Joseph Bulova v New Yorku',
          text: 'Přistěhovalec z českých Loun Joseph Bulova si otevřel klenotnictví na newyorské Maiden Lane — základ jedné z nejslavnějších amerických hodinářských značek.',
        },
        {
          lead: '1941 – První TV reklama historie',
          text: 'Vůbec prvním televizním reklamním spotem na světě byla 1. července 1941 desetivteřinová reklama Bulova před zápasem baseballové ligy.',
        },
      ],
    },
    {
      heading: 'Accutron a cesta na Měsíc',
      items: [
        {
          lead: '1960 – Ladičkový Accutron',
          text: 'Elektronický strojek Accutron byl nejpřesnějším hodinkovým strojkem své doby — Bulova technologie létaly i na palubách misí NASA.',
        },
        {
          lead: '1971 – Chronograf na Měsíci',
          text: 'Astronaut David Scott nosil při misi Apollo 15 na Měsíci osobní chronograf Bulova; odkazuje na něj dnešní řada Lunar Pilot.',
        },
        {
          lead: '2008 – Součást Citizen Group',
          text: 'Bulova patří do japonské skupiny Citizen a dál rozvíjí vysokofrekvenční quartz Precisionist i archivní retro kolekce.',
        },
      ],
    },
  ],

  'SWISS MILITARY HANOWA': [
    {
      heading: '1963: Hans Noll, Biel/Bienne',
      items: [
        {
          lead: '1963 – Založení Hanowa',
          text: 'Hans Noll založil firmu ve švýcarském hodinářském centru Biel/Bienne — jméno HANOWA vzniklo ze spojení HAns NOll WAtches.',
        },
        {
          lead: 'Vojenská inspirace',
          text: 'Řada Swiss Military Hanowa spojila armádní design s certifikací Swiss Made — odolné hodinky s červeným švýcarským křížem ve znaku.',
        },
      ],
    },
    {
      heading: 'Swiss Made do terénu i do města',
      items: [
        {
          lead: 'Postaveno na odolnosti',
          text: 'Robustní ocelová pouzdra, výrazně čitelné ciferníky a vysoká voděodolnost — výbava inspirovaná vojenskými požadavky pro každodenní nošení.',
        },
        {
          lead: 'Dostupné švýcarské hodinky',
          text: 'Značka prodává v desítkách zemí světa poctivé Swiss Made hodinky za cenu módních značek.',
        },
      ],
    },
  ],

  'FREDERIQUE CONSTANT': [
    {
      heading: '1988: Ženevská vize dostupného luxusu',
      items: [
        {
          lead: '1988 – Peter a Aletta Stasovi',
          text: 'Nizozemský manželský pár založil v Ženevě značku s misí „accessible luxury" — klasické švýcarské hodinářství za dosažitelnou cenu. První kolekce vyšla v roce 1992.',
        },
        {
          lead: '2004 – Vlastní manufakturní strojek',
          text: 'Kalibr Heart Beat Manufacture povýšil značku mezi výrobce s in-house strojky; manufaktura v ženevském Plan-les-Ouates jich od té doby vyvinula desítky.',
        },
      ],
    },
    {
      heading: 'Klasika i inovace',
      items: [
        {
          lead: '2015 – Horological Smartwatch',
          text: 'První švýcarské „hodinářské chytré hodinky" spojily klasický analogový ciferník s fitness funkcemi — bez displeje, jen s ručičkami.',
        },
        {
          lead: '2016 – Součást Citizen Group',
          text: 'Značka se připojila k japonské skupině Citizen, věrná zůstává ženevské manufaktuře a řadám Classics, Slimline či Highlife.',
        },
      ],
    },
  ],
};
