"use client";

import Link from "next/link";
import type { CommunicationBroadcastDetailed } from "@/types";
import {
  Send,
  MessageSquare,
  Mail,
  Bell,
  Users,
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  Smartphone,
} from "lucide-react";

interface BroadcastsTabProps {
  broadcasts: CommunicationBroadcastDetailed[];
}

export function BroadcastsTab({ broadcasts }: BroadcastsTabProps) {
  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case "SMS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Smartphone className="h-3 w-3" />
            SMS Groupé
          </span>
        );
      case "EMAIL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Mail className="h-3 w-3" />
            Emailing
          </span>
        );
      case "NOTIFICATION":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Bell className="h-3 w-3" />
            Notification interne
          </span>
        );
    }
  };

  const getAudienceLabel = (aud: string) => {
    switch (aud) {
      case "LEADERS":
        return "Conducteurs de cellules";
      case "VOLUNTEERS":
        return "Bénévoles de départements";
      case "VISITORS":
        return "Nouveaux visiteurs récents";
      case "ALL":
      default:
        return "Tous les membres actifs";
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Historique des Campagnes de Diffusion
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Suivi des envois SMS, emails et alertes d&apos;église avec effectifs touchés.
          </p>
        </div>

        <Link
          href="/dashboard/communication/broadcasts/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nouvelle diffusion
        </Link>
      </div>

      {/* Liste des diffusions */}
      {broadcasts.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/80 rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Send className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            Aucune campagne de diffusion envoyée
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            Diffusez un SMS d&apos;encouragement, une alerte météo/annulation ou une convocation de réunion aux responsables.
          </p>
          <Link
            href="/dashboard/communication/broadcasts/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Lancer une première campagne
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {broadcasts.map((b) => {
            const formattedDate = new Date(b.sent_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={b.id}
                className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-primary/30 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getChannelBadge(b.channel)}
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                      <Users className="h-3 w-3" />
                      Audience : {getAudienceLabel(b.target_audience)}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Envoyé le {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{b.recipients_count} fidèles touchés</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-foreground text-sm mb-1">{b.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/20 p-3.5 rounded-xl border border-border/40">
                    {b.message}
                  </p>
                </div>

                {b.sender && (
                  <div className="text-[11px] text-muted-foreground pt-1">
                    Expéditeur : <strong className="text-foreground">{b.sender.full_name || "Direction pastorale"}</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
