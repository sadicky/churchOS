"use client";

import { useState } from "react";
import Link from "next/link";
import type { PrayerRequest } from "@/types";
import { AnswerPrayerModal } from "@/components/pastoral/answer-prayer-modal";
import {
  updatePrayerStatusAction,
  deletePrayerRequestAction,
} from "@/actions/pastoral.actions";
import {
  HeartHandshake,
  Calendar,
  Sparkles,
  Lock,
  Globe,
  Users,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface PrayersTabProps {
  prayers: PrayerRequest[];
}

export function PrayersTab({ prayers }: PrayersTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPrayerForAnswer, setSelectedPrayerForAnswer] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const [loadingStatusId, setLoadingStatusId] = useState<string | null>(null);

  const filtered = prayers.filter((p) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = p.title.toLowerCase().includes(term);
    const reqMatch = p.requester_name.toLowerCase().includes(term);
    const descMatch = p.description.toLowerCase().includes(term);

    const matchesSearch = !searchTerm || titleMatch || reqMatch || descMatch;
    const matchesStatus = !statusFilter || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleTakeInPrayer = async (prayerId: string) => {
    setLoadingStatusId(prayerId);
    try {
      await updatePrayerStatusAction(prayerId, "IN_PROGRESS");
    } finally {
      setLoadingStatusId(null);
    }
  };

  const handleDelete = async (prayerId: string, title: string) => {
    if (!window.confirm(`Supprimer le sujet de prière "${title}" ?`)) return;
    await deletePrayerRequestAction(prayerId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ANSWERED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-3 w-3" />
            Exaucée
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Clock className="h-3 w-3" />
            En intercession
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            Clôturée
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
            En attente
          </span>
        );
    }
  };

  const getVisibilityBadge = (vis: string) => {
    switch (vis) {
      case "PASTORAL_ONLY":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400" title="Visible uniquement par l'équipe pastorale">
            <Lock className="h-3 w-3" />
            Pastorale seule
          </span>
        );
      case "MEMBERS_ONLY":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground" title="Visible par les fidèles de l'église">
            <Users className="h-3 w-3" />
            Membres
          </span>
        );
      case "PUBLIC":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-primary" title="Visible publiquement">
            <Globe className="h-3 w-3" />
            Publique
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils et filtres */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un sujet d'intercession, un demandeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
          >
            <option value="">Tous les statuts ({prayers.length})</option>
            <option value="PENDING">En attente</option>
            <option value="IN_PROGRESS">En intercession</option>
            <option value="ANSWERED">Exaucées</option>
            <option value="CLOSED">Clôturées</option>
          </select>

          <Link
            href="/dashboard/pastoral/prayers/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Nouveau sujet
          </Link>
        </div>
      </div>

      {/* Mur des Requêtes de Prière */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/80 rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {searchTerm || statusFilter
              ? "Aucune requête ne correspond aux critères"
              : "Aucun sujet de prière enregistré"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            Centralisez les fardeaux de prière de la communauté pour porter les fidèles en intercession et célébrer les exaucements.
          </p>
          <Link
            href="/dashboard/pastoral/prayers/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Déposer une intention
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((prayer) => {
            const formattedDate = new Date(prayer.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={prayer.id}
                className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm space-y-3 hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(prayer.status)}
                    {getVisibilityBadge(prayer.visibility)}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Reçu le {formattedDate}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-foreground">
                    Demandeur : {prayer.requester_name}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-foreground text-base mb-1">
                    {prayer.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {prayer.description}
                  </p>
                </div>

                {/* Témoignage d'exaucement si prière exaucée */}
                {prayer.status === "ANSWERED" && prayer.answer_testimony && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="h-3.5 w-3.5" />
                      Témoignage de grâce (Exaucé le{" "}
                      {prayer.answered_at
                        ? new Date(prayer.answered_at).toLocaleDateString("fr-FR")
                        : "Date non précisée"}
                      )
                    </div>
                    <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed italic">
                      &laquo; {prayer.answer_testimony} &raquo;
                    </p>
                  </div>
                )}

                {/* Barre d'action rapide */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {prayer.status !== "ANSWERED" && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPrayerForAnswer({
                            id: prayer.id,
                            title: prayer.title,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition shadow-sm"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Témoigner / Exaucée
                      </button>
                    )}

                    {prayer.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => handleTakeInPrayer(prayer.id)}
                        disabled={loadingStatusId === prayer.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition"
                      >
                        {loadingStatusId === prayer.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 text-indigo-500" />
                        )}
                        Prendre en intercession
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(prayer.id, prayer.title)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition"
                      title="Supprimer la requête"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal d'enregistrement du témoignage */}
      {selectedPrayerForAnswer && (
        <AnswerPrayerModal
          prayerId={selectedPrayerForAnswer.id}
          prayerTitle={selectedPrayerForAnswer.title}
          isOpen={Boolean(selectedPrayerForAnswer)}
          onClose={() => setSelectedPrayerForAnswer(null)}
        />
      )}
    </div>
  );
}
