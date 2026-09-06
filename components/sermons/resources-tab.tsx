"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MediaFile } from "@/types";
import {
  createMediaFileAction,
  deleteMediaFileAction,
} from "@/actions/sermon.actions";
import {
  FileText,
  Video,
  Music,
  Image,
  ExternalLink,
  Trash2,
  Plus,
  Loader2,
  Search,
  AlertCircle,
  FolderOpen,
} from "lucide-react";

interface ResourcesTabProps {
  resources: MediaFile[];
}

export function ResourcesTab({ resources }: ResourcesTabProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState<"document" | "image" | "audio" | "video">("document");
  const [filePath, setFilePath] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = resources.filter((r) => {
    const term = searchTerm.toLowerCase();
    return r.title.toLowerCase().includes(term) || r.file_type.toLowerCase().includes(term);
  });

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !filePath.trim()) {
      setError("Veuillez renseigner le titre et l'URL du document.");
      return;
    }

    setLoadingAdd(true);
    setError(null);

    try {
      const res = await createMediaFileAction({
        title: title.trim(),
        file_type: fileType,
        bucket_name: "churchos-media",
        file_path: filePath.trim(),
      });

      if (!res.success) {
        setError(res.error || "Impossible d'ajouter la ressource.");
        setLoadingAdd(false);
        return;
      }

      setTitle("");
      setFilePath("");
      setShowAddForm(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue.");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleDeleteResource = async (id: string, name: string) => {
    const confirmDelete = window.confirm(
      `Voulez-vous supprimer la ressource "${name}" ?`
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    setError(null);

    try {
      const res = await deleteMediaFileAction(id);
      if (!res.success) {
        setError(res.error || "Impossible de supprimer la ressource.");
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-primary" />;
      case "audio":
        return <Music className="h-4 w-4 text-emerald-500" />;
      case "image":
        return <Image className="h-4 w-4 text-indigo-500" />;
      case "document":
      default:
        return <FileText className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un document, guide de cellule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition shadow-sm hover:shadow"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? "Fermer le formulaire" : "Ajouter une ressource"}
        </button>
      </div>

      {/* Formulaire d'ajout rapide de ressource */}
      {showAddForm && (
        <form
          onSubmit={handleAddResource}
          className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4"
        >
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Nouvelle ressource documentaire ou médiatique
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-5">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Titre du document <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ex : Guide d'étude Cellule #12, Bulletin mensuel..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Type de fichier
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              >
                <option value="document">Document (PDF / Word)</option>
                <option value="image">Image / Diapositive</option>
                <option value="audio">Audio / Chant</option>
                <option value="video">Vidéo d&apos;archive</option>
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                URL du document / Lien cloud <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="https://... ou /documents/..."
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary rounded-xl transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loadingAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
            >
              {loadingAdd && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Enregistrer la ressource
            </button>
          </div>
        </form>
      )}

      {/* Grille / Liste des ressources */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/80 rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <FolderOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {searchTerm ? "Aucun document correspondant" : "Aucune ressource répertoriée"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            {searchTerm
              ? "Essayez un autre mot-clé pour retrouver un document."
              : "Partagez des guides d'étude pour les cellules de maison, des fiches de louange ou des bulletins."}
          </p>
          {!searchTerm && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Ajouter un premier document
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Document / Ressource</th>
                  <th className="py-3.5 px-4">Format</th>
                  <th className="py-3.5 px-4">Date d&apos;ajout</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((res) => {
                  const isDeleting = deletingId === res.id;

                  return (
                    <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-secondary shrink-0">
                            {getTypeIcon(res.file_type)}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">
                              {res.title}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate block max-w-sm">
                              {res.file_path}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-secondary-foreground capitalize">
                          {res.file_type}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(res.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <a
                            href={res.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition"
                            title="Ouvrir la ressource"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteResource(res.id, res.title)}
                            disabled={isDeleting}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
