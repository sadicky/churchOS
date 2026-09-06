"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Network,
  BookOpen,
  Wallet,
  HeartHandshake,
  Send,
  Building2,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Church,
} from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "PRINCIPAL",
    items: [
      {
        title: "Vue d'ensemble",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "COMMUNAUTÉ & CULTES",
    items: [
      {
        title: "Membres & Fidèles",
        href: "/dashboard/members",
        icon: Users,
      },
      {
        title: "Cultes & Présences",
        href: "/dashboard/attendance",
        icon: CalendarCheck,
      },
      {
        title: "Cellules & Groupes",
        href: "/dashboard/groups",
        icon: Network,
      },
      {
        title: "Prédications & Médias",
        href: "/dashboard/sermons",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "INTENDANCE & PASTORALE",
    items: [
      {
        title: "Finances & Dîmes",
        href: "/dashboard/finances",
        icon: Wallet,
      },
      {
        title: "Soins Pastoraux",
        href: "/dashboard/pastoral",
        icon: HeartHandshake,
      },
      {
        title: "Communication & SMS",
        href: "/dashboard/communication",
        icon: Send,
      },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      {
        title: "Campus & Locaux",
        href: "/dashboard/campuses",
        icon: Building2,
      },
      {
        title: "Paramètres de l'Église",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

interface DashboardSidebarProps {
  userEmail?: string;
  userName?: string;
  userRole?: string;
  orgName?: string;
  className?: string;
}

export function DashboardSidebar({
  userEmail,
  userName = "Pasteur",
  userRole = "ADMIN",
  orgName,
  className,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col h-full w-64 border-r border-border/50 bg-card/60 backdrop-blur-xl transition-all duration-300",
        className
      )}
    >
      {/* Brand & Church Title */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-border/40">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 via-brand-800 to-brand-900 text-white shadow-md shadow-brand-900/20">
          <Church className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-foreground">ChurchOS</span>
            <span className="rounded bg-brand-500/10 px-1 py-0.2 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
              SaaS
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
            {orgName || "Portail Pastoral"}
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              {section.title}
            </h4>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-brand-600/10 text-brand-700 dark:text-brand-300 dark:bg-brand-500/15 font-semibold"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive
                            ? "text-brand-600 dark:text-brand-400"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span>{item.title}</span>
                    </div>

                    {item.badge ? (
                      <span className="rounded-full bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-600">
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="h-3 w-3 text-brand-600 dark:text-brand-400" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom User Profile & Logout */}
      <div className="p-3 border-t border-border/40 bg-muted/20">
        <div className="flex items-center justify-between p-2 rounded-lg bg-card/80 border border-border/40 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="h-8 w-8 border border-border/50">
              <AvatarFallback className="bg-brand-700 text-white text-xs font-bold">
                {userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">
                {userName}
              </span>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5 text-brand-600 shrink-0" />
                <span className="text-[10px] text-muted-foreground truncate">
                  {userRole}
                </span>
              </div>
            </div>
          </div>

          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Se déconnecter"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
