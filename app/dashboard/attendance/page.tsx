import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  getServicesList,
  getAttendanceSessions,
  getAttendanceMetrics,
} from "@/services/attendance.service";
import { ServicesTable } from "@/components/attendance/services-table";
import { SessionsList } from "@/components/attendance/sessions-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CalendarCheck,
  Calendar,
  Users,
  Plus,
  Play,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Cultes & Présences — ChurchOS",
  description: "Planification des cultes, sessions d'émargement et pointage en direct.",
};

interface AttendancePageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab || "services";

  const [services, sessions, metrics] = await Promise.all([
    getServicesList(activeOrg.organization.id),
    getAttendanceSessions(activeOrg.organization.id),
    getAttendanceMetrics(activeOrg.organization.id),
  ]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            Cultes & Présences
          </h1>
          <p className="text-xs text-muted-foreground">
            {activeOrg.organization.name} • Planification liturgique et émargement des fidèles
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="h-9 gap-1.5 text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
        >
          <Link href="/dashboard/attendance/services/new">
            <Plus className="h-4 w-4" />
            <span>Planifier un culte</span>
          </Link>
        </Button>
      </div>

      {/* 2. Top Metric KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/50 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Cultes</span>
            <Calendar className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {metrics.totalServicesCount}
          </div>
        </Card>

        <Card className="p-4 border-border/50 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Dernier Culte</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {metrics.lastSessionAttendees} participants
          </div>
        </Card>

        <Card className="p-4 border-border/50 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Moyenne / Culte</span>
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            ~{metrics.averageAttendees} fidèles
          </div>
        </Card>

        <Card className="p-4 border-border/50 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Sessions Enregistrées</span>
            <CalendarCheck className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
            {metrics.totalSessions} sessions
          </div>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <Button
          variant={currentTab === "services" ? "default" : "ghost"}
          size="sm"
          asChild
          className="h-8 text-xs font-semibold"
        >
          <Link href="/dashboard/attendance?tab=services">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Programme des Cultes ({services.length})
          </Link>
        </Button>

        <Button
          variant={currentTab === "sessions" ? "default" : "ghost"}
          size="sm"
          asChild
          className="h-8 text-xs font-semibold"
        >
          <Link href="/dashboard/attendance?tab=sessions">
            <Play className="h-3 w-3 mr-1.5 fill-current" />
            Sessions de Pointage ({sessions.length})
          </Link>
        </Button>
      </div>

      {/* 4. Tab Content */}
      {currentTab === "services" ? (
        <ServicesTable services={services} />
      ) : (
        <SessionsList sessions={sessions} />
      )}
    </div>
  );
}
