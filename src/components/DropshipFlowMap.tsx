import { useEffect, useMemo, useRef, useState } from 'react';
import { MAP_COUNTRIES, MAP_W, MAP_H, type MapCity } from '@/data/europeMapPaths';
import { BrandLogo } from '@/components/BrandLogo';

/* ────────────────────────────────────────────────────────────────
   Interaktivní schéma dropshippingu — bílo-šedá mapa Evropy v tmavé
   kartě homepage, pohyby v gradientu headline (blue→cyan→emerald).
   Hlavní prodejní logika = pořadí peněz: partner NIKDY neplatí dřív,
   než sám dostane zaplaceno („without spending money on products").

   Rozmístění: na mapě je jen bod „Your shop" + objednávky; chip swelt
   stojí VLEVO vedle mapy a KLON „Your shop" (účetnictví partnera:
   Profit, poslední marže, Stock invested: €0) VPRAVO vedle mapy, obě
   na vertikálním středu. Legenda kroků je NAD mapou — mapa díky tomu
   může být větší a celé schéma se vejde na jednu obrazovku.

   Cyklus objednávky (~12 s; lety pomalé, přechody svižné):
   1. Customer orders — point „New order" + gradientový oblouk do shopu.
   2. You get paid — bankovka s cenou letí od zákazníka a PARKUJE nad
      bodem Your shop (peníze v ruce dřív, než se cokoli platí).
   3. We ship — z chipu swelt letí mini logo brandu k zákazníkovi.
   4. You pay us — bankovka se ROZLOMÍ na dvě poloviny a rozlomená
      zůstane 2 s stát (ať si ji divák prohlédne); pak smaragdová
      marže letí do klonu Your shop (Profit poskočí) a šedá
      velkoobchodní část do swelt („from customer's money").

   Expanzní flow: jedna epocha = jeden partner. Start 2–3 země, nové
   trhy se rozsvěcují přes sousedy (počítadlo „Live in X of 15
   countries", zvýrazněná „First order from …"). Po celé mapě se schéma
   ztlumí, Your shop se přesune (nový partner), Profit se vynuluje.

   Engine: virtuální hodiny krokované přes rAF; mimo viewport se nehýbe.
   Mobil bez letu brand loga (platby zůstávají — jsou jádrem argumentu).
   Hover interakce zrušena na přání zadavatele.

   POZOR na layout: SVG a HTML overlay MUSÍ být ve společném relative
   wrapperu bez dalšího IN-FLOW obsahu — % souřadnice overlay se
   počítají z jeho boxu (legenda uvnitř by box zvětšila a body ujedou).
   ──────────────────────────────────────────────────────────────── */

/* Gradient z DropshipHeadline: blue-500 → cyan-400 → emerald-400 */
const GRAD_FROM = '#3b82f6';
const GRAD_MID = '#22d3ee';
const GRAD_TO = '#34d399';

/* Reálné produkty z katalogu — MOC v EUR a podíl partnera (~31–42 %).
   Casio 99 € → 34.65/64.35 je referenční příklad ze zadání. */
const PRODUCTS = [
  { brand: 'Pandora', domain: 'pandora.net', price: 89, margin: 0.35 },
  { brand: 'Swarovski', domain: 'swarovski.com', price: 119, margin: 0.35 },
  { brand: 'Tommy Hilfiger', domain: 'tommy.com', price: 159, margin: 0.33 },
  { brand: 'Fossil', domain: 'fossil.com', price: 129, margin: 0.38 },
  { brand: 'Michael Kors', domain: 'michaelkors.com', price: 199, margin: 0.31 },
  { brand: 'Calvin Klein', domain: 'calvinklein.com', price: 79, margin: 0.4 },
  { brand: 'Guess', domain: 'guess.com', price: 69, margin: 0.42 },
  { brand: 'Festina', domain: 'festina.com', price: 109, margin: 0.36 },
  { brand: 'Casio', domain: 'casio.com', price: 99, margin: 0.35 },
];
type Product = (typeof PRODUCTS)[number];

/* Sousedství v rámci 15 doručovacích zemí — pro organické šíření expanze */
const NEIGHBORS: Record<string, string[]> = {
  DE: ['FR', 'AT', 'PL', 'CZ'],
  FR: ['DE', 'IT'],
  IT: ['FR', 'AT', 'SI'],
  PL: ['DE', 'CZ', 'SK'],
  CZ: ['DE', 'AT', 'SK', 'PL'],
  AT: ['DE', 'CZ', 'SK', 'HU', 'SI', 'IT'],
  SK: ['CZ', 'PL', 'AT', 'HU'],
  HU: ['AT', 'SK', 'RO', 'RS', 'HR', 'SI'],
  RO: ['HU', 'BG', 'RS'],
  BG: ['RO', 'RS', 'GR'],
  HR: ['SI', 'HU', 'RS', 'BA'],
  SI: ['IT', 'AT', 'HU', 'HR'],
  RS: ['HU', 'RO', 'BG', 'HR', 'BA'],
  BA: ['HR', 'RS'],
  GR: ['BG'],
};

/* Stanice (SVG souřadnice; smí přesahovat plátno — overlay je HTML):
   desktop = chip swelt VLEVO vedle mapy a klon Your shop VPRAVO vedle
   mapy, obě na vertikálním středu. Mobil je má uvnitř plátna nad/pod
   pevninou, aby nepřetekly displej (root má na sm+ boční rezervu). */
const SWELT_DESKTOP = { x: -52, y: MAP_H / 2 };
const SHOP_HQ_DESKTOP = { x: MAP_W + 52, y: MAP_H / 2 };
const SWELT_MOBILE = { x: 70, y: MAP_H - 52 };
const SHOP_HQ_MOBILE = { x: 82, y: 96 };
/* Parkovací pozice bankovky nad bodem Your shop (SVG jednotky) */
const SPLIT_LIFT = 34;

/* Kroky legendy — pořadí je sám prodejní argument */
const STEPS = ['Customer orders', 'You get paid', 'We ship', 'You pay us'];

interface Pt { x: number; y: number }
interface Flight {
  id: number;
  kind: 'arc' | 'brand' | 'note' | 'wholesale' | 'profit';
  from: Pt;
  to: Pt;
  start: number;
  dur: number;
  product?: Product;
  amount?: string;
  highlight?: boolean;
}
interface OrderState { pt: Pt; countryName: string; first: boolean; product: Product }
interface ShopState { iso: string; city: MapCity }
/* hold = zaparkovaná bankovka · break = rozlomená na dvě poloviny
   (drží 2 s, pak obě půlky převezmou lety do klonu a do swelt) */
interface SplitState { phase: 'hold' | 'break'; total: string; profit: string; wholesale: string }

const byIso = Object.fromEntries(MAP_COUNTRIES.map((c) => [c.iso, c]));
const eur = (cents: number) => `€${(cents / 100).toFixed(2)}`;
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/* Kvadratický oblouk s kontrolním bodem zvednutým nad spojnici */
const ctrl = (a: Pt, b: Pt): Pt => {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - Math.max(30, d * 0.25) };
};
const bez = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({
  x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t ** 2 * b.x,
  y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t ** 2 * b.y,
});
const arcD = (a: Pt, b: Pt) => {
  const c = ctrl(a, b);
  return `M${a.x},${a.y} Q${c.x},${c.y} ${b.x},${b.y}`;
};

/** Interní signál zrušení běhu enginu (unmount) */
class Cancelled extends Error {}

export function DropshipFlowMap() {
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );
  const mobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches,
    [],
  );
  /* stanice po stranách mapy (desktop) / uvnitř plátna (mobil) */
  const SWELT = mobile ? SWELT_MOBILE : SWELT_DESKTOP;
  const SHOP_HQ = mobile ? SHOP_HQ_MOBILE : SHOP_HQ_DESKTOP;

  /* ── stav vykreslování ── */
  const [, setFrame] = useState(0);
  const [shop, setShop] = useState<ShopState | null>(null);
  const [active, setActive] = useState<Set<string>>(() => new Set());
  const [launching, setLaunching] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderState | null>(null);
  const [split, setSplit] = useState<SplitState | null>(null);
  const [step, setStep] = useState(0); // 0 = klid, 1–4 = aktivní krok legendy
  const [profitCents, setProfitCents] = useState(0);
  const [drops, setDrops] = useState<{ id: number; text: string }[]>([]);
  const [dimmed, setDimmed] = useState(false);

  /* ── engine: virtuální hodiny + letové objekty (refs, ne state) ── */
  const vtRef = useRef(0);
  const visibleRef = useRef(true);
  const aliveRef = useRef(true);
  const flightsRef = useRef<Flight[]>([]);
  const staticArcRef = useRef<{ from: Pt; to: Pt; highlight?: boolean } | null>(null);
  const waitersRef = useRef<{ t: number; res: (ok: boolean) => void }[]>([]);
  const idRef = useRef(0);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reduced) return;
    /* StrictMode v dev spouští efekt dvakrát — druhý běh musí začít čistě */
    aliveRef.current = true;
    flightsRef.current = [];
    staticArcRef.current = null;
    waitersRef.current = [];
    const el = rootRef.current;
    const io = el
      ? new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; }, { threshold: 0.05 })
      : null;
    if (el && io) io.observe(el);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (visibleRef.current) {
        vtRef.current += dt;
        const vt = vtRef.current;
        const ready = waitersRef.current.filter((w) => w.t <= vt);
        if (ready.length) {
          waitersRef.current = waitersRef.current.filter((w) => w.t > vt);
          ready.forEach((w) => w.res(true));
        }
        if (flightsRef.current.length || ready.length) setFrame((f) => f + 1);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        waitersRef.current.push({
          t: vtRef.current + ms,
          res: (ok) => (ok && aliveRef.current ? resolve() : reject(new Cancelled())),
        });
      });

    const fly = async (f: Omit<Flight, 'id' | 'start'>) => {
      const flight: Flight = { ...f, id: ++idRef.current, start: vtRef.current };
      flightsRef.current = [...flightsRef.current, flight];
      try {
        await wait(f.dur);
      } finally {
        flightsRef.current = flightsRef.current.filter((x) => x.id !== flight.id);
      }
    };

    /* Jeden cyklus objednávky — pořadí kroků = prodejní argument:
       objednávka → platba k partnerovi → teprve pak zboží → teprve pak
       odvod sweltu (z peněz zákazníka). Lety pomalé, přechody svižné. */
    const runOrder = async (shopState: ShopState, originIso: string, first: boolean) => {
      const country = byIso[originIso];
      const cityPool = country.cities.filter((c) => c.name !== shopState.city.name);
      const city = pick(cityPool.length ? cityPool : country.cities);
      const product = pick(PRODUCTS);
      const shopPt = shopState.city;
      const orderPt = { x: city.x, y: city.y };
      const splitPt = { x: shopPt.x, y: shopPt.y - SPLIT_LIFT };
      const priceCents = product.price * 100;
      const profitPart = Math.round(priceCents * product.margin);
      const splitState = {
        total: eur(priceCents),
        profit: `+${eur(profitPart)}`,
        wholesale: eur(priceCents - profitPart),
      };

      /* 1) Customer orders */
      setStep(1);
      setOrder({ pt: orderPt, countryName: country.name, first, product });
      await wait(350);
      await fly({ kind: 'arc', from: orderPt, to: shopPt, dur: first ? 1900 : 1600, highlight: first });
      staticArcRef.current = { from: orderPt, to: shopPt, highlight: first };
      await wait(400);

      /* 2) You get paid — bankovka parkuje nad bodem Your shop */
      setStep(2);
      await fly({ kind: 'note', from: orderPt, to: splitPt, dur: 1800, amount: splitState.total });
      setSplit({ phase: 'hold', ...splitState });
      await wait(650);

      /* 3) We ship — peníze už jsou v ruce, teprve teď letí zboží */
      setStep(3);
      if (!mobile) {
        await fly({ kind: 'brand', from: SWELT, to: orderPt, dur: 1800, product });
        await wait(350);
      } else {
        await wait(500);
      }

      /* 4) You pay us — rozlomení: 2 s na prohlédnutí, pak marže letí
         do klonu Your shop a velkoobchodní část do swelt */
      setStep(4);
      setSplit({ phase: 'break', ...splitState });
      await wait(2000);
      setSplit(null);
      await Promise.all([
        fly({ kind: 'profit', from: splitPt, to: SHOP_HQ, dur: 1600, amount: splitState.profit }).then(() => {
          setProfitCents((p) => p + profitPart);
          setDrops((d) => [{ id: ++idRef.current, text: splitState.profit }, ...d].slice(0, 2));
        }),
        fly({ kind: 'wholesale', from: splitPt, to: SWELT, dur: 1800, amount: splitState.wholesale }),
      ]);
      await wait(250);

      /* úklid */
      staticArcRef.current = null;
      setOrder(null);
      setStep(0);
      await wait(550);
    };

    /* Jedna epocha = jeden partner: expanze od 2–3 zemí po celou mapu */
    const runEpoch = async (shopIso: string) => {
      const shopCountry = byIso[shopIso];
      const shopState: ShopState = { iso: shopIso, city: pick(shopCountry.cities) };
      const lit = new Set<string>([shopIso]);
      const starterPool = NEIGHBORS[shopIso].slice();
      const starters = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < starters && starterPool.length; i++) {
        const n = starterPool.splice(Math.floor(Math.random() * starterPool.length), 1)[0];
        lit.add(n);
      }
      setShop(shopState);
      setActive(new Set(lit));
      setProfitCents(0);
      setDrops([]);
      setDimmed(false);
      await wait(800);

      /* úvodní objednávka ze startovních trhů */
      await runOrder(shopState, pick([...lit]), false);

      /* expanze: šíření přes sousedy, dokud nesvítí celá mapa */
      while (lit.size < MAP_COUNTRIES.length) {
        const frontier = MAP_COUNTRIES
          .map((c) => c.iso)
          .filter((iso) => !lit.has(iso) && NEIGHBORS[iso].some((n) => lit.has(n)));
        const pool = frontier.length
          ? frontier
          : MAP_COUNTRIES.map((c) => c.iso).filter((iso) => !lit.has(iso));
        const next = pick(pool);
        setLaunching(next);
        await wait(1100);
        lit.add(next);
        setActive(new Set(lit));
        setLaunching(null);
        await wait(300);
        /* zvýrazněná první objednávka z nové země */
        await runOrder(shopState, next, true);
      }

      /* chvíle plné sítě, pak ztlumit a předat štafetu dalšímu partnerovi */
      await runOrder(shopState, pick([...lit]), false);
      await wait(700);
      setDimmed(true);
      await wait(900);
      setShop(null);
      setOrder(null);
      setSplit(null);
      setStep(0);
      setActive(new Set());
      staticArcRef.current = null;
    };

    (async () => {
      let shopIso = 'DE'; // první partner dle zadání v Německu
      try {
        for (;;) {
          await runEpoch(shopIso);
          const others = MAP_COUNTRIES.map((c) => c.iso).filter((i) => i !== shopIso);
          shopIso = pick(others);
        }
      } catch (e) {
        if (!(e instanceof Cancelled)) throw e;
      }
    })();

    return () => {
      aliveRef.current = false;
      cancelAnimationFrame(raf);
      io?.disconnect();
      const pending = waitersRef.current;
      waitersRef.current = [];
      pending.forEach((w) => w.res(false));
    };
    /* SWELT/SHOP_HQ jsou stabilní modulové konstanty vybrané podle mobile */
  }, [reduced, mobile, SWELT, SHOP_HQ]);

  const px = (x: number) => `${(x / MAP_W) * 100}%`;
  const py = (y: number) => `${(y / MAP_H) * 100}%`;

  /* Vrstva zemí — překreslovat jen při změně aktivních/launchující země */
  const activeKey = [...active].sort().join(',');
  const countryLayer = useMemo(
    () => (
      <g>
        {MAP_COUNTRIES.map((c) => {
          const on = active.has(c.iso);
          return (
            <path
              key={c.iso}
              d={c.d}
              fill={on ? '#d6d6dc' : '#2b2c33'}
              stroke={on ? '#f4f4f5' : '#43444d'}
              strokeWidth={0.8}
              strokeLinejoin="round"
              style={{ transition: 'fill 0.7s ease, stroke 0.7s ease' }}
            />
          );
        })}
        {launching && (
          <path d={byIso[launching].d} fill="url(#dsGrad)" className="ds-launch" />
        )}
      </g>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeKey, launching],
  );

  /* Legenda kroků — nad mapou (desktop i mobil), NIKDY uvnitř map boxu */
  const legend = (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] sm:mb-5 sm:text-xs">
      {STEPS.map((label, i) => {
        const on = step === i + 1;
        return (
          <span key={label} className="flex items-center gap-1.5 transition-opacity duration-300"
            style={{ opacity: on ? 1 : 0.4 }}>
            <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold sm:h-[18px] sm:w-[18px] sm:text-[10px] ${
              on
                ? 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-zinc-950'
                : 'bg-white/15 text-white/70'
            }`}>
              {i + 1}
            </span>
            <span className={on
              ? 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text font-semibold text-transparent'
              : 'font-medium text-white/60'}>
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );

  /* Statická verze pro prefers-reduced-motion: rozsvícená mapa + legenda */
  if (reduced) {
    const de = byIso.DE.cities[0];
    const it = byIso.IT.cities[0];
    return (
      <div className="relative mx-auto w-full max-w-[800px]">
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="h-auto w-full" role="img"
          aria-label="Dropshipping across 15 European countries: customers order and pay you first, swelt ships under your brand, and you pay wholesale only from money you already received.">
          <defs>
            <linearGradient id="dsGrad" x1="0" y1="0" x2={MAP_W} y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={GRAD_FROM} /><stop offset="0.5" stopColor={GRAD_MID} /><stop offset="1" stopColor={GRAD_TO} />
            </linearGradient>
          </defs>
          {MAP_COUNTRIES.map((c) => (
            <path key={c.iso} d={c.d} fill="#d6d6dc" stroke="#f4f4f5" strokeWidth={0.8} strokeLinejoin="round" />
          ))}
          <path d={arcD(it, de)} fill="none" stroke="url(#dsGrad)" strokeWidth={2} />
          <circle cx={de.x} cy={de.y} r={6} fill="#ffffff" />
          <circle cx={it.x} cy={it.y} r={4.5} fill={GRAD_MID} />
        </svg>
        <p className="mt-4 text-center text-sm text-white/60">
          Customers order and pay you first. swelt ships under your brand — you pay wholesale only from money you already received.
        </p>
      </div>
    );
  }

  const flights = flightsRef.current;
  const staticArc = staticArcRef.current;
  const shopPt = shop?.city ?? null;

  return (
    <div
      ref={rootRef}
      /* šířka omezená i výškou viewportu (jedna obrazovka); na sm+ boční
         rezerva ~110 px na každé straně pro stanice vedle mapy */
      className="relative mx-auto w-[min(100%,880px,88vh)] select-none sm:w-[min(100%_-_220px,880px,88vh)]"
      style={{ opacity: dimmed ? 0.12 : 1, transition: 'opacity 0.9s ease' }}
    >
      <style>{`
        @keyframes dsLaunch { 0% { opacity: 0 } 45% { opacity: 0.85 } 100% { opacity: 0 } }
        .ds-launch { animation: dsLaunch 1.1s ease-in-out both }
        @keyframes dsPop { from { opacity: 0; transform: scale(0.5) } to { opacity: 1; transform: scale(1) } }
        .ds-pop { animation: dsPop 0.35s ease-out both; transform-origin: center }
        @keyframes dsDrop { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
        .ds-drop { animation: dsDrop 0.45s ease-out both }
        @keyframes dsPark { 0% { transform: translate(-50%,-50%) scale(0.9) } 55% { transform: translate(-50%,-50%) scale(1.18) } 100% { transform: translate(-50%,-50%) scale(1.08) } }
        .ds-park { animation: dsPark 0.5s ease-out both }
        @keyframes dsCrack { 0% { transform: translate(-50%,-50%) rotate(0) } 30% { transform: translate(-51%,-50%) rotate(-2deg) } 65% { transform: translate(-49%,-50%) rotate(2deg) } 100% { transform: translate(-50%,-50%) rotate(0) } }
        .ds-crack { animation: dsCrack 0.4s ease-in-out both }
        @keyframes dsBounce { 0% { transform: scale(1) } 40% { transform: scale(1.22) } 100% { transform: scale(1) } }
        .ds-bounce { display: inline-block; animation: dsBounce 0.7s ease-out both; transform-origin: left center }
      `}</style>

      {legend}

      {/* ── Mapový box: SVG + overlay sdílí PŘESNĚ stejný box (viz hlavička) ── */}
      <div className="relative">
        {/* počítadlo trhů */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 rounded-full bg-zinc-900/70 px-3 py-1 text-[11px] font-semibold text-white/85 backdrop-blur-sm sm:text-xs">
          Live in{' '}
          <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text font-bold text-transparent">
            {active.size}
          </span>{' '}
          of {MAP_COUNTRIES.length} countries
        </div>

        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="h-auto w-full" aria-hidden>
          <defs>
            <linearGradient id="dsGrad" x1="0" y1="0" x2={MAP_W} y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={GRAD_FROM} />
              <stop offset="0.5" stopColor={GRAD_MID} />
              <stop offset="1" stopColor={GRAD_TO} />
            </linearGradient>
          </defs>
          {countryLayer}
          {/* dokreslený oblouk aktuální objednávky */}
          {staticArc && (
            <path d={arcD(staticArc.from, staticArc.to)} fill="none" stroke="url(#dsGrad)"
              strokeWidth={staticArc.highlight ? 2.4 : 1.6} strokeLinecap="round" opacity={0.55} />
          )}
          {/* kreslící se oblouk */}
          {flights.filter((f) => f.kind === 'arc').map((f) => {
            const t = Math.min(1, (vtRef.current - f.start) / f.dur);
            return (
              <path key={f.id} d={arcD(f.from, f.to)} fill="none" stroke="url(#dsGrad)"
                strokeWidth={f.highlight ? 2.4 : 1.6} strokeLinecap="round"
                pathLength={1} strokeDasharray={1} strokeDashoffset={1 - easeInOut(t)} />
            );
          })}
        </svg>

        {/* ── HTML overlay: kotva každého bodu = jeho TEČKA; popisky visí
              pod ní a kotvu neposouvají ── */}
        <div className="pointer-events-none absolute inset-0 text-[11px] sm:text-xs">
          {/* klon Your shop — účetnictví partnera vedle mapy; kotva letů
              = pilulka, zbytek stacku visí pod ní (dropy s ní nehýbou) */}
          <div className="absolute" style={{ left: px(SHOP_HQ.x), top: py(SHOP_HQ.y) }}>
            <span className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 font-bold tracking-tight text-zinc-900 shadow-lg">
              Your shop
            </span>
            <div className="absolute top-4 -translate-x-1/2">
              <div className="flex flex-col items-center gap-1">
                <span className="whitespace-nowrap rounded-full bg-zinc-900/85 px-2.5 py-0.5 font-bold text-white shadow-lg">
                  Profit{' '}
                  <span key={profitCents} className="ds-bounce tabular-nums text-emerald-400">{eur(profitCents)}</span>
                </span>
                {!mobile && drops.map((d, i) => (
                  <span key={d.id} className={`ds-drop whitespace-nowrap rounded-full bg-zinc-900/70 px-2 py-px text-[10px] font-semibold tabular-nums text-emerald-300 ${i > 0 ? 'opacity-45' : ''}`}>
                    {d.text}
                  </span>
                ))}
                <span className="whitespace-nowrap rounded-full bg-zinc-900/75 px-2 py-0.5 text-[10px] font-semibold text-white/85 backdrop-blur-sm">
                  Stock invested: €0
                </span>
              </div>
            </div>
          </div>

          {/* chip swelt — samotný chip je bod (kotva = jeho střed) */}
          <div className="absolute" style={{ left: px(SWELT.x), top: py(SWELT.y) }}>
            <span className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 font-bold tracking-tight text-zinc-900 shadow-lg">
              swelt
            </span>
          </div>

          {/* bod Your shop na mapě — tečka na souřadnici, label pod ní */}
          {shopPt && shop && (
            <div className="absolute" style={{ left: px(shopPt.x), top: py(shopPt.y) }}>
              <span className="absolute flex h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/50" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-zinc-900 bg-white shadow" />
              </span>
              {/* label pod tečkou (animace na vnitřním divu — na pozicovaném
                  elementu by CSS animation přepsala -translate-x-1/2) */}
              <div className="absolute top-2.5 -translate-x-1/2">
                <div className="ds-pop">
                  <span className="whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 font-bold text-zinc-900 shadow-lg">Your shop</span>
                </div>
              </div>
            </div>
          )}

          {/* New order — tečka na souřadnici, pill pod ní */}
          {order && (
            <div className="absolute" style={{ left: px(order.pt.x), top: py(order.pt.y) }}>
              <span className="absolute flex h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 shadow" />
              </span>
              <div className="absolute top-2 -translate-x-1/2">
                <div className="ds-pop flex flex-col items-center gap-1">
                  <span className={`whitespace-nowrap rounded-full px-2 py-0.5 font-semibold shadow-lg ${
                    order.first
                      ? 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-zinc-950'
                      : 'bg-zinc-900/85 text-white'
                  }`}>
                    {order.first ? `First order from ${order.countryName}` : 'New order'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Split nad bodem Your shop: hold = zaparkovaná bankovka →
              break = rozlomená na dvě poloviny (drží 2 s na prohlédnutí);
              pak obě půlky odlétají jako samostatné lety */}
          {split && shopPt && (
            <div className="absolute" style={{ left: px(shopPt.x), top: py(shopPt.y - SPLIT_LIFT) }}>
              {split.phase === 'hold' ? (
                <span className="ds-park absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-emerald-300/70 bg-white px-3 py-1 text-xs font-bold tabular-nums text-zinc-900 shadow-xl sm:text-sm">
                  {split.total}
                </span>
              ) : (
                <div className="ds-crack absolute flex -translate-x-1/2 -translate-y-1/2">
                  {/* levá (smaragdová) polovina = marže → poletí do klonu */}
                  <span className="whitespace-nowrap rounded-l-md border-r border-dashed border-emerald-700/50 bg-emerald-400 px-2 py-1 text-xs font-bold tabular-nums text-zinc-950 shadow-xl">
                    {split.profit}
                  </span>
                  {/* pravá (šedá) polovina = velkoobchod → poletí do swelt */}
                  <span className="whitespace-nowrap rounded-r-md bg-white px-2 py-1 text-xs font-semibold tabular-nums text-zinc-600 shadow-xl">
                    {split.wholesale}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* letící chipy */}
          {flights.filter((f) => f.kind !== 'arc').map((f) => {
            const t = easeInOut(Math.min(1, (vtRef.current - f.start) / f.dur));
            const p = bez(f.from, ctrl(f.from, f.to), f.to, t);
            return (
              <div key={f.id} className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: px(p.x), top: py(p.y) }}>
                {f.kind === 'brand' && f.product && (
                  <span className="flex h-6 items-center rounded-full bg-white px-2 shadow-lg">
                    <BrandLogo name={f.product.brand} domain={f.product.domain} width={160} height={64}
                      className="h-3.5 w-auto max-w-[72px] object-contain"
                      fallbackClassName="text-[9px] font-bold text-zinc-900" />
                  </span>
                )}
                {f.kind === 'note' && (
                  <span className="rounded-md border border-emerald-300/60 bg-white px-2 py-0.5 font-bold tabular-nums text-zinc-900 shadow-lg">
                    {f.amount}
                  </span>
                )}
                {f.kind === 'profit' && (
                  <span className="whitespace-nowrap rounded-l-md rounded-r-sm border-r border-dashed border-emerald-700/50 bg-emerald-400 px-2 py-0.5 text-xs font-bold tabular-nums text-zinc-950 shadow-lg">
                    {f.amount}
                  </span>
                )}
                {f.kind === 'wholesale' && (
                  <span className="flex flex-col items-center rounded-r-md rounded-l-sm border-l border-dashed border-zinc-400 bg-white px-2 py-0.5 shadow-lg">
                    <span className="text-[10px] font-semibold tabular-nums text-zinc-700">{f.amount}</span>
                    <span className="text-[8px] font-medium leading-tight text-zinc-500">from customer's money</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="sr-only">
        Interactive dropshipping schema: customers across 15 European countries order and pay you first,
        swelt ships under your brand, and you pay wholesale only from money you already received —
        you never spend money on products upfront.
      </p>
    </div>
  );
}
