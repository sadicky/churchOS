import { createClient } from "@/lib/supabase/server";
import type {
  Campus,
  CampusDetailed,
  CampusRoom,
  CampusRoomDetailed,
  CampusOverviewStats,
} from "@/types";

/**
 * Récupère la vue d'ensemble du module multi-campus :
 * Liste des campus avec métriques consolidées (membres, salles, capacité, cultes, groupes),
 * liste de toutes les salles et statistiques globales.
 */
export async function getCampusesOverview(orgId: string): Promise<{
  stats: CampusOverviewStats;
  campuses: CampusDetailed[];
  rooms: CampusRoomDetailed[];
}> {
  const supabase = await createClient();

  // 1. Récupération de tous les campus de l'organisation
  const { data: rawCampuses, error: campusErr } = await supabase
    .from("campuses")
    .select("*")
    .eq("organization_id", orgId)
    .order("is_main", { ascending: false })
    .order("name", { ascending: true });

  if (campusErr) {
    console.error("Erreur récupération campus:", campusErr);
  }

  const baseCampuses: Campus[] = (rawCampuses || []) as Campus[];

  // 2. Récupération de toutes les salles avec infos campus
  const { data: rawRooms, error: roomErr } = await supabase
    .from("campus_rooms")
    .select(`
      *,
      campus:campuses(id, name, is_main)
    `)
    .eq("organization_id", orgId)
    .order("capacity", { ascending: false });

  if (roomErr) {
    console.error("Erreur récupération salles:", roomErr);
  }

  const rooms: CampusRoomDetailed[] = (rawRooms || []) as unknown as CampusRoomDetailed[];

  // 3. Récupération des membres pour comptage par campus
  const { data: membersData } = await supabase
    .from("members")
    .select("id, campus_id")
    .eq("organization_id", orgId);

  const memberCountByCampus: Record<string, number> = {};
  let totalAffiliatedMembers = 0;
  for (const m of membersData || []) {
    if (m.campus_id) {
      memberCountByCampus[m.campus_id] = (memberCountByCampus[m.campus_id] || 0) + 1;
      totalAffiliatedMembers++;
    }
  }

  // 4. Récupération des cultes par campus
  const { data: servicesData } = await supabase
    .from("services")
    .select("id, campus_id")
    .eq("organization_id", orgId);

  const serviceCountByCampus: Record<string, number> = {};
  for (const s of servicesData || []) {
    if (s.campus_id) {
      serviceCountByCampus[s.campus_id] = (serviceCountByCampus[s.campus_id] || 0) + 1;
    }
  }

  // 5. Récupération des groupes/cellules par campus
  const { data: groupsData } = await supabase
    .from("groups")
    .select("id, campus_id")
    .eq("organization_id", orgId);

  const groupCountByCampus: Record<string, number> = {};
  for (const g of groupsData || []) {
    if (g.campus_id) {
      groupCountByCampus[g.campus_id] = (groupCountByCampus[g.campus_id] || 0) + 1;
    }
  }

  // 6. Consolidation par campus
  let totalCapacity = 0;
  let mainCampusName = "Non défini";

  const campuses: CampusDetailed[] = baseCampuses.map((campus) => {
    if (campus.is_main) {
      mainCampusName = campus.name;
    }

    const campusRooms = rooms.filter((r) => r.campus_id === campus.id);
    const campusCapacity = campusRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
    totalCapacity += campusCapacity;

    return {
      ...campus,
      members_count: memberCountByCampus[campus.id] || 0,
      rooms_count: campusRooms.length,
      total_capacity: campusCapacity,
      services_count: serviceCountByCampus[campus.id] || 0,
      groups_count: groupCountByCampus[campus.id] || 0,
      rooms: campusRooms,
    };
  });

  const stats: CampusOverviewStats = {
    totalCampuses: campuses.length,
    mainCampusName,
    totalRooms: rooms.length,
    totalCapacity,
    totalAffiliatedMembers,
  };

  return {
    stats,
    campuses,
    rooms,
  };
}

/**
 * Récupère le détail complet d'un campus avec ses salles, cultes, groupes et pasteur référent
 */
export async function getCampusDetails(
  campusId: string,
  orgId: string
): Promise<{
  campus: CampusDetailed;
  rooms: CampusRoom[];
  services: Array<{ id: string; name: string; service_time: string | null }>;
  groups: Array<{ id: string; name: string; leader_name?: string | null }>;
} | null> {
  const supabase = await createClient();

  // 1. Données du campus
  const { data: rawCampus, error: cErr } = await supabase
    .from("campuses")
    .select("*")
    .eq("id", campusId)
    .eq("organization_id", orgId)
    .single();

  if (cErr || !rawCampus) {
    return null;
  }

  // 2. Salles du campus
  const { data: rawRooms } = await supabase
    .from("campus_rooms")
    .select("*")
    .eq("campus_id", campusId)
    .eq("organization_id", orgId)
    .order("capacity", { ascending: false });

  const rooms: CampusRoom[] = (rawRooms || []) as CampusRoom[];
  const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);

  // 3. Membres rattachés
  const { count: membersCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("campus_id", campusId)
    .eq("organization_id", orgId);

  // 4. Cultes rattachés
  const { data: rawServices } = await supabase
    .from("services")
    .select("id, name, service_time")
    .eq("campus_id", campusId)
    .eq("organization_id", orgId);

  const services = rawServices || [];

  // 5. Groupes/Cellules rattachés
  const { data: rawGroups } = await supabase
    .from("groups")
    .select("id, name, leader_id, leader:profiles!groups_leader_id_fkey(full_name)")
    .eq("campus_id", campusId)
    .eq("organization_id", orgId);

  const groups = (rawGroups || []).map((g) => ({
    id: g.id,
    name: g.name,
    leader_name: (g.leader as { full_name?: string | null } | null)?.full_name || null,
  }));

  const campus: CampusDetailed = {
    ...(rawCampus as Campus),
    members_count: membersCount || 0,
    rooms_count: rooms.length,
    total_capacity: totalCapacity,
    services_count: services.length,
    groups_count: groups.length,
    rooms,
  };

  return {
    campus,
    rooms,
    services,
    groups,
  };
}

/**
 * Récupère un campus par son ID pour modification
 */
export async function getCampusById(
  campusId: string,
  orgId: string
): Promise<Campus | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campuses")
    .select("*")
    .eq("id", campusId)
    .eq("organization_id", orgId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Campus;
}

/**
 * Récupère la liste des campus simples (pour les sélecteurs)
 */
export async function getSimpleCampusesList(orgId: string): Promise<Campus[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("campuses")
    .select("*")
    .eq("organization_id", orgId)
    .order("is_main", { ascending: false })
    .order("name", { ascending: true });

  return (data || []) as Campus[];
}
