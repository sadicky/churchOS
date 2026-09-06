"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createGroupAction, updateGroupAction, deleteGroupAction } from "@/actions/community.actions";
import type { GroupDetailed } from "@/types";
import type { SimpleMemberOption, SimpleCampusOption } from "@/services/community.service";
import { Loader2, ArrowLeft, Save, Trash2, Users, MapPin, Calendar, Clock, AlertCircle } from "lucide-react";

interface GroupFormProps {
  initialData?: GroupDetailed;
  members: SimpleMemberOption[];
  campuses: SimpleCampusOption[];
}

const DAYS_OF_WEEK = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export function GroupForm({ initialData, members, campuses }: GroupFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [name, setName] = useState(initialData?.name || "");
  const [campusId, setCampusId] = useState(initialData?.campus_id || "");
  const [leaderId, setLeaderId] = useState(initialData?.leader_id || "");
  const [meetingDay, setMeetingDay] = useState(initialData?.meeting_day || "Jeudi");
  const [meetingTime, setMeetingTime] = useState(initialData?.meeting_time || "19:00");
  const [meetingLocation, setMeetingLocation] = useState(initialData?.meeting_location || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Veuillez saisir un nom pour la cellule.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      campus_id: campusId || null,
      leader_id: leaderId || null,
      meeting_day: meetingDay || null,
      meeting_time: meetingTime || null,
      meeting_location: meetingLocation.trim() || null,
      description: description.trim() || null,
      is_active: isActive,
    };

    try {
      if (isEditing && initialData) {
        const res = await updateGroupAction(initialData.id, payload);
        if (!res.success) {
          setError(res.error || "Erreur lors de la mise à jour.");
          setLoading(false);
          return;
        }
        router.push(`/dashboard/groups/${initialData.id}`);
      } else {
        const res = await createGroupAction(payload);
        if (!res.success) {
          setError(res.error || "Erreur lors de la création.");
          setLoading(false);
          return;
        }
        router.push(`/dashboard/groups/${res.id}`);
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
      "Êtes-vous sûr de vouloir supprimer définitivement cette cellule de maison ? Cette action est irréversible."
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const res = await deleteGroupAction(initialData.id);
      if (res.success) {
        router.push("/dashboard/groups");
        router.refresh();
      } else {
        setError(res.error || "Impossible de supprimer la cellule.");
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
          href={isEditing && initialData ? `/dashboard/groups/${initialData.id}` : "/dashboard/groups"}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEditing ? "Retour au détail de la cellule" : "Retour aux cellules"}
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
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isEditing ? "Modifier la cellule de maison" : "Identité de la cellule"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Définissez le nom, le conducteur spirituel et le rattachement de la cellule.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Nom de la cellule <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex : Cellule Siloé, Béthel Centre, Espérance..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Campus de rattachement
            </label>
            <select
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            >
              <option value="">Aucun campus spécifique (Central)</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Conducteur / Responsable
            </label>
            <select
              value={leaderId}
              onChange={(e) => setLeaderId(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            >
              <option value="">Sélectionner un fidèle / conducteur</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.last_name.toUpperCase()} {m.first_name} {m.phone ? `(${m.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Description ou vision de la cellule
            </label>
            <textarea
              rows={3}
              placeholder="Objectif de communion fraternelle, partage biblique et intercession mutuelle..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground resize-none"
            />
          </div>
        </div>
      </div>

      {/* Horaires et Lieu de Réunion */}
      <div className="p-6 bg-card border border-border rounded-2xl space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Rendez-vous et Lieu de Réunion</h2>
            <p className="text-xs text-muted-foreground">
              Fixez le créneau hebdomadaire et l&apos;adresse de la maison d&apos;accueil.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Jour de rassemblement
              </span>
            </label>
            <select
              value={meetingDay}
              onChange={(e) => setMeetingDay(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Heure de début
              </span>
            </label>
            <input
              type="text"
              placeholder="ex : 19:00"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Lieu / Adresse d&apos;accueil
            </label>
            <input
              type="text"
              placeholder="ex : Chez la famille Dupont, 14 rue de la République, 75011 Paris"
              value={meetingLocation}
              onChange={(e) => setMeetingLocation(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
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
                Cellule active (ouverte aux affectations et visible dans les répertoires)
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
            Supprimer la cellule
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href={isEditing && initialData ? `/dashboard/groups/${initialData.id}` : "/dashboard/groups"}
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
            {isEditing ? "Enregistrer les modifications" : "Créer la cellule"}
          </button>
        </div>
      </div>
    </form>
  );
}
