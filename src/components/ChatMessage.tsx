import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isAssistant = role === 'assistant';

  return (
    <div className={cn('flex gap-2 mb-3', isAssistant ? 'items-start' : 'items-start flex-row-reverse')}>
      {isAssistant && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-white select-none">
          V
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed',
          isAssistant
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm'
            : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-tr-sm'
        )}
      >
        {content}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-current opacity-70 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-2 mb-3 items-start">
      <div className="shrink-0 w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-white">
        V
      </div>
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-3 py-2 flex gap-1 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
