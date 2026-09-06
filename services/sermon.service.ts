import { createClient } from "@/lib/supabase/server";
import type {
  Sermon,
  MediaFile,
  SermonOverviewStats,
  SermonFilterParams,
} from "@/types";

/**
 * Récupère la liste des sermons avec filtrage et les statistiques globales
 */
export async function getSermonsOverview(
  orgId: string,
  filters?: SermonFilterParams
): Promise<{
  sermons: Sermon[];
  stats: SermonOverviewStats;
  seriesList: string[];
  preachersList: string[];
}> {
  const supabase = await createClient();

  // 1. Récupération de tous les sermons de l'organisation pour calculs statistiques & filtres
  const { data: allSermonsData, error: allErr } = await supabase
    .from("sermons")
    .select("*")
    .eq("organization_id", orgId)
    .order("sermon_date", { ascending: false });

  if (allErr) {
    console.error("Erreur récupération sermons:", allErr);
  }

  const allSermons: Sermon[] = allSermonsData || [];

  // Séries distinctes non nulles
  const seriesSet = new Set<string>();
  const preachersSet = new Set<string>();
  const currentYear = new Date().getFullYear().toString();
  let sermonsThisYear = 0;

  for (const s of allSermons) {
    if (s.series_name?.trim()) {
      seriesSet.add(s.series_name.trim());
    }
    if (s.preacher?.trim()) {
      preachersSet.add(s.preacher.trim());
    }
    if (s.sermon_date && s.sermon_date.startsWith(currentYear)) {
      sermonsThisYear++;
    }
  }

  // 2. Application des filtres demandés
  let filtered = allSermons;

  if (filters?.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(term) ||
        s.preacher.toLowerCase().includes(term) ||
        s.scripture_reference?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term)
    );
  }

  if (filters?.series) {
    filtered = filtered.filter((s) => s.series_name === filters.series);
  }

  if (filters?.preacher) {
    filtered = filtered.filter((s) => s.preacher === filters.preacher);
  }

  const stats: SermonOverviewStats = {
    totalSermons: allSermons.length,
    totalSeries: seriesSet.size,
    totalPreachers: preachersSet.size,
    sermonsThisYear,
  };

  return {
    sermons: filtered,
    stats,
    seriesList: Array.from(seriesSet).sort(),
    preachersList: Array.from(preachersSet).sort(),
  };
}

/**
 * Récupère le détail complet d'une prédication
 */
export async function getSermonById(
  sermonId: string,
  orgId: string
): Promise<Sermon | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sermons")
    .select("*")
    .eq("id", sermonId)
    .eq("organization_id", orgId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Sermon;
}

/**
 * Récupère la liste des fichiers et ressources documentaires de l'église
 */
export async function getMediaFiles(orgId: string): Promise<MediaFile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("media_files")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur récupération fichiers médias:", error);
    return [];
  }

  return (data || []) as MediaFile[];
}
