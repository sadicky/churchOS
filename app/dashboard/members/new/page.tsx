import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getCampusesList } from "@/services/member.service";
import { MemberForm } from "@/components/members/member-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";

export const metadata = {
  title: "Nouveau Membre — ChurchOS",
  description: "Enregistrer un fidèle, un converti ou une famille dans l'annuaire d'église.",
};

export default async function NewMemberPage() {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const campuses = await getCampusesList(activeOrg.organization.id);

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/40">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href="/dashboard/members">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            Nouveau Membre / Fidèle
          </h1>
          <p className="text-xs text-muted-foreground">
            {activeOrg.organization.name} • Complétez les coordonnées et jalons spirituels
          </p>
        </div>
      </div>

      {/* Member Form */}
      <MemberForm campuses={campuses} mode="create" />
    </div>
  );
}
