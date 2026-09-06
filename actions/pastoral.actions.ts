"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  pastoralVisitSchema,
  prayerRequestSchema,
  prayerAnswerSchema,
  pastoralNoteSchema,
  type PastoralVisitInput,
  type PrayerRequestInput,
  type PrayerAnswerInput,
  type PastoralNoteInput,
} from "@/schemas/pastoral.schema";
import { revalidatePath } from "next/cache";

export interface PastoralActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

/**
 * Enregistrement d'une visite pastorale
 */
export async function createPastoralVisitAction(
  data: PastoralVisitInput
): Promise<PastoralActionResult> {
  const parsed = pastoralVisitSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données de la visite invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active sélectionnée." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Utilisateur non authentifié." };
  }

  const { data: visit, error } = await supabase
    .from("pastoral_visits")
    .insert({
      organization_id: activeOrg.organization.id,
      member_id: parsed.data.member_id || null,
      pastor_id: user.id,
      visit_date: parsed.data.visit_date,
      visit_type: parsed.data.visit_type,
      summary: parsed.data.summary,
      follow_up_needed: parsed.data.follow_up_needed,
      follow_up_date: parsed.data.follow_up_date || null,
    })
    .select("id")
    .single();

  if (error || !visit) {
    console.error("Erreur enregistrement visite pastorale:", error);
    return {
      success: false,
      error: error?.message || "Échec de l'enregistrement de la visite.",
    };
  }

  revalidatePath("/dashboard/pastoral");
  return { success: true, id: visit.id };
}

/**
 * Modification d'une visite pastorale
 */
export async function updatePastoralVisitAction(
  visitId: string,
  data: PastoralVisitInput
): Promise<PastoralActionResult> {
  const parsed = pastoralVisitSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données de la visite invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("pastoral_visits")
    .update({
      member_id: parsed.data.member_id || null,
      visit_date: parsed.data.visit_date,
      visit_type: parsed.data.visit_type,
      summary: parsed.data.summary,
      follow_up_needed: parsed.data.follow_up_needed,
      follow_up_date: parsed.data.follow_up_date || null,
    })
    .eq("id", visitId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur modification visite pastorale:", error);
    return {
      success: false,
      error: error.message || "Échec de la mise à jour de la visite.",
    };
  }

  revalidatePath("/dashboard/pastoral");
  revalidatePath(`/dashboard/pastoral/visits/${visitId}`);
  return { success: true, id: visitId };
}

/**
 * Suppression d'une visite pastorale
 */
export async function deletePastoralVisitAction(
  visitId: string
): Promise<PastoralActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("pastoral_visits")
    .delete()
    .eq("id", visitId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur suppression visite pastorale:", error);
    return {
      success: false,
      error: error.message || "Impossible de supprimer la visite.",
    };
  }

  revalidatePath("/dashboard/pastoral");
  return { success: true };
}

/**
 * Création d'une requête de prière
 */
export async function createPrayerRequestAction(
  data: PrayerRequestInput
): Promise<PastoralActionResult> {
  const parsed = prayerRequestSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données du sujet de prière invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { data: prayer, error } = await supabase
    .from("prayer_requests")
    .insert({
      organization_id: activeOrg.organization.id,
      requester_name: parsed.data.requester_name,
      member_id: parsed.data.member_id || null,
      title: parsed.data.title,
      description: parsed.data.description,
      visibility: parsed.data.visibility,
      status: parsed.data.status,
    })
    .select("id")
    .single();

  if (error || !prayer) {
    console.error("Erreur création requête de prière:", error);
    return {
      success: false,
      error: error?.message || "Échec de l'enregistrement de la requête.",
    };
  }

  revalidatePath("/dashboard/pastoral");
  return { success: true, id: prayer.id };
}

/**
 * Mise à jour du statut d'une requête de prière (ex: IN_PROGRESS, CLOSED)
 */
export async function updatePrayerStatusAction(
  prayerId: string,
  status: "PENDING" | "IN_PROGRESS" | "CLOSED"
): Promise<PastoralActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("prayer_requests")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", prayerId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur mise à jour statut prière:", error);
    return { success: false, error: error.message || "Échec de la mise à jour." };
  }

  revalidatePath("/dashboard/pastoral");
  revalidatePath(`/dashboard/pastoral/prayers/${prayerId}`);
  return { success: true };
}

/**
 * Enregistrement de l'exaucement d'une prière avec témoignage
 */
export async function answerPrayerRequestAction(
  data: PrayerAnswerInput
): Promise<PastoralActionResult> {
  const parsed = prayerAnswerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données d'exaucement invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("prayer_requests")
    .update({
      status: "ANSWERED",
      answered_at: new Date().toISOString(),
      answer_testimony: parsed.data.answer_testimony,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.prayer_id)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur enregistrement exaucement:", error);
    return {
      success: false,
      error: error.message || "Échec de l'enregistrement du témoignage.",
    };
  }

  revalidatePath("/dashboard/pastoral");
  revalidatePath(`/dashboard/pastoral/prayers/${parsed.data.prayer_id}`);
  return { success: true };
}

/**
 * Suppression d'une requête de prière
 */
export async function deletePrayerRequestAction(
  prayerId: string
): Promise<PastoralActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("prayer_requests")
    .delete()
    .eq("id", prayerId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur suppression prière:", error);
    return { success: false, error: error.message || "Impossible de supprimer la requête." };
  }

  revalidatePath("/dashboard/pastoral");
  return { success: true };
}

/**
 * Création d'une note pastorale confidentielle
 */
export async function createPastoralNoteAction(
  data: PastoralNoteInput
): Promise<PastoralActionResult> {
  const parsed = pastoralNoteSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données de la note invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Utilisateur non authentifié." };
  }

  const { data: note, error } = await supabase
    .from("pastoral_notes")
    .insert({
      organization_id: activeOrg.organization.id,
      member_id: parsed.data.member_id || null,
      author_id: user.id,
      confidential_level: parsed.data.confidential_level,
      note: parsed.data.note,
    })
    .select("id")
    .single();

  if (error || !note) {
    console.error("Erreur création note pastorale:", error);
    return {
      success: false,
      error: error?.message || "Échec de l'enregistrement de la note.",
    };
  }

  revalidatePath("/dashboard/pastoral");
  return { success: true, id: note.id };
}

/**
 * Suppression d'une note pastorale
 */
export async function deletePastoralNoteAction(
  noteId: string
): Promise<PastoralActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("pastoral_notes")
    .delete()
    .eq("id", noteId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur suppression note pastorale:", error);
    return { success: false, error: error.message || "Impossible de supprimer la note." };
  }

  revalidatePath("/dashboard/pastoral");
  return { success: true };
}
