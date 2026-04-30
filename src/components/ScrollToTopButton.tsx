import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useStore } from '@/lib/store';

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const { gatewayOpen } = useStore();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const show = visible && !gatewayOpen;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className={`fixed bottom-20 lg:bottom-6 right-4 z-40 h-11 w-11 flex items-center justify-center rounded-full bg-white/50 dark:bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="h-5 w-5 text-foreground" />
    </button>
  );
}
