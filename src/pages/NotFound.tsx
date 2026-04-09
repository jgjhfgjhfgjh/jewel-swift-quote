import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Link to="/" className="absolute left-4 top-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Zpět na úvodní stránku
      </Link>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Stránka nenalezena</p>
        <Link to="/" className="inline-flex items-center gap-1.5 text-primary underline hover:text-primary/90">
          <ArrowLeft className="h-4 w-4" />
          Zpět na úvodní stránku
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
