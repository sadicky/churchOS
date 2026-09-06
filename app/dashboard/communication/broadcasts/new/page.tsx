import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getAudienceCounts } from "@/services/communication.service";
import { BroadcastForm } from "@/components/communication/broadcast-form";

export const metadata: Metadata = {
  title: "Nouvelle Diffusion SMS & Email | ChurchOS",
  description: "Lancer une campagne de communication ciblée vers l'assemblée, les responsables ou les visiteurs.",
};

export default async function NewBroadcastPage() {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const audienceCounts = await getAudienceCounts(activeOrg.organization.id);

  return <BroadcastForm audienceCounts={audienceCounts} />;
}
