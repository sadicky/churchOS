"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/schemas/auth.schema";
import { registerAction } from "@/actions/auth.actions";
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
import { Eye, EyeOff, Loader2, UserPlus, Church } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      churchName: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(data: RegisterInput) {
    try {
      setIsPending(true);
      const res = await registerAction(data);

      if (!res.success) {
        toast.error(res.error || "Une erreur est survenue lors de l'inscription.");
        setIsPending(false);
        return;
      }

      toast.success(
        res.message || "Votre compte a été créé avec succès ! Bienvenue."
      );
      router.push(res.redirectUrl || "/dashboard");
    } catch {
      toast.error("Erreur de connexion au serveur.");
      setIsPending(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-md">
      <CardHeader className="space-y-1 text-center pb-4">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
          <Church className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Inscrire votre église
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Créez votre espace administrateur ChurchOS en quelques instants
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <OAuthButtons />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Ou formulaire d&apos;inscription
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                placeholder="David"
                disabled={isPending}
                {...register("firstName")}
                className={errors.firstName ? "border-destructive" : ""}
              />
              {errors.firstName && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                placeholder="Mukendi"
                disabled={isPending}
                {...register("lastName")}
                className={errors.lastName ? "border-destructive" : ""}
              />
              {errors.lastName && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email professionnel ou ecclésial</Label>
            <Input
              id="email"
              type="email"
              placeholder="pasteur@eglise.org"
              disabled={isPending}
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Téléphone (avec indicatif)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+257 79 00 00 00"
              disabled={isPending}
              {...register("phone")}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Church Name */}
          <div className="space-y-1.5">
            <Label htmlFor="churchName">Nom officiel de l&apos;église ou du ministère</Label>
            <Input
              id="churchName"
              placeholder="Église de la Grâce et de la Vérité"
              disabled={isPending}
              {...register("churchName")}
              className={errors.churchName ? "border-destructive" : ""}
            />
            {errors.churchName && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.churchName.message}
              </p>
            )}
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 car."
                  disabled={isPending}
                  {...register("password")}
                  className={errors.password ? "border-destructive pr-9" : "pr-9"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmer</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Répéter mot de passe"
                disabled={isPending}
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="space-y-1 pt-1">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="acceptTerms"
                disabled={isPending}
                {...register("acceptTerms")}
                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
              />
              <Label htmlFor="acceptTerms" className="text-xs font-normal leading-tight cursor-pointer">
                J&apos;accepte les{" "}
                <span className="text-primary underline">Conditions d&apos;Utilisation</span> et la{" "}
                <span className="text-primary underline">Politique de Confidentialité</span> de ChurchOS.
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full gap-2 shadow-md mt-2" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Création de votre compte...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Créer mon église sur ChurchOS</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 py-3.5">
        <p className="text-xs text-muted-foreground">
          Vous avez déjà un compte ?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
