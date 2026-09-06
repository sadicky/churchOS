import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getDashboardData } from "@/services/dashboard.service";
import { MetricCard } from "@/components/dashboard/metric-card";
import { FinanceChart } from "@/components/dashboard/finance-chart";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { UpcomingServicesCard } from "@/components/dashboard/upcoming-services-card";
import { RecentTransactionsCard } from "@/components/dashboard/recent-transactions-card";
import { RecentVisitorsCard } from "@/components/dashboard/recent-visitors-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CalendarCheck,
  Wallet,
  Landmark,
  Plus,
  ArrowUpRight,
  Sparkles,
  Church,
} from "lucide-react";

export const metadata = {
  title: "Vue Générale — ChurchOS",
  description: "Statistiques opérationnelles, cultes, finances et suivi pastoral.",
};

export default async function DashboardPage() {
  const activeOrg = await getActiveOrganization();

  if (!activeOrg) {
    redirect("/onboarding");
  }

  const orgId = activeOrg.organization.id;
  const data = await getDashboardData(orgId);

  const todayFormatted = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Capitalize first letter of date
  const dateString =
    todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header & Quick Welcome */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Tableau de Bord
            </h1>
            <Badge variant="outline" className="text-xs font-normal border-brand-500/30 text-brand-600 dark:text-brand-400">
              {activeOrg.organization.name}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {dateString} • Suivi en temps réel de votre assemblée
          </p>
        </div>

        {/* Action Shortcuts Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            asChild
            className="h-9 gap-1.5 text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
          >
            <Link href="/dashboard/finances">
              <Plus className="h-3.5 w-3.5" />
              <span>Enregistrer un don</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 gap-1.5 text-xs border-border/60 hover:bg-accent"
          >
            <Link href="/dashboard/attendance">
              <CalendarCheck className="h-3.5 w-3.5 text-brand-600" />
              <span>Pointer présences</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 gap-1.5 text-xs border-border/60 hover:bg-accent"
          >
            <Link href="/dashboard/members">
              <Users className="h-3.5 w-3.5 text-brand-600" />
              <span>Nouveau membre</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Fidèles Actifs"
          value={data.kpis.totalMembers.toLocaleString()}
          change={data.kpis.membersGrowthRate}
          changePeriod="vs mois dernier"
          icon={Users}
          variant="brand"
        />

        <MetricCard
          title="Dernier Culte"
          value={`${data.kpis.lastAttendance.toLocaleString()} fidèles`}
          change={data.kpis.attendanceGrowthRate}
          changePeriod="vs moyenne précédente"
          icon={CalendarCheck}
          variant="blue"
        />

        <MetricCard
          title="Dîmes & Dons (Ce mois)"
          value={`${data.kpis.monthlyIncome.toLocaleString()} ${data.currency}`}
          change={data.kpis.incomeGrowthRate}
          changePeriod="vs mois dernier"
          icon={Wallet}
          variant="emerald"
        />

        <MetricCard
          title="Trésorerie Disponible"
          value={`${data.kpis.totalCashBalance.toLocaleString()} ${data.currency}`}
          description={`${data.kpis.activeGroupsCount} cellules • ${data.kpis.activeMinistriesCount} ministères`}
          icon={Landmark}
          variant="purple"
        />
      </div>

      {/* 3. Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <FinanceChart
            data={data.financialHistory}
            currency={data.currency}
          />
        </div>

        <div className="lg:col-span-5">
          <AttendanceChart data={data.attendanceHistory} />
        </div>
      </div>

      {/* 4. Operational Activity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <UpcomingServicesCard services={data.upcomingServices} />
        <RecentTransactionsCard
          transactions={data.recentTransactions}
          currency={data.currency}
        />
        <RecentVisitorsCard visitors={data.recentVisitors} />
      </div>
    </div>
  );
}
