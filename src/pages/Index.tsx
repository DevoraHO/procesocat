import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex gap-4">
        <Button size="lg" onClick={() => toast("¡Hola Mundo! 🌍")}>
          Hola Mundo
        </Button>
        <Button size="lg" variant="secondary" onClick={() => toast("¡Adiós Mundo! 👋")}>
          Adiós Mundo
        </Button>
      </div>
    </div>
  );
};

export default Index;
