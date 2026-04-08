import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export function HomepageCanvas() {
  const [pages, setPages] = useState(1);

  return (
    <div className="w-full bg-white dark:bg-background">
      {Array.from({ length: pages }).map((_, i) => (
        <div
          key={i}
          className="min-h-[80vh] w-full border-b border-border/30 flex items-center justify-center"
        >
          <p className="text-muted-foreground/40 text-lg font-medium select-none">
            Section {i + 1} — Ready for content
          </p>
        </div>
      ))}

      {pages < 5 && (
        <div className="flex justify-center py-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setPages((p) => p + 1)}
            className="gap-2 rounded-full backdrop-blur-lg bg-white/60 dark:bg-white/10 border-white/40 shadow-lg hover:scale-105 transition-transform"
          >
            <ChevronDown className="h-4 w-4" />
            Načíst více
          </Button>
        </div>
      )}
    </div>
  );
}
