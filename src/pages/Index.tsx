import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Button size="lg" onClick={() => toast("¡Hola Mundo! 🌍")}>
        Hola Mundo
      </Button>
    </div>
  );
};

export default Index;
