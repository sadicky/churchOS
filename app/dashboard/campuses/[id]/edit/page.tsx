import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getCampusById } from "@/services/campus.service";
import { CampusForm } from "@/components/campuses/campus-form";

export const metadata: Metadata = {
  title: "Modifier le Campus | ChurchOS",
  description: "Mettre à jour les informations et coordonnées du campus.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCampusPage({ params }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const campus = await getCampusById(id, activeOrg.organization.id);

  if (!campus) {
    notFound();
  }

  return <CampusForm initialData={campus} />;
}
