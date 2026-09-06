import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/services/tenant.service";
import { getCommunicationOverview } from "@/services/communication.service";
import { AnnouncementsTab } from "@/components/communication/announcements-tab";
import { BroadcastsTab } from "@/components/communication/broadcasts-tab";
import { NotificationsTab } from "@/components/communication/notifications-tab";
import {
  Megaphone,
  Radio,
  Send,
  Bell,
  Sparkles,
  Users,
  Smartphone,
  CheckCircle2,
  Plus,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Communication & Annonces | ChurchOS",
  description: "Annonces officielles, campagnes de diffusion SMS & email et notifications de l'église.",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CommunicationPage({ searchParams }: PageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { tab } = await searchParams;
  const currentTab =
    tab === "broadcasts" ? "broadcasts" : tab === "notifications" ? "notifications" : "announcements";

  const { stats, announcements, broadcasts, notifications } =
    await getCommunicationOverview(activeOrg.organization.id, user.id);

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Radio className="h-4 w-4" />
            <span>Voix & Diffusion Communautaire</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Communication & Annonces
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publiez les annonces officielles du pupitre, pilotez les campagnes SMS et informez votre communauté en temps réel.
          </p>
        </div>

        {/* Boutons d'actions rapides */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/communication/broadcasts/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
            <span>Diffuser un SMS</span>
          </Link>

          <Link
            href="/dashboard/communication/announcements/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle annonce</span>
          </Link>
        </div>
      </div>

      {/* Cartes Métriques KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Annonces Actives */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Annonces actives</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Megaphone className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {stats.activeAnnouncements}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.pinnedAnnouncements > 0
              ? `${stats.pinnedAnnouncements} épinglée${stats.pinnedAnnouncements > 1 ? "s" : ""} en tête`
              : "Visibles sur le panneau officiel"}
          </p>
        </div>

        {/* Campagnes ce mois */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Campagnes ce mois</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Smartphone className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {stats.broadcastsThisMonth}
          </div>
          <p className="text-xs text-muted-foreground">
            Diffusions SMS & Email envoyées
          </p>
        </div>

        {/* Portée fidèles */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Portée fidèles</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {stats.totalRecipientsReached}
          </div>
          <p className="text-xs text-muted-foreground">
            Destinataires touchés ce mois-ci
          </p>
        </div>

        {/* Notifications non lues */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:border-border transition-colors">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground">Notifications non lues</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Bell className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {stats.unreadNotifications}
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            {stats.unreadNotifications === 1
              ? "1 message en attente"
              : `${stats.unreadNotifications} messages en attente`}
          </p>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-border">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/communication?tab=announcements"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              currentTab === "announcements"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Megaphone className="h-4 w-4" />
            Annonces Officielles
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-normal">
              {announcements.length}
            </span>
          </Link>

          <Link
            href="/dashboard/communication?tab=broadcasts"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              currentTab === "broadcasts"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Send className="h-4 w-4" />
            Diffusions & SMS
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-normal">
              {broadcasts.length}
            </span>
          </Link>

          <Link
            href="/dashboard/communication?tab=notifications"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              currentTab === "notifications"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell className="h-4 w-4" />
            Centre de Notifications
            {stats.unreadNotifications > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-xs bg-primary text-primary-foreground font-bold">
                {stats.unreadNotifications}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-normal">
                {notifications.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Contenu conditionnel de l'onglet actif */}
      {currentTab === "broadcasts" ? (
        <BroadcastsTab broadcasts={broadcasts} />
      ) : currentTab === "notifications" ? (
        <NotificationsTab notifications={notifications} />
      ) : (
        <AnnouncementsTab announcements={announcements} />
      )}
    </div>
  );
}
