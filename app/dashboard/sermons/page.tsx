import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  getSermonsOverview,
  getMediaFiles,
} from "@/services/sermon.service";
import { SermonsGrid } from "@/components/sermons/sermons-grid";
import { ResourcesTab } from "@/components/sermons/resources-tab";
import {
  BookOpen,
  Layers,
  Users,
  Calendar,
  FolderOpen,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Prédications & Médias | ChurchOS",
  description: "Médiathèque et enseignements bibliques de l'église.",
};

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    series?: string;
    preacher?: string;
  }>;
}

export default async function SermonsPage({ searchParams }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { tab, search, series, preacher } = await searchParams;
  const currentTab = tab === "resources" ? "resources" : "sermons";

  const [{ sermons, stats, seriesList, preachersList }, mediaFiles] =
    await Promise.all([
      getSermonsOverview(activeOrg.organization.id, {
        search,
        series,
        preacher,
      }),
      getMediaFiles(activeOrg.organization.id),
    ]);

  return (
    <div className="space-y-8">
      {/* En-tête principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Enseignements & Édification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Prédications & Médiathèque
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Archivage des cultes, intégration vidéo YouTube/Vimeo, podcasts audio et canevas d&apos;études pour cellules.
          </p>
        </div>
      </div>

      {/* Cartes Métriques KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Messages */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Messages archivés</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stats.totalSermons}</div>
          <p className="text-xs text-muted-foreground">Enseignements indexés</p>
        </div>

        {/* Séries */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Séries thématiques</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stats.totalSeries}</div>
          <p className="text-xs text-muted-foreground">Parcours doctrinaux & spirituels</p>
        </div>

        {/* Prédicateurs */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Orateurs & Prédicateurs</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stats.totalPreachers}</div>
          <p className="text-xs text-muted-foreground">Contributeurs pastoraux</p>
        </div>

        {/* Cette année */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Diffusés cette année</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stats.sermonsThisYear}</div>
          <p className="text-xs text-muted-foreground">Cultes enregistrés en {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-border">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/sermons?tab=sermons"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              currentTab === "sermons"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Prédications & Enseignements
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-normal">
              {stats.totalSermons}
            </span>
          </Link>

          <Link
            href="/dashboard/sermons?tab=resources"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              currentTab === "resources"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            Ressources & Guides de Cellule
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-normal">
              {mediaFiles.length}
            </span>
          </Link>
        </div>
      </div>

      {/* Vue conditionnelle */}
      {currentTab === "resources" ? (
        <ResourcesTab resources={mediaFiles} />
      ) : (
        <SermonsGrid
          sermons={sermons}
          seriesList={seriesList}
          preachersList={preachersList}
        />
      )}
    </div>
  );
}
