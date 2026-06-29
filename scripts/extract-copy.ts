/**
 * Copy extractor — vytěží VEŠKERÝ centralizovaný copywriting z `src/lib/i18n*.ts`
 * a uloží ho do strojově čitelného manifestu pro „Swelt Web Cockpit"
 * (admin nástroj na audit copy + struktury, stránka /admin/audit).
 *
 * i18n soubory jsou čistá data (importují jen `Lang`/`ALL_LANGS`), takže je sem
 * lze přímo naimportovat a projít. Manifest pak čte FE bez runtime parsování TS.
 *
 * Pro každý leaf string spočítáme jazykové pokrytí: jazyk je „přeložený", když
 * jeho hodnota existuje a LIŠÍ SE od anglické báze (řeší i18n-deals.ts plněný
 * přes ALL_LANGS.reduce, kde chybějící jazyky aliasují na EN).
 *
 * Spuštění:  npm run audit:extract     (nebo: npx -y tsx scripts/extract-copy.ts)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ALL_LANGS, type Lang, translations } from '../src/lib/i18n';
import { home } from '../src/lib/i18n-homepage';
import { gateway } from '../src/lib/i18n-gateway';
import { triple } from '../src/lib/i18n-triple';
import { velkoobchod } from '../src/lib/i18n-velkoobchod';
import { dropshipping } from '../src/lib/i18n-dropshipping';
import { luxury } from '../src/lib/i18n-luxury';
import { shop } from '../src/lib/i18n-shop';
import { feed } from '../src/lib/i18n-feed';
import { dealsI18n } from '../src/lib/i18n-deals';
import { checkoutText } from '../src/lib/i18n-checkout';
import { auth } from '../src/lib/i18n-auth';
import { intelligence } from '../src/lib/i18n-intelligence';

type LangDict = Record<Lang, unknown>;

interface GroupDef {
  /** zdrojový soubor (jen pro referenci v UI) */
  file: string;
  /** název exportu = `i18nGroup` v siteMap.ts */
  exportName: string;
  /** id stránky v siteMap (page node) */
  page: string;
  /** lidský popis skupiny */
  label: string;
  data: LangDict;
}

/**
 * Kurátorovaný seznam i18n skupin, které nesou skutečný copywriting.
 * Záměrně NEZAHRNUJE hodnotové mapy z i18n-filters.ts (GENDER/CATEGORY/PARAM),
 * flags, langNames, EU_COUNTRIES — to nejsou texty k revizi.
 */
const GROUPS: GroupDef[] = [
  { file: 'i18n.ts', exportName: 'translations', page: '_core', label: 'Globální texty (navbar, košík, společné UI)', data: translations as LangDict },
  { file: 'i18n-homepage.ts', exportName: 'home', page: 'index', label: 'Homepage — hero slidy + catalog gateway', data: home as LangDict },
  { file: 'i18n-gateway.ts', exportName: 'gateway', page: 'index', label: 'Gateway (login wall) sekce', data: gateway as LangDict },
  { file: 'i18n-triple.ts', exportName: 'triple', page: 'index', label: 'Triple gateway (3 vstupy)', data: triple as LangDict },
  { file: 'i18n-velkoobchod.ts', exportName: 'velkoobchod', page: 'velkoobchod', label: 'Velkoobchod landing', data: velkoobchod as LangDict },
  { file: 'i18n-dropshipping.ts', exportName: 'dropshipping', page: 'dropshipping', label: 'Dropshipping landing', data: dropshipping as LangDict },
  { file: 'i18n-luxury.ts', exportName: 'luxury', page: 'luxury', label: 'Luxury sekce', data: luxury as LangDict },
  { file: 'i18n-shop.ts', exportName: 'shop', page: 'shop', label: 'Shop / katalog landing', data: shop as LangDict },
  { file: 'i18n-feed.ts', exportName: 'feed', page: 'feed', label: 'Produktový feed pro partnery', data: feed as LangDict },
  { file: 'i18n-deals.ts', exportName: 'dealsI18n', page: 'deals', label: 'DEAL nabídky (closeout)', data: dealsI18n as LangDict },
  { file: 'i18n-checkout.ts', exportName: 'checkoutText', page: 'checkout', label: 'Checkout / pokladna', data: checkoutText as LangDict },
  { file: 'i18n-auth.ts', exportName: 'auth', page: 'auth', label: 'Přihlášení / registrace', data: auth as LangDict },
  { file: 'i18n-intelligence.ts', exportName: 'intelligence', page: 'intelligence', label: 'Intelligence (ARCHIV — není v routingu)', data: intelligence as LangDict },
];

/** Posbírá cesty ke všem leaf stringům (a.b[2].c) z kanonického EN objektu. */
function collectPaths(node: unknown, prefix: string, out: string[]): void {
  if (typeof node === 'string') {
    out.push(prefix);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectPaths(v, `${prefix}[${i}]`, out));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      collectPaths(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
}

function getByPath(root: unknown, path: string): unknown {
  const tokens = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let cur: unknown = root;
  for (const t of tokens) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[t];
  }
  return cur;
}

/** Top-level sekce = první token cesty (před první `.` nebo `[`). */
function sectionOf(path: string): string {
  const m = path.match(/^[^.[]+/);
  return m ? m[0] : path;
}

function humanize(key: string): string {
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

interface StringRec {
  keyPath: string;
  cs: string;
  en: string;
  langsPresent: Lang[];
  langsMissing: Lang[];
}
interface SectionRec {
  key: string;
  label: string;
  nodeId: string; // = `${page}::${key}` — klíč proti content_audit
  stringCount: number;
  strings: StringRec[];
}
interface GroupRec {
  file: string;
  exportName: string;
  page: string;
  label: string;
  sections: SectionRec[];
  stringCount: number;
}

const groups: GroupRec[] = [];
// globální čítač pokrytí: translated / total leaf-stringů napříč webem
const coverageHit: Record<string, number> = {};
let coverageTotal = 0;

for (const g of GROUPS) {
  const enRoot = g.data['en'];
  const csRoot = g.data['cs'];
  const paths: string[] = [];
  collectPaths(enRoot, '', paths);

  const bySection = new Map<string, StringRec[]>();

  for (const path of paths) {
    const enVal = getByPath(enRoot, path);
    const csVal = getByPath(csRoot, path);
    const en = typeof enVal === 'string' ? enVal : '';
    const cs = typeof csVal === 'string' ? csVal : '';

    const langsPresent: Lang[] = [];
    for (const l of ALL_LANGS) {
      const v = getByPath(g.data[l], path);
      if (typeof v !== 'string' || v === '') continue;
      // EN je báze → vždy „present"; ostatní jen pokud se od EN liší (skutečný překlad).
      if (l === 'en' || v !== en) langsPresent.push(l);
    }
    const langsMissing = ALL_LANGS.filter((l) => !langsPresent.includes(l));

    coverageTotal += 1;
    for (const l of langsPresent) coverageHit[l] = (coverageHit[l] ?? 0) + 1;

    const sec = sectionOf(path);
    if (!bySection.has(sec)) bySection.set(sec, []);
    bySection.get(sec)!.push({ keyPath: path, cs, en, langsPresent, langsMissing });
  }

  const sections: SectionRec[] = [...bySection.entries()].map(([key, strings]) => ({
    key,
    label: humanize(key),
    // kvalifikováno názvem skupiny — jedna stránka může mít víc i18n skupin
    // (homepage = home + gateway + triple) se stejnými klíči sekcí.
    nodeId: `${g.page}::${g.exportName}.${key}`,
    stringCount: strings.length,
    strings,
  }));

  groups.push({
    file: g.file,
    exportName: g.exportName,
    page: g.page,
    label: g.label,
    sections,
    stringCount: paths.length,
  });
}

const langCoverage = Object.fromEntries(
  ALL_LANGS.map((l) => [l, { present: coverageHit[l] ?? 0, total: coverageTotal }]),
) as Record<Lang, { present: number; total: number }>;

const manifest = {
  generatedAt: new Date().toISOString(),
  langs: ALL_LANGS,
  totalStrings: coverageTotal,
  langCoverage,
  groups,
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '../src/lib/audit/copyManifest.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

// Stručný report do konzole
const pct = (n: number) => `${Math.round((n / Math.max(coverageTotal, 1)) * 100)}%`;
console.log(`✓ Copy manifest: ${groups.length} skupin, ${coverageTotal} leaf-stringů`);
console.log(`  → ${outPath}`);
console.log('  Jazykové pokrytí (přeloženo vs. EN báze):');
for (const l of ALL_LANGS) {
  const c = langCoverage[l];
  console.log(`    ${l}: ${c.present}/${c.total}  (${pct(c.present)})`);
}
