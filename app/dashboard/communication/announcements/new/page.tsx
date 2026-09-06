import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { AnnouncementForm } from "@/components/communication/announcement-form";

export const metadata: Metadata = {
  title: "Nouvelle Annonce | ChurchOS",
  description: "Créer et publier une annonce officielle pour la communauté.",
};

export default async function NewAnnouncementPage() {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  return <AnnouncementForm />;
}
