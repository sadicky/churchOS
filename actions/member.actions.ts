"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  memberFormSchema,
  memberNoteSchema,
  type MemberFormInput,
  type MemberNoteInput,
} from "@/schemas/member.schema";
import { revalidatePath } from "next/cache";

export interface MemberActionResult {
  success: boolean;
  error?: string;
  memberId?: string;
}

export async function createMemberAction(
  data: MemberFormInput
): Promise<MemberActionResult> {
  const parsed = memberFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return {
      success: false,
      error: "Aucune église active sélectionnée.",
    };
  }

  const supabase = await createClient();
  const orgId = activeOrg.organization.id;

  const { data: member, error } = await supabase
    .from("members")
    .insert({
      organization_id: orgId,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      gender: parsed.data.gender || null,
      date_of_birth: parsed.data.date_of_birth || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      country: parsed.data.country || null,
      marital_status: parsed.data.marital_status || null,
      occupation: parsed.data.occupation || null,
      membership_status: parsed.data.membership_status,
      campus_id: parsed.data.campus_id || null,
      join_date: parsed.data.join_date || new Date().toISOString().slice(0, 10),
      baptism_date: parsed.data.baptism_date || null,
      emergency_contact_name: parsed.data.emergency_contact_name || null,
      emergency_contact_phone: parsed.data.emergency_contact_phone || null,
      emergency_contact_relation: parsed.data.emergency_contact_relation || null,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (error || !member) {
    return {
      success: false,
      error: error?.message || "Erreur lors de l'enregistrement du membre.",
    };
  }

  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard");

  return {
    success: true,
    memberId: member.id,
  };
}

export async function updateMemberAction(
  id: string,
  data: MemberFormInput
): Promise<MemberActionResult> {
  const parsed = memberFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return {
      success: false,
      error: "Aucune église active sélectionnée.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("members")
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      gender: parsed.data.gender || null,
      date_of_birth: parsed.data.date_of_birth || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      country: parsed.data.country || null,
      marital_status: parsed.data.marital_status || null,
      occupation: parsed.data.occupation || null,
      membership_status: parsed.data.membership_status,
      campus_id: parsed.data.campus_id || null,
      join_date: parsed.data.join_date || null,
      baptism_date: parsed.data.baptism_date || null,
      emergency_contact_name: parsed.data.emergency_contact_name || null,
      emergency_contact_phone: parsed.data.emergency_contact_phone || null,
      emergency_contact_relation: parsed.data.emergency_contact_relation || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", id)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    return {
      success: false,
      error: error.message || "Erreur lors de la mise à jour du membre.",
    };
  }

  revalidatePath("/dashboard/members");
  revalidatePath(`/dashboard/members/${id}`);
  revalidatePath("/dashboard");

  return { success: true, memberId: id };
}

export async function deleteMemberAction(id: string): Promise<MemberActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return {
      success: false,
      error: "Aucune église active sélectionnée.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", id)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    return {
      success: false,
      error: error.message || "Erreur lors de la suppression.",
    };
  }

  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function createMemberNoteAction(
  memberId: string,
  data: MemberNoteInput
): Promise<MemberActionResult> {
  const parsed = memberNoteSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Contenu de note invalide.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return {
      success: false,
      error: "Aucune église active sélectionnée.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Non autorisé.",
    };
  }

  const { error } = await supabase.from("member_notes").insert({
    organization_id: activeOrg.organization.id,
    member_id: memberId,
    author_id: user.id,
    title: parsed.data.title || null,
    content: parsed.data.content,
    is_private: parsed.data.is_private,
  });

  if (error) {
    return {
      success: false,
      error: error.message || "Impossible d'enregistrer la note.",
    };
  }

  revalidatePath(`/dashboard/members/${memberId}`);
  return { success: true };
}
