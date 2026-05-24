import { CSSProperties, ReactNode, useEffect, useRef } from 'react';
import { Check, Minus, X } from 'lucide-react';
import { STATUS_LABELS, Status, marginColor } from '../_data/mock';

// ============================================================
// StatusPill — colored badge for order status
// ============================================================
export function StatusPill({ status }: { status: Status }) {
  const s = STATUS_LABELS[status];
  return (
    <span
      className="p-mono"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 22,
        padding: '0 8px',
        borderRadius: 6,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: s.bg,
        color: s.color,
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  );
}

// ============================================================
// Tag — generic small label
// ============================================================
interface TagProps {
  variant?: 'default' | 'primary' | 'bulk' | 'success' | 'warning' | 'danger';
  children: ReactNode;
  style?: CSSProperties;
}
const tagPalette: Record<NonNullable<TagProps['variant']>, { bg: string; color: string; border: string }> = {
  default: { bg: 'rgba(255,255,255,0.04)', color: 'var(--p-t2)',      border: 'var(--p-border-soft)' },
  primary: { bg: 'rgba(79,110,247,0.08)',  color: 'var(--p-primary-2)', border: 'rgba(79,110,247,0.2)' },
  bulk:    { bg: 'rgba(168,85,247,0.08)',  color: 'var(--p-bulk-2)',    border: 'rgba(168,85,247,0.2)' },
  success: { bg: 'rgba(0,210,160,0.08)',   color: '#00D2A0',            border: 'rgba(0,210,160,0.2)' },
  warning: { bg: 'rgba(245,166,35,0.08)',  color: '#F5A623',            border: 'rgba(245,166,35,0.2)' },
  danger:  { bg: 'rgba(247,79,79,0.08)',   color: '#F74F4F',            border: 'rgba(247,79,79,0.2)' },
};
export function Tag({ variant = 'default', children, style }: TagProps) {
  const p = tagPalette[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 6, fontSize: 11, fontWeight: 500,
      background: p.bg, color: p.color, border: `1px solid ${p.border}`,
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</span>
  );
}

// ============================================================
// PButton — partner-styled button (inline-style approach)
// variant: primary (blue) | bulk (purple) | ghost | danger | subtle
// ============================================================
type BtnVariant = 'primary' | 'bulk' | 'ghost' | 'danger' | 'subtle';
interface PButtonProps {
  variant?: BtnVariant;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  style?: CSSProperties;
  children: ReactNode;
  title?: string;
  ariaLabel?: string;
}
const btnPalette: Record<BtnVariant, CSSProperties> = {
  primary: { background: 'var(--p-primary)', color: 'white', border: '1px solid var(--p-primary)', boxShadow: 'var(--p-glow-primary)' },
  bulk:    { background: 'var(--p-bulk)',    color: 'white', border: '1px solid var(--p-bulk)',    boxShadow: 'var(--p-glow-bulk)' },
  ghost:   { background: 'transparent',      color: 'var(--p-t2)', border: '1px solid var(--p-border)' },
  danger:  { background: 'transparent',      color: '#F74F4F', border: '1px solid rgba(247,79,79,0.35)' },
  subtle:  { background: 'var(--p-surface-2)', color: 'var(--p-t1)', border: '1px solid var(--p-border-soft)' },
};
const btnSize: Record<NonNullable<PButtonProps['size']>, CSSProperties> = {
  sm: { height: 28, padding: '0 10px', fontSize: 12, gap: 6 },
  md: { height: 34, padding: '0 14px', fontSize: 13, gap: 7 },
  lg: { height: 40, padding: '0 18px', fontSize: 14, gap: 8 },
};
export function PButton({ variant = 'ghost', size = 'md', onClick, disabled, type = 'button', style, children, title, ariaLabel }: PButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--p-font-sans)',
        fontWeight: 500, borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--p-t-fast) var(--p-ease)',
        whiteSpace: 'nowrap',
        ...btnPalette[variant],
        ...btnSize[size],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ============================================================
// Checkbox — with indeterminate state support
// ============================================================
interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (next: boolean) => void;
  variant?: 'primary' | 'bulk';
  ariaLabel?: string;
  size?: number;
}
export function Checkbox({ checked, indeterminate = false, onChange, variant = 'primary', ariaLabel, size = 16 }: CheckboxProps) {
  const accent = variant === 'bulk' ? 'var(--p-bulk)' : 'var(--p-primary)';
  const active = checked || indeterminate;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      style={{
        width: size, height: size,
        flexShrink: 0,
        background: active ? accent : 'transparent',
        border: `1.5px solid ${active ? accent : 'var(--p-border)'}`,
        borderRadius: 4,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0,
        transition: 'all var(--p-t-fast) var(--p-ease)',
      }}
    >
      {indeterminate ? <Minus size={size - 4} color="white" strokeWidth={3} />
        : checked ? <Check size={size - 4} color="white" strokeWidth={3} /> : null}
    </button>
  );
}

// ============================================================
// Stepper — wizard progress indicator
// ============================================================
interface StepperProps {
  steps: string[];
  current: number; // 0-based
  variant?: 'primary' | 'bulk';
  onStepClick?: (i: number) => void;
}
export function Stepper({ steps, current, variant = 'primary', onStepClick }: StepperProps) {
  const accent = variant === 'bulk' ? 'var(--p-bulk)' : 'var(--p-primary)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = onStepClick && (done || active);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0, gap: 8 }}>
            <button
              type="button"
              onClick={clickable ? () => onStepClick!(i) : undefined}
              disabled={!clickable}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'transparent', border: 'none', padding: 0,
                cursor: clickable ? 'pointer' : 'default',
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: done ? accent : (active ? 'transparent' : 'var(--p-surface-2)'),
                border: `1.5px solid ${done || active ? accent : 'var(--p-border)'}`,
                color: done ? 'white' : (active ? accent : 'var(--p-t3)'),
                transition: 'all var(--p-t) var(--p-ease)',
              }}>
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span style={{
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: done || active ? 'var(--p-t1)' : 'var(--p-t3)',
                whiteSpace: 'nowrap',
              }}>{label}</span>
            </button>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 1,
                background: done ? accent : 'var(--p-border)',
                transition: 'background var(--p-t) var(--p-ease)',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// MarginBox — internal-only green dashed box ("zákazník nevidí")
// ============================================================
interface MarginBoxProps {
  children: ReactNode;
  compact?: boolean;
  style?: CSSProperties;
}
export function MarginBox({ children, compact, style }: MarginBoxProps) {
  return (
    <div style={{
      position: 'relative',
      border: '1px dashed rgba(0,210,160,0.45)',
      background: 'rgba(0,210,160,0.04)',
      borderRadius: 8,
      padding: compact ? '8px 10px' : '10px 12px',
      ...style,
    }}>
      <div className="p-mono" style={{
        position: 'absolute', top: -8, left: 10,
        background: 'var(--p-surface-1)',
        padding: '0 6px',
        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
        color: '#00D2A0', textTransform: 'uppercase',
      }}>
        Interní · zákazník nevidí
      </div>
      {children}
    </div>
  );
}

// ============================================================
// MarginValue — formatted margin % with color cls
// ============================================================
export function MarginValue({ pct, big }: { pct: number; big?: boolean }) {
  return (
    <span className="p-mono" style={{
      fontSize: big ? 18 : 13, fontWeight: 700,
      color: marginColor(pct),
    }}>{pct}%</span>
  );
}

// ============================================================
// Modal — wraps modal overlay (uses portal-less inline approach
// for simplicity; backdrop blocks underlying scroll)
// ============================================================
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number;
}
export function Modal({ open, onClose, title, children, width = 480 }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Lock body scroll while modal open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'p-fade-in 0.18s var(--p-ease)',
      }}
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--p-card)',
          border: '1px solid var(--p-border)',
          borderRadius: 'var(--p-radius)',
          width: '100%', maxWidth: width,
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          animation: 'p-modal-in 0.22s var(--p-ease)',
        }}
      >
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--p-hairline)',
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--p-t1)' }}>{title}</div>
            <button
              onClick={onClose}
              aria-label="Zavřít"
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'transparent', border: 'none',
                color: 'var(--p-t3)', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            ><X size={16} /></button>
          </div>
        )}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Input — text input with optional warning border
// ============================================================
interface PInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  warning?: boolean;          // shows orange border (e.g. missing required PO)
  size?: 'sm' | 'md';
  type?: 'text' | 'email' | 'tel' | 'number' | 'search';
  style?: CSSProperties;
  ariaLabel?: string;
  autoFocus?: boolean;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}
export function PInput({ value, onChange, placeholder, warning, size = 'md', type = 'text', style, ariaLabel, autoFocus, onBlur, onKeyDown }: PInputProps) {
  const h = size === 'sm' ? 30 : 36;
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      aria-label={ariaLabel}
      autoFocus={autoFocus}
      style={{
        height: h,
        width: '100%',
        background: 'var(--p-surface-2)',
        border: `1px solid ${warning ? '#F5A623' : 'var(--p-border-soft)'}`,
        boxShadow: warning ? '0 0 0 3px rgba(245,166,35,0.12)' : 'none',
        borderRadius: 8,
        padding: '0 12px',
        fontSize: 13, color: 'var(--p-t1)',
        fontFamily: 'var(--p-font-sans)',
        outline: 'none',
        transition: 'border-color var(--p-t-fast), box-shadow var(--p-t-fast)',
        ...style,
      }}
    />
  );
}

// ============================================================
// Card — surface wrapper
// ============================================================
export function Card({ children, style, padding = 16 }: { children: ReactNode; style?: CSSProperties; padding?: number | string }) {
  return (
    <div style={{
      background: 'var(--p-card)',
      border: '1px solid var(--p-border-soft)',
      borderRadius: 'var(--p-radius)',
      padding,
      ...style,
    }}>{children}</div>
  );
}

// ============================================================
// SectionHeading — page section title
// ============================================================
export function SectionHeading({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--p-t1)', lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--p-t3)', marginTop: 4 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

// ============================================================
// Avatar — colored circle with initials
// ============================================================
export function Avatar({ name, color, size = 32 }: { name: string; color: string; size?: number }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, borderRadius: size,
        background: color, color: 'white',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.max(10, Math.round(size * 0.4)),
        fontWeight: 700, flexShrink: 0,
        fontFamily: 'var(--p-font-sans)',
      }}
    >{initials}</span>
  );
}

// ============================================================
// SourceBadge — small letter badge for order source (Shopify, …)
// ============================================================
export function SourceBadge({ source, size = 18 }: { source: keyof typeof import('../_data/mock').SOURCES; size?: number }) {
  // Local lookup to avoid circular type import issue
  const SOURCES: Record<string, { letter: string; color: string; label: string }> = {
    manual:      { letter: 'M', color: '#6B7280', label: 'Ruční' },
    shopify:     { letter: 'S', color: '#7AB55C', label: 'Shopify' },
    woocommerce: { letter: 'W', color: '#7F54B3', label: 'WooCommerce' },
    shoptet:     { letter: 'T', color: '#E84A23', label: 'Shoptet' },
    upgates:     { letter: 'U', color: '#1E73BE', label: 'Upgates' },
  };
  const s = SOURCES[source] ?? SOURCES.manual;
  return (
    <span
      title={s.label}
      className="p-mono"
      style={{
        width: size, height: size, borderRadius: 4,
        background: s.color, color: 'white',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.max(9, Math.round(size * 0.55)),
        fontWeight: 700, flexShrink: 0,
      }}
    >{s.letter}</span>
  );
}
