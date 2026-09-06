import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getAccountsList, getCategoriesList } from "@/services/finance.service";
import { ExpenseForm } from "@/components/finances/expense-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowDownRight } from "lucide-react";

export const metadata = {
  title: "Saisir une Dépense — ChurchOS",
  description: "Décaissement comptable et justification des sorties de caisse.",
};

export default async function NewExpensePage() {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const [accounts, categories] = await Promise.all([
    getAccountsList(activeOrg.organization.id),
    getCategoriesList(activeOrg.organization.id, "EXPENSE"),
  ]);

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/40">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href="/dashboard/finances">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <ArrowDownRight className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            Saisir une Dépense / Décaissement
          </h1>
          <p className="text-xs text-muted-foreground">
            {activeOrg.organization.name} • Sortie de fonds avec imputation budgétaire
          </p>
        </div>
      </div>

      {/* Expense Form */}
      <ExpenseForm
        accounts={accounts}
        categories={categories}
        defaultCurrency={activeOrg.organization.currency}
      />
    </div>
  );
}
