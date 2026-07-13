import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { describeCommand, type AdminCommand } from '@/lib/admin/commandBus';
import { useCommandExecutor } from '@/lib/admin/useCommandExecutor';
import { useWsStore } from '@/lib/admin/wsStore';

// Web Speech API — v TS lib chybí, minimální deklarace pro Chrome.
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type JarvisState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface LogItem {
  kind: 'you' | 'jarvis' | 'command' | 'error';
  text: string;
}

/**
 * Jarvis — hands-free surface. v1: Web Speech API (push-to-talk vstup cs-CZ,
 * speechSynthesis výstup), transkript jde stejnou pipeline jako chat
 * (api/ai/chat.ts) a příkazy vykonává command bus. Whisper/ElevenLabs = v2.
 */
export default function VoiceSurface() {
  const [state, setState] = useState<JarvisState>('idle');
  const [log, setLog] = useState<LogItem[]>([]);
  const [interim, setInterim] = useState('');
  const [ttsOn, setTtsOn] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

  const provider = useWsStore((s) => s.provider);
  const model = useWsStore((s) => s.model);
  const execute = useCommandExecutor();

  const supported = getRecognitionCtor() !== null;
  const push = (item: LogItem) => setLog((prev) => [...prev.slice(-40), item]);

  const speak = useCallback((text: string) => {
    if (!ttsOn || !('speechSynthesis' in window) || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'cs-CZ';
    utter.onend = () => setState('idle');
    setState('speaking');
    window.speechSynthesis.speak(utter);
  }, [ttsOn]);

  const ask = useCallback(async (question: string) => {
    setState('thinking');
    push({ kind: 'you', text: question });
    historyRef.current.push({ role: 'user', content: question });

    let answer = '';
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Nejste přihlášeni');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ provider, model, messages: historyRef.current.slice(-20) }),
      });
      if (!res.ok || !res.body) throw new Error(`API ${res.status} — chat běží jen na Vercelu`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;
          let event: { type?: string; text?: string; message?: string; command?: AdminCommand };
          try { event = JSON.parse(payload); } catch { continue; }
          if (event.type === 'text' && event.text) answer += event.text;
          else if (event.type === 'command' && event.command) {
            execute(event.command);
            push({ kind: 'command', text: describeCommand(event.command) });
          } else if (event.type === 'error') {
            push({ kind: 'error', text: event.message ?? 'Neznámá chyba' });
          }
        }
      }
    } catch (e) {
      push({ kind: 'error', text: e instanceof Error ? e.message : 'Chyba spojení' });
      setState('idle');
      return;
    }

    if (answer.trim()) {
      historyRef.current.push({ role: 'assistant', content: answer });
      push({ kind: 'jarvis', text: answer });
      speak(answer);
    } else {
      setState('idle');
    }
  }, [provider, model, execute, speak]);

  const startListening = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || state === 'listening') return;
    window.speechSynthesis?.cancel();
    const rec = new Ctor();
    recognitionRef.current = rec;
    rec.lang = 'cs-CZ';
    rec.continuous = false;
    rec.interimResults = true;
    let finalText = '';
    rec.onresult = (e) => {
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      setInterim(interimText || finalText);
    };
    rec.onend = () => {
      setInterim('');
      recognitionRef.current = null;
      const question = finalText.trim();
      if (question) void ask(question);
      else setState('idle');
    };
    rec.onerror = () => {
      setInterim('');
      recognitionRef.current = null;
      setState('idle');
    };
    setState('listening');
    rec.start();
  };

  const stopListening = () => recognitionRef.current?.stop();

  useEffect(() => () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  const STATE_LABEL: Record<JarvisState, string> = {
    idle: 'Připraven',
    listening: 'Poslouchám…',
    thinking: 'Přemýšlím…',
    speaking: 'Mluvím…',
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0d0f11] text-white">
      {/* vizuální stav */}
      <div className="flex flex-col items-center gap-4 border-b border-white/10 px-4 py-8">
        <button
          onClick={state === 'listening' ? stopListening : startListening}
          disabled={!supported || state === 'thinking'}
          className={`flex h-24 w-24 items-center justify-center rounded-full border-2 transition-all disabled:opacity-40 ${
            state === 'listening'
              ? 'border-[#d1fe17] bg-[#d1fe17]/10 shadow-[0_0_50px_rgba(209,254,23,0.35)]'
              : state === 'thinking'
                ? 'border-amber-400 animate-pulse'
                : state === 'speaking'
                  ? 'border-sky-400 shadow-[0_0_40px_rgba(56,189,248,0.3)]'
                  : 'border-white/25 hover:border-[#d1fe17]'
          }`}
        >
          {state === 'listening'
            ? <MicOff className="h-9 w-9 text-[#d1fe17]" />
            : <Mic className="h-9 w-9" />}
        </button>
        <div className="text-center">
          <p className="text-sm font-bold tracking-wide">{STATE_LABEL[state]}</p>
          <p className="mt-1 min-h-[1.25rem] text-xs text-white/60">
            {interim || (state === 'idle' ? 'Klikni na mikrofon a mluv (push-to-talk)' : '')}
          </p>
        </div>
        {!supported && (
          <p className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
            Prohlížeč nepodporuje Web Speech API — použij Chrome, nebo Chat surface.
          </p>
        )}
        <button
          onClick={() => setTtsOn((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white"
        >
          {ttsOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          {ttsOn ? 'Hlasová odpověď zapnutá' : 'Hlasová odpověď vypnutá'}
        </button>
      </div>

      {/* log akcí a konverzace */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-4 text-sm">
        {log.length === 0 && (
          <p className="pt-6 text-center text-xs text-white/40">
            „Kolik máme otevřených poptávek?" · „Přepni preview na B2B" · „Přejdi na ERP"
          </p>
        )}
        {log.map((item, i) => (
          <div key={i}>
            {item.kind === 'you' && <p className="text-white/85"><span className="mr-2 text-[10px] font-bold uppercase text-white/40">Ty</span>{item.text}</p>}
            {item.kind === 'jarvis' && <p className="text-[#d1fe17]/90"><span className="mr-2 text-[10px] font-bold uppercase text-white/40">Jarvis</span>{item.text}</p>}
            {item.kind === 'command' && (
              <p className="text-xs text-sky-300/90">⚡ {item.text}</p>
            )}
            {item.kind === 'error' && <p className="text-xs text-rose-300">{item.text}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
