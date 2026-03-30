import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Página no encontrada</h1>
        <p className="mb-6 text-muted-foreground">La página que buscas no existe</p>
        <Button onClick={() => navigate('/map')} className="px-8">Ir al mapa</Button>
      </div>
    </div>
  );
};

export default NotFound;
