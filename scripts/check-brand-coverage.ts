/**
 * Brand coverage watchdog — váže metadata značek v repu na dodavatelský feed.
 *
 * Stáhne živý XML feed, odvodí kanonický seznam značek (stejná pravidla jako
 * aplikace + DB trigger `produkty_fill_manufacturer`) a ověří, že každá značka má:
 *   1. doménu loga v src/data/brands.ts (Brandfetch),
 *   2. příběh v src/data/brandStories.ts.
 *
 * Když po aktualizaci feedu přibude značka bez pokrytí, skript skončí
 * nenulovým kódem a GitHub Action viditelně selže — nové značce pak stačí
 * doplnit metadata; všechny stránky (seznam, landing page, carousely) si ji
 * z živého katalogu načtou automaticky.
 *
 * Spuštění: bun scripts/check-brand-coverage.ts
 *      nebo: npx -y tsx scripts/check-brand-coverage.ts
 */
import { toBrandKey, toDisplayName } from '../src/lib/brandNormalize';
import { getBrandByName } from '../src/data/brands';
import { BRAND_STORIES } from '../src/data/brandStories';

const FEED_URL =
  process.env.FEED_URL ??
  'https://b2bzago.com/exchange/B0AF3240-D6D6-45BA-877A-03609E6A1122/xml/feed.xml';

/** Značky vědomě bez Brandfetch loga — UI používá textový fallback. */
const NO_LOGO_OK = new Set(['ZEPPELIN']);
/** Privátní/velkoobchodní labely bez doložitelné veřejné historie (viz brandStories.ts). */
const NO_STORY_OK = new Set(['HACKER', 'LEVIEN', 'MANA']);

/** Stejné pravidlo jako DB funkce derive_manufacturer_from_category. */
function lastCategorySegment(cat: string | null): string | null {
  if (!cat) return null;
  const parts = cat.split('|').map((s) => s.trim());
  if (parts.length < 2) return null;
  return parts[parts.length - 1] || null;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function tagValue(chunk: string, tag: string): string | null {
  const m = chunk.match(
    new RegExp(`<${tag}>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${tag}>`, 'i'),
  );
  const v = m?.[1].trim();
  return v ? decodeXmlEntities(v) : null;
}

async function main() {
  console.log(`Stahuji feed: ${FEED_URL}`);
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`Stažení feedu selhalo: ${res.status} ${res.statusText}`);
  const xml = await res.text();

  const chunks = xml.split(/<product[\s>]/i).slice(1);
  if (chunks.length === 0) throw new Error('Feed neobsahuje žádný <product> element.');

  const counts = new Map<string, number>(); // kanonický klíč → počet produktů
  let unresolved = 0; // produkty bez výrobce i bez odvoditelné kategorie

  for (const chunk of chunks) {
    const manufacturer = tagValue(chunk, 'manufacturer');
    const category = tagValue(chunk, 'category_text');
    const raw = manufacturer ?? lastCategorySegment(category);
    if (!raw) {
      unresolved++;
      continue;
    }
    const key = toBrandKey(raw);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const keys = Array.from(counts.keys()).sort();
  console.log(`Produkty ve feedu: ${chunks.length}, kanonické značky: ${keys.length}\n`);

  const missingLogo: string[] = [];
  const missingStory: string[] = [];

  for (const key of keys) {
    const name = toDisplayName(key);
    if (!getBrandByName(name) && !NO_LOGO_OK.has(key)) missingLogo.push(key);
    if (!(key in BRAND_STORIES) && !NO_STORY_OK.has(key)) missingStory.push(key);
  }

  let failed = false;

  if (missingLogo.length > 0) {
    failed = true;
    console.error('❌ Značky bez domény loga v src/data/brands.ts:');
    for (const k of missingLogo) console.error(`   - ${k} (${counts.get(k)} produktů)`);
  }
  if (missingStory.length > 0) {
    failed = true;
    console.error('❌ Značky bez příběhu v src/data/brandStories.ts:');
    for (const k of missingStory) console.error(`   - ${k} (${counts.get(k)} produktů)`);
  }
  if (unresolved > 0) {
    // Jen varování — kategorie bez výrobce s < 2 segmenty se nedá přiřadit
    console.warn(`⚠️  ${unresolved} produktů bez výrobce i bez odvoditelné kategorie.`);
  }

  if (failed) {
    console.error(
      '\nNové značce stačí doplnit metadata (logo doménu / příběh) — na webu se ' +
        'všude zobrazí automaticky z živého katalogu (useBrandCatalog).',
    );
    process.exit(1);
  }

  console.log('✅ Všechny značky z feedu mají logo i příběh (nebo vědomou výjimku).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
