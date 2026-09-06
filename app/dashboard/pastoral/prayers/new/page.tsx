import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getPastoralMembersList } from "@/services/pastoral.service";
import { PrayerForm } from "@/components/pastoral/prayer-form";

export const metadata: Metadata = {
  title: "Nouveau Sujet de Prière | ChurchOS",
  description: "Déposer une intention de prière ou un besoin d'intercession.",
};

export default async function NewPrayerPage() {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const members = await getPastoralMembersList(activeOrg.organization.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Nouveau sujet d&apos;intercession
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enregistrez un fardeau ou besoin de prière à porter en intercession au sein de l&apos;église.
        </p>
      </div>

      <PrayerForm members={members} />
    </div>
  );
}
