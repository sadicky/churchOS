"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createRoomAction, updateRoomAction } from "@/actions/campus.actions";
import type { CampusRoom, CampusRoomDetailed } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DoorClosed,
  Loader2,
  AlertCircle,
  Users,
  X,
} from "lucide-react";

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: Array<{ id: string; name: string }>;
  defaultCampusId?: string;
  roomToEdit?: CampusRoom | CampusRoomDetailed | null;
}

export function RoomModal({
  isOpen,
  onClose,
  campuses,
  defaultCampusId,
  roomToEdit,
}: RoomModalProps) {
  const router = useRouter();
  const isEditing = Boolean(roomToEdit);

  const [campusId, setCampusId] = useState(
    roomToEdit?.campus_id || defaultCampusId || campuses[0]?.id || ""
  );
  const [name, setName] = useState(roomToEdit?.name || "");
  const [code, setCode] = useState(roomToEdit?.code || "");
  const [roomType, setRoomType] = useState<
    "SANCTUARY" | "HALL" | "CLASSROOM" | "OFFICE" | "STUDIO" | "OTHER"
  >(
    (roomToEdit?.room_type as
      | "SANCTUARY"
      | "HALL"
      | "CLASSROOM"
      | "OFFICE"
      | "STUDIO"
      | "OTHER") || "SANCTUARY"
  );
  const [capacity, setCapacity] = useState(
    roomToEdit?.capacity ? String(roomToEdit.capacity) : "100"
  );
  const [floorLocation, setFloorLocation] = useState(
    roomToEdit?.floor_location || ""
  );
  const [equipmentNotes, setEquipmentNotes] = useState(
    roomToEdit?.equipment_notes || ""
  );
  const [isActive, setIsActive] = useState(roomToEdit?.is_active ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomToEdit) {
      setCampusId(roomToEdit.campus_id);
      setName(roomToEdit.name);
      setCode(roomToEdit.code || "");
      setRoomType(
        (roomToEdit.room_type as
          | "SANCTUARY"
          | "HALL"
          | "CLASSROOM"
          | "OFFICE"
          | "STUDIO"
          | "OTHER") || "SANCTUARY"
      );
      setCapacity(String(roomToEdit.capacity || 0));
      setFloorLocation(roomToEdit.floor_location || "");
      setEquipmentNotes(roomToEdit.equipment_notes || "");
      setIsActive(roomToEdit.is_active ?? true);
    } else {
      setCampusId(defaultCampusId || campuses[0]?.id || "");
      setName("");
      setCode("");
      setRoomType("SANCTUARY");
      setCapacity("150");
      setFloorLocation("");
      setEquipmentNotes("");
      setIsActive(true);
    }
    setError(null);
  }, [roomToEdit, defaultCampusId, campuses, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom de la salle est obligatoire.");
      return;
    }
    if (!campusId) {
      setError("Veuillez sélectionner un campus.");
      return;
    }

    setLoading(true);
    setError(null);

    const parsedCapacity = parseInt(capacity, 10) || 0;

    const payload = {
      campus_id: campusId,
      name: name.trim(),
      code: code.trim() ? code.trim() : null,
      room_type: roomType,
      capacity: parsedCapacity,
      floor_location: floorLocation.trim() ? floorLocation.trim() : null,
      equipment_notes: equipmentNotes.trim() ? equipmentNotes.trim() : null,
      is_active: isActive,
    };

    try {
      if (isEditing && roomToEdit) {
        const res = await updateRoomAction(roomToEdit.id, payload);

        if (res?.error) {
          setError(res.error);
          setLoading(false);
          return;
        }
      } else {
        const res = await createRoomAction(payload);

        if (res?.error) {
          setError(res.error);
          setLoading(false);
          return;
        }
      }

      router.refresh();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-card border border-border rounded-2xl shadow-xl space-y-4">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <DoorClosed className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {isEditing ? `Modifier : ${roomToEdit?.name}` : "Ajouter une salle ou local"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Sanctuaire, salle polyvalente, classe d&apos;écodim ou bureau pastoral.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection du Campus */}
          <div className="space-y-1.5">
            <Label htmlFor="room-campus" className="text-xs font-semibold">
              Campus de rattachement <span className="text-destructive">*</span>
            </Label>
            <select
              id="room-campus"
              value={campusId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCampusId(e.target.value)}
              disabled={campuses.length <= 1}
              className="w-full px-3 py-2 text-sm rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nom & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="room-name" className="text-xs font-semibold">
                Nom de la salle / Espace <span className="text-destructive">*</span>
              </Label>
              <Input
                id="room-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Grand Sanctuaire David"
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="room-code" className="text-xs font-semibold">
                Code / Réf
              </Label>
              <Input
                id="room-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: GS-01"
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Type de salle & Capacité */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="room-type" className="text-xs font-semibold">
                Type de local <span className="text-destructive">*</span>
              </Label>
              <select
                id="room-type"
                value={roomType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setRoomType(
                    e.target.value as
                      | "SANCTUARY"
                      | "HALL"
                      | "CLASSROOM"
                      | "OFFICE"
                      | "STUDIO"
                      | "OTHER"
                  )
                }
                className="w-full px-3 py-2 text-sm rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="SANCTUARY">Sanctuaire / Nef Principale</option>
                <option value="HALL">Salle Polyvalente / Fêtes</option>
                <option value="CLASSROOM">Classe Écodim / Enfants</option>
                <option value="OFFICE">Bureau Pastoral / Administratif</option>
                <option value="STUDIO">Studio Média / Enregistrement</option>
                <option value="OTHER">Autre Espace</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="room-capacity" className="text-xs font-semibold">
                Capacité assise (places) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="room-capacity"
                  type="number"
                  min="0"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="Ex: 500"
                  className="pl-9 rounded-xl font-semibold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Localisation / Étage */}
          <div className="space-y-1.5">
            <Label htmlFor="room-floor" className="text-xs font-semibold">
              Bâtiment / Étage / Localisation
            </Label>
            <Input
              id="room-floor"
              value={floorLocation}
              onChange={(e) => setFloorLocation(e.target.value)}
              placeholder="Ex: Bâtiment A, Rez-de-chaussée (Aile Est)"
              className="rounded-xl"
            />
          </div>

          {/* Équipements techniques */}
          <div className="space-y-1.5">
            <Label htmlFor="room-equipment" className="text-xs font-semibold">
              Équipements répertoriés
            </Label>
            <textarea
              id="room-equipment"
              value={equipmentNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEquipmentNotes(e.target.value)}
              placeholder="Ex: Console audio numérique, Vidéoprojecteur 4K, 3 Caméras PTZ, Climatisation centrale..."
              className="w-full px-3 py-2 text-sm rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[70px]"
            />
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : isEditing ? (
                "Mettre à jour le local"
              ) : (
                "Enregistrer le local"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
