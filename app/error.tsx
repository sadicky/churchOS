"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to an error reporting service
    console.error("ChurchOS Global Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="mx-auto max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Une erreur inattendue est survenue
          </h1>
          <p className="text-sm text-muted-foreground">
            L&apos;application a rencontré un problème temporaire. Nos équipes
            ont été notifiées si le problème persiste.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            variant="default"
            className="w-full sm:w-auto gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Réessayer
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
