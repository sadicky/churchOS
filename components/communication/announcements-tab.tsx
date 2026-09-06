"use client";

import { useState } from "react";
import Link from "next/link";
import type { AnnouncementDetailed } from "@/types";
import { deleteAnnouncementAction } from "@/actions/communication.actions";
import {
  Bell,
  Pin,
  Calendar,
  Clock,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface AnnouncementsTabProps {
  announcements: AnnouncementDetailed[];
}

export function AnnouncementsTab({ announcements }: AnnouncementsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const filtered = announcements.filter((a) => {
    const term = searchTerm.toLowerCase();
    return a.title.toLowerCase().includes(term) || a.content.toLowerCase().includes(term);
  });

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Voulez-vous supprimer l'annonce "${title}" ?`)) return;
    setDeletingId(id);
    try {
      await deleteAnnouncementAction(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une annonce paroissiale..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
          />
        </div>

        <Link
          href="/dashboard/communication/announcements/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nouvelle annonce
        </Link>
      </div>

      {/* Liste des annonces */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/80 rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {searchTerm ? "Aucune annonce trouvée" : "Aucune annonce officielle publiée"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            Publiez les nouvelles de l&apos;assemblée, les rassemblements à venir et les informations prioritaires pour toute l&apos;église.
          </p>
          <Link
            href="/dashboard/communication/announcements/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Créer une annonce
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ann) => {
            const isExpired = ann.expires_at && ann.expires_at < todayStr;
            const formattedDate = new Date(ann.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={ann.id}
                className={`p-5 rounded-2xl border transition-all ${
                  ann.is_pinned
                    ? "bg-amber-500/5 border-amber-500/30 shadow-sm hover:border-amber-500/50"
                    : "bg-card border-border/80 hover:border-primary/40 shadow-sm"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ann.is_pinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                        <Pin className="h-3 w-3" />
                        Épinglée en tête
                      </span>
                    )}

                    {isExpired ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        Expirée le {new Date(ann.expires_at!).toLocaleDateString("fr-FR")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    )}

                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Publiée le {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/communication/announcements/${ann.id}/edit`}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition"
                      title="Modifier l'annonce"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(ann.id, ann.title)}
                      disabled={deletingId === ann.id}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition disabled:opacity-50"
                      title="Supprimer l'annonce"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-bold text-foreground mb-2">
                  {ann.title}
                </h4>

                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>

                {ann.author && (
                  <div className="mt-3 pt-2 border-t border-border/30 text-[11px] text-muted-foreground">
                    Auteur : <strong className="text-foreground">{ann.author.full_name || "Direction"}</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
