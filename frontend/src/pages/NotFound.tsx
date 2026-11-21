import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center">
      <div className="container max-w-xl py-20 text-center">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
          Error 404
        </p>
        <h1 className="mt-4 font-heading text-[clamp(2.4rem,5vw,3.6rem)] font-[450] leading-[1.05] tracking-[-0.045em]">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          The page you’re looking for doesn’t exist or has moved. Head back to the calculator to keep going.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Return home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
