/**
 * Command bus admin workspace — jedna vrstva příkazů, do které ústí všechny
 * tři vstupy (klik, chat, hlas). Příkaz se vykoná lokálně a UI-stavové příkazy
 * se navíc broadcastují přes BroadcastChannel, takže se synchronizují ostatní
 * okna/monitory (a preview iframe — viz previewBridge).
 *
 * Názvy příkazů odpovídají 1:1 tool names v api/ai/chat.ts.
 */
import { useEffect } from 'react';
import type { AdminViewAs } from '@/lib/store';

export type SurfaceMode = 'chat' | 'voice' | 'preview' | 'split';

export type AdminCommand =
  | { name: 'navigate'; input: { route: string } }
  | { name: 'set_preview_audience'; input: { audience: AdminViewAs; page?: string } }
  | { name: 'set_layout'; input: { mode: SurfaceMode; ratio?: number } }
  | { name: 'run_automation'; input: { id: string } };

export const ADMIN_CHANNEL_NAME = 'swelt-admin-ws';

/** Příkazy, které se propagují do ostatních oken (sdílený UI stav). */
const BROADCAST_COMMANDS: AdminCommand['name'][] = ['set_preview_audience', 'set_layout'];

let channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  channel ??= new BroadcastChannel(ADMIN_CHANNEL_NAME);
  return channel;
}

/** Pošle příkaz ostatním oknům (lokální vykonání si řeší volající). */
export function broadcastCommand(cmd: AdminCommand): void {
  if (!BROADCAST_COMMANDS.includes(cmd.name)) return;
  getChannel()?.postMessage(cmd);
}

/** Odběr příkazů z ostatních oken. Handler dostává jen broadcastované typy. */
export function useAdminChannel(handler: (cmd: AdminCommand) => void): void {
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel(ADMIN_CHANNEL_NAME);
    const onMessage = (e: MessageEvent) => {
      const cmd = e.data as AdminCommand;
      if (cmd && typeof cmd === 'object' && 'name' in cmd) handler(cmd);
    };
    ch.addEventListener('message', onMessage);
    return () => {
      ch.removeEventListener('message', onMessage);
      ch.close();
    };
  }, [handler]);
}

/** Lidsky čitelný popis příkazu — pro log v chatu/voice UI. */
export function describeCommand(cmd: AdminCommand): string {
  switch (cmd.name) {
    case 'navigate':
      return `Navigace na ${cmd.input.route}`;
    case 'set_preview_audience':
      return `Preview jako „${cmd.input.audience}"${cmd.input.page ? ` na ${cmd.input.page}` : ''}`;
    case 'set_layout':
      return `Layout: ${cmd.input.mode}`;
    case 'run_automation':
      return `Spouštím automatizaci ${cmd.input.id}`;
    default:
      return 'Neznámý příkaz';
  }
}
