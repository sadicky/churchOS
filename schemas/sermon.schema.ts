import { z } from "zod";

export const sermonFormSchema = z.object({
  title: z.string().min(2, "Le titre du message est requis (au moins 2 caractères)"),
  preacher: z.string().min(2, "Le nom de l'orateur / prédicateur est requis"),
  sermon_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (AAAA-MM-JJ)"),
  scripture_reference: z.string().nullable().optional(),
  series_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  video_url: z.string().url("URL vidéo invalide").nullable().optional().or(z.literal("")),
  audio_url: z.string().url("URL audio invalide").nullable().optional().or(z.literal("")),
  notes_url: z.string().url("URL des notes invalide").nullable().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
});

export type SermonFormInput = z.infer<typeof sermonFormSchema>;

export const mediaFileFormSchema = z.object({
  title: z.string().min(2, "Le titre du document ou média est requis"),
  file_type: z.enum(["document", "image", "audio", "video"]).default("document"),
  bucket_name: z.string().default("churchos-media"),
  file_path: z.string().min(1, "Le lien ou chemin du fichier est requis"),
  file_size_bytes: z.number().nullable().optional(),
  mime_type: z.string().nullable().optional(),
});

export type MediaFileFormInput = z.infer<typeof mediaFileFormSchema>;
