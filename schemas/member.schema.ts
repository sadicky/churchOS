import { z } from "zod";

export const memberFormSchema = z.object({
  first_name: z.string().min(2, "Le prénom doit comporter au moins 2 caractères."),
  last_name: z.string().min(2, "Le nom doit comporter au moins 2 caractères."),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email("Adresse email invalide.").nullable().optional().or(z.literal("")),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  marital_status: z
    .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"])
    .nullable()
    .optional(),
  occupation: z.string().nullable().optional(),
  membership_status: z
    .enum(["ACTIVE", "INACTIVE", "VISITOR", "TRANSFERRED", "DECEASED", "ARCHIVED"])
    .default("ACTIVE"),
  campus_id: z.string().uuid("Campus invalide.").nullable().optional().or(z.literal("")),
  join_date: z.string().nullable().optional(),
  baptism_date: z.string().nullable().optional(),
  emergency_contact_name: z.string().nullable().optional(),
  emergency_contact_phone: z.string().nullable().optional(),
  emergency_contact_relation: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const memberNoteSchema = z.object({
  title: z.string().nullable().optional(),
  content: z.string().min(3, "La note doit contenir au moins 3 caractères."),
  is_private: z.boolean().default(false),
});

export type MemberFormInput = z.infer<typeof memberFormSchema>;
export type MemberNoteInput = z.infer<typeof memberNoteSchema>;
