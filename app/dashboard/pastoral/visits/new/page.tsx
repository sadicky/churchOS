import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getPastoralMembersList } from "@/services/pastoral.service";
import { VisitForm } from "@/components/pastoral/visit-form";

export const metadata: Metadata = {
  title: "Nouvelle Visite Pastorale | ChurchOS",
  description: "Enregistrer une visite pastorale ou un accompagnement de fidèle.",
};

export default async function NewPastoralVisitPage() {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const members = await getPastoralMembersList(activeOrg.organization.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Enregistrer une visite pastorale
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Consignez les échanges spirituels, le cadre de la visite (domicile, hôpital, bureau) et programmez une relance si nécessaire.
        </p>
      </div>

      <VisitForm members={members} />
    </div>
  );
}
