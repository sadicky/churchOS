import { createClient } from "@/lib/supabase/server";
import type {
  PastoralVisitDetailed,
  PastoralNoteDetailed,
  PrayerRequest,
  PastoralOverviewStats,
} from "@/types";

export interface SimpleMemberSelect {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  membership_status: string;
}

/**
 * Récupère la vue d'ensemble des soins pastoraux : statistiques, visites, prières et notes
 */
export async function getPastoralOverview(orgId: string): Promise<{
  stats: PastoralOverviewStats;
  visits: PastoralVisitDetailed[];
  prayers: PrayerRequest[];
  notes: PastoralNoteDetailed[];
}> {
  const supabase = await createClient();

  // 1. Visites pastorales avec jointures membre et pasteur
  const { data: rawVisits, error: visitsErr } = await supabase
    .from("pastoral_visits")
    .select(`
      *,
      member:members!pastoral_visits_member_id_fkey(id, first_name, last_name, phone, email, address, membership_status),
      pastor:profiles!pastoral_visits_pastor_id_fkey(id, full_name, email)
    `)
    .eq("organization_id", orgId)
    .order("visit_date", { ascending: false });

  if (visitsErr) {
    console.error("Erreur récupération visites pastorales:", visitsErr);
  }

  // 2. Requêtes de prière avec jointure membre
  const { data: rawPrayers, error: prayersErr } = await supabase
    .from("prayer_requests")
    .select(`
      *,
      member:members!prayer_requests_member_id_fkey(id, first_name, last_name, phone)
    `)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (prayersErr) {
    console.error("Erreur récupération requêtes de prière:", prayersErr);
  }

  // 3. Notes pastorales confidentielles
  const { data: rawNotes, error: notesErr } = await supabase
    .from("pastoral_notes")
    .select(`
      *,
      member:members!pastoral_notes_member_id_fkey(id, first_name, last_name),
      author:profiles!pastoral_notes_author_id_fkey(id, full_name)
    `)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (notesErr) {
    console.error("Erreur récupération notes pastorales:", notesErr);
  }

  const visits: PastoralVisitDetailed[] = rawVisits || [];
  const prayers: PrayerRequest[] = rawPrayers || [];
  const notes: PastoralNoteDetailed[] = rawNotes || [];

  // Calcul des statistiques
  const currentMonthPrefix = new Date().toISOString().substring(0, 7); // "YYYY-MM"
  let totalVisitsThisMonth = 0;
  let followUpsNeeded = 0;

  for (const v of visits) {
    if (v.visit_date && v.visit_date.startsWith(currentMonthPrefix)) {
      totalVisitsThisMonth++;
    }
    if (v.follow_up_needed) {
      followUpsNeeded++;
    }
  }

  let activePrayerRequests = 0;
  let answeredPrayers = 0;

  for (const p of prayers) {
    if (p.status === "PENDING" || p.status === "IN_PROGRESS") {
      activePrayerRequests++;
    } else if (p.status === "ANSWERED") {
      answeredPrayers++;
    }
  }

  const stats: PastoralOverviewStats = {
    totalVisitsThisMonth,
    followUpsNeeded,
    activePrayerRequests,
    answeredPrayers,
  };

  return { stats, visits, prayers, notes };
}

/**
 * Récupère le détail complet d'une visite pastorale
 */
export async function getPastoralVisitById(
  visitId: string,
  orgId: string
): Promise<PastoralVisitDetailed | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pastoral_visits")
    .select(`
      *,
      member:members!pastoral_visits_member_id_fkey(id, first_name, last_name, phone, email, address, membership_status),
      pastor:profiles!pastoral_visits_pastor_id_fkey(id, full_name, email)
    `)
    .eq("id", visitId)
    .eq("organization_id", orgId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as PastoralVisitDetailed;
}

/**
 * Récupère le détail d'une requête de prière
 */
export async function getPrayerRequestById(
  prayerId: string,
  orgId: string
): Promise<PrayerRequest | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prayer_requests")
    .select(`
      *,
      member:members!prayer_requests_member_id_fkey(id, first_name, last_name, phone)
    `)
    .eq("id", prayerId)
    .eq("organization_id", orgId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as PrayerRequest;
}

/**
 * Récupère la liste des fidèles pour sélection dans les visites ou notes pastorales
 */
export async function getPastoralMembersList(orgId: string): Promise<SimpleMemberSelect[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .select("id, first_name, last_name, phone, email, membership_status")
    .eq("organization_id", orgId)
    .order("last_name", { ascending: true });

  if (error) {
    console.error("Erreur récupération liste fidèles pastoraux:", error);
    return [];
  }

  return data || [];
}
