import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="mx-auto max-w-md text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary border border-primary/20 text-3xl font-extrabold">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Page introuvable
          </h1>
          <p className="text-sm text-muted-foreground">
            La page que vous recherchez n&apos;existe pas, a été déplacée ou
            vous n&apos;avez pas les autorisations nécessaires pour y accéder.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="default" className="w-full sm:w-auto gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto gap-2">
            <Link href="/auth/login">
              <ArrowLeft className="h-4 w-4" />
              Se connecter
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
