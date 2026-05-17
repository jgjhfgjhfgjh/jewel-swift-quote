import { useState, useEffect, useMemo } from 'react';

/* Low-resolution Europe GeoJSON (jsDelivr CDN, CORS-enabled) */
const GEO_URL = 'https://cdn.jsdelivr.net/gh/leakyMirror/map-of-europe@master/GeoJSON/europe.geojson';

/* Delivery countries — ISO2 (uppercase) → Czech name */
const DELIVERY: Record<string, string> = {
  CZ: 'Česká republika',
  SK: 'Slovensko',
  AT: 'Rakousko',
  DE: 'Německo',
  PL: 'Polsko',
  HU: 'Maďarsko',
  RO: 'Rumunsko',
  BG: 'Bulharsko',
  HR: 'Chorvatsko',
  SI: 'Slovinsko',
  BA: 'Bosna a Hercegovina',
  RS: 'Srbsko',
  GR: 'Řecko',
  IT: 'Itálie',
  FR: 'Francie',
};

/* Fallback name matching (if ISO2 absent) */
const NAME_TO_ISO: Record<string, string> = {
  'Czech Republic': 'CZ', 'Czechia': 'CZ', 'Slovakia': 'SK', 'Austria': 'AT',
  'Germany': 'DE', 'Poland': 'PL', 'Hungary': 'HU', 'Romania': 'RO',
  'Bulgaria': 'BG', 'Croatia': 'HR', 'Slovenia': 'SI', 'Greece': 'GR',
  'Italy': 'IT', 'France': 'FR', 'Serbia': 'RS', 'Republic of Serbia': 'RS',
  'Bosnia and Herzegovina': 'BA',
};

/* ── Mercator projection framed on Europe ── */
const LON_MIN = -11, LON_MAX = 32, LAT_MIN = 34, LAT_MAX = 62;
const W = 800, H = 807;

const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const MY_MIN = mercY(LAT_MIN);
const MY_MAX = mercY(LAT_MAX);

function project(lon: number, lat: number): [number, number] {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * W;
  const y = ((MY_MAX - mercY(lat)) / (MY_MAX - MY_MIN)) * H;
  return [x, y];
}

function ringToPath(ring: number[][]): string {
  let d = '';
  for (let i = 0; i < ring.length; i++) {
    const [lon, lat] = ring[i];
    const [x, y] = project(lon, lat);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d + 'Z';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function geometryToPath(geometry: any): string {
  if (!geometry) return '';
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map(ringToPath).join(' ');
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates
      .map((poly: number[][][]) => poly.map(ringToPath).join(' '))
      .join(' ');
  }
  return '';
}

interface CountryPath {
  iso: string;
  d: string;
}

export function EuropeMap() {
  const [geo, setGeo] = useState<CountryPath[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((data) => {
        if (!alive || !data?.features) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed: CountryPath[] = data.features.map((f: any) => {
          const p = f.properties || {};
          const rawIso = (p.ISO2 || p.iso_a2 || p.ISO_A2 || '').toString().toUpperCase();
          const iso = rawIso && rawIso !== '-99'
            ? rawIso
            : (NAME_TO_ISO[p.NAME || p.name || ''] || '');
          return { iso, d: geometryToPath(f.geometry) };
        });
        setGeo(parsed);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const hoveredName = hovered ? DELIVERY[hovered] : null;

  return (
    <div className="relative">
      {/* Hovered country label */}
      <div className="pointer-events-none absolute left-1/2 top-3 z-10 flex h-7 -translate-x-1/2 items-center">
        {hoveredName && (
          <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3.5 py-1 text-xs font-semibold text-background shadow-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {hoveredName}
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Mapa zemí doručení v Evropě"
      >
        {geo.map((c, i) => {
          const isDelivery = Boolean(DELIVERY[c.iso]);
          const isHovered = hovered === c.iso;
          return (
            <path
              key={c.iso || i}
              d={c.d}
              fill={
                isDelivery
                  ? isHovered
                    ? 'hsl(240 4% 18%)'
                    : 'hsl(240 4% 28%)'
                  : '#ECEEF1'
              }
              stroke="#ffffff"
              strokeWidth={0.8}
              strokeLinejoin="round"
              style={{
                transition: 'fill 0.2s ease',
                cursor: isDelivery ? 'pointer' : 'default',
              }}
              onMouseEnter={() => isDelivery && setHovered(c.iso)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>
    </div>
  );
}
