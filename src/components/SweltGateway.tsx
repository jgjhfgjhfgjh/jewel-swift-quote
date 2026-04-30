import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, Sparkles } from 'lucide-react';
import { ChatMessage, ChatMessageSkeleton } from './ChatMessage';
import type { ChatMessage as ChatMsg } from '@/lib/chatContext';

const CHAT_ENDPOINT = '/api/chat';

/* ── 3D sphere — CSS only, no eyes on the ball ── */
function GatewayMascot3D({ size = 96 }: { size?: number }) {
  return (
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
          0 ${size * 0.22}px ${size * 0.4}px rgba(0,0,0,0.38),
          0 ${size * 0.08}px ${size * 0.14}px rgba(0,0,0,0.22)
        `,
        flexShrink: 0,
      }}
    />
  );
}

/* ── Info card to the right of the sphere ── */
function EyeCard({ onClick }: { onClick: () => void }) {
  const [phase, setPhase] = useState(0);
  // cycle: >< → ^^ → >< ...
  const labels = ['>  <', '^ ^', '>  <'];

  useEffect(() => {
    const id = setInterval(() => setPhase(p => (p + 1) % labels.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col justify-between bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 h-full min-h-[96px] flex-1">
      {/* Top row */}
      <div className="flex items-center gap-1 text-zinc-400 text-xs font-medium">
        <Sparkles className="h-3 w-3" />
        <span>24 requests left</span>
      </div>

      {/* Middle text */}
      <p className="text-zinc-900 text-sm font-semibold leading-snug mt-1">
        Use AI at full<br />power with pro
      </p>

      {/* Dynamic eye button */}
      <button
        onClick={onClick}
        className="mt-2 w-full rounded-xl bg-zinc-900 text-white text-lg font-bold py-1.5 tracking-widest hover:bg-zinc-700 transition-colors"
        style={{ letterSpacing: '0.15em' }}
      >
        <span
          key={phase}
          className="inline-block transition-all duration-500"
          style={{ opacity: 1 }}
        >
          {labels[phase]}
        </span>
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
  }, [messages, loading, started]);

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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <GatewayMascot3D size={32} />
          <div>
            <p className="text-sm font-bold text-zinc-900 leading-none">Vera</p>
            <p className="text-xs text-zinc-400 mt-0.5">swelt.partner</p>
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
            {/* Sphere + info card side by side */}
            <div className="flex items-stretch gap-4 w-full max-w-xs">
              <div className="flex items-center justify-center">
                <GatewayMascot3D size={96} />
              </div>
              <EyeCard onClick={() => inputRef.current?.focus()} />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-zinc-900">Hi, there!</h2>
            <p className="text-zinc-500 text-sm mt-1">How may I help you today?</p>

            <div className="mt-6 w-full space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left px-4 py-3 rounded-2xl border border-zinc-200 text-sm text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 transition-all"
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
      <div className="px-4 py-3 border-t border-zinc-100 flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
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
