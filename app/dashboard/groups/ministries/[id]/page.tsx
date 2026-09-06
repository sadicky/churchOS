import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  getMinistryDetails,
  getMembersForAssignment,
} from "@/services/community.service";
import { RosterManager } from "@/components/community/roster-manager";
import {
  ArrowLeft,
  ShieldCheck,
  Edit,
  HeartHandshake,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Fiche Département | ChurchOS`,
  };
}

export default async function MinistryDetailPage({ params }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const [{ ministry, volunteers }, availableMembers] = await Promise.all([
    getMinistryDetails(id, activeOrg.organization.id),
    getMembersForAssignment(activeOrg.organization.id),
  ]);

  if (!ministry) {
    notFound();
  }

  const leaderName = ministry.leader
    ? `${ministry.leader.first_name} ${ministry.leader.last_name}`
    : "Aucun responsable assigné";

  return (
    <div className="space-y-8">
      {/* Navigation retour & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/groups?tab=ministries"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux départements
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {ministry.name}
            </h1>
            {ministry.is_active ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Actif
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                Inactif
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Département et pôle d&apos;activité de service dans l&apos;église locale.
          </p>
        </div>

        <Link
          href={`/dashboard/groups/ministries/${ministry.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-sm font-medium transition self-start sm:self-auto"
        >
          <Edit className="h-4 w-4" />
          Modifier le département
        </Link>
      </div>

      {/* Cartes d'informations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Responsable */}
        <div className="p-5 bg-card border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            Responsable de département
          </div>
          <div>
            <p className="text-base font-bold text-foreground">{leaderName}</p>
            {ministry.leader && (
              <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                {ministry.leader.email && <p>{ministry.leader.email}</p>}
                {ministry.leader.phone && <p>{ministry.leader.phone}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Effectif mobilisé */}
        <div className="p-5 bg-card border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <HeartHandshake className="h-4 w-4 text-indigo-500" />
            Effectif mobilisé
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{volunteers.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {volunteers.length === 1
                ? "Serviteur actif engagé dans ce pôle"
                : "Serviteurs actifs engagés dans ce pôle"}
            </p>
          </div>
        </div>
      </div>

      {ministry.description && (
        <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Mission & Vision : </span>
          {ministry.description}
        </div>
      )}

      {/* Gestionnaire du Roster des Bénévoles */}
      <RosterManager
        type="ministry"
        targetId={ministry.id}
        assignedMembers={volunteers}
        availableMembers={availableMembers}
      />
    </div>
  );
}
