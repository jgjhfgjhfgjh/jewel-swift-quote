import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, Sparkles } from 'lucide-react';
import { ChatMessage, ChatMessageSkeleton } from './ChatMessage';
import type { ChatMessage as ChatMsg } from '@/lib/chatContext';

const CHAT_ENDPOINT = '/api/chat';

/* ── 3D sphere with animated eyes overlaid ── */
function GatewayMascot3D({ size = 96, eyePhase = 0 }: { size?: number; eyePhase?: number }) {
  const eyeFrames = ['> <', '^ ^'];
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Sphere */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `
            radial-gradient(
              circle at 34% 32%,
              #5a5a5a 0%,
              #2a2a2a 28%,
              #111111 52%,
              #000000 72%,
              #050505 100%
            )
          `,
          boxShadow: `
            inset -${size * 0.08}px -${size * 0.08}px ${size * 0.18}px rgba(0,0,0,0.85),
            inset ${size * 0.04}px ${size * 0.04}px ${size * 0.12}px rgba(255,255,255,0.08),
            0 ${size * 0.14}px ${size * 0.32}px rgba(0,0,0,0.55),
            0 ${size * 0.04}px ${size * 0.1}px rgba(0,0,0,0.35)
          `,
        }}
      />
      {/* Eyes — overlaid on sphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.88)',
          fontSize: size * 0.21,
          fontWeight: 700,
          letterSpacing: size * 0.05 + 'px',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        <span key={eyePhase} style={{ transition: 'opacity 0.3s', opacity: 1 }}>
          {eyeFrames[eyePhase % eyeFrames.length]}
        </span>
      </div>
    </div>
  );
}

/* ── Info card to the right of the sphere ── */
function EyeCard({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex flex-col justify-between bg-white border border-zinc-200 rounded-2xl px-4 py-3 h-full min-h-[96px] flex-1 shadow-sm">
      {/* Top row */}
      <div className="flex items-center gap-1 text-zinc-400 text-xs font-medium">
        <Sparkles className="h-3 w-3" />
        <span>Dostupný 24h denně</span>
      </div>

      {/* Middle text */}
      <p className="text-zinc-900 text-sm font-semibold leading-snug mt-1">
        AI obchodní<br />zástupce swelt
      </p>

      {/* CTA button */}
      <button
        onClick={onClick}
        className="mt-2 w-full rounded-xl bg-zinc-900 text-white text-sm font-bold py-1.5 hover:bg-zinc-700 transition-colors"
      >
        Zeptat se
      </button>
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
  const [eyePhase, setEyePhase] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* Animate eyes on sphere */
  useEffect(() => {
    const id = setInterval(() => setEyePhase(p => (p + 1) % 2), 1800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, loading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    if (!started) setStarted(true);

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
  }, [messages, loading, started, partnerContext]);

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

  return (
    <div className="flex flex-col h-full bg-zinc-50">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 bg-white">
        <div className="flex items-center gap-3">
          <GatewayMascot3D size={32} eyePhase={eyePhase} />
          <div>
            <p className="text-sm font-bold text-zinc-900 leading-none">AI asistent</p>
            <p className="text-xs text-zinc-400 mt-0.5">Obchodní zástupce 24h denně</p>
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
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {!started && messages.length === 0 ? (
          /* Welcome screen */
          <div className="flex flex-col items-center text-center">
            {/* Hero card: sphere + info card side by side */}
            <div
              className="flex items-stretch gap-4 w-full max-w-xs rounded-3xl p-4 border border-zinc-200"
              style={{
                background: 'linear-gradient(135deg, #f8f8f8 0%, #efefef 100%)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-center justify-center">
                <GatewayMascot3D size={96} eyePhase={eyePhase} />
              </div>
              <EyeCard onClick={() => inputRef.current?.focus()} />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-zinc-900">Ahoj!</h2>
            <p className="text-zinc-500 text-sm mt-1">Jak vám mohu dnes pomoct?</p>

            <div className="mt-6 w-full space-y-2">
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
        ) : (
          /* Chat messages */
          <div>
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

      {/* Input */}
      <div className="px-4 py-3 border-t border-zinc-200 bg-white flex gap-2 items-end">
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
    </div>
  );
}
