import { createClient } from "@/lib/supabase/server";
import type { Service, AttendanceSession, AttendanceRecord, Campus } from "@/types";

export interface ServiceListItem extends Service {
  campuses: {
    id: string;
    name: string;
  } | null;
}

export interface AttendanceSessionListItem extends AttendanceSession {
  services: {
    id: string;
    name: string;
    theme: string | null;
  } | null;
  campuses: {
    id: string;
    name: string;
  } | null;
  totalAttendees: number;
}

export interface AttendanceRecordItem extends AttendanceRecord {
  member: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    membership_status: string;
  } | null;
}

export interface SessionDetailWithRecords extends AttendanceSession {
  services: {
    id: string;
    name: string;
    theme: string | null;
    preacher_name: string | null;
    start_time: string;
  } | null;
  campuses: {
    id: string;
    name: string;
  } | null;
  records: AttendanceRecordItem[];
  stats: {
    total: number;
    members: number;
    visitors: number;
  };
}

export interface AttendanceMetrics {
  totalSessions: number;
  lastSessionAttendees: number;
  averageAttendees: number;
  totalServicesCount: number;
}

export async function getServicesList(organizationId: string): Promise<ServiceListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select(`
      *,
      campuses:campus_id (
        id,
        name
      )
    `)
    .eq("organization_id", organizationId)
    .order("service_date", { ascending: false });

  if (error) {
    console.error("Error fetching services:", error);
  }

  return (data || []) as ServiceListItem[];
}

export async function getAttendanceSessions(
  organizationId: string
): Promise<AttendanceSessionListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("attendance_sessions")
    .select(`
      *,
      services:service_id (
        id,
        name,
        theme
      ),
      campuses:campus_id (
        id,
        name
      )
    `)
    .eq("organization_id", organizationId)
    .order("session_date", { ascending: false });

  if (error || !data) {
    return [];
  }

  // Fetch record counts for these sessions
  const sessionIds = data.map((s) => s.id);
  const { data: recordsData } = await supabase
    .from("attendance_records")
    .select("session_id")
    .in("session_id", sessionIds);

  const countsMap = new Map<string, number>();
  (recordsData || []).forEach((r) => {
    countsMap.set(r.session_id, (countsMap.get(r.session_id) || 0) + 1);
  });

  return data.map((session) => ({
    ...(session as unknown as AttendanceSession),
    services: session.services as unknown as { id: string; name: string; theme: string | null } | null,
    campuses: session.campuses as unknown as { id: string; name: string } | null,
    totalAttendees: countsMap.get(session.id) || 0,
  }));
}

export async function getSessionDetailWithRecords(
  sessionId: string,
  organizationId: string
): Promise<SessionDetailWithRecords | null> {
  const supabase = await createClient();

  // 1. Fetch Session
  const { data: session, error } = await supabase
    .from("attendance_sessions")
    .select(`
      *,
      services:service_id (
        id,
        name,
        theme,
        preacher_name,
        start_time
      ),
      campuses:campus_id (
        id,
        name
      )
    `)
    .eq("id", sessionId)
    .eq("organization_id", organizationId)
    .single();

  if (error || !session) {
    return null;
  }

  // 2. Fetch Records
  const { data: recordsData } = await supabase
    .from("attendance_records")
    .select(`
      *,
      members:member_id (
        id,
        first_name,
        last_name,
        phone,
        membership_status
      )
    `)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  const records: AttendanceRecordItem[] = (recordsData || []).map((r) => ({
    ...(r as unknown as AttendanceRecord),
    member: r.members as unknown as {
      id: string;
      first_name: string;
      last_name: string;
      phone: string | null;
      membership_status: string;
    } | null,
  }));

  const membersCount = records.filter((r) => !r.is_visitor && r.member_id).length;
  const visitorsCount = records.filter((r) => r.is_visitor).length;

  return {
    ...(session as unknown as AttendanceSession),
    services: session.services as unknown as {
      id: string;
      name: string;
      theme: string | null;
      preacher_name: string | null;
      start_time: string;
    } | null,
    campuses: session.campuses as unknown as { id: string; name: string } | null,
    records,
    stats: {
      total: records.length,
      members: membersCount,
      visitors: visitorsCount,
    },
  };
}

export async function searchMembersForCheckIn(
  organizationId: string,
  sessionId: string,
  term: string
): Promise<{ id: string; first_name: string; last_name: string; phone: string | null; isAlreadyCheckedIn: boolean }[]> {
  if (!term || term.trim().length < 2) {
    return [];
  }

  const supabase = await createClient();
  const searchPattern = `%${term.trim()}%`;

  // 1. Fetch matching members
  const { data: members } = await supabase
    .from("members")
    .select("id, first_name, last_name, phone")
    .eq("organization_id", organizationId)
    .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},phone.ilike.${searchPattern}`)
    .limit(10);

  if (!members || members.length === 0) {
    return [];
  }

  // 2. Check which are already checked into this session
  const memberIds = members.map((m) => m.id);
  const { data: existingRecords } = await supabase
    .from("attendance_records")
    .select("member_id")
    .eq("session_id", sessionId)
    .in("member_id", memberIds);

  const checkedInSet = new Set((existingRecords || []).map((r) => r.member_id));

  return members.map((m) => ({
    id: m.id,
    first_name: m.first_name,
    last_name: m.last_name,
    phone: m.phone,
    isAlreadyCheckedIn: checkedInSet.has(m.id),
  }));
}

export async function getAttendanceMetrics(
  organizationId: string
): Promise<AttendanceMetrics> {
  const supabase = await createClient();

  const { count: servicesCount } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  const { data: sessions } = await supabase
    .from("attendance_sessions")
    .select("id")
    .eq("organization_id", organizationId);

  const totalSessions = sessions ? sessions.length : 0;

  if (totalSessions === 0) {
    return {
      totalSessions: 0,
      lastSessionAttendees: 0,
      averageAttendees: 0,
      totalServicesCount: servicesCount || 0,
    };
  }

  const { data: latestSession } = await supabase
    .from("attendance_sessions")
    .select("id")
    .eq("organization_id", organizationId)
    .order("session_date", { ascending: false })
    .limit(1)
    .single();

  let lastSessionAttendees = 0;
  if (latestSession) {
    const { count } = await supabase
      .from("attendance_records")
      .select("*", { count: "exact", head: true })
      .eq("session_id", latestSession.id);
    lastSessionAttendees = count || 0;
  }

  const { count: totalRecords } = await supabase
    .from("attendance_records")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  const averageAttendees = totalSessions > 0 ? Math.round((totalRecords || 0) / totalSessions) : 0;

  return {
    totalSessions,
    lastSessionAttendees,
    averageAttendees,
    totalServicesCount: servicesCount || 0,
  };
}
