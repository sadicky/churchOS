"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/schemas/auth.schema";
import { forgotPasswordAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordInput) {
    try {
      setIsPending(true);
      const res = await forgotPasswordAction(data);

      if (!res.success) {
        toast.error(res.error || "Impossible d'envoyer l'email de récupération.");
        setIsPending(false);
        return;
      }

      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      setIsPending(false);
      toast.success("Instructions envoyées par email !");
    } catch {
      toast.error("Erreur de connexion au serveur.");
      setIsPending(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
          {isSubmitted ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          ) : (
            <KeyRound className="h-6 w-6" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {isSubmitted ? "Vérifiez vos emails" : "Mot de passe oublié ?"}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
          {isSubmitted
            ? `Nous avons envoyé un lien de réinitialisation sécurisé à ${submittedEmail}.`
            : "Entrez votre adresse email pour recevoir les instructions de réinitialisation de votre mot de passe."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isSubmitted ? (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-800 dark:text-emerald-300">
              <p className="font-medium">Vérifiez vos spams si vous ne recevez rien dans les 5 minutes.</p>
              <p className="mt-1">Le lien de récupération expirera après 1 heure.</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsSubmitted(false)}
            >
              Renvoyer avec une autre adresse email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email du compte</Label>
              <Input
                id="email"
                type="email"
                placeholder="pasteur@eglise.org"
                disabled={isPending}
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full gap-2 shadow-md"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Envoi du lien...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Envoyer le lien de récupération</span>
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 py-4">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Retour à la connexion</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
