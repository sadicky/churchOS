"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  sermonFormSchema,
  mediaFileFormSchema,
  type SermonFormInput,
  type MediaFileFormInput,
} from "@/schemas/sermon.schema";
import { revalidatePath } from "next/cache";

export interface SermonActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

/**
 * Création d'une prédication / enseignement
 */
export async function createSermonAction(
  data: SermonFormInput
): Promise<SermonActionResult> {
  const parsed = sermonFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données du message invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active sélectionnée." };
  }

  const supabase = await createClient();

  const { data: sermon, error } = await supabase
    .from("sermons")
    .insert({
      organization_id: activeOrg.organization.id,
      title: parsed.data.title,
      preacher: parsed.data.preacher,
      sermon_date: parsed.data.sermon_date,
      scripture_reference: parsed.data.scripture_reference || null,
      series_name: parsed.data.series_name || null,
      description: parsed.data.description || null,
      content: parsed.data.content || null,
      video_url: parsed.data.video_url || null,
      audio_url: parsed.data.audio_url || null,
      notes_url: parsed.data.notes_url || null,
      tags: parsed.data.tags || [],
    })
    .select("id")
    .single();

  if (error || !sermon) {
    console.error("Erreur création sermon:", error);
    return {
      success: false,
      error: error?.message || "Échec de l'enregistrement de la prédication.",
    };
  }

  revalidatePath("/dashboard/sermons");
  return { success: true, id: sermon.id };
}

/**
 * Modification d'une prédication
 */
export async function updateSermonAction(
  sermonId: string,
  data: SermonFormInput
): Promise<SermonActionResult> {
  const parsed = sermonFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données du message invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("sermons")
    .update({
      title: parsed.data.title,
      preacher: parsed.data.preacher,
      sermon_date: parsed.data.sermon_date,
      scripture_reference: parsed.data.scripture_reference || null,
      series_name: parsed.data.series_name || null,
      description: parsed.data.description || null,
      content: parsed.data.content || null,
      video_url: parsed.data.video_url || null,
      audio_url: parsed.data.audio_url || null,
      notes_url: parsed.data.notes_url || null,
      tags: parsed.data.tags || [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", sermonId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur modification sermon:", error);
    return {
      success: false,
      error: error.message || "Échec de la mise à jour du message.",
    };
  }

  revalidatePath("/dashboard/sermons");
  revalidatePath(`/dashboard/sermons/${sermonId}`);
  return { success: true, id: sermonId };
}

/**
 * Suppression d'une prédication
 */
export async function deleteSermonAction(
  sermonId: string
): Promise<SermonActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("sermons")
    .delete()
    .eq("id", sermonId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur suppression sermon:", error);
    return {
      success: false,
      error: error.message || "Impossible de supprimer la prédication.",
    };
  }

  revalidatePath("/dashboard/sermons");
  return { success: true };
}

/**
 * Ajout d'un document ou d'une ressource multimédia
 */
export async function createMediaFileAction(
  data: MediaFileFormInput
): Promise<SermonActionResult> {
  const parsed = mediaFileFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données du document invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { data: media, error } = await supabase
    .from("media_files")
    .insert({
      organization_id: activeOrg.organization.id,
      title: parsed.data.title,
      file_type: parsed.data.file_type,
      bucket_name: parsed.data.bucket_name,
      file_path: parsed.data.file_path,
      file_size_bytes: parsed.data.file_size_bytes || null,
      mime_type: parsed.data.mime_type || null,
    })
    .select("id")
    .single();

  if (error || !media) {
    console.error("Erreur ajout ressource:", error);
    return {
      success: false,
      error: error?.message || "Échec de l'enregistrement du document.",
    };
  }

  revalidatePath("/dashboard/sermons");
  return { success: true, id: media.id };
}

/**
 * Suppression d'un document ou ressource
 */
export async function deleteMediaFileAction(
  mediaId: string
): Promise<SermonActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("media_files")
    .delete()
    .eq("id", mediaId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur suppression document:", error);
    return {
      success: false,
      error: error.message || "Impossible de supprimer le document.",
    };
  }

  revalidatePath("/dashboard/sermons");
  return { success: true };
}
