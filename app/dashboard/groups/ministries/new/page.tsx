import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getMembersForAssignment } from "@/services/community.service";
import { MinistryForm } from "@/components/community/ministry-form";

export const metadata: Metadata = {
  title: "Nouveau Département | ChurchOS",
  description: "Créer un nouveau pôle de service ou ministère d'église.",
};

export default async function NewMinistryPage() {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const members = await getMembersForAssignment(activeOrg.organization.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Nouveau département / ministère
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Définissez un pôle d&apos;activité (Louange, Protocole, Multimédia, Enfants) et assignez un responsable.
        </p>
      </div>

      <MinistryForm members={members} />
    </div>
  );
}
