"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";
import { loginAction } from "@/actions/auth.actions";
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
import { Separator } from "@/components/ui/separator";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: LoginInput) {
    try {
      setIsPending(true);
      const res = await loginAction(data);

      if (!res.success) {
        toast.error(res.error || "Une erreur est survenue lors de la connexion.");
        setIsPending(false);
        return;
      }

      toast.success("Connexion réussie ! Bienvenue sur ChurchOS.");
      router.push(res.redirectUrl || "/dashboard");
      router.refresh();
    } catch {
      toast.error("Erreur de connexion au serveur.");
      setIsPending(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Connexion à ChurchOS
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Accédez à la plateforme de gestion de votre église
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <OAuthButtons />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Ou par email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              placeholder="pasteur@mon-eglise.org"
              autoComplete="email"
              disabled={isPending}
              {...register("email")}
              className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isPending}
                {...register("password")}
                className={
                  errors.password
                    ? "border-destructive focus-visible:ring-destructive pr-10"
                    : "pr-10"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label="Afficher ou masquer le mot de passe"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="rememberMe"
              disabled={isPending}
              {...register("rememberMe")}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
            />
            <Label htmlFor="rememberMe" className="text-xs font-normal cursor-pointer">
              Se souvenir de ma session sur cet appareil
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full gap-2 shadow-md"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Se connecter</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 py-4">
        <p className="text-xs text-muted-foreground">
          Vous n&apos;avez pas encore de compte ?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-primary hover:underline"
          >
            Inscrire mon église
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
