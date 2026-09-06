import * as React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getMemberDetails } from "@/services/member.service";
import { MemberNotesTab } from "@/components/members/member-notes-tab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Church,
  Wallet,
  CalendarCheck,
  Building2,
  Users,
  Network,
  Lock,
  Sparkles,
} from "lucide-react";

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: `Fiche Membre — ChurchOS`,
  };
}

export default async function MemberDetailPage({
  params,
  searchParams,
}: MemberDetailPageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams.tab || "profile";

  const member = await getMemberDetails(id, activeOrg.organization.id);
  if (!member) {
    notFound();
  }

  const fullName = `${member.first_name} ${member.last_name}`;

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-5xl mx-auto">
      {/* 1. Header Card with Profile Overview & Actions */}
      <Card className="p-6 border-border/50 bg-card/60 backdrop-blur-sm shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-brand-500/20 shadow-sm">
              <AvatarFallback className="bg-brand-600 text-white font-extrabold text-xl">
                {member.first_name.slice(0, 1)}
                {member.last_name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  {fullName}
                </h1>
                <Badge
                  variant="outline"
                  className="text-xs font-semibold px-2 py-0.5 border-brand-500/30 text-brand-600 dark:text-brand-400"
                >
                  {member.membership_status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
                  {member.campuses?.name || "Campus Principal"}
                </span>
                {member.city && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                      {member.city}, {member.country || "Burundi"}
                    </span>
                  </>
                )}
                {member.occupation && (
                  <>
                    <span>•</span>
                    <span>{member.occupation}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {member.phone && (
              <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5 border-border/60">
                <a href={`tel:${member.phone}`}>
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Appeler</span>
                </a>
              </Button>
            )}
            {member.email && (
              <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5 border-border/60">
                <a href={`mailto:${member.email}`}>
                  <Mail className="h-3.5 w-3.5 text-brand-600" />
                  <span>Email</span>
                </a>
              </Button>
            )}
            <Button size="sm" asChild className="h-8 text-xs gap-1.5 bg-brand-600 hover:bg-brand-700 text-white shadow-xs">
              <Link href={`/dashboard/members/${member.id}/edit`}>
                <Edit2 className="h-3.5 w-3.5" />
                <span>Modifier</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pt-4 text-xs font-medium scrollbar-none">
          <Link
            href={`/dashboard/members/${member.id}?tab=profile`}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "profile"
                ? "bg-brand-600/10 text-brand-700 dark:text-brand-300 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            Informations Générales
          </Link>

          <Link
            href={`/dashboard/members/${member.id}?tab=ministries`}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "ministries"
                ? "bg-brand-600/10 text-brand-700 dark:text-brand-300 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            Vie d&apos;Église & Ministères ({member.ministries.length + member.groups.length})
          </Link>

          <Link
            href={`/dashboard/members/${member.id}?tab=attendance`}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "attendance"
                ? "bg-brand-600/10 text-brand-700 dark:text-brand-300 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            Présences ({member.attendances.length})
          </Link>

          <Link
            href={`/dashboard/members/${member.id}?tab=finances`}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "finances"
                ? "bg-brand-600/10 text-brand-700 dark:text-brand-300 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            Dîmes & Contributions ({member.donations.length})
          </Link>

          <Link
            href={`/dashboard/members/${member.id}?tab=notes`}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "notes"
                ? "bg-brand-600/10 text-brand-700 dark:text-brand-300 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Lock className="h-3 w-3 text-amber-500" />
            Notes Pastorales ({member.pastoralNotes.length})
          </Link>
        </div>
      </Card>

      {/* 2. Tab Contents */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* État civil & Contacts */}
          <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/30">
              Coordonnées & État Civil
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Genre</span>
                <span className="font-semibold text-foreground">
                  {member.gender === "MALE"
                    ? "Masculin"
                    : member.gender === "FEMALE"
                    ? "Féminin"
                    : "Non renseigné"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">État civil</span>
                <span className="font-semibold text-foreground">
                  {member.marital_status || "Non renseigné"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Date de naissance</span>
                <span className="font-semibold text-foreground">
                  {member.date_of_birth
                    ? new Date(member.date_of_birth).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Profession</span>
                <span className="font-semibold text-foreground">
                  {member.occupation || "—"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Téléphone</span>
                <span className="font-semibold text-foreground">
                  {member.phone || "—"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Email</span>
                <span className="font-semibold text-foreground">
                  {member.email || "—"}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-muted-foreground block text-[11px]">Adresse physique</span>
                <span className="font-semibold text-foreground">
                  {member.address || "—"}
                </span>
              </div>
            </div>
          </Card>

          {/* Jalons spirituels & Contact d'urgence */}
          <div className="space-y-6">
            <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/30 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                Jalons & Engagements Spirituels
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Date d&apos;adhésion</span>
                  <span className="font-semibold text-foreground">
                    {member.join_date
                      ? new Date(member.join_date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Baptême par immersion</span>
                  <span className="font-semibold text-foreground">
                    {member.baptism_date
                      ? new Date(member.baptism_date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Non baptisé"}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/30 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-destructive" />
                Contact d&apos;Urgence
              </h3>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Nom</span>
                  <span className="font-semibold text-foreground">
                    {member.emergency_contact_name || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Téléphone</span>
                  <span className="font-semibold text-foreground">
                    {member.emergency_contact_phone || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Lien</span>
                  <span className="font-semibold text-foreground">
                    {member.emergency_contact_relation || "—"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "ministries" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/30 flex items-center gap-2">
              <Church className="h-4 w-4 text-brand-600" />
              Départements & Ministères
            </h3>

            {member.ministries.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Ce fidèle n&apos;est encore assigné à aucun ministère.
              </p>
            ) : (
              <div className="divide-y divide-border/40">
                {member.ministries.map((m) => (
                  <div key={m.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {m.ministry.name}
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        Rôle: {m.role || "Membre actif"}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      Depuis le {new Date(m.joined_at).toLocaleDateString("fr-FR")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/30 flex items-center gap-2">
              <Network className="h-4 w-4 text-blue-600" />
              Groupes de Maison / Cellules
            </h3>

            {member.groups.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Ce fidèle ne fait partie d&apos;aucune cellule de prière pour le moment.
              </p>
            ) : (
              <div className="divide-y divide-border/40">
                {member.groups.map((g) => (
                  <div key={g.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {g.group.name}
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        Rôle: {g.role || "Fidèle"}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      Depuis le {new Date(g.joined_at).toLocaleDateString("fr-FR")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "attendance" && (
        <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/30 flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-emerald-600" />
            Historique Récent des Présences aux Cultes
          </h3>

          {member.attendances.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              Aucun pointage de présence enregistré pour ce membre.
            </p>
          ) : (
            <div className="divide-y divide-border/30">
              {member.attendances.map((att) => (
                <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-foreground">
                      {att.serviceName}
                    </span>
                    <span className="text-muted-foreground text-[11px] block">
                      {att.sessionDate
                        ? new Date(att.sessionDate).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]"
                  >
                    Présent
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === "finances" && (
        <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/30 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-600" />
            Historique des Dîmes & Contributions Nominatives
          </h3>

          {member.donations.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              Aucun don ou dîme nominatif enregistré pour ce membre.
            </p>
          ) : (
            <div className="divide-y divide-border/30">
              {member.donations.map((d) => (
                <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-foreground">
                      {d.type === "TITHE" ? "Dîme" : d.type}
                    </span>
                    <span className="text-muted-foreground text-[11px] block">
                      {new Date(d.donationDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      • {d.paymentMethod}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    +{d.amount.toLocaleString()} {activeOrg.organization.currency}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === "notes" && (
        <MemberNotesTab memberId={member.id} notes={member.pastoralNotes} />
      )}
    </div>
  );
}
