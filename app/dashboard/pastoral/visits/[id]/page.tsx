import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getPastoralVisitById } from "@/services/pastoral.service";
import {
  ArrowLeft,
  Calendar,
  Home,
  Building2,
  Phone,
  Activity,
  User,
  AlertTriangle,
  CheckCircle2,
  Edit,
  Mail,
  MapPin,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Fiche Visite Pastorale | ChurchOS`,
  };
}

export default async function PastoralVisitDetailPage({ params }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const visit = await getPastoralVisitById(id, activeOrg.organization.id);

  if (!visit) {
    notFound();
  }

  const memberName = visit.member
    ? `${visit.member.first_name} ${visit.member.last_name}`
    : "Fidèle non rattaché";
  const pastorName = visit.pastor?.full_name || "Pasteur";
  const formattedDate = new Date(visit.visit_date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "HOME":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Home className="h-3.5 w-3.5" />
            Visite à domicile
          </span>
        );
      case "HOSPITAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Activity className="h-3.5 w-3.5" />
            Visite à l&apos;hôpital
          </span>
        );
      case "OFFICE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Building2 className="h-3.5 w-3.5" />
            Entretien au bureau pastoral
          </span>
        );
      case "PHONE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Phone className="h-3.5 w-3.5" />
            Entretien téléphonique
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Navigation et Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/pastoral"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux soins pastoraux
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Visite à {memberName}
            </h1>
            {getTypeBadge(visit.visit_type)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            Effectuée le {formattedDate} par {pastorName}
          </p>
        </div>

        <Link
          href={`/dashboard/pastoral/visits/${visit.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-xs font-medium transition self-start sm:self-auto"
        >
          <Edit className="h-3.5 w-3.5" />
          Modifier la visite
        </Link>
      </div>

      {/* Cartes d'informations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Fidèle visité */}
        <div className="p-5 bg-card border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <User className="h-4 w-4 text-primary" />
            Coordonnées du fidèle
          </div>
          <div>
            <p className="text-base font-bold text-foreground">{memberName}</p>
            {visit.member ? (
              <div className="text-xs text-muted-foreground space-y-1.5 mt-2">
                {visit.member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{visit.member.phone}</span>
                  </div>
                )}
                {visit.member.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{visit.member.email}</span>
                  </div>
                )}
                {visit.member.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{visit.member.address}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Aucune fiche membre rattachée</p>
            )}
          </div>
        </div>

        {/* Statut de relance */}
        <div className="p-5 bg-card border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Suivi & Relance
          </div>
          <div>
            {visit.follow_up_needed ? (
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Relance prioritaire requise
                </span>
                {visit.follow_up_date && (
                  <p className="text-xs text-muted-foreground">
                    Date prévue :{" "}
                    <strong className="text-foreground">
                      {new Date(visit.follow_up_date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </strong>
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Aucune relance ultérieure requise pour cette visite
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compte-rendu spirituel */}
      <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Compte-rendu spirituel & Résumé des échanges
        </h3>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line bg-muted/20 p-4 rounded-xl border border-border/40 font-sans">
          {visit.summary}
        </p>
      </div>
    </div>
  );
}
