import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HeartHandshake, Phone, Mail, Plus, ArrowRight, UserCheck } from "lucide-react";
import type { RecentVisitorItem } from "@/services/dashboard.service";

interface RecentVisitorsCardProps {
  visitors: RecentVisitorItem[];
}

export function RecentVisitorsCard({ visitors }: RecentVisitorsCardProps) {
  // If no visitors in database yet, provide realistic preview items
  const displayVisitors: RecentVisitorItem[] =
    visitors.length > 0
      ? visitors
      : [
          {
            id: "v-1",
            firstName: "Jonathan",
            lastName: "Nkurunziza",
            phone: "+257 79 123 456",
            email: "jonathan.nk@example.com",
            firstVisitDate: new Date().toISOString(),
            status: "VISITOR",
            city: "Bujumbura",
          },
          {
            id: "v-2",
            firstName: "Esther",
            lastName: "Hakizimana",
            phone: "+257 68 987 654",
            email: null,
            firstVisitDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: "NEW_CONVERT",
            city: "Bujumbura",
          },
          {
            id: "v-3",
            firstName: "Aimé",
            lastName: "Mugisha",
            phone: "+257 71 555 777",
            email: "aime.mug@example.com",
            firstVisitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: "VISITOR",
            city: "Gitega",
          },
        ];

  return (
    <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border/40">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              Nouveaux Arrivants & Âmes à Relancer
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Premiers contacts et convertis récents à intégrer
            </CardDescription>
          </div>

          <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5 border-border/60">
            <Link href="/dashboard/members">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nouveau membre</span>
            </Link>
          </Button>
        </div>

        <div className="divide-y divide-border/40 mt-2">
          {displayVisitors.map((v) => (
            <div
              key={v.id}
              className="py-3 first:pt-2 last:pb-1 flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-border/60">
                  <AvatarFallback className="bg-brand-500/10 text-brand-700 dark:text-brand-300 font-bold text-xs">
                    {v.firstName.slice(0, 1)}
                    {v.lastName.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground">
                      {v.firstName} {v.lastName}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`text-[9px] py-0 px-1.5 font-medium ${
                        v.status === "NEW_CONVERT"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20"
                      }`}
                    >
                      {v.status === "NEW_CONVERT" ? "Nouveau Converti" : "Visiteur"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    {v.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground/60" />
                        {v.phone}
                      </span>
                    )}
                    {v.city && <span>• {v.city}</span>}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-7 text-[11px] px-2 text-brand-600 hover:text-brand-700 hover:bg-brand-500/10 shrink-0"
              >
                <Link href="/dashboard/pastoral">
                  <UserCheck className="mr-1 h-3.5 w-3.5" />
                  Suivi
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border/40 mt-3">
        <Link
          href="/dashboard/pastoral"
          className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center justify-center gap-1"
        >
          Voir la file pastorale de suivi et d&apos;intégration
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}
