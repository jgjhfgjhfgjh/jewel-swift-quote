import { useEffect, useRef } from 'react';
import { SweltGateway } from './SweltGateway';

interface GatewayPanelProps {
  open: boolean;
  onClose: () => void;
  partnerContext?: string;
}

export function GatewayPanel({ open, onClose, partnerContext }: GatewayPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // On mobile: track visualViewport so the panel shrinks with the keyboard
  // instead of being hidden behind it
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const el = panelRef.current;
      if (!el || window.innerWidth >= 1024) return; // desktop handled by CSS
      el.style.height = `${vv.height}px`;
      el.style.top = `${vv.offsetTop}px`;
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      const el = panelRef.current;
      if (el) { el.style.height = ''; el.style.top = ''; }
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — mobile: full screen tracked by visualViewport; desktop: right side */}
      <div
        ref={panelRef}
        className="fixed z-50 bg-white shadow-2xl left-0 right-0 top-0 flex flex-col lg:inset-auto lg:left-auto lg:right-0 lg:top-0 lg:bottom-0 lg:w-[420px]"
        style={{ height: '100dvh' }}
      >
        <SweltGateway onClose={onClose} partnerContext={partnerContext} />
      </div>
    </>
  );
}
