// E-mail templates for the /prestige inquiry automation (Czech, plain text —
// same style as the order e-mails). Each mini-course part ends with an upsell
// CTA back to the inquiry funnel.

export interface InquiryLike {
  name: string;
  email: string;
  purchase_type: string;
  company: string | null;
  ico: string | null;
  phone_code: string | null;
  phone: string | null;
  quantity: string | null;
  budget: string | null;
  note: string | null;
  watches: { brand: string; model: string; custom?: boolean }[];
}

import { siteUrl } from './email.js';

const SITE = siteUrl();
const PRESTIGE_URL = `${SITE}/prestige`;

const SIGNATURE = `S pozdravem
swelt.partner — prémiový segment na poptávku
${PRESTIGE_URL}`;

function firstName(full: string): string {
  return (full || '').trim().split(/\s+/)[0] || '';
}

function watchesList(inq: InquiryLike): string {
  const real = (inq.watches ?? []).filter((w) => w.brand !== 'Konzultace');
  if (real.length === 0) return '(bez konkrétního modelu — poradenství)';
  return real.map((w) => `• ${w.brand} ${w.model}`).join('\n');
}

/** True when the customer asked for advisory ("Nevím — chci si nechat poradit"). */
export function isAdvisory(inq: InquiryLike): boolean {
  const ws = inq.watches ?? [];
  return ws.some((w) => w.brand === 'Konzultace') || ws.length === 0 || ws.every((w) => w.custom);
}

/* ── Confirmation (sent immediately) ── */
export function confirmationEmail(inq: InquiryLike): { subject: string; text: string } {
  const advisory = isAdvisory(inq);
  return {
    subject: 'Vaši poptávku jsme přijali — a máme pro Vás dárek',
    text: `Dobrý den${firstName(inq.name) ? `, ${firstName(inq.name)}` : ''},

děkujeme za Vaši poptávku v prémiovém segmentu swelt. Potvrzujeme, že jsme ji přijali — ozveme se Vám do 48 hodin${advisory ? ' s osobním doporučením od našeho specialisty' : ' se závaznou nabídkou'}.

Shrnutí Vaší poptávky:
${watchesList(inq)}
Počet kusů: ${inq.quantity ?? '1 kus'}${inq.budget ? `\nRozpočet: ${inq.budget}` : ''}${inq.purchase_type === 'company' ? `\nTyp nákupu: na firmu${inq.company ? ` (${inq.company})` : ''} — s velkoobchodní cenou` : '\nTyp nákupu: osobní'}

DÁREK PRO VÁS — Hodinkářská akademie zdarma
Jako poděkování Vám v následujících dvou týdnech pošleme pětidílný minikurz o luxusních hodinkách:
  1. Jak poznat originál a co musí obsahovat dokumentace
  2. Hodinky jako investice — které kolekce drží hodnotu
  3. Správná velikost a fit na Vašem zápěstí
  4. Údržba, servis a skladování
  5. Příběhy ikon, které se vyplatí znát

První díl dorazí pozítří. Mezitím si můžete prohlédnout náš kurátorovaný katalog:
${PRESTIGE_URL}#katalog

TIP: Nakupujete na firmu? Zajistíme Vám nejlepší možnou velkoobchodní cenu i na jediný kus.

${SIGNATURE}`,
  };
}

/* ── Admin notification (sent immediately) ── */
export function adminNotificationEmail(inq: InquiryLike & { id: string; created_at: string }): { subject: string; text: string } {
  const advisory = isAdvisory(inq);
  return {
    subject: `Nová poptávka Luxury${advisory ? ' — PORADENSTVÍ' : ''}: ${inq.name}`,
    text: `Nová poptávka z /prestige (${new Date(inq.created_at).toLocaleString('cs-CZ')})

Jméno: ${inq.name}
E-mail: ${inq.email}${inq.phone ? `\nTelefon: ${inq.phone_code ?? ''} ${inq.phone}` : ''}
Typ: ${inq.purchase_type === 'company' ? `na firmu${inq.company ? ` — ${inq.company}` : ''}${inq.ico ? ` (IČO ${inq.ico})` : ''}` : 'osobní'}
Počet kusů: ${inq.quantity ?? '1 kus'}${inq.budget ? `\nRozpočet: ${inq.budget}` : ''}${inq.note ? `\nPoznámka: ${inq.note}` : ''}

Modely:
${watchesList(inq)}
${advisory ? '\n⚠ Zákazník žádá PORADENSTVÍ — AI návrh odpovědi najdete v ERP (po vygenerování).\n' : ''}
ERP: ${SITE}/admin/poptavky`,
  };
}

/* ── Advisory reply (AI draft approved & sent by admin from the ERP) ── */
export function advisoryReplySubject(): string {
  return 'Náš tip na hodinky pro Vás — swelt prémiový segment';
}

/* ── Mini-course "Hodinkářská akademie" — 5 parts ── */
export const COURSE_SCHEDULE_DAYS: Record<string, number> = {
  course_1: 2,
  course_2: 4,
  course_3: 7,
  course_4: 10,
  course_5: 14,
};

const CTA_FOOTER = `———
Vybrali jste si, nebo stále váháte? Odpovězte na tento e-mail, nebo si nechte
nezávazně nacenit kterýkoliv model — velkoobchodní cenu na firmu zajistíme
i na jediný kus: ${PRESTIGE_URL}

${SIGNATURE}`;

export function courseEmail(part: number, inq: InquiryLike): { subject: string; text: string } {
  const hello = `Dobrý den${firstName(inq.name) ? `, ${firstName(inq.name)}` : ''},`;
  switch (part) {
    case 1:
      return {
        subject: 'Hodinkářská akademie 1/5 — Jak poznat originál',
        text: `${hello}

vítejte v prvním díle Hodinkářské akademie. Dnes o tom nejdůležitějším: pravosti.

CO MUSÍ MÍT ORIGINÁL
• Krabičku a kartu (dnes většinou plastová „warranty card" s čipem — Omega, Breitling a TAG Heuer ji párují s konkrétním číslem pouzdra).
• Sériové číslo na pouzdru, které odpovídá dokumentaci.
• Mezinárodní záruku aktivovanou autorizovaným prodejcem.

NA CO SI DÁT POZOR
• Cena výrazně pod trhem = varovný signál číslo jedna.
• „Dokumentace se ztratila" u novějších kusů.
• Nepřesné detaily: tisk na číselníku, datumovka bez lupy tam, kde má být, chod vteřinovky.

JAK TO DĚLÁME MY
Každý kus, který na poptávku zajistíme, pochází z prověřeného distribučního kanálu — s krabičkou, kartou a plnou dokumentací. Pravost garantujeme smluvně.

${CTA_FOOTER}`,
      };
    case 2:
      return {
        subject: 'Hodinkářská akademie 2/5 — Hodinky jako investice',
        text: `${hello}

druhý díl: proč některé hodinky drží hodnotu — a jiné ne.

CO DRŽÍ HODNOTU
• Ikony s dlouhou historií a stabilní poptávkou: Omega Speedmaster Moonwatch, Cartier Santos, Jaeger-LeCoultre Reverso, Breitling Navitimer.
• Ocelové sportovní modely velkých manufaktur — likvidita je u nich nejvyšší.
• Limitované edice etablovaných domů (pozor: limitovaná ≠ automaticky investiční).

CO HODNOTU ZTRÁCÍ RYCHLEJI
• Módní quartzové modely bez manufakturní tradice.
• Kusy bez dokumentace (i originál bez „papírů" ztrácí 10–20 % ceny).
• Přeleštěná pouzdra a neoriginální díly.

ZLATÉ PRAVIDLO
Kupujte, co se vám líbí — a u čeho znáte původ. Nákup za velkoobchodní cenu (na firmu ji zajistíme i na jeden kus) vám navíc od prvního dne vytváří rezervu proti maloobchodní ceně.

${CTA_FOOTER}`,
      };
    case 3:
      return {
        subject: 'Hodinkářská akademie 3/5 — Správná velikost a fit',
        text: `${hello}

třetí díl: velikost rozhoduje o tom, jestli hodinky budete nosit.

ORIENTAČNÍ PRAVIDLA
• Obvod zápěstí do 16,5 cm → pouzdro 36–39 mm.
• 16,5–18,5 cm → 39–42 mm (nejuniverzálnější rozmezí).
• Nad 18,5 cm → 42–45 mm.

NA PRŮMĚRU NEZÁLEŽÍ TOLIK JAKO NA…
• „Lug-to-lug" (vzdálenost mezi konci ouško–ouško) — nesmí přesahovat šířku zápěstí.
• Výšce pouzdra — pod manžetu košile patří do ~11 mm (např. JLC Master Ultra Thin).
• Váze — ocelový tah nosí jinak než kůže; titan (např. Locman) je o třetinu lehčí.

TIP Z PRAXE
Elegantní kusy voleme spíš menší (38–40 mm), sportovní snesou víc. Nevíte-li si rady, pošlete nám obvod zápěstí a účel — doporučíme konkrétní modely z katalogu.

${CTA_FOOTER}`,
      };
    case 4:
      return {
        subject: 'Hodinkářská akademie 4/5 — Údržba, servis a skladování',
        text: `${hello}

čtvrtý díl: jak o hodinky pečovat, aby přežily generace.

SERVISNÍ INTERVALY
• Mechanické strojky: kompletní servis jednou za 5–7 let (u moderních kalibrů s dlouhou zárukou klidně 8–10 let — např. strojky s certifikací Master Chronometer).
• Quartz: výměna baterie 2–4 roky, vždy s kontrolou těsnění.

DENNÍ PÉČE
• Vodotěsnost není věčná — těsnění nechte kontrolovat při každém servisu.
• Magnetická pole (notebooky, reproduktory) mechanickému strojku škodí; antimagnetické kalibry to řeší.
• Otočnou korunku vždy dotáhnout/zamáčknout — nejčastější příčina zatečení.

SKLADOVÁNÍ
• Suché místo, mimo přímé slunce, ideálně v původní krabičce.
• U automatů, které nenosíte denně, zvažte natahovač (watch winder) jen u kalendářních komplikací — jinak strojku prospěje klid.

${CTA_FOOTER}`,
      };
    case 5:
    default:
      return {
        subject: 'Hodinkářská akademie 5/5 — Příběhy ikon (a pozvánka)',
        text: `${hello}

závěrečný díl: tři příběhy, které se u sklenky vyprávějí nejlépe.

OMEGA SPEEDMASTER — Jediné hodinky certifikované NASA pro výstupy do volného vesmíru. Buzz Aldrin je měl na zápěstí při přistání na Měsíci v roce 1969. Dodnes se vyrábí i s ručním nátahem — věrné originálu.

JAEGER-LECOULTRE REVERSO — Vzniklo 1931 pro britské důstojníky hrající pólo v Indii: otočné pouzdro chránilo sklíčko před údery míčku. Art-deco klenot, který se nikdy nepřestal vyrábět.

TAG HEUER MONACO — První čtvercový automatický chronograf světa (1969). Steve McQueen ho proslavil ve filmu Le Mans — a od té doby patří k nejrozpoznatelnějším hodinkám vůbec.

CO DÁL?
Tímto dílem akademie končí — ale náš concierge je Vám k dispozici kdykoliv:
• Prohlédněte si kurátorovaný katalog 15 prémiových domů: ${PRESTIGE_URL}#katalog
• Odpovězte na tento e-mail a náš specialista Vám do 24 hodin doporučí konkrétní modely.
• Nakupujete na firmu? Velkoobchodní cenu zajistíme i na jediný kus.

Děkujeme, že jste akademii dočetli — a těšíme se na Vaši první (nebo další) poptávku.

${CTA_FOOTER}`,
      };
  }
}
