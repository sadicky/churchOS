"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CampusDetailed, CampusRoomDetailed, CampusRoom } from "@/types";
import { deleteRoomAction } from "@/actions/campus.actions";
import { RoomModal } from "@/components/campuses/room-modal";
import {
  DoorClosed,
  Building2,
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Sparkles,
  Church,
  BookOpen,
  Briefcase,
  Radio,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoomsTabProps {
  rooms: CampusRoomDetailed[];
  campuses: CampusDetailed[];
}

export function RoomsTab({ rooms, campuses }: RoomsTabProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampusId, setSelectedCampusId] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<CampusRoomDetailed | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtrage combiné
  const filteredRooms = rooms.filter((r) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      r.name.toLowerCase().includes(q) ||
      (r.code && r.code.toLowerCase().includes(q)) ||
      (r.floor_location && r.floor_location.toLowerCase().includes(q)) ||
      (r.equipment_notes && r.equipment_notes.toLowerCase().includes(q));

    const matchCampus =
      selectedCampusId === "ALL" || r.campus_id === selectedCampusId;
    const matchType = selectedType === "ALL" || r.room_type === selectedType;

    return matchSearch && matchCampus && matchType;
  });

  const getRoomTypeInfo = (type: string) => {
    switch (type) {
      case "SANCTUARY":
        return {
          label: "Sanctuaire Principal",
          icon: Church,
          badgeColor: "bg-primary/10 text-primary border-primary/20",
        };
      case "HALL":
        return {
          label: "Salle Polyvalente",
          icon: Users,
          badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        };
      case "CLASSROOM":
        return {
          label: "Classe Écodim",
          icon: BookOpen,
          badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        };
      case "OFFICE":
        return {
          label: "Bureau Pastoral",
          icon: Briefcase,
          badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
      case "STUDIO":
        return {
          label: "Studio Média",
          icon: Radio,
          badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        };
      default:
        return {
          label: "Autre Local",
          icon: DoorClosed,
          badgeColor: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (room: CampusRoomDetailed) => {
    setEditingRoom(room);
    setModalOpen(true);
  };

  const handleDelete = async (roomId: string, name: string) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer la salle "${name}" ? Cette action est irréversible.`
      )
    ) {
      return;
    }

    setDeletingId(roomId);
    setErrorMessage(null);
    try {
      const res = await deleteRoomAction(roomId);
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
      {/* Barre d'actions & Filtres */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Recherche et sélecteurs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher une salle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Filtre Campus */}
          <select
            value={selectedCampusId}
            onChange={(e) => setSelectedCampusId(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="ALL">Tous les campus ({rooms.length})</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Filtre Type de salle */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="ALL">Tous les types</option>
            <option value="SANCTUARY">Sanctuaire Principal</option>
            <option value="HALL">Salle Polyvalente</option>
            <option value="CLASSROOM">Classe Écodim</option>
            <option value="OFFICE">Bureau Pastoral</option>
            <option value="STUDIO">Studio Média</option>
            <option value="OTHER">Autre local</option>
          </select>
        </div>

        {/* Bouton d'ajout */}
        <Button
          onClick={handleOpenAdd}
          className="w-full md:w-auto inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter une salle</span>
        </Button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grille des salles */}
      {filteredRooms.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/60 rounded-2xl">
          <DoorClosed className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">
            Aucun local ou salle trouvé
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchTerm || selectedCampusId !== "ALL" || selectedType !== "ALL"
              ? "Aucune salle ne correspond aux critères de filtrage."
              : "Ajoutez un sanctuaire ou une salle pour répertorier vos capacités d'accueil."}
          </p>
          <div className="mt-5">
            <Button
              onClick={handleOpenAdd}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un local
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const typeInfo = getRoomTypeInfo(room.room_type);
            const Icon = typeInfo.icon;

            return (
              <div
                key={room.id}
                className="p-5 rounded-2xl bg-card border border-border/80 hover:border-border transition-all duration-200 hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* En-tête : Nom, Code et Type */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <h4 className="text-base font-bold text-foreground leading-tight">
                          {room.name}
                        </h4>
                      </div>
                      {room.code && (
                        <span className="inline-block text-[11px] font-mono text-muted-foreground">
                          Code : {room.code}
                        </span>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${typeInfo.badgeColor} shrink-0`}
                    >
                      {typeInfo.label}
                    </span>
                  </div>

                  {/* Campus d'appartenance */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium text-foreground truncate">
                      {room.campus?.name || "Campus non rattaché"}
                    </span>
                    {room.campus?.is_main && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                        (Principal)
                      </span>
                    )}
                  </div>

                  {/* Capacité assise avec jauge visuelle */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Capacité assise
                      </span>
                      <span className="font-bold text-foreground">
                        {room.capacity.toLocaleString()} places
                      </span>
                    </div>

                    {/* Barre de jauge stylisée */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
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

                  {/* Localisation & Bâtiment */}
                  {room.floor_location && (
                    <div className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Emplacement :</strong>{" "}
                      {room.floor_location}
                    </div>
                  )}

                  {/* Équipements répertoriés */}
                  {room.equipment_notes && (
                    <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/40">
                      <span className="font-medium text-foreground block mb-0.5">
                        Équipements :
                      </span>
                      <p className="line-clamp-2 text-[11px]">
                        {room.equipment_notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions en pied de carte */}
                <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(room)}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Modifier
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(room.id, room.name)}
                    disabled={deletingId === room.id}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    title="Supprimer la salle"
                  >
                    {deletingId === room.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale d'ajout ou modification */}
      <RoomModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        campuses={campuses.map((c) => ({ id: c.id, name: c.name }))}
        roomToEdit={editingRoom}
      />
    </div>
  );
}
