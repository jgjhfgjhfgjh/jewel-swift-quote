import { Link } from 'react-router-dom';
import { ShieldCheck, Wrench, Archive, Gem, Printer, ArrowRight } from 'lucide-react';

/**
 * Digital care & authenticity guide — the after-sales gift for prestige
 * customers (linked from the aftercare_gift e-mail). Print-friendly.
 */
export default function PrestigeCareGuide() {
  return (
    <div className="min-h-screen bg-[#f7f5f1] pb-20 print:bg-white">
      <header className="bg-zinc-900 px-6 py-6 print:bg-white print:px-0">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link to="/prestige" className="font-display text-lg font-extrabold tracking-tight text-white print:text-zinc-900">
            swelt<span className="text-[#c9a86a]">.</span>partner
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 print:hidden"
          >
            <Printer className="h-3.5 w-3.5" /> Vytisknout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4">
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10 print:border-0 print:shadow-none">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9a7b4f]">Exkluzivně pro naše klienty</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-zinc-900">Průvodce péčí a pravostí</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Vše, co Vaše hodinky potřebují, aby vydržely generace — a aby kdykoliv v budoucnu
            bylo snadné doložit jejich pravost i hodnotu.
          </p>

          {/* 1 — Authenticity */}
          <section className="mt-8">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-zinc-900">
              <ShieldCheck className="h-5 w-5 text-[#9a7b4f]" /> Pravost a dokumentace
            </h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-700">
              <p><strong>Uschovejte kompletní sadu:</strong> krabičku, záruční kartu a veškeré dokumenty. Kompletní „full set" zvyšuje hodnotu hodinek o 10–20 % a je nejsilnějším důkazem původu.</p>
              <p><strong>Záruční karta</strong> u moderních kusů (Omega, Breitling, TAG Heuer…) nese čip či kód spárovaný s číslem pouzdra — nikdy ji neoddělujte od hodinek.</p>
              <p><strong>Sériové číslo</strong> na pouzdru si poznamenejte a uložte odděleně (např. do trezoru k dokladům) — pomůže při pojistné události i případném odcizení.</p>
              <p><strong>Faktura od nás</strong> slouží jako doklad nabytí z prověřeného distribučního kanálu. Pravost každého dodaného kusu garantujeme.</p>
            </div>
          </section>

          {/* 2 — Service */}
          <section className="mt-8">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-zinc-900">
              <Wrench className="h-5 w-5 text-[#9a7b4f]" /> Údržba a servis
            </h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-700">
              <p><strong>Mechanické strojky:</strong> kompletní servis jednou za 5–7 let (moderní kalibry s certifikací Master Chronometer zvládnou i 8–10 let). Vždy v autorizovaném servisu — neoriginální díly snižují hodnotu.</p>
              <p><strong>Quartz:</strong> výměna baterie po 2–4 letech, vždy s kontrolou těsnění.</p>
              <p><strong>Vodotěsnost není věčná</strong> — těsnění nechte prověřit při každém servisu, po výměně baterie a před dovolenou u vody.</p>
              <p><strong>Korunku</strong> vždy dotáhněte/zamáčkněte — je to nejčastější příčina zatečení.</p>
              <p><strong>Magnetická pole</strong> (notebooky, reproduktory, magnetické spony) mechanickému strojku škodí. Pokud se hodinky začnou předbíhat, nechte je demagnetizovat — je to úkon na pár minut.</p>
            </div>
          </section>

          {/* 3 — Storage */}
          <section className="mt-8">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-zinc-900">
              <Archive className="h-5 w-5 text-[#9a7b4f]" /> Skladování
            </h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-700">
              <p><strong>Suché místo mimo přímé slunce</strong>, ideálně v původní krabičce nebo hodinkovém kufříku. Slunce bledne číselníky i řemínky, vlhkost škodí strojku.</p>
              <p><strong>Kožené řemínky</strong> nechte po nošení vydýchat; střídání dvou řemínků výrazně prodlouží životnost obou.</p>
              <p><strong>Natahovač (watch winder)</strong> dává smysl hlavně u kalendářních komplikací, které je pracné znovu nastavovat — jinak strojku prospěje klid.</p>
              <p><strong>Ocelový tah</strong> občas omyjte vlažnou mýdlovou vodou a měkkým kartáčkem (pokud je kus vodotěsný a korunka dotažená).</p>
            </div>
          </section>

          {/* 4 — Investment care */}
          <section className="mt-8">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-zinc-900">
              <Gem className="h-5 w-5 text-[#9a7b4f]" /> Péče o investiční hodnotu
            </h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-700">
              <p><strong>Neleštit zbytečně.</strong> Každé leštění ubírá materiál; sběratelé preferují ostré hrany a původní povrch. Drobné rysky patří k životu hodinek.</p>
              <p><strong>Servisní historii dokládejte</strong> — uschovejte protokoly z každého servisu. Doložená historie je při prodeji stejně cenná jako stav.</p>
              <p><strong>Pojištění:</strong> hodnotnější kusy zahrňte do pojištění domácnosti (často vyžadují samostatnou položku) — poslouží faktura a sériové číslo.</p>
              <p><strong>Chystáte-li se kus jednou prodat či vyměnit,</strong> ozvěte se nám — pomůžeme s oceněním i diskrétním prodejem.</p>
            </div>
          </section>

          {/* CTA */}
          <div className="mt-10 rounded-xl bg-zinc-900 p-6 text-center print:hidden">
            <p className="font-display text-lg font-bold text-white">Přemýšlíte o dalším kusu?</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-zinc-300">Od investičních ikon po osobní dárky — zajistíme jakýkoliv model za nejlepší možnou cenu, i jediný kus.</p>
            <Link to="/prestige" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-100">
              Nezávazná poptávka <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400 print:hidden">
          swelt.partner — prémiový segment · <a href="mailto:info@swelt.cz" className="underline">info@swelt.cz</a>
        </p>
      </main>
    </div>
  );
}
