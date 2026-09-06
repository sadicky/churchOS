import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  getPastoralOverview,
  getPastoralMembersList,
} from "@/services/pastoral.service";
import { VisitsTab } from "@/components/pastoral/visits-tab";
import { PrayersTab } from "@/components/pastoral/prayers-tab";
import { NotesTab } from "@/components/pastoral/notes-tab";
import {
  HeartHandshake,
  AlertTriangle,
  Sparkles,
  Lock,
  Clock,
  Home,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Soins Pastoraux | ChurchOS",
  description: "Visites pastorales, suivi personnel et intercession.",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function PastoralPage({ searchParams }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { tab } = await searchParams;
  const currentTab = tab === "prayers" ? "prayers" : tab === "notes" ? "notes" : "visits";

  const [{ stats, visits, prayers, notes }, members] = await Promise.all([
    getPastoralOverview(activeOrg.organization.id),
    getPastoralMembersList(activeOrg.organization.id),
  ]);

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <HeartHandshake className="h-4 w-4" />
            <span>Accompagnement & Présence Spirituelle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Soins Pastoraux & Intercession
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Suivi personnalisé des fidèles, visites aux malades et en famille, et centralisation des sujets de prière.
          </p>
        </div>
      </div>

      {/* Cartes Métriques KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visites ce mois */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Visites ce mois</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Home className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stats.totalVisitsThisMonth}</div>
          <p className="text-xs text-muted-foreground">Fidèles visités à domicile ou hôpital</p>
        </div>

        {/* Relances dues */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Relances prioritaires</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stats.followUpsNeeded}</div>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            {stats.followUpsNeeded === 1 ? "1 suivi exigeant une action" : `${stats.followUpsNeeded} suivis exigeant une action`}
          </p>
        </div>

        {/* En intercession */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">En intercession</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stats.activePrayerRequests}</div>
          <p className="text-xs text-muted-foreground">Sujets portés par l&apos;église</p>
        </div>

        {/* Prières Exaucées */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Prières exaucées</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stats.answeredPrayers}</div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Témoignages de grâce célébrés</p>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-border">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/pastoral?tab=visits"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              currentTab === "visits"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <HeartHandshake className="h-4 w-4" />
            Visites Pastorales & Relances
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-normal">
              {visits.length}
            </span>
          </Link>

          <Link
            href="/dashboard/pastoral?tab=prayers"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              currentTab === "prayers"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Mur d&apos;Intercession
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-normal">
              {prayers.length}
            </span>
          </Link>

          <Link
            href="/dashboard/pastoral?tab=notes"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              currentTab === "notes"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="h-4 w-4" />
            Notes Confidentielles
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-normal">
              {notes.length}
            </span>
          </Link>
        </div>
      </div>

      {/* Contenu conditionnel de l'onglet */}
      {currentTab === "prayers" ? (
        <PrayersTab prayers={prayers} />
      ) : currentTab === "notes" ? (
        <NotesTab notes={notes} members={members} />
      ) : (
        <VisitsTab visits={visits} />
      )}
    </div>
  );
}
