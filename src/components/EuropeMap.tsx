import { useState, useEffect } from 'react';

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

const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getIso(f: any): string {
  const p = f.properties || {};
  const raw = (p.ISO2 || p.iso_a2 || p.ISO_A2 || '').toString().toUpperCase();
  if (raw && raw !== '-99') return raw;
  return NAME_TO_ISO[p.NAME || p.name || ''] || '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function eachCoord(geometry: any, cb: (lon: number, lat: number) => void) {
  if (!geometry) return;
  const polys =
    geometry.type === 'Polygon' ? [geometry.coordinates]
    : geometry.type === 'MultiPolygon' ? geometry.coordinates
    : [];
  for (const poly of polys) {
    for (const ring of poly) {
      for (const pt of ring) cb(pt[0], pt[1]);
    }
  }
}

interface CountryPath { iso: string; d: string }

export function EuropeMap() {
  const [paths, setPaths] = useState<CountryPath[]>([]);
  const [dims, setDims] = useState({ w: 800, h: 500 });
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((data) => {
        if (!alive || !data?.features) return;

        /* Keep only delivery countries */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const features = data.features.filter((f: any) => DELIVERY[getIso(f)]);
        if (features.length === 0) return;

        /* Bounding box of delivery countries */
        let lonMin = Infinity, lonMax = -Infinity, latMin = Infinity, latMax = -Infinity;
        for (const f of features) {
          eachCoord(f.geometry, (lon, lat) => {
            if (lon < lonMin) lonMin = lon;
            if (lon > lonMax) lonMax = lon;
            if (lat < latMin) latMin = lat;
            if (lat > latMax) latMax = lat;
          });
        }

        /* Mercator projection auto-fitted to the bbox, correct aspect ratio */
        const W = 800;
        const pad = 14;
        const lonSpan = ((lonMax - lonMin) * Math.PI) / 180;
        const myMax = mercY(latMax);
        const myMin = mercY(latMin);
        const mySpan = myMax - myMin;
        const H = Math.round(W * (mySpan / lonSpan));

        const project = (lon: number, lat: number): [number, number] => {
          const x = ((lon - lonMin) / (lonMax - lonMin)) * (W - pad * 2) + pad;
          const y = ((myMax - mercY(lat)) / mySpan) * (H - pad * 2) + pad;
          return [x, y];
        };

        const ringPath = (ring: number[][]): string => {
          let d = '';
          for (let i = 0; i < ring.length; i++) {
            const [x, y] = project(ring[i][0], ring[i][1]);
            d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
          }
          return d + 'Z';
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const geomPath = (g: any): string => {
          if (!g) return '';
          if (g.type === 'Polygon') return g.coordinates.map(ringPath).join(' ');
          if (g.type === 'MultiPolygon') {
            return g.coordinates
              .map((poly: number[][][]) => poly.map(ringPath).join(' '))
              .join(' ');
          }
          return '';
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setPaths(features.map((f: any) => ({ iso: getIso(f), d: geomPath(f.geometry) })));
        setDims({ w: W, h: H });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const hoveredName = hovered ? DELIVERY[hovered] : null;

  return (
    <div className="relative flex items-center justify-center">
      {/* Hovered country label */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-10 flex h-7 -translate-x-1/2 items-center">
        {hoveredName && (
          <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3.5 py-1 text-xs font-semibold text-background shadow-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {hoveredName}
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        className="w-full h-auto"
        role="img"
        aria-label="Mapa zemí doručení v Evropě"
      >
        {paths.map((c, i) => {
          const isHovered = hovered === c.iso;
          return (
            <path
              key={c.iso || i}
              d={c.d}
              fill={isHovered ? 'hsl(240 5% 14%)' : 'hsl(240 4% 26%)'}
              stroke="#ffffff"
              strokeWidth={0.9}
              strokeLinejoin="round"
              style={{ transition: 'fill 0.2s ease', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(c.iso)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>
    </div>
  );
}
