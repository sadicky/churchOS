"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  Search,
  Download,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import type { TransactionListItem } from "@/services/finance.service";

interface TransactionsTableProps {
  transactions: TransactionListItem[];
  currency: string;
  total: number;
  page: number;
  totalPages: number;
}

export function TransactionsTable({
  transactions,
  currency,
  total,
  page,
  totalPages,
}: TransactionsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(searchParams.get("search") || "");
  const [selectedType, setSelectedType] = React.useState(searchParams.get("type") || "ALL");

  const updateFilters = React.useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value && value !== "ALL") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      if (!newParams.page) {
        params.set("page", "1");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm });
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.info("Aucune transaction à exporter.");
      return;
    }

    const headers = ["Date", "Type", "Description", "Compte", "Catégorie", "Montant", "Devise", "Référence"];
    const rows = transactions.map((t) => [
      `"${t.transaction_date}"`,
      `"${t.type}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.accounts?.name || "Compte"}"`,
      `"${t.financial_categories?.name || "Général"}"`,
      `"${t.amount}"`,
      `"${t.currency || currency}"`,
      `"${t.reference || ""}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `churchos_finances_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Journal comptable exporté en CSV.");
  };

  return (
    <div className="space-y-4">
      {/* 1. Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 p-3.5 rounded-xl border border-border/50 backdrop-blur-sm">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par libellé ou référence..."
            className="pl-9 h-9 text-xs bg-muted/30 border-border/40"
          />
        </form>

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              updateFilters({ type: e.target.value });
            }}
            className="h-9 rounded-md border border-border/50 bg-background px-2.5 text-xs text-foreground focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">Toutes les opérations</option>
            <option value="INCOME">Entrées / Dons & Dîmes</option>
            <option value="EXPENSE">Dépenses & Décaissements</option>
            <option value="TRANSFER">Virements internes</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 text-xs gap-1.5 border-border/60 hover:bg-accent"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
        </div>
      </div>

      {/* 2. Table */}
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Libellé & Référence</th>
                <th className="py-3 px-4">Compte</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-xs">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    Aucune écriture enregistrée dans cette période.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.type === "INCOME";
                  const isTransfer = tx.type === "TRANSFER";

                  return (
                    <tr key={tx.id} className="hover:bg-accent/40 transition-colors group">
                      {/* Date */}
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Calendar className="h-3 w-3 text-muted-foreground/60" />
                          <span>
                            {new Date(tx.transaction_date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Description & Ref */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-md shrink-0 ${
                              isIncome
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : isTransfer
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : isTransfer ? (
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <p className="font-semibold text-foreground">
                              {tx.description}
                            </p>
                            {tx.reference && (
                              <span className="text-[10px] font-mono text-muted-foreground block">
                                Réf: {tx.reference}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Account */}
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        <span className="font-medium text-foreground">
                          {tx.accounts?.name || "Compte Général"}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal border-border/60 text-muted-foreground"
                        >
                          {tx.financial_categories?.name || (isTransfer ? "Virement" : "Opération")}
                        </Badge>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-black text-xs ${
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isTransfer
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-foreground"
                          }`}
                        >
                          {isIncome ? "+" : isTransfer ? "⇄ " : "-"}
                          {Number(tx.amount).toLocaleString()} {tx.currency || currency}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 text-xs text-muted-foreground bg-muted/10">
            <div>
              Affichage de {transactions.length} sur {total} écritures
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateFilters({ page: (page - 1).toString() })}
                className="h-8 px-2 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Précédent
              </Button>
              <span className="text-xs px-2 font-medium">
                Page {page} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => updateFilters({ page: (page + 1).toString() })}
                className="h-8 px-2 text-xs"
              >
                Suivant
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
