"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CampusDetailed, CampusRoom } from "@/types";
import { RoomModal } from "@/components/campuses/room-modal";
import { deleteRoomAction, setMainCampusAction } from "@/actions/campus.actions";
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
  Network,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Church,
  BookOpen,
  Briefcase,
  Radio,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CampusDetailViewProps {
  campus: CampusDetailed;
  rooms: CampusRoom[];
  services: Array<{ id: string; name: string; service_time: string | null }>;
  groups: Array<{ id: string; name: string; leader_name?: string | null }>;
}

export function CampusDetailView({
  campus,
  rooms,
  services,
  groups,
}: CampusDetailViewProps) {
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<CampusRoom | null>(null);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [settingMain, setSettingMain] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getRoomTypeBadge = (type: string) => {
    switch (type) {
      case "SANCTUARY":
        return { label: "Sanctuaire", icon: Church, color: "bg-primary/10 text-primary border-primary/20" };
      case "HALL":
        return { label: "Salle Polyvalente", icon: Users, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" };
      case "CLASSROOM":
        return { label: "Classe Écodim", icon: BookOpen, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
      case "OFFICE":
        return { label: "Bureau", icon: Briefcase, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
      case "STUDIO":
        return { label: "Studio", icon: Radio, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" };
      default:
        return { label: "Local", icon: DoorClosed, color: "bg-muted text-muted-foreground border-border" };
    }
  };

  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setModalOpen(true);
  };

  const handleOpenEditRoom = (room: CampusRoom) => {
    setEditingRoom(room);
    setModalOpen(true);
  };

  const handleDeleteRoom = async (roomId: string, name: string) => {
    if (!confirm(`Supprimer la salle "${name}" ?`)) return;

    setDeletingRoomId(roomId);
    setErrorMessage(null);
    try {
      const res = await deleteRoomAction(roomId);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        router.refresh();
      }
    } catch {
      setErrorMessage("Erreur lors de la suppression.");
    } finally {
      setDeletingRoomId(null);
    }
  };

  const handleSetMain = async () => {
    setSettingMain(true);
    setErrorMessage(null);
    try {
      const res = await setMainCampusAction(campus.id);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        router.refresh();
      }
    } catch {
      setErrorMessage("Erreur lors de la modification.");
    } finally {
      setSettingMain(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/campuses"
            className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
              <Building2 className="h-4 w-4" />
              <span>Fiche Technique du Site</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {campus.name}
              </h1>
              {campus.code && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-muted text-muted-foreground border border-border">
                  {campus.code}
                </span>
              )}
              {campus.is_main ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  Siège Principal
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  Campus Annexe
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center gap-2 flex-wrap">
          {!campus.is_main && (
            <Button
              variant="outline"
              onClick={handleSetMain}
              disabled={settingMain}
              className="rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border-amber-500/30 font-semibold text-xs"
            >
              {settingMain ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Star className="h-3.5 w-3.5 mr-1" />
              )}
              Définir comme Siège Principal
            </Button>
          )}

          <Link
            href={`/dashboard/campuses/${campus.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-card border border-border hover:bg-muted text-foreground transition-colors"
          >
            <Edit className="h-3.5 w-3.5" />
            <span>Modifier</span>
          </Link>

          <Button
            onClick={handleOpenAddRoom}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter une salle</span>
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 4 KPIs du Campus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fidèles rattachés */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Fidèles rattachés</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{campus.members_count}</div>
          <p className="text-xs text-muted-foreground">Membres fréquentant ce site</p>
        </div>

        {/* Salles répertoriées */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Salles & Locaux</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <DoorClosed className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{campus.rooms_count}</div>
          <p className="text-xs text-muted-foreground">Espaces opérationnels</p>
        </div>

        {/* Capacité assise */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Capacité totale assise</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {campus.total_capacity.toLocaleString()} places
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Cumul des sanctuaires et salles
          </p>
        </div>

        {/* Cultes programmés */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Cultes & Rassemblements</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{campus.services_count}</div>
          <p className="text-xs text-muted-foreground">Services réguliers</p>
        </div>
      </div>

      {/* Grille principale en 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Gauche : Identité, Cultes & Groupes */}
        <div className="space-y-6 lg:col-span-1">
          {/* Carte Coordonnées */}
          <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Coordonnées & Responsable
            </h3>

            <div className="space-y-3 text-xs">
              {campus.pastor_name && (
                <div className="flex items-start gap-2.5">
                  <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Pasteur référent :</span>
                    <strong className="text-foreground text-sm">{campus.pastor_name}</strong>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground block text-[11px]">Adresse géographique :</span>
                  <span className="text-foreground font-medium">
                    {campus.address || "Non renseignée"}
                  </span>
                  <div className="text-muted-foreground">
                    {campus.city || "Ville non précisée"}
                    {campus.country ? `, ${campus.country}` : ""}
                  </div>
                </div>
              </div>

              {campus.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Téléphone :</span>
                    <span className="text-foreground font-medium">{campus.phone}</span>
                  </div>
                </div>
              )}

              {campus.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Email :</span>
                    <span className="text-foreground font-medium">{campus.email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cultes rattachés */}
          <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-primary" />
                Cultes sur ce site
              </h3>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                {services.length}
              </span>
            </div>

            {services.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Aucun culte planifié directement sur ce campus.
              </p>
            ) : (
              <div className="space-y-2">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-foreground">
                      {s.name}
                    </span>
                    {s.service_time && (
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {s.service_time}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cellules de maison rattachées */}
          <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" />
                Cellules & Groupes
              </h3>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                {groups.length}
              </span>
            </div>

            {groups.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Aucun groupe rattaché à ce campus.
              </p>
            ) : (
              <div className="space-y-2">
                {groups.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-foreground">
                      {g.name}
                    </span>
                    {g.leader_name && (
                      <span className="text-[11px] text-muted-foreground">
                        Resp: {g.leader_name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne Droite : Salles & Locaux du Campus */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <DoorClosed className="h-5 w-5 text-primary" />
                  Locaux, Sanctuaires & Salles de ce site
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Répertoire technique et capacités d&apos;accueil du {campus.name}
                </p>
              </div>

              <Button
                onClick={handleOpenAddRoom}
                size="sm"
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Ajouter une salle
              </Button>
            </div>

            {rooms.length === 0 ? (
              <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border">
                <DoorClosed className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  Aucune salle ou sanctuaire n&apos;est encore répertorié pour ce campus.
                </p>
                <Button
                  onClick={handleOpenAddRoom}
                  variant="outline"
                  size="sm"
                  className="mt-3 rounded-xl text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Ajouter le sanctuaire principal
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((room) => {
                  const badge = getRoomTypeBadge(room.room_type);
                  const Icon = badge.icon;

                  return (
                    <div
                      key={room.id}
                      className="p-4 rounded-xl bg-muted/30 border border-border/70 hover:border-border transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                              <Icon className="h-4 w-4 text-primary" />
                              <span>{room.name}</span>
                            </div>
                            {room.code && (
                              <span className="text-[10px] font-mono text-muted-foreground block">
                                Réf : {room.code}
                              </span>
                            )}
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color} shrink-0`}
                          >
                            {badge.label}
                          </span>
                        </div>

                        {/* Capacité assise */}
                        <div className="p-2.5 rounded-lg bg-card border border-border/60">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Capacité</span>
                            <span className="font-bold text-foreground">
                              {room.capacity.toLocaleString()} places
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                room.capacity >= 1000
                                  ? "bg-primary w-full"
                                  : room.capacity >= 500
                                  ? "bg-indigo-500 w-3/4"
                                  : room.capacity >= 100
                                  ? "bg-emerald-500 w-1/2"
                                  : "bg-amber-500 w-1/4"
                              }`}
                            />
                          </div>
                        </div>

                        {room.floor_location && (
                          <p className="text-[11px] text-muted-foreground">
                            <strong>Emplacement :</strong> {room.floor_location}
                          </p>
                        )}

                        {room.equipment_notes && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 bg-card/60 p-2 rounded border border-border/40">
                            {room.equipment_notes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-border/40 flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditRoom(room)}
                          className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRoom(room.id, room.name)}
                          disabled={deletingRoomId === room.id}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          {deletingRoomId === room.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'ajout ou modification de salle */}
      <RoomModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        campuses={[{ id: campus.id, name: campus.name }]}
        defaultCampusId={campus.id}
        roomToEdit={editingRoom}
      />
    </div>
  );
}
