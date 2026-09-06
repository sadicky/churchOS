import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Clock, MapPin, Plus, ArrowRight } from "lucide-react";
import type { UpcomingServiceItem } from "@/services/dashboard.service";

interface UpcomingServicesCardProps {
  services: UpcomingServiceItem[];
}

export function UpcomingServicesCard({ services }: UpcomingServicesCardProps) {
  return (
    <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border/40">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              Prochains Cultes & Réunions
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Programme hebdomadaire des célébrations et rassemblements
            </CardDescription>
          </div>

          <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5 border-border/60">
            <Link href="/dashboard/attendance">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Planifier</span>
            </Link>
          </Button>
        </div>

        <div className="divide-y divide-border/40 mt-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="py-3.5 first:pt-2 last:pb-1 flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                {/* Day Badge */}
                <div className="flex flex-col items-center justify-center h-11 w-11 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-700 dark:text-brand-300 shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    {service.dayOfWeek.slice(0, 3)}
                  </span>
                  <span className="text-xs font-extrabold">
                    {service.startTime.slice(0, 2)}h
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground group-hover:text-brand-600 transition-colors">
                    {service.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground/70" />
                      {service.startTime} - {service.endTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground/70" />
                      {service.campusName}
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-[11px] text-muted-foreground/80 line-clamp-1">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-7 text-[11px] px-2 text-brand-600 hover:text-brand-700 hover:bg-brand-500/10 shrink-0"
              >
                <Link href="/dashboard/attendance">
                  Pointer
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border/40 mt-3">
        <Link
          href="/dashboard/attendance"
          className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center justify-center gap-1"
        >
          Voir le calendrier complet des cultes
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}
