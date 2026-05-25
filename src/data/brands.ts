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
  return BRANDS.find((b) => b.name.toLowerCase() === target);
}
