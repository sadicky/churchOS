import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  getGroupDetails,
  getMembersForAssignment,
  getCampusesForOrg,
} from "@/services/community.service";
import { GroupForm } from "@/components/community/group-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Modifier la Cellule | ChurchOS",
};

export default async function EditGroupPage({ params }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const [{ group }, members, campuses] = await Promise.all([
    getGroupDetails(id, activeOrg.organization.id),
    getMembersForAssignment(activeOrg.organization.id),
    getCampusesForOrg(activeOrg.organization.id),
  ]);

  if (!group) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Modifier la cellule {group.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ajustez les paramètres de la cellule, changez le conducteur ou mettez à jour l&apos;adresse de rassemblement.
        </p>
      </div>

      <GroupForm initialData={group} members={members} campuses={campuses} />
    </div>
  );
}
