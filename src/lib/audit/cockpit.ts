/**
 * Cockpit model — spojí statickou strukturu (`siteMap.ts`) s vytěženým copy
 * (`copyManifest.json`) do jednoho stromu uzlů, proti kterému se v `/admin/audit`
 * sleduje stav verifikace (tabulka `content_audit`, klíč = node `id`).
 *
 * Pravidlo sekcí u i18n stránek: sekce s >1 stringem = vlastní uzel; všechny
 * jednotlivé labely (1 string) se sloučí do jednoho uzlu „Drobné texty / labely",
 * aby tracking zůstal v granularitě „po sekcích", ne „po stringech".
 */
import type { Lang } from '@/lib/i18n';
import { ALL_LANGS } from '@/lib/i18n';
import manifestJson from './copyManifest.json';
import {
  SITE_MAP,
  type SiteCluster,
  type SitePage,
  type CopySource,
  type Audience,
} from './siteMap';

// ── Stav verifikace ────────────────────────────────────────────────────────
export type AuditStatus = 'todo' | 'in_review' | 'approved' | 'needs_fix';
export const AUDIT_STATUSES: AuditStatus[] = ['todo', 'in_review', 'approved', 'needs_fix'];

export const STATUS_META: Record<AuditStatus, { label: string; dot: string; chip: string }> = {
  todo: { label: 'Čeká', dot: 'bg-zinc-400', chip: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  in_review: { label: 'V revizi', dot: 'bg-amber-400', chip: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Hotovo', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  needs_fix: { label: 'K opravě', dot: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const STRUCTURE_DIMS = ['responsive', 'states', 'design', 'a11ySeo'] as const;
export type StructureDim = (typeof STRUCTURE_DIMS)[number];
export const STRUCTURE_DIM_META: Record<StructureDim, { label: string; short: string }> = {
  responsive: { label: 'Responzivita a mobil', short: 'Mobil' },
  states: { label: 'UI stavy (loading / prázdno / chyba)', short: 'Stavy' },
  design: { label: 'Design konzistence (hranatění, tokeny, fonty)', short: 'Design' },
  a11ySeo: { label: 'Přístupnost & SEO (a11y, meta, alt)', short: 'A11y/SEO' },
};

export type CheckState = 'todo' | 'ok' | 'fail' | 'na';
export const CHECK_META: Record<CheckState, { label: string; cls: string }> = {
  todo: { label: 'Nezkontrolováno', cls: 'text-zinc-400' },
  ok: { label: 'OK', cls: 'text-emerald-600' },
  fail: { label: 'Problém', cls: 'text-rose-600' },
  na: { label: 'Nerelevantní', cls: 'text-zinc-300' },
};
export type StructureChecks = Partial<Record<StructureDim, CheckState>>;

/** Řádek z tabulky `content_audit`. */
export interface AuditRow {
  node_id: string;
  copy_status: AuditStatus;
  structure_status: AuditStatus;
  structure_checks: StructureChecks;
  is_live: boolean;
  notes: string | null;
  reviewer: string | null;
  updated_at: string;
}

// ── Manifest typy ──────────────────────────────────────────────────────────
export interface ManifestString {
  keyPath: string;
  cs: string;
  en: string;
  langsPresent: Lang[];
  langsMissing: Lang[];
}
export interface ManifestSection {
  key: string;
  label: string;
  nodeId: string;
  stringCount: number;
  strings: ManifestString[];
}
export interface ManifestGroup {
  file: string;
  exportName: string;
  page: string;
  label: string;
  sections: ManifestSection[];
  stringCount: number;
}
export interface CopyManifest {
  generatedAt: string;
  langs: Lang[];
  totalStrings: number;
  langCoverage: Record<Lang, { present: number; total: number }>;
  groups: ManifestGroup[];
}

export const manifest = manifestJson as unknown as CopyManifest;

// ── Sjednocený strom ───────────────────────────────────────────────────────
export interface CockpitSection {
  id: string;
  label: string;
  copySource: CopySource;
  /** vytěžené stringy (jen u i18n sekcí; inline má prázdné) */
  strings: ManifestString[];
  /** počet jazyků plně přeložených (přítomných u VŠECH stringů sekce) */
  fullyTranslatedLangs: number;
  groupLabel?: string;
  note?: string;
}
export interface CockpitPage extends Omit<SitePage, 'sections'> {
  clusterId: string;
  clusterLabel: string;
  sections: CockpitSection[];
}
export interface CockpitCluster {
  id: string;
  label: string;
  description?: string;
  pages: CockpitPage[];
}

const MISC_LABEL = 'Drobné texty / labely';

/** Kolik jazyků je přeložených u VŠECH stringů sekce (strict). */
function fullyTranslated(strings: ManifestString[]): number {
  if (strings.length === 0) return 0;
  return ALL_LANGS.filter((l) => strings.every((s) => s.langsPresent.includes(l))).length;
}

/** Z i18n skupin stránky vyrobí sekční uzly (struktura + sloučené labely). */
function sectionsFromManifest(pageId: string): CockpitSection[] {
  const groups = manifest.groups.filter((g) => g.page === pageId);
  const out: CockpitSection[] = [];
  for (const g of groups) {
    const structured = g.sections.filter((s) => s.stringCount > 1);
    const singles = g.sections.filter((s) => s.stringCount === 1);
    for (const s of structured) {
      out.push({
        id: s.nodeId,
        label: s.label,
        copySource: 'i18n',
        strings: s.strings,
        fullyTranslatedLangs: fullyTranslated(s.strings),
        groupLabel: g.label,
      });
    }
    if (singles.length > 0) {
      const strings = singles.flatMap((s) => s.strings);
      out.push({
        id: `${g.page}::${g.exportName}.__misc`,
        label: `${MISC_LABEL} (${strings.length})`,
        copySource: 'i18n',
        strings,
        fullyTranslatedLangs: fullyTranslated(strings),
        groupLabel: g.label,
      });
    }
  }
  return out;
}

/** Sestaví celý strom cockpitu (statické — bez stavu z DB). */
export function buildCockpitTree(): CockpitCluster[] {
  return SITE_MAP.map((cluster: SiteCluster) => ({
    id: cluster.id,
    label: cluster.label,
    description: cluster.description,
    pages: cluster.pages.map((page) => {
      const i18nSections = sectionsFromManifest(page.id);
      const inlineSections: CockpitSection[] = (page.sections ?? []).map((s) => ({
        id: s.id,
        label: s.label,
        copySource: s.copySource ?? page.copySource ?? 'inline',
        strings: [],
        fullyTranslatedLangs: 0,
        note: s.note,
      }));
      const sections = [...i18nSections, ...inlineSections];
      // Stránka bez deklarovaných sekcí → jeden implicitní „celá stránka" uzel.
      if (sections.length === 0) {
        sections.push({
          id: `${page.id}::__page`,
          label: 'Celá stránka',
          copySource: page.copySource ?? 'inline',
          strings: [],
          fullyTranslatedLangs: 0,
        });
      }
      const { sections: _drop, ...rest } = page;
      return {
        ...rest,
        clusterId: cluster.id,
        clusterLabel: cluster.label,
        sections,
      } as CockpitPage;
    }),
  }));
}

export const COCKPIT_TREE = buildCockpitTree();

/** Plochý seznam všech sekčních uzlů (id + kontext) — pro rollupy a default stav. */
export interface FlatNode {
  id: string;
  sectionLabel: string;
  pageId: string;
  pageLabel: string;
  route?: string;
  dynamic?: boolean;
  sourceFile?: string;
  clusterId: string;
  clusterLabel: string;
  copySource: CopySource;
  audience?: Audience[];
  /** výchozí „je živé" — page.isLive (default true), section dědí */
  isLiveDefault: boolean;
  strings: ManifestString[];
  fullyTranslatedLangs: number;
  note?: string;
}

export const FLAT_NODES: FlatNode[] = COCKPIT_TREE.flatMap((c) =>
  c.pages.flatMap((p) =>
    p.sections.map((s) => ({
      id: s.id,
      sectionLabel: s.label,
      pageId: p.id,
      pageLabel: p.label,
      route: p.route,
      dynamic: p.dynamic,
      sourceFile: p.sourceFile,
      clusterId: c.id,
      clusterLabel: c.label,
      copySource: s.copySource,
      audience: p.audience,
      isLiveDefault: p.isLive !== false,
      strings: s.strings,
      fullyTranslatedLangs: s.fullyTranslatedLangs,
      note: s.note ?? p.note,
    })),
  ),
);

export const FLAT_NODE_BY_ID: Record<string, FlatNode> = Object.fromEntries(
  FLAT_NODES.map((n) => [n.id, n]),
);

/** Výchozí (prázdný) stav uzlu, když ještě není řádek v DB. */
export function defaultRow(node: FlatNode): AuditRow {
  return {
    node_id: node.id,
    copy_status: 'todo',
    structure_status: 'todo',
    structure_checks: {},
    is_live: node.isLiveDefault,
    notes: null,
    reviewer: null,
    updated_at: '',
  };
}

/** Sloučí DB řádky s plochým seznamem uzlů → vždy plný stav pro každý uzel. */
export function mergeRows(rows: AuditRow[]): Record<string, AuditRow> {
  const byId: Record<string, AuditRow> = Object.fromEntries(rows.map((r) => [r.node_id, r]));
  const out: Record<string, AuditRow> = {};
  for (const node of FLAT_NODES) {
    out[node.id] = byId[node.id] ?? defaultRow(node);
  }
  return out;
}
