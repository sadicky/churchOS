import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getCampusesList } from "@/services/member.service";
import { ServiceForm } from "@/components/attendance/service-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarPlus } from "lucide-react";

export const metadata = {
  title: "Planifier un Culte — ChurchOS",
  description: "Créer un nouveau culte de célébration, réunion de prière ou veillée.",
};

export default async function NewServicePage() {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const campuses = await getCampusesList(activeOrg.organization.id);

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/40">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href="/dashboard/attendance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            Planifier un Culte / Réunion
          </h1>
          <p className="text-xs text-muted-foreground">
            {activeOrg.organization.name} • Définissez l&apos;horaire, l&apos;orateur et le thème liturgique
          </p>
        </div>
      </div>

      {/* Service Form */}
      <ServiceForm campuses={campuses} />
    </div>
  );
}
