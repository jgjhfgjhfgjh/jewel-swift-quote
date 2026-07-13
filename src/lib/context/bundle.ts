/**
 * Context Hub — jeden typovaný bundle „všechno o webu" pro lidi i stroje.
 *
 * Statická část (mapa webu, souhrn copy, tech fakta) se sestaví kdekoli —
 * na klientu i ve Vercel funkci. Živý snapshot (KPI z DB) doplňuje výhradně
 * `api/context.ts` přes service key po ověření admina.
 *
 * POZOR: záměrně relativní importy (žádný `@/` alias) — modul sdílí klient
 * (Vite) i serverless funkce (@vercel/node), a alias resolvuje jen Vite.
 */
import manifestJson from '../audit/copyManifest.json';
import { SITE_MAP, ALL_PAGES, type Audience } from '../audit/siteMap';

// ── typy ────────────────────────────────────────────────────────────────────

export interface BundlePage {
  id: string;
  label: string;
  route?: string;
  dynamic?: boolean;
  audience?: Audience[];
  copySource?: string;
  /** false = kód existuje, ale stránka není v provozu */
  isLive?: boolean;
  note?: string;
  sections: { id: string; label: string }[];
}

export interface BundleCluster {
  id: string;
  label: string;
  description?: string;
  pages: BundlePage[];
}

export interface CopySummary {
  generatedAt: string;
  langs: string[];
  totalStrings: number;
  langCoverage: Record<string, { present: number; total: number }>;
  groups: { page: string; label: string; stringCount: number }[];
}

export interface LiveSnapshot {
  fetchedAt: string;
  products: { total: number; inStock: number };
  orders: { total: number; gmv: number; marginTotal: number; awaitingPayment: number };
  inquiries: { total: number; open: number };
  deals: { total: number };
  customers: { profiles: number };
}

export interface ContextBundle {
  meta: {
    name: string;
    version: 1;
    generatedAt: string;
    /** kde byl bundle sestaven — klient nemá živá KPI */
    source: 'client' | 'api';
  };
  site: {
    clusterCount: number;
    pageCount: number;
    sectionCount: number;
    audiences: Audience[];
    clusters: BundleCluster[];
  };
  copy: CopySummary;
  tech: {
    stack: string[];
    endpoints: { path: string; auth: string; desc: string }[];
    crons: { path: string; schedule: string; desc: string }[];
    automations: string[];
  };
  live?: LiveSnapshot;
}

// ── stavba ──────────────────────────────────────────────────────────────────

interface RawManifest {
  generatedAt: string;
  langs: string[];
  totalStrings: number;
  langCoverage: Record<string, { present: number; total: number }>;
  groups: { page: string; label: string; stringCount: number }[];
}

const manifest = manifestJson as unknown as RawManifest;

/** Kurátorovaná tech fakta — udržovat ručně při změnách v api/ a vercel.json. */
const TECH = {
  stack: [
    'Vite + React 18 + TypeScript (SPA, route-level code splitting)',
    'shadcn/ui + Tailwind',
    'Supabase (Postgres + RLS, auth PKCE, storage) — projekt ktkzibhlzkoklwglkunw',
    'Vercel (hosting, serverless functions, crony — Hobby plán: crony 1×/den)',
    'zustand (klientský stav), TanStack Query (data), recharts (grafy)',
  ],
  endpoints: [
    { path: '/api/chat', auth: 'public', desc: 'Vera — zákaznický AI chat widget (stream, bez tool-callingu)' },
    { path: '/api/generate-offer', auth: 'admin (Bearer + is_admin)', desc: 'AI návrh cenové nabídky pro prestige poptávku' },
    { path: '/api/process-inquiries', auth: 'cron', desc: 'Denní zpracování prestige poptávek + e-maily' },
    { path: '/api/process-supplier-orders', auth: 'cron', desc: 'Denní outbox dodavatelských objednávek (EDI/e-mail)' },
    { path: '/api/context', auth: 'admin (Bearer + is_admin)', desc: 'Context Hub bundle (JSON/MD) se živými KPI' },
    { path: '/api/ai/chat', auth: 'admin (Bearer + is_admin)', desc: 'Centrální admin chat — context bundle + tools (command bus, query_data)' },
    { path: '/api/mcp', auth: 'Bearer MCP_TOKEN', desc: 'MCP server (streamable HTTP) — context bundle + datové dotazy pro externí AI' },
  ],
  crons: [
    { path: '/api/process-supplier-orders', schedule: '0 6 * * *', desc: 'odeslání dodavatelských objednávek' },
    { path: '/api/process-inquiries', schedule: '0 7 * * *', desc: 'prestige poptávky — potvrzení, nabídky, after-sales' },
  ],
  automations: [
    'Outbox order_emails / inquiry_emails — e-maily se řadí do fronty a odesílají dávkově',
    'DEAL ingestion — import xlsx nabídek (EN/CZ formát) přes admin UI',
    'sync-product-feed — synchronizace produktového feedu dodavatele',
  ],
};

/** Sestaví statickou část bundlu (bez živých KPI — ty doplní api/context.ts). */
export function buildContextBundle(source: 'client' | 'api' = 'client'): ContextBundle {
  const clusters: BundleCluster[] = SITE_MAP.map((c) => ({
    id: c.id,
    label: c.label,
    description: c.description,
    pages: c.pages.map((p) => ({
      id: p.id,
      label: p.label,
      route: p.route,
      dynamic: p.dynamic,
      audience: p.audience,
      copySource: p.copySource,
      isLive: p.isLive,
      note: p.note,
      sections: (p.sections ?? []).map((s) => ({ id: s.id, label: s.label })),
    })),
  }));

  return {
    meta: {
      name: 'swelt.partner — context bundle',
      version: 1,
      generatedAt: new Date().toISOString(),
      source,
    },
    site: {
      clusterCount: SITE_MAP.length,
      pageCount: ALL_PAGES.length,
      sectionCount: clusters.reduce(
        (sum, c) => sum + c.pages.reduce((s, p) => s + p.sections.length, 0),
        0,
      ),
      audiences: ['guest', 'lead', 'customer', 'b2b', 'admin'],
      clusters,
    },
    copy: {
      generatedAt: manifest.generatedAt,
      langs: manifest.langs,
      totalStrings: manifest.totalStrings,
      langCoverage: manifest.langCoverage,
      groups: manifest.groups.map((g) => ({
        page: g.page,
        label: g.label,
        stringCount: g.stringCount,
      })),
    },
    tech: TECH,
  };
}

// ── serializace do Markdownu ────────────────────────────────────────────────

export function bundleToMarkdown(b: ContextBundle): string {
  const lines: string[] = [];
  const push = (s = '') => lines.push(s);

  push(`# ${b.meta.name}`);
  push();
  push(`Vygenerováno: ${b.meta.generatedAt} (zdroj: ${b.meta.source})`);
  push();

  push('## Web — mapa stránek');
  push();
  push(`Celkem ${b.site.pageCount} stránek / ${b.site.sectionCount} sekcí v ${b.site.clusterCount} clusterech.`);
  push(`Zákaznické vrstvy (audience): ${b.site.audiences.join(', ')}.`);
  push();
  for (const c of b.site.clusters) {
    push(`### ${c.label} (\`${c.id}\`)`);
    if (c.description) push(c.description);
    push();
    for (const p of c.pages) {
      const bits = [
        p.route ? `\`${p.route}\`` : '(bez routy)',
        p.audience?.length ? `pro: ${p.audience.join('/')}` : null,
        p.isLive === false ? '**MIMO PROVOZ**' : null,
      ].filter(Boolean);
      push(`- **${p.label}** — ${bits.join(' · ')}`);
      if (p.note) push(`  - pozn.: ${p.note}`);
      if (p.sections.length) push(`  - sekce: ${p.sections.map((s) => s.label).join(', ')}`);
    }
    push();
  }

  push('## Copy (texty webu)');
  push();
  push(`${b.copy.totalStrings} stringů v ${b.copy.langs.length} jazycích (extrakce ${b.copy.generatedAt}).`);
  const cov = b.copy.langCoverage;
  const covLine = Object.keys(cov)
    .map((l) => `${l} ${Math.round((cov[l].present / b.copy.totalStrings) * 100)}%`)
    .join(', ');
  push(`Pokrytí: ${covLine}.`);
  push();
  for (const g of b.copy.groups) push(`- ${g.label} (\`${g.page}\`) — ${g.stringCount} stringů`);
  push();

  push('## Tech');
  push();
  push('### Stack');
  for (const s of b.tech.stack) push(`- ${s}`);
  push();
  push('### API endpointy');
  for (const e of b.tech.endpoints) push(`- \`${e.path}\` (${e.auth}) — ${e.desc}`);
  push();
  push('### Crony');
  for (const cr of b.tech.crons) push(`- \`${cr.path}\` @ \`${cr.schedule}\` — ${cr.desc}`);
  push();
  push('### Automatizace');
  for (const a of b.tech.automations) push(`- ${a}`);
  push();

  if (b.live) {
    push('## Živý snapshot');
    push();
    push(`Načteno: ${b.live.fetchedAt}`);
    push(`- Produkty: ${b.live.products.total} celkem, ${b.live.products.inStock} skladem`);
    push(`- Objednávky: ${b.live.orders.total} celkem · GMV €${b.live.orders.gmv.toFixed(2)} · marže €${b.live.orders.marginTotal.toFixed(2)} · ${b.live.orders.awaitingPayment} čeká na platbu`);
    push(`- Poptávky (prestige): ${b.live.inquiries.total} celkem, ${b.live.inquiries.open} otevřených`);
    push(`- DEALy: ${b.live.deals.total}`);
    push(`- Zákazníci (profily): ${b.live.customers.profiles}`);
    push();
  }

  return lines.join('\n');
}
