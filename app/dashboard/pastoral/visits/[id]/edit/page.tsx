import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  getPastoralVisitById,
  getPastoralMembersList,
} from "@/services/pastoral.service";
import { VisitForm } from "@/components/pastoral/visit-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Modifier la Visite Pastorale | ChurchOS",
};

export default async function EditPastoralVisitPage({ params }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const [visit, members] = await Promise.all([
    getPastoralVisitById(id, activeOrg.organization.id),
    getPastoralMembersList(activeOrg.organization.id),
  ]);

  if (!visit) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Modifier la visite pastorale
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ajustez le compte-rendu ou modifiez les paramètres de relance pastorale.
        </p>
      </div>

      <VisitForm initialData={visit} members={members} />
    </div>
  );
}
