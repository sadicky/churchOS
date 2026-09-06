import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  getSermonById,
  getSermonsOverview,
} from "@/services/sermon.service";
import { SermonForm } from "@/components/sermons/sermon-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Modifier la Prédication | ChurchOS",
};

export default async function EditSermonPage({ params }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const [sermon, { seriesList, preachersList }] = await Promise.all([
    getSermonById(id, activeOrg.organization.id),
    getSermonsOverview(activeOrg.organization.id),
  ]);

  if (!sermon) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Modifier la prédication
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mettez à jour le titre, les liens vidéo/audio ou le canevas d&apos;étude.
        </p>
      </div>

      <SermonForm
        initialData={sermon}
        existingSeries={seriesList}
        existingPreachers={preachersList}
      />
    </div>
  );
}
