import { createClient } from "@/lib/supabase/server";
import type {
  AnnouncementDetailed,
  CommunicationBroadcastDetailed,
  AppNotification,
  CommunicationOverviewStats,
  AudienceCounts,
} from "@/types";

/**
 * Récupère la vue d'ensemble du module de communication : annonces, diffusions et notifications
 */
export async function getCommunicationOverview(
  orgId: string,
  userId?: string
): Promise<{
  stats: CommunicationOverviewStats;
  announcements: AnnouncementDetailed[];
  broadcasts: CommunicationBroadcastDetailed[];
  notifications: AppNotification[];
  audienceCounts: AudienceCounts;
}> {
  const supabase = await createClient();

  // 1. Annonces officielles
  const { data: rawAnnouncements, error: annErr } = await supabase
    .from("announcements")
    .select(`
      *,
      author:profiles!announcements_author_id_fkey(id, full_name)
    `)
    .eq("organization_id", orgId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (annErr) {
    console.error("Erreur récupération annonces:", annErr);
  }

  // 2. Historique des diffusions / campagnes
  const { data: rawBroadcasts, error: bcastErr } = await supabase
    .from("communication_broadcasts")
    .select(`
      *,
      sender:profiles!communication_broadcasts_sender_id_fkey(id, full_name)
    `)
    .eq("organization_id", orgId)
    .order("sent_at", { ascending: false });

  if (bcastErr) {
    console.error("Erreur récupération diffusions:", bcastErr);
  }

  // 3. Notifications de l'utilisateur
  let notificationsQuery = supabase
    .from("notifications")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (userId) {
    notificationsQuery = notificationsQuery.eq("user_id", userId);
  }

  const { data: rawNotifications, error: notifErr } = await notificationsQuery;

  if (notifErr) {
    console.error("Erreur récupération notifications:", notifErr);
  }

  const announcements: AnnouncementDetailed[] = rawAnnouncements || [];
  const broadcasts: CommunicationBroadcastDetailed[] = rawBroadcasts || [];
  const notifications: AppNotification[] = rawNotifications || [];

  // 4. Calcul des audiences cibles
  const audienceCounts = await getAudienceCounts(orgId);

  // 5. Calcul des métriques statistiques
  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthPrefix = new Date().toISOString().substring(0, 7); // "YYYY-MM"

  let activeAnnouncements = 0;
  let pinnedAnnouncements = 0;

  for (const a of announcements) {
    if (a.is_pinned) {
      pinnedAnnouncements++;
    }
    if (!a.expires_at || a.expires_at >= todayStr) {
      activeAnnouncements++;
    }
  }

  let broadcastsThisMonth = 0;
  let totalRecipientsReached = 0;

  for (const b of broadcasts) {
    if (b.sent_at && b.sent_at.startsWith(currentMonthPrefix)) {
      broadcastsThisMonth++;
      totalRecipientsReached += b.recipients_count || 0;
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.is_read).length;

  const stats: CommunicationOverviewStats = {
    activeAnnouncements,
    pinnedAnnouncements,
    broadcastsThisMonth,
    totalRecipientsReached,
    unreadNotifications,
  };

  return {
    stats,
    announcements,
    broadcasts,
    notifications,
    audienceCounts,
  };
}

/**
 * Calcule dynamiquement le nombre de personnes dans chaque audience cible
 */
export async function getAudienceCounts(orgId: string): Promise<AudienceCounts> {
  const supabase = await createClient();

  // Tous les membres actifs
  const { count: allCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("membership_status", "ACTIVE");

  // Conducteurs de cellules
  const { data: leaderRows } = await supabase
    .from("group_members")
    .select("member_id")
    .in("role", ["LEADER", "CO_LEADER"]);

  const distinctLeaders = new Set((leaderRows || []).map((r) => r.member_id));

  // Bénévoles de ministères
  const { data: volunteerRows } = await supabase
    .from("ministry_members")
    .select("member_id");

  const distinctVolunteers = new Set((volunteerRows || []).map((r) => r.member_id));

  // Nouveaux visiteurs
  const { count: visitorCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("membership_status", "VISITOR");

  return {
    all: allCount || 0,
    leaders: distinctLeaders.size,
    volunteers: distinctVolunteers.size,
    visitors: visitorCount || 0,
  };
}

/**
 * Récupère le détail d'une annonce
 */
export async function getAnnouncementById(
  announcementId: string,
  orgId: string
): Promise<AnnouncementDetailed | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcements")
    .select(`
      *,
      author:profiles!announcements_author_id_fkey(id, full_name)
    `)
    .eq("id", announcementId)
    .eq("organization_id", orgId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as AnnouncementDetailed;
}
