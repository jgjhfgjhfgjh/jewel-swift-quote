import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { X, Download } from 'lucide-react';

export interface LightboxItem {
  kind: 'image' | 'pdf';
  url: string;
  name?: string;
}

interface LightboxCtx {
  open: (item: LightboxItem) => void;
}

const Ctx = createContext<LightboxCtx>({ open: () => {} });

export function useLightbox() {
  return useContext(Ctx);
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<LightboxItem | null>(null);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setItem(null); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [item]);

  return (
    <Ctx.Provider value={{ open: setItem }}>
      {children}
      {item && (
        <div
          className="fixed inset-0 z-[200] flex flex-col bg-black/85 backdrop-blur-sm"
          onClick={() => setItem(null)}
        >
          <div className="flex items-center justify-between gap-2 p-3 text-white" onClick={e => e.stopPropagation()}>
            <span className="truncate text-sm">{item.name ?? ''}</span>
            <div className="flex items-center gap-1">
              <a
                href={item.url}
                target="_blank"
                rel="noopener"
                download={item.name}
                className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/15"
                title="Stáhnout / otevřít v novém okně"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                onClick={() => setItem(null)}
                className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/15"
                title="Zavřít (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center overflow-auto p-4" onClick={e => e.stopPropagation()}>
            {item.kind === 'image' ? (
              <img src={item.url} alt={item.name ?? ''} className="max-h-full max-w-full rounded object-contain" />
            ) : (
              <iframe src={item.url} title={item.name ?? 'PDF'} className="h-full w-full max-w-5xl rounded bg-white" />
            )}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
