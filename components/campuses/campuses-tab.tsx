"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CampusDetailed } from "@/types";
import {
  setMainCampusAction,
  deleteCampusAction,
} from "@/actions/campus.actions";
import {
  Building2,
  Star,
  MapPin,
  Phone,
  Mail,
  User,
  Users,
  DoorClosed,
  CalendarCheck,
  Edit,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CampusesTabProps {
  campuses: CampusDetailed[];
}

export function CampusesTab({ campuses }: CampusesTabProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [settingMainId, setSettingMainId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filtered = campuses.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.pastor_name && c.pastor_name.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q))
    );
  });

  const handleSetMain = async (campusId: string) => {
    setSettingMainId(campusId);
    setErrorMessage(null);
    try {
      const res = await setMainCampusAction(campusId);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        router.refresh();
      }
    } catch {
      setErrorMessage("Une erreur est survenue.");
    } finally {
      setSettingMainId(null);
    }
  };

  const handleDelete = async (campusId: string, name: string) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer le campus "${name}" ? Cette action est irréversible.`
      )
    ) {
      return;
    }

    setDeletingId(campusId);
    setErrorMessage(null);
    try {
      const res = await deleteCampusAction(campusId);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        router.refresh();
      }
    } catch {
      setErrorMessage("Une erreur est survenue lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre d'actions & Recherche */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un campus, ville, pasteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <Link
          href="/dashboard/campuses/new"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter un campus</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grille des Campus */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/60 rounded-2xl">
          <Building2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">
            Aucun campus trouvé
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchTerm
              ? "Aucun résultat ne correspond à votre recherche."
              : "Ajoutez votre premier campus pour structurer vos sites et locaux."}
          </p>
          <div className="mt-5">
            <Link
              href="/dashboard/campuses/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Créer un campus
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((campus) => (
            <div
              key={campus.id}
              className={`p-6 rounded-2xl bg-card border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                campus.is_main
                  ? "border-amber-500/40 bg-gradient-to-br from-amber-500/[0.03] to-transparent shadow-sm"
                  : "border-border/80 hover:border-border"
              }`}
            >
              <div className="space-y-4">
                {/* En-tête de la carte */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                        <Link href={`/dashboard/campuses/${campus.id}`}>
                          {campus.name}
                        </Link>
                      </h3>
                      {campus.code && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-muted text-muted-foreground border border-border">
                          {campus.code}
                        </span>
                      )}
                    </div>

                    {campus.pastor_name && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span>Pasteur : <strong className="text-foreground">{campus.pastor_name}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Badge statut campus */}
                  {campus.is_main ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      Siège Principal
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground shrink-0">
                      <Building2 className="h-3.5 w-3.5" />
                      Campus Annexe
                    </span>
                  )}
                </div>

                {/* Coordonnées & Localisation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span className="truncate">
                      {campus.city || "Ville non précisée"}
                      {campus.country ? `, ${campus.country}` : ""}
                    </span>
                  </div>

                  {campus.phone ? (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                      <span className="truncate">{campus.phone}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground/60 italic">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>Téléphone non renseigné</span>
                    </div>
                  )}
                </div>

                {/* 4 Chiffres Clés du Campus */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
                    <span className="text-[11px] text-muted-foreground block truncate">Fidèles</span>
                    <span className="text-base font-bold text-foreground">
                      {campus.members_count}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
                    <span className="text-[11px] text-muted-foreground block truncate">Salles</span>
                    <span className="text-base font-bold text-foreground">
                      {campus.rooms_count}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
                    <span className="text-[11px] text-muted-foreground block truncate">Capacité</span>
                    <span className="text-base font-bold text-primary">
                      {campus.total_capacity > 0 ? campus.total_capacity : "—"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
                    <span className="text-[11px] text-muted-foreground block truncate">Cultes</span>
                    <span className="text-base font-bold text-foreground">
                      {campus.services_count}
                    </span>
                  </div>
                </div>

                {/* Liste sommaire des salles répertoriées */}
                {campus.rooms && campus.rooms.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Locaux & Salles Principales
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {campus.rooms.slice(0, 3).map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-muted/80 text-foreground border border-border/60"
                        >
                          <DoorClosed className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{r.name}</span>
                          <span className="text-muted-foreground text-[10px]">
                            ({r.capacity} pl.)
                          </span>
                        </span>
                      ))}
                      {campus.rooms.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs text-muted-foreground bg-muted/40">
                          +{campus.rooms.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Barre d'actions */}
              <div className="pt-5 mt-4 border-t border-border/60 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/campuses/${campus.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <span>Fiche complète</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href={`/dashboard/campuses/${campus.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Modifier</span>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  {!campus.is_main && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetMain(campus.id)}
                      disabled={settingMainId === campus.id}
                      className="h-8 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg"
                    >
                      {settingMainId === campus.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Star className="h-3.5 w-3.5 mr-1" />
                          Définir principal
                        </>
                      )}
                    </Button>
                  )}

                  {!campus.is_main && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(campus.id, campus.name)}
                      disabled={deletingId === campus.id}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      title="Supprimer ce campus"
                    >
                      {deletingId === campus.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
