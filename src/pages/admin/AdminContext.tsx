import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Download, FileJson, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  buildContextBundle,
  bundleToMarkdown,
  type ContextBundle,
} from '@/lib/context/bundle';

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Context Hub — tool-agnostic kontextová vrstva webu. Statický bundle se
 * sestaví na klientu; živá KPI doplní admin-gated /api/context (jen na
 * Vercelu — pod `vite dev` API neběží a stránka to čitelně řekne).
 */
export default function AdminContext() {
  const [bundle, setBundle] = useState<ContextBundle>(() => buildContextBundle('client'));
  const [liveState, setLiveState] = useState<'loading' | 'ok' | 'unavailable'>('loading');
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(() => bundleToMarkdown(bundle), [bundle]);

  const loadLive = async () => {
    setLiveState('loading');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('no session');
      const res = await fetch('/api/context', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(String(res.status));
      const apiBundle = (await res.json()) as ContextBundle;
      setBundle(apiBundle);
      setLiveState(apiBundle.live ? 'ok' : 'unavailable');
    } catch {
      setLiveState('unavailable');
    }
  };

  useEffect(() => {
    void loadLive();
  }, []);

  const copyMd = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const stat = (label: string, value: string | number) => (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-black tabular-nums">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Context Hub
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">Kontext webu</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Jeden bundle „všechno o webu" — mapa stránek, souhrn copy, tech fakta
              a živá KPI. Export pro libovolný AI nástroj (MD/JSON) nebo napojení
              přes <code className="rounded bg-muted px-1">/api/context</code>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadLive()}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${liveState === 'loading' ? 'animate-spin' : ''}`} />
              Obnovit
            </Button>
            <Button variant="outline" size="sm" onClick={copyMd}>
              {copied ? <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
              {copied ? 'Zkopírováno' : 'Copy MD'}
            </Button>
            <Button variant="outline" size="sm"
              onClick={() => download(`swelt-context-${today()}.md`, markdown, 'text/markdown')}>
              <FileText className="mr-1.5 h-3.5 w-3.5" /> Download MD
            </Button>
            <Button size="sm"
              onClick={() => download(`swelt-context-${today()}.json`, JSON.stringify(bundle, null, 2), 'application/json')}>
              <FileJson className="mr-1.5 h-3.5 w-3.5" /> Download JSON
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stat('Stránek', bundle.site.pageCount)}
          {stat('Sekcí', bundle.site.sectionCount)}
          {stat('Copy stringů', bundle.copy.totalStrings)}
          {stat('Jazyků', bundle.copy.langs.length)}
          {stat('Produkty skladem', bundle.live ? bundle.live.products.inStock : '—')}
          {stat('Otevřené poptávky', bundle.live ? bundle.live.inquiries.open : '—')}
        </section>

        {liveState === 'unavailable' && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Živá KPI se nepodařilo načíst — <code>/api/context</code> běží jen na
            Vercelu (lokální <code>vite dev</code> serverless funkce nespouští).
            Statická část bundlu je kompletní.
          </p>
        )}

        <section className="mt-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Náhled exportu (Markdown)
          </h2>
          <pre className="max-h-[32rem] overflow-auto rounded-xl border bg-[#131517] p-5 text-xs leading-relaxed text-[#d7d7d7]">
            {markdown}
          </pre>
        </section>

        <section className="mt-8 rounded-xl border bg-card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Napojení strojů
          </h2>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
            <code className="rounded bg-muted px-2 py-1 text-xs">
              GET /api/context?format=md · Authorization: Bearer &lt;admin JWT&gt;
            </code>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Stejný bundle bude injektovat centrální chat (Fáze 2) a vystaví ho MCP
            server (Fáze 6).
          </p>
        </section>
      </main>
    </div>
  );
}
