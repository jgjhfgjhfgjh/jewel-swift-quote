import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function LeadUpgradeBadge() {
  const navigate = useNavigate();

  return (
    <div className="mt-auto pt-3">
      <Button
        size="sm"
        variant="outline"
        className="h-9 w-full gap-1.5 border-amber-500/40 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-all duration-200 rounded-lg text-xs"
        onClick={() => navigate('/register')}
      >
        <Lock className="h-3.5 w-3.5" />
        <span>Ceny pouze pro B2B partnery. Dokončete registraci.</span>
      </Button>
    </div>
  );
}
