import { z } from "zod";

export const pastoralVisitSchema = z.object({
  member_id: z.string().uuid("Veuillez sélectionner un membre").nullable().optional(),
  visit_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (AAAA-MM-JJ)"),
  visit_type: z.enum(["HOME", "HOSPITAL", "OFFICE", "PHONE"]).default("HOME"),
  summary: z
    .string()
    .min(5, "Le résumé de la visite pastorale doit comporter au moins 5 caractères"),
  follow_up_needed: z.boolean().default(false),
  follow_up_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date de relance invalide")
    .nullable()
    .optional()
    .or(z.literal("")),
});

export type PastoralVisitInput = z.infer<typeof pastoralVisitSchema>;

export const prayerRequestSchema = z.object({
  requester_name: z
    .string()
    .min(2, "Le nom du demandeur doit comporter au moins 2 caractères"),
  member_id: z.string().uuid().nullable().optional(),
  title: z
    .string()
    .min(3, "Le sujet de prière doit comporter au moins 3 caractères"),
  description: z
    .string()
    .min(5, "Veuillez détailler le besoin d'intercession (au moins 5 caractères)"),
  visibility: z
    .enum(["PUBLIC", "MEMBERS_ONLY", "PASTORAL_ONLY"])
    .default("MEMBERS_ONLY"),
  status: z
    .enum(["PENDING", "IN_PROGRESS", "ANSWERED", "CLOSED"])
    .default("PENDING"),
});

export type PrayerRequestInput = z.infer<typeof prayerRequestSchema>;

export const prayerAnswerSchema = z.object({
  prayer_id: z.string().uuid("Identifiant de prière invalide"),
  answer_testimony: z
    .string()
    .min(5, "Veuillez renseigner le témoignage de l'exaucement (au moins 5 caractères)"),
});

export type PrayerAnswerInput = z.infer<typeof prayerAnswerSchema>;

export const pastoralNoteSchema = z.object({
  member_id: z.string().uuid("Membre invalide").nullable().optional(),
  confidential_level: z.coerce.number().min(1).max(2).default(1),
  note: z.string().min(3, "Le contenu de la note pastorale est requis"),
});

export type PastoralNoteInput = z.infer<typeof pastoralNoteSchema>;
