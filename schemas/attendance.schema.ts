import { z } from "zod";

export const serviceFormSchema = z.object({
  name: z.string().min(3, "Le nom du culte doit contenir au moins 3 caractères."),
  service_date: z.string().min(10, "Date du culte requise."),
  start_time: z.string().min(4, "Heure de début requise."),
  end_time: z.string().nullable().optional(),
  preacher_name: z.string().nullable().optional(),
  worship_leader_name: z.string().nullable().optional(),
  theme: z.string().nullable().optional(),
  scripture_reference: z.string().nullable().optional(),
  campus_id: z.string().uuid("Campus invalide.").nullable().optional().or(z.literal("")),
  notes: z.string().nullable().optional(),
});

export const attendanceSessionSchema = z.object({
  title: z.string().min(3, "Le titre de la session est requis."),
  service_id: z.string().uuid("Culte de rattachement requis.").nullable().optional().or(z.literal("")),
  session_date: z.string().min(10, "Date de la session requise."),
  campus_id: z.string().uuid("Campus invalide.").nullable().optional().or(z.literal("")),
});

export const visitorCheckInSchema = z.object({
  name: z.string().min(2, "Le nom du visiteur est requis."),
  phone: z.string().nullable().optional(),
  email: z.string().email("Adresse email invalide.").nullable().optional().or(z.literal("")),
});

export type ServiceFormInput = z.infer<typeof serviceFormSchema>;
export type AttendanceSessionInput = z.infer<typeof attendanceSessionSchema>;
export type VisitorCheckInInput = z.infer<typeof visitorCheckInSchema>;
