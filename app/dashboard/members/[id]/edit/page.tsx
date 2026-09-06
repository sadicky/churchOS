import * as React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getMemberDetails, getCampusesList } from "@/services/member.service";
import { MemberForm } from "@/components/members/member-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";

interface EditMemberPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Modifier le Membre — ChurchOS",
  description: "Mettre à jour les informations, coordonnées et jalons spirituels d'un membre.",
};

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const [member, campuses] = await Promise.all([
    getMemberDetails(id, activeOrg.organization.id),
    getCampusesList(activeOrg.organization.id),
  ]);

  if (!member) {
    notFound();
  }

  const fullName = `${member.first_name} ${member.last_name}`;

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/40">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href={`/dashboard/members/${member.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Edit className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            Modifier : {fullName}
          </h1>
          <p className="text-xs text-muted-foreground">
            {activeOrg.organization.name} • Mise à jour des informations de la fiche
          </p>
        </div>
      </div>

      {/* Member Form in Edit Mode */}
      <MemberForm initialData={member} campuses={campuses} mode="edit" />
    </div>
  );
}
