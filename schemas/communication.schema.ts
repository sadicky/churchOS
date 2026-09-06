import { z } from "zod";

export const announcementFormSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre de l'annonce doit comporter au moins 3 caractères"),
  content: z
    .string()
    .min(5, "Le contenu de l'annonce doit comporter au moins 5 caractères"),
  is_pinned: z.boolean().default(false),
  expires_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date d'expiration invalide")
    .nullable()
    .optional()
    .or(z.literal("")),
});

export type AnnouncementFormInput = z.infer<typeof announcementFormSchema>;

export const broadcastFormSchema = z.object({
  channel: z.enum(["SMS", "EMAIL", "NOTIFICATION"]).default("SMS"),
  target_audience: z
    .enum(["ALL", "LEADERS", "VOLUNTEERS", "VISITORS"])
    .default("ALL"),
  title: z
    .string()
    .min(2, "L'objet ou titre du message est requis (au moins 2 caractères)"),
  message: z
    .string()
    .min(5, "Le contenu du message doit comporter au moins 5 caractères"),
});

export type BroadcastFormInput = z.infer<typeof broadcastFormSchema>;

export const notificationFormSchema = z.object({
  title: z.string().min(2, "Le titre est requis"),
  message: z.string().min(3, "Le message est requis"),
  type: z.enum(["INFO", "WARNING", "SUCCESS", "URGENT"]).default("INFO"),
  link: z.string().nullable().optional(),
});

export type NotificationFormInput = z.infer<typeof notificationFormSchema>;
