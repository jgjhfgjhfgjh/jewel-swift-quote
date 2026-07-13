/**
 * Stav admin workspace (mód, split, provider/model chatu, preview) — per okno,
 * persistovaný do localStorage. Cross-window synchronizaci UI stavu řeší
 * command bus (BroadcastChannel), ne tento store.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminViewAs } from '@/lib/store';
import type { SurfaceMode } from './commandBus';

export type ChatProvider = 'anthropic' | 'openai';

export const DEFAULT_MODELS: Record<ChatProvider, string> = {
  anthropic: 'claude-sonnet-5',
  openai: 'gpt-4o-mini',
};

interface WsState {
  surface: SurfaceMode;
  splitRatio: number;
  /** levý panel ve split módu — ovládání hlasem, nebo chatem */
  splitLeft: 'chat' | 'voice';
  provider: ChatProvider;
  model: string;
  previewPage: string;
  previewAudience: AdminViewAs;
  setSurface: (m: SurfaceMode) => void;
  setSplitRatio: (r: number) => void;
  setSplitLeft: (s: 'chat' | 'voice') => void;
  setProvider: (p: ChatProvider) => void;
  setModel: (m: string) => void;
  setPreview: (audience: AdminViewAs, page?: string) => void;
  setPreviewPage: (page: string) => void;
}

export const useWsStore = create<WsState>()(
  persist(
    (set) => ({
      surface: 'chat',
      splitRatio: 50,
      splitLeft: 'chat',
      provider: 'anthropic',
      model: DEFAULT_MODELS.anthropic,
      previewPage: '/',
      previewAudience: 'real',
      setSurface: (surface) => set({ surface }),
      setSplitRatio: (splitRatio) => set({ splitRatio }),
      setSplitLeft: (splitLeft) => set({ splitLeft }),
      setProvider: (provider) => set({ provider, model: DEFAULT_MODELS[provider] }),
      setModel: (model) => set({ model }),
      setPreview: (previewAudience, page) =>
        set((s) => ({ previewAudience, previewPage: page ?? s.previewPage })),
      setPreviewPage: (previewPage) => set({ previewPage }),
    }),
    { name: 'swelt-admin-ws' },
  ),
);
