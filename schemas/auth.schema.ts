import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'adresse email est requise." })
    .email({ message: "Veuillez entrer une adresse email valide." }),
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  rememberMe: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "Le prénom doit contenir au moins 2 caractères." })
      .max(50, { message: "Le prénom ne peut pas dépasser 50 caractères." }),
    lastName: z
      .string()
      .min(2, { message: "Le nom doit contenir au moins 2 caractères." })
      .max(50, { message: "Le nom ne peut pas dépasser 50 caractères." }),
    email: z
      .string()
      .min(1, { message: "L'adresse email est requise." })
      .email({ message: "Veuillez entrer une adresse email valide." }),
    phone: z
      .string()
      .min(6, { message: "Veuillez entrer un numéro de téléphone valide." })
      .max(25, { message: "Numéro de téléphone trop long." }),
    churchName: z
      .string()
      .min(3, { message: "Le nom de l'église doit contenir au moins 3 caractères." })
      .max(100, { message: "Le nom de l'église ne peut pas dépasser 100 caractères." }),
    password: z
      .string()
      .min(8, { message: "Le mot de passe doit comporter au moins 8 caractères." })
      .regex(/[A-Z]/, { message: "Le mot de passe doit comporter au moins une lettre majuscule." })
      .regex(/[0-9]/, { message: "Le mot de passe doit comporter au moins un chiffre." }),
    confirmPassword: z.string().min(1, { message: "Veuillez confirmer votre mot de passe." }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation et la politique de confidentialité.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'adresse email est requise." })
    .email({ message: "Veuillez entrer une adresse email valide." }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Le mot de passe doit comporter au moins 8 caractères." })
      .regex(/[A-Z]/, { message: "Le mot de passe doit comporter au moins une lettre majuscule." })
      .regex(/[0-9]/, { message: "Le mot de passe doit comporter au moins un chiffre." }),
    confirmPassword: z.string().min(1, { message: "Veuillez confirmer votre nouveau mot de passe." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
