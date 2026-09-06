"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  groupFormSchema,
  ministryFormSchema,
  groupMemberAssignmentSchema,
  ministryMemberAssignmentSchema,
  type GroupFormInput,
  type MinistryFormInput,
  type GroupMemberAssignmentInput,
  type MinistryMemberAssignmentInput,
} from "@/schemas/community.schema";
import { revalidatePath } from "next/cache";

export interface CommunityActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

/**
 * Création d'une cellule de maison / groupe de quartier
 */
export async function createGroupAction(
  data: GroupFormInput
): Promise<CommunityActionResult> {
  const parsed = groupFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données de la cellule invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active sélectionnée." };
  }

  const supabase = await createClient();

  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      organization_id: activeOrg.organization.id,
      campus_id: parsed.data.campus_id || null,
      name: parsed.data.name,
      description: parsed.data.description || null,
      leader_id: parsed.data.leader_id || null,
      meeting_day: parsed.data.meeting_day || null,
      meeting_time: parsed.data.meeting_time || null,
      meeting_location: parsed.data.meeting_location || null,
      is_active: parsed.data.is_active ?? true,
    })
    .select("id")
    .single();

  if (error || !group) {
    console.error("Erreur création groupe:", error);
    return {
      success: false,
      error: error?.message || "Échec de l'enregistrement de la cellule.",
    };
  }

  // Si un conducteur est spécifié, on l'ajoute automatiquement comme LEADER dans group_members
  if (parsed.data.leader_id) {
    await supabase.from("group_members").insert({
      group_id: group.id,
      member_id: parsed.data.leader_id,
      role: "LEADER",
    });
  }

  revalidatePath("/dashboard/groups");
  return { success: true, id: group.id };
}

/**
 * Modification d'une cellule de maison
 */
export async function updateGroupAction(
  groupId: string,
  data: GroupFormInput
): Promise<CommunityActionResult> {
  const parsed = groupFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données de la cellule invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active sélectionnée." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("groups")
    .update({
      campus_id: parsed.data.campus_id || null,
      name: parsed.data.name,
      description: parsed.data.description || null,
      leader_id: parsed.data.leader_id || null,
      meeting_day: parsed.data.meeting_day || null,
      meeting_time: parsed.data.meeting_time || null,
      meeting_location: parsed.data.meeting_location || null,
      is_active: parsed.data.is_active ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", groupId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur modification groupe:", error);
    return {
      success: false,
      error: error.message || "Échec de la mise à jour de la cellule.",
    };
  }

  revalidatePath("/dashboard/groups");
  revalidatePath(`/dashboard/groups/${groupId}`);
  return { success: true, id: groupId };
}

/**
 * Suppression d'une cellule
 */
export async function deleteGroupAction(
  groupId: string
): Promise<CommunityActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", groupId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur suppression groupe:", error);
    return { success: false, error: error.message || "Impossible de supprimer la cellule." };
  }

  revalidatePath("/dashboard/groups");
  return { success: true };
}

/**
 * Affectation d'un membre à une cellule
 */
export async function addMemberToGroupAction(
  data: GroupMemberAssignmentInput
): Promise<CommunityActionResult> {
  const parsed = groupMemberAssignmentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données d'affectation invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { data: inserted, error } = await supabase
    .from("group_members")
    .insert({
      group_id: parsed.data.group_id,
      member_id: parsed.data.member_id,
      role: parsed.data.role,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Ce fidèle fait déjà partie de cette cellule." };
    }
    console.error("Erreur affectation membre cellule:", error);
    return { success: false, error: error.message || "Impossible d'affecter le membre." };
  }

  revalidatePath(`/dashboard/groups/${parsed.data.group_id}`);
  revalidatePath("/dashboard/groups");
  return { success: true, id: inserted?.id };
}

/**
 * Retrait d'un membre d'une cellule
 */
export async function removeMemberFromGroupAction(
  groupMemberId: string,
  groupId: string
): Promise<CommunityActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("id", groupMemberId);

  if (error) {
    console.error("Erreur retrait membre groupe:", error);
    return { success: false, error: error.message || "Impossible de retirer le membre." };
  }

  revalidatePath(`/dashboard/groups/${groupId}`);
  revalidatePath("/dashboard/groups");
  return { success: true };
}

/**
 * Création d'un département / ministère
 */
export async function createMinistryAction(
  data: MinistryFormInput
): Promise<CommunityActionResult> {
  const parsed = ministryFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données du département invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active sélectionnée." };
  }

  const supabase = await createClient();

  const { data: ministry, error } = await supabase
    .from("ministries")
    .insert({
      organization_id: activeOrg.organization.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      leader_id: parsed.data.leader_id || null,
      is_active: parsed.data.is_active ?? true,
    })
    .select("id")
    .single();

  if (error || !ministry) {
    console.error("Erreur création ministère:", error);
    return {
      success: false,
      error: error?.message || "Échec de l'enregistrement du département.",
    };
  }

  // Si un responsable est spécifié, on l'ajoute automatiquement comme LEADER dans ministry_members
  if (parsed.data.leader_id) {
    await supabase.from("ministry_members").insert({
      ministry_id: ministry.id,
      member_id: parsed.data.leader_id,
      role: "LEADER",
    });
  }

  revalidatePath("/dashboard/groups");
  return { success: true, id: ministry.id };
}

/**
 * Modification d'un département / ministère
 */
export async function updateMinistryAction(
  ministryId: string,
  data: MinistryFormInput
): Promise<CommunityActionResult> {
  const parsed = ministryFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données du département invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("ministries")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      leader_id: parsed.data.leader_id || null,
      is_active: parsed.data.is_active ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ministryId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur modification ministère:", error);
    return {
      success: false,
      error: error.message || "Échec de la mise à jour du département.",
    };
  }

  revalidatePath("/dashboard/groups");
  revalidatePath(`/dashboard/groups/ministries/${ministryId}`);
  return { success: true, id: ministryId };
}

/**
 * Suppression d'un département
 */
export async function deleteMinistryAction(
  ministryId: string
): Promise<CommunityActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("ministries")
    .delete()
    .eq("id", ministryId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    console.error("Erreur suppression ministère:", error);
    return { success: false, error: error.message || "Impossible de supprimer le département." };
  }

  revalidatePath("/dashboard/groups");
  return { success: true };
}

/**
 * Affectation d'un bénévole à un ministère
 */
export async function addMemberToMinistryAction(
  data: MinistryMemberAssignmentInput
): Promise<CommunityActionResult> {
  const parsed = ministryMemberAssignmentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données d'affectation invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { data: inserted, error } = await supabase
    .from("ministry_members")
    .insert({
      ministry_id: parsed.data.ministry_id,
      member_id: parsed.data.member_id,
      role: parsed.data.role,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Ce serviteur est déjà engagé dans ce département." };
    }
    console.error("Erreur affectation bénévole ministère:", error);
    return { success: false, error: error.message || "Impossible d'affecter le serviteur." };
  }

  revalidatePath(`/dashboard/groups/ministries/${parsed.data.ministry_id}`);
  revalidatePath("/dashboard/groups");
  return { success: true, id: inserted?.id };
}

/**
 * Retrait d'un bénévole d'un ministère
 */
export async function removeMemberFromMinistryAction(
  ministryMemberId: string,
  ministryId: string
): Promise<CommunityActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune organisation active." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("ministry_members")
    .delete()
    .eq("id", ministryMemberId);

  if (error) {
    console.error("Erreur retrait serviteur:", error);
    return { success: false, error: error.message || "Impossible de retirer le serviteur." };
  }

  revalidatePath(`/dashboard/groups/ministries/${ministryId}`);
  revalidatePath("/dashboard/groups");
  return { success: true };
}
