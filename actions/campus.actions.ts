"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  campusFormSchema,
  campusRoomFormSchema,
  type CampusFormValues,
  type CampusRoomFormValues,
} from "@/schemas/campus.schema";

/**
 * Crée un nouveau campus pour l'organisation active
 */
export async function createCampusAction(values: CampusFormValues) {
  try {
    const validated = campusFormSchema.safeParse(values);
    if (!validated.success) {
      return {
        error: "Validation échouée : " + validated.error.issues[0]?.message,
      };
    }

    const activeOrg = await getActiveOrganization();
    if (!activeOrg) {
      return { error: "Aucune organisation active sélectionnée" };
    }

    const supabase = await createClient();

    // Si ce campus est défini comme principal, rétrograder les autres
    if (validated.data.is_main) {
      await supabase
        .from("campuses")
        .update({ is_main: false })
        .eq("organization_id", activeOrg.organization.id);
    }

    const { data: newCampus, error } = await supabase
      .from("campuses")
      .insert({
        organization_id: activeOrg.organization.id,
        name: validated.data.name,
        code: validated.data.code,
        is_main: validated.data.is_main,
        address: validated.data.address,
        city: validated.data.city,
        country: validated.data.country,
        phone: validated.data.phone,
        email: validated.data.email,
        pastor_name: validated.data.pastor_name,
      })
      .select("id")
      .single();

    if (error || !newCampus) {
      console.error("Erreur création campus:", error);
      return { error: error?.message || "Erreur lors de la création du campus" };
    }

    revalidatePath("/dashboard/campuses");
    revalidatePath("/dashboard/members");
    revalidatePath("/dashboard/attendance");
    revalidatePath("/dashboard/groups");

    return { success: true, campusId: newCampus.id };
  } catch (err: unknown) {
    console.error("Exception createCampusAction:", err);
    return { error: "Une erreur inattendue est survenue" };
  }
}

/**
 * Met à jour un campus existant
 */
export async function updateCampusAction(
  campusId: string,
  values: CampusFormValues
) {
  try {
    const validated = campusFormSchema.safeParse(values);
    if (!validated.success) {
      return {
        error: "Validation échouée : " + validated.error.issues[0]?.message,
      };
    }

    const activeOrg = await getActiveOrganization();
    if (!activeOrg) {
      return { error: "Aucune organisation active sélectionnée" };
    }

    const supabase = await createClient();

    // Si ce campus devient principal, rétrograder les autres
    if (validated.data.is_main) {
      await supabase
        .from("campuses")
        .update({ is_main: false })
        .eq("organization_id", activeOrg.organization.id);
    }

    const { error } = await supabase
      .from("campuses")
      .update({
        name: validated.data.name,
        code: validated.data.code,
        is_main: validated.data.is_main,
        address: validated.data.address,
        city: validated.data.city,
        country: validated.data.country,
        phone: validated.data.phone,
        email: validated.data.email,
        pastor_name: validated.data.pastor_name,
      })
      .eq("id", campusId)
      .eq("organization_id", activeOrg.organization.id);

    if (error) {
      console.error("Erreur modification campus:", error);
      return { error: error.message || "Erreur lors de la mise à jour du campus" };
    }

    revalidatePath("/dashboard/campuses");
    revalidatePath(`/dashboard/campuses/${campusId}`);

    return { success: true };
  } catch (err: unknown) {
    console.error("Exception updateCampusAction:", err);
    return { error: "Une erreur inattendue est survenue" };
  }
}

/**
 * Supprime un campus (sécurisé : interdit si c'est le seul campus)
 */
export async function deleteCampusAction(campusId: string) {
  try {
    const activeOrg = await getActiveOrganization();
    if (!activeOrg) {
      return { error: "Aucune organisation active" };
    }

    const supabase = await createClient();

    // Vérifier le nombre total de campus
    const { count, error: countErr } = await supabase
      .from("campuses")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", activeOrg.organization.id);

    if (countErr) {
      return { error: countErr.message };
    }

    if ((count || 0) <= 1) {
      return {
        error: "Impossible de supprimer le seul campus de l'église.",
      };
    }

    // Vérifier si c'est le campus principal
    const { data: targetCampus } = await supabase
      .from("campuses")
      .select("is_main")
      .eq("id", campusId)
      .single();

    if (targetCampus?.is_main) {
      return {
        error:
          "Ce campus est désigné comme principal. Veuillez désigner un autre campus principal avant de le supprimer.",
      };
    }

    const { error } = await supabase
      .from("campuses")
      .delete()
      .eq("id", campusId)
      .eq("organization_id", activeOrg.organization.id);

    if (error) {
      console.error("Erreur suppression campus:", error);
      return { error: error.message };
    }

    revalidatePath("/dashboard/campuses");
    return { success: true };
  } catch (err: unknown) {
    console.error("Exception deleteCampusAction:", err);
    return { error: "Une erreur inattendue est survenue" };
  }
}

/**
 * Définit un campus comme campus principal
 */
export async function setMainCampusAction(campusId: string) {
  try {
    const activeOrg = await getActiveOrganization();
    if (!activeOrg) {
      return { error: "Aucune organisation active" };
    }

    const supabase = await createClient();

    // Rétrograder tous les autres
    await supabase
      .from("campuses")
      .update({ is_main: false })
      .eq("organization_id", activeOrg.organization.id);

    // Activer celui-ci
    const { error } = await supabase
      .from("campuses")
      .update({ is_main: true })
      .eq("id", campusId)
      .eq("organization_id", activeOrg.organization.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/campuses");
    revalidatePath(`/dashboard/campuses/${campusId}`);
    return { success: true };
  } catch (err: unknown) {
    console.error("Exception setMainCampusAction:", err);
    return { error: "Une erreur inattendue est survenue" };
  }
}

/**
 * Ajoute une salle ou local à un campus
 */
export async function createRoomAction(values: CampusRoomFormValues) {
  try {
    const validated = campusRoomFormSchema.safeParse(values);
    if (!validated.success) {
      return {
        error: "Validation échouée : " + validated.error.issues[0]?.message,
      };
    }

    const activeOrg = await getActiveOrganization();
    if (!activeOrg) {
      return { error: "Aucune organisation active" };
    }

    const supabase = await createClient();

    const { error } = await supabase.from("campus_rooms").insert({
      organization_id: activeOrg.organization.id,
      campus_id: validated.data.campus_id,
      name: validated.data.name,
      code: validated.data.code,
      room_type: validated.data.room_type,
      capacity: validated.data.capacity,
      floor_location: validated.data.floor_location,
      equipment_notes: validated.data.equipment_notes,
      is_active: validated.data.is_active,
    });

    if (error) {
      console.error("Erreur création salle:", error);
      return { error: error.message || "Erreur lors de la création de la salle" };
    }

    revalidatePath("/dashboard/campuses");
    revalidatePath(`/dashboard/campuses/${validated.data.campus_id}`);

    return { success: true };
  } catch (err: unknown) {
    console.error("Exception createRoomAction:", err);
    return { error: "Une erreur inattendue est survenue" };
  }
}

/**
 * Met à jour une salle ou local
 */
export async function updateRoomAction(
  roomId: string,
  values: CampusRoomFormValues
) {
  try {
    const validated = campusRoomFormSchema.safeParse(values);
    if (!validated.success) {
      return {
        error: "Validation échouée : " + validated.error.issues[0]?.message,
      };
    }

    const activeOrg = await getActiveOrganization();
    if (!activeOrg) {
      return { error: "Aucune organisation active" };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("campus_rooms")
      .update({
        campus_id: validated.data.campus_id,
        name: validated.data.name,
        code: validated.data.code,
        room_type: validated.data.room_type,
        capacity: validated.data.capacity,
        floor_location: validated.data.floor_location,
        equipment_notes: validated.data.equipment_notes,
        is_active: validated.data.is_active,
      })
      .eq("id", roomId)
      .eq("organization_id", activeOrg.organization.id);

    if (error) {
      console.error("Erreur modification salle:", error);
      return { error: error.message || "Erreur lors de la mise à jour de la salle" };
    }

    revalidatePath("/dashboard/campuses");
    revalidatePath(`/dashboard/campuses/${validated.data.campus_id}`);

    return { success: true };
  } catch (err: unknown) {
    console.error("Exception updateRoomAction:", err);
    return { error: "Une erreur inattendue est survenue" };
  }
}

/**
 * Supprime une salle
 */
export async function deleteRoomAction(roomId: string) {
  try {
    const activeOrg = await getActiveOrganization();
    if (!activeOrg) {
      return { error: "Aucune organisation active" };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("campus_rooms")
      .delete()
      .eq("id", roomId)
      .eq("organization_id", activeOrg.organization.id);

    if (error) {
      console.error("Erreur suppression salle:", error);
      return { error: error.message };
    }

    revalidatePath("/dashboard/campuses");
    return { success: true };
  } catch (err: unknown) {
    console.error("Exception deleteRoomAction:", err);
    return { error: "Une erreur inattendue est survenue" };
  }
}
