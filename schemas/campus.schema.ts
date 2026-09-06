import { z } from "zod";

export const campusFormSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom du campus doit comporter au moins 2 caractères")
    .max(100, "Le nom du campus ne peut pas dépasser 100 caractères"),
  code: z
    .string()
    .max(20, "Le code ne peut pas dépasser 20 caractères")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  is_main: z.boolean().default(false),
  address: z
    .string()
    .max(200, "L'adresse ne peut pas dépasser 200 caractères")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  city: z
    .string()
    .max(100, "La ville ne peut pas dépasser 100 caractères")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  country: z
    .string()
    .max(100, "Le pays ne peut pas dépasser 100 caractères")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  phone: z
    .string()
    .max(50, "Le téléphone ne peut pas dépasser 50 caractères")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  email: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val === "" || z.string().email().safeParse(val).success, {
      message: "Adresse email invalide",
    })
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  pastor_name: z
    .string()
    .max(100, "Le nom du pasteur ne peut pas dépasser 100 caractères")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
});

export type CampusFormValues = z.infer<typeof campusFormSchema>;

export const campusRoomFormSchema = z.object({
  campus_id: z.string().min(1, "Veuillez rattacher ce local à un campus"),
  name: z
    .string()
    .min(2, "Le nom de la salle doit comporter au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  code: z
    .string()
    .max(20, "Le code ne peut pas dépasser 20 caractères")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  room_type: z.enum(
    ["SANCTUARY", "HALL", "CLASSROOM", "OFFICE", "STUDIO", "OTHER"],
    {
      required_error: "Veuillez sélectionner un type de salle",
    }
  ),
  capacity: z.coerce
    .number()
    .int("La capacité doit être un nombre entier")
    .min(0, "La capacité ne peut pas être négative")
    .default(0),
  floor_location: z
    .string()
    .max(150, "L'étage ou bâtiment ne peut pas dépasser 150 caractères")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  equipment_notes: z
    .string()
    .max(500, "Les notes d'équipement ne peuvent pas dépasser 500 caractères")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  is_active: z.boolean().default(true),
});

export type CampusRoomFormValues = z.infer<typeof campusRoomFormSchema>;
