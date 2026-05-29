import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Mic, Video as VideoIcon, Square, X } from 'lucide-react';

type RecKind = 'audio' | 'video';

function pickMime(kind: RecKind): string | undefined {
  const cands = kind === 'video'
    ? ['video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4']
    : ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  const MR: any = (window as any).MediaRecorder;
  if (MR && MR.isTypeSupported) {
    for (const c of cands) if (MR.isTypeSupported(c)) return c;
  }
  return undefined;
}

/** Nahrávání hlasové / video zprávy v prohlížeči. Po dokončení vrátí soubor. */
export function Recorder({ onComplete, disabled }: {
  onComplete: (file: File, kind: RecKind) => void;
  disabled?: boolean;
}) {
  const [kind, setKind] = useState<RecKind | null>(null);
  const [seconds, setSeconds] = useState(0);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canceledRef = useRef(false);

  // Připoj živý náhled až když je <video> element vykreslený (po setKind).
  useEffect(() => {
    if (kind === 'video' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [kind]);

  function cleanup() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setKind(null);
    setSeconds(0);
  }

  async function start(k: RecKind) {
    if (!navigator.mediaDevices?.getUserMedia || !(window as any).MediaRecorder) {
      toast.error('Nahrávání tento prohlížeč nepodporuje');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        k === 'video' ? { audio: true, video: { facingMode: 'user' } } : { audio: true }
      );
      streamRef.current = stream;
      canceledRef.current = false;
      // Náhled se připojí v useEffect po vykreslení elementu (viz výše).
      const mime = pickMime(k);
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const type = mr.mimeType || (k === 'video' ? 'video/webm' : 'audio/webm');
        const ext = type.includes('mp4') ? 'mp4' : type.includes('ogg') ? 'ogg' : 'webm';
        const blob = new Blob(chunksRef.current, { type });
        const name = `${k === 'video' ? 'video-zprava' : 'hlas'}-${Date.now()}.${ext}`;
        const wasCanceled = canceledRef.current;
        cleanup();
        if (!wasCanceled && blob.size > 0) onComplete(new File([blob], name, { type }), k);
      };
      mrRef.current = mr;
      mr.start();
      setKind(k);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch {
      toast.error('Nepodařilo se získat přístup k mikrofonu/kameře');
      cleanup();
    }
  }

  function stop(cancel: boolean) {
    canceledRef.current = cancel;
    mrRef.current?.stop();
  }

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const typeBtn = 'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50';

  if (kind) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50/60 p-2 dark:border-red-900 dark:bg-red-950/30">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Nahrávám {kind === 'video' ? 'video' : 'hlas'} · {mmss}
          </span>
          <button onClick={() => stop(false)} className="ml-auto inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
            <Square className="h-3.5 w-3.5" /> Hotovo
          </button>
          <button onClick={() => stop(true)} className="inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted">
            <X className="h-3.5 w-3.5" /> Zrušit
          </button>
        </div>
        <video ref={videoRef} className={`mt-2 max-h-48 w-full rounded bg-black ${kind === 'video' ? '' : 'hidden'}`} playsInline />
      </div>
    );
  }

  return (
    <>
      <button className={typeBtn} disabled={disabled} onClick={() => start('audio')}><Mic className="h-3.5 w-3.5" /> Nahrát hlas</button>
      <button className={typeBtn} disabled={disabled} onClick={() => start('video')}><VideoIcon className="h-3.5 w-3.5" /> Nahrát video</button>
    </>
  );
}
