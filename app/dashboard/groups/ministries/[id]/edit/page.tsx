import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  getMinistryDetails,
  getMembersForAssignment,
} from "@/services/community.service";
import { MinistryForm } from "@/components/community/ministry-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Modifier le Département | ChurchOS",
};

export default async function EditMinistryPage({ params }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const [{ ministry }, members] = await Promise.all([
    getMinistryDetails(id, activeOrg.organization.id),
    getMembersForAssignment(activeOrg.organization.id),
  ]);

  if (!ministry) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Modifier le département {ministry.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ajustez les informations de ce pôle de service et assignez un responsable.
        </p>
      </div>

      <MinistryForm initialData={ministry} members={members} />
    </div>
  );
}
