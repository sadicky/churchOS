import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { CampusForm } from "@/components/campuses/campus-form";

export const metadata: Metadata = {
  title: "Nouveau Campus | ChurchOS",
  description: "Créer et configurer un nouveau site ou campus pour l'église.",
};

export default async function NewCampusPage() {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  return <CampusForm />;
}
