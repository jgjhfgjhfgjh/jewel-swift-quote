/**
 * Swelt Web Cockpit — admin nástroj /admin/audit na audit copywritingu (krok 1)
 * a struktury / architektury (krok 2) celého webu najednou.
 *
 * Zdroj struktury: src/lib/audit/cockpit.ts (siteMap + copyManifest).
 * Zdroj stavu:     tabulka content_audit (hook useContentAudit).
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Download,
  ExternalLink,
  FileCode2,
  Filter,
  Languages,
  LayoutDashboard,
  MinusCircle,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';

import { useAuthContext } from '@/contexts/AuthContext';
import { useContentAudit, useUpsertAuditNode } from '@/hooks/useContentAudit';
import { ALL_LANGS, flags, langNames } from '@/lib/i18n';
import {
  AUDIT_STATUSES,
  CHECK_META,
  COCKPIT_TREE,
  FLAT_NODES,
  STATUS_META,
  STRUCTURE_DIMS,
  STRUCTURE_DIM_META,
  manifest,
  type AuditRow,
  type AuditStatus,
  type CheckState,
  type FlatNode,
  type StructureDim,
} from '@/lib/audit/cockpit';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const CHECK_CYCLE: CheckState[] = ['todo', 'ok', 'fail', 'na'];

// ── malé prezentační prvky ───────────────────────────────────────────────────
function StatusPill({
  status,
  onChange,
}: {
  status: AuditStatus;
  onChange: (s: AuditStatus) => void;
}) {
  const m = STATUS_META[status];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`inline-flex items-center gap-1.5 rounded-none border px-2 py-1 text-[11px] font-medium leading-none transition-colors ${m.chip}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
          {m.label}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[9rem]">
        {AUDIT_STATUSES.map((s) => (
          <DropdownMenuItem key={s} onClick={() => onChange(s)} className="gap-2 text-xs">
            <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
            {STATUS_META[s].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CheckIcon({ state }: { state: CheckState }) {
  if (state === 'ok') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (state === 'fail') return <XCircle className="h-4 w-4 text-rose-600" />;
  if (state === 'na') return <MinusCircle className="h-4 w-4 text-zinc-300" />;
  return <Circle className="h-4 w-4 text-zinc-300" />;
}

function StructureChecks({
  checks,
  onCycle,
  compact,
}: {
  checks: Partial<Record<StructureDim, CheckState>>;
  onCycle: (dim: StructureDim) => void;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {STRUCTURE_DIMS.map((dim) => {
        const state = checks[dim] ?? 'todo';
        return (
          <Tooltip key={dim}>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCycle(dim);
                }}
                className="rounded-none p-0.5 hover:bg-muted"
                aria-label={STRUCTURE_DIM_META[dim].label}
              >
                <CheckIcon state={state} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {compact ? STRUCTURE_DIM_META[dim].short : STRUCTURE_DIM_META[dim].label}: {CHECK_META[state].label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

function LangBar({ translated }: { translated: number }) {
  const total = ALL_LANGS.length;
  const pct = Math.round((translated / total) * 100);
  const tone = pct >= 80 ? 'bg-emerald-500' : pct >= 30 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-12 overflow-hidden rounded-none bg-muted">
            <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="tabular-nums text-[10px] text-muted-foreground">
            {translated}/{total}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-xs">Přeloženo do {translated} z {total} jazyků</TooltipContent>
    </Tooltip>
  );
}

const SOURCE_BADGE: Record<string, string> = {
  i18n: 'bg-zinc-50 text-zinc-900 border-zinc-200',
  inline: 'bg-zinc-50 text-zinc-900 border-zinc-200',
  data: 'bg-zinc-50 text-zinc-900 border-zinc-200',
  dynamic: 'bg-zinc-50 text-zinc-500 border-zinc-200',
};

// ── hlavní stránka ───────────────────────────────────────────────────────────
export default function AuditCockpit() {
  const { isAdmin, loading: authLoading, profile, user } = useAuthContext();
  const navigate = useNavigate();
  const { data: rows, isLoading, refetch, isFetching } = useContentAudit();
  const upsert = useUpsertAuditNode();
  const reviewer = profile?.company_name || user?.email || 'admin';

  const [query, setQuery] = useState('');
  const [clusterFilter, setClusterFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [onlyRisk, setOnlyRisk] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [openNodeId, setOpenNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/', { replace: true });
  }, [authLoading, isAdmin, navigate]);

  const get = (id: string): AuditRow | undefined => rows?.[id];
  const isRisk = (n: FlatNode): boolean => {
    const r = get(n.id);
    if (!r || !r.is_live) return false;
    return r.copy_status !== 'approved' || r.structure_status !== 'approved';
  };

  // KPI rollupy
  const kpi = useMemo(() => {
    const total = FLAT_NODES.length;
    let copyApproved = 0;
    let structApproved = 0;
    let live = 0;
    let risk = 0;
    for (const n of FLAT_NODES) {
      const r = rows?.[n.id];
      if (r?.copy_status === 'approved') copyApproved += 1;
      if (r?.structure_status === 'approved') structApproved += 1;
      if (r?.is_live) live += 1;
      if (r?.is_live && (r.copy_status !== 'approved' || r.structure_status !== 'approved')) risk += 1;
    }
    return { total, copyApproved, structApproved, live, risk };
  }, [rows]);

  // filtrování
  const matches = (n: FlatNode): boolean => {
    if (clusterFilter !== 'all' && n.clusterId !== clusterFilter) return false;
    if (sourceFilter !== 'all' && n.copySource !== sourceFilter) return false;
    if (onlyRisk && !isRisk(n)) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const hay = `${n.pageLabel} ${n.sectionLabel} ${n.route ?? ''} ${n.clusterLabel}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  };

  const riskNodes = useMemo(
    () =>
      FLAT_NODES.filter((n) => {
        const r = rows?.[n.id];
        return !!r && r.is_live && (r.copy_status !== 'approved' || r.structure_status !== 'approved');
      }),
    [rows],
  );

  const patch = (node_id: string, p: Partial<AuditRow>) =>
    upsert.mutate({ node_id, reviewer, ...p });

  const cycleCheck = (node_id: string, dim: StructureDim) => {
    const cur = get(node_id)?.structure_checks ?? {};
    const next = CHECK_CYCLE[(CHECK_CYCLE.indexOf(cur[dim] ?? 'todo') + 1) % CHECK_CYCLE.length];
    patch(node_id, { structure_checks: { ...cur, [dim]: next } });
  };

  const openNode = openNodeId ? FLAT_NODES.find((n) => n.id === openNodeId) ?? null : null;
  const openRow = openNodeId ? get(openNodeId) : undefined;

  if (authLoading || (isLoading && !rows)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background">
        {/* hlavička */}
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-none bg-primary/10 text-primary">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-semibold leading-tight">Swelt Web Cockpit</h1>
                <p className="text-xs text-muted-foreground">
                  Audit copy &amp; struktury — {FLAT_NODES.length} prvků napříč {COCKPIT_TREE.length} oblastmi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 rounded-none">
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} /> Obnovit
              </Button>
              <Button size="sm" onClick={() => exportCsv(rows)} className="gap-1.5 rounded-none">
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] space-y-5 px-4 py-5">
          {/* KPI */}
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard label="Copy hotovo" value={kpi.copyApproved} total={kpi.total} tone="emerald" />
            <KpiCard label="Struktura hotovo" value={kpi.structApproved} total={kpi.total} tone="emerald" />
            <KpiCard label="Živé prvky" value={kpi.live} total={kpi.total} tone="sky" />
            <KpiCard label="⚠ Živé & neověřené" value={kpi.risk} total={kpi.live} tone="rose" highlight={kpi.risk > 0} />
          </section>

          <Tabs defaultValue="structure">
            <TabsList className="rounded-none">
              <TabsTrigger value="structure" className="gap-1.5 rounded-none">
                <LayoutDashboard className="h-3.5 w-3.5" /> Struktura webu
              </TabsTrigger>
              <TabsTrigger value="langs" className="gap-1.5 rounded-none">
                <Languages className="h-3.5 w-3.5" /> Jazyky
              </TabsTrigger>
            </TabsList>

            {/* ── STRUKTURA ── */}
            <TabsContent value="structure" className="space-y-4">
              {/* red zone */}
              {riskNodes.length > 0 && (
                <div className="border border-rose-200 bg-rose-50/60 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-700">
                    <AlertTriangle className="h-4 w-4" /> Živé &amp; neověřené ({riskNodes.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {riskNodes.slice(0, 24).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => setOpenNodeId(n.id)}
                        className="inline-flex items-center gap-1 border border-rose-200 bg-white px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-100"
                      >
                        {n.pageLabel} · {n.sectionLabel}
                      </button>
                    ))}
                    {riskNodes.length > 24 && (
                      <span className="px-2 py-1 text-[11px] text-rose-500">+{riskNodes.length - 24} dalších</span>
                    )}
                  </div>
                </div>
              )}

              {/* filtry */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Hledat stránku / sekci…"
                    className="h-8 w-56 rounded-none pl-7 text-xs"
                  />
                </div>
                <select
                  value={clusterFilter}
                  onChange={(e) => setClusterFilter(e.target.value)}
                  className="h-8 rounded-none border border-input bg-background px-2 text-xs"
                >
                  <option value="all">Všechny oblasti</option>
                  {COCKPIT_TREE.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="h-8 rounded-none border border-input bg-background px-2 text-xs"
                >
                  <option value="all">Všechny zdroje textu</option>
                  <option value="i18n">i18n</option>
                  <option value="inline">inline (v JSX)</option>
                  <option value="data">data</option>
                  <option value="dynamic">dynamické</option>
                </select>
                <label className="flex h-8 cursor-pointer items-center gap-1.5 border border-input px-2 text-xs">
                  <Switch checked={onlyRisk} onCheckedChange={setOnlyRisk} />
                  <Filter className="h-3.5 w-3.5" /> Jen živé neověřené
                </label>
              </div>

              {/* strom */}
              <div className="space-y-3">
                {COCKPIT_TREE.map((cluster) => {
                  const pages = cluster.pages
                    .map((p) => ({ page: p, sections: p.sections.filter((s) => matches(flatOf(p.id, s.id))) }))
                    .filter((x) => x.sections.length > 0);
                  if (pages.length === 0) return null;
                  const open = !collapsed.has(cluster.id);
                  const clusterNodes = cluster.pages.flatMap((p) => p.sections.map((s) => flatOf(p.id, s.id)));
                  const approvedCopy = clusterNodes.filter((n) => get(n.id)?.copy_status === 'approved').length;
                  return (
                    <div key={cluster.id} className="border">
                      <button
                        onClick={() =>
                          setCollapsed((prev) => {
                            const next = new Set(prev);
                            if (next.has(cluster.id)) next.delete(cluster.id);
                            else next.add(cluster.id);
                            return next;
                          })
                        }
                        className="flex w-full items-center justify-between gap-3 bg-muted/40 px-3 py-2 text-left hover:bg-muted/70"
                      >
                        <div className="flex items-center gap-2">
                          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          <span className="text-sm font-semibold">{cluster.label}</span>
                          <span className="text-xs text-muted-foreground">{cluster.description}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="tabular-nums">copy {approvedCopy}/{clusterNodes.length}</span>
                          <div className="h-1.5 w-20 overflow-hidden rounded-none bg-muted">
                            <div className="h-full bg-emerald-500" style={{ width: `${(approvedCopy / Math.max(clusterNodes.length, 1)) * 100}%` }} />
                          </div>
                        </div>
                      </button>

                      {open && (
                        <div className="divide-y">
                          {pages.map(({ page, sections }) => (
                            <div key={page.id}>
                              <div className="flex items-center gap-2 bg-background px-3 py-1.5">
                                <span className="text-xs font-medium">{page.label}</span>
                                {page.route && (
                                  <code className="text-[10px] text-muted-foreground">{page.route}</code>
                                )}
                                {page.isLive === false && (
                                  <span className="border border-zinc-300 px-1 text-[10px] text-zinc-500">mimo provoz</span>
                                )}
                                {page.route && !page.dynamic && (
                                  <a
                                    href={page.route}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-muted-foreground hover:text-primary"
                                    title="Otevřít stránku"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                              {sections.map((s) => {
                                const node = flatOf(page.id, s.id);
                                const r = get(node.id);
                                const risk = isRisk(node);
                                return (
                                  <div
                                    key={s.id}
                                    className={`grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-1.5 pl-8 hover:bg-muted/30 ${risk ? 'bg-rose-50/40' : ''}`}
                                  >
                                    <button
                                      onClick={() => setOpenNodeId(node.id)}
                                      className="flex min-w-0 items-center gap-2 text-left"
                                    >
                                      <span className="truncate text-xs">{s.label}</span>
                                      <span className={`shrink-0 border px-1 text-[9px] uppercase ${SOURCE_BADGE[s.copySource] ?? ''}`}>
                                        {s.copySource}
                                      </span>
                                      {s.strings.length > 0 && <LangBar translated={s.fullyTranslatedLangs} />}
                                    </button>
                                    <div className="flex items-center gap-2">
                                      <StructureChecks
                                        compact
                                        checks={r?.structure_checks ?? {}}
                                        onCycle={(dim) => cycleCheck(node.id, dim)}
                                      />
                                      <span className="hidden w-px self-stretch bg-border sm:block" />
                                      <span className="text-[9px] uppercase text-muted-foreground">copy</span>
                                      <StatusPill
                                        status={r?.copy_status ?? 'todo'}
                                        onChange={(st) => patch(node.id, { copy_status: st })}
                                      />
                                      <span className="text-[9px] uppercase text-muted-foreground">struk</span>
                                      <StatusPill
                                        status={r?.structure_status ?? 'todo'}
                                        onChange={(st) => patch(node.id, { structure_status: st })}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* ── JAZYKY ── */}
            <TabsContent value="langs" className="space-y-4">
              <div className="border bg-amber-50/50 p-3 text-xs text-amber-800">
                Web deklaruje {ALL_LANGS.length} jazyků, ale reálně přeložené jsou hlavně CS/EN.
                „Přeloženo" = hodnota se liší od anglické báze. Celkem {manifest.totalStrings} textů.
              </div>
              <div className="overflow-x-auto border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left">
                      <th className="px-2 py-1.5 font-medium">Sekce webu</th>
                      {ALL_LANGS.map((l) => (
                        <th key={l} className="px-1 py-1.5 text-center font-medium" title={langNames[l]}>
                          {flags[l]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {manifest.groups.map((g) => {
                      const cov = groupCoverage(g);
                      return (
                        <tr key={g.exportName} className="border-b last:border-0">
                          <td className="px-2 py-1.5">
                            <div className="font-medium">{g.label}</div>
                            <div className="text-[10px] text-muted-foreground">{g.stringCount} textů · {g.file}</div>
                          </td>
                          {ALL_LANGS.map((l) => {
                            const pct = cov[l];
                            const tone = pct >= 80 ? 'bg-emerald-500' : pct >= 30 ? 'bg-amber-400' : pct > 0 ? 'bg-rose-300' : 'bg-zinc-100';
                            return (
                              <td key={l} className="px-1 py-1.5 text-center">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className={`mx-auto h-5 w-5 ${tone}`} />
                                  </TooltipTrigger>
                                  <TooltipContent className="text-xs">
                                    {langNames[l]}: {pct}%
                                  </TooltipContent>
                                </Tooltip>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* detail drawer */}
        <Sheet open={!!openNodeId} onOpenChange={(o) => !o && setOpenNodeId(null)}>
          <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-xl">
            {openNode && (
              <NodeDetail
                node={openNode}
                row={openRow}
                onStatus={(field, st) => patch(openNode.id, { [field]: st } as Partial<AuditRow>)}
                onCycle={(dim) => cycleCheck(openNode.id, dim)}
                onLive={(v) => patch(openNode.id, { is_live: v })}
                onNotes={(notes) => patch(openNode.id, { notes })}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}

// ── KPI karta ────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  total,
  tone,
  highlight,
}: {
  label: string;
  value: number;
  total: number;
  tone: 'emerald' | 'sky' | 'rose';
  highlight?: boolean;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const bar = tone === 'emerald' ? 'bg-emerald-500' : tone === 'sky' ? 'bg-zinc-500' : 'bg-rose-500';
  return (
    <div className={`border p-3 ${highlight ? 'border-rose-300 bg-rose-50/50' : ''}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">/ {total}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-none bg-muted">
        <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── detail uzlu (drawer) ──────────────────────────────────────────────────────
function NodeDetail({
  node,
  row,
  onStatus,
  onCycle,
  onLive,
  onNotes,
}: {
  node: FlatNode;
  row: AuditRow | undefined;
  onStatus: (field: 'copy_status' | 'structure_status', st: AuditStatus) => void;
  onCycle: (dim: StructureDim) => void;
  onLive: (v: boolean) => void;
  onNotes: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(row?.notes ?? '');
  useEffect(() => setNotes(row?.notes ?? ''), [node.id, row?.notes]);

  return (
    <>
      <SheetHeader className="border-b px-4 py-3 text-left">
        <SheetTitle className="text-sm">{node.sectionLabel}</SheetTitle>
        <SheetDescription className="text-xs">
          {node.clusterLabel} · {node.pageLabel}
        </SheetDescription>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
          <span className={`border px-1.5 py-0.5 uppercase ${SOURCE_BADGE[node.copySource] ?? ''}`}>{node.copySource}</span>
          {node.route && !node.dynamic && (
            <a href={node.route} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
              <ExternalLink className="h-3 w-3" /> {node.route}
            </a>
          )}
          {node.route && node.dynamic && <code className="text-muted-foreground">{node.route}</code>}
          {node.sourceFile && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <FileCode2 className="h-3 w-3" /> {node.sourceFile}
            </span>
          )}
        </div>
        {node.note && <p className="pt-1 text-[11px] text-amber-700">{node.note}</p>}
      </SheetHeader>

      <div className="space-y-5 px-4 py-4">
        {/* stavy */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 text-[11px] font-medium uppercase text-muted-foreground">Krok 1 — Copy</div>
            <StatusPill status={row?.copy_status ?? 'todo'} onChange={(st) => onStatus('copy_status', st)} />
          </div>
          <div>
            <div className="mb-1 text-[11px] font-medium uppercase text-muted-foreground">Krok 2 — Struktura</div>
            <StatusPill status={row?.structure_status ?? 'todo'} onChange={(st) => onStatus('structure_status', st)} />
          </div>
        </div>

        {/* checklist struktury */}
        <div>
          <div className="mb-2 text-[11px] font-medium uppercase text-muted-foreground">Checklist struktury</div>
          <div className="space-y-1.5">
            {STRUCTURE_DIMS.map((dim) => {
              const state = row?.structure_checks?.[dim] ?? 'todo';
              return (
                <button
                  key={dim}
                  onClick={() => onCycle(dim)}
                  className="flex w-full items-center justify-between border px-2 py-1.5 text-left text-xs hover:bg-muted/40"
                >
                  <span className="flex items-center gap-2">
                    <CheckIcon state={state} />
                    {STRUCTURE_DIM_META[dim].label}
                  </span>
                  <span className={`text-[11px] ${CHECK_META[state].cls}`}>{CHECK_META[state].label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">Klikem cyklíš: nezkontrolováno → OK → problém → nerelevantní.</p>
        </div>

        {/* je živé */}
        <label className="flex items-center justify-between border px-2 py-2 text-xs">
          <span>Prvek je na webu živý (počítá se do „neověřené živé")</span>
          <Switch checked={row?.is_live ?? node.isLiveDefault} onCheckedChange={onLive} />
        </label>

        {/* poznámky */}
        <div>
          <div className="mb-1 text-[11px] font-medium uppercase text-muted-foreground">Poznámky</div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => notes !== (row?.notes ?? '') && onNotes(notes)}
            placeholder="Co opravit, co ověřit, kdo na tom dělá…"
            className="min-h-[80px] rounded-none text-xs"
          />
          {row?.reviewer && (
            <p className="mt-1 text-[10px] text-muted-foreground">
              Naposledy: {row.reviewer}
              {row.updated_at ? ` · ${new Date(row.updated_at).toLocaleString('cs-CZ')}` : ''}
            </p>
          )}
        </div>

        {/* vytěžené texty */}
        {node.strings.length > 0 && (
          <div>
            <div className="mb-1 text-[11px] font-medium uppercase text-muted-foreground">
              Texty ({node.strings.length})
            </div>
            <div className="space-y-2">
              {node.strings.map((s) => (
                <div key={s.keyPath} className="border p-2 text-xs">
                  <code className="text-[10px] text-muted-foreground">{s.keyPath}</code>
                  <div className="mt-1"><span className="text-muted-foreground">CS:</span> {s.cs || <em className="text-rose-500">— chybí —</em>}</div>
                  <div><span className="text-muted-foreground">EN:</span> {s.en || <em className="text-rose-500">— chybí —</em>}</div>
                  {s.langsMissing.length > 0 && (
                    <div className="mt-1 text-[10px] text-amber-700">
                      Chybí překlad ({s.langsMissing.length}): {s.langsMissing.map((l) => flags[l]).join(' ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────
function flatOf(pageId: string, sectionId: string): FlatNode {
  return FLAT_NODES.find((n) => n.id === sectionId && n.pageId === pageId)!;
}

/** Pokrytí skupiny po jazycích v % (přeloženo do daného jazyka u kolika textů). */
function groupCoverage(g: (typeof manifest)['groups'][number]): Record<string, number> {
  const out: Record<string, number> = {};
  const strings = g.sections.flatMap((s) => s.strings);
  const total = Math.max(strings.length, 1);
  for (const l of ALL_LANGS) {
    const hit = strings.filter((s) => s.langsPresent.includes(l)).length;
    out[l] = Math.round((hit / total) * 100);
  }
  return out;
}

function exportCsv(rows: Record<string, AuditRow> | undefined) {
  const head = [
    'cluster', 'page', 'route', 'section', 'node_id', 'copy_source',
    'copy_status', 'structure_status', 'responsive', 'states', 'design', 'a11ySeo',
    'is_live', 'fully_translated_langs', 'reviewer', 'updated_at', 'notes',
  ];
  const esc = (v: unknown) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = FLAT_NODES.map((n) => {
    const r = rows?.[n.id];
    const c = r?.structure_checks ?? {};
    return [
      n.clusterLabel, n.pageLabel, n.route ?? '', n.sectionLabel, n.id, n.copySource,
      r?.copy_status ?? 'todo', r?.structure_status ?? 'todo',
      c.responsive ?? '', c.states ?? '', c.design ?? '', c.a11ySeo ?? '',
      r?.is_live ?? n.isLiveDefault, n.fullyTranslatedLangs,
      r?.reviewer ?? '', r?.updated_at ?? '', r?.notes ?? '',
    ].map(esc).join(',');
  });
  const csv = [head.join(','), ...lines].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `swelt-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
