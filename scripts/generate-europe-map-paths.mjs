/**
 * Generates src/data/europeMapPaths.ts — SVG path outlines of the 15 swelt
 * delivery countries + projected city anchor points. Used by the homepage
 * dropshipping flow map (DropshipFlowMap) so the map renders instantly
 * without a runtime GeoJSON fetch. Projection mirrors EuropeMap.tsx.
 *
 * Usage:  node scripts/generate-europe-map-paths.mjs [path/to/europe.geojson]
 * Without an argument the GeoJSON is fetched from the same CDN EuropeMap uses.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const GEO_URL = 'https://cdn.jsdelivr.net/gh/leakyMirror/map-of-europe@master/GeoJSON/europe.geojson';

const DELIVERY = {
  CZ: 'Czechia', SK: 'Slovakia', AT: 'Austria', DE: 'Germany', PL: 'Poland',
  HU: 'Hungary', RO: 'Romania', BG: 'Bulgaria', HR: 'Croatia', SI: 'Slovenia',
  BA: 'Bosnia', RS: 'Serbia', GR: 'Greece', IT: 'Italy', FR: 'France',
};
const NAME_TO_ISO = {
  'Czech Republic': 'CZ', 'Czechia': 'CZ', 'Slovakia': 'SK', 'Austria': 'AT',
  'Germany': 'DE', 'Poland': 'PL', 'Hungary': 'HU', 'Romania': 'RO',
  'Bulgaria': 'BG', 'Croatia': 'HR', 'Slovenia': 'SI', 'Greece': 'GR',
  'Italy': 'IT', 'France': 'FR', 'Serbia': 'RS', 'Republic of Serbia': 'RS',
  'Bosnia and Herzegovina': 'BA',
};

/* Města — kotvy pro body objednávek a umístění My shop (lat, lon) */
const CITIES = [
  { iso: 'DE', name: 'Berlin', lat: 52.52, lon: 13.405 },
  { iso: 'DE', name: 'Munich', lat: 48.137, lon: 11.575 },
  { iso: 'DE', name: 'Hamburg', lat: 53.551, lon: 9.994 },
  { iso: 'FR', name: 'Paris', lat: 48.857, lon: 2.352 },
  { iso: 'FR', name: 'Lyon', lat: 45.764, lon: 4.836 },
  { iso: 'IT', name: 'Milan', lat: 45.464, lon: 9.19 },
  { iso: 'IT', name: 'Rome', lat: 41.902, lon: 12.496 },
  { iso: 'PL', name: 'Warsaw', lat: 52.23, lon: 21.011 },
  { iso: 'PL', name: 'Krakow', lat: 50.065, lon: 19.945 },
  { iso: 'CZ', name: 'Prague', lat: 50.075, lon: 14.437 },
  { iso: 'CZ', name: 'Brno', lat: 49.195, lon: 16.607 },
  { iso: 'AT', name: 'Vienna', lat: 48.208, lon: 16.373 },
  { iso: 'SK', name: 'Bratislava', lat: 48.148, lon: 17.107 },
  { iso: 'HU', name: 'Budapest', lat: 47.498, lon: 19.04 },
  { iso: 'RO', name: 'Bucharest', lat: 44.427, lon: 26.102 },
  { iso: 'RO', name: 'Cluj', lat: 46.77, lon: 23.59 },
  { iso: 'BG', name: 'Sofia', lat: 42.698, lon: 23.322 },
  { iso: 'HR', name: 'Zagreb', lat: 45.815, lon: 15.982 },
  { iso: 'HR', name: 'Split', lat: 43.508, lon: 16.44 },
  { iso: 'SI', name: 'Ljubljana', lat: 46.056, lon: 14.506 },
  { iso: 'RS', name: 'Belgrade', lat: 44.787, lon: 20.449 },
  { iso: 'BA', name: 'Sarajevo', lat: 43.856, lon: 18.413 },
  { iso: 'GR', name: 'Athens', lat: 37.984, lon: 23.727 },
  { iso: 'GR', name: 'Thessaloniki', lat: 40.64, lon: 22.944 },
];

const W = 800;
const PAD = 14;
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

function getIso(f) {
  const p = f.properties || {};
  const raw = (p.ISO2 || p.iso_a2 || p.ISO_A2 || '').toString().toUpperCase();
  if (raw && raw !== '-99') return raw;
  return NAME_TO_ISO[p.NAME || p.name || ''] || '';
}
function polygons(g) {
  if (!g) return [];
  if (g.type === 'Polygon') return [g.coordinates];
  if (g.type === 'MultiPolygon') return g.coordinates;
  return [];
}

async function loadGeo() {
  const arg = process.argv[2];
  if (arg) return JSON.parse(readFileSync(arg, 'utf8'));
  const res = await fetch(GEO_URL);
  if (!res.ok) throw new Error(`GeoJSON fetch failed: ${res.status}`);
  return res.json();
}

const data = await loadGeo();
const features = data.features.filter((f) => DELIVERY[getIso(f)]);
if (features.length !== 15) console.warn(`warning: matched ${features.length}/15 countries`);

let lonMin = Infinity, lonMax = -Infinity, latMin = Infinity, latMax = -Infinity;
for (const f of features) {
  for (const poly of polygons(f.geometry)) {
    for (const ring of poly) {
      for (const [lon, lat] of ring) {
        if (lon < lonMin) lonMin = lon;
        if (lon > lonMax) lonMax = lon;
        if (lat < latMin) latMin = lat;
        if (lat > latMax) latMax = lat;
      }
    }
  }
}
const lonSpan = ((lonMax - lonMin) * Math.PI) / 180;
const myMax = mercY(latMax);
const mySpan = myMax - mercY(latMin);
const H = Math.round(W * (mySpan / lonSpan));

const project = (lon, lat) => [
  ((lon - lonMin) / (lonMax - lonMin)) * (W - PAD * 2) + PAD,
  ((myMax - mercY(lat)) / mySpan) * (H - PAD * 2) + PAD,
];

const ringPath = (ring) => {
  let d = '';
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = project(ring[i][0], ring[i][1]);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d + 'Z';
};

const countries = features.map((f) => {
  const iso = getIso(f);
  const d = polygons(f.geometry).map((poly) => poly.map(ringPath).join(' ')).join(' ');
  const cities = CITIES.filter((c) => c.iso === iso).map((c) => {
    const [x, y] = project(c.lon, c.lat);
    return { name: c.name, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });
  return { iso, name: DELIVERY[iso], d, cities };
});

const lines = [];
lines.push('/**');
lines.push(' * AUTO-GENERATED by scripts/generate-europe-map-paths.mjs — do not edit by hand.');
lines.push(' * SVG outlines of the 15 swelt delivery countries (mercator, fitted to 800px)');
lines.push(' * + projected city anchors. Rendered by DropshipFlowMap.');
lines.push(' */');
lines.push(`export const MAP_W = ${W};`);
lines.push(`export const MAP_H = ${H};`);
lines.push('');
lines.push('export interface MapCity { name: string; x: number; y: number }');
lines.push('export interface MapCountry { iso: string; name: string; d: string; cities: MapCity[] }');
lines.push('');
lines.push('export const MAP_COUNTRIES: MapCountry[] = [');
for (const c of countries) {
  lines.push(`  { iso: ${JSON.stringify(c.iso)}, name: ${JSON.stringify(c.name)}, cities: ${JSON.stringify(c.cities)}, d: ${JSON.stringify(c.d)} },`);
}
lines.push('];');
lines.push('');

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'src', 'data', 'europeMapPaths.ts');
writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`Wrote ${outPath}: ${countries.length} countries, ${W}x${H}`);
