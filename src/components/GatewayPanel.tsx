import { useEffect } from 'react';
import { SweltGateway } from './SweltGateway';

interface GatewayPanelProps {
  open: boolean;
  onClose: () => void;
  partnerContext?: string;
}

export function GatewayPanel({ open, onClose, partnerContext }: GatewayPanelProps) {
  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[110] bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — overscroll-contain prevents scroll from leaking to the page behind */}
      <div className={`
        fixed z-[120] bg-white shadow-2xl
        top-14 left-0 right-0 bottom-0
        lg:top-0 lg:left-auto lg:right-0 lg:bottom-0 lg:w-[420px]
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
