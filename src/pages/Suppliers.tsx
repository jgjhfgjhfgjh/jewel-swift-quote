import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Minus, Plus } from 'lucide-react';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { BigDealSupplierLogo } from '@/components/BigDealSupplierLogo';

/* ═══ BigDealSupplier — vlastní vizuální jazyk „trade desk" ═══════════════
   Dodavatelská větev záměrně NESDÍLÍ kostru odběratelského webu (střídavé
   zaoblené sekce, extralight Inter, bílé pilulky). Dodavatel hodnotí, jestli
   jsme důvěryhodná protistrana — a hlasitá landing page tuhle zkoušku
   nesloží. Proto:

     · dokument místo letáku — vlasové linky, dvousloupcová „spec" mřížka,
       mono indexy, všechno zarovnané doleva (na střed = marketing)
     · Space Grotesk medium místo Inter extralight — jiná značka, jiný hlas
     · hrany 2px místo 28px pilulek; žádné stíny, žádné gradienty
     · monochrom ink/paper, bronz jen v mikropopiscích

   Copy se řídí skillem `bigdealsupplier-copywriting` (oznamovací způsob,
   žádné imperativy, nikdy neimplikovat, že dodavatel udělal chybu).       */

const INK = '#111315';
const PAPER = '#F3F1EC';
const BRONZE = '#B0793F';

const RULE_LIGHT = 'border-[rgba(17,19,21,0.14)]';
const RULE_DARK = 'border-[rgba(255,255,255,0.14)]';

const WRAP = 'mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-12';
const SECTION = 'py-20 sm:py-28 lg:py-32';

const H2 = 'font-grotesk font-medium tracking-[-0.03em] leading-[1.05] text-[clamp(1.55rem,3.9vw,2.9rem)]';
const MONO = 'font-plex text-[10px] uppercase tracking-[0.2em] sm:text-[11px]';

/** Popisek sekce: `01 / THE POSITION` nad vlasovou linkou. */
function SectionLabel({ index, children, dark = false }: { index: string; children: string; dark?: boolean }) {
  return (
    <div className={`flex items-center gap-3 border-b pb-4 ${dark ? RULE_DARK : RULE_LIGHT}`}>
      <span className={MONO} style={{ color: BRONZE }}>{index}</span>
      <span className={`${MONO} ${dark ? 'text-zinc-400' : 'text-[#6E6A64]'}`}>{children}</span>
    </div>
  );
}

/* ── Segmenty ─────────────────────────────────────────────────────────────
   Pět situací dodavatele, každá s vlastním pořadím argumentačních vrstev
   (viz skill). U segmentu „cash isn't the issue" se o penězích záměrně
   nemluví vůbec — tam je likvidita urážka, ne nabídka.                    */
const SEGMENTS = [
  {
    id: 'pressure',
    title: 'Cash is tight and the year is closing.',
    blocks: [
      ['Cost of carry', 'Stock on the shelf costs warehouse space, insurance and tied-up capital every month it sits. None of it shows up as a loss until you write it down.'],
      ['One route out', 'One lot, one buyer, one shipment. You don’t chase small orders and you don’t invoice fifty retailers to clear a pallet.'],
      ['Nothing to set up', 'Send the file you already keep. There is nothing to build, and nothing to sign beyond the lot itself.'],
    ],
  },
  {
    id: 'strong',
    title: 'The warehouse is full. Cash isn’t the issue.',
    blocks: [
      ['The channel, not the money', 'You don’t need liquidity. You need somewhere to put stock your own channel can’t absorb without moving your prices.'],
      ['The long tail', 'We sell to small retailers who buy in single units. Reaching them one by one costs more than the margin on the lot is worth.'],
      ['What we see', 'We watch what moves across the network and at what price. You get that back before you decide anything.'],
    ],
  },
  {
    id: 'brand',
    title: 'You’re the brand, and distribution is the point.',
    blocks: [
      ['Controlled placement', 'Goods are listed under our brand, in our catalogue, to a closed network of trade buyers. Not on open marketplaces.'],
      ['No trace back', 'We don’t publish your name against the lot, and we don’t sell back into your own accounts.'],
      ['Terms first', 'Territory, floor price and channel limits are agreed before a single line goes live.'],
    ],
  },
  {
    id: 'seasonal',
    title: 'Fashion stock. Value drops every quarter.',
    blocks: [
      ['The clock', 'Seasonal goods don’t hold their price while you decide. Every quarter you wait moves the floor down for you.'],
      ['Where the category is', 'European retail is repricing and season cycles keep shortening. Stock that used to keep for a year doesn’t any more.'],
      ['The whole lot', 'We take it as it stands — mixed references, broken sizes, odd quantities. We don’t cherry-pick the good half and leave you the rest.'],
    ],
  },
  {
    id: 'entry',
    title: 'No European distribution yet.',
    blocks: [
      ['A channel on day one', 'European retail distribution without a rep, a warehouse or a customer base on this side.'],
      ['We hold the small end', 'Listings, buyer questions, order handling and returns sit with us. You ship the lot.'],
      ['Start small', 'One lot tells you what this market actually pays. No exclusivity, no volume commitment.'],
    ],
  },
] as const;

const STEPS = [
  ['You send the stock', 'One spreadsheet, an XML feed or an API connection. Brands, quantities, condition, your floor price. Nothing else.'],
  ['We price and publish', 'The lot goes live in our catalogue under our brand. Your price list stays where it is and your customers never see it.'],
  ['You get paid', 'One buyer, one invoice, one shipment — whether the lot sells to three retailers or three hundred.'],
] as const;

const GATEWAYS = [
  ['Spreadsheet', 'Send the file you already keep. We map your columns — you don’t reformat anything.'],
  ['XML / CSV feed', 'Point us at your feed. Stock levels and prices stay in sync without anyone touching them.'],
  ['API', 'A direct connection for suppliers who move stock continuously rather than in batches.'],
] as const;

/** L4 — vrstva rizika. Nejsilnější sekce stránky: prodává to, co se nestane. */
const GUARANTEES = [
  ['Your price list doesn’t move.', 'Nothing is published against your official pricing, in any market.'],
  ['Your customers don’t see it.', 'We sell to retailers you don’t supply. Where an overlap is possible, we agree the exclusion list first.'],
  ['Your name isn’t on it.', 'Lots are listed under our brand. Buyers see the goods, not the source.'],
  ['You’re not locked in.', 'No exclusivity, no volume commitment, no notice period. One lot at a time, if that’s how you want it.'],
] as const;

const QUESTIONS = [
  ['What brands, and how many pieces?', 'Rough is fine. A pallet list or a stock report is enough to start.'],
  ['What’s your floor price?', 'The number below which the lot isn’t worth moving. We work above it, or we tell you it doesn’t work.'],
  ['What paperwork exists?', 'Invoices, certificates, authorisations — whatever proves origin for the categories that need it.'],
  ['Who ships, and from where?', 'Your warehouse or ours, EXW or DDP. Both work; it changes the price, not the deal.'],
] as const;

/* TODO(rebranding): kontaktní adresa dodavatelské větve. Zbylá adresa na
   staré doméně — čeká na potvrzení nové schránky po přechodu na GoBigDeal.
   Mění se na jediném místě, stránka ji bere odsud. */
const CONTACT_EMAIL = 'obchod@swelt.cz';
const MAILTO = `mailto:${CONTACT_EMAIL}?subject=BigDealSupplier`;

/** Hranaté CTA — záměrný protiklad pilulek na odběratelském webu. */
function Cta({ variant = 'solid', href, children }: { variant?: 'solid' | 'ghost'; href: string; children: React.ReactNode }) {
  const base = 'inline-flex items-center justify-center gap-2.5 rounded-[2px] px-7 py-3.5 text-[13px] font-medium tracking-wide transition-colors duration-200';
  return (
    <a
      href={href}
      className={
        variant === 'solid'
          ? `${base} bg-[#F3F1EC] text-[#111315] hover:bg-white`
          : `${base} border border-[rgba(255,255,255,0.28)] text-[#F3F1EC] hover:bg-[rgba(255,255,255,0.08)]`
      }
    >
      {children}
    </a>
  );
}

/**
 * Vlastní hlavička dodavatelského světa. Odběratelský `Navbar` sem záměrně
 * nepatří — nese odběratelskou navigaci a „B2B registration" CTA, což popírá
 * oddělení světů, kvůli kterému stojí SupplierGateDialog. Cestu zpět drží
 * jediný odkaz na hlavní web GoBigDeal.
 */
function SupplierHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className={`${WRAP} flex items-center justify-between py-6 sm:py-7`}>
        <Link to="/suppliers" className="text-[#F3F1EC]" aria-label="BigDealSupplier — home">
          <BigDealSupplierLogo className="text-base sm:text-lg" />
        </Link>
        <div className="flex items-center gap-5 sm:gap-7">
          <Link
            to="/"
            className={`${MONO} inline-flex items-center gap-1 text-zinc-400 transition-colors hover:text-[#F3F1EC]`}
          >
            GoBigDeal <ArrowUpRight className="h-3 w-3" />
          </Link>
          <a
            href={MAILTO}
            className={`${MONO} hidden rounded-[2px] border border-[rgba(255,255,255,0.28)] px-4 py-2.5 text-[#F3F1EC] transition-colors hover:bg-[rgba(255,255,255,0.08)] sm:inline-block`}
          >
            Send us a lot
          </a>
        </div>
      </div>
    </header>
  );
}

export default function Suppliers() {
  const [openSegment, setOpenSegment] = useState<string | null>(SEGMENTS[0].id);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: PAPER, color: INK }}>
      <SupplierHeader />

      {/* ══ Hero — ledger papír na tmavé ═════════════════════════════════ */}
      <section
        className="relative overflow-hidden text-[#F3F1EC]"
        style={{
          backgroundColor: INK,
          // vlasové linky = liniovaný obchodní papír, ne dekorace
          backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.042) 0 1px, transparent 1px 36px)',
        }}
      >
        <div className={`${WRAP} pb-16 pt-32 sm:pb-20 sm:pt-40 lg:pt-44`}>
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BRONZE }} />
            <span className={`${MONO} text-zinc-400`}>European closeout desk</span>
          </div>

          <div className="mt-8">
            <BigDealSupplierLogo className="text-2xl sm:text-3xl" />
          </div>

          <h1 className="mt-9 max-w-[19ch] font-grotesk text-[clamp(2.3rem,7.2vw,5rem)] font-medium leading-[0.98] tracking-[-0.04em] sm:mt-11">
            We sell your stock where you can&rsquo;t.
          </h1>

          <p className="mt-7 max-w-[62ch] text-[15px] leading-relaxed text-zinc-400 sm:text-[17px]">
            Closeouts, overstock and end-of-season lots go to a network of small European retailers
            that buys from one unit &mdash; under our brand, off your price list.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Cta href={MAILTO}>Send us a lot <ArrowRight className="h-3.5 w-3.5" /></Cta>
            <Cta variant="ghost" href="#mechanics">How it works</Cta>
          </div>
        </div>

        {/* Spec strip — čtyři fakta o mechanice obchodu, ne o naší nabídce */}
        <div className={`${WRAP} border-t ${RULE_DARK}`}>
          <dl className="grid grid-cols-2 gap-x-6 sm:grid-cols-4 sm:gap-x-10">
            {[
              ['Sells from', '1 unit'],
              ['Listed as', 'Our brand'],
              ['Your price list', 'Untouched'],
              ['Commitment', 'None'],
            ].map(([k, v], i) => (
              /* mobil = 2×2, spodní linku nese jen první řádek; desktop = 1 řádek bez linek */
              <div key={k} className={`py-6 sm:border-b-0 sm:py-7 ${i < 2 ? 'border-b' : ''} ${RULE_DARK}`}>
                <dt className={`${MONO} text-zinc-500`}>{k}</dt>
                <dd className="mt-2.5 font-grotesk text-lg font-medium tracking-tight sm:text-xl">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ══ 01 — Pozice: přeznačení problému z likvidity na kanál ════════ */}
      <section className={`${WRAP} ${SECTION}`}>
        <SectionLabel index="01">The position</SectionLabel>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <h2 className={H2}>
            Overstock is rarely a cash problem.
            <br />
            <span className="text-[#8E8A83]">It&rsquo;s a channel problem.</span>
          </h2>
          <div className="max-w-[58ch] space-y-5 text-[15px] leading-[1.75] text-[#4A4842] sm:text-base">
            <p>
              You can&rsquo;t discount last season inside your own channel. The moment you do, your price
              list moves, your retailers ask why, and the new collection competes with the old one.
              So the stock stays where it is &mdash; not because nobody wants it, but because you
              can&rsquo;t be the one selling it cheap.
            </p>
            <p className="text-[#111315]">
              That is the job we do. We place your lots with retailers you don&rsquo;t sell to, under a
              brand that isn&rsquo;t yours, at prices you never publish.
            </p>
          </div>
        </div>
      </section>

      {/* ══ 02 — Segmenty: každý dodavatel dostane svoji argumentaci ═════ */}
      <section className={`${WRAP} pb-20 sm:pb-28 lg:pb-32`}>
        <SectionLabel index="02">Where you are</SectionLabel>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className={`${H2} max-w-[16ch]`}>Five situations. A different conversation in each.</h2>
          <p className={`${MONO} pb-1 text-[#8E8A83]`}>Pick the one closest to yours</p>
        </div>

        <div className={`mt-12 border-t ${RULE_LIGHT}`}>
          {SEGMENTS.map((seg, i) => {
            const open = openSegment === seg.id;
            return (
              <div key={seg.id} className={`border-b ${RULE_LIGHT}`}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenSegment(open ? null : seg.id)}
                    aria-expanded={open}
                    aria-controls={`seg-${seg.id}`}
                    className="group flex w-full items-baseline gap-4 py-7 text-left sm:gap-8"
                  >
                    <span className={`${MONO} shrink-0 pt-1`} style={{ color: open ? BRONZE : '#A9A49B' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`flex-1 font-grotesk text-[clamp(1.05rem,2.2vw,1.6rem)] font-medium leading-snug tracking-[-0.02em] transition-colors ${
                        open ? 'text-[#111315]' : 'text-[#57544E] group-hover:text-[#111315]'
                      }`}
                    >
                      {seg.title}
                    </span>
                    <span className="shrink-0 self-center text-[#8E8A83] transition-colors group-hover:text-[#111315]">
                      {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                </h3>

                {/* grid-rows 0fr→1fr: plynulé rozbalení bez měření výšky */}
                <div
                  id={`seg-${seg.id}`}
                  className={`grid transition-all duration-300 ease-out ${
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="grid gap-8 pb-10 sm:grid-cols-3 sm:gap-10 sm:pl-[calc(2rem+3ch)]">
                      {seg.blocks.map(([label, body]) => (
                        <div key={label}>
                          <span className={`${MONO} text-[#8E8A83]`}>{label}</span>
                          <p className="mt-3 text-[14px] leading-[1.7] text-[#4A4842] sm:text-[15px]">{body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══ 03 + 04 — Mechanika a brány, tmavý blok ══════════════════════ */}
      <div style={{ backgroundColor: INK }} className="text-[#F3F1EC]">
        <section id="mechanics" className={`${WRAP} ${SECTION} scroll-mt-4`}>
          <SectionLabel index="03" dark>The mechanics</SectionLabel>
          <h2 className={`${H2} mt-10 max-w-[18ch]`}>
            Three steps. <span className="text-zinc-500">Nothing else on your side.</span>
          </h2>

          <ol className={`mt-14 grid border-t ${RULE_DARK} sm:grid-cols-3`}>
            {STEPS.map(([title, body], i) => (
              <li
                key={title}
                className={`py-9 sm:px-7 ${i > 0 ? `border-t ${RULE_DARK} sm:border-l sm:border-t-0` : 'sm:pl-0'}`}
              >
                <span className={MONO} style={{ color: BRONZE }}>{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-4 font-grotesk text-xl font-medium tracking-[-0.02em]">{title}</h3>
                <p className="mt-3 max-w-[38ch] text-[14px] leading-[1.7] text-zinc-400 sm:text-[15px]">{body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-24 sm:mt-32">
            <SectionLabel index="04" dark>Gateways</SectionLabel>
            <h2 className={`${H2} mt-10 max-w-[20ch]`}>
              Three ways your data reaches us. <span className="text-zinc-500">Use whichever you already have.</span>
            </h2>

            <dl className={`mt-14 border-t ${RULE_DARK}`}>
              {GATEWAYS.map(([title, body]) => (
                <div key={title} className={`grid gap-2 border-b py-7 sm:grid-cols-[16rem_1fr] sm:gap-8 ${RULE_DARK}`}>
                  <dt className={`${MONO} pt-1.5 text-zinc-400`}>{title}</dt>
                  <dd className="max-w-[56ch] text-[15px] leading-[1.7] text-[#F3F1EC] sm:text-base">{body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>

      {/* ══ 05 — Co se NEstane: vrstva rizika, jádro důvěry ══════════════ */}
      <section className={`${WRAP} ${SECTION}`}>
        <SectionLabel index="05">What doesn&rsquo;t happen</SectionLabel>
        <h2 className={`${H2} mt-10 max-w-[19ch]`}>
          Most of the value here <span className="text-[#8E8A83]">is in what we don&rsquo;t do.</span>
        </h2>

        <div className={`mt-14 grid border-t ${RULE_LIGHT} sm:grid-cols-2`}>
          {GUARANTEES.map(([title, body], i) => (
            <div
              key={title}
              className={`border-b py-8 sm:py-10 ${RULE_LIGHT} ${i % 2 === 1 ? `sm:border-l sm:pl-8 ${RULE_LIGHT}` : 'sm:pr-8'}`}
            >
              <h3 className="font-grotesk text-[clamp(1.1rem,2vw,1.45rem)] font-medium tracking-[-0.02em]">{title}</h3>
              <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.7] text-[#4A4842]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 06 — Co potřebujeme: čtyři otázky z hlavy ════════════════════ */}
      <section className={`${WRAP} pb-20 sm:pb-28 lg:pb-32`}>
        <SectionLabel index="06">Before the first lot</SectionLabel>
        <h2 className={`${H2} mt-10 max-w-[20ch]`}>
          Four questions. <span className="text-[#8E8A83]">You can answer them from memory.</span>
        </h2>

        <dl className={`mt-14 border-t ${RULE_LIGHT}`}>
          {QUESTIONS.map(([q, a], i) => (
            <div key={q} className={`grid gap-2 border-b py-7 sm:grid-cols-[2.5rem_20rem_1fr] sm:gap-6 ${RULE_LIGHT}`}>
              <span className={`${MONO} hidden pt-1.5 sm:block`} style={{ color: BRONZE }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <dt className="font-grotesk text-lg font-medium tracking-[-0.02em]">{q}</dt>
              <dd className="max-w-[52ch] text-[15px] leading-[1.7] text-[#4A4842]">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ══ Závěr ═══════════════════════════════════════════════════════ */}
      <footer style={{ backgroundColor: INK }} className="text-[#F3F1EC]">
        <div className={`${WRAP} py-24 sm:py-32`}>
          <h2 className="max-w-[16ch] font-grotesk text-[clamp(2rem,5.4vw,3.6rem)] font-medium leading-[1.02] tracking-[-0.035em]">
            Have stock to move?
          </h2>
          <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-zinc-400 sm:text-[17px]">
            Send us a list. We come back with a price and a route &mdash; and nothing on your side
            changes until you accept it.
          </p>

          <div className="mt-10">
            <Cta href={MAILTO}>Send us a lot <ArrowRight className="h-3.5 w-3.5" /></Cta>
          </div>

          <p className={`${MONO} mt-8 text-zinc-500`}>
            No exclusivity &nbsp;·&nbsp; No volume commitment &nbsp;·&nbsp; Start with one lot
          </p>

          <div className={`mt-20 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between ${RULE_DARK}`}>
            <BigDealSupplierLogo className="text-base" />
            <p className={`${MONO} text-zinc-500`}>The supply side of GoBigDeal &nbsp;·&nbsp; {CONTACT_EMAIL}</p>
          </div>
        </div>
      </footer>

      <ScrollToTopButton />
    </div>
  );
}
