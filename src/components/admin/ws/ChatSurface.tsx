import { useRef, useState } from 'react';
import { Bot, Send, Terminal, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { describeCommand, type AdminCommand } from '@/lib/admin/commandBus';
import { useCommandExecutor } from '@/lib/admin/useCommandExecutor';
import { useWsStore, DEFAULT_MODELS, type ChatProvider } from '@/lib/admin/wsStore';

type Item =
  | { kind: 'msg'; role: 'user' | 'assistant'; content: string }
  | { kind: 'command'; label: string }
  | { kind: 'error'; message: string };

/**
 * Centrální admin chat — mluví s api/ai/chat.ts (context bundle + tools).
 * UI příkazy z modelu vykonává přes command bus a loguje je do transkriptu.
 */
export default function ChatSurface() {
  const [items, setItems] = useState<Item[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const provider = useWsStore((s) => s.provider);
  const model = useWsStore((s) => s.model);
  const setProvider = useWsStore((s) => s.setProvider);
  const setModel = useWsStore((s) => s.setModel);
  const execute = useCommandExecutor();

  const scrollDown = () =>
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));

  const send = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || busy) return;
    setInput('');
    setBusy(true);
    const history = [...items, { kind: 'msg', role: 'user', content: question } as Item];
    setItems(history);
    scrollDown();

    let accumulated = '';
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Nejste přihlášeni');

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          provider,
          model,
          messages: history
            .filter((i): i is Extract<Item, { kind: 'msg' }> => i.kind === 'msg')
            .map((i) => ({ role: i.role, content: i.content })),
        }),
      });
      if (!res.ok || !res.body) throw new Error(`API ${res.status} — chat běží jen na Vercelu, ne pod vite dev`);

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
          let event: { type?: string; text?: string; message?: string; command?: { name: string; input: unknown } };
          try { event = JSON.parse(payload); } catch { continue; }
          if (event.type === 'text' && event.text) {
            accumulated += event.text;
            setStreaming(accumulated);
            scrollDown();
          } else if (event.type === 'command' && event.command) {
            const cmd = event.command as AdminCommand;
            execute(cmd);
            // příkaz rozsekne text na dokončenou zprávu + nový stream
            if (accumulated) {
              const doneText = accumulated;
              accumulated = '';
              setStreaming('');
              setItems((prev) => [...prev, { kind: 'msg', role: 'assistant', content: doneText }]);
            }
            setItems((prev) => [...prev, { kind: 'command', label: describeCommand(cmd) }]);
            scrollDown();
          } else if (event.type === 'error') {
            setItems((prev) => [...prev, { kind: 'error', message: event.message ?? 'Neznámá chyba' }]);
          }
        }
      }
    } catch (e) {
      setItems((prev) => [...prev, { kind: 'error', message: e instanceof Error ? e.message : 'Chyba spojení' }]);
    } finally {
      if (accumulated) {
        const doneText = accumulated;
        setItems((prev) => [...prev, { kind: 'msg', role: 'assistant', content: doneText }]);
      }
      setStreaming('');
      setBusy(false);
      scrollDown();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* hlavička: provider + model */}
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
        <Bot className="h-4 w-4 text-muted-foreground" />
        <span className="mr-auto text-sm font-bold">Centrální chat</span>
        <Select value={provider} onValueChange={(v) => setProvider(v as ChatProvider)}>
          <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={DEFAULT_MODELS[provider]}
          className="h-8 w-[220px] font-mono text-xs"
        />
      </div>

      {/* transkript */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {items.length === 0 && !streaming && (
          <div className="mx-auto max-w-md pt-10 text-center text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Mozek řídicího centra</p>
            <p className="mt-2">
              Zná mapu webu, živá KPI a umí ovládat workspace. Zkus:
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              {['Kolik máme otevřených poptávek?', 'Přejdi na ERP', 'Ukaž homepage jako B2B partner'].map((q) => (
                <button
                  key={q}
                  onClick={() => void send(q)}
                  className="rounded-lg border px-3 py-1.5 text-xs hover:bg-muted"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {items.map((item, i) => {
          if (item.kind === 'command') {
            return (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Terminal className="h-3.5 w-3.5 text-[#7aa300]" />
                <span className="rounded-full border border-[#d1fe17]/60 bg-[#d1fe17]/10 px-2 py-0.5">{item.label}</span>
              </div>
            );
          }
          if (item.kind === 'error') {
            return (
              <p key={i} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {item.message}
              </p>
            );
          }
          const isUser = item.role === 'user';
          return (
            <div key={i} className={`flex gap-2 ${isUser ? 'justify-end' : ''}`}>
              {!isUser && <Bot className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />}
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
                  isUser ? 'bg-[#131517] text-white' : 'bg-muted'
                }`}
              >
                {item.content}
              </div>
              {isUser && <User className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />}
            </div>
          );
        })}
        {streaming && (
          <div className="flex gap-2">
            <Bot className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="max-w-[85%] whitespace-pre-wrap rounded-xl bg-muted px-3 py-2 text-sm">{streaming}</div>
          </div>
        )}
        {busy && !streaming && (
          <p className="pl-6 text-xs text-muted-foreground animate-pulse">přemýšlím…</p>
        )}
      </div>

      {/* vstup */}
      <form
        className="flex items-end gap-2 border-t px-4 py-3"
        onSubmit={(e) => { e.preventDefault(); void send(); }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); }
          }}
          placeholder="Zeptej se na data, nebo přikaž (naviguj, přepni preview…)"
          rows={2}
          className="min-h-0 resize-none text-sm"
        />
        <Button type="submit" size="icon" disabled={busy || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
