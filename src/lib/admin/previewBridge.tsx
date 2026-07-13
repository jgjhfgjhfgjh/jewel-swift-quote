/**
 * Most mezi admin workspace a preview iframem. Preview iframe je plná appka
 * načtená s `?wsPreview=1&viewAs=<vrstva>` — tenhle modul v ní:
 *  1) při bootu nastaví adminViewAs z query paramu (store žije per dokument),
 *  2) poslouchá BroadcastChannel a živě přepíná vrstvu/stránku bez reloadu,
 *  3) říká ViewAsSwitcheru, že se nemá vykreslovat (ovládá to workspace).
 *
 * Vyhodnocuje se z PŮVODNÍ URL při načtení modulu — SPA navigace uvnitř
 * iframu query param ztratí, ale režim preview trvá po celý život dokumentu.
 */
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStore, type AdminViewAs } from '@/lib/store';
import { useAdminChannel, type AdminCommand } from './commandBus';

const bootParams = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search)
  : new URLSearchParams();

/** True, když tento dokument běží jako preview iframe workspace. */
export const IS_WS_PREVIEW = bootParams.get('wsPreview') === '1';

const VIEW_AS_VALUES: AdminViewAs[] = ['real', 'guest', 'lead', 'customer', 'b2b'];
const bootViewAs = bootParams.get('viewAs') as AdminViewAs | null;

/** Vykreslit v kořeni appky (uvnitř AuthProvider + Router). Renderuje null. */
export function PreviewBridge() {
  const { realIsAdmin } = useAuthContext();
  const setAdminViewAs = useStore((s) => s.setAdminViewAs);
  const navigate = useNavigate();

  // boot: vrstva z query paramu (jen skutečný admin, jinak param ignorujeme)
  useEffect(() => {
    if (!IS_WS_PREVIEW || !realIsAdmin) return;
    if (bootViewAs && VIEW_AS_VALUES.includes(bootViewAs)) setAdminViewAs(bootViewAs);
  }, [realIsAdmin, setAdminViewAs]);

  // živé přepínání z workspace (bez reloadu iframu)
  const onCommand = useCallback(
    (cmd: AdminCommand) => {
      if (!IS_WS_PREVIEW || !realIsAdmin) return;
      if (cmd.name !== 'set_preview_audience') return;
      if (VIEW_AS_VALUES.includes(cmd.input.audience)) setAdminViewAs(cmd.input.audience);
      if (cmd.input.page) navigate(cmd.input.page);
    },
    [realIsAdmin, setAdminViewAs, navigate],
  );
  useAdminChannel(onCommand);

  return null;
}
