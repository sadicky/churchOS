import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getMembersList, getCampusesList } from "@/services/member.service";
import { MembersTable } from "@/components/members/members-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, UserPlus, HeartHandshake, Sparkles } from "lucide-react";

export const metadata = {
  title: "Répertoire des Membres — ChurchOS",
  description: "Gestion des fidèles, familles, visiteurs et nouveaux convertis.",
};

interface MembersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    campusId?: string;
    gender?: string;
    page?: string;
  }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;

  const [membersData, campuses] = await Promise.all([
    getMembersList(activeOrg.organization.id, {
      search: resolvedParams.search,
      status: resolvedParams.status,
      campusId: resolvedParams.campusId,
      gender: resolvedParams.gender,
      page,
      limit: 12,
    }),
    getCampusesList(activeOrg.organization.id),
  ]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Répertoire des Membres & Fidèles
          </h1>
          <p className="text-xs text-muted-foreground">
            {activeOrg.organization.name} • {membersData.total} personnes enregistrées
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="h-9 gap-1.5 text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
        >
          <Link href="/dashboard/members/new">
            <UserPlus className="h-4 w-4" />
            <span>Nouveau membre</span>
          </Link>
        </Button>
      </div>

      {/* 2. Top Metric Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/50 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Répertoire</span>
            <Users className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {membersData.stats.total}
          </div>
        </Card>

        <Card className="p-4 border-border/50 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Membres Actifs</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {membersData.stats.active}
          </div>
        </Card>

        <Card className="p-4 border-border/50 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Nouveaux Convertis</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {membersData.stats.newConverts}
          </div>
        </Card>

        <Card className="p-4 border-border/50 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Visiteurs & Invités</span>
            <HeartHandshake className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {membersData.stats.visitors}
          </div>
        </Card>
      </div>

      {/* 3. Members Table */}
      <MembersTable
        members={membersData.members}
        campuses={campuses}
        total={membersData.total}
        page={membersData.page}
        totalPages={membersData.totalPages}
      />
    </div>
  );
}
