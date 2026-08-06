---
name: swelt-copywriting
description: Copywriting a tone of voice pro swelt.partner. Použij VŽDY při psaní nebo úpravě jakéhokoli textu vidětelného uživatelem — headlines, podnadpisy, CTA, benefity, e-maily, landing pages, i18n slovníky (src/lib/i18n*.ts), texty pro Věru, notifikace, chybové hlášky. Triggers - copy, text, copywriting, tone of voice, headline, CTA, nadpis, slogan, přepsat text, nový text, marketingový text, write copy, reword, microcopy.
---

# Swelt — Copywriting & Tone of Voice

Pravidla pro veškeré texty na swelt.partner. Inspirováno stylem Shopify, adaptováno pro B2B platformu velkoobchodu a dropshippingu šperků a hodinek (EU trh, EUR).

> **Rozsah:** tenhle dokument platí pro **odběratelskou** stranu — pro čtenáře, který od nás kupuje. Texty pro **dodavatele** (`/suppliers`, supplier gate, oslovování značek a distributorů) mají vlastní skill `bigdealsupplier-copywriting` a jeho pravidla jsou tu záměrně obrácená (oznamovací způsob místo imperativu, zboží místo čtenáře jako hrdina). Nemíchat.

## Osobnost značky

Swelt je **schopný, energický parťák pro byznys partnera** — ne chladný korporát, ne křiklavý prodejce. Věříme, že partner na tom vydělá, a odstraňujeme mu překážky z cesty (logistika, sklad, minima, komplexita).

Tři pilíře v každém textu:
1. **Sebevědomí** — víme, co umíme, a říkáme to bez omluv. Vždy kryté číslem nebo faktem.
2. **Energie** — tempo, akce, pohyb. Krátké věty, imperativy.
3. **Přístupnost** — mluvíme lidsky a obchodně, ne úřednicky.

## Dva registry — VŽDY rozliš, pro koho píšeš

| | B2B (velkoobchod, dropshipping, DEAL, Partner Hub) | Luxury / Prestige (privátní klienti, /prestige) |
|---|---|---|
| Energie | Vysoká, prodejní, čísla marží | Klidnější, prémiová, diskrétní |
| Argumenty | Marže, skladem, expedice 24–48 h, API, bez rizika | Úspora 40–60 % vs. retail, od 1 kusu, bez IČO, diskrétní balení |
| Vzor | „Konkurenční marže pro růst vašeho podnikání." | „Prémiové hodinky a šperky. Bez kompromisů. Za velkoobchodní ceny." |

Luxury nikdy nekřičí („AKCE!!!"), ale zůstává konkrétní — luxus se u nás prodává čísly a klidem, ne mlhou.

## Jazyková pravidla (závazná)

- **Čeština = vykání.** Vždy „vy / váš" („Přihlaste se", „růst vašeho podnikání"). Nikdy tykání — tím se lišíme od Shopify předlohy; píšeme firmám.
- Imperativ a 2. osoba i při vykání: „Prodávejte", „Propojte svůj e-shop", „Začněte prodávat".
- CTA smí být v 1. osobě partnera: „Chci dropshipping", „Získat ceník".
- **Jazyky:** CS + EN se píší plnohodnotně (CS je zdroj, EN není doslovný překlad — přepiš idiomaticky). Ostatních 16 jazyků (`Lang` v `src/lib/i18n.ts`) typicky fallback na EN — neblokuj práci překladem všech, pokud to úkol nevyžaduje.
- Čísla formátuj po evropsku: „3 000+", „40–60 %", „2–4 dny" (pomlčka, mezera před % v CS, v EN bez mezery: „68% off").

## Pět pravidel psaní

1. **Krátce a úderně.** Fragmenty tvoří rytmus. Vzor z projektu: „Prémiové hodinky a šperky. Bez kompromisů. Za velkoobchodní ceny."
2. **Čtenář je hrdina.** Piš o jeho byznysu, ne o nás. Ne „nabízíme široký sortiment" → „Prodávejte 11 000+ produktů bez vlastního skladu."
3. **Prodávej výsledek, ne funkci.** Ne „máme API integraci" → „Propojte svůj e-shop během minut."
4. **Každé silné tvrzení podpři důkazem.** Čísla z projektu: 11 000+ produktů, 50+/70+ značek, slevy až 68 %, doručení EU 2–4 dny (Luxury: do 72 h), expedice 24–48 h, nabídka do 24 hodin, úspora 40–60 %. Nikdy „jsme jednička na trhu" bez čísla vedle.
5. **Lidsky, ne korporátně.** „Váš partner pro snadnou logistiku" ano; „komplexní řešení na míru" ne.

## Slovník značky

**Používej:** prodávejte, rozjeďte, propojte, získejte, začněte · marže, skladem, expedice, closeout, bez minima, bez rizika, od 1 kusu, diskrétní, ověřený partner · rychle, do 24 hodin, okamžitě.

**Zavedené termíny — neměň a nepřekládej jinak:** B2B partner, dropshipping, DEAL nabídky (velká písmena DEAL), Partner Hub, swelt.luxury, MOC (min. odběr), VOC (velkoobchodní cena), Věra (chat asistentka).

**Zakázáno:** „řešení na míru", „synergický", „inovativní portfolio", „leader na trhu" bez důkazu, trpný rod, dlouhá souvětí, žargon tam, kde stačí lidské slovo, tykání v CS.

## Vzorce pro typy textů

- **Hero nadpis:** „[Imperativ] + [velký výsledek]" nebo aspirace. Podnadpis = sen + snadnost v jedné větě: „Začněte prodávat prémiové produkty bez rizika."
- **Benefit sekce:** nadpis „[Sloveso] [výsledek]", pod ním 1–2 věty odbourávající komplexitu + konkrétní číslo.
- **Sociální důkaz:** „[Partner] začal [malý start]. Teď [velký výsledek]." Pokrýt spektrum: malý e-shop → zavedené klenotnictví → řetězec.
- **CTA:** krátké, akční, konkrétní. Ne „Odeslat" / „Zjistit více" → „Odeslat poptávku", „Získat ceník", „Chci dropshipping", „Prozkoumat dealy".
- **Onboarding/kroky:** 3 očíslované kroky těsně před finální CTA („Popište, co hledáte → Nabídka do 24 h → Zásilka k vám").
- **Chybové hlášky a microcopy:** věcně, bez viny uživatele, s dalším krokem („Přihlášení selhalo. Zkuste to znovu nebo si obnovte heslo.").

## Kde copy žije (technická pravidla)

- Veškeré UI texty jsou v `src/lib/i18n*.ts` (po sekcích: homepage, shop, deals, dropshipping, luxury, …). **Žádné hardcoded stringy v komponentách.**
- Obsah odvozený z feedu (názvy produktů, značky, kategorie, parametry) zůstává česky — závisí na něm filtrovací logika. Nepřekládat.
- Po větší úpravě copy spusť `bun run audit:extract` (extrakce copy pro Web Cockpit `/admin/audit`), ať audit odpovídá realitě.
- Nové klíče přidávej do interface + minimálně do `cs` a `en`; ostatní jazyky fallback na EN, pokud soubor nemá plné překlady.

## Checklist před odevzdáním textu

1. Správný registr (B2B vs. Luxury)?
2. Vykání v CS, žádné tykání?
3. Je čtenář hrdina a je aspoň jeden nadpis krátký a úderný?
4. Každé silné tvrzení kryté číslem/faktem z projektu?
5. Žádný korporátní žargon, žádný trpný rod?
6. Končí sekce jasnou akční CTA?
7. Text je v i18n slovníku (CS + EN), ne hardcoded?

## Před / Po (kalibrace)

**Před:** „Naše platforma nabízí komplexní řešení pro velkoobchodní prodej šperků s možností integrace více prodejních kanálů."

**Po (B2B):** „Prodávejte šperky 50+ značek bez vlastního skladu. Propojte e-shop během minut, expedujeme do 48 hodin."

**Po (Luxury):** „Hodinky světových značek za velkoobchodní ceny. Od 1 kusu, bez IČO, diskrétně až k vám."
