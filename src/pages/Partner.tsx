import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Partner = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Link
        to="/"
        className="absolute left-4 top-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zpět na úvodní stránku
      </Link>
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold mb-2">Prémiový velkoobchod</h1>
        <p className="text-muted-foreground">Připravujeme pro vás obsah této sekce.</p>
      </div>
    </div>
  );
};

export default Partner;
