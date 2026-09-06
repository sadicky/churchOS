"use server";

import { createClient } from "@/lib/supabase/server";
import { setActiveOrganization } from "@/services/tenant.service";
import { revalidatePath } from "next/cache";

export interface SwitchOrgResult {
  success: boolean;
  error?: string;
}

export async function switchActiveOrganizationAction(
  organizationId: string
): Promise<SwitchOrgResult> {
  if (!organizationId) {
    return { success: false, error: "Identifiant d'organisation manquant." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Utilisateur non authentifié." };
  }

  // Verify that the user actually belongs to this organization
  const { data: member, error: memberError } = await supabase
    .from("organization_members")
    .select("id, organization_id")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (memberError || !member) {
    return {
      success: false,
      error: "Vous n'avez pas accès à cette organisation.",
    };
  }

  await setActiveOrganization(organizationId);
  revalidatePath("/dashboard", "layout");
  return { success: true };
}
