import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, ArrowRight } from 'lucide-react';
import { ChatMessage, ChatMessageSkeleton } from './ChatMessage';
import type { ChatMessage as ChatMsg } from '@/lib/chatContext';

const CHAT_ENDPOINT = '/api/chat';

/* ── CSS eye shapes ── */
function Eyes({ phase, size }: { phase: number; size: number }) {
  const eyeW = size * 0.155;
  const eyeH = size * 0.08;
  const gap = size * 0.11;

  if (phase === 0) {
    // Open: two white circles
    const r = size * 0.09;
    return (
      <div style={{ display: 'flex', gap, alignItems: 'center' }}>
        <div style={{ width: r, height: r, borderRadius: '50%', background: 'rgba(255,255,255,0.92)' }} />
        <div style={{ width: r, height: r, borderRadius: '50%', background: 'rgba(255,255,255,0.92)' }} />
      </div>
    );
  }
  // Squinting: two white arcs (upward semicircles)
  return (
    <div style={{ display: 'flex', gap, alignItems: 'flex-end' }}>
      <div style={{ width: eyeW, height: eyeH, borderRadius: `${eyeW}px ${eyeW}px 0 0`, background: 'rgba(255,255,255,0.92)' }} />
      <div style={{ width: eyeW, height: eyeH, borderRadius: `${eyeW}px ${eyeW}px 0 0`, background: 'rgba(255,255,255,0.92)' }} />
    </div>
  );
}

/* ── 3D sphere with CSS eyes ── */
export function GatewayMascot3D({ size = 96, eyePhase = 0 }: { size?: number; eyePhase?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Sphere */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `radial-gradient(circle at 34% 32%, #5a5a5a 0%, #2a2a2a 28%, #111111 52%, #000000 72%, #050505 100%)`,
          boxShadow: `
            inset -${size * 0.08}px -${size * 0.08}px ${size * 0.18}px rgba(0,0,0,0.85),
            inset ${size * 0.04}px ${size * 0.04}px ${size * 0.12}px rgba(255,255,255,0.08),
            0 ${size * 0.14}px ${size * 0.36}px rgba(0,0,0,0.6),
            0 ${size * 0.04}px ${size * 0.1}px rgba(0,0,0,0.4)
          `,
        }}
      />
      {/* Eyes overlay */}
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Eyes phase={eyePhase} size={size} />
      </div>
    </div>
  );
}

interface SweltGatewayProps {
  onClose: () => void;
  partnerContext?: string;
}

export function SweltGateway({ onClose, partnerContext }: SweltGatewayProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [started, setStarted] = useState(false);
  const [introSeen, setIntroSeen] = useState(false);
  const [eyePhase, setEyePhase] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const id = setInterval(() => setEyePhase(p => (p + 1) % 2), 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, loading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    if (!started) setStarted(true);
    if (!introSeen) setIntroSeen(true);

    const userMsg: ChatMsg = { role: 'user', content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setStreamingContent('');

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, partnerContext }),
      });

      if (!res.ok || !res.body) throw new Error('API error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const { text } = JSON.parse(data);
            accumulated += text;
            setStreamingContent(accumulated);
          } catch {}
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: accumulated }]);
      setStreamingContent('');
    } catch {
      setLoading(false);
      setStreamingContent('');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Omlouvám se, nastala chyba. Zkuste to prosím znovu.' }]);
    }
  }, [messages, loading, started, introSeen, partnerContext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const suggestions = [
    'Co je swelt.partner?',
    'Jak funguje dropshipping?',
    'Ukažte mi katalog produktů',
  ];

  const handleStart = () => {
    setIntroSeen(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <GatewayMascot3D size={30} eyePhase={eyePhase} />
          <div>
            <p className="text-sm font-bold text-zinc-900 leading-none">AI obchodní zástupce</p>
            <p className="text-xs text-zinc-400 mt-0.5">swelt.partner · 24h denně</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">

        {/* === INTRO SCREEN === */}
        {!introSeen && (
          <div className="flex flex-col items-center justify-between h-full px-6 py-10 text-center">
            {/* Sphere + speech bubble */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative mb-2">
                {/* Speech bubble */}
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: -8,
                    transform: 'translateX(-100%)',
                    background: 'white',
                    borderRadius: '16px 16px 4px 16px',
                    padding: '8px 14px',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#18181b',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(0,0,0,0.07)',
                  }}
                >
                  Ahoj! 👋
                </div>
                <GatewayMascot3D size={160} eyePhase={eyePhase} />
              </div>

              <h1 className="mt-8 text-2xl font-bold text-zinc-900 leading-tight">
                Váš AI obchodní<br />zástupce
              </h1>
              <p className="mt-3 text-zinc-500 text-sm leading-relaxed max-w-[260px]">
                Pomůžu vám s katalogem, dropshippingem a vším o swelt.partner
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleStart}
              className="w-full bg-zinc-900 text-white rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
            >
              Začít konverzaci <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* === SUGGESTIONS (after intro, before first message) === */}
        {introSeen && !started && (
          <div className="flex flex-col items-center text-center px-5 py-6">
            <GatewayMascot3D size={72} eyePhase={eyePhase} />
            <h2 className="mt-4 text-xl font-bold text-zinc-900">Ahoj!</h2>
            <p className="text-zinc-500 text-sm mt-1">Jak vám mohu dnes pomoct?</p>
            <div className="mt-5 w-full space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left px-4 py-3 rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 transition-all shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === CHAT MESSAGES === */}
        {started && (
          <div className="px-5 py-4">
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            {streamingContent && (
              <ChatMessage role="assistant" content={streamingContent} isStreaming />
            )}
            {loading && !streamingContent && <ChatMessageSkeleton />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input — hidden on intro screen */}
      {introSeen && (
        <div className="px-4 py-3 border-t border-zinc-100 flex gap-2 items-end bg-white">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Zeptejte se na cokoliv..."
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 max-h-28"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="shrink-0 w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center disabled:opacity-40 hover:bg-zinc-700 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
