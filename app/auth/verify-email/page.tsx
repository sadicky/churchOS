"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { MailCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "votre adresse email";
  const [isResending, setIsResending] = React.useState(false);

  async function handleResend() {
    if (!searchParams.get("email")) {
      toast.error("Veuillez renseigner votre adresse email pour renvoyer le lien.");
      return;
    }

    try {
      setIsResending(true);
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: searchParams.get("email")!,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Un nouvel email de confirmation vous a été envoyé !");
      }
    } catch {
      toast.error("Impossible de renvoyer l'email pour le moment.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-md text-center">
      <CardHeader className="space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
          <MailCheck className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Vérifiez votre boîte de réception
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground max-w-sm mx-auto">
          Un lien de confirmation a été envoyé à{" "}
          <span className="font-semibold text-foreground">{email}</span>.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground text-left space-y-2">
          <p className="font-medium text-foreground">
            Que devez-vous faire maintenant ?
          </p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Ouvrez votre application de messagerie électronique.</li>
            <li>Cliquez sur le lien de vérification contenu dans l&apos;email ChurchOS.</li>
            <li>Votre compte sera immédiatement activé et vous pourrez accéder à votre espace.</li>
          </ol>
        </div>

        <Button
          variant="outline"
          onClick={handleResend}
          disabled={isResending}
          className="w-full gap-2 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
          <span>Renvoyer l&apos;email de confirmation</span>
        </Button>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 py-4">
        <Button variant="ghost" size="sm" asChild className="gap-2 text-xs">
          <Link href="/auth/login">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Retour à la page de connexion</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
          Chargement des informations de vérification...
        </div>
      }
    >
      <VerifyEmailContent />
    </React.Suspense>
  );
}
