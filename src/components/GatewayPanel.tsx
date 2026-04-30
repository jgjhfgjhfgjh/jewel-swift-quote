import { useEffect } from 'react';
import { SweltGateway } from './SweltGateway';

interface GatewayPanelProps {
  open: boolean;
  onClose: () => void;
  partnerContext?: string;
}

export function GatewayPanel({ open, onClose, partnerContext }: GatewayPanelProps) {
  // iOS-compatible scroll lock:
  // overflow:hidden alone doesn't stop iOS Safari from scrolling the page under a fixed overlay.
  // Fixing the body at the current scroll position is the reliable cross-browser solution.
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      const top = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (top) {
        window.scrollTo(0, parseInt(top, 10) * -1);
      }
    }
    return () => {
      const top = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (top) {
        window.scrollTo(0, parseInt(top, 10) * -1);
      }
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

      {/* Panel — overscroll-contain prevents scroll from leaking to the page behind */}
      <div className={`
        fixed z-50 bg-white shadow-2xl
        inset-0
        lg:inset-auto lg:right-0 lg:top-0 lg:bottom-0 lg:w-[420px]
        flex flex-col
        overscroll-contain
        transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Drag handle strip — mobile only, tap to close */}
        <button
          onClick={onClose}
          aria-label="Zavřít AI asistenta"
          className="lg:hidden flex-shrink-0 flex items-center justify-center w-full py-3 touch-manipulation"
        >
          <div className="w-12 h-1.5 rounded-full bg-zinc-300" />
        </button>
        <SweltGateway onClose={onClose} partnerContext={partnerContext} />
      </div>
    </>
  );
}
