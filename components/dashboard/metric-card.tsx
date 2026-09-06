import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: number; // percentage e.g. +12 or -5
  changePeriod?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "brand" | "blue" | "emerald" | "amber" | "purple";
  className?: string;
}

const VARIANT_STYLES = {
  brand: {
    iconBg: "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20",
    gradient: "from-brand-500/5 to-transparent",
  },
  blue: {
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    gradient: "from-blue-500/5 to-transparent",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    gradient: "from-emerald-500/5 to-transparent",
  },
  amber: {
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    gradient: "from-amber-500/5 to-transparent",
  },
  purple: {
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    gradient: "from-purple-500/5 to-transparent",
  },
};

export function MetricCard({
  title,
  value,
  description,
  change,
  changePeriod = "vs mois précédent",
  icon: Icon,
  variant = "brand",
  className,
}: MetricCardProps) {
  const styles = VARIANT_STYLES[variant];
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-5 transition-all duration-200 hover:shadow-md border-border/50 bg-gradient-to-br",
        styles.gradient,
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl border shadow-xs",
            styles.iconBg
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="text-2xl font-extrabold tracking-tight text-foreground">
          {value}
        </div>

        {(change !== undefined || description) && (
          <div className="flex items-center gap-1.5 text-xs">
            {change !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                  isPositive &&
                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  isNegative &&
                    "bg-destructive/10 text-destructive",
                  !isPositive && !isNegative && "bg-muted text-muted-foreground"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : isNegative ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                {change > 0 ? `+${change}%` : `${change}%`}
              </span>
            )}

            <span className="text-[11px] text-muted-foreground truncate">
              {description || changePeriod}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
