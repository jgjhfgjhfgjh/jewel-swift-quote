/**
 * Jediný exekutor příkazů command busu na klientu. Volá ho chat (SSE command
 * eventy), voice i klikací UI; broadcastuje UI-stavové příkazy ostatním oknům.
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { broadcastCommand, type AdminCommand } from './commandBus';
import { runAutomation } from './automations';
import { useWsStore } from './wsStore';

export function useCommandExecutor() {
  const navigate = useNavigate();
  const setPreview = useWsStore((s) => s.setPreview);
  const setSurface = useWsStore((s) => s.setSurface);
  const setSplitRatio = useWsStore((s) => s.setSplitRatio);

  return useCallback(
    (cmd: AdminCommand, opts?: { broadcast?: boolean }) => {
      switch (cmd.name) {
        case 'navigate':
          navigate(cmd.input.route);
          break;
        case 'set_preview_audience':
          setPreview(cmd.input.audience, cmd.input.page);
          break;
        case 'set_layout':
          setSurface(cmd.input.mode);
          if (typeof cmd.input.ratio === 'number') setSplitRatio(cmd.input.ratio);
          break;
        case 'run_automation':
          void runAutomation(cmd.input.id);
          break;
      }
      if (opts?.broadcast !== false) broadcastCommand(cmd);
    },
    [navigate, setPreview, setSurface, setSplitRatio],
  );
}
