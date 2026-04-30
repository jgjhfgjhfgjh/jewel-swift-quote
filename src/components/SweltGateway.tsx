import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X } from 'lucide-react';
import { ChatMessage, ChatMessageSkeleton } from './ChatMessage';
import type { ChatMessage as ChatMsg } from '@/lib/chatContext';

const CHAT_ENDPOINT = '/api/chat';

function GatewayMascot({ size = 80 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-zinc-900 flex items-center justify-center shadow-2xl select-none shrink-0"
    >
      <span style={{ fontSize: size * 0.28, letterSpacing: '-0.05em' }} className="text-white font-bold">&gt;&lt;</span>
    </div>
  );
}

interface SweltGatewayProps {
  onClose: () => void;
}

export function SweltGateway({ onClose }: SweltGatewayProps) {
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
        body: JSON.stringify({ messages: nextMessages }),
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
          <GatewayMascot size={36} />
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
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!started && messages.length === 0 ? (
          /* Welcome screen */
          <div className="flex flex-col items-center text-center pt-6 pb-4">
            <GatewayMascot size={96} />
            <h2 className="mt-6 text-2xl font-bold text-zinc-900">Hi, there!</h2>
            <p className="text-zinc-500 text-sm mt-1">How may I help you today?</p>

            <div className="mt-8 w-full space-y-2">
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
