"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { switchActiveOrganizationAction } from "@/actions/tenant.actions";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Church, Loader2, Plus } from "lucide-react";
import type { UserOrganizationMembership } from "@/services/tenant.service";

interface TenantSwitcherProps {
  currentOrg: UserOrganizationMembership;
  organizations: UserOrganizationMembership[];
}

export function TenantSwitcher({
  currentOrg,
  organizations,
}: TenantSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [pendingOrgId, setPendingOrgId] = React.useState<string | null>(null);

  const handleSelectOrg = (orgId: string) => {
    if (orgId === currentOrg.organization.id) return;

    setPendingOrgId(orgId);
    startTransition(async () => {
      try {
        const res = await switchActiveOrganizationAction(orgId);
        if (!res.success) {
          toast.error(res.error || "Impossible de changer d'église.");
        } else {
          toast.success("Église active mise à jour.");
          router.refresh();
        }
      } catch {
        toast.error("Erreur de connexion.");
      } finally {
        setPendingOrgId(null);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-full max-w-[240px] justify-between border-border/50 bg-background/50 hover:bg-accent/60 backdrop-blur-sm px-3 shadow-none text-left"
          disabled={isPending}
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-tr from-brand-600 to-brand-800 text-white shadow-xs">
              <Church className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col truncate leading-tight">
              <span className="truncate text-xs font-semibold text-foreground">
                {currentOrg.organization.name}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {currentOrg.organization.city || "Campus Principal"}
              </span>
            </div>
          </div>
          {isPending ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[260px] p-1.5 shadow-lg">
        <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Vos Églises & Assemblées
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />

        <div className="space-y-1">
          {organizations.map((orgItem) => {
            const isActive = orgItem.organization.id === currentOrg.organization.id;
            const isSwitchingToThis = pendingOrgId === orgItem.organization.id;

            return (
              <DropdownMenuItem
                key={orgItem.organization.id}
                onClick={() => handleSelectOrg(orgItem.organization.id)}
                className="flex items-center justify-between py-2 px-2.5 cursor-pointer rounded-md focus:bg-accent"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                      isActive
                        ? "bg-brand-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {orgItem.organization.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col truncate leading-tight">
                    <span className="truncate text-xs font-medium text-foreground">
                      {orgItem.organization.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {orgItem.membership.role === "CHURCH_OWNER"
                        ? "Fondateur / Admin"
                        : orgItem.membership.role}
                    </span>
                  </div>
                </div>

                <div className="ml-2 flex shrink-0 items-center">
                  {isSwitchingToThis ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-600" />
                  ) : isActive ? (
                    <Check className="h-4 w-4 text-brand-600" />
                  ) : null}
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuItem
          onClick={() => router.push("/onboarding")}
          className="flex items-center gap-2 py-2 px-2.5 text-xs text-brand-700 dark:text-brand-400 font-medium cursor-pointer rounded-md focus:bg-accent"
        >
          <Plus className="h-4 w-4" />
          <span>Créer ou rejoindre une église</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
