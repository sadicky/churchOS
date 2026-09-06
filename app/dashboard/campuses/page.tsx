import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getCampusesOverview } from "@/services/campus.service";
import { CampusesTab } from "@/components/campuses/campuses-tab";
import { RoomsTab } from "@/components/campuses/rooms-tab";
import {
  Building2,
  DoorClosed,
  Users,
  Star,
  Plus,
  Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Multi-Campus & Bâtiments | ChurchOS",
  description: "Gestion des sites, sanctuaires, salles polyvalentes, classes et capacités d'accueil de l'église.",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CampusesPage({ searchParams }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { tab } = await searchParams;
  const currentTab = tab === "rooms" ? "rooms" : "campuses";

  const { stats, campuses, rooms } = await getCampusesOverview(
    activeOrg.organization.id
  );

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Compass className="h-4 w-4" />
            <span>Déploiement Territorial & Lieux de Culte</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Multi-Campus & Bâtiments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pilotez vos différents sites géographiques, vos sanctuaires, salles polyvalentes et capacités d&apos;accueil.
          </p>
        </div>

        {/* Boutons d'action rapides */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/campuses/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau campus</span>
          </Link>
        </div>
      </div>

      {/* Cartes Métriques KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Campus */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Sites & Campus</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {stats.totalCampuses}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            Siège : <strong className="text-foreground">{stats.mainCampusName}</strong>
          </p>
        </div>

        {/* Salles & Locaux */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Locaux & Salles</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <DoorClosed className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {stats.totalRooms}
          </div>
          <p className="text-xs text-muted-foreground">
            Sanctuaires, écodim & salles polyvalentes
          </p>
        </div>

        {/* Capacité Globale */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Capacité assise globale</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {stats.totalCapacity.toLocaleString()} places
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Cumul de tous les sanctuaires et salles
          </p>
        </div>

        {/* Fidèles rattachés */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Fidèles rattachés</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Star className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {stats.totalAffiliatedMembers}
          </div>
          <p className="text-xs text-muted-foreground">
            Membres assignés à un campus précis
          </p>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-border">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/campuses?tab=campuses"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              currentTab === "campuses"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Sites & Campus
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-normal">
              {campuses.length}
            </span>
          </Link>

          <Link
            href="/dashboard/campuses?tab=rooms"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              currentTab === "rooms"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <DoorClosed className="h-4 w-4" />
            Salles & Bâtiments
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-normal">
              {rooms.length}
            </span>
          </Link>
        </div>
      </div>

      {/* Contenu conditionnel de l'onglet actif */}
      {currentTab === "rooms" ? (
        <RoomsTab rooms={rooms} campuses={campuses} />
      ) : (
        <CampusesTab campuses={campuses} />
      )}
    </div>
  );
}
