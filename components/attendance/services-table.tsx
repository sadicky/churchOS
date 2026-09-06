"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteServiceAction, createAttendanceSessionAction } from "@/actions/attendance.actions";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  MoreHorizontal,
  Trash2,
  Play,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import type { ServiceListItem } from "@/services/attendance.service";

interface ServicesTableProps {
  services: ServiceListItem[];
}

export function ServicesTable({ services }: ServicesTableProps) {
  const router = useRouter();

  const handleStartSession = async (service: ServiceListItem) => {
    try {
      const res = await createAttendanceSessionAction({
        title: `Émargement — ${service.name}`,
        service_id: service.id,
        session_date: service.service_date,
        campus_id: service.campus_id || undefined,
      });

      if (res.success && res.id) {
        toast.success("Session d'émargement ouverte !");
        router.push(`/dashboard/attendance/sessions/${res.id}`);
      } else {
        toast.error(res.error || "Impossible d'ouvrir la session.");
      }
    } catch {
      toast.error("Erreur de communication.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Confirmez-vous la suppression du culte "${name}" ?`)) {
      return;
    }

    try {
      const res = await deleteServiceAction(id);
      if (res.success) {
        toast.success("Culte supprimé.");
        router.refresh();
      } else {
        toast.error(res.error || "Erreur de suppression.");
      }
    } catch {
      toast.error("Erreur de communication.");
    }
  };

  if (services.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground bg-card/40 rounded-xl border border-border/40">
        <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-semibold text-foreground">Aucun culte planifié</p>
        <p className="text-muted-foreground max-w-sm mx-auto mt-1">
          Planifiez vos cultes de célébration et réunions de prière pour démarrer le pointage.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/40 bg-muted/20 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              <th className="py-3 px-4">Culte & Programme</th>
              <th className="py-3 px-4">Horaires</th>
              <th className="py-3 px-4">Prédicateur & Thème</th>
              <th className="py-3 px-4">Campus</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-xs">
            {services.map((srv) => (
              <tr key={srv.id} className="hover:bg-accent/40 transition-colors group">
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground group-hover:text-brand-600 transition-colors">
                      {srv.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3 text-muted-foreground/70" />
                      <span>
                        {new Date(srv.service_date).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-muted-foreground">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Clock className="h-3 w-3 text-muted-foreground/70" />
                    <span>
                      {srv.start_time.slice(0, 5)} {srv.end_time ? `- ${srv.end_time.slice(0, 5)}` : ""}
                    </span>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    {srv.theme ? (
                      <p className="font-medium text-foreground flex items-center gap-1.5">
                        <BookOpen className="h-3 w-3 text-brand-600" />
                        <span>{srv.theme}</span>
                      </p>
                    ) : null}
                    {srv.preacher_name ? (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <User className="h-2.5 w-2.5" />
                        <span>Par {srv.preacher_name}</span>
                      </p>
                    ) : (
                      <span className="text-muted-foreground/60 text-[11px]">—</span>
                    )}
                  </div>
                </td>

                <td className="py-3.5 px-4 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span>{srv.campuses?.name || "Campus Principal"}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStartSession(srv)}
                      className="h-7 text-xs bg-brand-600 hover:bg-brand-700 text-white gap-1 shadow-xs"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Pointer</span>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 p-1">
                        <DropdownMenuItem
                          onClick={() => handleDelete(srv.id, srv.name)}
                          className="text-xs text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Supprimer</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
