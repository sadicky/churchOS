"use client";

import { useState } from "react";
import Link from "next/link";
import type { MinistryDetailed } from "@/types";
import { HeartHandshake, ArrowRight, Plus, Search, ShieldCheck } from "lucide-react";

interface MinistriesTabProps {
  ministries: MinistryDetailed[];
}

export function MinistriesTab({ ministries }: MinistriesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = ministries.filter((m) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = m.name.toLowerCase().includes(term);
    const leaderMatch = m.leader
      ? `${m.leader.first_name} ${m.leader.last_name}`.toLowerCase().includes(term)
      : false;
    const descMatch = m.description?.toLowerCase().includes(term) || false;
    return nameMatch || leaderMatch || descMatch;
  });

  return (
    <div className="space-y-6">
      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un département, un responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
          />
        </div>

        <Link
          href="/dashboard/groups/ministries/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition shadow-sm hover:shadow"
        >
          <Plus className="h-4 w-4" />
          Nouveau département
        </Link>
      </div>

      {/* Grille des départements */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/80 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {searchTerm ? "Aucun département trouvé" : "Aucun département ou ministère"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            {searchTerm
              ? "Essayez avec d'autres termes de recherche."
              : "Créez vos départements d'église (Louange, Protocole, Multimédia, Intercession) pour mobiliser les serviteurs."}
          </p>
          {!searchTerm && (
            <Link
              href="/dashboard/groups/ministries/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Créer un département
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ministry) => {
            const leaderName = ministry.leader
              ? `${ministry.leader.first_name} ${ministry.leader.last_name}`
              : "Non assigné";

            return (
              <div
                key={ministry.id}
                className="group relative flex flex-col justify-between p-5 bg-card hover:bg-card/90 border border-border/80 hover:border-primary/40 rounded-2xl shadow-sm transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors truncate">
                          {ministry.name}
                        </h3>
                        {ministry.is_active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground shrink-0">
                            Inactif
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <HeartHandshake className="h-3.5 w-3.5" />
                      {ministry.volunteers_count || 0}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed min-h-[36px]">
                    {ministry.description || "Aucune description renseignée pour ce département de service."}
                  </p>

                  <div className="space-y-2 py-2 border-t border-border/50 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground truncate">
                        Responsable : {leaderName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {ministry.volunteers_count || 0} {ministry.volunteers_count === 1 ? "bénévole actif" : "bénévoles actifs"}
                  </span>
                  <Link
                    href={`/dashboard/groups/ministries/${ministry.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Voir l&apos;équipe
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
