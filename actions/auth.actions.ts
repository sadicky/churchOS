"use server";

import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/schemas/auth.schema";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  message?: string;
  redirectUrl?: string;
}

/**
 * Log in with email and password
 */
export async function loginAction(
  data: LoginInput
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données de connexion invalides.",
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Return localized user friendly message
    let message = "Identifiants incorrects. Veuillez réessayer.";
    if (error.message.includes("Email not confirmed")) {
      message = "Veuillez confirmer votre adresse email avant de vous connecter.";
    } else if (error.message.includes("Invalid login credentials")) {
      message = "Adresse email ou mot de passe incorrect.";
    }
    return { success: false, error: message };
  }

  return { success: true, redirectUrl: "/dashboard" };
}

/**
 * Register a new user with profile and church details
 */
export async function registerAction(
  data: RegisterInput
): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données d'inscription invalides.",
    };
  }

  const { firstName, lastName, email, phone, churchName, password } = parsed.data;
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone,
        church_name: churchName,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    let message = error.message;
    if (error.message.includes("already registered")) {
      message = "Un compte existe déjà avec cette adresse email.";
    }
    return { success: false, error: message };
  }

  // If email confirmation is required and session is not returned yet
  if (authData.user && !authData.session) {
    return {
      success: true,
      message: "Un lien de confirmation a été envoyé à votre adresse email.",
      redirectUrl: `/auth/verify-email?email=${encodeURIComponent(email)}`,
    };
  }

  return {
    success: true,
    redirectUrl: "/dashboard",
  };
}

/**
 * Log out the current user and destroy the session
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

/**
 * Send password reset email
 */
export async function forgotPasswordAction(
  data: ForgotPasswordInput
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Email invalide.",
    };
  }

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Si un compte est associé à cette adresse, un email de récupération a été envoyé.",
  };
}

/**
 * Reset password with new password
 */
export async function resetPasswordAction(
  data: ResetPasswordInput
): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Mot de passe invalide.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Votre mot de passe a été mis à jour avec succès.",
    redirectUrl: "/auth/login",
  };
}

/**
 * Get OAuth redirect URL for social logins (Google, Apple, Facebook)
 */
export async function getOAuthUrlAction(
  provider: "google" | "apple" | "facebook"
): Promise<{ url?: string; error?: string }> {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}
