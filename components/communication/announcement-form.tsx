"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
} from "@/actions/communication.actions";
import type { AnnouncementDetailed } from "@/types";
import {
  Loader2,
  ArrowLeft,
  Save,
  Trash2,
  Bell,
  Pin,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface AnnouncementFormProps {
  initialData?: AnnouncementDetailed;
}

export function AnnouncementForm({ initialData }: AnnouncementFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [isPinned, setIsPinned] = useState(initialData?.is_pinned ?? false);
  const [expiresAt, setExpiresAt] = useState(
    initialData?.expires_at ? initialData.expires_at.split("T")[0] : ""
  );

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Veuillez renseigner le titre et le contenu de l'annonce.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      title: title.trim(),
      content: content.trim(),
      is_pinned: isPinned,
      expires_at: expiresAt || null,
    };

    try {
      if (isEditing && initialData) {
        const res = await updateAnnouncementAction(initialData.id, payload);
        if (!res.success) {
          setError(res.error || "Erreur lors de la mise à jour.");
          setLoading(false);
          return;
        }
      } else {
        const res = await createAnnouncementAction(payload);
        if (!res.success) {
          setError(res.error || "Erreur lors de la publication.");
          setLoading(false);
          return;
        }
      }

      router.push("/dashboard/communication?tab=announcements");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Une erreur inattendue est survenue.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    if (!window.confirm("Êtes-vous certain de vouloir supprimer cette annonce ?"))
      return;

    setDeleting(true);
    try {
      const res = await deleteAnnouncementAction(initialData.id);
      if (res.success) {
        router.push("/dashboard/communication?tab=announcements");
        router.refresh();
      } else {
        setError(res.error || "Impossible de supprimer l'annonce.");
        setDeleting(false);
      }
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la suppression.");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div>
        <Link
          href="/dashboard/communication?tab=announcements"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux annonces
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="p-6 bg-card border border-border rounded-2xl space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isEditing ? "Modifier l'annonce" : "Nouvelle annonce paroissiale"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Rédigez une communication visible sur le dashboard et les écrans d&apos;accueil.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Titre de l&apos;annonce <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex : Conférence Annuelle des Familles, Veillée de Prière, Culte d'Action de Grâce..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Texte de l&apos;annonce <span className="text-primary">*</span>
            </label>
            <textarea
              rows={5}
              required
              placeholder="Détail du programme, horaires, intervenants, inscriptions ou instructions pratiques pour les fidèles..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Date d&apos;expiration (optionnel)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                L&apos;annonce sera automatiquement archivée après cette date.
              </p>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Pin className="h-4 w-4 text-amber-500" />
                  Épingler en tête d&apos;affiche
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

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
            Supprimer l&apos;annonce
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard/communication?tab=announcements"
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
            {isEditing ? "Enregistrer les modifications" : "Publier l'annonce"}
          </button>
        </div>
      </div>
    </form>
  );
}
