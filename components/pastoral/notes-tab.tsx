"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PastoralNoteDetailed } from "@/types";
import type { SimpleMemberSelect } from "@/services/pastoral.service";
import {
  createPastoralNoteAction,
  deletePastoralNoteAction,
} from "@/actions/pastoral.actions";
import {
  Lock,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Trash2,
  Loader2,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";

interface NotesTabProps {
  notes: PastoralNoteDetailed[];
  members: SimpleMemberSelect[];
}

export function NotesTab({ notes, members }: NotesTabProps) {
  const router = useRouter();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [confidentialLevel, setConfidentialLevel] = useState(1);
  const [noteContent, setNoteContent] = useState("");

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      setError("Le texte de la note pastorale est obligatoire.");
      return;
    }

    setLoadingAdd(true);
    setError(null);

    try {
      const res = await createPastoralNoteAction({
        member_id: selectedMemberId || null,
        confidential_level: confidentialLevel,
        note: noteContent.trim(),
      });

      if (!res.success) {
        setError(res.error || "Impossible d'enregistrer la note.");
        setLoadingAdd(false);
        return;
      }

      setNoteContent("");
      setSelectedMemberId("");
      setShowAddForm(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Une erreur inattendue est survenue.");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette note pastorale confidentielle ?")) return;
    setDeletingId(noteId);
    try {
      await deletePastoralNoteAction(noteId);
      router.refresh();
    } finally {
      setDeletingId(null);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-500" />
            Journal des Notes Pastorales Confidentielles
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Espace d&apos;annotations sécurisé protégé par Row Level Security (accès strictement réservé au corps pastoral).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? "Fermer" : "Nouvelle note pastorale"}
        </button>
      </div>

      {/* Formulaire d'ajout rapide */}
      {showAddForm && (
        <form
          onSubmit={handleAddNote}
          className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Fidèle concerné (optionnel)
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              >
                <option value="">Note générale d&apos;équipe / Aucun membre spécifique</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.last_name.toUpperCase()} {m.first_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Niveau de confidentialité
              </label>
              <select
                value={confidentialLevel}
                onChange={(e) => setConfidentialLevel(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              >
                <option value={1}>Niveau 1 : Équipe Pastorale & Anciens</option>
                <option value={2}>Niveau 2 : Pasteur Principal uniquement</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Contenu de la note confidentielle <span className="text-primary">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Consignes pastorales, situation de crise, points de vigilance, réconciliation, entretien spirituel..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
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
              Enregistrer la note
            </button>
          </div>
        </form>
      )}

      {/* Liste des notes pastorales */}
      {notes.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/80 rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            Aucune note pastorale enregistrée
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            Utilisez ce journal pour consigner les informations pastorales sensibles nécessitant un suivi particulier en toute discrétion.
          </p>
          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Rédiger une note
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const formattedDate = new Date(note.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={note.id}
                className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm space-y-3 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {note.confidential_level === 2 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
                        <ShieldAlert className="h-3 w-3" />
                        Confidentiel Pasteur Principal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <ShieldCheck className="h-3 w-3" />
                        Équipe Pastorale
                      </span>
                    )}

                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      Par : <strong className="text-foreground">{note.author?.full_name || "Pasteur"}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      disabled={deletingId === note.id}
                      className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition disabled:opacity-50"
                      title="Supprimer la note"
                    >
                      {deletingId === note.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {note.member && (
                  <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Fidèle rattaché : {note.member.first_name} {note.member.last_name}
                  </div>
                )}

                <p className="text-xs text-foreground leading-relaxed whitespace-pre-line bg-muted/20 p-3.5 rounded-xl border border-border/40 font-mono">
                  {note.note}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
