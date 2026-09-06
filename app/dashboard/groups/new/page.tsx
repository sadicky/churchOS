import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getMembersForAssignment, getCampusesForOrg } from "@/services/community.service";
import { GroupForm } from "@/components/community/group-form";

export const metadata: Metadata = {
  title: "Nouvelle Cellule de Maison | ChurchOS",
  description: "Créer une nouvelle cellule de maison ou groupe de prière dans ChurchOS.",
};

export default async function NewGroupPage() {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const [members, campuses] = await Promise.all([
    getMembersForAssignment(activeOrg.organization.id),
    getCampusesForOrg(activeOrg.organization.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Créer une cellule de maison
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Renseignez les détails du petit groupe, le jour de réunion et assignez un conducteur spirituel.
        </p>
      </div>

      <GroupForm members={members} campuses={campuses} />
    </div>
  );
}
