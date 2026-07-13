import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, Columns2, Eye, Mic } from 'lucide-react';
import ChatSurface from '@/components/admin/ws/ChatSurface';
import { useAdminChannel, type AdminCommand, type SurfaceMode } from '@/lib/admin/commandBus';
import { useCommandExecutor } from '@/lib/admin/useCommandExecutor';
import { useWsStore } from '@/lib/admin/wsStore';

const MODES: { id: SurfaceMode; label: string; icon: typeof Bot; soon?: string }[] = [
  { id: 'chat', label: 'Chat', icon: Bot },
  { id: 'voice', label: 'Jarvis', icon: Mic, soon: 'Fáze 4' },
  { id: 'preview', label: 'Preview', icon: Eye, soon: 'Fáze 3' },
  { id: 'split', label: 'Split', icon: Columns2, soon: 'Fáze 5' },
];

function SurfacePlaceholder({ label, phase }: { label: string; phase: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="mt-1">Přijde ve {phase} — zatím použij Chat.</p>
      </div>
    </div>
  );
}

/**
 * Workspace shell — URL-adresovatelné surfaces (?surface=chat|voice|preview|split),
 * takže každý mód jde otevřít ve vlastním okně/monitoru. Broadcast příkazů
 * z jiných oken se aplikuje přes command bus.
 */
export default function AdminWorkspace() {
  const [params, setParams] = useSearchParams();
  const surface = useWsStore((s) => s.surface);
  const setSurface = useWsStore((s) => s.setSurface);
  const execute = useCommandExecutor();

  // URL → store (mount + změny URL, např. otevření ?surface=preview na monitoru)
  useEffect(() => {
    const fromUrl = params.get('surface') as SurfaceMode | null;
    if (fromUrl && ['chat', 'voice', 'preview', 'split'].includes(fromUrl) && fromUrl !== surface) {
      setSurface(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // store → URL (přepnutí módu tlačítkem/chatem drží adresovatelnost)
  useEffect(() => {
    if (params.get('surface') !== surface) {
      setParams((p) => { p.set('surface', surface); return p; }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surface]);

  // příkazy z ostatních oken (BroadcastChannel) — bez re-broadcastu
  const onRemote = useCallback(
    (cmd: AdminCommand) => execute(cmd, { broadcast: false }),
    [execute],
  );
  useAdminChannel(onRemote);

  const switchTo = (mode: SurfaceMode) => execute({ name: 'set_layout', input: { mode } });

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
              onClick={() => switchTo(m.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                active ? 'bg-[#131517] text-white' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1">
        {surface === 'chat' && <ChatSurface />}
        {surface === 'voice' && <SurfacePlaceholder label="Jarvis (voice)" phase="Fázi 4" />}
        {surface === 'preview' && <SurfacePlaceholder label="Multi-audience preview" phase="Fázi 3" />}
        {surface === 'split' && <SurfacePlaceholder label="Split view" phase="Fázi 5" />}
      </div>
    </div>
  );
}
