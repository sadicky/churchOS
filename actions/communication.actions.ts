"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/services/tenant.service";
import { getAudienceCounts } from "@/services/communication.service";
import {
  announcementFormSchema,
  broadcastFormSchema,
  notificationFormSchema,
  type AnnouncementFormInput,
  type BroadcastFormInput,
  type NotificationFormInput,
} from "@/schemas/communication.schema";
import { revalidatePath } from "next/cache";

export interface CommunicationActionResult {
  success: boolean;
  error?: string;
  id?: string;
  recipientsCount?: number;
}

/**
 * Création d'une annonce officielle
 */
export async function createAnnouncementAction(
  data: AnnouncementFormInput
): Promise<CommunicationActionResult> {
  const parsed = announcementFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données de l'annonce invalides.",
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

  const { data: announcement, error } = await supabase
    .from("announcements")
    .insert({
      organization_id: activeOrg.organization.id,
      author_id: user?.id || null,
      title: parsed.data.title,
      content: parsed.data.content,
      is_pinned: parsed.data.is_pinned ?? false,
      expires_at: parsed.data.expires_at || null,
    })
    .select("id")
    .single();

  if (error || !announcement) {
    console.error("Erreur création annonce:", error);
    return {
      success: false,
      error: error?.message || "Échec de l'enregistrement de l'annonce.",
    };
  }

  revalidatePath("/dashboard/communication");
  revalidatePath("/dashboard");
  return { success: true, id: announcement.id };
}

/**
 * Modification d'une annonce officielle
 */
export async function updateAnnouncementAction(
  announcementId: string,
  data: AnnouncementFormInput
): Promise<CommunicationActionResult> {
  const parsed = announcementFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données de l'annonce invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("announcements")
    .update({
      title: parsed.data.title,
      content: parsed.data.content,
      is_pinned: parsed.data.is_pinned ?? false,
      expires_at: parsed.data.expires_at || null,
    })
    .eq("id", announcementId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur modification annonce:", error);
    return {
      success: false,
      error: error.message || "Échec de la mise à jour de l'annonce.",
    };
  }

  revalidatePath("/dashboard/communication");
  revalidatePath("/dashboard");
  return { success: true, id: announcementId };
}

/**
 * Suppression d'une annonce
 */
export async function deleteAnnouncementAction(
  announcementId: string
): Promise<CommunicationActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", announcementId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur suppression annonce:", error);
    return {
      success: false,
      error: error.message || "Impossible de supprimer l'annonce.",
    };
  }

  revalidatePath("/dashboard/communication");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Diffusion d'une campagne SMS / Email / Notification
 */
export async function sendBroadcastAction(
  data: BroadcastFormInput
): Promise<CommunicationActionResult> {
  const parsed = broadcastFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données de diffusion invalides.",
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

  // Déterminer le nombre réel de destinataires selon l'audience choisie
  const audienceCounts = await getAudienceCounts(activeOrg.organization.id);
  let recipientsCount = audienceCounts.all;

  if (parsed.data.target_audience === "LEADERS") {
    recipientsCount = audienceCounts.leaders;
  } else if (parsed.data.target_audience === "VOLUNTEERS") {
    recipientsCount = audienceCounts.volunteers;
  } else if (parsed.data.target_audience === "VISITORS") {
    recipientsCount = audienceCounts.visitors;
  }

  // Enregistrement de la diffusion dans communication_broadcasts
  const { data: broadcast, error } = await supabase
    .from("communication_broadcasts")
    .insert({
      organization_id: activeOrg.organization.id,
      sender_id: user?.id || null,
      channel: parsed.data.channel,
      target_audience: parsed.data.target_audience,
      title: parsed.data.title,
      message: parsed.data.message,
      recipients_count: recipientsCount,
      status: "SENT",
      sent_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !broadcast) {
    console.error("Erreur enregistrement campagne diffusion:", error);
    return {
      success: false,
      error: error?.message || "Échec de l'envoi de la campagne.",
    };
  }

  revalidatePath("/dashboard/communication");
  return { success: true, id: broadcast.id, recipientsCount };
}

/**
 * Marquage d'une notification comme lue
 */
export async function markNotificationAsReadAction(
  notificationId: string
): Promise<CommunicationActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("Erreur lecture notification:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/communication");
  return { success: true };
}

/**
 * Marquage de toutes les notifications comme lues
 */
export async function markAllNotificationsAsReadAction(): Promise<CommunicationActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id);

  if (error) {
    console.error("Erreur marquage global notifications:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/communication");
  return { success: true };
}

/**
 * Suppression d'une notification
 */
export async function deleteNotificationAction(
  notificationId: string
): Promise<CommunicationActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) {
    console.error("Erreur suppression notification:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/communication");
  return { success: true };
}
