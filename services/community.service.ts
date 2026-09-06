import { createClient } from "@/lib/supabase/server";
import type {
  GroupDetailed,
  MinistryDetailed,
  CommunityOverviewStats,
} from "@/types";

export interface GroupMemberItem {
  id: string;
  role: string;
  joined_at: string;
  member: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    membership_status: string;
  };
}

export interface MinistryVolunteerItem {
  id: string;
  role: string;
  joined_at: string;
  member: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    membership_status: string;
  };
}

export interface SimpleMemberOption {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  membership_status: string;
}

export interface SimpleCampusOption {
  id: string;
  name: string;
}

/**
 * Récupère la vue d'ensemble communautaire : statistiques, liste des cellules et ministères
 */
export async function getCommunityOverview(orgId: string): Promise<{
  stats: CommunityOverviewStats;
  groups: GroupDetailed[];
  ministries: MinistryDetailed[];
}> {
  const supabase = await createClient();

  // 1. Récupérer les cellules avec leur responsable et campus
  const { data: rawGroups, error: groupsErr } = await supabase
    .from("groups")
    .select(`
      *,
      leader:members!groups_leader_id_fkey(id, first_name, last_name, email, phone),
      campus:campuses!groups_campus_id_fkey(id, name)
    `)
    .eq("organization_id", orgId)
    .order("name", { ascending: true });

  if (groupsErr) {
    console.error("Erreur récupération groupes:", groupsErr);
  }

  // 2. Récupérer les ministères avec leur responsable
  const { data: rawMinistries, error: minErr } = await supabase
    .from("ministries")
    .select(`
      *,
      leader:members!ministries_leader_id_fkey(id, first_name, last_name, email, phone)
    `)
    .eq("organization_id", orgId)
    .order("name", { ascending: true });

  if (minErr) {
    console.error("Erreur récupération ministères:", minErr);
  }

  // 3. Récupérer le décompte des membres par groupe
  const { data: groupMembersCounts } = await supabase
    .from("group_members")
    .select("group_id, member_id");

  const countsMap = new Map<string, number>();
  const distinctMembersInGroups = new Set<string>();

  if (groupMembersCounts) {
    for (const row of groupMembersCounts) {
      countsMap.set(row.group_id, (countsMap.get(row.group_id) || 0) + 1);
      distinctMembersInGroups.add(row.member_id);
    }
  }

  // 4. Récupérer le décompte des bénévoles par ministère
  const { data: ministryMembersCounts } = await supabase
    .from("ministry_members")
    .select("ministry_id, member_id");

  const minCountsMap = new Map<string, number>();
  let totalVolunteers = 0;

  if (ministryMembersCounts) {
    totalVolunteers = ministryMembersCounts.length;
    for (const row of ministryMembersCounts) {
      minCountsMap.set(row.ministry_id, (minCountsMap.get(row.ministry_id) || 0) + 1);
    }
  }

  // 5. Total des membres actifs dans l'organisation
  const { count: totalActiveMembers } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("membership_status", "ACTIVE");

  const totalMembers = totalActiveMembers || 0;
  const membersInGroups = distinctMembersInGroups.size;
  const integrationRate = totalMembers > 0 ? Math.round((membersInGroups / totalMembers) * 100) : 0;

  const groups: GroupDetailed[] = (rawGroups || []).map((g: any) => ({
    ...g,
    members_count: countsMap.get(g.id) || 0,
  }));

  const ministries: MinistryDetailed[] = (rawMinistries || []).map((m: any) => ({
    ...m,
    volunteers_count: minCountsMap.get(m.id) || 0,
  }));

  const stats: CommunityOverviewStats = {
    totalGroups: groups.length,
    activeGroups: groups.filter((g) => g.is_active).length,
    totalMinistries: ministries.length,
    membersInGroups,
    totalVolunteers,
    integrationRate,
  };

  return { stats, groups, ministries };
}

/**
 * Récupère le détail d'une cellule avec ses membres
 */
export async function getGroupDetails(
  groupId: string,
  orgId: string
): Promise<{
  group: GroupDetailed | null;
  members: GroupMemberItem[];
}> {
  const supabase = await createClient();

  const { data: groupData, error: groupErr } = await supabase
    .from("groups")
    .select(`
      *,
      leader:members!groups_leader_id_fkey(id, first_name, last_name, email, phone),
      campus:campuses!groups_campus_id_fkey(id, name)
    `)
    .eq("id", groupId)
    .eq("organization_id", orgId)
    .single();

  if (groupErr || !groupData) {
    return { group: null, members: [] };
  }

  const { data: membersData, error: membersErr } = await supabase
    .from("group_members")
    .select(`
      id,
      role,
      joined_at,
      member:members!group_members_member_id_fkey(id, first_name, last_name, email, phone, membership_status)
    `)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (membersErr) {
    console.error("Erreur récupération membres de cellule:", membersErr);
  }

  const members: GroupMemberItem[] = (membersData || []).map((m: any) => ({
    id: m.id,
    role: m.role,
    joined_at: m.joined_at,
    member: m.member,
  }));

  const group: GroupDetailed = {
    ...groupData,
    members_count: members.length,
    members,
  };

  return { group, members };
}

/**
 * Récupère le détail d'un département/ministère avec ses serviteurs
 */
export async function getMinistryDetails(
  ministryId: string,
  orgId: string
): Promise<{
  ministry: MinistryDetailed | null;
  volunteers: MinistryVolunteerItem[];
}> {
  const supabase = await createClient();

  const { data: minData, error: minErr } = await supabase
    .from("ministries")
    .select(`
      *,
      leader:members!ministries_leader_id_fkey(id, first_name, last_name, email, phone)
    `)
    .eq("id", ministryId)
    .eq("organization_id", orgId)
    .single();

  if (minErr || !minData) {
    return { ministry: null, volunteers: [] };
  }

  const { data: volunteersData, error: volunteersErr } = await supabase
    .from("ministry_members")
    .select(`
      id,
      role,
      joined_at,
      member:members!ministry_members_member_id_fkey(id, first_name, last_name, email, phone, membership_status)
    `)
    .eq("ministry_id", ministryId)
    .order("created_at", { ascending: false });

  if (volunteersErr) {
    console.error("Erreur récupération bénévoles ministère:", volunteersErr);
  }

  const volunteers: MinistryVolunteerItem[] = (volunteersData || []).map((v: any) => ({
    id: v.id,
    role: v.role,
    joined_at: v.joined_at,
    member: v.member,
  }));

  const ministry: MinistryDetailed = {
    ...minData,
    volunteers_count: volunteers.length,
    members: volunteers,
  };

  return { ministry, volunteers };
}

/**
 * Récupère la liste des fidèles pour l'affectation dans une cellule ou un ministère
 */
export async function getMembersForAssignment(orgId: string): Promise<SimpleMemberOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .select("id, first_name, last_name, email, phone, membership_status")
    .eq("organization_id", orgId)
    .order("last_name", { ascending: true });

  if (error) {
    console.error("Erreur récupération membres:", error);
    return [];
  }

  return data || [];
}

/**
 * Récupère la liste des campus pour la sélection lors de la création d'une cellule
 */
export async function getCampusesForOrg(orgId: string): Promise<SimpleCampusOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campuses")
    .select("id, name")
    .eq("organization_id", orgId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Erreur récupération campus:", error);
    return [];
  }

  return data || [];
}
