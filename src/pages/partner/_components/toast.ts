import { toast as sonnerToast } from 'sonner';

// Partner Hub toast helper — thin wrapper around sonner with intent-aware styling.
// Use this everywhere in /partner instead of calling sonner directly so we keep the
// purple "bulk" accent consistent.

type Intent = 'default' | 'success' | 'bulk' | 'warning' | 'error';

const palette: Record<Intent, { bg: string; border: string; color: string }> = {
  default: { bg: 'var(--p-card)',           border: 'var(--p-border)',            color: 'var(--p-t1)' },
  success: { bg: 'rgba(0,210,160,0.08)',    border: 'rgba(0,210,160,0.35)',       color: '#00D2A0' },
  bulk:    { bg: 'rgba(168,85,247,0.08)',   border: 'rgba(168,85,247,0.35)',      color: 'var(--p-bulk-2)' },
  warning: { bg: 'rgba(245,166,35,0.08)',   border: 'rgba(245,166,35,0.35)',      color: '#F5A623' },
  error:   { bg: 'rgba(247,79,79,0.08)',    border: 'rgba(247,79,79,0.35)',       color: '#F74F4F' },
};

function push(intent: Intent, message: string) {
  const p = palette[intent];
  sonnerToast(message, {
    duration: 3200,
    style: {
      background: p.bg,
      color: p.color,
      border: `1px solid ${p.border}`,
      borderLeft: `3px solid ${p.color}`,
      fontFamily: 'var(--p-font-sans)',
      fontSize: 13,
    },
  });
}

export const pToast = {
  success: (msg: string) => push('success', msg),
  bulk:    (msg: string) => push('bulk', msg),
  warning: (msg: string) => push('warning', msg),
  error:   (msg: string) => push('error', msg),
  info:    (msg: string) => push('default', msg),
};
