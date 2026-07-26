export interface Brand {
  name: string;
  domain: string;
}

export const BRANDS: Brand[] = [
  { name: 'Viceroy', domain: 'viceroy.es' },
  { name: 'Breil', domain: 'breil.com' },
  { name: 'Pierre Lannier', domain: 'pierre-lannier.fr' },
  { name: 'Just Cavalli', domain: 'justcavalli.com' },
  { name: 'Pandora', domain: 'pandora.net' },
  { name: 'Roberto Cavalli', domain: 'robertocavalli.com' },
  { name: 'Mark Maddox', domain: 'markmaddox.com' },
  { name: 'Tommy Hilfiger', domain: 'tommy.com' },
  { name: 'Swarovski', domain: 'swarovski.com' },
  { name: 'Casio', domain: 'casio.com' },
  { name: 'Guess', domain: 'guess.com' },
  { name: 'Hip Hop', domain: 'hiphopwatches.it' },
  { name: 'Versace', domain: 'versace.com' },
  { name: 'Hugo Boss', domain: 'hugoboss.com' },
  { name: 'Calvin Klein', domain: 'calvinklein.com' },
  { name: 'Invicta', domain: 'invictawatch.com' },
  { name: 'Sector', domain: 'sectornolimits.com' },
  { name: 'Esprit', domain: 'esprit.com' },
  { name: 'DKNY', domain: 'dkny.com' },
  { name: 'Timex', domain: 'timex.com' },
  { name: 'Millner', domain: 'millnerwatches.com' },
  { name: 'Tissot', domain: 'tissot.ch' },
  { name: 'La Petite Story', domain: 'lapetitestory.com' },
  { name: 'Nautica', domain: 'nautica.com' },
  { name: 'Lorus', domain: 'lorus-watches.com' },
  { name: 'Disney', domain: 'disney.com' },
  { name: 'Morellato', domain: 'morellato.com' },
  { name: 'Beverly Hills Polo Club', domain: 'bhpoloclub.com' },
  { name: 'Versus Versace', domain: 'versusversace.com' },
  { name: 'Alviero Martini', domain: 'alvieromartini.it' },
  { name: 'Chronostar', domain: 'chronostar.com' },
  { name: 'Citizen', domain: 'citizenwatch.com' },
  { name: 'Emporio Armani', domain: 'armani.com' },
  // Značky, které do katalogu vstupují z DEAL dávek (Fossil Group licence) —
  // bez nich zůstávaly dlaždice v /deals bez loga.
  { name: 'Armani', domain: 'armani.com' },
  { name: 'Armani Exchange', domain: 'armaniexchange.com' },
  { name: 'Diesel', domain: 'diesel.com' },
  { name: 'Skagen', domain: 'skagen.com' },
  { name: 'Q&Q', domain: 'qq-watches.com' },
  { name: 'Levien', domain: 'levien.cz' },
  { name: 'Swatch', domain: 'swatch.com' },
  { name: 'Lacoste', domain: 'lacoste.com' },
  { name: 'Manuel Zed', domain: 'manuelzed.com' },
  { name: 'Police', domain: 'policelifestyle.com' },
  { name: 'Fossil', domain: 'fossil.com' },
  { name: 'Mana', domain: 'manajewels.com' },
  { name: 'Hacker', domain: 'hackerwatches.com' },
  { name: 'Miss Sixty', domain: 'misssixty.com' },
  { name: 'Zoppini', domain: 'zoppinistore.com' },
  { name: 'Moschino', domain: 'moschino.com' },
  { name: 'Michael Kors', domain: 'michaelkors.com' },
  { name: 'Cerruti 1881', domain: 'cerruti1881.com' },
  { name: 'Fila', domain: 'fila.com' },
  { name: 'Festina', domain: 'festina.com' },
  { name: 'GANT', domain: 'gant.com' },
  { name: 'Daniel Wellington', domain: 'danielwellington.com' },
  { name: 'Maserati', domain: 'maserati.com' },
  { name: 'Swiss Alpine Military', domain: 'swissalpinemilitary.ch' },
  { name: 'BERING', domain: 'beringtime.com' },
  { name: 'Philipp Plein', domain: 'philipp-plein.com' },
  { name: 'Bulova', domain: 'bulova.com' },
  // Swiss Military Hanowa: oficiální doména swissmilitary-hanowa.com vrací
  // v Brandfetch prázdný obrázek — funkční logo má mateřská hanowa.ch.
  { name: 'Swiss Military Hanowa', domain: 'hanowa.ch' },
  { name: 'Alpina', domain: 'alpinawatches.com' },
  { name: 'AVI-8', domain: 'avi-8.com' },
  { name: 'Edox', domain: 'edox.ch' },
  { name: 'Ingersoll', domain: 'ingersollwatches.com' },
  { name: 'Luminox', domain: 'luminox.com' },
  { name: 'Timberland', domain: 'timberland.com' },
  { name: 'Victorinox', domain: 'victorinox.com' },
  // ZEPPELIN: Brandfetch nemá použitelné logo — záměrně bez záznamu, UI použije
  // textový fallback. Ověřeno znovu 2026-07: zeppelinwatch.com / zeppelin-watch.de /
  // zeppelinuhren.de vrací prázdný bílý obrázek, pointtec.de logo jiné značky
  // (bauhaus), zeppelin-watches.com placeholder „Brandfetch"; search API značku
  // hodinek neindexuje vůbec. Prázdný obrázek se načte bez chyby, takže by
  // rozbil onError fallback v BrandLogo — proto radši žádný záznam.
];

// Premium/luxury watch brands available on request (separate from standard catalog)
export const BRANDS_PREMIUM: Brand[] = [
  { name: 'Tag Heuer', domain: 'tagheuer.com' },
  { name: 'Longines', domain: 'longines.com' },
  { name: 'Hamilton', domain: 'hamiltonwatch.com' },
  { name: 'Certina', domain: 'certina.com' },
  { name: 'Frederique Constant', domain: 'frederiqueconstant.com' },
  { name: 'Mido', domain: 'midowatches.com' },
  { name: 'Breitling', domain: 'breitling.com' },
  { name: 'Rado', domain: 'rado.com' },
  { name: 'Oris', domain: 'oris.ch' },
];

const BRANDFETCH_CLIENT_ID = '1bfwsmEH20zzEfSNTed';

export function getBrandLogoUrl(
  domain: string,
  width: number = 400,
  height: number = 200,
): string {
  return `https://cdn.brandfetch.io/${domain}/w/${width}/h/${height}/logo?c=${BRANDFETCH_CLIENT_ID}`;
}

export function getBrandByName(name: string): Brand | undefined {
  const target = name.toLowerCase();
  return (
    BRANDS.find((b) => b.name.toLowerCase() === target) ??
    BRANDS_PREMIUM.find((b) => b.name.toLowerCase() === target)
  );
}
