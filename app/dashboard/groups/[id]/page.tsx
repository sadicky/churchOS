import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  getGroupDetails,
  getMembersForAssignment,
} from "@/services/community.service";
import { RosterManager } from "@/components/community/roster-manager";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Edit,
  Users,
  Building2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Fiche Cellule | ChurchOS`,
  };
}

export default async function GroupDetailPage({ params }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const [{ group, members }, availableMembers] = await Promise.all([
    getGroupDetails(id, activeOrg.organization.id),
    getMembersForAssignment(activeOrg.organization.id),
  ]);

  if (!group) {
    notFound();
  }

  const leaderName = group.leader
    ? `${group.leader.first_name} ${group.leader.last_name}`
    : "Aucun conducteur assigné";

  return (
    <div className="space-y-8">
      {/* Navigation retour & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/groups"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux cellules
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {group.name}
            </h1>
            {group.is_active ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                Inactive
              </span>
            )}
          </div>
          {group.campus && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Campus de rattachement : {group.campus.name}
            </p>
          )}
        </div>

        <Link
          href={`/dashboard/groups/${group.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-sm font-medium transition self-start sm:self-auto"
        >
          <Edit className="h-4 w-4" />
          Modifier la cellule
        </Link>
      </div>

      {/* Cartes d'informations & Détails pratiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Conducteur */}
        <div className="p-5 bg-card border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            Conducteur Spirituel
          </div>
          <div>
            <p className="text-base font-bold text-foreground">{leaderName}</p>
            {group.leader && (
              <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                {group.leader.email && <p>{group.leader.email}</p>}
                {group.leader.phone && <p>{group.leader.phone}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Rendez-vous hebdomadaire */}
        <div className="p-5 bg-card border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Calendar className="h-4 w-4 text-primary" />
            Créneau de rencontre
          </div>
          <div>
            <p className="text-base font-bold text-foreground">
              {group.meeting_day ? `Chaque ${group.meeting_day}` : "Jour non défini"}
            </p>
            {group.meeting_time && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <Clock className="h-3.5 w-3.5" />
                Début à {group.meeting_time}
              </p>
            )}
          </div>
        </div>

        {/* Lieu d'accueil */}
        <div className="p-5 bg-card border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <MapPin className="h-4 w-4 text-emerald-500" />
            Lieu de rassemblement
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {group.meeting_location || "Adresse non spécifiée"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {members.length} {members.length === 1 ? "fidèle inscrit" : "fidèles inscrits"}
            </p>
          </div>
        </div>
      </div>

      {group.description && (
        <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Vision & objectifs : </span>
          {group.description}
        </div>
      )}

      {/* Gestionnaire d'affectation des membres */}
      <RosterManager
        type="group"
        targetId={group.id}
        assignedMembers={members}
        availableMembers={availableMembers}
      />
    </div>
  );
}
