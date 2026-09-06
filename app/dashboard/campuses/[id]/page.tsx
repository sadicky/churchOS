import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getCampusDetails } from "@/services/campus.service";
import { CampusDetailView } from "@/components/campuses/campus-detail-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) return { title: "Campus | ChurchOS" };

  const { id } = await params;
  const data = await getCampusDetails(id, activeOrg.organization.id);
  if (!data) return { title: "Campus non trouvé | ChurchOS" };

  return {
    title: `${data.campus.name} | ChurchOS`,
    description: `Fiche technique, sanctuaires, locaux et cultes du ${data.campus.name}.`,
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampusDetailPage({ params }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const data = await getCampusDetails(id, activeOrg.organization.id);

  if (!data) {
    notFound();
  }

  return (
    <CampusDetailView
      campus={data.campus}
      rooms={data.rooms}
      services={data.services}
      groups={data.groups}
    />
  );
}
