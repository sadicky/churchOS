import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getSermonsOverview } from "@/services/sermon.service";
import { SermonForm } from "@/components/sermons/sermon-form";

export const metadata: Metadata = {
  title: "Publier une Prédication | ChurchOS",
  description: "Enregistrer un nouvel enseignement ou message de culte.",
};

export default async function NewSermonPage() {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { seriesList, preachersList } = await getSermonsOverview(
    activeOrg.organization.id
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Publier une prédication
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Archivage de l&apos;enseignement dominical, intégration vidéo YouTube/Vimeo et canevas de partage pour les cellules.
        </p>
      </div>

      <SermonForm
        existingSeries={seriesList}
        existingPreachers={preachersList}
      />
    </div>
  );
}
