"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MonthlyFinancialPoint } from "@/services/dashboard.service";

interface FinanceChartProps {
  data: MonthlyFinancialPoint[];
  currency: string;
}

export function FinanceChart({ data, currency }: FinanceChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    1000
  );

  const chartHeight = 180;

  return (
    <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            Évolution Financière
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Comparatif des entrées (Dîmes, Offrandes) et dépenses (6 derniers mois)
          </CardDescription>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-emerald-500 shadow-xs" />
            <span className="text-muted-foreground">Entrées</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-brand-700 dark:bg-brand-500 shadow-xs" />
            <span className="text-muted-foreground">Dépenses</span>
          </div>
        </div>
      </div>

      <div className="pt-6">
        {/* SVG Bars & Grid */}
        <div className="relative h-[220px] w-full flex items-end justify-between gap-2 sm:gap-6 px-2">
          {/* Background horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-border w-full" />
            <div className="border-b border-border w-full" />
            <div className="border-b border-border w-full" />
            <div className="border-b border-border w-full" />
          </div>

          {data.map((point, index) => {
            const incomeHeight = Math.round((point.income / maxVal) * chartHeight);
            const expenseHeight = Math.round((point.expense / maxVal) * chartHeight);
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={point.month}
                className="relative flex-1 flex flex-col items-center group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-14 z-20 flex flex-col items-center rounded-md bg-popover/95 border border-border px-2.5 py-1.5 shadow-xl text-[11px] text-popover-foreground whitespace-nowrap animate-fade-in pointer-events-none">
                    <span className="font-bold">{point.month}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-emerald-500 font-semibold">
                        +{point.income.toLocaleString()} {currency}
                      </span>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-brand-500 font-semibold">
                        -{point.expense.toLocaleString()} {currency}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bars side-by-side */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-[180px]">
                  {/* Income bar */}
                  <div
                    style={{ height: `${incomeHeight}px` }}
                    className={`w-full max-w-[20px] rounded-t-sm transition-all duration-300 ${
                      isHovered
                        ? "bg-emerald-400 shadow-md shadow-emerald-500/20"
                        : "bg-emerald-500/80 hover:bg-emerald-500"
                    }`}
                  />
                  {/* Expense bar */}
                  <div
                    style={{ height: `${expenseHeight}px` }}
                    className={`w-full max-w-[20px] rounded-t-sm transition-all duration-300 ${
                      isHovered
                        ? "bg-brand-600 shadow-md shadow-brand-700/20"
                        : "bg-brand-700/80 hover:bg-brand-700 dark:bg-brand-500/80"
                    }`}
                  />
                </div>

                {/* Month label */}
                <span
                  className={`mt-2 text-[11px] transition-colors ${
                    isHovered
                      ? "font-bold text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {point.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
