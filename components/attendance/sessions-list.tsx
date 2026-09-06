"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { AttendanceSessionListItem } from "@/services/attendance.service";

interface SessionsListProps {
  sessions: AttendanceSessionListItem[];
}

export function SessionsList({ sessions }: SessionsListProps) {
  if (sessions.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground bg-card/40 rounded-xl border border-border/40">
        <CalendarCheck className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-semibold text-foreground">Aucune session d&apos;émargement</p>
        <p className="text-muted-foreground max-w-sm mx-auto mt-1">
          Démarrez le pointage depuis un culte pour initialiser une session.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sessions.map((session) => (
        <Card
          key={session.id}
          className="p-5 border-border/50 bg-card/60 backdrop-blur-sm transition-all hover:shadow-md flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-foreground">
                  {session.title}
                </span>
                {session.services?.name && (
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                    {session.services.name}
                  </p>
                )}
              </div>

              <Badge
                variant="outline"
                className={`text-[10px] py-0.5 px-2 font-medium border ${
                  session.is_open
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-muted text-muted-foreground border-border/40"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                    session.is_open ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                  }`}
                />
                {session.is_open ? "Ouvert" : "Clôturé"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground/70" />
                {new Date(session.session_date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground/70" />
                {session.campuses?.name || "Campus Principal"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Users className="h-4 w-4 text-brand-600" />
              <span>{session.totalAttendees} émargés</span>
            </div>

            <Button size="sm" asChild className="h-8 text-xs gap-1.5 bg-brand-600 hover:bg-brand-700 text-white shadow-xs">
              <Link href={`/dashboard/attendance/sessions/${session.id}`}>
                <span>Pointage</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
