import { useEffect } from 'react';
import { SweltGateway } from './SweltGateway';

interface GatewayPanelProps {
  open: boolean;
  onClose: () => void;
  partnerContext?: string;
}

export function GatewayPanel({ open, onClose, partnerContext }: GatewayPanelProps) {
  // Lock body scroll on mobile when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop — both mobile and desktop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`
        fixed z-50 bg-white shadow-2xl
        /* Mobile: full screen */
        inset-0
        /* Desktop: right side panel, fixed width */
        lg:inset-auto lg:right-0 lg:top-0 lg:bottom-0 lg:w-[420px]
        flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <SweltGateway onClose={onClose} partnerContext={partnerContext} />
      </div>
    </>
  );
}
