import { useEffect, useMemo, useRef, useState } from 'react';
import { Music2, ShoppingCart } from 'lucide-react';
import { MAP_COUNTRIES, MAP_W, MAP_H, type MapCity } from '@/data/europeMapPaths';
import { COUNTRY_DOTS } from '@/data/europeDots';
import { BrandLogo } from '@/components/BrandLogo';

/* ────────────────────────────────────────────────────────────────
   Interaktivní schéma dropshippingu — verze „night ops":

   VLEVO noční mapa Evropy (tmavá pevnina + teplá světla měst z
   dot-gridu; rozsvícení nové země = rozsvícení jejích světel).
   VPRAVO video partnera (bezešvá smyčka: muž sleduje displej,
   odlesky na brýlích) — přes jeho pravý horní roh částečně PŘESAHUJE
   bílá iOS karta „Daily earnings" (živé součty E-shop / TikTok Shop /
   Total v EUR) a přes levý horní roh naskakují push notifikace
   objednávek, řadí se nad sebe, přetékají rám videa a mizí fade.
   Karta i notifikace jsou HTML mimo video → grafická hloubka.

   Tok peněz (pořadí = prodejní argument „without spending money on
   products"): 1 Customer orders (point + oblouk + notifikace na
   videu) → 2 You get paid (liquid-glass chip s cenou parkuje nad
   bodem Your shop) → 3 We ship (mini logo brandu ze swelt) →
   4 You pay us (chip se rozdělí, 2 s drží; smaragdová marže letí
   PŘES mezeru do karty výdělků — cíl se měří za běhu — a šedý
   velkoobchod do swelt).

   Expanze: epocha = partner; start 2–3 země, šíření přes sousedy,
   po celé mapě ztlumení, relokace Your shop, reset karty.

   Engine: virtuální hodiny přes rAF; mimo viewport stojí. POZOR:
   SVG a overlay sdílí čistý relative wrapper (bez in-flow obsahu),
   jinak % souřadnice ujedou vůči mapě.
   ──────────────────────────────────────────────────────────────── */

/* Gradient z DropshipHeadline: blue-500 → cyan-400 → emerald-400 */
const GRAD_FROM = '#3b82f6';
const GRAD_MID = '#22d3ee';
const GRAD_TO = '#34d399';

/* Reálné produkty z katalogu — MOC v EUR a podíl partnera (~31–42 %) */
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

/* Chip swelt — v moři vlevo dole, mimo pevninu */
const SWELT = { x: 70, y: MAP_H - 52 };
/* Parkovací pozice glass chipu nad bodem Your shop (SVG jednotky) */
const SPLIT_LIFT = 34;

/* Kroky legendy — pořadí je sám prodejní argument */
const STEPS = ['Customer orders', 'You get paid', 'We ship', 'You pay us'];

/* Assety (Higgsfield): push notifikace kanálů + poster/loop videa partnera */
const IMG = {
  notifEshop: '/images/dropship-flow/notif-eshop.png',
  notifTiktok: '/images/dropship-flow/notif-tiktok.png',
  heroPoster: '/images/dropship-flow/hero-poster.webp',
};
const HERO_VIDEO = '/videos/dropship-flow/partner-loop.mp4';

type Channel = 'eshop' | 'tiktok';

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
interface OrderState { pt: Pt; countryName: string; first: boolean; product: Product; channel: Channel }
interface ShopState { iso: string; city: MapCity }
/* hold = zaparkovaný chip s celou cenou · break = rozdělený na marži
   a velkoobchod (drží 2 s, pak obě části odlétají jako lety) */
interface SplitState { phase: 'hold' | 'break'; total: string; profit: string; wholesale: string }

const byIso = Object.fromEntries(MAP_COUNTRIES.map((c) => [c.iso, c]));
const eur = (cents: number) => `€${(cents / 100).toFixed(2)}`;
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

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
/* Tečky země jako jediný <path> (stovky kruhů = 1 DOM uzel) */
const dotsToPath = (dots: [number, number][], r: number) =>
  dots.map(([x, y]) => `M${x - r},${y}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 ${-r * 2},0`).join('');

/** Interní signál zrušení běhu enginu (unmount) */
class Cancelled extends Error {}

/* Liquid-glass chip s částkou (peníze v novém vizuálu) */
function GlassAmount({ amount, tone, big, sub }: {
  amount: string; tone: 'neutral' | 'emerald'; big?: boolean; sub?: string;
}) {
  return (
    <span
      className={`relative flex flex-col items-center overflow-hidden rounded-xl border px-2.5 shadow-[0_10px_28px_rgba(0,0,0,0.5)] backdrop-blur-md ${
        big ? 'py-1.5' : 'py-1'
      } ${tone === 'emerald' ? 'border-emerald-300/40 bg-emerald-400/25' : 'border-white/30 bg-white/15'}`}
    >
      {/* horní odlesk skla */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
      <span className={`relative font-bold tabular-nums ${big ? 'text-sm' : 'text-xs'} ${tone === 'emerald' ? 'text-emerald-100' : 'text-white'}`}>
        {amount}
      </span>
      {sub && <span className="relative text-[8px] font-medium leading-tight text-white/60">{sub}</span>}
    </span>
  );
}

export function DropshipFlowMap() {
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );
  const mobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches,
    [],
  );

  /* ── stav vykreslování ── */
  const [, setFrame] = useState(0);
  const [shop, setShop] = useState<ShopState | null>(null);
  const [active, setActive] = useState<Set<string>>(() => new Set());
  const [launching, setLaunching] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderState | null>(null);
  const [split, setSplit] = useState<SplitState | null>(null);
  const [step, setStep] = useState(0);
  const [eshopCents, setEshopCents] = useState(0);
  const [tiktokCents, setTiktokCents] = useState(0);
  const [notifs, setNotifs] = useState<{ id: number; kind: Channel }[]>([]);
  const [dimmed, setDimmed] = useState(false);
  const [videoOn, setVideoOn] = useState(false);

  /* ── engine ── */
  const vtRef = useRef(0);
  const visibleRef = useRef(true);
  const aliveRef = useRef(true);
  const flightsRef = useRef<Flight[]>([]);
  const staticArcRef = useRef<{ from: Pt; to: Pt; highlight?: boolean } | null>(null);
  const waitersRef = useRef<{ t: number; res: (ok: boolean) => void }[]>([]);
  const idRef = useRef(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  /* Cíl letu marže = levý okraj karty výdělků, měřeno za běhu a
     převedeno do souřadnic mapy (smí přesahovat plátno — overlay je
     HTML bez ořezu, chip tak letí přes mezeru mezi sloupci) */
  const cardTarget = (): Pt => {
    const s = svgRef.current?.getBoundingClientRect();
    const c = cardRef.current?.getBoundingClientRect();
    if (!s || !c || s.width === 0) return { x: MAP_W + 120, y: MAP_H * 0.25 };
    return {
      x: ((c.left + 18 - s.left) / s.width) * MAP_W,
      y: ((c.top + c.height * 0.55 - s.top) / s.height) * MAP_H,
    };
  };
  const cardTargetRef = useRef(cardTarget);
  cardTargetRef.current = cardTarget;

  useEffect(() => {
    if (reduced) return;
    aliveRef.current = true;
    flightsRef.current = [];
    staticArcRef.current = null;
    waitersRef.current = [];
    const el = rootRef.current;
    const io = el
      ? new IntersectionObserver(([e]) => {
          visibleRef.current = e.isIntersecting;
          if (e.isIntersecting) setVideoOn(true);
        }, { threshold: 0.05 })
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

    /* Jeden cyklus objednávky — lety pomalé, přechody svižné */
    const runOrder = async (shopState: ShopState, originIso: string, first: boolean) => {
      const country = byIso[originIso];
      const cityPool = country.cities.filter((c) => c.name !== shopState.city.name);
      const city = pick(cityPool.length ? cityPool : country.cities);
      const product = pick(PRODUCTS);
      const channel: Channel = Math.random() < 0.6 ? 'eshop' : 'tiktok';
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

      /* 1) Customer orders — point, oblouk a push notifikace na videu */
      setStep(1);
      setOrder({ pt: orderPt, countryName: country.name, first, product, channel });
      setNotifs((n) => [{ id: ++idRef.current, kind: channel }, ...n].slice(0, 4));
      await wait(350);
      await fly({ kind: 'arc', from: orderPt, to: shopPt, dur: first ? 1900 : 1600, highlight: first });
      staticArcRef.current = { from: orderPt, to: shopPt, highlight: first };
      await wait(400);

      /* 2) You get paid — glass chip s cenou parkuje nad Your shop */
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

      /* 4) You pay us — rozdělení: 2 s na prohlédnutí, pak marže letí
         do karty výdělků a velkoobchodní část do swelt */
      setStep(4);
      setSplit({ phase: 'break', ...splitState });
      await wait(2000);
      setSplit(null);
      const target = cardTargetRef.current();
      await Promise.all([
        fly({ kind: 'profit', from: splitPt, to: target, dur: 1700, amount: splitState.profit }).then(() => {
          (channel === 'eshop' ? setEshopCents : setTiktokCents)((p) => p + profitPart);
        }),
        fly({ kind: 'wholesale', from: splitPt, to: SWELT, dur: 1800, amount: splitState.wholesale }),
      ]);
      await wait(250);

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
      setEshopCents(0);
      setTiktokCents(0);
      setNotifs([]);
      setDimmed(false);
      await wait(800);

      await runOrder(shopState, pick([...lit]), false);

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
        await runOrder(shopState, next, true);
      }

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
      let shopIso = 'DE';
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
  }, [reduced, mobile]);

  const px = (x: number) => `${(x / MAP_W) * 100}%`;
  const py = (y: number) => `${(y / MAP_H) * 100}%`;

  /* Noční mapa: tmavá pevnina + teplá světla měst; překreslovat jen
     při změně aktivních/launchující země */
  const activeKey = [...active].sort().join(',');
  const dotPaths = useMemo(
    () => Object.entries(COUNTRY_DOTS).map(([iso, dots]) => ({ iso, d: dotsToPath(dots as [number, number][], 1.05) })),
    [],
  );
  const countryLayer = useMemo(
    () => (
      <g>
        {MAP_COUNTRIES.map((c) => {
          const on = active.has(c.iso);
          return (
            <path
              key={c.iso}
              d={c.d}
              fill={on ? '#1c2230' : '#141821'}
              stroke={on ? 'rgba(148,163,184,0.28)' : 'rgba(148,163,184,0.12)'}
              strokeWidth={0.7}
              strokeLinejoin="round"
              style={{ transition: 'fill 0.8s ease, stroke 0.8s ease' }}
            />
          );
        })}
        {/* světla měst — rozsvícení země = rozsvícení jejích světel */}
        {dotPaths.map((c) => (
          <path
            key={c.iso}
            d={c.d}
            fill="#ffd9a0"
            opacity={active.has(c.iso) ? 0.85 : 0.05}
            style={{ transition: 'opacity 1.1s ease' }}
          />
        ))}
        {/* záře velkých měst v aktivních zemích */}
        {MAP_COUNTRIES.filter((c) => active.has(c.iso)).flatMap((c) =>
          c.cities.map((city) => (
            <circle key={`${c.iso}-${city.name}`} cx={city.x} cy={city.y} r={11} fill="url(#dsGlow)" />
          )),
        )}
        {launching && (
          <path d={byIso[launching].d} fill="url(#dsGrad)" className="ds-launch" />
        )}
      </g>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeKey, launching, dotPaths],
  );

  /* Seznam kroků — pod videem v pravém sloupci (font nadpisu, zelené
     číslo, bílý text, linky mezi řádky); aktivní krok svítí gradientem
     stejně jako dřív. */
  const gradText = 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent';
  const stepsList = (
    <div className="mt-7 sm:mt-9">
      {STEPS.map((label, i) => {
        const on = step === i + 1;
        return (
          <div key={label}>
            <div className="flex items-baseline gap-4 py-2 sm:gap-6 sm:py-2.5">
              <span className={`text-xs font-semibold tabular-nums sm:text-sm ${on ? gradText : 'text-emerald-400'}`}>
                0{i + 1}
              </span>
              <span className={`font-sans text-xl font-extralight leading-tight tracking-tight transition-colors duration-300 sm:text-2xl lg:text-[1.75rem] ${on ? gradText : 'text-white'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div aria-hidden className="h-px w-full bg-white/15" />}
          </div>
        );
      })}
    </div>
  );

  const totalCents = eshopCents + tiktokCents;

  /* Karta výdělků — iOS styl dle reference, živá čísla (náhrada trezoru) */
  const earningsCard = (
    <div
      ref={cardRef}
      className="absolute -top-12 right-0 z-10 w-52 rounded-2xl bg-white p-3.5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)] sm:-right-7 sm:-top-16 sm:w-60 sm:p-4"
    >
      <div className="text-[13px] font-bold tracking-tight text-zinc-900 sm:text-sm">Daily earnings</div>
      <div className="text-[10px] text-zinc-400">All platforms · updated live</div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-cyan-400">
              <ShoppingCart className="h-3 w-3 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-[11px] font-semibold text-zinc-700">E-shop</span>
          </span>
          <span className="text-[11px] font-bold tabular-nums text-zinc-900">{eur(eshopCents)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-900">
              <Music2 className="h-3 w-3 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-[11px] font-semibold text-zinc-700">TikTok Shop</span>
          </span>
          <span className="text-[11px] font-bold tabular-nums text-zinc-900">{eur(tiktokCents)}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5">
        <span className="text-[11px] font-semibold text-zinc-500">Total today</span>
        <span key={totalCents} className="ds-bounce text-base font-extrabold tabular-nums text-zinc-900">
          {eur(totalCents)}
        </span>
      </div>
      <div className="mt-2 rounded-lg bg-emerald-50 px-2 py-1 text-center text-[10px] font-bold text-emerald-600">
        Stock invested: €0
      </div>
    </div>
  );

  /* Statická verze pro prefers-reduced-motion */
  if (reduced) {
    return (
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="h-auto w-full" role="img"
            aria-label="Dropshipping across 15 European countries: customers order and pay you first, swelt ships under your brand, and you pay wholesale only from money you already received.">
            <defs>
              <radialGradient id="dsGlowS"><stop offset="0" stopColor="#ffd9a0" stopOpacity="0.5" /><stop offset="1" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
            </defs>
            {MAP_COUNTRIES.map((c) => (
              <path key={c.iso} d={c.d} fill="#1c2230" stroke="rgba(148,163,184,0.28)" strokeWidth={0.7} strokeLinejoin="round" />
            ))}
            {Object.entries(COUNTRY_DOTS).map(([iso, dots]) => (
              <path key={iso} d={dotsToPath(dots as [number, number][], 1.05)} fill="#ffd9a0" opacity={0.8} />
            ))}
          </svg>
          <div className="relative">
            <img src={IMG.heroPoster} alt="" className="w-full rounded-2xl shadow-2xl" />
          </div>
        </div>
        <p className="mt-5 text-center text-sm text-white/60">
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
      className="relative mx-auto w-full max-w-[1240px] select-none"
      style={{ opacity: dimmed ? 0.12 : 1, transition: 'opacity 0.9s ease' }}
    >
      <style>{`
        @keyframes dsLaunch { 0% { opacity: 0 } 45% { opacity: 0.6 } 100% { opacity: 0 } }
        .ds-launch { animation: dsLaunch 1.1s ease-in-out both }
        @keyframes dsPop { from { opacity: 0; transform: scale(0.5) } to { opacity: 1; transform: scale(1) } }
        .ds-pop { animation: dsPop 0.35s ease-out both; transform-origin: center }
        @keyframes dsNotifIn { from { opacity: 0; transform: translateX(-16px) scale(0.95) } to { opacity: 1; transform: translateX(0) scale(1) } }
        .ds-notif-in { animation: dsNotifIn 0.45s ease-out both }
        @keyframes dsPark { 0% { transform: translate(-50%,-50%) scale(0.9) } 55% { transform: translate(-50%,-50%) scale(1.16) } 100% { transform: translate(-50%,-50%) scale(1.06) } }
        .ds-park { animation: dsPark 0.5s ease-out both }
        @keyframes dsCrack { 0% { transform: translate(-50%,-50%) rotate(0) } 30% { transform: translate(-51%,-50%) rotate(-2deg) } 65% { transform: translate(-49%,-50%) rotate(2deg) } 100% { transform: translate(-50%,-50%) rotate(0) } }
        .ds-crack { animation: dsCrack 0.4s ease-in-out both }
        @keyframes dsBounce { 0% { transform: scale(1) } 40% { transform: scale(1.22) } 100% { transform: scale(1) } }
        .ds-bounce { display: inline-block; animation: dsBounce 0.7s ease-out both; transform-origin: right center }
      `}</style>

      {/* preload notifikací, ať první objednávka nebliká */}
      <div className="hidden" aria-hidden>
        {[IMG.notifEshop, IMG.notifTiktok].map((src) => <img key={src} src={src} alt="" />)}
      </div>

      {/* horní odsazení = prostor pro kartu vysunutou nad rám videa */}
      <div className="mt-14 grid items-center gap-12 sm:mt-[4.5rem] sm:grid-cols-[1.12fr_1fr] sm:gap-8">
        {/* ── VLEVO: noční mapa (SVG + overlay sdílí čistý wrapper) ── */}
        <div className="relative">
          <div className="pointer-events-none absolute right-0 top-0 z-10 rounded-full bg-zinc-900/70 px-3 py-1 text-[11px] font-semibold text-white/85 backdrop-blur-sm sm:text-xs">
            Live in{' '}
            <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text font-bold text-transparent">
              {active.size}
            </span>{' '}
            of {MAP_COUNTRIES.length} countries
          </div>

          <svg ref={svgRef} viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="h-auto w-full" aria-hidden>
            <defs>
              <linearGradient id="dsGrad" x1="0" y1="0" x2={MAP_W} y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={GRAD_FROM} />
                <stop offset="0.5" stopColor={GRAD_MID} />
                <stop offset="1" stopColor={GRAD_TO} />
              </linearGradient>
              <radialGradient id="dsGlow">
                <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.45" />
                <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
              </radialGradient>
            </defs>
            {countryLayer}
            {staticArc && (
              <path d={arcD(staticArc.from, staticArc.to)} fill="none" stroke="url(#dsGrad)"
                strokeWidth={staticArc.highlight ? 2.4 : 1.6} strokeLinecap="round" opacity={0.55} />
            )}
            {flights.filter((f) => f.kind === 'arc').map((f) => {
              const t = Math.min(1, (vtRef.current - f.start) / f.dur);
              return (
                <path key={f.id} d={arcD(f.from, f.to)} fill="none" stroke="url(#dsGrad)"
                  strokeWidth={f.highlight ? 2.4 : 1.6} strokeLinecap="round"
                  pathLength={1} strokeDasharray={1} strokeDashoffset={1 - easeInOut(t)} />
              );
            })}
          </svg>

          {/* overlay: kotva bodu = tečka; chipy smí letět i mimo plátno */}
          <div className="pointer-events-none absolute inset-0 z-30 text-[11px] sm:text-xs">
            {/* chip swelt */}
            <div className="absolute" style={{ left: px(SWELT.x), top: py(SWELT.y) }}>
              <span className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 font-bold tracking-tight text-zinc-900 shadow-lg">
                swelt
              </span>
            </div>

            {/* bod Your shop */}
            {shopPt && shop && (
              <div className="absolute" style={{ left: px(shopPt.x), top: py(shopPt.y) }}>
                <span className="absolute flex h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/50" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-zinc-900 bg-white shadow" />
                </span>
                <div className="absolute top-2.5 -translate-x-1/2">
                  <div className="ds-pop">
                    <span className="whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 font-bold text-zinc-900 shadow-lg">Your shop</span>
                  </div>
                </div>
              </div>
            )}

            {/* New order */}
            {order && (
              <div className="absolute" style={{ left: px(order.pt.x), top: py(order.pt.y) }}>
                <span className="absolute flex h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 shadow" />
                </span>
                <div className="absolute top-2 -translate-x-1/2">
                  <div className="ds-pop">
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

            {/* Split nad Your shop: hold → break (2 s), pak lety */}
            {split && shopPt && (
              <div className="absolute" style={{ left: px(shopPt.x), top: py(shopPt.y - SPLIT_LIFT) }}>
                {split.phase === 'hold' ? (
                  <span className="ds-park absolute -translate-x-1/2 -translate-y-1/2">
                    <GlassAmount amount={split.total} tone="neutral" big />
                  </span>
                ) : (
                  <div className="ds-crack absolute flex -translate-x-1/2 -translate-y-1/2 gap-1">
                    <GlassAmount amount={split.profit} tone="emerald" big />
                    <GlassAmount amount={split.wholesale} tone="neutral" big />
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
                  {f.kind === 'note' && <GlassAmount amount={f.amount!} tone="neutral" />}
                  {f.kind === 'profit' && <GlassAmount amount={f.amount!} tone="emerald" />}
                  {f.kind === 'wholesale' && <GlassAmount amount={f.amount!} tone="neutral" sub="from customer's money" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── VPRAVO: video partnera + přesahující karta a notifikace ── */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
            {videoOn ? (
              <video
                src={HERO_VIDEO}
                poster={IMG.heroPoster}
                className="block h-auto w-full"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <img src={IMG.heroPoster} alt="" className="block h-auto w-full" draggable={false} />
            )}
            {/* jemné ztmavení rohů, ať overlay prvky vyniknou */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(0,0,0,0.35)_100%)]" />
          </div>

          {/* push notifikace — levý horní roh, řadí se nahoru, přetékají
              rám videa a mizí fade (HTML mimo video = hloubka) */}
          <div className="pointer-events-none absolute -left-3 top-8 z-20 w-52 sm:-left-8 sm:top-6 sm:w-60">
            {notifs.map((n, i) => (
              <div
                key={n.id}
                className="absolute inset-x-0 top-0 transition-all duration-500 ease-out"
                style={{ transform: `translateY(${-i * 52}px) scale(${1 - i * 0.03})`, opacity: i >= 3 ? 0 : 1 - i * 0.25, zIndex: 40 - i }}
              >
                <img
                  src={n.kind === 'eshop' ? IMG.notifEshop : IMG.notifTiktok}
                  alt=""
                  draggable={false}
                  className="ds-notif-in w-full rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.55)]"
                />
              </div>
            ))}
          </div>

          {earningsCard}

          {stepsList}
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
