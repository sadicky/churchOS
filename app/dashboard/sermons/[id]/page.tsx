import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getSermonById } from "@/services/sermon.service";
import { MediaPlayer } from "@/components/sermons/media-player";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  User,
  Edit,
  Tag,
  Share2,
  FileText,
  Printer,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Prédication | ChurchOS`,
  };
}

export default async function SermonDetailPage({ params }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const sermon = await getSermonById(id, activeOrg.organization.id);

  if (!sermon) {
    notFound();
  }

  const formattedDate = new Date(sermon.sermon_date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Navigation et Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/sermons"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la médiathèque
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {sermon.series_name && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                Série : {sermon.series_name}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {formattedDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {sermon.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold text-foreground">{sermon.preacher}</span>
            </div>

            {sermon.scripture_reference && (
              <div className="flex items-center gap-1.5 font-semibold text-primary">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{sermon.scripture_reference}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href={`/dashboard/sermons/${sermon.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-xs font-medium transition"
          >
            <Edit className="h-3.5 w-3.5" />
            Modifier
          </Link>
        </div>
      </div>

      {/* Lecteur Média Interactif */}
      <MediaPlayer
        videoUrl={sermon.video_url}
        audioUrl={sermon.audio_url}
        notesUrl={sermon.notes_url}
        title={sermon.title}
        preacher={sermon.preacher}
      />

      {/* Résumé / Description */}
      {sermon.description && (
        <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Synthèse du message
          </h3>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {sermon.description}
          </p>
        </div>
      )}

      {/* Canevas de Prédication & Notes d'Étude */}
      {sermon.content && (
        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Canevas de Prédication & Guide d&apos;Étude pour Cellules
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/90 bg-muted/20 p-4 rounded-xl border border-border/40">
            {sermon.content}
          </div>
        </div>
      )}

      {/* Tags Thématiques */}
      {sermon.tags && sermon.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mr-1">Thématiques :</span>
          {sermon.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
