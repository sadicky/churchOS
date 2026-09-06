"use client";

import { useState } from "react";
import Link from "next/link";
import type { Sermon } from "@/types";
import {
  Search,
  BookOpen,
  Calendar,
  Video,
  Music,
  FileText,
  Plus,
  ArrowRight,
  Filter,
} from "lucide-react";

interface SermonsGridProps {
  sermons: Sermon[];
  seriesList: string[];
  preachersList: string[];
}

export function SermonsGrid({
  sermons,
  seriesList,
  preachersList,
}: SermonsGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("");
  const [selectedPreacher, setSelectedPreacher] = useState("");

  const filtered = sermons.filter((s) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(term);
    const preacherMatch = s.preacher.toLowerCase().includes(term);
    const scriptMatch = s.scripture_reference?.toLowerCase().includes(term) || false;
    const descMatch = s.description?.toLowerCase().includes(term) || false;

    const matchesSearch = !searchTerm || titleMatch || preacherMatch || scriptMatch || descMatch;
    const matchesSeries = !selectedSeries || s.series_name === selectedSeries;
    const matchesPreacher = !selectedPreacher || s.preacher === selectedPreacher;

    return matchesSearch && matchesSeries && matchesPreacher;
  });

  const hasActiveFilters = Boolean(searchTerm || selectedSeries || selectedPreacher);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedSeries("");
    setSelectedPreacher("");
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils et filtres */}
      <div className="p-4 bg-card border border-border rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par titre, orateur, passage biblique..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filtre Séries */}
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            >
              <option value="">Toutes les séries ({seriesList.length})</option>
              {seriesList.map((ser) => (
                <option key={ser} value={ser}>
                  {ser}
                </option>
              ))}
            </select>

            {/* Filtre Prédicateurs */}
            <select
              value={selectedPreacher}
              onChange={(e) => setSelectedPreacher(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            >
              <option value="">Tous les orateurs ({preachersList.length})</option>
              {preachersList.map((pr) => (
                <option key={pr} value={pr}>
                  {pr}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition"
              >
                Réinitialiser
              </button>
            )}

            <Link
              href="/dashboard/sermons/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouveau message
            </Link>
          </div>
        </div>
      </div>

      {/* Grille des Prédications */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/80 rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {hasActiveFilters ? "Aucune prédication trouvée" : "Aucun message dans la médiathèque"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            {hasActiveFilters
              ? "Aucun résultat ne correspond aux filtres actuels. Essayez de réinitialiser la recherche."
              : "Commencez à archiver vos enseignements du culte pour nourrir la communauté et alimenter les cellules."}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground font-medium text-xs rounded-xl hover:bg-secondary/80 transition"
            >
              Effacer les filtres
            </button>
          ) : (
            <Link
              href="/dashboard/sermons/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Publier un premier message
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((sermon) => {
            const formattedDate = new Date(sermon.sermon_date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={sermon.id}
                className="group relative flex flex-col justify-between p-5 bg-card hover:bg-card/90 border border-border/80 hover:border-primary/40 rounded-2xl shadow-sm transition-all hover:shadow-md"
              >
                <div>
                  {/* Badge série & date */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {sermon.series_name ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 truncate max-w-[190px]">
                        {sermon.series_name}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Message thématique
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                      <Calendar className="h-3 w-3" />
                      {formattedDate}
                    </span>
                  </div>

                  {/* Titre */}
                  <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {sermon.title}
                  </h3>

                  {/* Passage biblique */}
                  {sermon.scripture_reference && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-3">
                      <BookOpen className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{sermon.scripture_reference}</span>
                    </div>
                  )}

                  {/* Prédicateur */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                      {sermon.preacher[0]}
                    </div>
                    <span className="text-xs font-medium text-foreground truncate">
                      {sermon.preacher}
                    </span>
                  </div>

                  {/* Résumé */}
                  {sermon.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {sermon.description}
                    </p>
                  )}
                </div>

                {/* Footer avec médias disponibles & lien */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    {sermon.video_url && (
                      <span title="Vidéo disponible" className="p-1 rounded-md bg-secondary text-primary">
                        <Video className="h-3 w-3" />
                      </span>
                    )}
                    {sermon.audio_url && (
                      <span title="Audio disponible" className="p-1 rounded-md bg-secondary text-emerald-500">
                        <Music className="h-3 w-3" />
                      </span>
                    )}
                    {(sermon.notes_url || sermon.content) && (
                      <span title="Notes de prédication disponibles" className="p-1 rounded-md bg-secondary text-amber-500">
                        <FileText className="h-3 w-3" />
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/dashboard/sermons/${sermon.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Consulter
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
