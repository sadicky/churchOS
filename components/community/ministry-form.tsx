"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createMinistryAction, updateMinistryAction, deleteMinistryAction } from "@/actions/community.actions";
import type { MinistryDetailed } from "@/types";
import type { SimpleMemberOption } from "@/services/community.service";
import { Loader2, ArrowLeft, Save, Trash2, HeartHandshake, AlertCircle } from "lucide-react";

interface MinistryFormProps {
  initialData?: MinistryDetailed;
  members: SimpleMemberOption[];
}

export function MinistryForm({ initialData, members }: MinistryFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [name, setName] = useState(initialData?.name || "");
  const [leaderId, setLeaderId] = useState(initialData?.leader_id || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Veuillez saisir un nom pour le département.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      leader_id: leaderId || null,
      description: description.trim() || null,
      is_active: isActive,
    };

    try {
      if (isEditing && initialData) {
        const res = await updateMinistryAction(initialData.id, payload);
        if (!res.success) {
          setError(res.error || "Erreur lors de la mise à jour.");
          setLoading(false);
          return;
        }
        router.push(`/dashboard/groups/ministries/${initialData.id}`);
      } else {
        const res = await createMinistryAction(payload);
        if (!res.success) {
          setError(res.error || "Erreur lors de la création.");
          setLoading(false);
          return;
        }
        router.push(`/dashboard/groups/ministries/${res.id}`);
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
      "Êtes-vous sûr de vouloir supprimer définitivement ce département ? Cette action est irréversible."
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const res = await deleteMinistryAction(initialData.id);
      if (res.success) {
        router.push("/dashboard/groups?tab=ministries");
        router.refresh();
      } else {
        setError(res.error || "Impossible de supprimer le département.");
        setDeleting(false);
      }
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la suppression.");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Bouton retour */}
      <div>
        <Link
          href={
            isEditing && initialData
              ? `/dashboard/groups/ministries/${initialData.id}`
              : "/dashboard/groups?tab=ministries"
          }
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEditing ? "Retour au département" : "Retour aux ministères"}
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Informations Générales */}
      <div className="p-6 bg-card border border-border rounded-2xl space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isEditing ? "Modifier le département" : "Nouveau département / ministère"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Configurez le pôle de service et assignez le responsable de ministère.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Nom du département ou ministère <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex : Louange & Adoration, Multimédia, Protocole & Accueil..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Responsable de département
            </label>
            <select
              value={leaderId}
              onChange={(e) => setLeaderId(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            >
              <option value="">Sélectionner un responsable de département</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.last_name.toUpperCase()} {m.first_name} {m.phone ? `(${m.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Mission et description du service
            </label>
            <textarea
              rows={4}
              placeholder="Missions confiées aux serviteurs, critères d'engagement, vision spirituelle du pôle..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground resize-none"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm font-medium text-foreground">
                Département actif (ouvert aux affectations de nouveaux serviteurs)
              </span>
            </label>
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
            Supprimer le département
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href={
              isEditing && initialData
                ? `/dashboard/groups/ministries/${initialData.id}`
                : "/dashboard/groups?tab=ministries"
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
            {isEditing ? "Enregistrer les modifications" : "Créer le département"}
          </button>
        </div>
      </div>
    </form>
  );
}
