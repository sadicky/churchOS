"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  serviceFormSchema,
  attendanceSessionSchema,
  visitorCheckInSchema,
  type ServiceFormInput,
  type AttendanceSessionInput,
  type VisitorCheckInInput,
} from "@/schemas/attendance.schema";
import { revalidatePath } from "next/cache";

export interface AttendanceActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

export async function createServiceAction(
  data: ServiceFormInput
): Promise<AttendanceActionResult> {
  const parsed = serviceFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données du culte invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune église active." };
  }

  const supabase = await createClient();

  const { data: service, error } = await supabase
    .from("services")
    .insert({
      organization_id: activeOrg.organization.id,
      name: parsed.data.name,
      service_date: parsed.data.service_date,
      start_time: parsed.data.start_time,
      end_time: parsed.data.end_time || null,
      preacher_name: parsed.data.preacher_name || null,
      worship_leader_name: parsed.data.worship_leader_name || null,
      theme: parsed.data.theme || null,
      scripture_reference: parsed.data.scripture_reference || null,
      campus_id: parsed.data.campus_id || null,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (error || !service) {
    return {
      success: false,
      error: error?.message || "Erreur lors de la création du culte.",
    };
  }

  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard");

  return { success: true, id: service.id };
}

export async function deleteServiceAction(id: string): Promise<AttendanceActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune église active." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createAttendanceSessionAction(
  data: AttendanceSessionInput
): Promise<AttendanceActionResult> {
  const parsed = attendanceSessionSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données de session invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune église active." };
  }

  const supabase = await createClient();
  const qrToken = `qr-${crypto.randomUUID()}`;

  const { data: session, error } = await supabase
    .from("attendance_sessions")
    .insert({
      organization_id: activeOrg.organization.id,
      title: parsed.data.title,
      service_id: parsed.data.service_id || null,
      session_date: parsed.data.session_date,
      campus_id: parsed.data.campus_id || null,
      qr_code_token: qrToken,
      is_open: true,
    })
    .select("id")
    .single();

  if (error || !session) {
    return {
      success: false,
      error: error?.message || "Erreur lors de l'ouverture de la session.",
    };
  }

  revalidatePath("/dashboard/attendance");
  return { success: true, id: session.id };
}

export async function toggleSessionStatusAction(
  sessionId: string,
  isOpen: boolean
): Promise<AttendanceActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune église active." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("attendance_sessions")
    .update({ is_open: isOpen })
    .eq("id", sessionId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/attendance/sessions/${sessionId}`);
  revalidatePath("/dashboard/attendance");
  return { success: true };
}

export async function checkInMemberAction(
  sessionId: string,
  memberId: string
): Promise<AttendanceActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune église active." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if already checked in
  const { data: existing } = await supabase
    .from("attendance_records")
    .select("id")
    .eq("session_id", sessionId)
    .eq("member_id", memberId)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "Ce fidèle est déjà émargé dans cette session.",
    };
  }

  const { data: record, error } = await supabase
    .from("attendance_records")
    .insert({
      organization_id: activeOrg.organization.id,
      session_id: sessionId,
      member_id: memberId,
      is_visitor: false,
      check_in_method: "MANUAL",
      recorded_by: user?.id || null,
    })
    .select("id")
    .single();

  if (error || !record) {
    return {
      success: false,
      error: error?.message || "Erreur lors de l'émargement.",
    };
  }

  revalidatePath(`/dashboard/attendance/sessions/${sessionId}`);
  return { success: true, id: record.id };
}

export async function checkInVisitorAction(
  sessionId: string,
  data: VisitorCheckInInput
): Promise<AttendanceActionResult> {
  const parsed = visitorCheckInSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données du visiteur invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune église active." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: record, error } = await supabase
    .from("attendance_records")
    .insert({
      organization_id: activeOrg.organization.id,
      session_id: sessionId,
      is_visitor: true,
      visitor_name: parsed.data.name,
      visitor_phone: parsed.data.phone || null,
      visitor_email: parsed.data.email || null,
      check_in_method: "MANUAL",
      recorded_by: user?.id || null,
    })
    .select("id")
    .single();

  if (error || !record) {
    return {
      success: false,
      error: error?.message || "Erreur lors de l'émargement du visiteur.",
    };
  }

  revalidatePath(`/dashboard/attendance/sessions/${sessionId}`);
  return { success: true, id: record.id };
}

export async function removeCheckInRecordAction(
  recordId: string,
  sessionId: string
): Promise<AttendanceActionResult> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune église active." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("attendance_records")
    .delete()
    .eq("id", recordId)
    .eq("organization_id", activeOrg.organization.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/attendance/sessions/${sessionId}`);
  return { success: true };
}
