"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createSermonAction,
  updateSermonAction,
  deleteSermonAction,
} from "@/actions/sermon.actions";
import type { Sermon } from "@/types";
import {
  Loader2,
  ArrowLeft,
  Save,
  Trash2,
  BookOpen,
  Video,
  Music,
  FileText,
  AlertCircle,
  Calendar,
} from "lucide-react";

interface SermonFormProps {
  initialData?: Sermon;
  existingSeries: string[];
  existingPreachers: string[];
}

export function SermonForm({
  initialData,
  existingSeries,
  existingPreachers,
}: SermonFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title || "");
  const [preacher, setPreacher] = useState(initialData?.preacher || "");
  const [sermonDate, setSermonDate] = useState(
    initialData?.sermon_date || new Date().toISOString().split("T")[0]
  );
  const [scriptureReference, setScriptureReference] = useState(
    initialData?.scripture_reference || ""
  );
  const [seriesName, setSeriesName] = useState(initialData?.series_name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url || "");
  const [audioUrl, setAudioUrl] = useState(initialData?.audio_url || "");
  const [notesUrl, setNotesUrl] = useState(initialData?.notes_url || "");
  const [tagsString, setTagsString] = useState(
    initialData?.tags ? initialData.tags.join(", ") : ""
  );

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !preacher.trim()) {
      setError("Veuillez renseigner le titre du message et l'orateur.");
      return;
    }

    setLoading(true);
    setError(null);

    const tagsArray = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: title.trim(),
      preacher: preacher.trim(),
      sermon_date: sermonDate,
      scripture_reference: scriptureReference.trim() || null,
      series_name: seriesName.trim() || null,
      description: description.trim() || null,
      content: content.trim() || null,
      video_url: videoUrl.trim() || null,
      audio_url: audioUrl.trim() || null,
      notes_url: notesUrl.trim() || null,
      tags: tagsArray,
    };

    try {
      if (isEditing && initialData) {
        const res = await updateSermonAction(initialData.id, payload);
        if (!res.success) {
          setError(res.error || "Erreur lors de la mise à jour.");
          setLoading(false);
          return;
        }
        router.push(`/dashboard/sermons/${initialData.id}`);
      } else {
        const res = await createSermonAction(payload);
        if (!res.success) {
          setError(res.error || "Erreur lors de l'enregistrement.");
          setLoading(false);
          return;
        }
        router.push(`/dashboard/sermons/${res.id}`);
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Une erreur inattendue est survenue.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    const confirmDelete = window.confirm(
      "Êtes-vous certain de vouloir supprimer cette prédication de la médiathèque ?"
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const res = await deleteSermonAction(initialData.id);
      if (res.success) {
        router.push("/dashboard/sermons");
        router.refresh();
      } else {
        setError(res.error || "Impossible de supprimer le message.");
        setDeleting(false);
      }
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la suppression.");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Retour */}
      <div>
        <Link
          href={
            isEditing && initialData
              ? `/dashboard/sermons/${initialData.id}`
              : "/dashboard/sermons"
          }
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEditing ? "Retour au message" : "Retour à la médiathèque"}
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Informations Clés du Message */}
      <div className="p-6 bg-card border border-border rounded-2xl space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isEditing ? "Modifier la prédication" : "Identité du message"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Titre théologique, orateur, date du culte et passage biblique de référence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Titre de l&apos;enseignement <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex : La Puissance de la Résurrection, Marcher par l'Esprit..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Orateur / Prédicateur <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              list="preachers-list"
              placeholder="ex : Pasteur Jean-Paul, Évangéliste Marc..."
              value={preacher}
              onChange={(e) => setPreacher(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
            <datalist id="preachers-list">
              {existingPreachers.map((pr) => (
                <option key={pr} value={pr} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Date du culte ou de diffusion <span className="text-primary">*</span>
            </label>
            <input
              type="date"
              required
              value={sermonDate}
              onChange={(e) => setSermonDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Texte / Référence biblique
            </label>
            <input
              type="text"
              placeholder="ex : Hébreux 8:6-13, Romains 8:28..."
              value={scriptureReference}
              onChange={(e) => setScriptureReference(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Série thématique (optionnel)
            </label>
            <input
              type="text"
              list="series-list"
              placeholder="ex : Les Fondements de la Grâce, Bâtir la Famille..."
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
            <datalist id="series-list">
              {existingSeries.map((ser) => (
                <option key={ser} value={ser} />
              ))}
            </datalist>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Résumé synthétique
            </label>
            <textarea
              rows={2}
              placeholder="Brève synthèse du message pour les fidèles et le site web..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Canevas de prédication & Notes d&apos;étude
            </label>
            <textarea
              rows={6}
              placeholder="Points principaux, plan du sermon, versets clés et questions pour le partage en cellules de maison..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground resize-y font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Liens Médias & Numériques */}
      <div className="p-6 bg-card border border-border rounded-2xl space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Ressources Multimédias & Liens
            </h2>
            <p className="text-xs text-muted-foreground">
              Intégrez la vidéo YouTube, le podcast audio et les supports de projection.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Lien Vidéo (YouTube, Vimeo ou flux MP4 direct)
            </label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Lien Audio (MP3, Podcast ou flux audio direct)
            </label>
            <input
              type="url"
              placeholder="https://exemple.org/audio/sermon.mp3"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Lien des Notes / PDF externe
            </label>
            <input
              type="url"
              placeholder="https://exemple.org/documents/notes-predication.pdf"
              value={notesUrl}
              onChange={(e) => setNotesUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Mots-clés / Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              placeholder="Alliance, Foi, Grâce, Saint-Esprit, Prière..."
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
        {isEditing ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-destructive hover:bg-destructive/10 rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Supprimer le message
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href={
              isEditing && initialData
                ? `/dashboard/sermons/${initialData.id}`
                : "/dashboard/sermons"
            }
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-sm font-medium transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading || deleting}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-semibold transition shadow-sm hover:shadow disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? "Enregistrer les modifications" : "Publier la prédication"}
          </button>
        </div>
      </div>
    </form>
  );
}
