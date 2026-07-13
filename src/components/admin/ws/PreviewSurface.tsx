import { useMemo, useState } from 'react';
import { ExternalLink, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { SITE_MAP } from '@/lib/audit/siteMap';
import type { AdminViewAs } from '@/lib/store';
import { useCommandExecutor } from '@/lib/admin/useCommandExecutor';
import { useWsStore } from '@/lib/admin/wsStore';

const LEVELS: { value: AdminViewAs; label: string }[] = [
  { value: 'real', label: 'Admin' },
  { value: 'guest', label: 'Host' },
  { value: 'lead', label: 'Lead' },
  { value: 'customer', label: 'Zákazník' },
  { value: 'b2b', label: 'B2B' },
];

/** Stránky vhodné pro preview — vše kromě admin nástrojů, bez dynamických rout. */
const PREVIEW_CLUSTERS = SITE_MAP
  .filter((c) => c.id !== 'admin' && c.id !== 'archive')
  .map((c) => ({
    id: c.id,
    label: c.label,
    pages: c.pages.filter((p) => p.route && !p.dynamic && p.isLive !== false),
  }))
  .filter((c) => c.pages.length > 0);

/**
 * Multi-audience preview — živý iframe webu očima zvolené zákaznické vrstvy.
 * Vrstva se přepíná bez reloadu (BroadcastChannel → previewBridge v iframu);
 * změna stránky iframe remountne s aktuální vrstvou v query paramu.
 */
export default function PreviewSurface() {
  const previewPage = useWsStore((s) => s.previewPage);
  const previewAudience = useWsStore((s) => s.previewAudience);
  const setPreviewPage = useWsStore((s) => s.setPreviewPage);
  const execute = useCommandExecutor();
  const [reloadKey, setReloadKey] = useState(0);

  // src jen z page + reloadKey — změna vrstvy jde broadcastem, ne reloadem
  const src = useMemo(() => {
    const sep = previewPage.includes('?') ? '&' : '?';
    return `${previewPage}${sep}wsPreview=1&viewAs=${previewAudience}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewPage, reloadKey]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
        <Select value={previewPage} onValueChange={setPreviewPage}>
          <SelectTrigger className="h-8 w-[240px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PREVIEW_CLUSTERS.map((c) => (
              <SelectGroup key={c.id}>
                <SelectLabel>{c.label}</SelectLabel>
                {c.pages.map((p) => (
                  <SelectItem key={p.id} value={p.route!}>
                    {p.label} <span className="text-muted-foreground">({p.route})</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-0.5 rounded-full border px-1 py-0.5">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() =>
                execute({ name: 'set_preview_audience', input: { audience: l.value } })
              }
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                previewAudience === l.value
                  ? 'bg-[#131517] text-[#d1fe17]'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Znovu načíst"
            onClick={() => setReloadKey((k) => k + 1)}>
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Otevřít v novém okně"
            onClick={() => window.open(src, '_blank')}>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <iframe
        key={src}
        src={src}
        title={`Preview ${previewPage} (${previewAudience})`}
        className="min-h-0 flex-1 w-full border-0 bg-white"
      />
    </div>
  );
}
