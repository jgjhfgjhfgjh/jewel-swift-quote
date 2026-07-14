import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgePercent, Cable, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface DealRow {
  title: string;
  slug: string;
  status: string;
  deadline: string;
  brands: string[];
}

const fmt = (d: string) => new Date(d).toLocaleDateString('cs-CZ', { dateStyle: 'medium' });

/**
 * Marketingový sektor — poctivá první verze: běžící DEAL kampaně z DB;
 * výkonová data (návštěvnost, kampaně, konverze) čekají na napojení zdroje
 * (Meta Ads / analytika) přes /admin/integrations.
 */
export default function AdminMarketing() {
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from('deals')
        .select('title, slug, status, deadline, brands')
        .order('deadline', { ascending: true })
        .limit(20);
      setDeals((data ?? []) as DealRow[]);
      setLoading(false);
    })();
  }, []);

  const stat = (label: string, value: string, hint?: string) => (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-black tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );

  const activeDeals = deals.filter((d) => new Date(d.deadline) > new Date());

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Marketing
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">Marketingové benchmarky</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Běžící kampaně z DB. Výkonová metrika (návštěvnost, CPC, konverze) se
            objeví po napojení datového zdroje.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stat('Aktivní DEALy', String(activeDeals.length))}
          {stat('DEALy celkem', String(deals.length))}
          {stat('Návštěvnost', '—', 'zdroj nenapojen')}
          {stat('Konverze', '—', 'zdroj nenapojen')}
        </section>

        <section className="mt-8 rounded-xl border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <BadgePercent className="h-3.5 w-3.5" /> DEAL kampaně
          </h2>
          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Načítání…</p>
          ) : deals.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Žádné DEALy v DB.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[11px] uppercase text-muted-foreground">
                    <th className="py-2 pr-3">Kampaň</th>
                    <th className="py-2 pr-3">Značky</th>
                    <th className="py-2 pr-3">Stav</th>
                    <th className="py-2">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((d) => {
                    const live = new Date(d.deadline) > new Date();
                    return (
                      <tr key={d.slug} className="border-b last:border-0">
                        <td className="py-2 pr-3">
                          <Link to={`/deals/${d.slug}`} className="font-semibold hover:underline">
                            {d.title}
                          </Link>
                        </td>
                        <td className="max-w-[220px] truncate py-2 pr-3 text-xs text-muted-foreground">
                          {d.brands?.join(', ') || '—'}
                        </td>
                        <td className="py-2 pr-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            live
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {live ? 'běží' : 'ukončen'}
                          </span>
                        </td>
                        <td className="py-2 tabular-nums">{fmt(d.deadline)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed bg-card p-5">
          <div className="flex items-start gap-3">
            <Megaphone className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-bold">Napoj výkonová data</h2>
              <p className="mt-1 max-w-xl text-xs text-muted-foreground">
                Kampaně (Meta Ads přes MCP), návštěvnost a konverze se sem propíšou
                po přidání zdroje v registru integrací.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/integrations"><Cable className="mr-1.5 h-3.5 w-3.5" /> Otevřít integrace</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
