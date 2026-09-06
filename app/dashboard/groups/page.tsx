import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getCommunityOverview } from "@/services/community.service";
import { GroupsTab } from "@/components/community/groups-tab";
import { MinistriesTab } from "@/components/community/ministries-tab";
import {
  Users,
  HeartHandshake,
  TrendingUp,
  ShieldCheck,
  Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Communauté & Ministères | ChurchOS",
  description: "Gestion des cellules de maison, groupes de quartier et départements d'église.",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function GroupsPage({ searchParams }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { tab: activeTabParam } = await searchParams;
  const currentTab = activeTabParam === "ministries" ? "ministries" : "groups";

  const { stats, groups, ministries } = await getCommunityOverview(
    activeOrg.organization.id
  );

  return (
    <div className="space-y-8">
      {/* En-tête principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Building2 className="h-4 w-4" />
            <span>Vie de l&apos;Église & Communion Fraternelle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Communauté & Ministères
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Supervisez les cellules de maison, petits groupes et la mobilisation des bénévoles par département.
          </p>
        </div>
      </div>

      {/* Cartes Métriques KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cellules */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Cellules de maison</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stats.totalGroups}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            {stats.activeGroups} ouvertes aux nouveaux fidèles
          </p>
        </div>

        {/* Intégration en cellule */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Fidèles en cellules</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stats.membersInGroups}</div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Taux d&apos;intégration</span>
              <span className="font-semibold text-foreground">{stats.integrationRate}%</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.integrationRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Départements */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Départements</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stats.totalMinistries}</div>
          <p className="text-xs text-muted-foreground">Pôles de service organisés</p>
        </div>

        {/* Bénévoles */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Serviteurs engagés</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <HeartHandshake className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stats.totalVolunteers}</div>
          <p className="text-xs text-muted-foreground">Bénévoles actifs en service</p>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-border">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/groups?tab=groups"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              currentTab === "groups"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            Cellules de maison
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-normal">
              {groups.length}
            </span>
          </Link>

          <Link
            href="/dashboard/groups?tab=ministries"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              currentTab === "ministries"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <HeartHandshake className="h-4 w-4" />
            Départements & Ministères
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-normal">
              {ministries.length}
            </span>
          </Link>
        </div>
      </div>

      {/* Contenu de l'onglet actif */}
      {currentTab === "ministries" ? (
        <MinistriesTab ministries={ministries} />
      ) : (
        <GroupsTab groups={groups} />
      )}
    </div>
  );
}
