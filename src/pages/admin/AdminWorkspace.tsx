import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, Columns2, Eye, Mic } from 'lucide-react';
import {
  ResizableHandle, ResizablePanel, ResizablePanelGroup,
} from '@/components/ui/resizable';
import ChatSurface from '@/components/admin/ws/ChatSurface';
import PreviewSurface from '@/components/admin/ws/PreviewSurface';
import VoiceSurface from '@/components/admin/ws/VoiceSurface';
import { useAdminChannel, type AdminCommand, type SurfaceMode } from '@/lib/admin/commandBus';
import { useCommandExecutor } from '@/lib/admin/useCommandExecutor';
import { useWsStore } from '@/lib/admin/wsStore';

const MODES: { id: SurfaceMode; label: string; icon: typeof Bot }[] = [
  { id: 'chat', label: 'Chat', icon: Bot },
  { id: 'voice', label: 'Jarvis', icon: Mic },
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'split', label: 'Split', icon: Columns2 },
];

const SURFACE_VALUES: SurfaceMode[] = ['chat', 'voice', 'preview', 'split'];

/**
 * Workspace — tři surfaces (chat / Jarvis / preview) + split. URL-adresovatelné
 * (?surface=…), takže každý mód jde otevřít ve vlastním okně na vlastním
 * monitoru; UI stav se mezi okny synchronizuje přes command bus.
 */
export default function AdminWorkspace() {
  const [params, setParams] = useSearchParams();
  const surface = useWsStore((s) => s.surface);
  const setSurface = useWsStore((s) => s.setSurface);
  const splitRatio = useWsStore((s) => s.splitRatio);
  const setSplitRatio = useWsStore((s) => s.setSplitRatio);
  const splitLeft = useWsStore((s) => s.splitLeft);
  const setSplitLeft = useWsStore((s) => s.setSplitLeft);
  const execute = useCommandExecutor();

  // URL → store (mount + externí změna URL, např. okno na dalším monitoru)
  useEffect(() => {
    const fromUrl = params.get('surface') as SurfaceMode | null;
    if (fromUrl && SURFACE_VALUES.includes(fromUrl) && fromUrl !== surface) {
      setSurface(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // store → URL (mód přepnutý tlačítkem/chatem zůstává adresovatelný)
  useEffect(() => {
    if (params.get('surface') !== surface) {
      setParams((p) => { p.set('surface', surface); return p; }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surface]);

  // příkazy z ostatních oken — vykonat bez re-broadcastu
  const onRemote = useCallback(
    (cmd: AdminCommand) => execute(cmd, { broadcast: false }),
    [execute],
  );
  useAdminChannel(onRemote);

  return (
    <div className="flex h-svh min-h-0 flex-col bg-background">
      <div className="flex items-center gap-1 border-b px-4 py-2">
        <span className="mr-3 text-sm font-black tracking-tight">Workspace</span>
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = surface === m.id;
          return (
            <button
              key={m.id}
              onClick={() => execute({ name: 'set_layout', input: { mode: m.id } })}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                active ? 'bg-[#131517] text-white' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {m.label}
            </button>
          );
        })}
        {surface === 'split' && (
          <div className="ml-auto flex items-center gap-1 rounded-full border px-1 py-0.5">
            {(['chat', 'voice'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSplitLeft(s)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  splitLeft === s ? 'bg-[#131517] text-white' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {s === 'chat' ? 'Chat vlevo' : 'Jarvis vlevo'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1">
        {surface === 'chat' && <ChatSurface />}
        {surface === 'voice' && <VoiceSurface />}
        {surface === 'preview' && <PreviewSurface />}
        {surface === 'split' && (
          <ResizablePanelGroup
            direction="horizontal"
            onLayout={(sizes) => { if (sizes[0]) setSplitRatio(Math.round(sizes[0])); }}
          >
            <ResizablePanel defaultSize={splitRatio} minSize={25}>
              {splitLeft === 'voice' ? <VoiceSurface /> : <ChatSurface />}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={100 - splitRatio} minSize={25}>
              <PreviewSurface />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
