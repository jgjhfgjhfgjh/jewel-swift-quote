import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function LeadUpgradeBadge() {
  const navigate = useNavigate();

  return (
    <div className="mt-auto pt-3">
      <Button
        size="sm"
        className="h-9 w-full gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 rounded-lg text-xs"
        onClick={() => navigate('/register')}
      >
        <Lock className="h-3.5 w-3.5" />
        <span className="text-xs">Zobrazit cenu</span>
      </Button>
    </div>
  );
}
