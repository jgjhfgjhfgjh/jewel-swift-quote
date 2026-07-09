/**
 * Curated catalog of the prestige watch brands Swelt sources on demand.
 *
 * Swelt's own DB (search_products RPC) only holds the fashion-tier catalog, so
 * the prestige segment lives here: this dataset powers the /prestige search
 * autocomplete, the houses carousel and the on-demand product catalog grid.
 *
 * The brand list is fixed to the houses the supplier can actually source
 * (agreed 2026-07): IWC, Omega, Baume & Mercier, Bvlgari, Breitling, Cartier,
 * Girard-Perregaux, Jaeger-LeCoultre, Montblanc, Mido, Longines, Locman,
 * TAG Heuer, Tissot, Ulysse Nardin.
 *
 * Specs come from the brands' public product pages. No prices — everything is
 * quoted per inquiry. `image` is an optional product photo URL (official brand
 * imagery); when absent the UI falls back to the brand mark.
 */

/**
 * Domains for which the Brandfetch CDN returns its own placeholder wordmark
 * (an identical ~8 kB image) instead of a real logo. For these houses we render
 * a text wordmark instead — see HouseLogo.
 */
export const LOGO_UNAVAILABLE = new Set<string>([]);

export function houseHasLogo(domain: string): boolean {
  return !LOGO_UNAVAILABLE.has(domain);
}

export interface LuxuryModelSpec {
  model: string;
  collection?: string;
  /** Official reference number, when known. */
  reference?: string;
  /** Official product photo URL (transparent/white bg). Optional. */
  image?: string;
  /** Key specifications shown on the product card and in the detail modal. */
  params?: Record<string, string>;
  /** One-line description for the detail modal. */
  desc?: string;
}

export interface LuxuryHouse {
  name: string;
  domain: string;
  models: LuxuryModelSpec[];
}

export const LUXURY_HOUSES: LuxuryHouse[] = [
  {
    name: 'IWC Schaffhausen', domain: 'iwc.com',
    models: [
      {
        model: 'Portugieser Chronograph', collection: 'Portugieser',
        params: { 'Průměr pouzdra': '41 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, manufakturní kalibr 69355', 'Vodotěsnost': '3 bar', 'Sklíčko': 'Safírové', 'Řemínek': 'Aligátoří kůže' },
        desc: 'Ikonický chronograf s čistým číselníkem a manufakturním kalibrem řady 69000.',
      },
      {
        model: "Pilot's Watch Mark XX", collection: "Pilot's Watches",
        params: { 'Průměr pouzdra': '40 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, kalibr 32111', 'Rezerva chodu': '120 hodin', 'Vodotěsnost': '10 bar', 'Sklíčko': 'Safírové' },
        desc: 'Moderní pokračovatel legendárních navigačních hodinek Mark 11.',
      },
      {
        model: 'Portofino Automatic', collection: 'Portofino',
        params: { 'Průměr pouzdra': '40 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický', 'Vodotěsnost': '5 bar', 'Sklíčko': 'Safírové', 'Řemínek': 'Telecí kůže' },
        desc: 'Elegantní společenský model inspirovaný italskou riviérou.',
      },
      {
        model: "Big Pilot's Watch 43", collection: "Pilot's Watches",
        params: { 'Průměr pouzdra': '43 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, manufakturní kalibr 82100', 'Rezerva chodu': '60 hodin', 'Vodotěsnost': '10 bar', 'Sklíčko': 'Safírové' },
        desc: 'Velký pilot v přístupnějším 43mm pouzdru s charakteristickou kuželovou korunkou.',
      },
    ],
  },
  {
    name: 'Omega', domain: 'omegawatches.com',
    models: [
      {
        model: 'Speedmaster Moonwatch Professional', collection: 'Speedmaster',
        params: { 'Průměr pouzdra': '42 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Ruční nátah, Co-Axial Master Chronometer 3861', 'Vodotěsnost': '5 bar', 'Sklíčko': 'Hesalitové / safírové', 'Certifikace': 'Master Chronometer (METAS)' },
        desc: 'Legendární „Moonwatch" — první hodinky na Měsíci, dnes s kalibrem 3861.',
      },
      {
        model: 'Seamaster Diver 300M', collection: 'Seamaster',
        params: { 'Průměr pouzdra': '42 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, Co-Axial Master Chronometer 8800', 'Vodotěsnost': '300 m', 'Sklíčko': 'Safírové', 'Luneta': 'Keramická, potápěčská' },
        desc: 'Profesionální diver s keramickým číselníkem a heliovým ventilem.',
      },
      {
        model: 'Aqua Terra 150M', collection: 'Seamaster',
        params: { 'Průměr pouzdra': '41 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, Co-Axial Master Chronometer 8900', 'Vodotěsnost': '150 m', 'Sklíčko': 'Safírové', 'Číselník': '„Teak" vertikální rýhování' },
        desc: 'Univerzální sportovní elegance s antimagnetickým Master Chronometer strojkem.',
      },
      {
        model: 'Constellation', collection: 'Constellation',
        params: { 'Průměr pouzdra': '39 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, Co-Axial Master Chronometer', 'Vodotěsnost': '5 bar', 'Sklíčko': 'Safírové', 'Charakteristika': 'Ikonické „drápky" na lunetě' },
        desc: 'Symbol přesnosti Omegy s nezaměnitelnými drápky a integrovaným tahem.',
      },
    ],
  },
  {
    name: 'Baume & Mercier', domain: 'baume-et-mercier.com',
    models: [
      {
        model: 'Riviera Automatic', collection: 'Riviera',
        params: { 'Průměr pouzdra': '42 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický', 'Vodotěsnost': '10 ATM', 'Sklíčko': 'Safírové', 'Charakteristika': 'Dvanáctihranná luneta' },
        desc: 'Sportovně-elegantní ikona sedmdesátých let s dvanáctihrannou lunetou.',
      },
      {
        model: 'Clifton Baumatic', collection: 'Clifton',
        params: { 'Průměr pouzdra': '40 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, Baumatic BM13', 'Rezerva chodu': '5 dní', 'Vodotěsnost': '5 ATM', 'Certifikace': 'Chronometr (COSC)' },
        desc: 'Klasická eleganc s manufakturním strojkem Baumatic a pětidenní rezervou.',
      },
      {
        model: 'Classima', collection: 'Classima',
        params: { 'Průměr pouzdra': '42 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický', 'Vodotěsnost': '5 ATM', 'Sklíčko': 'Safírové', 'Řemínek': 'Telecí kůže' },
        desc: 'Čistá klasika pro každodenní nošení.',
      },
      {
        model: 'Hampton', collection: 'Hampton',
        params: { 'Tvar pouzdra': 'Obdélníkové', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Quartz / automatický dle verze', 'Vodotěsnost': '5 ATM', 'Sklíčko': 'Safírové' },
        desc: 'Art-deco obdélníková klasika inspirovaná dvacátými léty.',
      },
    ],
  },
  {
    name: 'Bvlgari', domain: 'bulgari.com',
    models: [
      {
        model: 'Octo Finissimo Automatic', collection: 'Octo Finissimo',
        params: { 'Průměr pouzdra': '40 mm', 'Materiál pouzdra': 'Titan / ocel dle verze', 'Strojek': 'Automatický, ultratenký BVL 138', 'Výška strojku': '2,23 mm', 'Vodotěsnost': '100 m (ocel)', 'Sklíčko': 'Safírové' },
        desc: 'Rekordně tenká architektonická ikona současného hodinářství.',
      },
      {
        model: 'Bvlgari Bvlgari', collection: 'Bvlgari Bvlgari',
        params: { 'Průměr pouzdra': '41 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický', 'Vodotěsnost': '50 m', 'Charakteristika': 'Logo gravírované na lunetě' },
        desc: 'Římská klasika s dvojitým logem na lunetě podle návrhu Gérald Genty.',
      },
      {
        model: 'Serpenti Seduttori', collection: 'Serpenti',
        params: { 'Průměr pouzdra': '33 mm', 'Materiál pouzdra': 'Nerezová ocel / zlato dle verze', 'Strojek': 'Quartz', 'Sklíčko': 'Safírové', 'Charakteristika': 'Hadí motiv, drop-shape pouzdro' },
        desc: 'Šperkařská ikona ve tvaru hadí hlavy.',
      },
      {
        model: 'Octo Roma', collection: 'Octo',
        params: { 'Průměr pouzdra': '41 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický', 'Vodotěsnost': '100 m', 'Sklíčko': 'Safírové' },
        desc: 'Osmiúhelníková architektura Octo v univerzálnějším provedení.',
      },
    ],
  },
  {
    name: 'Breitling', domain: 'breitling.com',
    models: [
      {
        model: 'Navitimer B01 Chronograph 43', collection: 'Navitimer',
        reference: 'AB0138211B1P1',
        image: 'https://www-breitling.eu.saleor.cloud/media/thumbnails/products/ab0138211b1p1-soldier_5ba1fffb_thumbnail_1024.webp',
        params: { 'Průměr pouzdra': '43 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, manufakturní B01', 'Rezerva chodu': '70 hodin', 'Vodotěsnost': '3 bar', 'Certifikace': 'Chronometr (COSC)', 'Charakteristika': 'Logaritmické pravítko' },
        desc: 'Pilotní legenda s kruhovým logaritmickým pravítkem a kalibrem B01.',
      },
      {
        model: 'Chronomat B01 Chronograph 42', collection: 'Chronomat',
        reference: 'AB0158101A1A1',
        image: 'https://www-breitling.eu.saleor.cloud/media/thumbnails/products/ab0158101a1a1-soldier_f505bb57_thumbnail_1024.webp',
        params: { 'Průměr pouzdra': '42 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, manufakturní B01', 'Rezerva chodu': '70 hodin', 'Vodotěsnost': '200 m', 'Tah': 'Rouleaux ocelový' },
        desc: 'Sportovní all-rounder s ikonickým tahem Rouleaux.',
      },
      {
        model: 'Superocean Automatic 44', collection: 'Superocean',
        reference: 'A17376211B1A1',
        image: 'https://www-breitling.eu.saleor.cloud/media/thumbnails/products/a17376211b1a1-soldier_8027a4ed_thumbnail_1024.webp',
        params: { 'Průměr pouzdra': '44 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický', 'Vodotěsnost': '300 m', 'Luneta': 'Jednosměrná otočná', 'Sklíčko': 'Safírové' },
        desc: 'Moderní diver s výrazným barevným provedením.',
      },
      {
        model: 'Premier B01 Chronograph 42', collection: 'Premier',
        reference: 'AB0145171C1P2',
        image: 'https://www-breitling.eu.saleor.cloud/media/thumbnails/products/ab0145171c1p2-soldier_a4d2f949_thumbnail_1024.webp',
        params: { 'Průměr pouzdra': '42 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, manufakturní B01', 'Rezerva chodu': '70 hodin', 'Vodotěsnost': '100 m', 'Sklíčko': 'Safírové' },
        desc: 'Elegantní chronograf navazující na styl čtyřicátých let.',
      },
    ],
  },
  {
    name: 'Cartier', domain: 'cartier.com',
    models: [
      {
        model: 'Santos de Cartier', collection: 'Santos',
        image: 'https://www.cartier.com/dam/rcq/car/20/59/11/8/2059118.jpeg.transform.carprodcard.png',
        params: { 'Rozměr pouzdra': 'Large, cca 39,8 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, kalibr 1847 MC', 'Vodotěsnost': '100 m', 'Charakteristika': 'Viditelné šrouby, QuickSwitch/SmartLink', 'Sklíčko': 'Safírové' },
        desc: 'První pánské náramkové hodinky světa v moderním provedení.',
      },
      {
        model: 'Tank Must', collection: 'Tank',
        image: 'https://www.cartier.com/dam/rcq/car/21/82/25/8/2182258.jpeg.transform.carprodcard.jpeg',
        params: { 'Tvar pouzdra': 'Obdélníkové', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Quartz / SolarBeat dle verze', 'Vodotěsnost': '3 bar', 'Sklíčko': 'Safírové', 'Řemínek': 'Kůže' },
        desc: 'Nesmrtelný Tank v přístupné řadě Must.',
      },
      {
        model: 'Ballon Bleu de Cartier', collection: 'Ballon Bleu',
        image: 'https://www.cartier.com/dam/rcq/car/20/59/09/3/2059093.jpeg.transform.carprodcard.png',
        params: { 'Průměr pouzdra': '36 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický', 'Vodotěsnost': '3 bar', 'Charakteristika': 'Korunka s modrým kabošonem', 'Sklíčko': 'Safírové' },
        desc: 'Oblé pouzdro s ikonickou plovoucí korunkou s kabošonem.',
      },
    ],
  },
  {
    name: 'Girard-Perregaux', domain: 'girard-perregaux.com',
    models: [
      {
        model: 'Laureato 42 mm', collection: 'Laureato',
        reference: '81010-11-3153-1CM',
        image: 'https://api.girard-perregaux.com/media/catalog/product/8/1/81010-11-3153-1CM-hero-5edf8c.png',
        params: { 'Průměr pouzdra': '42 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, manufakturní GP01800', 'Vodotěsnost': '100 m', 'Charakteristika': 'Osmiúhelníková luneta, integrovaný tah', 'Číselník': 'Clous de Paris' },
        desc: 'Integrovaná sportovní elegance z roku 1975 s číselníkem Clous de Paris.',
      },
      {
        model: 'Laureato Chronograph 42', collection: 'Laureato',
        params: { 'Průměr pouzdra': '42 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický chronograf, manufakturní', 'Vodotěsnost': '100 m', 'Sklíčko': 'Safírové' },
        desc: 'Chronografická verze ikonického Laureata.',
      },
      {
        model: 'Free Bridge', collection: 'Bridges',
        reference: '82000-11-631-FA6A',
        image: 'https://api.girard-perregaux.com/media/catalog/product/8/2/82000-11-631-FA6A-hero-v2-ae94e0.png',
        params: { 'Průměr pouzdra': '44 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, manufakturní', 'Charakteristika': 'Ikonický „Neo Bridge" most', 'Sklíčko': 'Safírové' },
        desc: 'Moderní interpretace legendárních mostů Girard-Perregaux.',
      },
      {
        model: '1966', collection: '1966',
        reference: '49523-11-171-11A',
        image: 'https://api.girard-perregaux.com/media/catalog/product/4/9/49523-11-171-11A-hero-dc97f3.png',
        params: { 'Průměr pouzdra': '36 mm', 'Materiál pouzdra': 'Nerezová ocel / zlato dle verze', 'Strojek': 'Automatický, manufakturní', 'Vodotěsnost': '30 m', 'Sklíčko': 'Safírové' },
        desc: 'Ryzí haute-horlogerie klasika s tenkým pouzdrem.',
      },
    ],
  },
  {
    name: 'Jaeger-LeCoultre', domain: 'jaeger-lecoultre.com',
    models: [
      {
        model: 'Reverso Classic', collection: 'Reverso',
        reference: 'Q3878520',
        image: 'https://img.jaeger-lecoultre.com/open-graph-boxed-image-1/o-dpr-2/10e6fa240ddef91388ea13963c3e2c6c5f3ac4c5.jpg',
        params: { 'Tvar pouzdra': 'Obdélníkové, otočné', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Ruční nátah, manufakturní', 'Vodotěsnost': '3 bar', 'Charakteristika': 'Otočné pouzdro z roku 1931', 'Sklíčko': 'Safírové' },
        desc: 'Art-deco legenda s otočným pouzdrem původně pro hráče póla.',
      },
      {
        model: 'Master Control Date', collection: 'Master Control',
        reference: 'Q4018421',
        image: 'https://img.jaeger-lecoultre.com/open-graph-boxed-image-1/o-dpr-2/93f97ea46f4cac0440395806a0a4efaa121d7d57.jpg',
        params: { 'Průměr pouzdra': '40 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, kalibr 899', 'Rezerva chodu': '70 hodin', 'Vodotěsnost': '5 bar', 'Sklíčko': 'Safírové' },
        desc: 'Esence kulatých hodinek Velké manufaktury z Vallée de Joux.',
      },
      {
        model: 'Polaris Date', collection: 'Polaris',
        reference: 'Q9068650',
        image: 'https://img.jaeger-lecoultre.com/open-graph-boxed-image-1/o-dpr-2/384071de7fce41ebc37e5a18bd9500971d5f3adb.jpg',
        params: { 'Průměr pouzdra': '42 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, manufakturní', 'Vodotěsnost': '200 m', 'Charakteristika': 'Vnitřní otočná luneta', 'Sklíčko': 'Safírové' },
        desc: 'Sportovní elegance inspirovaná potápěčskou Memovox Polaris 1968.',
      },
      {
        model: 'Master Ultra Thin Moon', collection: 'Master Ultra Thin',
        reference: 'Q1368430',
        image: 'https://img.jaeger-lecoultre.com/open-graph-boxed-image-1/o-dpr-2/4fc048262e530e298d820b3a006bafbb9c315bad.jpg',
        params: { 'Průměr pouzdra': '39 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, kalibr 925/1', 'Komplikace': 'Fáze měsíce, datum', 'Vodotěsnost': '5 bar' },
        desc: 'Ultratenká klasika s poetickou fází měsíce.',
      },
    ],
  },
  {
    name: 'Montblanc', domain: 'montblanc.com',
    models: [
      {
        model: '1858 Automatic', collection: '1858',
        params: { 'Průměr pouzdra': '40 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický', 'Vodotěsnost': '100 m', 'Charakteristika': 'Vintage vojenský styl Minerva', 'Sklíčko': 'Safírové' },
        desc: 'Horský duch legendárních vojenských hodinek Minerva.',
      },
      {
        model: '1858 Geosphere', collection: '1858',
        params: { 'Průměr pouzdra': '42 mm', 'Materiál pouzdra': 'Nerezová ocel / bronz dle verze', 'Strojek': 'Automatický, worldtime komplikace', 'Komplikace': 'Dvě otočné polokoule, druhé pásmo', 'Vodotěsnost': '100 m' },
        desc: 'Worldtimer se dvěma rotujícími glóby pro horolezecké výpravy.',
      },
      {
        model: 'Star Legacy Automatic Date', collection: 'Star Legacy',
        params: { 'Průměr pouzdra': '39 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický', 'Vodotěsnost': '5 bar', 'Číselník': 'Guilloché, exploding star', 'Sklíčko': 'Safírové' },
        desc: 'Klasická elegance inspirovaná minervskými kapesními hodinkami.',
      },
      {
        model: 'Heritage Automatic', collection: 'Heritage',
        params: { 'Průměr pouzdra': '40 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický', 'Vodotěsnost': '5 bar', 'Sklíčko': 'Safírové', 'Řemínek': 'Sfumato telecí kůže' },
        desc: 'Padesátková elegance s lososovými i stříbrnými číselníky.',
      },
    ],
  },
  {
    name: 'Mido', domain: 'midowatches.com',
    models: [
      {
        model: 'Ocean Star 200', collection: 'Ocean Star',
        params: { 'Průměr pouzdra': '42,5 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, kalibr 80', 'Rezerva chodu': '80 hodin', 'Vodotěsnost': '200 m', 'Luneta': 'Jednosměrná otočná' },
        desc: 'Poctivý diver s 80hodinovou rezervou chodu.',
      },
      {
        model: 'Baroncelli Signature', collection: 'Baroncelli',
        params: { 'Průměr pouzdra': '39 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, kalibr 80', 'Rezerva chodu': '80 hodin', 'Vodotěsnost': '5 bar', 'Sklíčko': 'Safírové' },
        desc: 'Tenká klasická elegance rodiny Baroncelli.',
      },
      {
        model: 'Multifort M', collection: 'Multifort',
        params: { 'Průměr pouzdra': '42 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, kalibr 80', 'Rezerva chodu': '80 hodin', 'Vodotěsnost': '100 m', 'Sklíčko': 'Safírové' },
        desc: 'Robustní sportovní klasika inspirovaná mostem v Sydney.',
      },
      {
        model: 'Commander Chronometer', collection: 'Commander',
        params: { 'Průměr pouzdra': '40 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, certifikovaný chronometr', 'Certifikace': 'COSC', 'Vodotěsnost': '5 bar', 'Charakteristika': 'Jednodílné pouzdro' },
        desc: 'Ikona z roku 1959 s certifikací chronometru.',
      },
    ],
  },
  {
    name: 'Longines', domain: 'longines.com',
    models: [
      {
        model: 'Master Collection', collection: 'Master Collection',
        params: { 'Průměr pouzdra': '40 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, L888', 'Rezerva chodu': '72 hodin', 'Vodotěsnost': '3 bar', 'Sklíčko': 'Safírové' },
        desc: 'Vlajková klasika s ječmennými (barleycorn) číselníky.',
      },
      {
        model: 'HydroConquest', collection: 'HydroConquest',
        params: { 'Průměr pouzdra': '41 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, L888', 'Rezerva chodu': '72 hodin', 'Vodotěsnost': '300 m', 'Luneta': 'Keramická otočná' },
        desc: 'Dostupný švýcarský diver s keramickou lunetou.',
      },
      {
        model: 'Spirit Zulu Time', collection: 'Spirit',
        params: { 'Průměr pouzdra': '42 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický GMT, L844.4', 'Rezerva chodu': '72 hodin', 'Certifikace': 'Chronometr (COSC)', 'Vodotěsnost': '10 bar' },
        desc: 'Cestovatelský GMT chronometr v pilotním duchu.',
      },
      {
        model: 'DolceVita', collection: 'DolceVita',
        params: { 'Tvar pouzdra': 'Obdélníkové', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Quartz / automatický dle verze', 'Vodotěsnost': '3 bar', 'Sklíčko': 'Safírové' },
        desc: 'Obdélníková elegance sladkého života.',
      },
    ],
  },
  {
    name: 'Locman', domain: 'locman.it',
    models: [
      {
        model: 'Montecristo', collection: 'Montecristo',
        image: 'https://cdn.shopify.com/s/files/1/0960/2783/6749/files/510-nero-arancione-nero.png',
        params: { 'Průměr pouzdra': '44 mm', 'Materiál pouzdra': 'Ocel a titan', 'Strojek': 'Automatický', 'Vodotěsnost': '100 m', 'Sklíčko': 'Safírové', 'Původ': 'Vyrobeno v Itálii (Isola d’Elba)' },
        desc: 'Italská sportovní klasika z ostrova Elba v oceli a titanu.',
      },
      {
        model: 'Stealth Titanio', collection: 'Stealth',
        image: 'https://cdn.shopify.com/s/files/1/0960/2783/6749/files/stealth_titanio_green.webp',
        params: { 'Průměr pouzdra': 'cca 43 mm', 'Materiál pouzdra': 'Titan', 'Strojek': 'Automatický / quartz dle verze', 'Vodotěsnost': '100 m', 'Charakteristika': 'Odlehčený sportovní design' },
        desc: 'Lehké sportovní hodinky s výrazným italským designem.',
      },
      {
        model: 'Mare 300 MT', collection: 'Mare',
        image: 'https://cdn.shopify.com/s/files/1/0960/2783/6749/files/mare300mt_verde.png',
        params: { 'Průměr pouzdra': 'cca 44 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický / quartz dle verze', 'Vodotěsnost': '300 m', 'Sklíčko': 'Safírové' },
        desc: 'Námořní potápěčský model inspirovaný Středomořím.',
      },
    ],
  },
  {
    name: 'TAG Heuer', domain: 'tagheuer.com',
    models: [
      {
        model: 'Carrera Chronograph', collection: 'Carrera',
        params: { 'Průměr pouzdra': '39 mm („Glassbox")', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický chronograf, kalibr TH20-00', 'Rezerva chodu': '80 hodin', 'Vodotěsnost': '100 m', 'Sklíčko': 'Klenuté safírové' },
        desc: 'Závodní legenda z roku 1963 v moderním „glassbox" provedení.',
      },
      {
        model: 'Monaco Chronograph', collection: 'Monaco',
        params: { 'Rozměr pouzdra': '39 mm, čtvercové', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický chronograf, Heuer 02', 'Rezerva chodu': '80 hodin', 'Vodotěsnost': '100 m', 'Charakteristika': 'Ikona Steva McQueena' },
        desc: 'První čtvercový automatický chronograf, proslavený Stevem McQueenem.',
      },
      {
        model: 'Aquaracer Professional 300', collection: 'Aquaracer',
        params: { 'Průměr pouzdra': '42 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, Calibre 5', 'Vodotěsnost': '300 m', 'Luneta': 'Keramická otočná', 'Sklíčko': 'Safírové' },
        desc: 'Profesionální diver pro každodenní nošení.',
      },
      {
        model: 'Formula 1', collection: 'Formula 1',
        params: { 'Průměr pouzdra': '43 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Quartz chronograf', 'Vodotěsnost': '200 m', 'Luneta': 'Hliníková otočná' },
        desc: 'Sportovní vstup do světa TAG Heuer inspirovaný F1.',
      },
    ],
  },
  {
    name: 'Tissot', domain: 'tissotwatches.com',
    models: [
      {
        model: 'PRX Powermatic 80', collection: 'PRX',
        reference: 'T137.407.11.041.00',
        image: 'https://www.tissotwatches.com/on/demandware.static/-/Sites-Tissot-Catalogue/default/dw95c4331d/product-pictures/63f42767-a9f5-4cdd-b952-8ea7b82b7e0c_T137-407-11-041-00_shadow.png',
        params: { 'Průměr pouzdra': '40 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, Powermatic 80', 'Rezerva chodu': '80 hodin', 'Vodotěsnost': '100 m', 'Charakteristika': 'Integrovaný tah, waffle číselník' },
        desc: 'Retro-integrovaný bestseller sedmdesátých let s moderním strojkem.',
      },
      {
        model: 'Seastar 1000 Powermatic 80', collection: 'Seastar',
        reference: 'T120.407.11.041.03',
        image: 'https://www.tissotwatches.com/on/demandware.static/-/Sites-Tissot-Catalogue/default/dw4069bb6e/product-pictures/f058c2a6-662d-4797-8a9a-dc7e1c174907_T120-407-11-041-03_shadow.png',
        params: { 'Průměr pouzdra': '43 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, Powermatic 80', 'Rezerva chodu': '80 hodin', 'Vodotěsnost': '300 m', 'Luneta': 'Keramická otočná' },
        desc: 'Výkonný diver s keramickou lunetou.',
      },
      {
        model: 'Gentleman Powermatic 80 Silicium', collection: 'Gentleman',
        reference: 'T127.407.11.041.01',
        image: 'https://www.tissotwatches.com/on/demandware.static/-/Sites-Tissot-Catalogue/default/dwf9b2cb5f/product-pictures/d82c3b73-ffcb-4720-a219-ae68148eaadb_T127-407-11-041-01_shadow.png',
        params: { 'Průměr pouzdra': '40 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, Powermatic 80 se silikonovým vláskem', 'Rezerva chodu': '80 hodin', 'Vodotěsnost': '100 m', 'Sklíčko': 'Safírové' },
        desc: 'Univerzální elegance s antimagnetickým silikonovým vláskem.',
      },
      {
        model: 'Le Locle Powermatic 80', collection: 'Le Locle',
        reference: 'T006.407.11.033.00',
        image: 'https://www.tissotwatches.com/on/demandware.static/-/Sites-Tissot-Catalogue/default/dw1af9d0f4/product-pictures/8c99426a-3edc-4e15-ae24-ef8e49f73757_T006-407-11-033-00_shadow.png',
        params: { 'Průměr pouzdra': '39,3 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, Powermatic 80', 'Rezerva chodu': '80 hodin', 'Vodotěsnost': '3 bar', 'Číselník': 'Guilloché' },
        desc: 'Klasika pojmenovaná po rodném městě značky.',
      },
    ],
  },
  {
    name: 'Ulysse Nardin', domain: 'ulysse-nardin.com',
    models: [
      {
        model: 'Marine Torpilleur', collection: 'Marine',
        reference: '1182-310/40',
        image: 'https://api.ulysse-nardin.com/media/catalog/product/1/1/1182-310-40-hero-b61c01.png',
        params: { 'Průměr pouzdra': '42 mm', 'Materiál pouzdra': 'Nerezová ocel', 'Strojek': 'Automatický, manufakturní UN-118', 'Rezerva chodu': '60 hodin', 'Certifikace': 'Chronometr (COSC)', 'Vodotěsnost': '50 m' },
        desc: 'Námořní chronometr navazující na palubní přístroje značky.',
      },
      {
        model: 'Diver 44', collection: 'Diver',
        reference: '1183-170-3A/0A',
        image: 'https://api.ulysse-nardin.com/media/catalog/product/1/1/1183-170-3A-0A-hero-cb9e38.png',
        params: { 'Průměr pouzdra': '44 mm', 'Materiál pouzdra': 'Nerezová ocel / titan dle verze', 'Strojek': 'Automatický, manufakturní', 'Vodotěsnost': '300 m', 'Luneta': 'Jednosměrná otočná', 'Sklíčko': 'Safírové' },
        desc: 'Profesionální diver s manufakturním strojkem.',
      },
      {
        model: 'Freak X', collection: 'Freak',
        reference: '2303-270-4A/1A',
        image: 'https://api.ulysse-nardin.com/media/catalog/product/2/3/2303-270-4A-1A-hero-813bfd.png',
        params: { 'Průměr pouzdra': '43 mm', 'Materiál pouzdra': 'Titan / carbonium dle verze', 'Strojek': 'Automatický, UN-230 „létající karusel"', 'Charakteristika': 'Bez číselníku a ručiček — čas ukazuje strojek', 'Rezerva chodu': '72 hodin' },
        desc: 'Avantgardní ikona, kde čas ukazuje samotný otáčející se strojek.',
      },
    ],
  },
];

/* ── Merge in models harvested from the brands' official sites ──
 * luxuryHarvest.json is generated from official collection pages / sitemaps
 * (name, collection, reference, official product image). Hand-curated models
 * above keep their spec tables; harvested entries extend the range. When a
 * harvested name extends a hand-curated one (e.g. "1858 Geosphere 0 Oxygen"
 * vs "1858 Geosphere"), it only fills the missing image/reference. */
import harvestJson from './luxuryHarvest.json';

interface HarvestEntry { brand: string; model: string; collection?: string; reference?: string; image: string }

{
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const byName = new Map(LUXURY_HOUSES.map((h) => [h.name, h]));
  for (const e of harvestJson as HarvestEntry[]) {
    const house = byName.get(e.brand);
    if (!house) continue;
    const en = norm(e.model);
    const match = house.models.find((m) => {
      const mn = norm(m.model);
      return mn === en || en.startsWith(mn + ' ') || mn.startsWith(en + ' ');
    });
    if (match) {
      if (!match.image) match.image = e.image;
      if (!match.reference && e.reference) match.reference = e.reference;
    } else {
      house.models.push({ model: e.model, collection: e.collection, reference: e.reference, image: e.image });
    }
  }
}

export interface LuxuryModel {
  /** Stable id, e.g. "omega-speedmaster-moonwatch-professional". */
  id: string;
  brand: string;
  domain: string;
  model: string;
  collection?: string;
  reference?: string;
  image?: string;
  params?: Record<string, string>;
  desc?: string;
  /** Lowercase haystack for fuzzy matching. */
  search: string;
}

export function luxuryModelId(brand: string, model: string): string {
  return `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Flattened model list for the autocomplete and the catalog grid. */
export const LUXURY_MODELS: LuxuryModel[] = LUXURY_HOUSES.flatMap((house) =>
  house.models.map((m) => ({
    id: luxuryModelId(house.name, m.model),
    brand: house.name,
    domain: house.domain,
    model: m.model,
    collection: m.collection,
    reference: m.reference,
    image: m.image,
    params: m.params,
    desc: m.desc,
    search: `${house.name} ${m.collection ?? ''} ${m.model}`.toLowerCase().replace(/\s+/g, ' ').trim(),
  })),
);

/**
 * Rank curated models against a free-text query. Brand-prefix and word-start
 * matches rank above mid-string matches so "sub" surfaces the right model first.
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
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((s) => s.m);
}
