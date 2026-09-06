import { z } from "zod";

export const stepPersonalSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères."),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  phone: z.string().min(6, "Veuillez entrer un numéro de téléphone valide."),
  title: z.string().min(2, "Veuillez spécifier votre titre ou fonction (ex: Pasteur Principal, Responsable)."),
});

export const stepChurchSchema = z.object({
  name: z.string().min(3, "Le nom de l'église doit contenir au moins 3 caractères."),
  slug: z
    .string()
    .min(3, "Le slug doit contenir au moins 3 caractères.")
    .regex(/^[a-z0-9-]+$/, "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets."),
  description: z.string().optional(),
  phone: z.string().min(6, "Numéro de téléphone de contact requis."),
  email: z.string().email("Adresse email de contact valide requise."),
  address: z.string().min(3, "Adresse physique requise."),
  city: z.string().min(2, "Ville requise."),
  country: z.string().min(2, "Pays requis."),
  website: z.string().url("URL du site web invalide.").optional().or(z.literal("")),
  currency: z.string().min(3, "Devise requise."),
  timezone: z.string().min(3, "Fuseau horaire requis."),
  campusName: z.string().min(2, "Nom du campus principal requis.").default("Campus Principal"),
});

export const stepTypeSchema = z.object({
  type: z.enum(["LOCAL_CHURCH", "MINISTRY", "ASSEMBLY", "CHRISTIAN_ORGANIZATION"], {
    message: "Veuillez sélectionner un type d'organisation.",
  }),
});

export const stepDepartmentsSchema = z.object({
  departments: z
    .array(
      z.object({
        name: z.string().min(2, "Nom du département requis."),
        description: z.string().optional(),
        selected: z.boolean().default(true),
      })
    )
    .min(1, "Veuillez configurer au moins un département."),
});

export const invitationItemSchema = z.object({
  email: z.string().email("Email invalide."),
  role: z.enum([
    "PASTOR",
    "ADMIN",
    "ACCOUNTANT",
    "SECRETARY",
    "MINISTRY_LEADER",
    "GROUP_LEADER",
    "VOLUNTEER",
    "MEMBER",
  ]),
  department: z.string().optional(),
});

export const stepInvitationsSchema = z.object({
  invitations: z.array(invitationItemSchema),
});

export const completeOnboardingSchema = z.object({
  personal: stepPersonalSchema,
  church: stepChurchSchema,
  type: stepTypeSchema,
  departments: stepDepartmentsSchema,
  invitations: stepInvitationsSchema,
});

export type StepPersonalInput = z.infer<typeof stepPersonalSchema>;
export type StepChurchInput = z.infer<typeof stepChurchSchema>;
export type StepTypeInput = z.infer<typeof stepTypeSchema>;
export type StepDepartmentsInput = z.infer<typeof stepDepartmentsSchema>;
export type InvitationItemInput = z.infer<typeof invitationItemSchema>;
export type StepInvitationsInput = z.infer<typeof stepInvitationsSchema>;
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
