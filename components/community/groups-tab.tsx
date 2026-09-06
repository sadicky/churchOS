"use client";

import { useState } from "react";
import Link from "next/link";
import type { GroupDetailed } from "@/types";
import { Users, MapPin, Calendar, Clock, ArrowRight, Plus, Search, ShieldCheck } from "lucide-react";

interface GroupsTabProps {
  groups: GroupDetailed[];
}

export function GroupsTab({ groups }: GroupsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGroups = groups.filter((g) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = g.name.toLowerCase().includes(term);
    const leaderMatch = g.leader
      ? `${g.leader.first_name} ${g.leader.last_name}`.toLowerCase().includes(term)
      : false;
    const locationMatch = g.meeting_location?.toLowerCase().includes(term) || false;
    const dayMatch = g.meeting_day?.toLowerCase().includes(term) || false;
    return nameMatch || leaderMatch || locationMatch || dayMatch;
  });

  return (
    <div className="space-y-6">
      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une cellule, un conducteur, un jour..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
          />
        </div>

        <Link
          href="/dashboard/groups/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition shadow-sm hover:shadow"
        >
          <Plus className="h-4 w-4" />
          Nouvelle cellule
        </Link>
      </div>

      {/* Grille des cellules */}
      {filteredGroups.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/80 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {searchTerm ? "Aucune cellule trouvée" : "Aucune cellule de maison"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            {searchTerm
              ? "Essayez d'ajuster votre recherche avec un autre terme."
              : "Créez votre première cellule de maison pour structurer la vie fraternelle et la croissance spirituelle."}
          </p>
          {!searchTerm && (
            <Link
              href="/dashboard/groups/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Créer une cellule
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => {
            const leaderName = group.leader
              ? `${group.leader.first_name} ${group.leader.last_name}`
              : "Non assigné";

            return (
              <div
                key={group.id}
                className="group relative flex flex-col justify-between p-5 bg-card hover:bg-card/90 border border-border/80 hover:border-primary/40 rounded-2xl shadow-sm transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
                          {group.name}
                        </h3>
                        {group.is_active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </div>
                      {group.campus && (
                        <p className="text-xs font-medium text-muted-foreground">
                          Campus : {group.campus.name}
                        </p>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-primary/10 text-primary shrink-0">
                      <Users className="h-3.5 w-3.5" />
                      {group.members_count || 0}
                    </span>
                  </div>

                  {group.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {group.description}
                    </p>
                  )}

                  <div className="space-y-2 py-2 border-t border-border/50 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        {group.meeting_day ? `Chaque ${group.meeting_day}` : "Jour non défini"}
                        {group.meeting_time ? ` à ${group.meeting_time}` : ""}
                      </span>
                    </div>

                    {group.meeting_location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{group.meeting_location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="font-medium text-foreground truncate">
                        Conducteur : {leaderName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {group.members_count || 0} {group.members_count === 1 ? "fidèle rattaché" : "fidèles rattachés"}
                  </span>
                  <Link
                    href={`/dashboard/groups/${group.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Gérer la cellule
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
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
