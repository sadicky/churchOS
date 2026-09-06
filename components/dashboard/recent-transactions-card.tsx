import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, ArrowRight } from "lucide-react";
import type { RecentTransactionItem } from "@/services/dashboard.service";

interface RecentTransactionsCardProps {
  transactions: RecentTransactionItem[];
  currency: string;
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Espèces",
  BANK_TRANSFER: "Virement",
  MOBILE_MONEY: "Mobile Money",
  CHECK: "Chèque",
  CARD: "Carte bancaire",
  ONLINE: "En ligne",
};

export function RecentTransactionsCard({
  transactions,
  currency,
}: RecentTransactionsCardProps) {
  return (
    <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border/40">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Dernières Opérations Financières
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Historique récent des dîmes, offrandes et sorties
            </CardDescription>
          </div>

          <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5 border-border/60">
            <Link href="/dashboard/finances">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Enregistrer</span>
            </Link>
          </Button>
        </div>

        <div className="divide-y divide-border/40 mt-2">
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Aucune transaction récente enregistrée.
            </div>
          ) : (
            transactions.slice(0, 5).map((tx) => {
              const isIncome = tx.type === "INCOME";

              return (
                <div
                  key={tx.id}
                  className="py-3 first:pt-2 last:pb-1 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${
                        isIncome
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground">
                          {tx.categoryName}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[9px] py-0 px-1 font-normal text-muted-foreground"
                        >
                          {PAYMENT_LABELS[tx.paymentMethod] || tx.paymentMethod}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {tx.donorName ? `Par ${tx.donorName}` : tx.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-xs font-bold ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {tx.amount.toLocaleString()} {currency}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(tx.transactionDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-border/40 mt-3">
        <Link
          href="/dashboard/finances"
          className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center justify-center gap-1"
        >
          Accéder au journal de trésorerie complet
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}
