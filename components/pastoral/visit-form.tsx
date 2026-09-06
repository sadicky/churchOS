"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createPastoralVisitAction,
  updatePastoralVisitAction,
  deletePastoralVisitAction,
} from "@/actions/pastoral.actions";
import type { PastoralVisitDetailed } from "@/types";
import type { SimpleMemberSelect } from "@/services/pastoral.service";
import {
  Loader2,
  ArrowLeft,
  Save,
  Trash2,
  HeartHandshake,
  AlertTriangle,
  AlertCircle,
  Home,
  Building2,
  Phone,
  Activity,
} from "lucide-react";

interface VisitFormProps {
  initialData?: PastoralVisitDetailed;
  members: SimpleMemberSelect[];
}

export function VisitForm({ initialData, members }: VisitFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [memberId, setMemberId] = useState(initialData?.member_id || "");
  const [visitDate, setVisitDate] = useState(
    initialData?.visit_date || new Date().toISOString().split("T")[0]
  );
  const [visitType, setVisitType] = useState<"HOME" | "HOSPITAL" | "OFFICE" | "PHONE">(
    (initialData?.visit_type as any) || "HOME"
  );
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [followUpNeeded, setFollowUpNeeded] = useState(
    initialData?.follow_up_needed ?? false
  );
  const [followUpDate, setFollowUpDate] = useState(
    initialData?.follow_up_date || ""
  );

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      setError("Veuillez saisir un résumé ou compte-rendu de la visite.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      member_id: memberId || null,
      visit_date: visitDate,
      visit_type: visitType,
      summary: summary.trim(),
      follow_up_needed: followUpNeeded,
      follow_up_date: followUpNeeded && followUpDate ? followUpDate : null,
    };

    try {
      if (isEditing && initialData) {
        const res = await updatePastoralVisitAction(initialData.id, payload);
        if (!res.success) {
          setError(res.error || "Erreur lors de la mise à jour.");
          setLoading(false);
          return;
        }
        router.push(`/dashboard/pastoral/visits/${initialData.id}`);
      } else {
        const res = await createPastoralVisitAction(payload);
        if (!res.success) {
          setError(res.error || "Erreur lors de l'enregistrement.");
          setLoading(false);
          return;
        }
        router.push(`/dashboard/pastoral/visits/${res.id}`);
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Une erreur inattendue est survenue.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette fiche de visite pastorale ?"))
      return;

    setDeleting(true);
    try {
      const res = await deletePastoralVisitAction(initialData.id);
      if (res.success) {
        router.push("/dashboard/pastoral");
        router.refresh();
      } else {
        setError(res.error || "Impossible de supprimer la visite.");
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
              ? `/dashboard/pastoral/visits/${initialData.id}`
              : "/dashboard/pastoral"
          }
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEditing ? "Retour au détail de la visite" : "Retour aux visites pastorales"}
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Informations de la visite */}
      <div className="p-6 bg-card border border-border rounded-2xl space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isEditing ? "Modifier la visite pastorale" : "Enregistrement de la visite"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Fidèle visité, cadre de rencontre et date de la visite fraternelle.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Fidèle / Membre visité
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            >
              <option value="">Sélectionner un membre dans l&apos;annuaire</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.last_name.toUpperCase()} {m.first_name} {m.phone ? `(${m.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Date de la visite <span className="text-primary">*</span>
            </label>
            <input
              type="date"
              required
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Cadre / Type de visite
            </label>
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            >
              <option value="HOME">Domicile du fidèle</option>
              <option value="HOSPITAL">Hôpital / Visite de malade</option>
              <option value="OFFICE">Bureau pastoral (Cure d&apos;âme)</option>
              <option value="PHONE">Entretien téléphonique pastoral</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Compte-rendu spirituel & Résumé de la visite <span className="text-primary">*</span>
            </label>
            <textarea
              rows={5}
              required
              placeholder="Situation spirituelle, sujet abordé, temps de prière partagé, besoins exprimés (deuil, maladie, nouvelle naissance, réconfort)..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground resize-none"
            />
          </div>
        </div>
      </div>

      {/* Suivi & Relance Pastorale */}
      <div className="p-6 bg-card border border-border rounded-2xl space-y-5 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Suivi & Relance Pastorale
            </h2>
            <p className="text-xs text-muted-foreground">
              Planifiez une recontacte pour ne laisser aucun fidèle sans accompagnement.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={followUpNeeded}
              onChange={(e) => setFollowUpNeeded(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
            />
            <span className="text-sm font-medium text-foreground">
              Cette situation exige une relance pastorale prioritaire
            </span>
          </label>

          {followUpNeeded && (
            <div className="pt-2 max-w-xs">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Date de relance prévue
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              />
            </div>
          )}
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
            Supprimer la fiche
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href={
              isEditing && initialData
                ? `/dashboard/pastoral/visits/${initialData.id}`
                : "/dashboard/pastoral"
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
            {isEditing ? "Enregistrer les modifications" : "Consigner la visite"}
          </button>
        </div>
      </div>
    </form>
  );
}
