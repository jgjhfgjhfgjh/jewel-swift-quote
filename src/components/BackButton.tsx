import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Zpět"
      className="fixed top-4 left-4 z-[999] flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition-all duration-200 hover:scale-110 hover:border-white/50"
      style={{
        backdropFilter: 'blur(12px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.6)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.25) 100%)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      <ArrowLeft className="h-4 w-4 text-foreground/80" strokeWidth={2.5} />
    </button>
  );
}
