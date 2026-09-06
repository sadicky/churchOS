import { z } from "zod";

export const donationFormSchema = z.object({
  member_id: z.string().uuid("Membre invalide.").nullable().optional().or(z.literal("")),
  donor_name: z.string().nullable().optional(),
  donor_email: z.string().email("Email invalide.").nullable().optional().or(z.literal("")),
  type: z
    .enum([
      "TITHE",
      "OFFERING",
      "DONATION",
      "MISSIONS",
      "BUILDING",
      "SPECIAL_PROJECT",
      "OTHER",
    ])
    .default("TITHE"),
  amount: z.coerce.number().positive("Le montant doit être supérieur à 0."),
  currency: z.string().min(3, "Devise requise.").default("USD"),
  payment_method: z
    .enum(["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CARD", "OTHER"])
    .default("CASH"),
  account_id: z.string().uuid("Veuillez sélectionner un compte de trésorerie."),
  donation_date: z.string().min(10, "Date du don requise."),
  reference: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const expenseFormSchema = z.object({
  category_id: z.string().uuid("Veuillez sélectionner une catégorie de dépense.").nullable().optional().or(z.literal("")),
  account_id: z.string().uuid("Veuillez sélectionner le compte à débiter."),
  amount: z.coerce.number().positive("Le montant doit être supérieur à 0."),
  currency: z.string().min(3, "Devise requise.").default("USD"),
  transaction_date: z.string().min(10, "Date de la dépense requise."),
  description: z.string().min(3, "Veuillez fournir un libellé descriptif."),
  reference: z.string().nullable().optional(),
});

export const accountFormSchema = z.object({
  name: z.string().min(2, "Le nom du compte doit comporter au moins 2 caractères."),
  type: z.enum(["CASH", "BANK", "MOBILE_MONEY", "OTHER"]).default("CASH"),
  account_number: z.string().nullable().optional(),
  currency: z.string().min(3, "Devise requise.").default("USD"),
  balance: z.coerce.number().min(0, "Le solde initial ne peut être négatif.").default(0),
});

export const transferFormSchema = z.object({
  source_account_id: z.string().uuid("Compte source requis."),
  destination_account_id: z.string().uuid("Compte destinataire requis."),
  amount: z.coerce.number().positive("Le montant du virement doit être positif."),
  description: z.string().nullable().optional(),
}).refine((data) => data.source_account_id !== data.destination_account_id, {
  message: "Le compte source et le compte destinataire doivent être différents.",
  path: ["destination_account_id"],
});

export type DonationFormInput = z.infer<typeof donationFormSchema>;
export type ExpenseFormInput = z.infer<typeof expenseFormSchema>;
export type AccountFormInput = z.infer<typeof accountFormSchema>;
export type TransferFormInput = z.infer<typeof transferFormSchema>;
