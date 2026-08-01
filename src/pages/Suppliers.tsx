import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BackButton } from '@/components/BackButton';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { BigDealSupplierLogo } from '@/components/BigDealSupplierLogo';

/* ── Sdílené třídy s homepage a /deals ─────────────────────────────────────
   Full-width sekce se zaobleným horním okrajem, střídání černá ↔ bílá,
   extralight nadpisy v clampu. Wrapper každé sekce nese barvu sekce
   PŘEDCHOZÍ — rohy ji odkrývají.                                          */
const DARK = '#0d0d10';
const SECTION = 'w-full rounded-t-[1.75rem] px-5 pt-16 pb-16 sm:rounded-t-[2.75rem] sm:px-10 sm:pt-24 sm:pb-24 lg:px-14';
const H2 = 'font-sans font-extralight tracking-tight leading-[1.15] text-[clamp(1.5rem,4.5vw,3rem)]';

/** Kostra obsahu, který se teprve píše — nikdy nepředstírá hotový text. */
function Placeholder({ lines = 2, dark = false }: { lines?: number; dark?: boolean }) {
  const bar = dark ? 'bg-white/10' : 'bg-slate-100';
  const widths = ['w-full', 'w-11/12', 'w-4/5', 'w-2/3'];
  return (
    <div aria-hidden className="mt-4 space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-2.5 rounded-full ${bar} ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}

/** Štítek u sekcí, kde zatím běží kostra místo finálního textu. */
function DraftChip({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        dark ? 'bg-white/10 text-zinc-400' : 'bg-slate-100 text-slate-500'
      }`}
    >
      Copy in progress
    </span>
  );
}

/**
 * /suppliers — landing dodavatelské větve (BigDealSupplier). Vstup je za
 * bránou v navigaci (SupplierGateDialog), aby se sem odběratel neproklikl
 * omylem. Struktura stojí, finální copy, gateways a formulář přijdou v další
 * fázi — proto sekce nesou kostry a štítek „Copy in progress" místo
 * vymyšlených tvrzení.
 */
export default function Suppliers() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: DARK }}>
      <Navbar onDark />
      <BackButton />

      {/* ── Hero ── */}
      <section className="px-5 pb-20 pt-32 sm:px-10 sm:pb-28 sm:pt-40 lg:px-14">
        <div className="mx-auto max-w-4xl text-center">
          <BigDealSupplierLogo className="text-3xl text-white sm:text-4xl" />
          <h1 className={`${H2} mt-8 text-white`}>
            We have liquidity for your stock.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Bring closeouts, overstock and end-of-season batches to a network of European retailers
            that buys from 1 unit.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:obchod@swelt.cz?subject=BigDealSupplier"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              Talk to us <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* ── Jak to funguje — bílá sekce, wrapper nese černou ── */}
      <div style={{ backgroundColor: DARK }}>
        <section id="how" className={`${SECTION} scroll-mt-16 bg-white text-zinc-900`}>
          <div className="mx-auto max-w-5xl">
            <DraftChip />
            <h2 className={`${H2} mt-4`}>
              <span className="text-zinc-900">Three steps </span>
              <span className="text-zinc-400">from your warehouse to ours.</span>
            </h2>

            <div className="mt-12 grid gap-8 sm:mt-16 sm:grid-cols-3">
              {['Send us the batch', 'We price and publish', 'You get paid'].map((step, i) => (
                <div key={step}>
                  <span className="text-sm font-bold text-zinc-300">0{i + 1}</span>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">{step}</h3>
                  <Placeholder lines={3} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Gateways / integrace — černá sekce, wrapper nese bílou ── */}
      <div className="bg-white">
        <section className={`${SECTION} text-white`} style={{ backgroundColor: DARK }}>
          <div className="mx-auto max-w-5xl">
            <DraftChip dark />
            <h2 className={`${H2} mt-4`}>
              <span className="text-white">Gateways </span>
              <span className="text-zinc-500">— how your data reaches us.</span>
            </h2>

            <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
              {['Spreadsheet upload', 'XML / CSV feed', 'API connection'].map((gw) => (
                <div key={gw} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-base font-semibold tracking-tight text-white">{gw}</h3>
                  <Placeholder lines={2} dark />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Co od dodavatele potřebujeme — bílá sekce ── */}
      <div style={{ backgroundColor: DARK }}>
        <section className={`${SECTION} bg-white text-zinc-900`}>
          <div className="mx-auto max-w-5xl">
            <DraftChip />
            <h2 className={`${H2} mt-4`}>
              <span className="text-zinc-900">What we need </span>
              <span className="text-zinc-400">before the first batch.</span>
            </h2>
            <div className="mt-12 grid gap-8 sm:mt-16 sm:grid-cols-2">
              {['Brands and categories', 'Batch sizes and pricing', 'Authenticity and paperwork', 'Shipping and terms'].map((topic) => (
                <div key={topic} className="border-t border-slate-200 pt-5">
                  <h3 className="text-base font-semibold tracking-tight">{topic}</h3>
                  <Placeholder lines={2} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Závěrečná CTA ── */}
      <div className="bg-white">
        <section className={`${SECTION} text-center text-white`} style={{ backgroundColor: DARK }}>
          <div className="mx-auto max-w-3xl">
            <h2 className={H2}>
              <span className="text-white">Have stock to move? </span>
              <span className="text-zinc-500">Let&rsquo;s talk.</span>
            </h2>
            <a
              href="mailto:obchod@swelt.cz?subject=BigDealSupplier"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              Talk to us <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </div>

      <ScrollToTopButton />
    </div>
  );
}
