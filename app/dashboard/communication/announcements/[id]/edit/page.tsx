import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getAnnouncementById } from "@/services/communication.service";
import { AnnouncementForm } from "@/components/communication/announcement-form";

export const metadata: Metadata = {
  title: "Modifier l'Annonce | ChurchOS",
  description: "Mettre à jour une annonce officielle de l'église.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAnnouncementPage({ params }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const announcement = await getAnnouncementById(id, activeOrg.organization.id);

  if (!announcement) {
    notFound();
  }

  return <AnnouncementForm initialData={announcement} />;
}
