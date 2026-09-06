"use client";

import { useState } from "react";
import Link from "next/link";
import type { PastoralVisitDetailed } from "@/types";
import {
  HeartHandshake,
  Calendar,
  Clock,
  Home,
  Building2,
  Phone,
  Activity,
  Plus,
  Search,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface VisitsTabProps {
  visits: PastoralVisitDetailed[];
}

export function VisitsTab({ visits }: VisitsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [followUpFilter, setFollowUpFilter] = useState(false);

  const filtered = visits.filter((v) => {
    const term = searchTerm.toLowerCase();
    const memberName = v.member
      ? `${v.member.first_name} ${v.member.last_name}`.toLowerCase()
      : "";
    const pastorName = v.pastor?.full_name?.toLowerCase() || "";
    const summaryMatch = v.summary.toLowerCase().includes(term);

    const matchesSearch = !searchTerm || memberName.includes(term) || pastorName.includes(term) || summaryMatch;
    const matchesType = !typeFilter || v.visit_type === typeFilter;
    const matchesFollowUp = !followUpFilter || v.follow_up_needed;

    return matchesSearch && matchesType && matchesFollowUp;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "HOME":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Home className="h-3 w-3" />
            Domicile
          </span>
        );
      case "HOSPITAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Activity className="h-3 w-3" />
            Hôpital / Malade
          </span>
        );
      case "OFFICE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Building2 className="h-3 w-3" />
            Bureau pastoral
          </span>
        );
      case "PHONE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Phone className="h-3 w-3" />
            Téléphonique
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils et filtres */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par membre visité, pasteur, compte-rendu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
          >
            <option value="">Tous les types de visite</option>
            <option value="HOME">Domicile</option>
            <option value="HOSPITAL">Hôpital</option>
            <option value="OFFICE">Bureau pastoral</option>
            <option value="PHONE">Téléphonique</option>
          </select>

          <button
            type="button"
            onClick={() => setFollowUpFilter(!followUpFilter)}
            className={`px-3.5 py-2.5 text-xs font-medium rounded-xl border transition flex items-center gap-1.5 ${
              followUpFilter
                ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Relances dues uniquement
          </button>

          <Link
            href="/dashboard/pastoral/visits/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Nouvelle visite
          </Link>
        </div>
      </div>

      {/* Liste des Visites */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/80 rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {searchTerm || typeFilter || followUpFilter
              ? "Aucune visite ne correspond aux filtres"
              : "Aucune visite pastorale enregistrée"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            Consignez les visites aux fidèles (malades, deuils, encouragements, nouveaux baptisés) pour assurer un soin personnalisé.
          </p>
          <Link
            href="/dashboard/pastoral/visits/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Enregistrer une visite
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((visit) => {
            const memberName = visit.member
              ? `${visit.member.first_name} ${visit.member.last_name}`
              : "Fidèle non rattaché";
            const pastorName = visit.pastor?.full_name || "Pasteur";
            const formattedDate = new Date(visit.visit_date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={visit.id}
                className="group relative flex flex-col justify-between p-5 bg-card hover:bg-card/90 border border-border/80 hover:border-primary/40 rounded-2xl shadow-sm transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeBadge(visit.visit_type)}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formattedDate}
                      </span>
                    </div>

                    {visit.follow_up_needed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                        <AlertTriangle className="h-3 w-3" />
                        Relance requise
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Visite clôturée
                      </span>
                    )}
                  </div>

                  <div className="mb-2">
                    <h4 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
                      {memberName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Visite effectuée par {pastorName}
                      {visit.member?.phone ? ` • ${visit.member.phone}` : ""}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                    {visit.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <div className="text-[11px] text-muted-foreground">
                    {visit.follow_up_date && (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        Relance prévue le {new Date(visit.follow_up_date).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/dashboard/pastoral/visits/${visit.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Détail du suivi
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
