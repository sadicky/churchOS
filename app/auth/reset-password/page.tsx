"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/schemas/auth.schema";
import { resetPasswordAction } from "@/actions/auth.actions";
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
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordInput) {
    try {
      setIsPending(true);
      const res = await resetPasswordAction(data);

      if (!res.success) {
        toast.error(res.error || "Impossible de réinitialiser le mot de passe.");
        setIsPending(false);
        return;
      }

      toast.success(
        res.message || "Votre mot de passe a été modifié avec succès !"
      );
      router.push("/auth/login");
    } catch {
      toast.error("Erreur de connexion au serveur.");
      setIsPending(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Nouveau mot de passe
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
          Définissez un mot de passe robuste comportant au moins 8 caractères,
          une majuscule et un chiffre.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isPending}
                {...register("password")}
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={isPending}
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive font-medium">
                {errors.confirmPassword.message}
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
                <span>Mise à jour en cours...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Enregistrer le mot de passe</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 py-4">
        <Link
          href="/auth/login"
          className="text-xs font-medium text-primary hover:underline"
        >
          Retour à la page de connexion
        </Link>
      </CardFooter>
    </Card>
  );
}
