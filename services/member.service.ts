import { createClient } from "@/lib/supabase/server";
import type { Member, Campus, MembershipStatus, GenderType } from "@/types";

export interface MembersListFilters {
  search?: string;
  status?: string;
  campusId?: string;
  gender?: string;
  page?: number;
  limit?: number;
}

export interface MemberListItem extends Member {
  campuses: {
    id: string;
    name: string;
  } | null;
}

export interface MembersListResponse {
  members: MemberListItem[];
  total: number;
  page: number;
  totalPages: number;
  stats: {
    total: number;
    active: number;
    visitors: number;
    newConverts: number;
  };
}

export interface MemberDetailed extends Member {
  campuses: {
    id: string;
    name: string;
    city: string | null;
  } | null;
  ministries: {
    id: string;
    role: string | null;
    joined_at: string;
    ministry: {
      id: string;
      name: string;
    };
  }[];
  groups: {
    id: string;
    role: string;
    joined_at: string;
    group: {
      id: string;
      name: string;
    };
  }[];
  attendances: {
    id: string;
    status: string;
    sessionDate: string;
    serviceName: string;
  }[];
  donations: {
    id: string;
    amount: number;
    type: string;
    paymentMethod: string;
    donationDate: string;
  }[];
  pastoralNotes: {
    id: string;
    title: string | null;
    content: string;
    is_private: boolean;
    created_at: string;
    author: {
      first_name: string;
      last_name: string;
    } | null;
  }[];
}

export async function getMembersList(
  organizationId: string,
  filters: MembersListFilters = {}
): Promise<MembersListResponse> {
  const supabase = await createClient();
  const page = Math.max(filters.page || 1, 1);
  const limit = Math.max(filters.limit || 15, 1);
  const offset = (page - 1) * limit;

  // 1. Build Base Query
  let query = supabase
    .from("members")
    .select(
      `
      *,
      campuses:campus_id (
        id,
        name
      )
    `,
      { count: "exact" }
    )
    .eq("organization_id", organizationId);

  // Apply filters
  if (filters.search && filters.search.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},phone.ilike.${term},email.ilike.${term}`
    );
  }

  if (filters.status && filters.status !== "ALL") {
    query = query.eq("membership_status", filters.status as MembershipStatus);
  }

  if (filters.campusId && filters.campusId !== "ALL") {
    query = query.eq("campus_id", filters.campusId);
  }

  if (filters.gender && filters.gender !== "ALL") {
    query = query.eq("gender", filters.gender as GenderType);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching members:", error);
  }

  const members = (data || []) as MemberListItem[];
  const total = count || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  // 2. Fetch Stats Counters
  const { count: totalActive } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("membership_status", "ACTIVE");

  const { count: totalVisitors } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("membership_status", "VISITOR");

  const { count: totalNewConverts } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("membership_status", "ACTIVE")
    .not("baptism_date", "is", null);

  return {
    members,
    total,
    page,
    totalPages,
    stats: {
      total: total,
      active: totalActive || 0,
      visitors: totalVisitors || 0,
      newConverts: totalNewConverts || 0,
    },
  };
}

export async function getCampusesList(organizationId: string): Promise<Campus[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campuses")
    .select("*")
    .eq("organization_id", organizationId)
    .order("is_main", { ascending: false });

  return (data || []) as Campus[];
}

export async function getMemberDetails(
  memberId: string,
  organizationId: string
): Promise<MemberDetailed | null> {
  const supabase = await createClient();

  // 1. Fetch Member
  const { data: member, error } = await supabase
    .from("members")
    .select(
      `
      *,
      campuses:campus_id (
        id,
        name,
        city
      )
    `
    )
    .eq("id", memberId)
    .eq("organization_id", organizationId)
    .single();

  if (error || !member) {
    return null;
  }

  // 2. Fetch Ministries
  const { data: ministriesData } = await supabase
    .from("ministry_members")
    .select(
      `
      id,
      role,
      joined_at,
      ministries:ministry_id (
        id,
        name
      )
    `
    )
    .eq("member_id", memberId);

  const ministries = (ministriesData || []).map((m) => ({
    id: m.id,
    role: m.role,
    joined_at: m.joined_at,
    ministry: m.ministries as unknown as { id: string; name: string },
  }));

  // 3. Fetch Groups
  const { data: groupsData } = await supabase
    .from("group_members")
    .select(
      `
      id,
      role,
      joined_at,
      groups:group_id (
        id,
        name
      )
    `
    )
    .eq("member_id", memberId);

  const groups = (groupsData || []).map((g) => ({
    id: g.id,
    role: g.role,
    joined_at: g.joined_at,
    group: g.groups as unknown as { id: string; name: string },
  }));

  // 4. Fetch Attendances
  const { data: attendanceData } = await supabase
    .from("attendance_records")
    .select(
      `
      id,
      status,
      attendance_sessions:session_id (
        session_date,
        services:service_id (name)
      )
    `
    )
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(10);

  const attendances = (attendanceData || []).map((att) => {
    const session = att.attendance_sessions as unknown as {
      session_date: string;
      services: { name: string } | null;
    } | null;

    return {
      id: att.id,
      status: att.status,
      sessionDate: session?.session_date || "",
      serviceName: session?.services?.name || "Culte",
    };
  });

  // 5. Fetch Donations
  const { data: donationsData } = await supabase
    .from("donations")
    .select(
      `
      id,
      amount,
      type,
      payment_method,
      donation_date
    `
    )
    .eq("member_id", memberId)
    .order("donation_date", { ascending: false })
    .limit(10);

  const donations = (donationsData || []).map((d) => ({
    id: d.id,
    amount: Number(d.amount || 0),
    type: d.type,
    paymentMethod: d.payment_method,
    donationDate: d.donation_date,
  }));

  // 6. Fetch Pastoral Notes
  const { data: notesData } = await supabase
    .from("member_notes")
    .select(
      `
      id,
      title,
      content,
      is_private,
      created_at,
      profiles:author_id (
        first_name,
        last_name
      )
    `
    )
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  const notes = (notesData || []).map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    is_private: n.is_private,
    created_at: n.created_at,
    author: n.profiles as unknown as { first_name: string; last_name: string } | null,
  }));

  return {
    ...(member as unknown as Member),
    campuses: member.campuses as unknown as { id: string; name: string; city: string | null } | null,
    ministries,
    groups,
    attendances,
    donations,
    pastoralNotes: notes,
  };
}
