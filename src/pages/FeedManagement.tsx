import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, RefreshCw, Save, Rss } from 'lucide-react';
import { toast } from 'sonner';

interface FeedConfig {
  id: string;
  feed_url: string;
  last_sync: string | null;
}

interface SyncLog {
  id: string;
  timestamp: string;
  status: string;
  message: string | null;
  items_processed_count: number;
}

export default function FeedManagement() {
  const { isAdmin, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const [config, setConfig] = useState<FeedConfig | null>(null);
  const [feedUrl, setFeedUrl] = useState('');
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/');
  }, [authLoading, isAdmin, navigate]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [{ data: cfg }, { data: logRows }] = await Promise.all([
      supabase
        .from('feed_config')
        .select('id, feed_url, last_sync')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('feed_sync_logs')
        .select('id, timestamp, status, message, items_processed_count')
        .order('timestamp', { ascending: false })
        .limit(20),
    ]);
    if (cfg) {
      setConfig(cfg as FeedConfig);
      setFeedUrl(cfg.feed_url ?? '');
    }
    setLogs((logRows ?? []) as SyncLog[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin, loadAll]);

  const handleSaveUrl = async () => {
    if (!config) return;
    setSaving(true);
    const { error } = await supabase
      .from('feed_config')
      .update({ feed_url: feedUrl })
      .eq('id', config.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success('Feed URL uloženo');
      loadAll();
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    const { data, error } = await supabase.functions.invoke('sync-product-feed');
    setSyncing(false);
    if (error) toast.error(error.message);
    else if (data?.success) toast.success(`Synchronizováno ${data.items_processed_count} položek`);
    else toast.error(data?.error ?? 'Synchronizace selhala');
    loadAll();
  };

  const lastLog = logs[0];
  const lastSyncLabel = config?.last_sync
    ? new Date(config.last_sync).toLocaleString('cs-CZ')
    : 'Zatím nesynchronizováno';

  if (authLoading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Zpět
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <Rss className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Správa Feedů</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Poslední synchronizace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{lastSyncLabel}</p>
              {lastLog && (
                <div className="flex items-center gap-2">
                  <StatusBadge status={lastLog.status} />
                  <span className="text-sm text-muted-foreground">
                    {lastLog.items_processed_count} položek
                  </span>
                </div>
              )}
              <Button onClick={handleManualSync} disabled={syncing} className="mt-3 w-full">
                <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Synchronizuji…' : 'Spustit ruční synchronizaci'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Konfigurace feedu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="text-sm font-medium">Feed URL</label>
              <Input
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                placeholder="https://example.com/feed.xml"
              />
              <Button onClick={handleSaveUrl} disabled={saving || !config} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Ukládám…' : 'Uložit URL'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historie synchronizací</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Načítám…</p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Žádné záznamy</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Čas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Položek</TableHead>
                    <TableHead>Zpráva</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(l.timestamp).toLocaleString('cs-CZ')}
                      </TableCell>
                      <TableCell><StatusBadge status={l.status} /></TableCell>
                      <TableCell className="text-right">{l.items_processed_count}</TableCell>
                      <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                        {l.message ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'success' ? 'default' : status === 'failure' ? 'destructive' : 'secondary';
  const label =
    status === 'success' ? 'Úspěch' : status === 'failure' ? 'Chyba' : 'Probíhá';
  return <Badge variant={variant}>{label}</Badge>;
}
