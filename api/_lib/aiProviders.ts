// Provider-agnostic vrstva pro centrální admin chat. Společné rozhraní
// (messages, tools, stream) implementuje Anthropic (oficiální SDK) a OpenAI
// (čisté fetch + SSE — bez další závislosti). Každý provider si uvnitř řídí
// vlastní agentic smyčku: tool_use → executor → tool_result → pokračuj.
import Anthropic from '@anthropic-ai/sdk';

export type ProviderId = 'anthropic' | 'openai';

export interface ToolDef {
  name: string;
  description: string;
  /** JSON Schema vstupu (object) */
  schema: Record<string, unknown>;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProviderRequest {
  model: string;
  system: string;
  messages: ChatTurn[];
  tools: ToolDef[];
  maxTokens: number;
}

/** Vykoná tool a vrátí textový výsledek pro model. */
export type ToolExecutor = (name: string, input: unknown) => Promise<string>;

export interface StreamHandlers {
  onText: (delta: string) => void;
}

const MAX_TOOL_ROUNDS = 6;

// ── Anthropic ───────────────────────────────────────────────────────────────

export async function runAnthropic(
  req: ProviderRequest,
  exec: ToolExecutor,
  h: StreamHandlers,
): Promise<void> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const tools: Anthropic.Tool[] = req.tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.schema as Anthropic.Tool.InputSchema,
  }));

  const messages: Anthropic.MessageParam[] = req.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const stream = client.messages.stream({
      model: req.model,
      max_tokens: req.maxTokens,
      system: req.system,
      messages,
      tools,
    });

    stream.on('text', (delta) => h.onText(delta));
    const final = await stream.finalMessage();

    if (final.stop_reason !== 'tool_use') return;

    const toolUses = final.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      const result = await exec(tu.name, tu.input);
      results.push({ type: 'tool_result', tool_use_id: tu.id, content: result });
    }
    messages.push({ role: 'assistant', content: final.content });
    messages.push({ role: 'user', content: results });
  }
}

// ── OpenAI (fetch + SSE, bez SDK) ───────────────────────────────────────────

interface OaiToolCall {
  id: string;
  function: { name: string; arguments: string };
}
interface OaiMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
}

export async function runOpenAI(
  req: ProviderRequest,
  exec: ToolExecutor,
  h: StreamHandlers,
): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY není nakonfigurován (Vercel env)');

  const tools = req.tools.map((t) => ({
    type: 'function' as const,
    function: { name: t.name, description: t.description, parameters: t.schema },
  }));

  const messages: OaiMessage[] = [
    { role: 'system', content: req.system },
    ...req.messages.map((m): OaiMessage => ({ role: m.role, content: m.content })),
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: req.model,
        max_tokens: req.maxTokens,
        stream: true,
        messages,
        tools,
      }),
    });
    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => '');
      throw new Error(`OpenAI ${res.status}: ${body.slice(0, 300)}`);
    }

    // SSE parse — sbíráme text delty a skládáme tool_calls po fragmentech.
    const calls: OaiToolCall[] = [];
    let assistantText = '';
    let finish: string | null = null;

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
        const data = line.startsWith('data: ') ? line.slice(6).trim() : null;
        if (!data || data === '[DONE]') continue;
        let json: unknown;
        try { json = JSON.parse(data); } catch { continue; }
        const choice = (json as { choices?: { delta?: { content?: string; tool_calls?: { index: number; id?: string; function?: { name?: string; arguments?: string } }[] }; finish_reason?: string | null }[] }).choices?.[0];
        if (!choice) continue;
        if (choice.delta?.content) {
          assistantText += choice.delta.content;
          h.onText(choice.delta.content);
        }
        for (const tc of choice.delta?.tool_calls ?? []) {
          calls[tc.index] ??= { id: '', function: { name: '', arguments: '' } };
          if (tc.id) calls[tc.index].id = tc.id;
          if (tc.function?.name) calls[tc.index].function.name += tc.function.name;
          if (tc.function?.arguments) calls[tc.index].function.arguments += tc.function.arguments;
        }
        if (choice.finish_reason) finish = choice.finish_reason;
      }
    }

    if (finish !== 'tool_calls' || calls.length === 0) return;

    messages.push({
      role: 'assistant',
      content: assistantText || null,
      tool_calls: calls.map((c) => ({ id: c.id, type: 'function', function: c.function })),
    });
    for (const c of calls) {
      let input: unknown = {};
      try { input = JSON.parse(c.function.arguments || '{}'); } catch { /* nechá {} */ }
      const result = await exec(c.function.name, input);
      messages.push({ role: 'tool', tool_call_id: c.id, content: result });
    }
  }
}

export async function runProvider(
  provider: ProviderId,
  req: ProviderRequest,
  exec: ToolExecutor,
  h: StreamHandlers,
): Promise<void> {
  if (provider === 'openai') return runOpenAI(req, exec, h);
  return runAnthropic(req, exec, h);
}
