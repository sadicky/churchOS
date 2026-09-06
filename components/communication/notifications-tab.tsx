"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppNotification } from "@/types";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  deleteNotificationAction,
} from "@/actions/communication.actions";
import {
  Bell,
  CheckCircle2,
  CheckCheck,
  AlertTriangle,
  Info,
  Flame,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface NotificationsTabProps {
  notifications: AppNotification[];
}

export function NotificationsTab({ notifications }: NotificationsTabProps) {
  const router = useRouter();

  const [filterUnread, setFilterUnread] = useState(false);
  const [loadingMarkAll, setLoadingMarkAll] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const filtered = filterUnread
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const handleMarkAsRead = async (id: string) => {
    setActingId(id);
    try {
      await markNotificationAsReadAction(id);
      router.refresh();
    } finally {
      setActingId(null);
    }
  };

  const handleMarkAll = async () => {
    setLoadingMarkAll(true);
    try {
      await markAllNotificationsAsReadAction();
      router.refresh();
    } finally {
      setLoadingMarkAll(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActingId(id);
    try {
      await deleteNotificationAction(id);
      router.refresh();
    } finally {
      setActingId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "URGENT":
        return <Flame className="h-4 w-4 text-red-500" />;
      case "WARNING":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "SUCCESS":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "INFO":
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterUnread(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              !filterUnread
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterUnread(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterUnread
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Non lues ({notifications.filter((n) => !n.is_read).length})
          </button>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={loadingMarkAll}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-xl transition disabled:opacity-50"
          >
            {loadingMarkAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Liste des notifications */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/80 rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {filterUnread
              ? "Aucune notification non lue"
              : "Aucune notification enregistrée"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Les rappels de culte, alertes de suivi pastoral et confirmations financières s&apos;afficheront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => {
            const isActing = actingId === notif.id;
            const formattedDate = new Date(notif.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  !notif.is_read
                    ? "bg-card border-primary/30 shadow-sm"
                    : "bg-card/60 border-border/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-secondary shrink-0 mt-0.5">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground">
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-1.5 block">
                      {formattedDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {notif.link && (
                    <a
                      href={notif.link}
                      className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition"
                      title="Ouvrir le lien"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

                  {!notif.is_read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notif.id)}
                      disabled={isActing}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition disabled:opacity-50"
                      title="Marquer comme lu"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(notif.id)}
                    disabled={isActing}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition disabled:opacity-50"
                    title="Supprimer la notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
