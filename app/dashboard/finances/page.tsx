import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  getFinancialOverview,
  getTransactionsList,
} from "@/services/finance.service";
import { AccountsSummary } from "@/components/finances/accounts-summary";
import { TransactionsTable } from "@/components/finances/transactions-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  Plus,
  ArrowRightLeft,
  FileSpreadsheet,
} from "lucide-react";

export const metadata = {
  title: "Finances & Trésorerie — ChurchOS",
  description: "Gestion financière, comptabilité des dîmes, offrandes et dépenses.",
};

interface FinancesPageProps {
  searchParams: Promise<{
    type?: string;
    accountId?: string;
    categoryId?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function FinancesPage({ searchParams }: FinancesPageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;

  const [overview, txResponse] = await Promise.all([
    getFinancialOverview(activeOrg.organization.id),
    getTransactionsList(activeOrg.organization.id, {
      type: resolvedParams.type,
      accountId: resolvedParams.accountId,
      categoryId: resolvedParams.categoryId,
      search: resolvedParams.search,
      page,
      limit: 15,
    }),
  ]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Finances & Trésorerie
          </h1>
          <p className="text-xs text-muted-foreground">
            {activeOrg.organization.name} • Journal comptable, suivi des dîmes et caisses
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            asChild
            className="h-9 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Link href="/dashboard/finances/donations/new">
              <Plus className="h-4 w-4" />
              <span>Enregistrer un don / dîme</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 gap-1.5 text-xs border-border/60 hover:bg-accent"
          >
            <Link href="/dashboard/finances/expenses/new">
              <ArrowDownRight className="h-4 w-4 text-brand-600" />
              <span>Saisir une dépense</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Top Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/50 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Entrées (Ce mois)</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            +{overview.monthlyIncome.toLocaleString()} {overview.currency}
          </div>
        </Card>

        <Card className="p-4 border-border/50 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Sorties (Ce mois)</span>
            <ArrowDownRight className="h-4 w-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-foreground mt-2">
            -{overview.monthlyExpense.toLocaleString()} {overview.currency}
          </div>
        </Card>

        <Card className="p-4 border-border/50 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Résultat Net</span>
            <span
              className={`h-2 w-2 rounded-full ${
                overview.monthlyNet >= 0 ? "bg-emerald-500" : "bg-destructive"
              }`}
            />
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              overview.monthlyNet >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive"
            }`}
          >
            {overview.monthlyNet >= 0 ? "+" : ""}
            {overview.monthlyNet.toLocaleString()} {overview.currency}
          </div>
        </Card>

        <Card className="p-4 border-border/50 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Trésorerie Globale</span>
            <Landmark className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-foreground mt-2">
            {overview.totalBalance.toLocaleString()} {overview.currency}
          </div>
        </Card>
      </div>

      {/* 3. Accounts Summary with Transfer Modal */}
      <AccountsSummary
        accounts={overview.accounts}
        currency={overview.currency}
      />

      {/* 4. Transactions Ledger Table */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Grand Livre des Écritures Comptables
        </h3>
        <TransactionsTable
          transactions={txResponse.transactions}
          currency={overview.currency}
          total={txResponse.total}
          page={txResponse.page}
          totalPages={txResponse.totalPages}
        />
      </div>
    </div>
  );
}
