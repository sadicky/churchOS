import { z } from "zod";

export const groupFormSchema = z.object({
  name: z.string().min(2, "Le nom de la cellule doit comporter au moins 2 caractères"),
  campus_id: z.string().nullable().optional(),
  leader_id: z.string().nullable().optional(),
  meeting_day: z.string().nullable().optional(),
  meeting_time: z.string().nullable().optional(),
  meeting_location: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export type GroupFormInput = z.infer<typeof groupFormSchema>;

export const ministryFormSchema = z.object({
  name: z.string().min(2, "Le nom du département ou ministère doit comporter au moins 2 caractères"),
  leader_id: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export type MinistryFormInput = z.infer<typeof ministryFormSchema>;

export const groupMemberAssignmentSchema = z.object({
  group_id: z.string().uuid("Identifiant de cellule invalide"),
  member_id: z.string().uuid("Veuillez sélectionner un membre"),
  role: z.enum(["LEADER", "CO_LEADER", "HOST", "MEMBER"]).default("MEMBER"),
});

export type GroupMemberAssignmentInput = z.infer<typeof groupMemberAssignmentSchema>;

export const ministryMemberAssignmentSchema = z.object({
  ministry_id: z.string().uuid("Identifiant de ministère invalide"),
  member_id: z.string().uuid("Veuillez sélectionner un membre"),
  role: z.enum(["LEADER", "CO_LEADER", "VOLUNTEER", "COORDINATOR"]).default("VOLUNTEER"),
});

export type MinistryMemberAssignmentInput = z.infer<typeof ministryMemberAssignmentSchema>;
