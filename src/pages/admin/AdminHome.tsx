import { Link } from 'react-router-dom';
import {
  ArrowRight, BadgePercent, BarChart3, Bot, Boxes, ClipboardCheck, Inbox,
  LineChart, Megaphone, MessagesSquare, Rss, Users, Workflow, type LucideIcon,
} from 'lucide-react';

interface SectorTile {
  title: string;
  description: string;
  icon: LucideIcon;
  route?: string;
  /** štítek u zatím nepostavených sektorů (fáze roadmapy) */
  soon?: string;
  muted?: boolean;
}

const SECTORS: SectorTile[] = [
  { title: 'AI Workspace', description: 'Centrální chat s kontextem webu; Jarvis a preview přibudou.', icon: Bot, route: '/admin/ws' },
  { title: 'Context Hub', description: 'Kontext celého webu — export MD/JSON pro AI nástroje.', icon: Boxes, route: '/admin/context' },
  { title: 'Integrace & MCP', description: 'Registr napojených nástrojů; MCP server pro externí AI.', icon: Workflow, route: '/admin/integrations' },
  { title: 'Automatizace', description: 'Stav front, crony a ruční spouštění automatizací.', icon: Workflow, route: '/admin/automations' },
  { title: 'ERP & Objednávky', description: 'KPI, objednávky, outbox dodavatelských objednávek.', icon: BarChart3, route: '/admin/erp' },
  { title: 'Poptávky Prestige', description: 'Fronta poptávek luxusního segmentu + nabídky.', icon: Inbox, route: '/admin/poptavky' },
  { title: 'Zákazníci', description: 'Správa účtů, rolí, slev a služeb.', icon: Users, route: '/customers' },
  { title: 'Schvalování DEALů', description: 'Importované nabídky čekající na schválení.', icon: BadgePercent, route: '/admin/deals' },
  { title: 'Web Cockpit', description: 'Audit copy a struktury všech stránek webu.', icon: ClipboardCheck, route: '/admin/audit' },
  { title: 'Komunikace', description: 'Interní workspace swelt × zago.', icon: MessagesSquare, route: '/komunikace' },
  { title: 'Správa feedu', description: 'Mimo provoz — čeká na napojení nad živou tabulku.', icon: Rss, route: '/admin/feeds', muted: true },
];

const ROADMAP: SectorTile[] = [
  { title: 'Finance', description: 'Tržby, marže a náklady v čase.', icon: LineChart, soon: 'Fáze 8' },
  { title: 'Marketing', description: 'Výkon kampaní a kanálů.', icon: Megaphone, soon: 'Fáze 8' },
];

function Tile({ tile }: { tile: SectorTile }) {
  const Icon = tile.icon;
  const body = (
    <div
      className={`group relative flex h-full flex-col rounded-xl border bg-card p-5 transition-all
        ${tile.route && !tile.muted ? 'hover:-translate-y-0.5 hover:border-[#131517] hover:shadow-lg' : ''}
        ${tile.muted || tile.soon ? 'opacity-60' : ''}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#131517] text-[#d1fe17]">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        {tile.soon ? (
          <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {tile.soon}
          </span>
        ) : (
          tile.route && !tile.muted && (
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          )
        )}
      </div>
      <h3 className="text-sm font-bold">{tile.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tile.description}</p>
    </div>
  );
  return tile.route ? <Link to={tile.route}>{body}</Link> : body;
}

/**
 * Dashboard home admin shellu — rozcestník sektorů řídicího centra.
 * Fáze 0: statické dlaždice; živá KPI přijdou s Context Hubem (Fáze 1).
 */
export default function AdminHome() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Řídicí centrum
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">Swelt Admin</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Centrální mozek webu i byznysu — lidský dashboard a zároveň kontextová
            vrstva pro AI nástroje.
          </p>
        </header>

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Sektory
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SECTORS.map((t) => <Tile key={t.title} tile={t} />)}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Na roadmapě
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROADMAP.map((t) => <Tile key={t.title} tile={t} />)}
          </div>
        </section>
      </main>
    </div>
  );
}
